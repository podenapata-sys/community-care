// Firestore security-rule tests. Run from tests/:
//   npm install && npx firebase emulators:exec --only firestore --project demo-cc "node rules.test.mjs"
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, collection, runTransaction, serverTimestamp, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import { readFileSync } from "node:fs";

const env = await initializeTestEnvironment({
  projectId: "demo-cc",
  firestore: { rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 }
});

let failed = 0;
const check = async (name, p) => {
  try { await p; console.log("PASS", name); } catch (e) { failed++; console.log("FAIL", name, "-", e.message); }
};

const iso = d => d.toISOString().slice(0, 10);
const tomorrow = iso(new Date(Date.now() + 864e5));
const pub = env.unauthenticatedContext().firestore();
const staffDb = env.authenticatedContext("staff1", { email: "reception@test" }).firestore();
const strangerDb = env.authenticatedContext("rando", { email: "rando@test" }).firestore();
await env.withSecurityRulesDisabled(async ctx => {
  const admin = ctx.firestore();
  await setDoc(doc(admin, "staff/staff1"), { name: "Reception" });
  await setDoc(doc(admin, "reporters/bot1"), { name: "Daily report" });
});
const botDbEarly = env.authenticatedContext("bot1", { email: "report@test" }).firestore();

// Mirrors createBooking() in assets/firebase-db.js; `tamper` lets a test break one part.
async function book(db, { date = tomorrow, doctor = "Dr. Test", phone = "01711111111", source = "online", tamper = {} } = {}) {
  const cRef = doc(db, "counters", `${date}|${doctor}`), lRef = doc(db, "limits", `${date}|${phone}`);
  const bRef = doc(collection(db, "bookings"));
  return runTransaction(db, async tx => {
    const c = await tx.get(cRef);
    const l = source === "online" && !tamper.skipLimit ? await tx.get(lRef) : null;
    const n = (c.exists() ? c.data().n : 0) + 1;
    if (l) tx.set(lRef, { n: (l.exists() ? l.data().n : 0) + 1 });
    tx.set(cRef, { n });
    const data = {
      serialNo: n, bookingDate: date, doctor, dept: "med", patientName: "Test Patient", phone, age: 30, note: null,
      status: "new", source, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...tamper.fields
    };
    if (tamper.noPhone) delete data.phone;
    tx.set(bRef, data);
    return { id: bRef.id, serial: n };
  });
}

// ---- public booking ----
const first = await book(pub);
await check("public booking gets serial 1", Promise.resolve(first.serial === 1 || (() => { throw new Error("got " + first.serial); })()));
const second = await book(pub, { phone: "01722222222" });
await check("same doctor/day gets serial 2", Promise.resolve(second.serial === 2 || (() => { throw new Error("got " + second.serial); })()));
const other = await book(pub, { doctor: "Dr. Other", phone: "01722222222" });
await check("other doctor starts at 1", Promise.resolve(other.serial === 1 || (() => { throw new Error("got " + other.serial); })()));

await book(pub, { doctor: "Dr. A", phone: "01799999999" });
await book(pub, { doctor: "Dr. B", phone: "01799999999" });
await book(pub, { doctor: "Dr. C", phone: "01799999999" });
await check("4th booking same phone/day rejected", assertFails(book(pub, { doctor: "Dr. D", phone: "01799999999" })));
await check("online booking that skips the limit doc rejected", assertFails(book(pub, { phone: "01733333333", tamper: { skipLimit: true } })));

await check("wrong serialNo rejected", assertFails(book(pub, { phone: "01744444444", tamper: { fields: { serialNo: 99 } } })));
await check("bad phone rejected", assertFails(book(pub, { phone: "12345" })));
await check("past date rejected", assertFails(book(pub, { date: "2020-01-01" })));
await check("too far future rejected", assertFails(book(pub, { date: iso(new Date(Date.now() + 90 * 864e5)) })));
await check("status other than new rejected", assertFails(book(pub, { phone: "01755555555", tamper: { fields: { status: "confirmed" } } })));
await check("public cannot create manual booking", assertFails(book(pub, { phone: "01755555556", source: "manual" })));
await check("extra field rejected", assertFails(book(pub, { phone: "01755555557", tamper: { fields: { isAdmin: true } } })));
await check("fake createdAt rejected", assertFails(book(pub, { phone: "01755555558", tamper: { fields: { createdAt: new Date("2020-01-01") } } })));
await check("counter cannot jump", assertFails(setDoc(doc(pub, "counters", `${tomorrow}|Dr. Test`), { n: 50 })));

