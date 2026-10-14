/**
 * Community Care Hospital — daily booking report email.
 *
 * Runs every morning (Asia/Dhaka), reads yesterday's bookings from Firestore
 * with a read-only "reporter" account, and emails a Bangla summary.
 *
 * Setup (see apps-script/SETUP.md):
 *   Project Settings → Script Properties:
 *     API_KEY          Firebase web apiKey (from assets/config.js)
 *     PROJECT_ID       community-care-khulna
 *     REPORT_EMAIL     login email of the reporter account (Firebase Auth)
 *     REPORT_PASSWORD  its password
 *     REPORT_TO        recipients, comma-separated
 *     DASHBOARD_URL    optional, link shown in the email
 *     ALERT_TO         optional, who gets new-booking alerts (default REPORT_TO)
 *   Then run setup() once, and testReport() to receive a sample now.
 *   For an email on every new online booking, run setupAlerts() once.
 */

var TZ = 'Asia/Dhaka';
var STATUS_BN = { new: 'কনফার্ম হয়নি', confirmed: 'কনফার্ম', arrived: 'এসেছেন', cancelled: 'বাতিল' };

/** Run once: creates the 8 AM daily trigger (replacing any old one). */
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendDailyReport') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendDailyReport').timeBased().atHour(8).everyDays(1).inTimezone(TZ).create();
  Logger.log('Daily report scheduled for 8 AM (Asia/Dhaka).');
}

/** Sends the report right now — use this to test. */
function testReport() { sendDailyReport(); }

function sendDailyReport() {
  var cfg = config_();
  var token = signIn_(cfg);
  var today = dhakaDate_(0), yesterday = dhakaDate_(-1), weekEnd = dhakaDate_(6);

  var rows = queryBookings_(cfg, token, yesterday, yesterday);
  var upcoming = queryBookings_(cfg, token, today, weekEnd).filter(function (r) { return r.status !== 'cancelled'; });
  var report = summarize_(rows, upcoming, today);

  MailApp.sendEmail({
    to: cfg.to,
    subject: 'কমিউনিটি কেয়ার — ' + bnDate_(yesterday) + ': ' + bn_(report.active) + ' টি সিরিয়াল',
    htmlBody: renderHtml_(report, yesterday, cfg.dashboardUrl),
    name: 'Community Care রিপোর্ট'
  });
  Logger.log('Report sent to ' + cfg.to + ' (' + rows.length + ' bookings on ' + yesterday + ')');
  return report;
}

/* ------------------------------------------------------------------ data */

function config_() {
  var p = PropertiesService.getScriptProperties();
  var get = function (k, required) {
    var v = p.getProperty(k);
    if (required && !v) throw new Error('Script property missing: ' + k);
    return v;
  };
  return {
    apiKey: get('API_KEY', true), projectId: get('PROJECT_ID', true),
    email: get('REPORT_EMAIL', true), password: get('REPORT_PASSWORD', true),
    to: get('REPORT_TO', true), dashboardUrl: get('DASHBOARD_URL') || '',
    // Overrides used only by the automated tests (Firebase emulators).
    authBase: get('AUTH_BASE') || 'https://identitytoolkit.googleapis.com',
    firestoreBase: get('FIRESTORE_BASE') || 'https://firestore.googleapis.com'
  };
}

function signIn_(cfg) {
  var res = UrlFetchApp.fetch(cfg.authBase + '/v1/accounts:signInWithPassword?key=' + cfg.apiKey, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({ email: cfg.email, password: cfg.password, returnSecureToken: true })
  });
  var body = JSON.parse(res.getContentText());
  if (res.getResponseCode() !== 200) throw new Error('Login failed: ' + (body.error && body.error.message));
  return body.idToken;
}

