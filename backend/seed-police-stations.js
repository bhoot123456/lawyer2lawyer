/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  IDEMPOTENT DELHI POLICE TERRITORIAL STATION SEED SCRIPT
 *  Lawyer2Lawyer Application
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  USAGE:
 *    node seed-police-stations.js --dry-run     # validate + report, ZERO DB writes
 *    node seed-police-stations.js               # validate then idempotent upsert
 *    node seed-police-stations.js --verify-only # post-seed verification (read-only)
 *
 *  SAFETY GUARANTEES:
 *    • NEVER runs deleteMany({}) — no collection/data deletion, ever.
 *    • Validates every record BEFORE any database write.  If validation fails,
 *      the script STOPS and MongoDB is NOT modified.
 *    • Idempotent — uses bulkWrite with upsert:true keyed on a stable identity
 *      (normalized station name + district).
 *    • Only the PoliceStation collection is touched.  No other collection is
 *      modified.
 *    • Never prints secrets (MONGO_URI, JWT_SECRET, OPENROUTER_API_KEY, etc.).
 *    • Never fabricates station data.  Unverified fields are null.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const PoliceStation = require("./models/PoliceStation");
const policeStations = require("./data/delhi-police-stations");
const { VALID_STATUS } = require("./validation/policeStationValidation");

const VERIFIED_DISTRICTS = Array.from(policeStations.VERIFIED_DISTRICTS || []);

// ── Allowed schema fields (schema compatibility check) ───────────────────
const ALLOWED_TOP_LEVEL = new Set([
  "name", "district", "subdivision", "type", "address", "pinCode", "phone",
  "email", "sho", "location", "source", "lastVerified", "sourceUrl",
  "status", "isFeatured", "isActive", "displayOrder",
]);
const ALLOWED_SHO = new Set(["name", "rank", "phone", "email", "address"]);
const ALLOWED_LOCATION = new Set(["latitude", "longitude"]);

const VALID_TYPE = new Set([
  "Police Station", "Thana", "Detective Unit", "Sub-Divisional Special Unit",
]);
const SOURCE_REGEX = /^https?:\/\/.+/i;

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const isNullish = (v) => v === null || v === undefined || v === "";

// ── Name normalization ────────────────────────────────────────────────────
function normalizeDisplayName(name) {
  let n = String(name == null ? "" : name).trim().replace(/\s+/g, " ");
  n = n.replace(/^P\.?\s?S\.?\s+/i, "PS ");
  n = n.replace(/^PS\s+PS\s+/i, "PS ");
  n = n.replace(/\.+$/g, "").trim();
  return n;
}

function normalizeIdentity(name, district) {
  const n = normalizeDisplayName(name).toLowerCase();
  const d = String(district || "").trim().toLowerCase();
  return n + "|" + d;
}

// ── Date helper ──────────────────────────────────────────────────────────
function toDate(value) {
  if (isNullish(value)) return { ok: true, value: null };
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return { ok: false };
  return { ok: true, value: d };
}

function getMongoUri() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "true") {
    console.error("CRITICAL SAFETY ERROR: Seed script execution blocked in production mode. Set ALLOW_PROD_SEED=true to override.");
    process.exit(1);
  }
  return process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lawyer2lawyer";
}

