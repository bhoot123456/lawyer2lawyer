/**
 * UNIVERSAL ADMIN CMS CRUD ENGINE
 * -------------------------------
 * Reusable list/get/create/update/status/delete operations driven strictly by
 * the server-side CONTENT_REGISTRY allowlist.
 *
 * Guarantees:
 *  - Only registry modules are addressable; unknown module keys are rejected.
 *  - Only `allowedFields` of a module can ever be written; unknown fields are
 *    rejected with 400 (never silently stored).
 *  - Sort fields must be whitelisted per module (?sortBy=).
 *  - Status transitions respect each module's workflow declaration.
 *  - Optimistic concurrency: PUT with `expectedUpdatedAt` that does not match
 *    the stored document returns 409 instead of overwriting another admin's
 *    changes.
 *  - Delete policy is enforced server-side ("soft" | "archive" | "hard").
 *  - Every mutation writes an audit log entry.
 */
const { getModule } = require("../registry/contentRegistry");
const { recordAudit } = require("../audit/auditService");

// ── helpers ────────────────────────────────────────────────────────────────

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Sanitize a whitelisted structured (embedded sub-document) field.
 * Only flat objects with primitive values are accepted — nested objects,
 * arrays of objects, operator keys ($-prefixed / dotted), and oversized
 * strings are rejected. This lets modules like police-stations expose
 * `sho`/`location` for editing WITHOUT opening arbitrary object writes.
 */
function sanitizeStructured(field, value) {
  const MAX_STR = 2000;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, `Field "${field}" must be an object.`);
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (k.startsWith("$") || k.includes(".")) {
      throw new HttpError(400, `Field "${field}" contains forbidden key "${k}".`);
    }
    if (v === null) {
      out[k] = null;
    } else if (typeof v === "string") {
      if (/\$where|\$function/.test(v)) {
        throw new HttpError(400, `Field "${field}" contains forbidden operators.`);
      }
      out[k] = v.length > MAX_STR ? `${v.slice(0, MAX_STR)}…[truncated]` : v;
    } else if ((typeof v === "number" && Number.isFinite(v)) || typeof v === "boolean") {
      out[k] = v;
    } else {
      throw new HttpError(400, `Field "${field}" only accepts primitive values.`);
    }
  }
  return out;
}

/** Coerce + validate a field value against primitive expectations. */
function coerceValue(field, value, mod) {
  if (value === null) return value;

  // Whitelisted structured fields (embedded sub-documents) get their own
  // sanitizer; everything else stays strictly primitive/array.
  if (
    typeof value === "object" && !Array.isArray(value) &&
    mod && Array.isArray(mod.structuredFields) && mod.structuredFields.includes(field)
  ) {
    return sanitizeStructured(field, value);
  }
  // Reject obvious NoSQL injection / dangerous payloads on object values
  // except whitelisted structured fields (tags arrays, meta objects).
  if (typeof value === "object" && !Array.isArray(value)) {
    throw new HttpError(400, `Field "${field}" must be a primitive value or array.`);
  }
  if (typeof value === "string") {
    if (value.length > 200000) {
      throw new HttpError(400, `Field "${field}" exceeds maximum length.`);
    }
    if (/\$where|\$function/.test(value)) {
      throw new HttpError(400, `Field "${field}" contains forbidden operators.`);
    }
  }
  return value;
}

/** Build the Mongo filter for list queries from whitelisted inputs only. */
function buildFilter(mod, query) {
  const filter = {};

  if (mod.deletePolicy === "soft") filter.isDeleted = { $ne: true };

  const q = (query.search || "").toString().trim();
  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    filter.$or = mod.searchFields.map((f) => ({ [f]: pattern }));
  }

  for (const f of mod.filterFields || []) {
    const raw = query[f];
    if (raw === undefined || raw === "") continue;
    let v = raw;
    if (raw === "true") v = true;
    else if (raw === "false") v = false;
    // Enum guard: never allow arbitrary expressions through filters.
    if (f === (mod.statusField || "") && mod.statusEnum && !mod.statusEnum.includes(v) && !["draft", "published", "archived"].includes(v)) {
      throw new HttpError(400, `Invalid status filter value.`);
    }
    filter[f] = v;
  }

  return filter;
}