// ---- public reads ----
await check("public cannot read a booking", assertFails(getDoc(doc(pub, "bookings", first.id))));
await check("public cannot list bookings", assertFails(getDocs(collection(pub, "bookings"))));
await check("public cannot list limits (phone numbers)", assertFails(getDocs(collection(pub, "limits"))));
await check("public cannot read staff list", assertFails(getDoc(doc(pub, "staff/staff1"))));

// ---- signed-in but not staff ----
await check("non-staff account cannot read bookings", assertFails(getDocs(query(collection(strangerDb, "bookings"), where("bookingDate", "==", tomorrow)))));
await check("non-staff account cannot update", assertFails(updateDoc(doc(strangerDb, "bookings", first.id), { status: "cancelled", updatedAt: serverTimestamp() })));

// ---- staff ----
await check("staff can read own staff doc", assertSucceeds(getDoc(doc(staffDb, "staff/staff1"))));
await check("staff can list a day's bookings", assertSucceeds(getDocs(query(collection(staffDb, "bookings"), where("bookingDate", "==", tomorrow)))));
const manual = await book(staffDb, { source: "manual", phone: "01766666666" });
await check("staff manual entry gets next serial 3", Promise.resolve(manual.serial === 3 || (() => { throw new Error("got " + manual.serial); })()));
await check("staff can change status", assertSucceeds(updateDoc(doc(staffDb, "bookings", first.id), { status: "confirmed", updatedAt: serverTimestamp() })));
await check("staff cannot set unknown status", assertFails(updateDoc(doc(staffDb, "bookings", first.id), { status: "deleted", updatedAt: serverTimestamp() })));
await check("staff cannot edit patient name", assertFails(updateDoc(doc(staffDb, "bookings", first.id), { patientName: "X Y", updatedAt: serverTimestamp() })));
// ---- walk-ins without phone, visit fee & payment ----
const walkIn = await book(staffDb, { source: "manual", phone: null }).catch(e => ({ err: e }));
await check("staff walk-in with phone null allowed", Promise.resolve(walkIn.serial === 4 || (() => { throw new Error(walkIn.err ? walkIn.err.message : "got " + walkIn.serial); })()));
await check("staff walk-in with no phone field allowed", assertSucceeds(book(staffDb, { source: "manual", tamper: { noPhone: true } })));
await check("staff manual with bad phone rejected", assertFails(book(staffDb, { source: "manual", phone: "12345" })));
await check("online booking with phone null rejected", assertFails(book(pub, { phone: null })));
await check("online booking with no phone field rejected", assertFails(book(pub, { tamper: { noPhone: true, skipLimit: true } })));
await check("online booking cannot set fee", assertFails(book(pub, { phone: "01788888881", tamper: { fields: { fee: 0 } } })));
await check("online booking cannot mark itself paid", assertFails(book(pub, { phone: "01788888882", tamper: { fields: { paid: true } } })));
await check("staff manual entry with fee & paid allowed", assertSucceeds(book(staffDb, { source: "manual", phone: "01788888883", tamper: { fields: { fee: 800, paid: true } } })));
await check("staff manual entry with string fee rejected", assertFails(book(staffDb, { source: "manual", phone: "01788888884", tamper: { fields: { fee: "800" } } })));
await check("staff can record payment", assertSucceeds(updateDoc(doc(staffDb, "bookings", first.id), { fee: 800, paid: true, updatedAt: serverTimestamp() })));
await check("staff can undo payment", assertSucceeds(updateDoc(doc(staffDb, "bookings", first.id), { paid: false, updatedAt: serverTimestamp() })));
await check("staff cannot set negative fee", assertFails(updateDoc(doc(staffDb, "bookings", first.id), { fee: -5, updatedAt: serverTimestamp() })));
await check("staff cannot set fee above 100000", assertFails(updateDoc(doc(staffDb, "bookings", first.id), { fee: 100001, updatedAt: serverTimestamp() })));
await check("staff cannot set paid to a string", assertFails(updateDoc(doc(staffDb, "bookings", first.id), { paid: "yes", updatedAt: serverTimestamp() })));
await check("staff cannot edit phone", assertFails(updateDoc(doc(staffDb, "bookings", first.id), { phone: "01799999990", updatedAt: serverTimestamp() })));
await check("staff can look up bookings by phone", assertSucceeds(getDocs(query(collection(staffDb, "bookings"), where("phone", "==", "01711111111")))));
await check("public cannot look up bookings by phone", assertFails(getDocs(query(collection(pub, "bookings"), where("phone", "==", "01711111111")))));

