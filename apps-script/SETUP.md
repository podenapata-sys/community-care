# দৈনিক রিপোর্ট ইমেইল চালু করার নিয়ম (Google Apps Script)

প্রতিদিন **সকাল ৮টায়** (বাংলাদেশ সময়) মালিক বা ম্যানেজারের ইমেইলে আগের দিনের সিরিয়ালের সারাংশ যাবে:
- মোট সিরিয়াল, কতজন এসেছেন, কতগুলো কনফার্ম হয়নি, কতগুলো বাতিল হয়েছে
- অনলাইনে কতগুলো এসেছে, রিসেপশন থেকে কতগুলো যোগ হয়েছে
- ডাক্তার অনুযায়ী সিরিয়ালের সংখ্যা
- ফি আদায় কত টাকা হয়েছে, আর কতজনের ফি বাকি
- আজকে আর আগামী ৭ দিনে কতগুলো বুক হয়েছে
- ড্যাশবোর্ডের লিংক

ইমেইলে কোনো রোগীর নাম বা ফোন নম্বর থাকে না, শুধু সংখ্যা। সময় লাগবে ১৫ মিনিট, খরচ ০ টাকা।

---

## ১. নতুন rules লাইভ করুন
রেপোতে `firestore.rules` আপডেট হয়েছে: রিপোর্টের জন্য একটা "শুধু পড়া যায়" অ্যাকাউন্ট যোগ হয়েছে। ল্যাপটপের PowerShell-এ চালান:
```
cd ~/Desktop/community-care/community-care
git pull origin main
firebase deploy --only firestore:rules,hosting
```

## ২. রিপোর্টের জন্য আলাদা লগইন বানান
Firebase console-এ:
1. **Authentication → Users → Add user**:
   - Email: যেমন `report.communitycare@gmail.com`। এটা আসল ইনবক্স হওয়ার দরকার নেই, শুধু লগইনের নাম।
   - Password: শক্ত একটা পাসওয়ার্ড দিন, তারপর **লিখে রাখুন**।
2. নতুন ইউজারের **User UID** কপি করুন।
3. **Firestore Database → Start collection**:
   - Collection ID দিন `reporters` (`staff` নয়!)
   - Document ID-তে ওই UID পেস্ট করুন
   - Field দিন `name`, মান `Daily report`
   - তারপর **Save**

> এই অ্যাকাউন্ট শুধু সিরিয়াল **পড়তে** পারে। সিরিয়াল বদলানো, নতুন যোগ করা বা ড্যাশবোর্ডে লগইন করা যায় না। পাসওয়ার্ড কখনো ফাঁস হলেও কেউ ডেটা নষ্ট করতে পারবে না।

## ৩. Apps Script প্রজেক্ট বানান
1. **script.google.com** খুলুন, তারপর **New project**। নাম দিন `Community Care Daily Report`।
2. বাম পাশে `Code.gs` খুলুন। ভেতরের সব লেখা মুছে রেপোর `apps-script/DailyReport.gs` ফাইলের পুরো লেখা পেস্ট করুন।
3. বাম পাশে ⚙️ **Project Settings**:
   - **Time zone**: `(GMT+06:00) Dhaka`
   - **"Show appsscript.json manifest file"** টিক দিন। তারপর Editor-এ `appsscript.json` খুলে রেপোর `apps-script/appsscript.json`-এর লেখা পেস্ট করুন।
4. **Project Settings → Script Properties → Add script property**। এই ৬টা যোগ করুন:

| Property | Value |
|---|---|
| `API_KEY` | `AIzaSyB2Gw2bupLDmD8Jk1novRPC11x8yMVQ9IA` |
| `PROJECT_ID` | `community-care-khulna` |
| `REPORT_EMAIL` | ধাপ ২-এর ইমেইল |
| `REPORT_PASSWORD` | ধাপ ২-এর পাসওয়ার্ড |
| `REPORT_TO` | যারা রিপোর্ট পাবেন, যেমন `owner@gmail.com,manager@gmail.com` |
| `DASHBOARD_URL` | `https://community-care-khulna-2a364.web.app/dashboard/` |

5. **Save script properties** চাপুন।