function buildSort(mod, query) {
  const sortBy = mod.sortableFields.includes(query.sortBy) ? query.sortBy : "updatedAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  return { [sortBy]: sortOrder };
}

function buildPagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

/** Keep only allowed fields; reject unknown keys outright. */
function pickAllowed(mod, body, { partial }) {
  const updates = {};
  const rejected = [];
  for (const [key, value] of Object.entries(body || {})) {
    if (key === "expectedUpdatedAt") continue; // concurrency control, not data
    const isStructured =
      Array.isArray(mod.structuredFields) && mod.structuredFields.includes(key);
    if (!mod.allowedFields.includes(key) && !isStructured) {
      rejected.push(key);
      continue;
    }
    updates[key] = coerceValue(key, value, mod);
  }
  if (rejected.length > 0) {
    throw new HttpError(400, `Unknown or restricted field(s): ${rejected.join(", ")}`);
  }
  if (!partial) {
    for (const req of mod.requiredFields || []) {
      if (updates[req] === undefined || updates[req] === "" || updates[req] === null) {
        throw new HttpError(400, `"${req}" is required.`);
      }
    }
  }
  return updates;
}

// ── operations (each takes the resolved registry module `mod`) ────────────

/** LIST — server-side search / filter / sort / pagination. */
async function listRecords(mod, query) {
  const filter = buildFilter(mod, query);
  const sort = buildSort(mod, query);
  const { page, limit, skip } = buildPagination(query);

  const projection = mod.listFields || "";
  const [items, total] = await Promise.all([
    mod.model.find(filter).select(projection).sort(sort).skip(skip).limit(limit).lean(),
    mod.model.countDocuments(filter),
  ]);

  return {
    items,
    module: mod.key,
    label: mod.label,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
  };
}

/** GET ONE */
async function getRecord(mod, id) {
  const filter = { _id: id };
  if (mod.deletePolicy === "soft") filter.isDeleted = { $ne: true };
  const item = await mod.model.findById(id);
  if (!item || (mod.deletePolicy === "soft" && item.isDeleted)) {
    throw new HttpError(404, `${mod.label} record not found`);
  }
  return item;
}

function recordLabel(mod, doc) {
  return doc[mod.titleField] || doc.title || doc.name || String(doc._id);
}

/** CREATE */
async function createRecord(mod, body, admin, req) {
  const data = pickAllowed(mod, body, { partial: false });

  // Status workflow guard on create.
  if (mod.statusField && data[mod.statusField] !== undefined) {
    const allowed = mod.statusEnum || ["draft", "published", "archived"];
    if (!allowed.includes(data[mod.statusField])) {
      throw new HttpError(400, `Invalid ${mod.statusField} value.`);
    }
    if (data[mod.statusField] === "published" && !adminCanPublish(mod, admin)) {
      throw new HttpError(403, "You do not have permission to publish.");
    }
  }

  if ((mod.statusField === "status" && data.status === "published") || data.status === "published") {
    data.publishedAt = data.publishedAt || new Date();
  }

  let item;
  try {
    item = await mod.model.create(data);
  } catch (e) {
    if (e && e.code === 11000) {
      throw new HttpError(409, "A record with this unique identifier already exists.");
    }
    if (e && e.name === "ValidationError") {
      throw new HttpError(400, e.message);
    }
    throw e;
  }

  await recordAudit({
    admin,
    action: "CREATE",
    module: mod.key,
    recordId: item._id,
    recordLabel: recordLabel(mod, item),
    after: item.toObject(),
    req,
  });

  return item;
}