/** Bookings with from <= bookingDate <= to, as plain objects. */
function queryBookings_(cfg, token, from, to) {
  var url = cfg.firestoreBase + '/v1/projects/' + cfg.projectId + '/databases/(default)/documents:runQuery';
  var range = function (op, v) { return { fieldFilter: { field: { fieldPath: 'bookingDate' }, op: op, value: { stringValue: v } } }; };
  var res = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'bookings' }],
      where: { compositeFilter: { op: 'AND', filters: [range('GREATER_THAN_OR_EQUAL', from), range('LESS_THAN_OR_EQUAL', to)] } }
    } })
  });
  var body = JSON.parse(res.getContentText());
  if (res.getResponseCode() !== 200) throw new Error('Firestore query failed: ' + res.getContentText().slice(0, 300));
  return body.filter(function (e) {
    // Skip bookings that staff moved to the recycle bin.
    return e.document && !(e.document.fields && e.document.fields.deletedAt && e.document.fields.deletedAt.timestampValue);
  }).map(function (e) {
    var f = e.document.fields || {};
    var str = function (k) { return f[k] && (f[k].stringValue != null ? f[k].stringValue : null); };
    var fee = f.fee && f.fee.integerValue != null ? +f.fee.integerValue : (f.fee && f.fee.doubleValue != null ? +f.fee.doubleValue : null);
    return { date: str('bookingDate'), doctor: str('doctor'), status: str('status'), source: str('source'),
      fee: fee, paid: !!(f.paid && f.paid.booleanValue) };
  });
}

function summarize_(rows, upcoming, today) {
  var count = function (list, fn) { return list.filter(fn).length; };
  var active = rows.filter(function (r) { return r.status !== 'cancelled'; });
  var byDoctor = {};
  active.forEach(function (r) { byDoctor[r.doctor] = (byDoctor[r.doctor] || 0) + 1; });
  return {
    total: rows.length,
    active: active.length,
    arrived: count(rows, function (r) { return r.status === 'arrived'; }),
    confirmed: count(rows, function (r) { return r.status === 'confirmed'; }),
    pending: count(rows, function (r) { return r.status === 'new'; }),
    cancelled: count(rows, function (r) { return r.status === 'cancelled'; }),
    online: count(active, function (r) { return r.source === 'online'; }),
    manual: count(active, function (r) { return r.source === 'manual'; }),
    doctors: Object.keys(byDoctor).map(function (d) { return { doctor: d, n: byDoctor[d] }; })
      .sort(function (a, b) { return b.n - a.n || (a.doctor < b.doctor ? -1 : 1); }),
    feeCollected: active.reduce(function (s, r) { return s + (r.paid && r.fee ? r.fee : 0); }, 0),
    paidCount: count(active, function (r) { return r.paid; }),
    unpaidCount: count(active, function (r) { return !r.paid && r.fee != null; }),
    todayBooked: count(upcoming, function (r) { return r.date === today; }),
    weekBooked: upcoming.length
  };
}

/* ---------------------------------------------------------------- render */

