// Runs apps-script/DailyReport.gs in Node against the Firebase emulators
// (auth 9099, firestore 8080), with small stand-ins for the Apps Script services.
//   npx firebase emulators:exec --only firestore,auth --project demo-cc "node report.test.cjs"
const fs = require("fs"), vm = require("vm"), path = require("path");
const { execFileSync } = require("child_process");

const PROJECT = "demo-cc", AUTH = "http://127.0.0.1:9099", FS = "http://127.0.0.1:8080";
let failed = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) failed++; };

// Synchronous HTTP like UrlFetchApp (curl, no proxy for localhost).
function http(url, opts = {}) {
  const args = ["-s", "--noproxy", "*", "-X", (opts.method || "get").toUpperCase(), "-w", "\n%{http_code}", url];
  if (opts.contentType) args.push("-H", "Content-Type: " + opts.contentType);
  for (const [k, v] of Object.entries(opts.headers || {})) args.push("-H", `${k}: ${v}`);
  if (opts.payload) args.push("--data-binary", opts.payload);
  const out = execFileSync("curl", args, { encoding: "utf8" });
  const i = out.lastIndexOf("\n");
  return { body: out.slice(0, i), code: +out.slice(i + 1) };
}
const json = (url, payload, headers) => JSON.parse(http(url, { method: "post", contentType: "application/json", payload: JSON.stringify(payload), headers }).body);

function loadScript(props, sent) {
  const ctx = {
    console, Date, JSON, Math, String, Object, Error,
    Logger: { log: () => {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null }) },
    UrlFetchApp: { fetch: (url, o) => { const r = http(url, o); return { getResponseCode: () => r.code, getContentText: () => r.body }; } },
    MailApp: { sendEmail: m => sent.push(m) },
    Utilities: { formatDate: (d, tz) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d) },
    ScriptApp: {}
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../apps-script/DailyReport.gs"), "utf8"), ctx);
  return ctx;
}

const dhaka = off => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date(Date.now() + off * 864e5));
function seedBooking(id, date, doctor, status, source, fee, paid) {
  const extra = {};
  if (fee != null) extra.fee = { integerValue: String(fee) };
  if (paid != null) extra.paid = { booleanValue: paid };
  const r = http(`${FS}/v1/projects/${PROJECT}/databases/(default)/documents/bookings/${id}`, {
    method: "patch", contentType: "application/json", headers: { Authorization: "Bearer owner" },
    payload: JSON.stringify({ fields: {
      bookingDate: { stringValue: date }, doctor: { stringValue: doctor }, status: { stringValue: status },
      source: { stringValue: source }, patientName: { stringValue: "Test" }, phone: { stringValue: "01711111111" }, serialNo: { integerValue: "1" }, ...extra } })
  });
  if (r.code !== 200) throw new Error("seed failed " + r.body);
}

// ---- seed: reporter account, a stranger account, bookings ----
const bot = json(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, { email: "report@cc.test", password: "secret123", returnSecureToken: true });
json(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, { email: "nobody@cc.test", password: "secret123", returnSecureToken: true });
http(`${FS}/v1/projects/${PROJECT}/databases/(default)/documents/reporters/${bot.localId}`, {
  method: "patch", contentType: "application/json", headers: { Authorization: "Bearer owner" },
  payload: JSON.stringify({ fields: { name: { stringValue: "Daily report" } } })
});
const y = dhaka(-1), t = dhaka(0), t3 = dhaka(3), t10 = dhaka(10);
seedBooking("y1", y, "Dr. A", "arrived", "online", 800, true);
seedBooking("y2", y, "Dr. A", "arrived", "manual", 500, true);
seedBooking("y3", y, "Dr. B", "new", "online");
seedBooking("y4", y, "Dr. B", "cancelled", "online", 800, true);   // cancelled: not counted as revenue
seedBooking("y5", y, "Dr. A", "confirmed", "online", 800, false);
seedBooking("old", dhaka(-2), "Dr. A", "arrived", "online");
seedBooking("t1", t, "Dr. A", "new", "online");
seedBooking("t2", t, "Dr. C", "cancelled", "online");
seedBooking("t3", t3, "Dr. C", "confirmed", "online");
seedBooking("far", t10, "Dr. C", "new", "online");

const baseProps = { API_KEY: "fake", PROJECT_ID: PROJECT, REPORT_EMAIL: "report@cc.test", REPORT_PASSWORD: "secret123",
  REPORT_TO: "owner@cc.test", DASHBOARD_URL: "https://example.web.app/dashboard/", AUTH_BASE: `${AUTH}/identitytoolkit.googleapis.com`, FIRESTORE_BASE: FS };

// ---- happy path ----
const sent = [];
const r = loadScript(baseProps, sent).sendDailyReport();
ok(sent.length === 1 && sent[0].to === "owner@cc.test", "one email sent to REPORT_TO");
ok(r.total === 5 && r.active === 4, `counts yesterday only, excludes cancelled (total ${r.total}, active ${r.active})`);
ok(r.arrived === 2 && r.pending === 1 && r.confirmed === 1 && r.cancelled === 1, "status breakdown correct");
ok(r.online === 3 && r.manual === 1, "online vs reception split correct");
ok(r.doctors[0].doctor === "Dr. A" && r.doctors[0].n === 3 && r.doctors[1].n === 1, "per-doctor counts sorted");
ok(r.todayBooked === 1 && r.weekBooked === 2, `upcoming excludes cancelled and >7 days (today ${r.todayBooked}, week ${r.weekBooked})`);
ok(/৪ টি সিরিয়াল/.test(sent[0].subject), "subject in Bangla with count — " + sent[0].subject);
ok(/ড্যাশবোর্ড খুলুন/.test(sent[0].htmlBody) && /Dr\. A/.test(sent[0].htmlBody), "html has doctor table and dashboard link");
ok(!/01711111111/.test(sent[0].htmlBody), "email contains no patient phone numbers");
ok(r.feeCollected === 1300 && r.paidCount === 2 && r.unpaidCount === 1, `fee totals exclude cancelled (৳${r.feeCollected}, ${r.paidCount} paid, ${r.unpaidCount} due)`);
ok(/ফি আদায়: <b>৳১৩০০<\/b> \(২ জন\) · বাকি: <b>১<\/b> জন/.test(sent[0].htmlBody), "html shows fee collected and due count");
fs.writeFileSync(path.join(process.env.OUT_DIR || __dirname, "report-sample.html"), sent[0].htmlBody);

// ---- failures ----
const expectThrow = (props, re, msg) => {
  try { loadScript(props, []).sendDailyReport(); ok(false, msg + " (no error)"); }
  catch (e) { ok(re.test(e.message), msg + " -> " + e.message.slice(0, 80)); }
};
expectThrow({ ...baseProps, REPORT_PASSWORD: "wrong" }, /Login failed/, "wrong password fails clearly");
expectThrow({ ...baseProps, REPORT_EMAIL: "nobody@cc.test" }, /Firestore query failed/, "account not in reporters is denied");
expectThrow({ ...baseProps, REPORT_TO: undefined }, /REPORT_TO/, "missing property is named");

console.log(failed ? `\n${failed} FAILED` : "\nALL PASSED");
process.exit(failed ? 1 : 0);