function adminCanPublish(mod, admin) {
  if (!mod.supportsPublish) return true;
  // Super admins bypass granular permission checks (same model as
  // middleware/adminAuth.checkPermission). Everyone else needs an explicit
  // <module>.publish grant.
  const { hasExplicitPermission } = require("../permissions/registry");
  const { isSuperAdmin } = require("../../middleware/adminAuth");
  return (
    !!admin &&
    (isSuperAdmin(admin) ||
      hasExplicitPermission(admin.permissions, `${mod.permissionKey}.publish`))
  );
}

/** UPDATE — allowlisted fields + optimistic concurrency + versioning. */
async function updateRecord(mod, id, body, admin, req) {
  const updates = pickAllowed(mod, body, { partial: true });
  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, "No valid fields provided to update.");
  }

  // Publishing through plain PUT requires publish permission.
  if (mod.statusField === "status" && updates.status !== undefined) {
    const allowedStatus = mod.statusEnum || ["draft", "published", "archived"];
    if (!allowedStatus.includes(updates.status)) {
      throw new HttpError(400, "Invalid status value.");
    }
    if (updates.status === "published" && !adminCanPublish(mod, admin)) {
      throw new HttpError(403, "You do not have permission to publish.");
    }
  }

  const existing = await mod.model.findById(id);
  if (!existing || (mod.deletePolicy === "soft" && existing.isDeleted)) {
    throw new HttpError(404, `${mod.label} record not found`);
  }

  // Optimistic concurrency control (Part 31).
  if (body.expectedUpdatedAt) {
    const expected = new Date(body.expectedUpdatedAt);
    const actual = existing.updatedAt;
    if (
      actual && !Number.isNaN(expected.getTime()) &&
      Math.abs(actual.getTime() - expected.getTime()) > 1000
    ) {
      throw new HttpError(
        409,
        "This record was modified by another administrator. Reload before saving.",
        { code: "CONFLICT" },
      );
    }
  }

  const before = existing.toObject();
  if (updates.status === "published" && !before.publishedAt) {
    updates.publishedAt = new Date();
  }
  // Versioning metadata for models that support it.
  if (mod.allowedFields.includes("versionNumber")) {
    updates.versionNumber = (before.versionNumber || 1) + 1;
    if (body.changeSummary !== undefined) updates.changeSummary = body.changeSummary;
  }

  let item;
  try {
    item = await mod.model.findByIdAndUpdate(id, { $set: updates }, {
      new: true,
      runValidators: true,
      context: "query",
    });
  } catch (e) {
    if (e && e.code === 11000) {
      throw new HttpError(409, "A record with this unique identifier already exists.");
    }
    if (e && e.name === "ValidationError") {
      throw new HttpError(400, e.message);
    }
    throw e;
  }

  const changedFields = Object.keys(updates);
  await recordAudit({
    admin,
    action: "UPDATE",
    module: mod.key,
    recordId: item._id,
    recordLabel: recordLabel(mod, item),
    before,
    after: item.toObject(),
    changedFields,
    req,
  });

  return item;
}

const STATUS_ACTIONS = {
  publish: { action: "PUBLISH", status: "published", requiresPublish: true },
  unpublish: { action: "UNPUBLISH", status: "draft", requiresPublish: true },
  archive: { action: "ARCHIVE", status: "archived", requiresPublish: false },
};

/**
 * STATUS TRANSITIONS — publish/unpublish/archive/restore/activate/deactivate/verify
 */
