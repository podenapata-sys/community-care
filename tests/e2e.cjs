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
// "Tomorrow" in Dhaka time, the same clock the site and dashboard use (UTC can still be a day behind).
const dhakaToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());
const tomorrow = new Date(Date.parse(dhakaToday + "T00:00:00Z") + 864e5).toISOString().slice(0, 10);

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

async function makeDoctor(uid, doctor) {
  await fetch(`http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents/doctors/${uid}`, {
    method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer owner" },
    body: JSON.stringify({ fields: { doctor: { stringValue: doctor } } }) });
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
  ok(/সিরিয়াল নম্বর:\s*(1|১)/.test(m1), "website booking shows serial 1 — " + m1.slice(0, 70));

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
  ok(/সিরিয়াল নম্বর:\s*(2|২)/.test(m2), "second booking same doctor gets serial 2");
  await dash.waitForSelector(".toast", { timeout: 15000 }).catch(() => {});
  ok(/নতুন সিরিয়াল/.test(await dash.locator(".toast").last().textContent().catch(() => "")), "realtime toast appeared");
  ok(await dash.locator("#list .row").count() === 2, "new booking added to list live");

  // 5. Status change persists
  const firstId = await dash.locator("#list .row").first().getAttribute("data-id");
  await dash.locator(`#list .row[data-id="${firstId}"] button[data-act=confirmed]`).click();
  await dash.waitForTimeout(1500);

  // 6. Manual entry for a returning patient: typing the phone auto-fills the name, fee follows the doctor
  await dash.click("#addBtn");
  const docName = await dash.evaluate(() => window.CLINIC.doctors[0].name);
  await dash.selectOption("#aDoctor", docName);
  await dash.fill("#aDate", tomorrow);
  await dash.fill("#aPhone", "01711000001");
  await dash.waitForSelector("#prevBox:not(.hidden)", { timeout: 10000 });
  ok(/পুরনো রোগী/.test(await dash.textContent("#prevBox")), "returning-patient panel appears");
  ok((await dash.inputValue("#aName")) === "রহিম উদ্দিন", "name auto-filled from earlier booking");
  const docFee = await dash.evaluate(n => window.CLINIC.doctors.find(d => d.name === n).fee, docName);
  ok((await dash.inputValue("#aFee")) === docFee, "visit fee prefilled from doctor (" + docFee + ")");
  await dash.check("#aPaid");
  await dash.click("#addForm button[type=submit]"); await dash.waitForTimeout(2000);
  ok(/সিরিয়াল ৩/.test(await dash.locator(".toast").last().textContent()), "manual entry gets serial 3");

  // 7. Walk-in without a phone number
  await dash.click("#addBtn");
  await dash.fill("#aName", "হাঁটা রোগী"); await dash.fill("#aDate", tomorrow);
  await dash.selectOption("#aDoctor", docName);
  await dash.click("#addForm button[type=submit]"); await dash.waitForTimeout(2000);
  ok(/সিরিয়াল ৪/.test(await dash.locator(".toast").last().textContent()), "walk-in without phone gets serial 4");

  // 8. Record payment on the first online booking
  dash.once("dialog", d => d.accept("800"));
  await dash.locator(`#list .row[data-id="${firstId}"] button[data-act=pay]`).click();
  await dash.waitForTimeout(1500);

  // 9. Reload: session persists, status, payment and walk-in all persisted
  await dash.reload(); await dash.waitForSelector("#appView:not(.hidden)", { timeout: 15000 });
  await dash.click("#nextDay"); await dash.waitForSelector("#list .row", { timeout: 15000 });
  ok(await dash.locator("#list .row").count() === 4, "4 bookings after reload");
  ok(/কনফার্ম/.test(await dash.textContent(`#list .row[data-id="${firstId}"] .status`)), "status change persisted");
  ok(/৳৮০০ · আদায় ✓/.test(await dash.textContent(`#list .row[data-id="${firstId}"] .who`)), "payment persisted");
  const walkRow = dash.locator("#list .row", { hasText: "হাঁটা রোগী" });
  ok(/ফোন নেই/.test(await walkRow.textContent()) && await walkRow.locator("[data-act=wa], a[href^=tel]").count() === 0, "walk-in shows 'ফোন নেই', no call/WhatsApp");

  // 10. Recycle bin: delete → appears in bin with who deleted it → restore
  dash.once("dialog", d => d.accept());
  await walkRow.locator("[data-act=del]").click(); await dash.waitForTimeout(1500);
  ok(await dash.locator("#list .row").count() === 3, "deleted serial leaves the list");
  await dash.click(".tab[data-tab=bin]");
  await dash.waitForSelector("#binList .row", { timeout: 10000 });
  const binText = await dash.textContent("#binList");
  ok(/হাঁটা রোগী/.test(binText) && /reception@cc\.test/.test(binText) && /আর ৩০ দিন/.test(binText), "bin shows the serial, who deleted it, 30 days left");
  await dash.reload(); await dash.waitForSelector("#appView:not(.hidden)", { timeout: 15000 });
  await dash.click("#nextDay"); await dash.waitForSelector("#list .row", { timeout: 15000 });
  ok(await dash.locator("#list .row").count() === 3, "deletion persisted after reload");
  await dash.click(".tab[data-tab=bin]"); await dash.waitForSelector("#binList .row", { timeout: 10000 });
  await dash.click("#binList [data-act=restore]"); await dash.waitForTimeout(1500);
  ok(/বিন খালি/.test(await dash.textContent("#binList")), "restore empties the bin");
  await dash.click(".tab[data-tab=serials]"); await dash.waitForTimeout(1500);
  ok(await dash.locator("#list .row").count() === 4, "restored serial back in the list");

  // 11. Reports tab loads from Firestore, fee tile counts both payments
  await dash.click(".tab[data-tab=reports]"); await dash.waitForTimeout(1500);
  ok(/৪/.test(await dash.textContent("#tiles")), "reports tiles render");

  // 12. Doctor login: only own patients, only "★ এসেছেন"
  await makeDoctor(await signUp("doctor@cc.test", "secret123"), docName);
  await makeDoctor(await signUp("doctor2@cc.test", "secret123"), "Dr. Nobody Here");
  const drPage = await page(browser);
  await drPage.goto(SITE + "/dashboard/index.html"); await drPage.waitForTimeout(800);
  await drPage.fill("#lEmail", "doctor@cc.test"); await drPage.fill("#lPass", "secret123");
  await drPage.click("#loginForm button[type=submit]");
  await drPage.waitForSelector("#appView:not(.hidden)", { timeout: 15000 });
  await drPage.click("#nextDay"); await drPage.waitForSelector("#list .row", { timeout: 15000 });
  ok(await drPage.locator("#list .row").count() === 4, "doctor sees their 4 patients");
  ok(await drPage.locator("#addBtn").isHidden() && await drPage.locator(".tab[data-tab=bin]").isHidden(), "doctor has no add button or bin");
  const otherActs = await drPage.locator("#list [data-act]:not([data-act=arrived])").count();
  ok(otherActs === 0 && await drPage.locator("#list [data-act=arrived]").count() > 0, "doctor rows show only ★ এসেছেন (" + otherActs + " other buttons)");
  const docBn = await drPage.evaluate(n => (window.CLINIC.doctors.find(d => d.name === n) || {}).nbn || n, docName);
  ok((await drPage.textContent("#roleBadge")).includes(docBn), "doctor name badge shown (Bangla)");
  const drRow = drPage.locator("#list .row", { has: drPage.locator("[data-act=arrived]") }).first();
  const drRowId = await drRow.getAttribute("data-id");
  await drRow.locator("[data-act=arrived]").click(); await drPage.waitForTimeout(1500);
  await drPage.reload(); await drPage.waitForSelector("#appView:not(.hidden)", { timeout: 15000 });
  await drPage.click("#nextDay"); await drPage.waitForSelector("#list .row", { timeout: 15000 });
  ok(/এসেছেন/.test(await drPage.textContent(`#list .row[data-id="${drRowId}"] .status`)), "doctor's ★ এসেছেন persisted");
  await drPage.click("#logoutBtn"); await drPage.waitForSelector("#loginView:not(.hidden)", { timeout: 15000 });
  await drPage.fill("#lEmail", "doctor2@cc.test"); await drPage.fill("#lPass", "secret123");
  await drPage.click("#loginForm button[type=submit]");
  await drPage.waitForSelector("#appView:not(.hidden)", { timeout: 15000 });
  await drPage.click("#nextDay"); await drPage.waitForTimeout(2000);
  ok(await drPage.locator("#list .row").count() === 0, "another doctor sees none of these patients");
  ok(!drPage.errors.length, "doctor view: no page errors " + JSON.stringify(drPage.errors));

  // 13. Anti-spam: 4th booking for one phone on one day is refused
  await bookOnline(site, "স্প্যাম", "01799000009", 1); await bookOnline(site, "স্প্যাম", "01799000009", 2);
  await bookOnline(site, "স্প্যাম", "01799000009", 3);
  const m4 = await bookOnline(site, "স্প্যাম", "01799000009", 4);
  ok(/৩টি সিরিয়াল/.test(m4), "4th booking from same phone refused");

  ok(!site.errors.length && !dash.errors.length, "no page errors " + JSON.stringify([...site.errors, ...dash.errors]));
  await browser.close();
  console.log(failed ? `\n${failed} FAILED` : "\nALL PASSED");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
