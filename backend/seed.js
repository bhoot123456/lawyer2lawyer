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
  return (
    process.env.MONGO_URI ||
    "mongodb://bhoot:Bhoot12345@ac-njunkjf-shard-00-00.mouehnw.mongodb.net:27017,ac-njunkjf-shard-00-01.mouehnw.mongodb.net:27017,ac-njunkjf-shard-00-02.mouehnw.mongodb.net:27017/lawyer2lawyer?ssl=true&replicaSet=atlas-11efb8-shard-0&authSource=admin&appName=Cluster0"
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
  const existingTribunals = await Tribunal.findOne({});
  if (existingTribunals) return;

  const tribunals = require("./data/tribunals");
  await Tribunal.insertMany(tribunals);
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
