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
    { icon: "steth", img: "svc-medicine", bn: "মেডিসিন বিশেষজ্ঞ",       en: "General Medicine",   dbn: "জ্বর, ডায়াবেটিস, প্রেশার",          den: "Fever, diabetes, blood pressure" },
    { icon: "heart", img: "svc-kidney", bn: "কিডনি (নেফ্রোলজি)",      en: "Kidney (Nephrology)", dbn: "কিডনি রোগের পরীক্ষা ও চিকিৎসা",      den: "Kidney check-ups and treatment" },
    { icon: "lab", img: "svc-lab",   bn: "প্যাথলজি ল্যাব",         en: "Pathology Lab",      dbn: "রক্ত, প্রস্রাব ও অন্যান্য টেস্ট",    den: "Blood, urine and other tests" },
    { icon: "scan", img: "svc-ultrasound",  bn: "আল্ট্রাসনোগ্রাম ও এক্স-রে", en: "Ultrasound & X-ray", dbn: "দ্রুত ও নির্ভুল রিপোর্ট",           den: "Fast, accurate reports" },
    { icon: "baby", img: "svc-gynae",  bn: "গাইনি ও প্রসূতি",        en: "Gynae & Obstetrics", dbn: "প্রসূতি সেবা ও চেকআপ",             den: "Maternity care & check-ups" },
    { icon: "child", img: "svc-child", bn: "শিশু বিশেষজ্ঞ",          en: "Paediatrics",        dbn: "শিশুর সম্পূর্ণ চিকিৎসা",            den: "Complete child care" },
    { icon: "bed", img: "svc-cabin",   bn: "ভর্তি ও কেবিন",           en: "Admission & Cabins", dbn: "পরিচ্ছন্ন ওয়ার্ড ও কেবিন",          den: "Clean wards and cabins" },
    { icon: "amb", img: "svc-emergency",   bn: "জরুরি বিভাগ",            en: "Emergency",          dbn: "জরুরি প্রয়োজনে সরাসরি কল করুন",     den: "Call our emergency line directly" }
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
    radio:  { bn: "আল্ট্রাসাউন্ড",        en: "Ultrasound" },
    psych:  { bn: "মনোবিজ্ঞান ও কাউন্সেলিং", en: "Psychology & Counselling" }
  },

  // From the hospital's doctor lists (two flyers). Names exactly as printed.
  // status: "regular" | "visiting" | "both"; time: chamber hours or null; fee in BDT.
  // name: booking key (stored with every booking and used by doctor logins) — never change it.
  // nbn / nen: the name shown on the site in Bangla / English (nen defaults to name).
  // shareholder: hospital shareholder, shown first with a ★ Shareholder badge.
  // shOrder: optional position among shareholders (1 = first); the rest follow in list order.
  // reg: optional line shown under the name (e.g. registration number).
  // photo: optional portrait (square, about 320px); the initials circle shows without it.
  // notMbbs: not an MBBS doctor (no "Dr."), left out of the "specialist doctors" count.
  // highlight: shown first with a ★ badge. verify: "name" | "details" = still to
  // confirm with the hospital (rendered with an orange outline).
  doctors: [
    // ---- Shareholders ----
    { name: "Prof. Prokash Chandra Adhikari", shareholder: true, shOrder: 8, nbn: "প্রফেসর প্রকাশ চন্দ্র অধিকারী", aka: "প্রফেসর প্রকাশ চন্দ্র অধিকারী Prokash Adhikary mental health মাদকাসক্তি addiction শিশুর আচরণগত সমস্যা child behaviour মাইন্ড এন্ড বডি", dept: "psych", status: "regular", time: "3pm–9pm", fee: "500", notMbbs: true, deg: "B.Sc (Hons), M.Sc (Psychology), University of Dhaka; BCS (Education)", sbn: "মনোবিজ্ঞানী — ডিপ্রেশন, এনজাইটি ও কাউন্সেলিং", sen: "Psychologist — depression, anxiety & counselling", work: "Professor, Govt. Sundarban Adarsha College, Khulna" },
    { name: "Kishor Gain", reg: "DMF (Dhaka) Reg. No. 6317", shareholder: true, shOrder: 7, nbn: "কিশোর গাইন", photo: "assets/img/doctors/kishor-gain-2.jpg", aka: "কিশোর গাইন Kishore", dept: "med", status: "regular", time: "3pm–9pm", fee: null, notMbbs: true, deg: "Sub Asstt. Community Medical Officer", sbn: "উপ-সহকারী কমিউনিটি মেডিকেল অফিসার (SACMO)", sen: "Sub Assistant Community Medical Officer (SACMO)", work: "Upazila Health Complex, Dacope, Khulna" },
    // ---- Flyer 2 (Community Care header) ----
    { name: "Dr. Sharup Chandra Poddar", shareholder: true, shOrder: 1, nbn: "ডাঃ স্বরূপ চন্দ্র পোদ্দার", dept: "med", status: "regular", time: "3pm–9pm", fee: "800", deg: "MBBS, BCS (Health), FCPS (Medicine), MD (Hematology), MACP (USA)", sbn: "মেডিসিন ও রক্তরোগ বিশেষজ্ঞ", sen: "Medicine & Hematology Specialist", work: "Khulna Medical College Hospital, Khulna" },
    { name: "ডাঃ এস এম মনির হোসেন (রাজা)", photo: "assets/img/doctors/monir-hossain-reza.jpg", shareholder: true, shOrder: 2, nbn: "ডাঃ এস. এম. মনির হোসেন (রেজা)", nen: "Dr. S. M. Monir Hossain (Reza)", aka: "Dr. S M Monir Hossain Reza Raja রেজা Monir Hossen", dept: "neuro", status: "regular", time: "3pm–9pm", fee: "800", deg: "এমবিবিএস, বিসিএস (স্বাস্থ্য), এমএস (নিউরোসার্জারি), সহকারী অধ্যাপক", sbn: "নিউরো ও স্পাইন সার্জন", sen: "Neuro & Spine Surgeon", work: "খুলনা বিশেষায়িত হাসপাতাল, খুলনা" },
    { name: "Dr. Tonmoy Mollik", photo: "assets/img/doctors/tanmoy-mallick.jpg", shareholder: true, shOrder: 5, nbn: "ডাঃ তন্ময় মল্লিক", nen: "Dr. Tanmoy Mallick", aka: "Tonmoy Mollik Tanmoy Mallick তন্ময় মল্লিক", dept: "med", status: "regular", time: "3pm–9pm", fee: "600", deg: "MBBS, BCS (H), Medicine Final Part, Medical Officer", sbn: "মেডিসিন", sen: "Medicine", work: "Upazila Health Complex, Dacope, Khulna" },
    { name: "Dr. Sohelee Sarmin", nbn: "ডাঃ সোহেলী শারমিন", dept: "gyn", status: "visiting", time: "3pm–9pm", fee: "800", deg: "MBBS, BCS (Health), FCPS (Gynae & Obs)", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ ও সার্জন", sen: "Gynae & Obs Specialist & Surgeon", work: "250 Bed General Hospital, Khulna" },
    { name: "Dr. Md. Shahidul Islam Mukul", nbn: "ডাঃ মোঃ শহিদুল ইসলাম মুকুল", dept: "surg", status: "visiting", time: "3pm–9pm", fee: "800", deg: "MBBS, FCPS (Surgery), FACS (USA), Assistant Professor of Surgery", sbn: "সার্জারি বিশেষজ্ঞ", sen: "Surgery Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "ডাঃ ইফতেখার বিন রাজ্জাক", photo: "assets/img/doctors/iftekhar-bin-razzak.jpg", shareholder: true, shOrder: 4, nbn: "ডাঃ ইফতেখার বিন রাজ্জাক", nen: "Dr. Iftekhar Bin Razzak", dept: "radio", status: "regular", time: "3pm–9pm", fee: "500–1500", expert: true, deg: "এমবিবিএস, বিসিএস (স্বাস্থ্য), এম.ফিল; পোস্ট-গ্র্যাজুয়েট ট্রেনিং অন রেডিওলজি এন্ড ইমেজিং", sbn: "এ্যাডভান্স আল্ট্রাসাউন্ড এন্ড রিসার্চ", sen: "Advanced Ultrasound & Research", work: "লেকচারার, খুলনা মেডিকেল কলেজ" },
    { name: "Dr. Mithun Debnath", shareholder: true, shOrder: 3, nbn: "ডাঃ মিঠুন দেবনাথ", dept: "child", status: "regular", time: "3pm–9pm", fee: "800", highlight: true, expert: true, deg: "MBBS, BCS (H), MCPS (Pediatric), MD (Pediatric), Bangladesh Shishu Hospital & Institute, Dhaka", sbn: "নবজাতক, শিশু ও কিশোর রোগ বিশেষজ্ঞ", sen: "Newborn, Child & Adolescent Specialist", work: "Consultant, Upazila Health Complex, Dacope, Khulna (Ex-Khulna Medical College Hospital)" },
    { name: "Dr. Md. Sohel Rana", nbn: "ডাঃ মোঃ সোহেল রানা", dept: "kidney", status: "visiting", time: "3pm–9pm", fee: "800", deg: "MBBS, BCS (Health), MD (Nephrology)", sbn: "কিডনি রোগ ও মেডিসিন বিশেষজ্ঞ", sen: "Kidney Disease & Medicine Specialist", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Aniruddha Sarder", nbn: "ডাঃ অনিরুদ্ধ সরদার", dept: "surg", status: "regular", time: "3pm–9pm", fee: "800", highlight: true, deg: "MBBS, BCS (Health), FCPS (Surgery), FACS (America), Resident Surgeon", sbn: "জেনারেল, ল্যাপারোস্কপিক, কোলোরেক্টাল ও ব্রেস্ট সার্জন", sen: "General, Laparoscopic, Colorectal & Breast Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Palash Kumar Aich", nbn: "ডাঃ পলাশ কুমার আইচ", dept: "ortho", status: "visiting", time: "3pm–9pm", fee: "800", deg: "MBBS (RMC), Ortho-Surgery (BSMMU), Assistant Professor & Head of Department", sbn: "অর্থোপেডিক সার্জন", sen: "Orthopaedic Surgeon", work: "Gazi Medical College, Khulna" },
    { name: "Dr. Abul Kalam Azad", nbn: "ডাঃ আবুল কালাম আজাদ", dept: "uro", status: "both", time: "3pm–9pm", fee: "800", highlight: true, deg: "MBBS, BCS (Health), MS (Urology), Assistant Professor", sbn: "ইউরোলজি (কিডনি ও মূত্রনালী) সার্জন", sen: "Urology Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Anup Kumar", nbn: "ডাঃ অনুপ কুমার", dept: "ortho", status: "regular", time: "3pm–9pm", fee: "800", deg: "MBBS, BCS (Health), MS (Orthopedic Surgery), BSMMU (Ex-PG Hospital), trained in Spain; Resident Surgeon (Orthopaedics & Traumatology)", sbn: "অর্থোপেডিক ও ট্রমা বিশেষজ্ঞ", sen: "Orthopaedic & Traumatology Specialist", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Sabina Chowdhury", nbn: "ডাঃ সাবিনা চৌধুরী", dept: "gyn", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Gynae & Obs)", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ ও সার্জন", sen: "Gynae & Obs Specialist & Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Abdullah Al Mamun", nbn: "ডাঃ আবদুল্লাহ আল মামুন", dept: "skin", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), DDV (Skin & Venereal Disease), BSMMU (PG Hospital, Dhaka)", sbn: "চর্ম, যৌন, এলার্জি ও কুষ্ঠ রোগ বিশেষজ্ঞ; কসমেটিক ও ডার্মাটো সার্জন", sen: "Skin, Sex, Allergy & Leprosy Specialist; Cosmetic & Dermato Surgeon", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Md. Younus Ali", nbn: "ডাঃ মোঃ ইউনুস আলী", dept: "skin", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), DDV (BSMMU)", sbn: "চর্ম, এলার্জি ও যৌন রোগ বিশেষজ্ঞ ও কসমেটিক ডার্মাটো সার্জন", sen: "Skin, Allergy & Sex Diseases Specialist & Cosmetic Dermato Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Purobi Das Bakshi", nbn: "ডাঃ পূরবী দাস বকশী", dept: "gyn", status: "regular", time: null, fee: "800", deg: "MBBS, BCS (H), MS (Gynae & Obs)", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ সার্জন", sen: "Gynae & Obs Specialist Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Md. Iqbal Hossain", photo: "assets/img/doctors/iqbal-hossain.jpg", shareholder: true, shOrder: 6, nbn: "ডাঃ মোঃ ইকবাল হোসেন", dept: "med", status: "regular", time: null, fee: "800", highlight: true, deg: "MBBS, BCS (Health), PGT (Medicine), Medical Officer", sbn: "মেডিসিন", sen: "Medicine", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Debnath Talukder", nbn: "ডাঃ দেবনাথ তালুকদার", dept: "ent", status: null, time: null, fee: "800", deg: "MBBS, BCS (Health), MS (ENT), FACS, Resident Surgeon, Department of ENT", sbn: "নাক-কান-গলা ও হেড-নেক সার্জন", sen: "ENT, Head & Neck Surgery Specialist", work: "Khulna Medical College Hospital, Khulna" },
    // ---- Flyer 1 ----
    { name: "Dr. Nirapada Mondal", nbn: "ডাঃ নিরাপদ মন্ডল", dept: "child", status: null, time: null, fee: "800", deg: "MBBS, BCS (H), DCH (Child)", sbn: "শিশু বিশেষজ্ঞ", sen: "Child Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Sumona Das", nbn: "ডাঃ সুমনা দাস", dept: "onco", status: null, time: null, fee: "800", deg: "MBBS, BCS (H), FCPS (P-2), MD (Oncology)", sbn: "ক্যান্সার বিশেষজ্ঞ (রেডিওথেরাপি)", sen: "Consultant (Radiotherapy)", work: "Khulna Medical College, Khulna" },
    { name: "Dr. Mrinal Kanti Saha", nbn: "ডাঃ মৃণাল কান্তি সানা", nen: "Dr. Mrinal Kanti Sana", aka: "Saha সাহা", dept: "chest", status: "regular", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Medicine), MACP (USA), CCD (BIRDEM), Respiratory Medicine (Singapore)", sbn: "বক্ষব্যাধি, মেডিসিন ও ডায়াবেটিস বিশেষজ্ঞ", sen: "Respiratory Medicine, Medicine & Diabetes Specialist", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Kamalesh Saha", nbn: "ডাঃ কমলেশ সাহা", dept: "neuro", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (H), MS (Neurosurgery)", sbn: "ব্রেইন ও স্পাইন বিশেষজ্ঞ", sen: "Brain & Spine Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Jebunnesa Jebu", nbn: "ডাঃ জেবুন্নেসা জেবু", dept: "gyn", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS, DGO, MCPS, FCPS (Gynae & Obs), MRCPG, FP", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ ও সার্জন", sen: "Gynae & Obs Specialist & Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. S.M. Quamraul Haque", nbn: "ডাঃ এস. এম. কামরুল হক", nen: "Dr. S. M. Quamraul Haque", aka: "Quamrul Kamrul", dept: "cardio", status: "visiting", time: null, fee: "800", deg: "MBBS, MD (Cardiology)", sbn: "হৃদরোগ, মেডিসিন ও বাতজ্বর বিশেষজ্ঞ; সিনিয়র কনসালট্যান্ট", sen: "Cardiology (Heart Diseases, Medicine & Rheumatic Fever) Specialist; Senior Consultant", work: "Shahid Sheikh Abu Naser Specialized Hospital, Khulna" },
    { name: "Dr. Kishore Kumar Shil", nbn: "ডাঃ কিশোর কুমার শীল", dept: "endo", status: "regular", time: null, fee: "800", highlight: true, deg: "MBBS, BCS (Health), MD (Endocrinology)", sbn: "ডায়াবেটিস, থাইরয়েড ও হরমোন বিশেষজ্ঞ", sen: "Diabetes, Thyroid & Hormone Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Prof. Dr. Khan Shakil Ahmed", nbn: "প্রফেসর ডাঃ খান শাকিল আহমেদ", dept: "skin", status: "visiting", time: null, fee: "800", deg: "MBBS, CCD (BIRDEM), DDV (Skin & Sex), DMF, MCPS, FCGP (Family Medicine), Fellow in Sexology, Psycho-Sexual Therapy & Cosmetology (India)", sbn: "চর্ম ও যৌন রোগ বিশেষজ্ঞ; অধ্যাপক", sen: "Skin & Sex Specialist; Professor", work: "Gazi Medical College & Hospital, Khulna" },
    { name: "Dr. K.P. Das", nbn: "ডাঃ কে. পি. দাস", nen: "Dr. K. P. Das", dept: "gyn", status: "regular", time: null, fee: "800", highlight: true, deg: "MBBS, BCS (Health), MS (Gynae & Obs)", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ সার্জন", sen: "Gynae & Obs Specialist Surgeon", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Mithun Kumar Paul", nbn: "ডাঃ মিঠুন কুমার পাল", dept: "ent", status: "visiting", time: null, fee: "800", deg: "MBBS, DLO (ENT), Associate Professor", sbn: "নাক-কান-গলা বিশেষজ্ঞ; সহযোগী অধ্যাপক", sen: "ENT Specialist; Associate Professor", work: "Gazi Medical College & Hospital, Khulna" },
    { name: "Dr. Palash Tarafder", nbn: "ডাঃ পলাশ তরফদার", dept: "kidney", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (H), MD (Nephrology), Assistant Professor & Head of Department", sbn: "কিডনি রোগ বিশেষজ্ঞ", sen: "Nephrology (Kidney) Specialist", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Md. Firoz Ahmed", nbn: "ডাঃ মোঃ ফিরোজ আহমেদ", dept: "ortho", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (H), D-Ortho (BSMMU)", sbn: "ঘাড়-কোমর ব্যথা, বাত, হাঁটু ও স্পাইন বিশেষজ্ঞ; অর্থোপেডিক ও ট্রমা সার্জন", sen: "Neck-Back Pain, Arthritis, Knee & Spine Specialist; Orthopaedic & Trauma Surgeon", work: "Khulna Medical College, Khulna" },
    { name: "Dr. Avijit Kumar Sikder", nbn: "ডাঃ অভিজিৎ কুমার শিকদার", dept: "ortho", status: "regular", time: null, fee: "800", highlight: true, deg: "MBBS, BCS (Health), D-Ortho, BSMMU (PG Hospital)", sbn: "অর্থোপেডিক বিশেষজ্ঞ", sen: "Orthopaedic Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Abu Bakar Saddique", nbn: "ডাঃ আবু বকর সিদ্দিক", dept: "surg", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Surgery)", sbn: "জেনারেল, ল্যাপারোস্কপিক, ব্রেস্ট ও কোলোরেক্টাল সার্জন", sen: "General, Laparoscopic, Breast & Colorectal Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Prof. Dr. Md. Sirajul Isam", nbn: "প্রফেসর ডাঃ মোঃ সিরাজুল ইসাম", aka: "Sirajul Islam ইসলাম", dept: "med", status: "regular", time: null, fee: "800", deg: "MBBS, FCPS (Medicine), Ex-Professor (Medicine)", sbn: "মেডিসিন বিশেষজ্ঞ; সাবেক অধ্যাপক", sen: "Medicine Specialist; Ex-Professor", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Farhana Kabir", nbn: "ডাঃ ফারহানা কবির", dept: "gyn", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Gynae & Obs), DGO", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ ও সার্জন", sen: "Gynae & Obs Specialist & Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Manzurul Ibrahim Musa", nbn: "ডাঃ মনজুরুল ইব্রাহিম মুসা", dept: "chest", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), MD (Respiratory Medicine), BSMMU", sbn: "বক্ষব্যাধি ও মেডিসিন বিশেষজ্ঞ", sen: "Chest Disease & Medicine Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Md. Junaid Shakiq", nbn: "ডাঃ মোঃ জুনাইদ শাকিক", dept: "ent", status: "regular", time: null, fee: "800", highlight: true, deg: "MBBS, DLO (BSMMU), Assistant Professor", sbn: "নাক-কান-গলা ও হেড-নেক সার্জন", sen: "Ear, Nose, Throat & Head-Neck Surgeon", work: "Gazi Medical College, Khulna" },
    { name: "Dr. Subrata Kumar Mondal", nbn: "ডাঃ সুব্রত কুমার মন্ডল", dept: "surg", status: "regular", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Surgery)", sbn: "জেনারেল, ল্যাপারোস্কপিক, ব্রেস্ট ও কোলোরেক্টাল সার্জন", sen: "General, Laparoscopic, Breast & Colorectal Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. H.M. Zafor Sharif", nbn: "ডাঃ এইচ. এম. জাফর শরীফ", nen: "Dr. H. M. Zafor Sharif", dept: "surg", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), MS (Pediatric Surgery), Assistant Professor", sbn: "শিশু সার্জারি ও ল্যাপারোস্কপিক সার্জন", sen: "Pediatric & Laparoscopic Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Md. Nazmul Kabir", nbn: "ডাঃ মোঃ নাজমুল কবির", dept: "med", status: "visiting", time: null, fee: "800", deg: "MBBS, BCS (Health), FCPS (Medicine), Associate Professor; trained in Neuromedicine (NINS, Dhaka)", sbn: "মেডিসিন ও নিউরোমেডিসিন বিশেষজ্ঞ; সহযোগী অধ্যাপক", sen: "Medicine Specialist (trained in Neuromedicine); Associate Professor", work: "Khulna Medical College & Hospital, Khulna" }
  ]
};