function renderHtml_(r, date, dashboardUrl) {
  var tile = function (label, value, color) {
    return '<td style="padding:10px 12px;border:1px solid #e3e7f2;border-radius:10px;text-align:center;background:#fff">' +
      '<div style="font-size:24px;font-weight:700;color:' + color + '">' + bn_(value) + '</div>' +
      '<div style="font-size:12px;color:#5b6285">' + label + '</div></td>';
  };
  var docRows = r.doctors.length ? r.doctors.map(function (d) {
    return '<tr><td style="padding:6px 8px;border-bottom:1px solid #eef1f7">' + esc_(d.doctor) + '</td>' +
      '<td style="padding:6px 8px;border-bottom:1px solid #eef1f7;text-align:right;font-weight:600">' + bn_(d.n) + '</td></tr>';
  }).join('') : '<tr><td style="padding:8px;color:#5b6285">এই দিনে কোনো সিরিয়াল নেই।</td></tr>';

  return '<div style="font-family:\'Hind Siliguri\',\'Noto Sans Bengali\',Arial,sans-serif;max-width:560px;margin:auto;color:#14183a">' +
    '<div style="background:#0d2470;color:#fff;padding:16px 18px;border-radius:12px 12px 0 0">' +
      '<div style="font-size:13px;opacity:.8">দৈনিক সিরিয়াল রিপোর্ট</div>' +
      '<div style="font-size:20px;font-weight:700">কমিউনিটি কেয়ার হাসপাতাল এন্ড ডায়াগনস্টিক</div>' +
      '<div style="font-size:14px;color:#13b6e2">' + bnDate_(date) + '</div></div>' +
    '<div style="background:#f4f6fb;padding:16px 18px;border-radius:0 0 12px 12px">' +
      '<table style="width:100%;border-collapse:separate;border-spacing:6px"><tr>' +
        tile('মোট সিরিয়াল', r.active, '#0d2470') + tile('এসেছেন', r.arrived, '#0f8a5f') +
        tile('কনফার্ম হয়নি', r.pending, '#2d4fc9') + tile('বাতিল', r.cancelled, '#c0392b') +
      '</tr></table>' +
      '<p style="font-size:14px;margin:12px 6px">অনলাইনে এসেছে <b>' + bn_(r.online) + '</b> টি, রিসেপশন থেকে যোগ হয়েছে <b>' + bn_(r.manual) + '</b> টি।</p>' +
      '<p style="font-size:14px;margin:12px 6px">ফি আদায়: <b>৳' + bn_(r.feeCollected) + '</b> (' + bn_(r.paidCount) + ' জন)' +
        (r.unpaidCount ? ' · বাকি: <b>' + bn_(r.unpaidCount) + '</b> জন' : '') + '</p>' +
      '<h3 style="font-size:15px;margin:16px 6px 6px">ডাক্তার অনুযায়ী</h3>' +
      '<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;font-size:14px">' + docRows + '</table>' +
      '<h3 style="font-size:15px;margin:16px 6px 6px">সামনে</h3>' +
      '<p style="font-size:14px;margin:0 6px">আজকের জন্য বুক হয়েছে <b>' + bn_(r.todayBooked) + '</b> টি · আগামী ৭ দিনে মোট <b>' + bn_(r.weekBooked) + '</b> টি।</p>' +
      (dashboardUrl ? '<p style="margin:18px 6px 4px"><a href="' + esc_(dashboardUrl) + '" style="background:#13b6e2;color:#04263a;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">ড্যাশবোর্ড খুলুন</a></p>' : '') +
      '<p style="font-size:11px;color:#8a90ad;margin:18px 6px 0">স্বয়ংক্রিয় রিপোর্ট · FS Solutions</p>' +
    '</div></div>';
}

/* --------------------------------------------------------------- helpers */

function dhakaDate_(offsetDays) {
  return Utilities.formatDate(new Date(Date.now() + offsetDays * 864e5), TZ, 'yyyy-MM-dd');
}

function bn_(n) {
  return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; });
}

function bnDate_(iso) {
  var months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  var p = iso.split('-');
  return bn_(+p[2]) + ' ' + months[+p[1] - 1] + ' ' + bn_(p[0]);
}

function esc_(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}

/* ======================================================= new-booking alerts
 * Every minute: emails each new ONLINE booking (name, phone, doctor, serial)
 * to ALERT_TO (defaults to REPORT_TO), so reception/owner get a phone
 * notification from the Gmail app. Reception-added bookings are not alerted.
 * Run setupAlerts() once to start, stopAlerts() to stop.
 */

/** Run once: starts the every-minute alert check (replacing any old one). */
function setupAlerts() {
  stopAlerts();
  PropertiesService.getScriptProperties().setProperty('ALERT_LAST', new Date().toISOString());
  ScriptApp.newTrigger('checkNewBookings').timeBased().everyMinutes(1).create();
  Logger.log('Booking alerts on: new online bookings are emailed within about a minute.');
}

function stopAlerts() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'checkNewBookings') ScriptApp.deleteTrigger(t);
  });
}

function checkNewBookings() {
  var cfg = config_();
  var props = PropertiesService.getScriptProperties();
  var since = props.getProperty('ALERT_LAST') || new Date(Date.now() - 5 * 60e3).toISOString();
  var rows = queryNewBookings_(cfg, cachedToken_(cfg), since);
  if (!rows.length) return [];
  // Remember the newest one first, so a mail failure never re-sends old alerts in a loop.
  props.setProperty('ALERT_LAST', rows[rows.length - 1].createdAt);

  var fresh = rows.filter(function (r) { return r.source === 'online' && !r.deleted; });
  if (!fresh.length) return [];
  if (MailApp.getRemainingDailyQuota() < 2) { Logger.log('Mail quota used up today; skipped ' + fresh.length + ' alerts.'); return fresh; }

  // One email per check: if several bookings arrive in the same minute they share one mail (saves the daily quota).
  var first = fresh[0];
  MailApp.sendEmail({
    to: props.getProperty('ALERT_TO') || cfg.to,
    subject: fresh.length === 1
      ? '🔔 নতুন সিরিয়াল: ' + first.patientName + ' → ' + first.doctor + ' (#' + bn_(first.serialNo) + ', ' + bnDate_(first.date) + ')'
      : '🔔 ' + bn_(fresh.length) + ' টি নতুন সিরিয়াল এসেছে',
    htmlBody: renderAlertHtml_(fresh, cfg.dashboardUrl),
    name: 'Community Care সিরিয়াল'
  });
  return fresh;
}

