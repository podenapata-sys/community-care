/* Firebase data layer shared by the website (index.html) and the staff
   dashboard (dashboard/index.html). Loaded with dynamic import() only when
   assets/config.js has a Firebase config; otherwise both pages run in demo mode.
   Security is enforced by firestore.rules, not by this file. */

const SDK = "https://www.gstatic.com/firebasejs/10.14.1/";
let fb, fs, au, app, db, auth;

export async function init(cfg) {
  if (db) return;
  [fb, fs] = await Promise.all([import(SDK + "firebase-app.js"), import(SDK + "firebase-firestore.js")]);
  const { emulator, ...config } = cfg;
  app = fb.initializeApp(config);
  db = fs.getFirestore(app);
  if (emulator) fs.connectFirestoreEmulator(db, "127.0.0.1", emulator.firestore || 8080);
  init.emulator = emulator;
}

async function getAuthApi() {
  if (!auth) {
    au = await import(SDK + "firebase-auth.js");
    auth = au.getAuth(app);
    if (init.emulator) au.connectAuthEmulator(auth, `http://127.0.0.1:${init.emulator.auth || 9099}`, { disableWarnings: true });
  }
  return au;
}

// Firestore document -> the row shape the dashboard uses.
function toRow(snap) {
  const d = snap.data();
  const iso = t => (t && t.toDate ? t.toDate() : new Date()).toISOString();
  return {
    id: snap.id, serial_no: d.serialNo, booking_date: d.bookingDate, doctor: d.doctor, dept: d.dept ?? null,
    patient_name: d.patientName, phone: d.phone ?? null, age: d.age ?? null, note: d.note ?? null,
    fee: d.fee ?? null, paid: !!d.paid, status: d.status, source: d.source, created_at: iso(d.createdAt), updated_at: iso(d.updatedAt),
    deleted_at: d.deletedAt ? iso(d.deletedAt) : null, deleted_by: d.deletedBy ?? null
  };
}
const live = rows => rows.filter(r => !r.deleted_at);   // hide rows that are in the recycle bin
const BIN_DAYS = 30;
const binCutoff = () => fs.Timestamp.fromMillis(Date.now() - BIN_DAYS * 864e5);

/* Creates a booking and returns { id, serial }.
   One transaction bumps the doctor/day serial counter, (for online bookings) the
   phone/day limit, and writes the booking — the rules check all three agree. */
export async function createBooking(row, source = "online") {
  // Manual (reception) entries may have no phone — walk-in patients without a mobile.
  const phone = String(row.phone || "").replace(/\D/g, "").replace(/^88(?=01)/, "") || null;
  if (!phone && source === "online") throw new Error("invalid_phone");
  const counterRef = fs.doc(db, "counters", `${row.booking_date}|${row.doctor}`);
  const limitRef = fs.doc(db, "limits", `${row.booking_date}|${phone}`);
  const bookingRef = fs.doc(fs.collection(db, "bookings"));
  const serial = await fs.runTransaction(db, async tx => {
    const c = await tx.get(counterRef);
    const l = source === "online" ? await tx.get(limitRef) : null;
    const n = (c.exists() ? c.data().n : 0) + 1;
    if (l) {
      const used = (l.exists() ? l.data().n : 0) + 1;
      if (used > 3) throw new Error("too_many_bookings");
      tx.set(limitRef, { n: used });
    }
    tx.set(counterRef, { n });
    const booking = {
      serialNo: n, bookingDate: row.booking_date, doctor: row.doctor, dept: row.dept ?? null,
      patientName: String(row.patient_name || "").trim(), phone,
      age: row.age === "" || row.age == null ? null : Math.round(+row.age),
      note: row.note ? String(row.note).trim().slice(0, 500) : null,
      status: "new", source, createdAt: fs.serverTimestamp(), updatedAt: fs.serverTimestamp()
    };
    if (source === "manual") {   // only staff may record a fee / payment
      booking.fee = row.fee === "" || row.fee == null ? null : Math.round(+row.fee);
      booking.paid = !!row.paid;
    }
    tx.set(bookingRef, booking);
    return n;
  });
  return { id: bookingRef.id, serial };
}

/* ------------------------------------------------------------- staff only */
// Who is signed in: { role: "staff" } (full access), { role: "doctor", doctor } (own patients only), or null.
let myDoctor = null;
async function roleOf(user) {
  myDoctor = null;
  if (!user) return null;
  const get = col => fs.getDoc(fs.doc(db, col, user.uid)).catch(() => null);
  const s = await get("staff");
  if (s && s.exists()) return { role: "staff" };
  const d = await get("doctors");
  if (d && d.exists() && d.data().doctor) { myDoctor = d.data().doctor; return { role: "doctor", doctor: myDoctor }; }
  return null;
}