// ── Validation ────────────────────────────────────────────────────────────
function validateRecord(raw, index) {
  const errors = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: ["record[" + index + "] must be an object"] };
  }

  for (const key of Object.keys(raw)) {
    if (!ALLOWED_TOP_LEVEL.has(key)) {
      errors.push('record[' + index + '] unknown field "' + key + '" (not in PoliceStation schema)');
    }
  }

  const name = normalizeDisplayName(raw.name);
  if (!isNonEmptyString(raw.name)) {
    errors.push("record[" + index + "] name is required");
  }

  const district = String(raw.district || "").trim();
  if (!isNonEmptyString(raw.district)) {
    errors.push("record[" + index + "] district is required");
  } else if (VERIFIED_DISTRICTS.length > 0 && !VERIFIED_DISTRICTS.includes(district)) {
    errors.push('record[' + index + '] district "' + district + '" is not in the verified district list: ' + VERIFIED_DISTRICTS.join(", "));
  }

  if (raw.type !== undefined && !isNullish(raw.type)) {
    if (!VALID_TYPE.has(String(raw.type).trim())) {
      errors.push('record[' + index + '] invalid type "' + raw.type + '"');
    }
  }

  if (raw.status !== undefined && !isNullish(raw.status)) {
    if (!VALID_STATUS.has(raw.status)) {
      errors.push('record[' + index + '] invalid status "' + raw.status + '"');
    }
  }

  if (raw.isActive !== undefined && typeof raw.isActive !== "boolean") {
    errors.push("record[" + index + "] isActive must be a boolean");
  }
  if (raw.isFeatured !== undefined && typeof raw.isFeatured !== "boolean") {
    errors.push("record[" + index + "] isFeatured must be a boolean");
  }

  if (raw.displayOrder !== undefined && !isNullish(raw.displayOrder)) {
    const n = Number(raw.displayOrder);
    if (!Number.isFinite(n) || n < 0) {
      errors.push("record[" + index + "] displayOrder must be a non-negative number");
    }
  }

  for (const field of ["subdivision", "address", "pinCode", "phone", "email", "source", "sourceUrl"]) {
    if (raw[field] !== undefined && !isNullish(raw[field]) && typeof raw[field] !== "string") {
      errors.push("record[" + index + "] " + field + " must be a string or null");
    }
  }

  const source = String(raw.source || "").trim();
  if (isNullish(raw.source)) {
    errors.push("record[" + index + "] source is required (never fabricate; use evidenced source only)");
  }

  if (!isNullish(raw.sourceUrl)) {
    if (!SOURCE_REGEX.test(String(raw.sourceUrl).trim())) {
      errors.push("record[" + index + "] sourceUrl must be a valid http(s) URL or null");
    }
  }

  const dateCheck = toDate(raw.lastVerified);
  if (!dateCheck.ok) {
    errors.push("record[" + index + "] lastVerified must be a valid date or null");
  }

  if (raw.sho !== undefined && !isNullish(raw.sho)) {
    if (typeof raw.sho !== "object" || Array.isArray(raw.sho)) {
      errors.push("record[" + index + "] sho must be an object or null");
    } else {
      for (const key of Object.keys(raw.sho)) {
        if (!ALLOWED_SHO.has(key)) errors.push("record[" + index + "] sho has unknown field \"" + key + "\"");
      }
      for (const f of ["name", "rank", "phone", "email", "address"]) {
        if (raw.sho[f] !== undefined && !isNullish(raw.sho[f]) && typeof raw.sho[f] !== "string") {
          errors.push("record[" + index + "] sho." + f + " must be a string or null");
        }
      }
    }
  }

  if (raw.location !== undefined && !isNullish(raw.location)) {
    if (typeof raw.location !== "object" || Array.isArray(raw.location)) {
      errors.push("record[" + index + "] location must be an object or null");
    } else {
      for (const key of Object.keys(raw.location)) {
        if (!ALLOWED_LOCATION.has(key)) errors.push("record[" + index + "] location has unknown field \"" + key + "\"");
      }
      const ranges = [["latitude", 90], ["longitude", 180]];
      for (const pair of ranges) {
        const key = pair[0];
        const range = pair[1];
        if (raw.location[key] !== undefined && !isNullish(raw.location[key])) {
          const num = Number(raw.location[key]);
          if (!Number.isFinite(num) || num < -range || num > range) {
            errors.push("record[" + index + "] location." + key + " must be a number between -" + range + " and " + range);
          }
        }
      }
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true, record: raw };
}

// ── Dataset pre-check: duplicates ─────────────────────────────────────────
function detectDuplicates(validRecords) {
  const byName = new Map();
  const byNameDistrict = new Map();
  const dupNames = [];
  const dupNameDistricts = [];

  validRecords.forEach((r) => {
    const n = normalizeDisplayName(r.name).toLowerCase();
    const nk = n + "|" + String(r.district || "").trim().toLowerCase();

    if (byName.has(n)) dupNames.push({ name: r.name, firstIndex: byName.get(n) });
    else byName.set(n, r.name);

    if (byNameDistrict.has(nk)) dupNameDistricts.push({ name: r.name, district: r.district, firstIndex: byNameDistrict.get(nk) });
    else byNameDistrict.set(nk, r.name);
  });

  return { dupNames, dupNameDistricts };
}

// ── Build idempotent bulkWrite ops ────────────────────────────────────────
function buildBulkOps(validRecords) {
  const ops = [];
  const now = new Date();
  for (const r of validRecords) {
    const name = normalizeDisplayName(r.name);
    const district = String(r.district || "").trim();

    const set = {
      name: name,
      district: district,
      subdivision: r.subdivision === undefined ? null : (r.subdivision ?? null),
      type: r.type === undefined ? "Police Station" : (r.type || "Police Station"),
      address: r.address === undefined ? null : (r.address ?? null),
      pinCode: r.pinCode === undefined ? null : (r.pinCode ?? null),
      phone: r.phone === undefined ? null : (r.phone ?? null),
      email: r.email === undefined ? null : (r.email ?? null),
      sho: (r.sho && typeof r.sho === "object") ? r.sho : { name: null, rank: null, phone: null, email: null },
      location: (r.location && typeof r.location === "object") ? r.location : { latitude: null, longitude: null },
      source: String(r.source || "").trim() || "Delhi Police",
      lastVerified: r.lastVerified ? new Date(r.lastVerified) : null,
      sourceUrl: r.sourceUrl === undefined ? null : (r.sourceUrl ?? null),
      status: r.status === undefined ? "published" : (r.status || "published"),
      isFeatured: r.isFeatured === undefined ? false : !!r.isFeatured,
      isActive: r.isActive === undefined ? true : !!r.isActive,
      displayOrder: (r.displayOrder !== undefined && !isNullish(r.displayOrder)) ? Number(r.displayOrder) : 0,
      updatedAt: now,
    };

    ops.push({
      updateOne: {
        filter: { name: name, district: district },
        update: {
          $set: set,
          $setOnInsert: { createdAt: now },
        },
        upsert: true,
      },
    });
  }
  return ops;
}