/** The sign-in token lasts an hour; reuse it so the every-minute check stays fast. */
function cachedToken_(cfg) {
  var cache = CacheService.getScriptCache();
  var t = cache.get('idToken');
  if (!t) { t = signIn_(cfg); cache.put('idToken', t, 50 * 60); }
  return t;
}

/** Bookings created after `sinceIso`, oldest first. */
function queryNewBookings_(cfg, token, sinceIso) {
  var url = cfg.firestoreBase + '/v1/projects/' + cfg.projectId + '/databases/(default)/documents:runQuery';
  var res = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'bookings' }],
      where: { fieldFilter: { field: { fieldPath: 'createdAt' }, op: 'GREATER_THAN', value: { timestampValue: sinceIso } } },
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'ASCENDING' }],
      limit: 50
    } })
  });
  if (res.getResponseCode() !== 200) {
    if (res.getResponseCode() === 401) CacheService.getScriptCache().remove('idToken');
    throw new Error('Firestore query failed: ' + res.getContentText().slice(0, 300));
  }
  return JSON.parse(res.getContentText()).filter(function (e) { return e.document; }).map(function (e) {
    var f = e.document.fields || {};
    var s = function (k) { return f[k] && f[k].stringValue != null ? f[k].stringValue : ''; };
    var n = function (k) { return f[k] && f[k].integerValue != null ? +f[k].integerValue : null; };
    return { patientName: s('patientName'), phone: s('phone'), doctor: s('doctor'), date: s('bookingDate'), note: s('note'),
      source: s('source'), serialNo: n('serialNo'), age: n('age'), createdAt: f.createdAt.timestampValue,
      deleted: !!(f.deletedAt && f.deletedAt.timestampValue) };
  });
}

function renderAlertHtml_(rows, dashboardUrl) {
  var cards = rows.map(function (r) {
    var phone = r.phone ? r.phone.slice(0, 5) + '-' + r.phone.slice(5) : '—';
    return '<div style="background:#fff;border:1px solid #e3e7f2;border-radius:10px;padding:12px 14px;margin:0 0 10px">' +
      '<div style="font-size:13px;color:#5b6285">' + esc_(r.doctor) + ' · ' + bnDate_(r.date) + '</div>' +
      '<div style="font-size:18px;font-weight:700;color:#0d2470;margin:2px 0">সিরিয়াল #' + bn_(r.serialNo) + ' — ' + esc_(r.patientName) +
        (r.age != null ? ' <span style="font-weight:400;font-size:14px;color:#5b6285">(' + bn_(r.age) + ' বছর)</span>' : '') + '</div>' +
      '<div style="font-size:15px">📞 ' + (r.phone ? '<a href="tel:+88' + esc_(r.phone) + '" style="color:#1d3ea6">' + esc_(phone) + '</a>' : '—') + '</div>' +
      (r.note ? '<div style="font-size:13px;color:#3c4266;margin-top:4px">📝 ' + esc_(r.note) + '</div>' : '') + '</div>';
  }).join('');
  return '<div style="font-family:\'Hind Siliguri\',\'Noto Sans Bengali\',Arial,sans-serif;max-width:520px;margin:auto;color:#14183a;background:#f4f6fb;padding:14px;border-radius:12px">' +
    '<div style="font-size:15px;font-weight:700;color:#0d2470;margin:0 0 10px">🔔 ওয়েবসাইট থেকে নতুন সিরিয়াল</div>' + cards +
    (dashboardUrl ? '<a href="' + esc_(dashboardUrl) + '" style="display:inline-block;background:#13b6e2;color:#04263a;padding:9px 14px;border-radius:8px;text-decoration:none;font-weight:600">ড্যাশবোর্ডে কনফার্ম করুন</a>' : '') +
    '</div>';
}