// ---- recycle bin (soft delete, 30 days) ----
const binNow = { deletedAt: serverTimestamp(), deletedBy: "reception@test", updatedAt: serverTimestamp() };
await check("public booking cannot arrive pre-deleted", assertFails(book(pub, { phone: "01788888885", tamper: { fields: { deletedAt: null } } })));
await check("staff can move a booking to the bin", assertSucceeds(updateDoc(doc(staffDb, "bookings", second.id), binNow)));
await check("staff can list the bin", assertSucceeds(getDocs(query(collection(staffDb, "bookings"), where("deletedAt", ">", Timestamp.fromMillis(Date.now() - 30 * 864e5))))));
await check("staff cannot permanently delete a booking deleted today", assertFails(deleteDoc(doc(staffDb, "bookings", second.id))));
await check("staff can restore from the bin", assertSucceeds(updateDoc(doc(staffDb, "bookings", second.id), { deletedAt: null, deletedBy: null, updatedAt: serverTimestamp() })));
await check("bin entry cannot name someone else", assertFails(updateDoc(doc(staffDb, "bookings", other.id), { ...binNow, deletedBy: "owner@test" })));
await check("bin entry cannot be backdated", assertFails(updateDoc(doc(staffDb, "bookings", other.id), { ...binNow, deletedAt: Timestamp.fromDate(new Date("2020-01-01")) })));
await check("bin entry needs who deleted it", assertFails(updateDoc(doc(staffDb, "bookings", other.id), { deletedAt: serverTimestamp(), updatedAt: serverTimestamp() })));
await check("reporter cannot move a booking to the bin", assertFails(updateDoc(doc(botDbEarly, "bookings", other.id), { ...binNow, deletedBy: "report@test" })));
await check("non-staff cannot move a booking to the bin", assertFails(updateDoc(doc(strangerDb, "bookings", other.id), { ...binNow, deletedBy: "rando@test" })));
const old = Timestamp.fromMillis(Date.now() - 31 * 864e5);
await env.withSecurityRulesDisabled(async ctx => {
  const admin = ctx.firestore();
  for (const id of ["expired1", "expired2"]) await setDoc(doc(admin, "bookings", id), { serialNo: 1, bookingDate: tomorrow, doctor: "Dr. Old",
    patientName: "Old", phone: null, status: "new", source: "manual", deletedAt: old, deletedBy: "reception@test", createdAt: old, updatedAt: old });
});
await check("public cannot purge an expired bin entry", assertFails(deleteDoc(doc(pub, "bookings", "expired2"))));
await check("reporter cannot purge an expired bin entry", assertFails(deleteDoc(doc(botDbEarly, "bookings", "expired2"))));
await check("staff can purge after 30 days in the bin", assertSucceeds(deleteDoc(doc(staffDb, "bookings", "expired1"))));