> পাসওয়ার্ড কোডে না লিখে Script Properties-এ রাখা হয়, তাই কোড কাউকে দেখালেও পাসওয়ার্ড দেখা যাবে না।

## ৪. টেস্ট ও চালু করুন
1. উপরের ফাংশন মেনু থেকে **`testReport`** বেছে নিয়ে **▶ Run** চাপুন।
   - প্রথমবার অনুমতি চাইবে: **Review permissions → আপনার অ্যাকাউন্ট → Advanced → Go to … (unsafe) → Allow**। এটা আপনার নিজের স্ক্রিপ্ট, তাই নিরাপদ।
   - `REPORT_TO`-এর ইনবক্সে একটা রিপোর্ট আসবে ✅
2. এবার ফাংশন মেনু থেকে **`setup`** বেছে নিয়ে **▶ Run** চাপুন। এতে প্রতিদিন সকাল ৮টার জন্য অটো-রিপোর্ট চালু হয়ে যাবে।
3. চেক করতে বাম পাশে ⏰ **Triggers** খুলুন। `sendDailyReport` — Day timer — 8am to 9am দেখাবে।

---

## সমস্যা হলে
| Execution log-এ যা দেখায় | কারণ | সমাধান |
|---|---|---|
| `Script property missing: …` | ওই property যোগ করা হয়নি | ধাপ ৩.৪ দেখুন |
| `Login failed: INVALID_PASSWORD` / `EMAIL_NOT_FOUND` | ইমেইল বা পাসওয়ার্ড ভুল | Script Properties-এ ঠিক করুন |
| `Firestore query failed … 403` | `reporters`-এ UID নেই, বা নতুন rules deploy হয়নি | ধাপ ১ ও ২.৩ দেখুন |
| ইমেইল আসেনি | স্প্যাম ফোল্ডারে গেছে | "Not spam" চাপুন |

রিপোর্টের সময় বদলাতে চাইলে `DailyReport.gs`-এর `setup()` ফাংশনে `atHour(8)`-এর জায়গায় অন্য ঘণ্টা দিন (যেমন `atHour(21)` মানে রাত ৯টা), তারপর `setup` আবার Run করুন।

---

## নতুন সিরিয়ালের ইমেইল অ্যালার্ট (প্রতি বুকিংয়ে)
ওয়েবসাইট থেকে কেউ সিরিয়াল নিলে **১ মিনিটের মধ্যে** ইমেইল যাবে। ইমেইলে থাকবে রোগীর নাম, ফোন (চাপলেই কল), ডাক্তার, তারিখ আর সিরিয়াল নম্বর। রিসেপশন থেকে নিজেরা যোগ করা সিরিয়ালের জন্য অ্যালার্ট যায় না।

1. `Code.gs`-এ রেপোর নতুন `apps-script/DailyReport.gs` পেস্ট করে **Save** করুন।
2. (ঐচ্ছিক) **Script Properties**-এ `ALERT_TO` যোগ করুন, অর্থাৎ কারা অ্যালার্ট পাবেন (কমা দিয়ে)। না দিলে `REPORT_TO`-এর ঠিকানায় যাবে।
3. ফাংশন মেনু থেকে **`setupAlerts`** বেছে নিয়ে **▶ Run** চাপুন। প্রথমবার আবার অনুমতি চাইতে পারে, Allow দিন।
4. ওয়েবসাইটে একটা টেস্ট বুকিং দিন। ১–২ মিনিটের মধ্যে ইমেইল আসবে ✅
5. ফোনে **Gmail অ্যাপের নোটিফিকেশন চালু** রাখুন, তাহলে বুকিং এলেই ফোন বাজবে।

বন্ধ করতে চাইলে **`stopAlerts`** Run করুন।

> **সীমা:** সাধারণ Gmail থেকে দিনে প্রায় ১০০টা ইমেইল পাঠানো যায়, আর প্রতিটা প্রাপক আলাদা গোনা হয়। একই মিনিটে কয়েকটা বুকিং এলে একটা ইমেইলেই সব যায়, তাই সাধারণ দিনে সমস্যা হবে না। কোটা শেষ হলে সেদিনের বাকি অ্যালার্ট বাদ যায়, তবে ড্যাশবোর্ডে সব সিরিয়াল থাকে।
