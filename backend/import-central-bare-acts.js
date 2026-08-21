/**
 * import-central-bare-acts.js
 *
 * Idempotent import of the curated "Central Bare Acts" dataset into the existing
 * `bareacts` MongoDB collection (Lawyer2Lawyer Knowledge Hub -> Bare Acts).
 *
 * Design (per task constraints):
 *  - SAFE / NON-DESTRUCTIVE: never deletes, drops, or truncates. Uses find + updateOne / insertOne.
 *  - Idempotent: re-running is a no-op (detects already-imported records and skips them).
 *  - Stable identifiers: reuses the existing `slug` unique key. New records use the dataset `id`
 *    as slug; existing records keep their slug and _id (favourites / recently-opened preserved).
 *  - Conflict handling: a dataset Act that already exists (matched by normalized title+year, with
 *    fuzzy fallback by same year + token overlap) is MERGED into the existing record — only safe
 *    metadata fields are updated. Existing title/slug/year/category/pdfUrl/user data are preserved.
 *  - PDF rule: dataset records all have pdfUrl: null (pending). Existing records with a real,
 *    official PDF URL keep it. No PDF URLs are ever fabricated.
 *
 * Usage:
 *   node app/backend/import-central-bare-acts.js            # run for real
 *   node app/backend/import-central-bare-acts.js --dry-run   # preview only, no writes
 *
 * Run from the project root (d:/lawyer2lawyer) so __dirname resolves to the repo root.
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const DATASET_PATH =
  process.env.BARE_ACTS_DATASET ||
  path.join(__dirname, "data", "central-bare-acts-important-177.json") ||
  "C:/Users/Saurabh/Downloads/central-bare-acts-important-177.json";

const COLL = "bareacts";
const DRY_RUN = process.argv.includes("--dry-run");

function normTitle(t) {
  return String(t == null ? "" : t)
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, "") // strip parenthetical short-codes like "(IPC)", "(CPC)"
    .replace(/[^a-z0-9\s]/g, "") // strip punctuation
    .replace(/\s+/g, " ")
    .trim();
}

function normKey(title, year) {
  return normTitle(title) + "|" + String(year == null ? "" : year);
}

function tokens(t) {
  return normTitle(t).split(" ").filter(Boolean);
}

function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  if (!A.size || !B.size) return 0;
  let inter = 0, union = 0;
  for (const x of A) {
    if (B.has(x)) inter++;
    union++;
  }
  for (const x of B) if (!A.has(x)) union++;
  return inter / union;
}

function isRealPdfUrl(u) {
  if (!u || typeof u !== "string" || !/^https?:\/\//i.test(u)) return false;
  // Real official PDF: ends in .pdf, or India Code handle download link.
  return /\.pdf(?:\?|$|&)/i.test(u) || /download=1/i.test(u);
}

function buildUpdate(rec, existing) {
  // Only safe, additive metadata. NEVER overwrites pdfUrl/title/slug/year/category/user data.
  const set = {
    sourceName: rec.sourceName || null,
    sourceType: rec.sourceType || null,
    indiaCodeSearchUrl: rec.indiaCodeSearchUrl || null,
    indiaCodeUrl: rec.indiaCodeUrl || null,
    pdfVerificationStatus: rec.pdfVerificationStatus || null,
    statusNote: rec.statusNote || null,
  };
  // Jurisdiction: set to Central (these are Central Acts) only if currently empty.
  if (!existing.jurisdiction) {
    set.jurisdiction = rec.jurisdiction || "Central";
  }
  return { $set: set, $setOnInsert: { status: "published", publishedAt: new Date() } };
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "true") {
    console.error("CRITICAL SAFETY ERROR: Seed script execution blocked in production mode. Set ALLOW_PROD_SEED=true to override.");
    process.exit(1);
  }
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lawyer2lawyer";

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 90000,
    socketTimeoutMS: 90000,
    connectTimeoutMS: 90000,
    maxPoolSize: 10,
  });
  mongoose.set("bufferCommands", true);
  mongoose.set("bufferTimeoutMS", 180000);

  const db = mongoose.connection.db;
  const coll = db.collection(COLL);

  // Ensure indexes for the new optional fields exist (idempotent; cheap on small collection).
  const safeCreateIndex = async (spec) => {
    try { await coll.createIndex(spec); } catch (e) { /* ignore: may already exist */ }
  };
  await Promise.all([
    safeCreateIndex({ jurisdiction: 1 }),
    safeCreateIndex({ pdfVerificationStatus: 1 }),
    safeCreateIndex({ indiaCodeUrl: 1 }),
  ]);

  // ---- Load existing docs from DB (source of truth) ----
  const beforeCount = await coll.countDocuments({});
  const existing = await coll
    .find({}, {
      projection: {
        _id: 1, slug: 1, title: 1, actName: 1, year: 1, category: 1, ministry: 1,
        pdfUrl: 1, jurisdiction: 1, pdfVerificationStatus: 1, indiaCodeSearchUrl: 1, indiaCodeUrl: 1,
      },
    })
    .toArray();

  const byKey = new Map();       // normKey(title,year) -> doc
  const bySlug = new Map();      // slug -> doc
  const byYear = new Map();      // year(string) -> [docs]
  for (const e of existing) {
    const k = normKey(e.title, e.year);
    if (!byKey.has(k)) byKey.set(k, e);
    bySlug.set(e.slug, e);
    const y = String(e.year || "");
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(e);
  }

  // ---- Load dataset ----
  const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, "utf8")).records;

  const stats = {
    dataset: dataset.length,
    beforeCount,
    inserted: 0,
    mergedExact: 0,
    mergedFuzzy: 0,
    skipped: 0,
    duplicateDatasetInternal: 0,
    errors: 0,
    newWithRealPdf: 0,
    mergedWithRealPdf: 0,
  };
  const fuzzyMatches = [];
  const conflicts = [];
  const datasetDuplicates = [];

  const seenDatasetKey = new Map();   // dataset-internal normKey dedup
  const queuedInsertSlugs = new Set();

  const bulkUpdates = [];
  const bulkInserts = [];

  for (const rec of dataset) {
    try {
      if (!rec.id || !rec.title) {
        stats.errors++;
        continue;
      }
      const key = normKey(rec.title, rec.actYear);

      // Dataset-internal duplicate (same normalized title+year already seen in this dataset run)
      if (seenDatasetKey.has(key)) {
        stats.duplicateDatasetInternal++;
        datasetDuplicates.push({ id: rec.id, title: rec.title, year: rec.actYear, reason: "dataset-internal duplicate title+year" });
        continue;
      }
      seenDatasetKey.set(key, { id: rec.id, title: rec.title });

      // 1) Exact match against existing (normalized title + year)
      let target = byKey.get(key);
      let matchType = "exact";
      let bestJ = 0;

      // 2) Fuzzy fallback: same year + token overlap (catches same-act, different naming)
      if (!target) {
        const cand = byYear.get(String(rec.actYear)) || [];
        let best = null;
        for (const e of cand) {
          const j = jaccard(tokens(rec.title), tokens(e.title));
          if (j > bestJ) { bestJ = j; best = e; }
        }
        if (best && bestJ >= 0.6) {
          target = best;
          matchType = "fuzzy";
        }
      }

      if (target) {
        const alreadySet =
          target.pdfVerificationStatus === rec.pdfVerificationStatus &&
          target.indiaCodeSearchUrl === rec.indiaCodeSearchUrl &&
          target.indiaCodeUrl === (rec.indiaCodeUrl || null) &&
          (existing_jurisdiction_ok(target));

        if (alreadySet) {
          stats.skipped++;
        } else {
          bulkUpdates.push({
            updateOne: {
              filter: { _id: target._id },
              update: buildUpdate(rec, target),
              upsert: false,
            },
          });
          if (matchType === "exact") {
            stats.mergedExact++;
          } else {
            stats.mergedFuzzy++;
            fuzzyMatches.push({ id: rec.id, title: rec.title, year: rec.actYear, matchedExisting: target.title, jaccard: Math.round(bestJ * 100) / 100 });
          }
          if (isRealPdfUrl(target.pdfUrl)) stats.mergedWithRealPdf++;
          conflicts.push({ id: rec.id, title: rec.title, year: rec.actYear, existingTitle: target.title, existingPdf: target.pdfUrl, matchType, jaccard: matchType === "exact" ? 1 : Math.round(bestJ * 100) / 100 });
        }
      } else {
        // New record
        const slug = rec.id;
        if (bySlug.has(slug) || queuedInsertSlugs.has(slug)) {
          stats.duplicateDatasetInternal++;
          datasetDuplicates.push({ id: rec.id, title: rec.title, year: rec.actYear, reason: "slug already exists (existing DB or already queued this run)" });
          continue;
        }
        queuedInsertSlugs.add(slug);

        const doc = {
          slug,
          title: rec.title,
          actName: rec.title,
          year: String(rec.actYear),
          category: rec.category,
          jurisdiction: rec.jurisdiction || "Central",
          pdfUrl: rec.pdfUrl || null,
          sourceName: rec.sourceName || null,
          sourceType: rec.sourceType || null,
          indiaCodeSearchUrl: rec.indiaCodeSearchUrl || null,
          indiaCodeUrl: rec.indiaCodeUrl || null,
          pdfVerificationStatus: rec.pdfVerificationStatus || null,
          statusNote: rec.statusNote || null,
          ministry: "",
          keywords: [],
          language: "English",
          isPopular: false,
          isNewLaw: false,
          sectionNumber: "",
          content: "",
          tags: [],
          status: "published",
          publishedAt: new Date(),
        };
        bulkInserts.push(doc);
        stats.inserted++;
        if (rec.pdfUrl) stats.newWithRealPdf++; // (0 expected in this dataset)
      }
    } catch (e) {
      stats.errors++;
      console.error("  ! error processing", rec && rec.id, e.message);
    }
  }

  // ---- Report (dry-run) ----
  console.log("\n================ IMPORT PLAN ================");
  console.log("Mode:", DRY_RUN ? "DRY-RUN (no writes)" : "LIVE");
  console.log("Dataset source:", DATASET_PATH);
  console.log("Dataset records:", stats.dataset);
  console.log("Existing records (before):", stats.beforeCount);
  console.log("Exact merges (into existing same Act):", stats.mergedExact);
  console.log("Fuzzy merges (same Act, different naming):", stats.mergedFuzzy);
  console.log("New inserts:", stats.inserted);
  console.log("Skipped (already fully imported, idempotent):", stats.skipped);
  console.log("Dataset-internal duplicates skipped:", stats.duplicateDatasetInternal);
  console.log("Errors:", stats.errors);
  console.log("PDF status -> verified PDFs (existing):", await countVerifiedPdfs(coll));
  console.log("PDF status -> unresolved (dataset pending):", stats.dataset);
  if (fuzzyMatches.length) {
    console.log("\nFuzzy matches (REVIEW):");
    fuzzyMatches.forEach((f) => console.log("  -", f.id, "-> merged into existing:", f.matchedExisting, "(jaccard", f.jaccard + ")"));
  }
  if (datasetDuplicates.length) {
    console.log("\nDataset-internal duplicates skipped:");
    datasetDuplicates.forEach((d) => console.log("  -", d.id, ":", d.reason));
  }
  console.log("\nConflicts list (dataset Act already existed -> merged, not duplicated):");
  conflicts.forEach((c) => console.log("  -", c.id, "|", c.title, "(" + c.matchType + ")", "->", c.existingTitle, "| existingPdf:", c.existingPdf || "null"));

  if (DRY_RUN) {
    console.log("\n[dry-run] No writes performed. Run without --dry-run to import.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // ---- Execute ----
  // Updates
  const updateChunk = 200;
  for (let i = 0; i < bulkUpdates.length; i += updateChunk) {
    const chunk = bulkUpdates.slice(i, i + updateChunk);
    try {
      const r = await coll.bulkWrite(chunk, { ordered: false });
      stats.mergedExact = stats.mergedExact; // noop keeper
      // update stats counts from actual modified
      stats.mergedExactDone = (stats.mergedExactDone || 0) + (r.modified || 0);
    } catch (e) {
      stats.errors++;
      console.error("  ! bulk update error:", e.message);
    }
  }
  // Inserts
  const insertChunk = 200;
  for (let i = 0; i < bulkInserts.length; i += insertChunk) {
    const chunk = bulkInserts.slice(i, i + insertChunk);
    try {
      await coll.insertMany(chunk, { ordered: false });
    } catch (e) {
      // duplicate key on insert (shouldn't happen due to slug check) -> count ignored docs
      stats.errors++;
      console.error("  ! bulk insert error:", e.message);
    }
  }

  const afterCount = await coll.countDocuments({});
  console.log("\n================ IMPORT COMPLETE ================");
  console.log("Existing (before):", stats.beforeCount);
  console.log("Dataset:", stats.dataset);
  console.log("Inserted:", stats.inserted);
  console.log("Merged (exact):", stats.mergedExact);
  console.log("Merged (fuzzy):", stats.mergedFuzzy);
  console.log("Skipped (idempotent no-op):", stats.skipped);
  console.log("Total after:", afterCount);
  console.log("Net new DB records:", afterCount - stats.beforeCount);
  console.log("Errors:", stats.errors);
  await mongoose.disconnect();
  process.exit(0);
}

async function countVerifiedPdfs(coll) {
  try {
    const docs = await coll.find({ pdfUrl: { $ne: null, $exists: true } }, { projection: { pdfUrl: 1 } }).toArray();
    return docs.filter((d) => isRealPdfUrl(d.pdfUrl)).length;
  } catch (e) {
    return "n/a";
  }
}

// helper used in alreadySet check
function existing_jurisdiction_ok(existing) {
  return !existing.jurisdiction || existing.jurisdiction === "Central";
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
