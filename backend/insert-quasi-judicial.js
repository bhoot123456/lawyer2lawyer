/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  INSERT-ONLY — Quasi-Judicial Authorities
 *  Lawyer2Lawyer Application
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  ZERO-TOUCH INSERTION SCRIPT
 *  — Loads ONLY new quasi-judicial records from data/quasi-judicial-authorities.js
 *  — Checks existence by sourceId (findOne)
 *  — If EXISTS: SKIP  (does NOT call findByIdAndUpdate, updateOne, updateMany)
 *  — If NEW:     INSERT (Tribunal.create only)
 *  — No deleteMany, no updateMany, no bulkWrite updates
 *  — Reports BEFORE count, AFTER count, inserted, skipped, modified=0, deleted=0
 *
 *  This script does NOT modify existing data files (tribunals.js,
 *  tribunals-delhi-expanded.js). It is run standalone.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Tribunal = require("./models/Tribunal");
const newAuthorities = require("./data/quasi-judicial-authorities");

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

async function main() {
  const mongoUri = getMongoUri();
  await mongoose.connect(mongoUri);
  console.log("Connected to:", mongoose.connection.host);
  console.log("Database:", mongoose.connection.name);

  // ── PHASE 0: Snapshot BEFORE ──────────────────────────────────────────
  const beforeCount = await Tribunal.countDocuments();
  console.log("\nBefore insertion — total records:", beforeCount);

  const beforeById = await Tribunal.find({}, { _id: 1, sourceId: 1, name: 1, sourceUrl: 1 }).lean();
  const beforeByIdMap = new Map(beforeById.map(r => [String(r._id), {
    sourceId: r.sourceId,
    name: r.name,
    sourceUrl: r.sourceUrl,
  }]));
  console.log("Before insertion — captured snapshot of", beforeByIdMap.size, "records by _id");

  // ── Phase 1: Validate new records against existing sourceIds/names ────
  console.log("\n=== VALIDATION ===\n");

  // Collect existing sourceIds (non-empty only)
  const existingSourceIds = new Set(
    beforeById.filter(r => r.sourceId).map(r => r.sourceId)
  );
  // Collect existing names (case-insensitive for duplicate name check)
  const existingNames = new Set(
    beforeById.map(r => String(r.name || "").toLowerCase())
  );

  console.log("Existing non-empty sourceIds:", existingSourceIds.size);
  console.log("Existing names:", existingNames.size);

  // Check each new record for conflicts
  let conflicts = 0;
  for (const rec of newAuthorities) {
    const sid = rec.sourceId || "";
    const normName = String(rec.name || "").toLowerCase();
    const sidConflict = sid && existingSourceIds.has(sid);
    const nameConflict = existingNames.has(normName);
    if (sidConflict || nameConflict) {
      conflicts++;
      console.log("  CONFLICT: \"" + rec.name + "\" (sourceId: " + sid + ")");
      if (sidConflict) console.log("    — sourceId already exists: \"" + sid + "\"");
      if (nameConflict) console.log("    — name already exists (case-insensitive)");
    }
  }
  console.log("\nConflicts found:", conflicts);

  // Check for duplicate sourceIds WITHIN new records
  const newSourceIdCounts = {};
  newAuthorities.forEach(r => {
    const sid = r.sourceId || "";
    if (sid) newSourceIdCounts[sid] = (newSourceIdCounts[sid] || 0) + 1;
  });
  const newDupes = Object.entries(newSourceIdCounts).filter(([_, c]) => c > 1);
  console.log("Duplicate sourceIds within new records:", newDupes.length);
  newDupes.forEach(([sid, c]) => console.log("  \"" + sid + "\": " + c));

  // Check for duplicate names WITHIN new records
  const newNames = {};
  newAuthorities.forEach(r => {
    const n = String(r.name || "").toLowerCase();
    newNames[n] = (newNames[n] || 0) + 1;
  });
  const newNameDupes = Object.entries(newNames).filter(([_, c]) => c > 1);
  console.log("Duplicate names within new records:", newNameDupes.length);

  // ── Phase 2: INSERT-ONLY loop ─────────────────────────────────────────
  console.log("\n=== INSERTION ===\n");

  let inserted = 0;
  let skipped = 0;
  const insertedIds = [];

  for (const rec of newAuthorities) {
    const sid = rec.sourceId || "";

    // Safety: skip records without sourceId
    if (!sid) {
      console.log("  SKIP: \"" + rec.name + "\" — no sourceId");
      skipped++;
      continue;
    }

    // Check existence by sourceId ONLY (findOne — never update)
    const existing = await Tribunal.findOne({ sourceId: sid });

    if (existing) {
      console.log("  SKIP: \"" + rec.name + "\" (sourceId: " + sid + ") — already exists in DB, NOT updating");
      skipped++;
      continue;
    }

    // Also check by name (case-insensitive exact match) — if found, skip
    const existingByName = await Tribunal.findOne({
      name: { $regex: "^" + rec.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", $options: "i" },
    });

    if (existingByName) {
      console.log("  SKIP: \"" + rec.name + "\" (sourceId: " + sid + ") — name already exists in DB, NOT updating");
      skipped++;
      continue;
    }

    // INSERT only — create new
    try {
      const created = await Tribunal.create(rec);
      console.log("  INSERT: \"" + rec.name + "\" (sourceId: " + sid + ") — _id: " + created._id);
      inserted++;
      insertedIds.push(String(created._id));
    } catch (err) {
      console.error("  ERROR: \"" + rec.name + "\":", err.message);
      skipped++;
    }
  }

  // ── Phase 3: Snapshot AFTER ───────────────────────────────────────────
  const afterCount = await Tribunal.countDocuments();
  console.log("\nAfter insertion — total records:", afterCount);

  // Capture all _ids after insertion
  const afterAll = await Tribunal.find({}, { _id: 1, sourceId: 1, name: 1, sourceUrl: 1 }).lean();

  // ── Phase 4: VERIFY zero-touch ────────────────────────────────────────
  console.log("\n=== VALIDATION REPORT ===\n");

  // 1. Count verification
  console.log("Total records before:", beforeCount);
  console.log("Total records after:", afterCount);
  console.log("Number inserted:", inserted);
  console.log("Number skipped:", skipped);

  // 2. Verify NO existing record was modified
  // Compare snapshots by _id
  let modifiedCount = 0;
  const afterById = new Map(afterAll.map(r => [String(r._id), {
    sourceId: r.sourceId,
    name: r.name,
    sourceUrl: r.sourceUrl,
  }]));

  for (const [id, beforeRec] of beforeByIdMap) {
    const afterRec = afterById.get(id);
    if (afterRec) {
      if (JSON.stringify(beforeRec) !== JSON.stringify(afterRec)) {
        modifiedCount++;
        console.log("  MODIFIED: _id=" + id + " — \"" + beforeRec.name + "\"");
        console.log("    Before:", JSON.stringify(beforeRec));
        console.log("    After:", JSON.stringify(afterRec));
      }
    }
  }
  console.log("Existing records modified:", modifiedCount, "(MUST BE 0)");

  // 3. Verify NO records were deleted
  let deletedCount = 0;
  for (const [id] of beforeByIdMap) {
    if (!afterById.has(id)) {
      deletedCount++;
      console.log("  DELETED: _id=" + id + " — \"" + beforeByIdMap.get(id).name + "\"");
    }
  }
  console.log("Records deleted:", deletedCount, "(MUST BE 0)");

  // 4. Duplicate sourceIds in DB (after)
  const allSourceIds = afterAll.map(r => r.sourceId || "");
  const sourceIdCounts = {};
  allSourceIds.forEach(sid => { sourceIdCounts[sid] = (sourceIdCounts[sid] || 0) + 1; });
  const dbDupes = Object.entries(sourceIdCounts).filter(([_, c]) => c > 1);
  console.log("Duplicate sourceIds in DB:", dbDupes.length);
  dbDupes.forEach(([sid, c]) => console.log("  \"" + sid + "\": " + c + " records"));

  // 5. Duplicate normalized names in DB (after)
  const allNames = allSourceIds.length;
  const nameCounts = {};
  afterAll.forEach(r => {
    const n = String(r.name || "").toLowerCase();
    nameCounts[n] = (nameCounts[n] || 0) + 1;
  });
  const dbNameDupes = Object.entries(nameCounts).filter(([_, c]) => c > 1);
  console.log("Duplicate names in DB:", dbNameDupes.length);
  dbNameDupes.forEach(([n, c]) => console.log("  \"" + n + "\": " + c));

  // 6. Records without sourceId
  const noSourceId = afterAll.filter(r => !r.sourceId).length;
  console.log("Records without sourceId:", noSourceId);

  // 7. Records without official source URL
  const noSourceUrl = afterAll.filter(r => !r.sourceUrl || r.sourceUrl === "").length;
  console.log("Records without official source URL:", noSourceUrl);

  // 8. New records in DB
  const newInDb = afterAll.filter(r => insertedIds.includes(String(r._id)));
  console.log("\nNew records successfully in DB:", newInDb.length);
  newInDb.forEach(r => {
    console.log("  - [" + r.sourceId + "] " + r.name + " — " + (r.sourceUrl || "(no URL)"));
  });

  await mongoose.disconnect();
  console.log("\nDisconnected.");
  console.log("\n=== DONE ===");
}

main().catch(e => {
  console.error("Fatal error:", e);
  mongoose.disconnect();
  process.exit(1);
});