// ---- doctor logins (own patients only) ----
await env.withSecurityRulesDisabled(async ctx => {
  const admin = ctx.firestore();
  await setDoc(doc(admin, "doctors/doc1"), { doctor: "Dr. Test" });
  await setDoc(doc(admin, "doctors/doc2"), { doctor: "Dr. Nobody" });
});
const docDb = env.authenticatedContext("doc1", { email: "drtest@test" }).firestore();
const bk = collection(docDb, "bookings");
const upd = (db, id, data) => updateDoc(doc(db, "bookings", id), { ...data, updatedAt: serverTimestamp() });
await check("doctor can list own patients for a day", assertSucceeds(getDocs(query(bk, where("doctor", "==", "Dr. Test"), where("bookingDate", "==", tomorrow)))));
await check("doctor can list own patients for a range", assertSucceeds(getDocs(query(bk, where("doctor", "==", "Dr. Test"), where("bookingDate", ">=", tomorrow), where("bookingDate", "<=", tomorrow)))));
await check("doctor cannot list everyone's patients", assertFails(getDocs(query(bk, where("bookingDate", "==", tomorrow)))));
await check("doctor cannot list another doctor's patients", assertFails(getDocs(query(bk, where("doctor", "==", "Dr. Other")))));
await check("doctor can open own booking", assertSucceeds(getDoc(doc(docDb, "bookings", first.id))));
await check("doctor cannot open another doctor's booking", assertFails(getDoc(doc(docDb, "bookings", other.id))));
await check("doctor can mark own patient arrived", assertSucceeds(upd(docDb, second.id, { status: "arrived" })));
await check("doctor cannot undo arrived", assertFails(upd(docDb, second.id, { status: "new" })));
await check("doctor cannot confirm", assertFails(upd(docDb, manual.id, { status: "confirmed" })));
await check("doctor cannot cancel", assertFails(upd(docDb, manual.id, { status: "cancelled" })));
await check("doctor cannot record a fee", assertFails(upd(docDb, manual.id, { fee: 800, paid: true })));
await check("doctor cannot move to the bin", assertFails(upd(docDb, manual.id, { deletedAt: serverTimestamp(), deletedBy: "drtest@test" })));
await check("doctor cannot mark another doctor's patient", assertFails(upd(docDb, other.id, { status: "arrived" })));
await check("doctor cannot add a serial", assertFails(book(docDb, { source: "manual", phone: "01788888886" })));
await check("doctor cannot permanently delete", assertFails(deleteDoc(doc(docDb, "bookings", "expired2"))));
await check("doctor can read own doctor link", assertSucceeds(getDoc(doc(docDb, "doctors/doc1"))));
await check("doctor cannot read other doctor links", assertFails(getDoc(doc(docDb, "doctors/doc2"))));
await check("doctor is not staff", assertFails(getDoc(doc(docDb, "staff/staff1"))));
const doc2Db = env.authenticatedContext("doc2", { email: "nobody@test" }).firestore();
await check("unlinked doctor sees nothing of Dr. Test", assertFails(getDocs(query(collection(doc2Db, "bookings"), where("doctor", "==", "Dr. Test")))));

await check("staff cannot delete", assertFails(deleteDoc(doc(staffDb, "bookings", first.id))));
await check("staff cannot add themselves new staff", assertFails(setDoc(doc(staffDb, "staff/newguy"), { name: "x" })));

// ---- reporter (read-only, used by the daily report script) ----
const botDb = botDbEarly;
await check("reporter can list a day's bookings", assertSucceeds(getDocs(query(collection(botDb, "bookings"), where("bookingDate", "==", tomorrow)))));
await check("reporter cannot change status", assertFails(updateDoc(doc(botDb, "bookings", first.id), { status: "cancelled", updatedAt: serverTimestamp() })));
await check("reporter cannot add a manual booking", assertFails(book(botDb, { source: "manual", phone: "01777777777" })));
await check("reporter cannot mark a booking paid", assertFails(updateDoc(doc(botDb, "bookings", first.id), { paid: true, updatedAt: serverTimestamp() })));
await check("reporter cannot add themselves as staff", assertFails(setDoc(doc(botDb, "staff/bot1"), { name: "x" })));

await env.cleanup();
console.log(failed ? `\n${failed} FAILED` : "\nALL PASSED");
process.exit(failed ? 1 : 0);
