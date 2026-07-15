/**
 * Judicial Intelligence Engine utilities
 *
 * This file is intentionally dependency-light so it can be used by:
 * - ingestion services
 * - controllers/services
 * - cron jobs
 */

const crypto = require("crypto");

function normalizeWhitespace(s) {
  return String(s ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(s) {
  // Titles are often inconsistent across sources.
  // We normalize whitespace and strip repeated punctuation.
  const x = normalizeWhitespace(s)
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[“”]/g, '"');
  return x;
}

function normalizeCourt(s) {
  return normalizeWhitespace(s)
    .replace(/\bSupreme\b/gi, "Supreme Court")
    .replace(/\bHigh\b/gi, "High Court");
}

function safeParseDate(input) {
  if (!input) return null;

  // Already a Date
  if (input instanceof Date && !Number.isNaN(input.getTime())) return input;

  const asString = String(input).trim();
  if (!asString) return null;

  // Common Indian formats: dd-mm-yyyy, dd/mm/yyyy
  const m1 = asString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1) {
    const day = parseInt(m1[1], 10);
    const month = parseInt(m1[2], 10) - 1;
    const year = parseInt(m1[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    if (!Number.isNaN(d.getTime())) return d;
  }

  const m2 = asString.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m2) {
    const year = parseInt(m2[1], 10);
    const month = parseInt(m2[2], 10) - 1;
    const day = parseInt(m2[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    if (!Number.isNaN(d.getTime())) return d;
  }

  // Fallback to Date parsing (for ISO and RFC strings)
  const d = new Date(asString);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatISODateOnly(d) {
  // Returns YYYY-MM-DD in UTC.
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

function stableHash(input) {
  const str = typeof input === "string" ? input : JSON.stringify(input);
  return crypto.createHash("sha256").update(str).digest("hex");
}

/**
 * Create a dedupe key with a predictable schema.
 * Always version dedupe generation strategy by including `v`.
 */
function makeDedupeKey({ kind, v = 1, sourceId, title, date, extra = {} }) {
  const payload = {
    kind,
    v,
    sourceId: normalizeWhitespace(sourceId) || null,
    title: normalizeTitle(title),
    date: date ? formatISODateOnly(date) : null,
    extra,
  };

  // Using stableHash ensures dedupe key stays fixed for identical logical items.
  return stableHash(payload);
}

function toSafeString(x) {
  return x === null || x === undefined ? "" : String(x);
}

function buildSnippet(text, maxLen = 180) {
  const s = normalizeWhitespace(text);
  if (!s) return "";
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen - 1)}…`;
}

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr || []) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

module.exports = {
  normalizeWhitespace,
  normalizeTitle,
  normalizeCourt,
  safeParseDate,
  formatISODateOnly,
  stableHash,
  makeDedupeKey,
  toSafeString,
  buildSnippet,
  uniqBy,
};

