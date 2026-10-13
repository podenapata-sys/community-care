// End-to-end test: website + dashboard against the Firebase emulators.
// Needs: emulators on 8080 (firestore) / 9099 (auth), the site served at SITE,
// PLAYWRIGHT = path to the playwright package, SDK_BUNDLE = a local ESM bundle of
// firebase@10.14.1 (app+firestore+auth), served in place of www.gstatic.com.
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs");

const SITE = process.env.SITE || "http://127.0.0.1:5050";
const PROJECT = "demo-cc";
const SDK = fs.readFileSync(process.env.SDK_BUNDLE, "utf8");
const TEST_CONFIG = `window.APP_CONFIG = { firebase: { apiKey: "fake-key", authDomain: "${PROJECT}.firebaseapp.com",
  projectId: "${PROJECT}", appId: "test", emulator: { firestore: 8080, auth: 9099 } } };`;
const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);

let failed = 0;
const ok = (cond, msg) => { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) failed++; };

async function signUp(email, password) {
  const r = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
  return (await r.json()).localId;
}
async function makeStaff(uid) {
  await fetch(`http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents/staff/${uid}`, {
    method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer owner" },
    body: JSON.stringify({ fields: { name: { stringValue: "Reception" } } }) });
}

async function page(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route("https://www.gstatic.com/firebasejs/**", r => r.fulfill({ contentType: "text/javascript", body: `export * from "${SITE}/__sdk/all.js";` }));
  await ctx.route(`${SITE}/__sdk/all.js`, r => r.fulfill({ contentType: "text/javascript", body: SDK }));
  await ctx.route("**/assets/config.js", r => r.fulfill({ contentType: "text/javascript", body: TEST_CONFIG }));
  await ctx.route("https://fonts.googleapis.com/**", r => r.abort());
  const p = await ctx.newPage();
  p.errors = [];
  p.on("pageerror", e => p.errors.push(e.message));
  return p;
}

async function bookOnline(p, name, phone, docIndex = 0) {
  await p.goto(SITE + "/index.html"); await p.waitForTimeout(400);
  await p.fill("#f-name", name); await p.fill("#f-phone", phone); await p.fill("#f-date", tomorrow);
  await p.selectOption("#f-service", "doc:" + docIndex);
  await p.click("#bookingForm button[type=submit]");
  await p.waitForFunction(() => getComputedStyle(document.getElementById("successMsg")).display === "block", null, { timeout: 15000 });
  return p.textContent("#successMsg");
}

(async () => {
  const staffUid = await signUp("reception@cc.test", "secret123");
  await makeStaff(staffUid);
  await signUp("stranger@cc.test", "secret123");

  const browser = await chromium.launch();
  const site = await page(browser);
  const dash = await page(browser);

  // 1. Website booking gets serial 1
  const m1 = await bookOnline(site, "রহিম উদ্দিন", "01711000001");
  ok(/সিরিয়াল নম্বর: 1/.test(m1), "website booking shows serial 1 — " + m1.slice(0, 70));

  // 2. Non-staff account is refused
  await dash.goto(SITE + "/dashboard/index.html"); await dash.waitForTimeout(800);
  await dash.fill("#lEmail", "stranger@cc.test"); await dash.fill("#lPass", "secret123");
  await dash.click("#loginForm button[type=submit]"); await dash.waitForTimeout(1500);
  ok(/অনুমতি নেই/.test(await dash.textContent("#loginErr")), "non-staff login refused");

  // 3. Staff login sees the booking
  await dash.fill("#lEmail", "reception@cc.test"); await dash.fill("#lPass", "secret123");
  await dash.click("#loginForm button[type=submit]");
  await dash.waitForSelector("#appView:not(.hidden)", { timeout: 15000 });
  await dash.click("#nextDay");
  await dash.waitForSelector("#list .row", { timeout: 15000 });
  ok(await dash.locator("#list .row").count() === 1, "dashboard shows the website booking");
  ok((await dash.textContent("#list .row .who b")) === "রহিম উদ্দিন", "patient name correct");

  // 4. Second website booking arrives live
  const m2 = await bookOnline(site, "করিম মিয়া", "01711000002");
  ok(/সিরিয়াল নম্বর: 2/.test(m2), "second booking same doctor gets serial 2");
  await dash.waitForSelector(".toast", { timeout: 15000 }).catch(() => {});
  ok(/নতুন সিরিয়াল/.test(await dash.locator(".toast").last().textContent().catch(() => "")), "realtime toast appeared");
  ok(await dash.locator("#list .row").count() === 2, "new booking added to list live");

  // 5. Status change persists
  const firstId = await dash.locator("#list .row").first().getAttribute("data-id");
  await dash.locator(`#list .row[data-id="${firstId}"] button[data-act=confirmed]`).click();
  await dash.waitForTimeout(1500);

  // 6. Manual entry gets the next serial
  await dash.click("#addBtn");
  await dash.fill("#aName", "হাঁটা রোগী"); await dash.fill("#aPhone", "01711000003");
  await dash.fill("#aDate", tomorrow);
  const docName = await dash.evaluate(() => window.CLINIC.doctors[0].name);
  await dash.selectOption("#aDoctor", docName);
  await dash.click("#addForm button[type=submit]"); await dash.waitForTimeout(2000);
  ok(/সিরিয়াল ৩/.test(await dash.locator(".toast").last().textContent()), "manual entry gets serial 3");

  // 7. Reload: session persists, status + manual row persisted
  await dash.reload(); await dash.waitForSelector("#appView:not(.hidden)", { timeout: 15000 });
  await dash.click("#nextDay"); await dash.waitForSelector("#list .row", { timeout: 15000 });
  ok(await dash.locator("#list .row").count() === 3, "3 bookings after reload");
  ok(/কনফার্ম/.test(await dash.textContent(`#list .row[data-id="${firstId}"] .status`)), "status change persisted");

  // 8. Reports tab loads from Firestore
  await dash.click(".tab[data-tab=reports]"); await dash.waitForTimeout(1500);
  ok(/৩/.test(await dash.textContent("#tiles")), "reports tiles render");

  // 9. Anti-spam: 4th booking for one phone on one day is refused
  await bookOnline(site, "স্প্যাম", "01799000009", 1); await bookOnline(site, "স্প্যাম", "01799000009", 2);
  await bookOnline(site, "স্প্যাম", "01799000009", 3);
  const m4 = await bookOnline(site, "স্প্যাম", "01799000009", 4);
  ok(/৩টি সিরিয়াল/.test(m4), "4th booking from same phone refused");

  ok(!site.errors.length && !dash.errors.length, "no page errors " + JSON.stringify([...site.errors, ...dash.errors]));
  await browser.close();
  console.log(failed ? `\n${failed} FAILED` : "\nALL PASSED");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
