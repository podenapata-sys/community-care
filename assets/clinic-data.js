/* Community Care Hospital — shared clinic data.
   Used by the public website (index.html) and the staff dashboard. */
window.CLINIC = {
  name: { bn: "কমিউনিটি কেয়ার হাসপাতাল এন্ড ডায়াগনস্টিক", en: "Community Care Hospital & Diagnostic" },
  address: { bn: "১৯ কেডিএ এভিনিউ, মোহসেন টাওয়ার, তেঁতুলতলা মোড়, খুলনা", en: "19 KDA Avenue, Mohsen Tower, Tetultola Mor, Khulna" },
  // Numbers from the hospital (digits only, 11-digit BD format)
  reception: "01337661299",
  emergency: "01901448954",
  serial: ["01917949443", "01711383154"],   // from the doctor list flyer
  whatsapp: "",               // e.g. "8801XXXXXXXXX" (country code, no +); falls back to reception


  // PLACEHOLDER: confirm with the hospital
  services: [
    { icon: "steth", bn: "মেডিসিন বিশেষজ্ঞ",       en: "General Medicine",   dbn: "জ্বর, ডায়াবেটিস, প্রেশার",          den: "Fever, diabetes, blood pressure" },
    { icon: "heart", bn: "কিডনি (নেফ্রোলজি)",      en: "Kidney (Nephrology)", dbn: "কিডনি রোগের পরীক্ষা ও চিকিৎসা",      den: "Kidney check-ups and treatment" },
    { icon: "lab",   bn: "প্যাথলজি ল্যাব",         en: "Pathology Lab",      dbn: "রক্ত, প্রস্রাব ও অন্যান্য টেস্ট",    den: "Blood, urine and other tests" },
    { icon: "scan",  bn: "আল্ট্রাসনোগ্রাম ও এক্স-রে", en: "Ultrasound & X-ray", dbn: "দ্রুত ও নির্ভুল রিপোর্ট",           den: "Fast, accurate reports" },
    { icon: "baby",  bn: "গাইনি ও প্রসূতি",        en: "Gynae & Obstetrics", dbn: "প্রসূতি সেবা ও চেকআপ",             den: "Maternity care & check-ups" },
    { icon: "child", bn: "শিশু বিশেষজ্ঞ",          en: "Paediatrics",        dbn: "শিশুর সম্পূর্ণ চিকিৎসা",            den: "Complete child care" },
    { icon: "bed",   bn: "ভর্তি ও কেবিন",           en: "Admission & Cabins", dbn: "পরিচ্ছন্ন ওয়ার্ড ও কেবিন",          den: "Clean wards and cabins" },
    { icon: "amb",   bn: "২৪/৭ জরুরি বিভাগ",        en: "24/7 Emergency",     dbn: "যেকোনো সময় জরুরি সেবা",            den: "Emergency care any time" }
  ],

  // Departments used for the doctor filter chips (order = chip order).
  depts: {
    med:    { bn: "মেডিসিন",            en: "Medicine" },
    surg:   { bn: "সার্জারি",            en: "Surgery" },
    gyn:    { bn: "গাইনি",              en: "Gynae" },
    child:  { bn: "শিশু",               en: "Child" },
    ortho:  { bn: "অর্থোপেডিক",          en: "Orthopaedics" },
    skin:   { bn: "চর্ম ও যৌন",          en: "Skin" },
    ent:    { bn: "নাক-কান-গলা",         en: "ENT" },
    cardio: { bn: "হৃদরোগ",             en: "Cardiology" },
    chest:  { bn: "বক্ষব্যাধি",           en: "Chest" },
    endo:   { bn: "ডায়াবেটিস ও হরমোন",    en: "Diabetes & Hormone" },
    kidney: { bn: "কিডনি",              en: "Kidney" },
    uro:    { bn: "ইউরোলজি",            en: "Urology" },
    neuro:  { bn: "নিউরো সার্জারি",       en: "Neurosurgery" },
    onco:   { bn: "ক্যান্সার",            en: "Cancer" },
    radio:  { bn: "আল্ট্রাসাউন্ড",        en: "Ultrasound" }
  },

  // From the hospital's doctor lists (two flyers). Names exactly as printed.
  // status: "regular" | "visiting" | "both"; time: chamber hours or null; fee in BDT.
  // highlight: shown first with a ★ badge. verify: "name" | "details" = still to
  // confirm with the hospital (rendered with an orange outline).
  doctors: [
    // ---- Flyer 2 (Community Care header) ----
    { name: "Dr. Sharup Chandra Poddar", dept: "med", status: "regular", time: "3pm–9pm", fee: "800", deg: "MBBS, BCS (Health), FCPS (Medicine), MD (Hematology), MACP (USA)", sbn: "মেডিসিন ও রক্তরোগ বিশেষজ্ঞ", sen: "Medicine & Hematology Specialist", work: "Khulna Medical College Hospital, Khulna" },
    { name: "ডাঃ এস এম মনির হোসেন (রাজা)", dept: "neuro", status: "regular", time: "3pm–9pm", fee: "800", deg: "এমবিবিএস, বিসিএস (স্বাস্থ্য), এমএস (নিউরোসার্জারি), সহকারী অধ্যাপক", sbn: "নিউরো ও স্পাইন সার্জন", sen: "Neuro & Spine Surgeon", work: "খুলনা বিশেষায়িত হাসপাতাল, খুলনা", verify: "name" },
    { name: "Tanmoy Mallick", dept: "med", status: "regular", time: "3pm–9pm", fee: "500", deg: "MBBS, BCS (H), Medicine Final Part, Medical Officer", sbn: "মেডিসিন", sen: "Medicine", work: "Upazila Health Complex, Dacope, Khulna" },
    { name: "Dr. Sohelee Sarmin", dept: "gyn", status: "visiting", time: "3pm–9pm", fee: "800", deg: "MBBS, BCS (Health), FCPS (Gynae & Obs)", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ ও সার্জন", sen: "Gynae & Obs Specialist & Surgeon", work: "250 Bed General Hospital, Khulna" },
    { name: "Dr. Md. Shahidul Islam Mukul", dept: "surg", status: "visiting", time: "3pm–9pm", fee: "800", deg: "MBBS, FCPS (Surgery), FACS (USA), Assistant Professor of Surgery", sbn: "সার্জারি বিশেষজ্ঞ", sen: "Surgery Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "ডাঃ ইফতেখার বিন রাজ্জাক", dept: "radio", status: "regular", time: "3pm–9pm", fee: "500–1500", expert: true, deg: "এমবিবিএস, বিসিএস (স্বাস্থ্য), এম.ফিল; রেডিওলজি ও ইমেজিং-এ পোস্ট-গ্র্যাজুয়েট ট্রেনিং", sbn: "এ্যাডভান্স আল্ট্রাসাউন্ড ও রেডিওলজি", sen: "Advanced Ultrasound & Radiology", work: "লেকচারার, খুলনা মেডিকেল কলেজ", verify: "details" },
    { name: "Dr. Mithun Debnath", dept: "child", status: "regular", time: "3pm–9pm", fee: "800", highlight: true, expert: true, deg: "MBBS, BCS (H), MCPS (Pediatric), MD (Pediatric)", sbn: "নবজাতক, শিশু ও কিশোর রোগ বিশেষজ্ঞ", sen: "Newborn, Child & Adolescent Specialist", work: "Upazila Health Complex, Dacope, Khulna" },
    { name: "Dr. Md. Sohel Rana", dept: "kidney", status: "visiting", time: "3pm–9pm", fee: "800", deg: "MBBS, BCS (Health), MD (Nephrology)", sbn: "কিডনি রোগ ও মেডিসিন বিশেষজ্ঞ", sen: "Kidney Disease & Medicine Specialist", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Aniruddha Sarder", dept: "surg", status: "regular", time: "3pm–9pm", fee: "800", highlight: true, deg: "MBBS, BCS (Health), FCPS (Surgery), FACS (America)", sbn: "জেনারেল, ল্যাপারোস্কপিক, কোলোরেক্টাল ও ব্রেস্ট সার্জন", sen: "General, Laparoscopic, Colorectal & Breast Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Palash Kumar Aich", dept: "ortho", status: "visiting", time: "3pm–9pm", fee: "800", deg: "MBBS (RMC), Ortho-Surgery (BSMMU), Assistant Professor & Head of Department", sbn: "অর্থোপেডিক সার্জন", sen: "Orthopaedic Surgeon", work: "Gazi Medical College, Khulna" },
    { name: "Dr. Abul Kalam Azad", dept: "uro", status: "both", time: "3pm–9pm", fee: "800", highlight: true, deg: "MBBS, BCS (Health), MS (Urology), Assistant Professor", sbn: "ইউরোলজি (কিডনি ও মূত্রনালী) সার্জন", sen: "Urology Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Anup Kumar", dept: "ortho", status: "regular", time: "3pm–9pm", fee: "800", deg: "MBBS, BCS (Health), MS (Orthopedic Surgery), trained in Spain", sbn: "অর্থোপেডিক ও ট্রমা বিশেষজ্ঞ", sen: "Orthopaedic & Traumatology Specialist", work: "Khulna Medical College Hospital, Khulna", verify: "details" },
    { name: "Dr. Sabina Chowdhury", dept: "gyn", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Gynae & Obs)", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ ও সার্জন", sen: "Gynae & Obs Specialist & Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Abdullah Al Mamun", dept: "skin", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), DDV (Skin & Venereal Disease)", sbn: "চর্ম, যৌন, এলার্জি ও কসমেটিক সার্জন", sen: "Skin, Sex, Allergy Specialist & Cosmetic Surgeon", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Md. Younus Ali", dept: "skin", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), DDV (BSMMU)", sbn: "চর্ম, এলার্জি ও যৌন রোগ বিশেষজ্ঞ", sen: "Skin, Allergy & Sex Diseases Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Purobi Das Bakshi", dept: "gyn", status: "regular", time: null, fee: "800", deg: "MBBS, BCS (H), MS (Gynae & Obs)", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ সার্জন", sen: "Gynae & Obs Specialist Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Md. Iqbal Hossain", dept: "med", status: "regular", time: null, fee: "800", highlight: true, deg: "MBBS, BCS (Health), PGT (Medicine), Medical Officer", sbn: "মেডিসিন", sen: "Medicine", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Debnath Talukder", dept: "ent", status: null, time: null, fee: "800", deg: "MBBS, BCS (Health), MS (ENT), FACS", sbn: "নাক-কান-গলা ও হেড-নেক সার্জন", sen: "ENT, Head & Neck Surgery Specialist", work: "Khulna Medical College Hospital, Khulna" },
    // ---- Flyer 1 ----
    { name: "Dr. Nirapada Mondal", dept: "child", status: null, time: null, fee: "800", deg: "MBBS, BCS (H), DCH (Child)", sbn: "শিশু বিশেষজ্ঞ", sen: "Child Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Sumona Das", dept: "onco", status: null, time: null, fee: "800", deg: "MBBS, BCS (H), FCPS (P-2), MD (Oncology)", sbn: "ক্যান্সার বিশেষজ্ঞ (রেডিওথেরাপি)", sen: "Consultant (Radiotherapy)", work: "Khulna Medical College, Khulna", verify: "details" },
    { name: "Dr. Mrinal Kanti Saha", dept: "chest", status: "regular", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Medicine), MACP (USA), CCD (BIRDEM)", sbn: "বক্ষব্যাধি, মেডিসিন ও ডায়াবেটিস বিশেষজ্ঞ", sen: "Respiratory Medicine, Medicine & Diabetes Specialist", work: "Khulna Medical College Hospital, Khulna", verify: "details" },
    { name: "Dr. Kamalesh Saha", dept: "neuro", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (H), MS (Neurosurgery)", sbn: "ব্রেইন ও স্পাইন বিশেষজ্ঞ", sen: "Brain & Spine Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Jebunnesa Jebu", dept: "gyn", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS, DGO, MCPS, FCPS (Gynae & Obs), MRCPG, FP", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ ও সার্জন", sen: "Gynae & Obs Specialist & Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. S.M. Quamraul Haque", dept: "cardio", status: "visiting", time: null, fee: "800", deg: "MBBS, MD (Cardiology)", sbn: "হৃদরোগ, মেডিসিন ও বাতজ্বর বিশেষজ্ঞ; সিনিয়র কনসালট্যান্ট", sen: "Cardiology (Heart Diseases, Medicine & Rheumatic Fever) Specialist; Senior Consultant", work: "Shahid Sheikh Abu Naser Specialized Hospital, Khulna", verify: "name" },
    { name: "Dr. Kishore Kumar Shil", dept: "endo", status: "regular", time: null, fee: "800", highlight: true, deg: "MBBS, BCS (Health), MD (Endocrinology)", sbn: "ডায়াবেটিস, থাইরয়েড ও হরমোন বিশেষজ্ঞ", sen: "Diabetes, Thyroid & Hormone Specialist", work: "Khulna Medical College & Hospital, Khulna", verify: "details" },
    { name: "Prof. Dr. Khan Shakil Ahmed", dept: "skin", status: "visiting", time: null, fee: "800", deg: "MBBS, CCD (BIRDEM), DDV (Skin & Sex), DMF, MCPS, FCGP (Family Medicine)", sbn: "চর্ম ও যৌন রোগ বিশেষজ্ঞ; অধ্যাপক", sen: "Skin & Sex Specialist; Professor", work: "Gazi Medical College & Hospital, Khulna" },
    { name: "Dr. K.P. Das", dept: "gyn", status: "regular", time: null, fee: "800", highlight: true, deg: "MBBS, BCS (Health), MS (Gynae & Obs)", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ সার্জন", sen: "Gynae & Obs Specialist Surgeon", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Mithun Kumar Paul", dept: "ent", status: "visiting", time: null, fee: "800", deg: "MBBS, DLO (ENT), Associate Professor", sbn: "নাক-কান-গলা বিশেষজ্ঞ; সহযোগী অধ্যাপক", sen: "ENT Specialist; Associate Professor", work: "Gazi Medical College & Hospital, Khulna" },
    { name: "Dr. Palash Tarafder", dept: "kidney", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (H), MD (Nephrology), Assistant Professor & Head of Department", sbn: "কিডনি রোগ বিশেষজ্ঞ", sen: "Nephrology (Kidney) Specialist", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Md. Firoz Ahmed", dept: "ortho", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (H), D-Ortho (BSMMU)", sbn: "ঘাড়-কোমর ব্যথা, বাত, হাঁটু ও স্পাইন বিশেষজ্ঞ; অর্থোপেডিক ও ট্রমা সার্জন", sen: "Neck-Back Pain, Arthritis, Knee & Spine Specialist; Orthopaedic & Trauma Surgeon", work: "Khulna Medical College, Khulna" },
    { name: "Dr. Avijit Kumar Sikder", dept: "ortho", status: "regular", time: null, fee: "800", highlight: true, deg: "MBBS, BCS (Health), D-Ortho, BSMMU (PG Hospital)", sbn: "অর্থোপেডিক বিশেষজ্ঞ", sen: "Orthopaedic Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Abu Bakar Saddique", dept: "surg", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Surgery)", sbn: "জেনারেল, ল্যাপারোস্কপিক, ব্রেস্ট ও কোলোরেক্টাল সার্জন", sen: "General, Laparoscopic, Breast & Colorectal Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Prof. Dr. Md. Sirajul Isam", dept: "med", status: "regular", time: null, fee: "800", deg: "MBBS, FCPS (Medicine), Ex-Professor (Medicine)", sbn: "মেডিসিন বিশেষজ্ঞ; সাবেক অধ্যাপক", sen: "Medicine Specialist; Ex-Professor", work: "Khulna Medical College Hospital, Khulna", verify: "name" },
    { name: "Dr. Farhana Kabir", dept: "gyn", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Gynae & Obs), DGO", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ ও সার্জন", sen: "Gynae & Obs Specialist & Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Manzurul Ibrahim Musa", dept: "chest", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), MD (Respiratory Medicine), BSMMU", sbn: "বক্ষব্যাধি ও মেডিসিন বিশেষজ্ঞ", sen: "Chest Disease & Medicine Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Md. Junaid Shakiq", dept: "ent", status: "regular", time: null, fee: "800", highlight: true, deg: "MBBS, DLO (BSMMU), Assistant Professor", sbn: "নাক-কান-গলা ও হেড-নেক সার্জন", sen: "Ear, Nose, Throat & Head-Neck Surgeon", work: "Gazi Medical College, Khulna", verify: "name" },
    { name: "Dr. Subrata Kumar Mondal", dept: "surg", status: "regular", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Surgery)", sbn: "জেনারেল, ল্যাপারোস্কপিক, ব্রেস্ট ও কোলোরেক্টাল সার্জন", sen: "General, Laparoscopic, Breast & Colorectal Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. H.M. Zafor Sharif", dept: "surg", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), MS (Pediatric Surgery), Assistant Professor", sbn: "শিশু সার্জারি ও ল্যাপারোস্কপিক সার্জন", sen: "Pediatric & Laparoscopic Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Md. Nazmul Kabir", dept: "med", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Medicine), Associate Professor; trained in Neuromedicine (NINS, Dhaka)", sbn: "মেডিসিন ও নিউরোমেডিসিন বিশেষজ্ঞ; সহযোগী অধ্যাপক", sen: "Medicine Specialist (trained in Neuromedicine); Associate Professor", work: "Khulna Medical College & Hospital, Khulna" }
  ]
};
