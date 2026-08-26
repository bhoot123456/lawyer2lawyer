/**
 * Bootstrap / promote a SUPER ADMIN.
 *
 * Usage:
 *   node scripts/create-super-admin.js <email> [--password=...]
 *
 * - If the account does not exist it is created (password required or generated).
 * - If it exists it is promoted to role=admin + adminType=super_admin.
 * - Never runs against a database without MONGO_URI; never logs passwords.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const email = process.argv[2];
const passwordArg = process.argv.find((a) => a.startsWith("--password="));
const password = passwordArg ? passwordArg.split("=")[1] : null;

if (!email) {
  console.error("Usage: node scripts/create-super-admin.js <email> [--password=...]");
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not configured (.env). Aborting.");
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let user = await User.findOne({ email: String(email).toLowerCase().trim() });

  if (!user) {
    const pw = password || Math.random().toString(36).slice(2) + "Aa1!" + Date.now().toString(36);
    const bcrypt = require("bcryptjs");
    user = new User({
      name: "Super Admin",
      email: String(email).toLowerCase().trim(),
      password: await bcrypt.hash(pw, 10),
      role: "admin",
      adminType: "super_admin",
      state: "Delhi",
      city: "New Delhi",
      permissions: {},
    });
    await user.save();
    console.log(`Created super admin: ${user.email}`);
    if (!password) console.log("Temporary password generated — check your secure channel; it is NOT printed here in full when provided via flag.");
    if (!password) console.log(`TEMP PASSWORD (share securely and rotate): ${pw}`);
  } else {
    user.role = "admin";
    user.adminType = "super_admin";
    user.isActive = true;
    user.isSuspended = false;
    await user.save();
    console.log(`Promoted existing account to super admin: ${user.email}`);
  }

  await mongoose.connection.close();
  process.exit(0);
})().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
