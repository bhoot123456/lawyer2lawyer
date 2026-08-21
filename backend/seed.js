const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/User");
const Tribunal = require("./models/Tribunal");

const lawyers = [
  {
    name: "Advocate Rakesh Sharma",
    email: "rakesh@lawyer2lawyer.app",
    password: "Password123",
    role: "lawyer",
    state: "Haryana",
    city: "Gurgaon",
    specialization: "Family Law",
    phone: "+91 98100 12345",
    about: "Experienced lawyer specializing in family and civil matters.",
  },
  {
    name: "Advocate Neha Gupta",
    email: "neha@lawyer2lawyer.app",
    password: "Password123",
    role: "lawyer",
    state: "Delhi",
    city: "New Delhi",
    specialization: "Criminal Law",
    phone: "+91 98100 54321",
    about: "Criminal defense specialist with 8+ years of experience.",
  },
  {
    name: "Advocate Priya Singh",
    email: "priya@lawyer2lawyer.app",
    password: "Password123",
    role: "lawyer",
    state: "Uttar Pradesh",
    city: "Noida",
    specialization: "Corporate Law",
    phone: "+91 98100 67890",
    about: "Corporate and business law advisor for startups and SMEs.",
  },
  {
    name: "Advocate Amit Trivedi",
    email: "amit@lawyer2lawyer.app",
    password: "Password123",
    role: "lawyer",
    state: "Gujarat",
    city: "Ahmedabad",
    specialization: "Property Law",
    phone: "+91 98250 12345",
    about: "Real estate, title diligence, and property dispute counsel.",
  },
  {
    name: "Advocate Meera Shah",
    email: "meera@lawyer2lawyer.app",
    password: "Password123",
    role: "lawyer",
    state: "Gujarat",
    city: "Surat",
    specialization: "Business Law",
    phone: "+91 98250 54321",
    about: "Business contracts, company advisory, and commercial disputes.",
  },
  {
    name: "Advocate Arjun Verma",
    email: "arjun@lawyer2lawyer.app",
    password: "Password123",
    role: "lawyer",
    state: "Madhya Pradesh",
    city: "Indore",
    specialization: "Civil Law",
    phone: "+91 98260 12345",
    about: "Civil litigation and consumer matter specialist in Indore.",
  },
  {
    name: "Advocate Kavita Jain",
    email: "kavita@lawyer2lawyer.app",
    password: "Password123",
    role: "lawyer",
    state: "Madhya Pradesh",
    city: "Bhopal",
    specialization: "Family Law",
    phone: "+91 98260 54321",
    about: "Family law, mediation, and matrimonial dispute counsel.",
  },
  {
    name: "Advocate Siddharth Rao",
    email: "siddharth@lawyer2lawyer.app",
    password: "Password123",
    role: "lawyer",
    state: "Maharashtra",
    city: "Mumbai",
    specialization: "Corporate Law",
    phone: "+91 98200 12345",
    about: "Corporate advisory, compliance, and transaction support.",
  },
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

async function seedLawyers() {
  for (const lawyer of lawyers) {
    const hashedPassword = await bcrypt.hash(lawyer.password, 10);

    // Upsert by unique email to avoid duplicate-key errors
    await User.updateOne(
      { email: lawyer.email },
      {
        $set: {
          name: lawyer.name,
          email: lawyer.email,
          role: lawyer.role,
          state: lawyer.state,
          city: lawyer.city,
          specialization: lawyer.specialization,
          phone: lawyer.phone,
          about: lawyer.about,
          password: hashedPassword,
        },
      },
      { upsert: true },
    );
  }
}

async function seedTribunals() {
  // Delegate to the dedicated idempotent seed-tribunals.js module.
  // This ensures: no duplicates, backward-compatible upsert, and
  // comprehensive reporting (Inserted / Updated / Skipped / Unverified / Errors).
  const { seedTribunals: seedTribunalsIdempotent } = require("./seed-tribunals");
  const stats = await seedTribunalsIdempotent();

  console.log("══════════════════════════════════════════════════════════");
  console.log("📊 TRIBUNALS SEED REPORT");
  console.log("══════════════════════════════════════════════════════════");
  console.log(`  Total records in seed data : ${stats.total}`);
  console.log(`  Inserted                   : ${stats.inserted}`);
  console.log(`  Updated                    : ${stats.updated}`);
  console.log(`  Skipped                    : ${stats.skipped}`);
  console.log(`  Unverified                 : ${stats.unverified}`);
  console.log(`  Duplicates prevented       : ${stats.duplicatesPrevented}`);
  console.log(`  Errors                     : ${stats.errors}`);
  console.log("══════════════════════════════════════════════════════════");
}

async function seedBareActs() {
  const BareAct = require("./models/BareAct");
  const bareActs = require("./data/bareActs");

  // Idempotent upsert using slug
  const ops = bareActs.map((act) => {
    const actName = act.actName || "";
    const year = act.year || "";
    const slugBase = `${actName}::${year}`;
    const slug = String(slugBase)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-()]/g, "");

    return {
      updateOne: {
        filter: { slug },
        update: {
          $set: {
            slug,
            title: act.title,
            actName: act.actName,
            shortName: act.shortName,
            year: act.year,
            category: act.category,
            ministry: act.ministry,
            keywords: act.keywords,
            language: Array.isArray(act.language) ? act.language[0] : act.language || "English",
            pdfUrl: act.pdfUrl,
            isPopular: !!act.isPopular,
            isNewLaw: !!act.isNewLaw,

            // Admin CRUD compatibility
            content: act.content || "",
            jurisdiction: act.jurisdiction,
            tags: act.tags,
          },
          $setOnInsert: {
            status: "published",
          },
        },
        upsert: true,
      },
    };
  });

  // Avoid huge bulkWrite payload
  const chunkSize = 500;
  for (let i = 0; i < ops.length; i += chunkSize) {
    const chunk = ops.slice(i, i + chunkSize);
    await BareAct.bulkWrite(chunk, { ordered: false });
  }
}

/**
 * Seed JudgeDirectory with data migrated from the old static JUDGES object
 * used in regular-court.tsx. Idempotent — uses upsert by (courtId, courtRoom, judgeName).
 * Will never create duplicates or overwrite existing records.
 */
async function seedJudgeDirectory() {
  const JudgeDirectory = require("./models/JudgeDirectory");

  const judgesData = [
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
  ];

  // Idempotent upsert using (courtId, courtRoom, judgeName) as composite key
  const ops = judgesData.map((j) => ({
    updateOne: {
      filter: { courtId: j.courtId, courtRoom: j.courtRoom, judgeName: j.judgeName },
      update: {
        $set: {
          ...j,
          status: "published",
          publishedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  // Bulk write in chunks
  const chunkSize = 100;
  for (let i = 0; i < ops.length; i += chunkSize) {
    const chunk = ops.slice(i, i + chunkSize);
    await JudgeDirectory.bulkWrite(chunk, { ordered: false });
  }

  console.log("JudgeDirectory seeded with", judgesData.length, "entries (idempotent upsert).");
}

async function seed() {
  const mongoUri = getMongoUri();

  await mongoose.connect(mongoUri);

  try {
    const existingLawyer = await User.findOne({ role: "lawyer" });

    // If no lawyers exist yet, seed them.
    // (Tribunals are seeded independently.)
    if (!existingLawyer) {
      await seedLawyers();
    }

    await seedTribunals();
    await seedBareActs();
    await seedJudgeDirectory();

    console.log("Seed data inserted/updated successfully.");
  } finally {
    await mongoose.disconnect();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });

