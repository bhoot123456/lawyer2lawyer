/**
 * Audit service — records every sensitive administrative mutation.
 * Best-effort: an audit failure must never break the underlying operation,
 * but failures are logged loudly for operations review.
 */
const AuditLog = require("../../models/AuditLog");
const logger = require("../../utils/logger");

/** Keys that must never be persisted in audit documents. */
const SENSITIVE_KEYS = [
  "password", "passwordHash", "newPassword", "currentPassword",
  "token", "refreshToken", "accessToken", "secret", "__v",
];

function deepSanitize(value, depth = 0) {
  if (value === null || value === undefined) return value;
  if (depth > 4) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => deepSanitize(v, depth + 1));
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEYS.includes(k)) {
        out[k] = "[redacted]";
      } else if (typeof v === "string" && v.length > 2000) {
        out[k] = `${v.slice(0, 2000)}…[truncated]`;
      } else {
        out[k] = deepSanitize(v, depth + 1);
      }
    }
    return out;
  }
  return value;
}

function diffFields(before, after, allowedFields) {
  const changed = [];
  const fields = allowedFields || new Set(Object.keys(after || {}));
  for (const f of fields) {
    const b = before ? before[f] : undefined;
    const a = after ? after[f] : undefined;
    const bs = JSON.stringify(b !== undefined ? b : null);
    const as = JSON.stringify(a !== undefined ? a : null);
    if (bs !== as) changed.push(f);
  }
  return changed;
}

/**
 * Record an audit event.
 * @param {object} params
 * @param {object} params.admin       req.user document (or null for system)
 * @param {string} params.action      CREATE | UPDATE | ...
 * @param {string} params.module      registry module key (e.g. "tribunals")
 * @param {string} params.recordId
 * @param {string} params.recordLabel human-readable record title
 * @param {object} params.before      sanitized pre-state
 * @param {object} params.after       sanitized post-state
 * @param {string[]} params.changedFields
 * @param {object} params.req         express request (for ip / user agent)
 */
async function recordAudit({ admin, action, module, recordId, recordLabel, before, after, changedFields, req }) {
  try {
    await AuditLog.create({
      adminId: admin && admin._id,
      adminName: (admin && admin.name) || "system",
      adminEmail: (admin && admin.email) || "",
      adminType: (admin && admin.adminType) || "",
      action,
      module,
      recordId: recordId ? String(recordId) : "",
      recordLabel: (recordLabel || "").slice(0, 300),
      before: deepSanitize(before),
      after: deepSanitize(after),
      changedFields: changedFields || diffFields(before, after),
      ip: req && req.ip ? req.ip : "",
      userAgent: req && req.headers ? String(req.headers["user-agent"] || "").slice(0, 300) : "",
    });
  } catch (err) {
    logger.error("AUDIT WRITE FAILED — operation succeeded but was not audited", {
      module,
      action,
      recordId,
      error: err.message,
    });
  }
}

module.exports = { recordAudit, deepSanitize, diffFields };
