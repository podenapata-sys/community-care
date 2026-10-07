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
    med:    { bn: "মেডিসিন",       en: "Medicine" },
    surg:   { bn: "সার্জারি",       en: "Surgery" },
    gyn:    { bn: "গাইনি",         en: "Gynae" },
    child:  { bn: "শিশু",          en: "Child" },
    ortho:  { bn: "অর্থোপেডিক",     en: "Orthopaedics" },
    skin:   { bn: "চর্ম ও যৌন",     en: "Skin" },
    ent:    { bn: "নাক-কান-গলা",    en: "ENT" },
    kidney: { bn: "কিডনি",         en: "Kidney" },
    uro:    { bn: "ইউরোলজি",       en: "Urology" },
    neuro:  { bn: "নিউরো সার্জারি",  en: "Neurosurgery" },
    radio:  { bn: "আল্ট্রাসাউন্ড",   en: "Ultrasound" }
  },

  // From the hospital's doctor list (PDF). Names exactly as printed; chamber
  // times not provided yet. `unconfirmed` = partly illegible in the source.
  doctors: [
    { name: "Dr. Sharup Chandra Poddar", dept: "med", deg: "MBBS, BCS (Health), FCPS (Medicine), MD (Hematology), MACP (USA)", sbn: "মেডিসিন ও রক্তরোগ বিশেষজ্ঞ", sen: "Medicine & Hematology Specialist", work: "Khulna Medical College Hospital, Khulna" },
    { name: "ডাঃ এস এম মনির হোসেন (রাজা)", dept: "neuro", deg: "এমবিবিএস, বিসিএস (স্বাস্থ্য), এমএস (নিউরোসার্জারি), সহকারী অধ্যাপক", sbn: "নিউরো ও স্পাইন সার্জন", sen: "Neuro & Spine Surgeon", work: "খুলনা বিশেষায়িত হাসপাতাল, খুলনা", unconfirmed: true },
    { name: "Tanmoy Mallick", dept: "med", deg: "MBBS, BCS (H), Medicine Final Part, Medical Officer", sbn: "মেডিসিন", sen: "Medicine", work: "Upazila Health Complex, Dacope, Khulna" },
    { name: "Dr. Sohelee Sarmin", dept: "gyn", deg: "MBBS, BCS (Health), FCPS (Gynae & Obs)", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ ও সার্জন", sen: "Gynae & Obs Specialist & Surgeon", work: "250 Bed General Hospital, Khulna" },
    { name: "Dr. Md. Shahidul Islam Mukul", dept: "surg", deg: "MBBS, FCPS (Surgery), FACS (USA), Assistant Professor of Surgery", sbn: "সার্জারি বিশেষজ্ঞ", sen: "Surgery Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "ডাঃ ইফতেখার বিন রাজ্জাক", dept: "radio", deg: "এমবিবিএস, বিসিএস (স্বাস্থ্য), এম.ফিল, রেডিওলজি ও ইমেজিং-এ পোস্ট-গ্র্যাজুয়েট ট্রেনিং", sbn: "আল্ট্রাসাউন্ড ও রেডিওলজি", sen: "Ultrasound & Radiology", work: "লেকচারার, খুলনা মেডিকেল কলেজ" },
    { name: "Dr. Mithun Debnath", dept: "child", deg: "MBBS, BCS (H), MCPS (Pediatric), MD (Pediatric)", sbn: "নবজাতক, শিশু ও কিশোর রোগ বিশেষজ্ঞ", sen: "Newborn, Child & Adolescent Specialist", work: "Upazila Health Complex, Dacope, Khulna" },
    { name: "Dr. Md. Sohel Rana", dept: "kidney", deg: "MBBS, BCS (Health), MD (Nephrology)", sbn: "কিডনি রোগ ও মেডিসিন বিশেষজ্ঞ", sen: "Kidney Disease & Medicine Specialist", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Aniruddha Sarder", dept: "surg", deg: "MBBS, BCS (Health), FCPS (Surgery), FACS (America)", sbn: "জেনারেল, ল্যাপারোস্কপিক, কোলোরেক্টাল ও ব্রেস্ট সার্জন", sen: "General, Laparoscopic, Colorectal & Breast Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Palash Kumar Aich", dept: "ortho", deg: "MBBS (RMC), Ortho-Surgery (BSMMU), Assistant Professor & Head of Department", sbn: "অর্থোপেডিক সার্জন", sen: "Orthopaedic Surgeon", work: "Gazi Medical College, Khulna" },
    { name: "Dr. Abul Kalam Azad", dept: "uro", deg: "MBBS, BCS (Health), MS (Urology), Assistant Professor", sbn: "ইউরোলজি (কিডনি ও মূত্রনালী) সার্জন", sen: "Urology Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Anup Kumar", dept: "ortho", deg: "MBBS, BCS (Health), MS (Orthopedic Surgery), trained in Spain", sbn: "অর্থোপেডিক ও ট্রমা বিশেষজ্ঞ", sen: "Orthopaedic & Traumatology Specialist", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Sabina Chowdhury", dept: "gyn", deg: "MBBS, BCS (Health), FCPS (Gynae & Obs)", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ ও সার্জন", sen: "Gynae & Obs Specialist & Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Abdullah Al Mamun", dept: "skin", deg: "MBBS, BCS (Health), DDV (Skin & Venereal Disease)", sbn: "চর্ম, যৌন, এলার্জি ও কসমেটিক সার্জন", sen: "Skin, Sex, Allergy Specialist & Cosmetic Surgeon", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Md. Younus Ali", dept: "skin", deg: "MBBS, BCS (Health), DDV (BSMMU)", sbn: "চর্ম, এলার্জি ও যৌন রোগ বিশেষজ্ঞ", sen: "Skin, Allergy & Sex Diseases Specialist", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Purobi Das Bakshi", dept: "gyn", deg: "MBBS, BCS (H), MS (Gynae & Obs)", sbn: "গাইনি ও প্রসূতি বিশেষজ্ঞ সার্জন", sen: "Gynae & Obs Specialist Surgeon", work: "Khulna Medical College & Hospital, Khulna" },
    { name: "Dr. Md. Iqbal Hossain", dept: "med", deg: "MBBS, BCS (Health), PGT (Medicine), Medical Officer", sbn: "মেডিসিন", sen: "Medicine", work: "Khulna Medical College Hospital, Khulna" },
    { name: "Dr. Debnath Talukder", dept: "ent", deg: "MBBS, BCS (Health), MS (ENT), FACS", sbn: "নাক-কান-গলা ও হেড-নেক সার্জন", sen: "ENT, Head & Neck Surgery Specialist", work: "Khulna Medical College Hospital, Khulna" }
  ]
};