async function applyStatusAction(mod, id, actionName, body, admin, req) {
  const item = await getRecord(mod, id);
  const before = item.toObject();
  let updates = {};
  let auditAction = null;

  const transition = STATUS_ACTIONS[actionName];
  if (transition) {
    if (!mod.supportsPublish && transition.requiresPublish) {
      throw new HttpError(400, `Module "${mod.key}" does not support ${actionName}.`);
    }
    if (transition.requiresPublish && !adminCanPublish(mod, admin)) {
      throw new HttpError(403, "You do not have permission to publish.");
    }
    if (mod.statusField) {
      updates[mod.statusField] = transition.status;
    } else if (mod.allowedFields.includes("isActive")) {
      // Modules without a workflow field (e.g. tribunals, whose public API
      // filters on isActive) express publish/unpublish through their active
      // flag instead of a silently-dropped write.
      updates.isActive = transition.status !== "archived";
    } else {
      throw new HttpError(400, `Module "${mod.key}" does not support ${actionName}.`);
    }
    if (transition.status === "published") updates.publishedAt = new Date();
    auditAction = transition.action;
  } else if (actionName === "restore") {
    if (mod.deletePolicy !== "soft") {
      throw new HttpError(400, "Restore is only available for soft-deleted modules.");
    }
    updates = { isDeleted: false, deletedAt: null, deletedBy: "" };
    auditAction = "RESTORE";
  } else if (actionName === "activate" || actionName === "deactivate") {
    if (mod.allowedFields.includes("isActive")) {
      updates.isActive = actionName === "activate";
      auditAction = actionName === "activate" ? "ACTIVATE" : "DEACTIVATE";
    } else if (mod.allowedFields.includes("status")) {
      updates.status = actionName === "activate" ? "Live" : "Offline";
      auditAction = actionName === "activate" ? "ACTIVATE" : "DEACTIVATE";
    } else {
      throw new HttpError(400, `Module "${mod.key}" does not support activate/deactivate.`);
    }
  } else if (actionName === "verify") {
    if (!mod.allowedFields.includes("verificationStatus")) {
      throw new HttpError(400, `Module "${mod.key}" does not support verification.`);
    }
    updates = {
      verificationStatus: "verified",
      lastVerifiedAt: new Date(),
      verifiedBy: admin.name || "admin",
    };
    auditAction = "VERIFY";
  } else {
    throw new HttpError(400, `Unknown status action "${actionName}".`);
  }

  Object.assign(item, updates);
  try {
    await item.save();
  } catch (e) {
    if (e && e.name === "ValidationError") throw new HttpError(400, e.message);
    throw e;
  }

  await recordAudit({
    admin,
    action: auditAction,
    module: mod.key,
    recordId: item._id,
    recordLabel: recordLabel(mod, item),
    before,
    after: item.toObject(),
    changedFields: Object.keys(updates),
    req,
  });

  return item;
}

/** DELETE — enforces per-module delete policy (Part 15). */
async function deleteRecord(mod, id, admin, req) {
  const item = await getRecord(mod, id);
  const before = item.toObject();

  if (mod.deletePolicy === "soft") {
    item.isDeleted = true;
    item.deletedAt = new Date();
    item.deletedBy = (admin && admin.name) || "admin";
    await item.save();
  } else if (mod.deletePolicy === "archive") {
    // Critical legal data: DELETE is downgraded to archive.
    if (!mod.statusField) {
      throw new HttpError(400, "This module cannot be deleted; archive it instead.");
    }
    item[mod.statusField] = "archived";
    await item.save();
  } else {
    await mod.model.findByIdAndDelete(id);
  }

  await recordAudit({
    admin,
    action: "DELETE",
    module: mod.key,
    recordId: id,
    recordLabel: recordLabel(mod, item),
    before,
    after: mod.deletePolicy === "hard" ? null : item.toObject(),
    changedFields:
      mod.deletePolicy === "hard"
        ? []
        : [mod.deletePolicy === "soft" ? "isDeleted" : mod.statusField],
    req,
  });

  const messageByPolicy = {
    soft: `${mod.label} record moved to recycle bin`,
    archive: `${mod.label} record archived (legal data is preserved)`,
    hard: `${mod.label} record deleted permanently`,
  };
  return { policy: mod.deletePolicy, message: messageByPolicy[mod.deletePolicy] };
}

module.exports = {
  HttpError,
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  applyStatusAction,
  deleteRecord,
  pickAllowed,
  buildFilter,
  buildSort,
};
