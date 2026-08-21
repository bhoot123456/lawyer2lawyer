/**
 * seed-judge-directory.js
 *
 * Standalone, idempotent seed script for JudgeDirectory collection.
 *
 * Safety guarantees:
 * - Uses $setOnInsert — never overwrites existing records.
 * - Matches on (courtId, courtRoom, judgeName) composite key → no duplicates.
 * - Safe to run multiple times — existing records are skipped.
 * - No frontend, controller, route, model, middleware, or auth files touched.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const judgeDirectoryData = [
  // --- Delhi High Court (35 judges) ---
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 1 (DB-1)", bench: "Division Bench", judgeName: "HON'BLE Mr. JUSTICE MANMOHAN (CHIEF JUSTICE)", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt1", meetingId: "251 256 78821", email: "cm.cj.dhc@gov.in", displayOrder: 1 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 2", bench: "", judgeName: "HON'BLE Mr. JUSTICE VIBHU BAKHRU", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt2", meetingId: "251 256 78822", email: "cm.vibhubakhru.dhc@gov.in", displayOrder: 2 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 3", bench: "", judgeName: "HON'BLE Mr. JUSTICE RAJIV SHAKDHER", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt3", meetingId: "251 256 78823", email: "cm.rajivshakdher.dhc@gov.in", displayOrder: 3 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 4", bench: "", judgeName: "HON'BLE Mr. JUSTICE SURESH KUMAR KAIT", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt4", meetingId: "251 256 78824", email: "cm.sureshkait.dhc@gov.in", displayOrder: 4 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 5", bench: "", judgeName: "HON'BLE Ms. JUSTICE MUKTA GUPTA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt5", meetingId: "251 256 78825", email: "cm.muktagupta.dhc@gov.in", displayOrder: 5 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 6", bench: "", judgeName: "HON'BLE Mr. JUSTICE JAYANT NATH", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt6", meetingId: "251 256 78826", email: "cm.jayantnath.dhc@gov.in", displayOrder: 6 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 7", bench: "", judgeName: "HON'BLE Mr. JUSTICE SIDDHARTH MRIDUL", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt7", meetingId: "251 256 78827", email: "cm.siddharthmridul.dhc@gov.in", displayOrder: 7 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 8", bench: "", judgeName: "HON'BLE Mr. JUSTICE YASHWANT VARMA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt8", meetingId: "251 256 78828", email: "cm.yashwantvarma.dhc@gov.in", displayOrder: 8 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 9", bench: "", judgeName: "HON'BLE Mr. JUSTICE SANJEEV SACHDEVA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt9", meetingId: "251 256 78829", email: "cm.sanjeevsachdeva.dhc@gov.in", displayOrder: 9 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 10", bench: "", judgeName: "HON'BLE Mr. JUSTICE V. KAMESHWAR RAO", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt10", meetingId: "251 256 78830", email: "cm.vkameshwarrao.dhc@gov.in", displayOrder: 10 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 11", bench: "", judgeName: "HON'BLE Mr. JUSTICE NAJMI WAZIRI", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt11", meetingId: "251 256 78831", email: "cm.najmiwaziri.dhc@gov.in", displayOrder: 11 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 12", bench: "", judgeName: "HON'BLE Mr. JUSTICE CHANDRA DHARI SINGH", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt12", meetingId: "251 256 78832", email: "cm.chandradhari.dhc@gov.in", displayOrder: 12 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 13", bench: "", judgeName: "HON'BLE Mr. JUSTICE SANJAY KISHAN KAUL", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt13", meetingId: "251 256 78833", email: "cm.sanjaykishankaul.dhc@gov.in", displayOrder: 13 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 14", bench: "", judgeName: "HON'BLE Mr. JUSTICE SUBRAMONIUM PRASAD", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt14", meetingId: "251 256 78834", email: "cm.subramoniumprasad.dhc@gov.in", displayOrder: 14 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 15", bench: "", judgeName: "HON'BLE Mr. JUSTICE ANUP JAIRAM BHAMBHANI", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt15", meetingId: "251 256 78835", email: "cm.anupbhambhani.dhc@gov.in", displayOrder: 15 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 16", bench: "", judgeName: "HON'BLE Mr. JUSTICE NAVIN CHAWLA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt16", meetingId: "251 256 78836", email: "cm.navinchawla.dhc@gov.in", displayOrder: 16 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 17", bench: "", judgeName: "HON'BLE Mr. JUSTICE JASMEET SINGH", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt17", meetingId: "251 256 78837", email: "cm.jasmeetsingh.dhc@gov.in", displayOrder: 17 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 18", bench: "", judgeName: "HON'BLE Ms. JUSTICE REKHA PALLI", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt18", meetingId: "251 256 78838", email: "cm.rekhapalli.dhc@gov.in", displayOrder: 18 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 19", bench: "", judgeName: "HON'BLE Mr. JUSTICE PRATEEK JALAN", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt19", meetingId: "251 256 78839", email: "cm.prateekjalan.dhc@gov.in", displayOrder: 19 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 20", bench: "", judgeName: "HON'BLE Mr. JUSTICE DINESH KUMAR SHARMA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt20", meetingId: "251 256 78840", email: "cm.dineshsharma.dhc@gov.in", displayOrder: 20 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 21", bench: "", judgeName: "HON'BLE Mr. JUSTICE TALWANT SINGH", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt21", meetingId: "251 256 78841", email: "cm.talwantsingh.dhc@gov.in", displayOrder: 21 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 22", bench: "", judgeName: "HON'BLE Mr. JUSTICE AMIT BANSAL", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt22", meetingId: "251 256 78842", email: "cm.amitbansal.dhc@gov.in", displayOrder: 22 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 23", bench: "", judgeName: "HON'BLE Mr. JUSTICE PURUSHAINDRA KUMAR KAURAV", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt23", meetingId: "251 256 78843", email: "cm.pkkaurav.dhc@gov.in", displayOrder: 23 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 24", bench: "", judgeName: "HON'BLE Mr. JUSTICE SWARANA KANTA SHARMA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt24", meetingId: "251 256 78844", email: "cm.swaranakanta.dhc@gov.in", displayOrder: 24 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 25", bench: "", judgeName: "HON'BLE Mr. JUSTICE ANISH DAYAL", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt25", meetingId: "251 256 78845", email: "cm.anishdayal.dhc@gov.in", displayOrder: 25 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 26", bench: "", judgeName: "HON'BLE Ms. JUSTICE MINI PUSHKARNA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt26", meetingId: "251 256 78846", email: "cm.minipushkarna.dhc@gov.in", displayOrder: 26 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 27", bench: "", judgeName: "HON'BLE Mr. JUSTICE VIKAS MAHAJAN", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt27", meetingId: "251 256 78847", email: "cm.vikasmahajan.dhc@gov.in", displayOrder: 27 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 28", bench: "", judgeName: "HON'BLE Mr. JUSTICE MANMEET PRITAM SINGH ARORA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt28", meetingId: "251 256 78848", email: "cm.manmeetarora.dhc@gov.in", displayOrder: 28 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 29", bench: "", judgeName: "HON'BLE Ms. JUSTICE NEENA BANSAL KRISHNA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt29", meetingId: "251 256 78849", email: "cm.neenakrishna.dhc@gov.in", displayOrder: 29 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 30", bench: "", judgeName: "HON'BLE Mr. JUSTICE DHARMESH SHARMA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt30", meetingId: "251 256 78850", email: "cm.dharmeshsharma.dhc@gov.in", displayOrder: 30 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 31", bench: "", judgeName: "HON'BLE Mr. JUSTICE GIRISH KATHPALIA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt31", meetingId: "251 256 78851", email: "cm.girishkathpalia.dhc@gov.in", displayOrder: 31 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 32", bench: "", judgeName: "HON'BLE Mr. JUSTICE ASHUTOSH KUMAR", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt32", meetingId: "251 256 78852", email: "cm.ashutoshkumar.dhc@gov.in", displayOrder: 32 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 33", bench: "", judgeName: "HON'BLE Mr. JUSTICE RAVINDER DUDEJA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt33", meetingId: "251 256 78853", email: "cm.ravinderdudeja.dhc@gov.in", displayOrder: 33 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 34", bench: "", judgeName: "HON'BLE Ms. JUSTICE TARA VITASTA GANJU", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt34", meetingId: "251 256 78854", email: "cm.taravitasta.dhc@gov.in", displayOrder: 34 },
  { courtId: "delhi-high-court", courtName: "Delhi High Court", courtRoom: "Court Room 35", bench: "", judgeName: "HON'BLE Mr. JUSTICE SUDHIR KUMAR JAIN", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcvirtualcourt35", meetingId: "251 256 78855", email: "cm.sudhirjain.dhc@gov.in", displayOrder: 35 },

  // --- Delhi High Court — Registrar Court (13 judges) ---
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 1", bench: "Registrar", judgeName: "REGISTRAR Mr. NITIN KUMAR", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar1", meetingId: "251 256 78861", email: "registrar.nitin.dhc@gov.in", displayOrder: 1 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 2", bench: "Registrar", judgeName: "REGISTRAR Mr. RAJESH KUMAR GUPTA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar2", meetingId: "251 256 78862", email: "registrar.rajesh.dhc@gov.in", displayOrder: 2 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 3", bench: "Registrar", judgeName: "REGISTRAR Mr. SUNIL SHARMA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar3", meetingId: "251 256 78863", email: "registrar.sunil.dhc@gov.in", displayOrder: 3 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 4", bench: "Registrar", judgeName: "REGISTRAR Mrs. ANITA SINGHAL", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar4", meetingId: "251 256 78864", email: "registrar.anita.dhc@gov.in", displayOrder: 4 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 5", bench: "Registrar", judgeName: "REGISTRAR Mr. VIKAS AGGARWAL", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar5", meetingId: "251 256 78865", email: "registrar.vikas.dhc@gov.in", displayOrder: 5 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 6", bench: "Registrar", judgeName: "REGISTRAR Mr. PANKAJ KUMAR", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar6", meetingId: "251 256 78866", email: "registrar.pankaj.dhc@gov.in", displayOrder: 6 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 7", bench: "Registrar", judgeName: "REGISTRAR Ms. NEHA CHOPRA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar7", meetingId: "251 256 78867", email: "registrar.neha.dhc@gov.in", displayOrder: 7 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 8", bench: "Registrar", judgeName: "REGISTRAR Mr. DEEPAK YADAV", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar8", meetingId: "251 256 78868", email: "registrar.deepak.dhc@gov.in", displayOrder: 8 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 9", bench: "Registrar", judgeName: "REGISTRAR Ms. PRIYA MALHOTRA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar9", meetingId: "251 256 78869", email: "registrar.priya.dhc@gov.in", displayOrder: 9 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 10", bench: "Registrar", judgeName: "REGISTRAR Mr. AMIT KUMAR SINGH", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar10", meetingId: "251 256 78870", email: "registrar.amit.dhc@gov.in", displayOrder: 10 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 11", bench: "Registrar", judgeName: "REGISTRAR Mr. SANDEEP MITTAL", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar11", meetingId: "251 256 78871", email: "registrar.sandeep.dhc@gov.in", displayOrder: 11 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 12", bench: "Registrar", judgeName: "REGISTRAR Mrs. MEENAKSHI DUTTA", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar12", meetingId: "251 256 78872", email: "registrar.meenakshi.dhc@gov.in", displayOrder: 12 },
  { courtId: "delhi-high-court-registrar", courtName: "Delhi High Court Registrar", courtRoom: "Registrar Court Room 13", bench: "Registrar", judgeName: "REGISTRAR Mr. KARAN THAKKAR", vcLink: "https://dhcvirtualcourt.webex.com/meet/dhcregistrar13", meetingId: "251 256 78873", email: "registrar.karan.dhc@gov.in", displayOrder: 13 },
];

function getMongoUri() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "true") {
    console.error("CRITICAL SAFETY ERROR: Seed script execution blocked in production mode. Set ALLOW_PROD_SEED=true to override.");
    process.exit(1);
  }
  return (
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/lawyer2lawyer"
  );
}

async function seedJudgeDirectory() {
  const JudgeDirectory = require("./models/JudgeDirectory");

  // Prepare idempotent bulkWrite operations
  // $setOnInsert ensures existing records are NEVER modified
  const ops = judgeDirectoryData.map((j) => ({
    updateOne: {
      filter: {
        courtId: j.courtId,
        courtRoom: j.courtRoom,
        judgeName: j.judgeName,
      },
      update: {
        $setOnInsert: {
          courtId: j.courtId,
          courtName: j.courtName,
          courtRoom: j.courtRoom,
          bench: j.bench || "",
          judgeName: j.judgeName,
          vcLink: j.vcLink,
          meetingId: j.meetingId,
          email: j.email || "",
          displayOrder: j.displayOrder,
          status: "published",
          publishedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  const chunkSize = 100;
  let insertedCount = 0;

  for (let i = 0; i < ops.length; i += chunkSize) {
    const chunk = ops.slice(i, i + chunkSize);
    const result = await JudgeDirectory.bulkWrite(chunk, { ordered: false });

    // upsertedCount tells us exactly how many new documents were inserted
    insertedCount += result.upsertedCount || 0;
  }

  // Skipped = total dataset - actually inserted
  const skippedCount = ops.length - insertedCount;

  return { inserted: insertedCount, skipped: skippedCount, total: judgeDirectoryData.length };
}

async function main() {
  const mongoUri = getMongoUri();

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected.\n");

  try {
    const result = await seedJudgeDirectory();

    console.log("========================================");
    console.log("  JudgeDirectory Seed Complete");
    console.log("========================================");
    console.log(`  Total records in dataset : ${result.total}`);
    console.log(`  Inserted (new records)   : ${result.inserted}`);
    console.log(`  Skipped (already exist)  : ${result.skipped}`);
    console.log("========================================\n");
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });

