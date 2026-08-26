/**
 * Static content -> MongoDB migration
 * -----------------------------------
 * Migrates the static data files that previously WERE the runtime API into
 * their admin-managed MongoDB collections:
 *
 *   data/criminalLawActs.js -> CriminalLawAct
 *   data/knowledgeHub.js    -> KnowledgeHubItem
 *   data/miscForms.js       -> MiscForm
 *
 * SAFE BY DESIGN:
 *  - Idempotent: every record carries a stable `sourceId`; re-running never
 *    duplicates (Part 28).
 *  - Never deletes existing records.
 *  - Existing DB records are only touched when a content field actually
 *    differs; workflow/admin fields (status, verification) are preserved.
 *  - Run with --dry-run first to inspect the plan without writing.
 *
 * Usage:
 *   node scripts/migrate-static-content.js            # apply
 *   node scripts/migrate-static-content.js --dry-run  # report only
 */
require("dotenv").config();
const mongoose = require("mongoose");

const dryRun = process.argv.includes("--dry-run");
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI is not configured (.env). Aborting.");
  process.exit(1);
}

// ── helpers ────────────────────────────────────────────────────────────────
function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Upsert one record keyed by sourceId; returns insert/update/skip/error. */
async function upsertBySourceId(Model, sourceId, contentFields, defaults) {
  const existing = await Model.findOne({ sourceId }).lean();
  if (!existing) {
    if (dryRun) return { op: "insert", changedFields: Object.keys(contentFields) };
    await Model.create({ ...defaults, ...contentFields, sourceId });
    return { op: "insert", changedFields: Object.keys(contentFields) };
  }
  const changedFields = [];
  for (const [k, v] of Object.entries(contentFields)) {
    const cur = existing[k];
    const norm = (x) => (x === undefined || x === null ? "" : String(x));
    if (norm(cur) !== norm(v)) changedFields.push(k);
  }
  if (changedFields.length === 0) return { op: "skip", changedFields };
  if (!dryRun) {
    await Model.updateOne({ _id: existing._id }, { $set: Object.fromEntries(changedFields.map((f) => [f, contentFields[f]])) });
  }
  return { op: "update", changedFields };
}

function newReport(name) {
  return { module: name, source: 0, existingBefore: 0, inserted: 0, updated: 0, skipped: 0, conflicts: 0, errors: [] };
}

// ── migrations ─────────────────────────────────────────────────────────────

async function migrateCriminalLaws() {
  const CriminalLawAct = require("../models/CriminalLawAct");
  const source = require("../data/criminalLawActs");
  const report = newReport("Criminal Laws");
  report.source = source.length;
  report.existingBefore = await CriminalLawAct.countDocuments({});

  for (const act of source) {
    try {
      if (!act.title) { report.conflicts++; continue; }
      const r = await upsertBySourceId(
        CriminalLawAct,
        `criminal-law:${slugify(act.title)}`,
        {
          title: act.title,
          actName: act.actName || "",
          category: act.category || "",
          description: act.description || "",
          pdfUrl: act.pdfUrl || "",
        },
        { status: "published", publishedAt: new Date() },
      );
      report[r.op === "insert" ? "inserted" : r.op === "update" ? "updated" : "skipped"]++;
    } catch (e) {
      report.errors.push(`${act.title}: ${e.message}`);
    }
  }
  return report;
}

async function migrateKnowledgeHub() {
  const KnowledgeHubItem = require("../models/KnowledgeHubItem");
  const source = require("../data/knowledgeHub");
  const report = newReport("Knowledge Hub");
  const sections = (source && source.sections) || [];
  report.source = sections.reduce((a, s) => a + (s.resources ? s.resources.length : 0), 0);
  report.existingBefore = await KnowledgeHubItem.countDocuments({});

  let order = 0;
  for (const section of sections) {
    for (const res of section.resources || []) {
      order++;
      try {
        if (!res.label || !res.url) { report.conflicts++; continue; }
        const r = await upsertBySourceId(
          KnowledgeHubItem,
          `kh:${section.key}:${slugify(res.label)}`,
          {
            sectionKey: section.key,
            sectionTitle: section.title || "",
            sectionIcon: section.icon || "",
            sectionDescription: section.description || "",
            label: res.label,
            url: res.url,
            displayOrder: order,
          },
          { status: "published" },
        );
        report[r.op === "insert" ? "inserted" : r.op === "update" ? "updated" : "skipped"]++;
      } catch (e) {
        report.errors.push(`${section.key}/${res.label}: ${e.message}`);
      }
    }
  }
  return report;
}

async function migrateMiscForms() {
  const MiscForm = require("../models/MiscForm");
  const source = require("../data/miscForms");
  const report = newReport("Misc Forms");
  report.source = source.reduce((a, c) => a + (c.items ? c.items.length : 0), 0);
  report.existingBefore = await MiscForm.countDocuments({});

  let order = 0;
  for (const cat of source) {
    for (const item of cat.items || []) {
      order++;
      try {
        if (!item.name || !item.url) { report.conflicts++; continue; }
        const r = await upsertBySourceId(
          MiscForm,
          `misc-form:${slugify(cat.category)}:${slugify(item.name)}`,
          {
            category: cat.category,
            name: item.name,
            url: item.url,
            displayOrder: order,
          },
          { status: "published" },
        );
        report[r.op === "insert" ? "inserted" : r.op === "update" ? "updated" : "skipped"]++;
      } catch (e) {
        report.errors.push(`${cat.category}/${item.name}: ${e.message}`);
      }
    }
  }
  return report;
}

// ── runner ─────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Static content migration${dryRun ? " (DRY RUN — no writes)" : ""}\n`);

  await mongoose.connect(MONGO_URI);

  const reports = [];
  reports.push(await migrateCriminalLaws());
  reports.push(await migrateKnowledgeHub());
  reports.push(await migrateMiscForms());

  console.log(
    [
      "Module              Source  Existing  Inserted  Updated  Skipped  Conflicts  Errors",
      "-".repeat(88),
    ].join("\n"),
  );
  let failed = false;
  for (const r of reports) {
    console.log(
      r.module.padEnd(20)
        + String(r.source).padEnd(8)
        + String(r.existingBefore).padEnd(10)
        + String(r.inserted).padEnd(10)
        + String(r.updated).padEnd(9)
        + String(r.skipped).padEnd(9)
        + String(r.conflicts).padEnd(11)
        + r.errors.length,
    );
    for (const e of r.errors) { console.error(`  ERROR (${r.module}): ${e}`); failed = true; }
  }

  await mongoose.connection.close();
  console.log(`\nDone.${dryRun ? " (dry run — nothing was written)" : ""}`);
  process.exit(failed ? 1 : 0);
}

main().catch(async (err) => {
  console.error("Migration failed:", err.message);
  try { await mongoose.connection.close(); } catch (_) {}
  process.exit(1);
});