// A doctor's queries must ask only for their own patients (the rules refuse anything wider).
const bookingsQuery = (...where) => fs.query(fs.collection(db, "bookings"),
  ...(myDoctor ? [fs.where("doctor", "==", myDoctor)] : []), ...where);

export async function signIn(email, password) {
  const a = await getAuthApi();
  const cred = await a.signInWithEmailAndPassword(auth, email, password);
  const role = await roleOf(cred.user);
  if (!role) { await a.signOut(auth); throw new Error("not_staff"); }
  return role;
}

export async function signOut() { const a = await getAuthApi(); myDoctor = null; await a.signOut(auth); }

// Resolves to the signed-in role (see roleOf) if someone is already signed in on this browser.
export async function session() {
  const a = await getAuthApi();
  const user = await new Promise(res => { const off = a.onAuthStateChanged(auth, u => { off(); res(u); }); });
  return roleOf(user);
}

export async function listDay(date) {
  const q = bookingsQuery(fs.where("bookingDate", "==", date));
  return live((await fs.getDocs(q)).docs.map(toRow));
}

export async function listRange(from, to) {
  const q = bookingsQuery(fs.where("bookingDate", ">=", from), fs.where("bookingDate", "<=", to));
  return live((await fs.getDocs(q)).docs.map(toRow));
}

export async function addManual(row) {
  const { id, serial } = await createBooking(row, "manual");
  const now = new Date().toISOString();
  return { ...row, phone: row.phone || null, fee: row.fee === "" || row.fee == null ? null : Math.round(+row.fee), paid: !!row.paid,
    id, serial_no: serial, status: "new", source: "manual", created_at: now, updated_at: now };
}

// Earlier bookings for a phone number (newest first) — for returning-patient auto-fill.
export async function findByPhone(phone) {
  const q = bookingsQuery(fs.where("phone", "==", phone));
  return live((await fs.getDocs(q)).docs.map(toRow))
    .sort((a, b) => b.booking_date.localeCompare(a.booking_date) || b.created_at.localeCompare(a.created_at))
    .slice(0, 10);
}

export async function updatePayment(id, fee, paid) {
  await fs.updateDoc(fs.doc(db, "bookings", id), { fee: fee == null ? null : Math.round(+fee), paid: !!paid, updatedAt: fs.serverTimestamp() });
  return { fee: fee == null ? null : Math.round(+fee), paid: !!paid };
}

export async function updateStatus(id, status) {
  await fs.updateDoc(fs.doc(db, "bookings", id), { status, updatedAt: fs.serverTimestamp() });
  return { status };
}

/* ---- recycle bin: deleted bookings stay 30 days, then purgeExpired() removes them ---- */
export async function softDelete(id) {
  const email = auth && auth.currentUser && auth.currentUser.email;
  await fs.updateDoc(fs.doc(db, "bookings", id), { deletedAt: fs.serverTimestamp(), deletedBy: email, updatedAt: fs.serverTimestamp() });
}

export async function restore(id) {
  await fs.updateDoc(fs.doc(db, "bookings", id), { deletedAt: null, deletedBy: null, updatedAt: fs.serverTimestamp() });
}

export async function listTrash() {
  const q = bookingsQuery(fs.where("deletedAt", ">", binCutoff()));
  return (await fs.getDocs(q)).docs.map(toRow).sort((a, b) => b.deleted_at.localeCompare(a.deleted_at));
}

// Permanently removes bookings that have been in the bin longer than 30 days.
export async function purgeExpired() {
  const q = fs.query(fs.collection(db, "bookings"), fs.where("deletedAt", "<=", binCutoff()));
  const snap = await fs.getDocs(q);
  // allSettled: if this computer's clock is a little off, the rules refuse a borderline one; it goes next time.
  const res = await Promise.allSettled(snap.docs.map(d => fs.deleteDoc(d.ref)));
  return res.filter(r => r.status === "fulfilled").length;
}

// Calls cb(row) for every booking created after this moment; onState(true/false) for the live dot.
export function onNewBookings(cb, onState) {
  const q = bookingsQuery(fs.where("createdAt", ">", fs.Timestamp.now()));
  return fs.onSnapshot(q, snap => {
    onState && onState(true);
    snap.docChanges().forEach(ch => { if (ch.type === "added") cb(toRow(ch.doc)); });
  }, () => onState && onState(false));
}
