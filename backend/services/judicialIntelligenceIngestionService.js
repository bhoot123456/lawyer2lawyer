/**
 * Judicial Intelligence Ingestion Service (v1 skeleton)
 *
 * Responsibilities (v1):
 * - Provide shared helpers for ingesting official judiciary items.
 * - Upsert items by dedupeKey.
 * - Track ingestion runs with lastSeenAt + source-audit model.
 * - Mark items as removed when absent in latest run.
 *
 * Notes:
 * - This service is intentionally a skeleton: ingestion “fetch” adapters for each court/source
 *   will be added later. For now, it focuses on persistence/de-dupe contracts.
 */

const JudicialIntelligenceSourceItem = require("../models/JudicialIntelligenceSourceItem");

function newIngestionRunId(prefix = "run") {
  const now = new Date();
  const iso = now.toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${iso}`;
}

function buildDefaultNormalizedMeta(input = {}) {
  return {
    inputKind: input.kind || null,
    warnings: Array.isArray(input.warnings) ? input.warnings : [],
    errors: Array.isArray(input.errors) ? input.errors : [],
    ...input?.meta,
  };
}

/**
 * Upsert a concrete content document using dedupeKey.
 *
 * @param {object} params
 * @param {import('mongoose').Model} params.ContentModel - e.g. JudicialJudgment
 * @param {string} params.kind - must match source item kind
 * @param {string} params.dedupeKey
 * @param {object} params.documentFields - fields to $set on upsert
 * @param {string} params.title
 * @param {string} params.sourceUrl
 * @param {string} params.ingestionRunId
 */
async function upsertContentItem({
  ContentModel,
  kind,
  dedupeKey,
  documentFields,
  title,
  sourceUrl,
  ingestionRunId,
}) {
  if (!ContentModel) throw new Error("ContentModel is required");
  if (!kind) throw new Error("kind is required");
  if (!dedupeKey) throw new Error("dedupeKey is required");

  // 1) Create/update source audit record
  await JudicialIntelligenceSourceItem.findOneAndUpdate(
    { kind, dedupeKey },
    {
      $set: {
        kind,
        dedupeKey,
        title: title || "",
        sourceUrl: sourceUrl || "",
        ingestionRunId: ingestionRunId || null,
        lastSeenAt: new Date(),
        status: "active",
      },
      $setOnInsert: {
        validation: buildDefaultNormalizedMeta({}),
      },
    },
    { upsert: true, new: true }
  );

  // 2) Upsert actual content document
  // Contract: each content model uses dedupeKey field.
  const updated = await ContentModel.findOneAndUpdate(
    { dedupeKey },
    {
      $set: {
        ...(documentFields || {}),
        dedupeKey,
        status: "active",
        lastSeenAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  return updated;
}

/**
 * Mark source audit items as removed for a given kind and ingestion run window.
 *
 * How removal works in v1:
 * - We update `lastSeenAt` for items present.
 * - This function marks audit records `removed` if they were not seen
 *   during this run.
 */
async function markMissingItemsRemoved({ kind, ingestionRunId, seenDedupeKeys = [] }) {
  const seenSet = new Set(seenDedupeKeys);

  // Fetch all source items for this ingestion run.
  // In v1 we treat any item that has ingestionRunId == current as eligible for removal.
  const candidates = await JudicialIntelligenceSourceItem.find({
    kind,
    ingestionRunId,
  }).lean();

  const toRemove = candidates.filter((c) => !seenSet.has(c.dedupeKey));

  if (!toRemove.length) return { removedCount: 0 };

  const dedupeKeys = toRemove.map((x) => x.dedupeKey);

  await JudicialIntelligenceSourceItem.updateMany(
    { kind, dedupeKey: { $in: dedupeKeys } },
    { $set: { status: "removed" } }
  );

  return { removedCount: dedupeKeys.length };
}

module.exports = {
  newIngestionRunId,
  upsertContentItem,
  markMissingItemsRemoved,
};