// ── Post-seed verification (read-only) ────────────────────────────────────
async function verifyPoliceStations() {
  const checks = {
    total: await PoliceStation.countDocuments({}),

    byDistrict: await PoliceStation.aggregate([
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    bySubdivision: await PoliceStation.aggregate([
      { $match: { subdivision: { $ne: null, $ne: "" } } },
      { $group: { _id: "$subdivision", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    inactive: await PoliceStation.countDocuments({ isActive: false }),
    missingName: await PoliceStation.countDocuments({ $or: [{ name: null }, { name: "" }] }),
    missingDistrict: await PoliceStation.countDocuments({ $or: [{ district: null }, { district: "" }] }),
    missingSubdivision: await PoliceStation.countDocuments({ $or: [{ subdivision: null }, { subdivision: "" }] }),
    missingSource: await PoliceStation.countDocuments({ $or: [{ source: null }, { source: "" }] }),

    nullPhone: await PoliceStation.countDocuments({ $or: [{ phone: null }, { phone: "" }] }),
    nullEmail: await PoliceStation.countDocuments({ $or: [{ email: null }, { email: "" }] }),
    nullCoordinates: await PoliceStation.countDocuments({
      $or: [
        { "location.latitude": null },
        { "location.longitude": null },
        { "location.latitude": { $exists: false } },
        { "location.longitude": { $exists: false } },
      ],
    }),
  };

  checks.duplicateNames = await PoliceStation.aggregate([
    { $group: { _id: { $toLower: "$name" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  checks.duplicateNameDistrict = await PoliceStation.aggregate([
    {
      $group: {
        _id: { name: { $toLower: "$name" }, district: { $toLower: "$district" } },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  return checks;
}

function printVerification(checks, expectedCount) {
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("🔎 POST-SEED VERIFICATION");
  console.log("══════════════════════════════════════════════════════════");
  console.log("  Total stations                    : " + checks.total);
  console.log("  Verified data records             : " + expectedCount);

  console.log("\n  Stations by district:");
  (checks.byDistrict || []).forEach((d) => console.log("    " + (d._id || "(empty)") + ": " + d.count));

  console.log("\n  Stations by subdivision:");
  if (checks.bySubdivision && checks.bySubdivision.length) {
    checks.bySubdivision.forEach((s) => console.log("    " + s._id + ": " + s.count));
  } else {
    console.log("    (none)");
  }

  console.log("\n  Duplicate station names           : " + checks.duplicateNames.length);
  checks.duplicateNames.forEach((d) => console.log('    "' + d._id + '" x' + d.count));

  console.log("  Duplicate name+district           : " + checks.duplicateNameDistrict.length);
  checks.duplicateNameDistrict.forEach((d) =>
    console.log('    "' + d._id.name + '" / "' + d._id.district + '" x' + d.count),
  );

  console.log("  Inactive stations                 : " + checks.inactive);
  console.log("  Missing name                      : " + checks.missingName);
  console.log("  Missing district                  : " + checks.missingDistrict);
  console.log("  Missing subdivision (accepted)    : " + checks.missingSubdivision);
  console.log("  Missing source                    : " + checks.missingSource);
  console.log("  Records with null phone (accepted): " + checks.nullPhone);
  console.log("  Records with null email (accepted): " + checks.nullEmail);
  console.log("  Records with null GPS (accepted)  : " + checks.nullCoordinates);
  console.log("══════════════════════════════════════════════════════════\n");
}

// ── Main seed function ────────────────────────────────────────────────────
async function seedPoliceStations(options) {
  const dryRun = !!(options && options.dryRun);
  const mode = dryRun ? "DRY RUN (no DB writes)" : "SEED";
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("🏛  DELHI POLICE STATIONS — " + mode);
  console.log("══════════════════════════════════════════════════════════");

  console.log("  Official source            : Delhi Police RTI Manual (22.05.2026), delhipolice.gov.in");
  console.log("  Verified district count    : " + VERIFIED_DISTRICTS.length);
  console.log("  Subdivision count (data)   : " + policeStations.filter((r) => isNonEmptyString(r.subdivision)).length);
  console.log("  Station count (data)       : " + policeStations.length);
  console.log("  Expected territorial count : 179 (per official RTI Manual)");

  const validationResults = policeStations.map((r, i) => validateRecord(r, i));
  const invalid = validationResults.filter((v) => !v.ok);
  const validRecords = validationResults.filter((v) => v.ok).map((v) => v.record);

  const { dupNames, dupNameDistricts } = detectDuplicates(validRecords);

  console.log("  Duplicate name count       : " + dupNames.length);
  console.log("  Duplicate name+district    : " + dupNameDistricts.length);
  console.log("  Invalid records            : " + invalid.length);

  if (invalid.length || dupNames.length || dupNameDistricts.length) {
    console.log("\n  ❌ VALIDATION FAILED — Stopping. MongoDB was NOT modified.");
    if (invalid.length) {
      console.log("  Validation errors:");
      invalid.forEach((v, i) => {
        console.log("    " + (i + 1) + ". " + v.errors.join("; "));
      });
    }
    if (dupNames.length) {
      console.log("  Duplicate names: " + dupNames.map((d) => '"' + d.name + '"').join(", "));
    }
    if (dupNameDistricts.length) {
      console.log("  Duplicate name+district: " + dupNameDistricts.map((d) => '"' + d.name + '" / "' + d.district + '"').join(", "));
    }
    return { status: "failed", reason: "validation", inserted: 0, updated: 0, unchanged: 0, rejected: invalid.length };
  }

  if (validRecords.length === 0) {
    console.log("\n  ⚠  DATASET IS EMPTY.");
    console.log("  Authoritative Delhi Police station list could not be verified/extracted in this environment.");
    console.log("  No fabricated records were created.  Populate app/backend/data/delhi-police-stations.js");
    console.log("  from the official RTI Manual / Delhi Police directory, then re-run this script.\n");
    return { status: "empty", inserted: 0, updated: 0, unchanged: 0, rejected: 0 };
  }

  const stats = { inserted: 0, updated: 0, unchanged: 0, rejected: invalid.length };
  const bulkOps = buildBulkOps(validRecords);

  if (dryRun) {
    for (const op of bulkOps) {
      const found = await PoliceStation.findOne(op.updateOne.filter, { _id: 1 }).lean().catch(() => null);
      if (!found) stats.inserted += 1;
      else stats.updated += 1;
    }
    console.log("\n  DRY RUN COMPLETE — ZERO DATABASE WRITES.");
    console.log("  Records to insert            : " + stats.inserted);
    console.log("  Records to update            : " + stats.updated);
    console.log("  Records unchanged            : " + stats.unchanged);
    console.log("  Records rejected             : " + stats.rejected);
    return { ...stats, status: "dry-run" };
  }

  const chunkSize = 100;
  let insertedCount = 0;
  let updatedCount = 0;
  for (let i = 0; i < bulkOps.length; i += chunkSize) {
    const chunk = bulkOps.slice(i, i + chunkSize);
    const result = await PoliceStation.bulkWrite(chunk, { ordered: false });
    insertedCount += result.upsertedCount || 0;
    updatedCount += result.modifiedCount || 0;
  }
  stats.inserted = insertedCount;
  stats.updated = updatedCount;

  console.log("\n  ✅ SEED COMPLETE");
  console.log("  Inserted                   : " + stats.inserted);
  console.log("  Updated                    : " + stats.updated);
  console.log("  Unchanged / matched        : " + stats.unchanged);
  console.log("  Rejected                   : " + stats.rejected);

  const checks = await verifyPoliceStations();
  printVerification(checks, validRecords.length);

  if (checks.total !== validRecords.length) {
    console.log("  ⚠  DB count (" + checks.total + ") does NOT match verified data records (" + validRecords.length + ").");
  }

  return { ...stats, status: "seeded" };
}

// ── Runner ────────────────────────────────────────────────────────────────
async function run() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const verifyOnly = args.includes("--verify-only");

  if (verifyOnly) {
    await mongoose.connect(getMongoUri());
    console.log("[seed:police-stations] MongoDB connected (read-only verification)");
    const checks = await verifyPoliceStations();
    printVerification(checks, policeStations.length);
    await mongoose.disconnect();
    console.log("[seed:police-stations] MongoDB disconnected");
    return;
  }

  await mongoose.connect(getMongoUri());
  console.log("[seed:police-stations] MongoDB connected");

  try {
    await seedPoliceStations({ dryRun: dryRun });
  } finally {
    await mongoose.disconnect();
    console.log("[seed:police-stations] MongoDB disconnected");
  }
}

module.exports = { seedPoliceStations, verifyPoliceStations, normalizeDisplayName };

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed:police-stations] Fatal error:", err);
      process.exit(1);
    });
}