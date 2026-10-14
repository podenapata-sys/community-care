// Firestore security-rule tests. Run from tests/:
//   npm install && npx firebase emulators:exec --only firestore --project demo-cc "node rules.test.mjs"
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, collection, runTransaction, serverTimestamp, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
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
await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), "staff/staff1"), { name: "Reception" }); });

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

await check("staff cannot delete", assertFails(deleteDoc(doc(staffDb, "bookings", first.id))));
await check("staff cannot add themselves new staff", assertFails(setDoc(doc(staffDb, "staff/newguy"), { name: "x" })));

// ---- reporter (read-only, used by the daily report script) ----
await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), "reporters/bot1"), { name: "Daily report" }); });
const botDb = env.authenticatedContext("bot1", { email: "report@test" }).firestore();
await check("reporter can list a day's bookings", assertSucceeds(getDocs(query(collection(botDb, "bookings"), where("bookingDate", "==", tomorrow)))));
await check("reporter cannot change status", assertFails(updateDoc(doc(botDb, "bookings", first.id), { status: "cancelled", updatedAt: serverTimestamp() })));
await check("reporter cannot add a manual booking", assertFails(book(botDb, { source: "manual", phone: "01777777777" })));
await check("reporter cannot mark a booking paid", assertFails(updateDoc(doc(botDb, "bookings", first.id), { paid: true, updatedAt: serverTimestamp() })));
await check("reporter cannot add themselves as staff", assertFails(setDoc(doc(botDb, "staff/bot1"), { name: "x" })));

await env.cleanup();
console.log(failed ? `\n${failed} FAILED` : "\nALL PASSED");
process.exit(failed ? 1 : 0);
