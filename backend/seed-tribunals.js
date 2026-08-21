/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  IDEMPOTENT TRIBUNALS SEED SCRIPT — Phase 7 Safe Seeding
 *  Lawyer2Lawyer Application
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Tribunal = require("./models/Tribunal");

// ── Load both data files ─────────────────────────────────────────────────
const baseTribunals = require("./data/tribunals");
const expandedTribunals = require("./data/tribunals-delhi-expanded");

// Merge: base first, then expanded
const allTribunals = [...baseTribunals, ...expandedTribunals];

// ── Mongo URI ────────────────────────────────────────────────────────────
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

// ── Generate a stable sourceId from the tribunal name ───────────────────
function makeSourceId(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Enrich a record with defaults for verification metadata ──────────────
function enrichRecord(record) {
  const sourceId = record.sourceId || makeSourceId(record.name);
  let verificationStatus = record.verificationStatus || "unverified";
  let sourceName = record.sourceName || "";
  let sourceUrl = record.sourceUrl || "";
  let sourceType = record.sourceType || "";
  let dataSource = record.dataSource || "";
  const dataVersion = record.dataVersion || "1.0";

  // For base tribunals (records without explicit sourceId), mark as verified
  // since they were part of the original verified dataset.
  const isBaseRecord = !record.sourceId && baseTribunals.some((r) => r.name === record.name);
  if (isBaseRecord) {
    verificationStatus = "verified";
    if (!sourceName) sourceName = "Lawyer2Lawyer Legal Database";
    if (!sourceType) sourceType = "manual";
    if (!dataSource) dataSource = "lawyer2lawyer-database";
  }

  return {
    ...record,
    sourceId,
    sourceName,
    sourceUrl,
    sourceType,
    verificationStatus,
    dataSource,
    dataVersion,
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Main seed function ───────────────────────────────────────────────────
async function seedTribunals() {
  const stats = {
    total: allTribunals.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    unverified: 0,
    duplicatesPrevented: 0,
    errors: 0,
  };

  // Check for duplicate sourceIds WITHIN the seed data itself
  const sourceIdCounts = {};
  for (const record of allTribunals) {
    const sid = record.sourceId
      ? record.sourceId
      : makeSourceId(record.name);
    sourceIdCounts[sid] = (sourceIdCounts[sid] || 0) + 1;
  }

  for (const [sid, count] of Object.entries(sourceIdCounts)) {
    if (count > 1) {
      stats.duplicatesPrevented += count;
      console.warn(
        `[seed:tribunals] ⚠ DUPLICATE sourceId in seed data: "${sid}" (x${count}). All but the first will be skipped.`,
      );
    }
  }

  // Process each tribunal record
  const seenSourceIds = new Set();

  for (const record of allTribunals) {
    const enriched = enrichRecord(record);
    const sourceId = enriched.sourceId;

    // Skip if we've already seen this sourceId in the seed data (in-file dedup)
    if (seenSourceIds.has(sourceId)) {
      stats.skipped += 1;
      stats.duplicatesPrevented += 1;
      console.log(
        `[seed:tribunals] ⏭ Skipping duplicate in seed data: "${record.name}" (sourceId: ${sourceId})`,
      );
      continue;
    }
    seenSourceIds.add(sourceId);

    try {
      // Stage 1: Try to match by sourceId (for re-runs)
      let existing = await Tribunal.findOne({ sourceId });

      // Stage 2: Fall back to matching by name (for old documents without sourceId)
      if (!existing && record.name) {
        existing = await Tribunal.findOne({
          name: { $regex: `^${escapeRegex(record.name)}$`, $options: "i" },
        });
      }

      if (existing) {
        const updates = { ...enriched };
        delete updates._id;
        await Tribunal.findByIdAndUpdate(existing._id, updates, {
          new: true,
          runValidators: false,
        });
        stats.updated += 1;
        if (enriched.verificationStatus === "unverified") {
          stats.unverified += 1;
        }
        console.log(`[seed:tribunals] ✓ Updated: "${record.name}" (sourceId: ${sourceId})`);
      } else {
        await Tribunal.create(enriched);
        stats.inserted += 1;
        if (enriched.verificationStatus === "unverified") {
          stats.unverified += 1;
        }
        console.log(`[seed:tribunals] ➕ Inserted: "${record.name}" (sourceId: ${sourceId})`);
      }
    } catch (err) {
      stats.errors += 1;
      console.error(`[seed:tribunals] ✗ ERROR for "${record.name}":`, err.message);
    }
  }

  return stats;
}

// ── Runner ───────────────────────────────────────────────────────────────
async function run() {
  const mongoUri = getMongoUri();
  await mongoose.connect(mongoUri);
  console.log("[seed:tribunals] MongoDB connected");

  try {
    const stats = await seedTribunals();
    console.log("\n══════════════════════════════════════════════════════════");
    console.log("📊 TRIBUNALS SEED REPORT");
    console.log("══════════════════════════════════════════════════════════");
    console.log(`  Total records in seed data : ${stats.total}`);
    console.log(`  Inserted                   : ${stats.inserted}`);
    console.log(`  Updated                    : ${stats.updated}`);
    console.log(`  Skipped                    : ${stats.skipped}`);
    console.log(`  Unverified                 : ${stats.unverified}`);
    console.log(`  Duplicates prevented       : ${stats.duplicatesPrevented}`);
    console.log(`  Errors                     : ${stats.errors}`);
    console.log("══════════════════════════════════════════════════════════\n");
  } finally {
    await mongoose.disconnect();
    console.log("[seed:tribunals] MongoDB disconnected");
  }
}

// Export for use by seed.js
module.exports = { seedTribunals, makeSourceId };

// Run if called directly
if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed:tribunals] Fatal error:", err);
      process.exit(1);
    });
}
