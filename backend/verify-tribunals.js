/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  TRIBUNALS VERIFICATION SCRIPT — Phase 7 & Phase 12
 *  Lawyer2Lawyer Application
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  This script does NOT modify data. It performs a read-only audit of the
 *  Tribunal collection in MongoDB and reports:
 *
 *  1. Total tribunal records
 *  2. Count by verificationStatus (verified / unverified / draft)
 *  3. Count by isActive (true / false)
 *  4. Count of records with missing/empty sourceId
 *  5. Count of records with missing name
 *  6. Duplicate sourceId detection (should be zero after idempotent seed)
 *  7. Sample of unverified records (names only)
 *
 *  Usage:
 *    npm run verify:tribunals
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Tribunal = require("./models/Tribunal");

function getMongoUri() {
  return (
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/lawyer2lawyer"
  );
}

async function verifyTribunals() {
  const tribunals = await Tribunal.find({}).lean();

  const report = {
    total: tribunals.length,
    byVerificationStatus: {
      verified: 0,
      unverified: 0,
      draft: 0,
      other: 0,
    },
    byIsActive: {
      true: 0,
      false: 0,
    },
    missingSourceId: 0,
    missingName: 0,
    duplicateSourceIds: [] /* array of sourceId strings */,
    unverifiedSamples: [] /* array of names */,
  };

  // Count by verificationStatus
  const statusCounts = {};
  for (const t of tribunals) {
    const status = t.verificationStatus || "unverified";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    if (status === "verified") report.byVerificationStatus.verified++;
    else if (status === "unverified") report.byVerificationStatus.unverified++;
    else if (status === "draft") report.byVerificationStatus.draft++;
    else report.byVerificationStatus.other++;

    // isActive
    if (t.isActive) report.byIsActive.true++;
    else report.byIsActive.false++;

    // Missing sourceId
    if (!t.sourceId) report.missingSourceId++;

    // Missing name
    if (!t.name) report.missingName++;

    // Collect unverified samples (limit to 10)
    if (
      status === "unverified" &&
      report.unverifiedSamples.length < 10
    ) {
      report.unverifiedSamples.push(t.name || "(no name)");
    }
  }

  // Detect duplicate sourceIds
  const sourceIdMap = {};
  for (const t of tribunals) {
    const sid = t.sourceId || "";
    if (sid) {
      if (sourceIdMap[sid]) {
        sourceIdMap[sid]++;
      } else {
        sourceIdMap[sid] = 1;
      }
    }
  }
  for (const [sid, count] of Object.entries(sourceIdMap)) {
    if (count > 1) {
      report.duplicateSourceIds.push(`${sid} (x${count})`);
    }
  }

  // Print report
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("📋 TRIBUNALS DATABASE VERIFICATION REPORT");
  console.log("══════════════════════════════════════════════════════════\n");

  console.log(`  Total records              : ${report.total}`);
  console.log(
    `  Verified                   : ${report.byVerificationStatus.verified}`,
  );
  console.log(
    `  Unverified                 : ${report.byVerificationStatus.unverified}`,
  );
  console.log(`  Draft                      : ${report.byVerificationStatus.draft}`);
  console.log(`  Other status               : ${report.byVerificationStatus.other}`);
  console.log(
    `  Active (isActive=true)     : ${report.byIsActive.true}`,
  );
  console.log(
    `  Inactive (isActive=false)  : ${report.byIsActive.false}`,
  );
  console.log(
    `  Missing sourceId           : ${report.missingSourceId}`,
  );
  console.log(`  Missing name               : ${report.missingName}`);
  console.log(
    `  Duplicate sourceIds        : ${report.duplicateSourceIds.length}`,
  );

  if (report.duplicateSourceIds.length > 0) {
    console.log("\n  ⚠️  DUPLICATE sourceIds found:");
    report.duplicateSourceIds.forEach((d) =>
      console.log(`    - ${d}`),
    );
  }

  if (report.unverifiedSamples.length > 0) {
    console.log("\n  Sample unverified records:");
    report.unverifiedSamples.forEach((name) =>
      console.log(`    - ${name}`),
    );
  }

  // Check for any empty-name documents
  if (report.missingName > 0) {
    console.log(
      "\n  ⚠️  WARNING: Some records are missing the 'name' field!",
    );
  }

  console.log("\n══════════════════════════════════════════════════════════\n");

  return report;
}

async function run() {
  const mongoUri = getMongoUri();
  await mongoose.connect(mongoUri);
  console.log("[verify:tribunals] MongoDB connected");

  try {
    await verifyTribunals();
  } catch (err) {
    console.error("[verify:tribunals] Verification failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("[verify:tribunals] MongoDB disconnected");
  }
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[verify:tribunals] Fatal error:", err);
      process.exit(1);
    });
}

module.exports = { verifyTribunals };
