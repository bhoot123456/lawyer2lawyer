const mongoose = require("mongoose");
const Case = require("../models/Case");
const User = require("../models/User");
const Notification = require("../models/Notification");
const AIConversation = require("../models/AIConversation");
const AuditLog = require("../models/AuditLog");
const logger = require("../utils/logger");
const {
  validateCaseCreatePayload,
  validateCaseUpdatePayload,
  validatePaginationAndSorting,
} = require("../validation/caseValidation");

function makeTimelineEntry({ type, description, actor, meta }) {
  return {
    type,
    description: description || "",
    actor,
    meta: meta || {},
    createdAt: new Date(),
  };
}

function canEditCase({ user, deviceId, caseDoc }) {
  if (!caseDoc) return false;

  // DEVICE-FIRST (P0 isolation fix): when a validated X-Device-Id is present
  // it is the canonical identity for the public/no-login Cases module. A JWT
  // that may ALSO be present (e.g. a stale admin token left in AsyncStorage
  // from an earlier login) must never escalate the scope — previously an
  // admin token bypassed device ownership entirely, leaking every case.
  if (deviceId) {
    return caseDoc.deviceId === deviceId;
  }

  // JWT path (no device identity header — legacy/white-label API clients):
  // If user exists, use JWT/RBAC logic
  if (user) {
    // P2: block suspended or deactivated accounts even with a valid JWT.
    // Tokens expire in 15 min, but a suspended lawyer should not be able to
    // modify cases until the token naturally expires.
    if (user.isSuspended === true || user.isActive === false) return false;

    const role = user?.role;
    if (role === "admin") return true;

    // assignedTo is a User ObjectId
    const assignedToId = String(caseDoc.assignedTo);
    return role === "lawyer" && String(user._id) === assignedToId;
  }

    return false;
}

/**
 * DELETE authorization — strict scope separation for permanent deletion.
 *
 * Rules (deliberately stricter than canEditCase for this irreversible action):
 *   1. A request carrying a validated X-Device-Id may ONLY delete a case owned
 *      by THAT device (case.deviceId === deviceId). It can never delete a
 *      JWT-scoped case (one without a deviceId).
 *   2. A JWT-only request (no device header) may NEVER delete a device-scoped
 *      case — even an admin JWT cannot delete a public/no-login case through
 *      the public route (admins use the admin panel route, which is audited
 *      separately). This closes the canEditCase admin-bypass for deletes.
 *   3. For JWT-scoped cases: admin, or the case's assignedTo / createdBy user.
 *
 * Pure function — exported for unit tests (no database required).
 */
function canDeleteCase({ user, deviceId, caseDoc }) {
  if (!caseDoc) return false;

  const isDeviceScoped = Boolean(caseDoc.deviceId);

  // DEVICE-FIRST (P0 isolation): a device request only ever touches cases it
  // owns; it can never delete (or even see) a JWT-scoped case.
  if (deviceId) {
    return isDeviceScoped && caseDoc.deviceId === deviceId;
  }

  // JWT-only request cross-scope guard.
  if (isDeviceScoped) return false;

  if (user) {
    const role = user?.role;
    if (role === "admin") return true;

    const userId = String(user._id);
    const assignedToId = caseDoc.assignedTo ? String(caseDoc.assignedTo) : "";
    const createdById = caseDoc.createdBy ? String(caseDoc.createdBy) : "";
    return assignedToId === userId || createdById === userId;
  }

  return false;
}

/**
 * PURE view authorization — single source of truth for "may this identity
 * view this case?". Exported so the read-scoping rule is unit-testable
 * without a database.
 *
 * Precedence (consistent with canEditCase and the P0 isolation fix):
 *   1. A validated X-Device-Id is the canonical identity (public/no-login
 *      Cases module). A JWT that may ALSO be present never widens scope.
 *   2. Otherwise, fall back to the authenticated user (JWT path):
 *      admin => full read, lawyer => assignedTo only, client/other =>
 *      createdBy only.
 *   3. No identity at all => deny.
 */
function canViewCase({ user, deviceId, caseDoc }) {
  if (!caseDoc) return false;

  if (deviceId) {
    return caseDoc.deviceId === deviceId;
  }

  if (user) {
    // P2: block suspended or deactivated accounts even with a valid JWT.
    if (user.isSuspended === true || user.isActive === false) return false;

    const role = user?.role;
    if (role === "admin") return true;
    if (role === "lawyer") {
      return String(caseDoc.assignedTo) === String(user._id);
    }
    // client AND any other/unknown role: strict createdBy scope only
    // (previously an unknown role fell through to a full unscoped read)
    return String(caseDoc.createdBy) === String(user._id);
  }

  return false;
}

function toObjectIdIfPossible(id) {
  // Keep it simple: Mongoose will validate casting, but we avoid failing early here.
  return id;
}

// Escape user-controlled search input before it reaches $regex so that
// regex metacharacters cannot alter query semantics or enable ReDoS.
// (Consistent with judgeDirectory/policeStation/supremeCourt controllers.)
function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildCaseQueryFilters({ query, user, deviceId }) {
  // Filters: caseNumber, clientName, court, practiceArea, status, priority, advocate, nextHearing
  const filter = {};

  if (query?.caseNumber) {
    filter.caseNumber = { $regex: escapeRegex(String(query.caseNumber).trim()), $options: "i" };
  }

  if (query?.clientName) {
    filter.client = { $regex: escapeRegex(String(query.clientName).trim()), $options: "i" };
  }

  if (query?.court) {
    filter.court = { $regex: escapeRegex(String(query.court).trim()), $options: "i" };
  }

  if (query?.practiceArea) {
    filter.practiceArea = { $regex: escapeRegex(String(query.practiceArea).trim()), $options: "i" };
  }

  if (query?.status) {
    filter.status = String(query.status).trim();
  }

  if (query?.priority) {
    filter.priority = String(query.priority).trim();
  }

  if (query?.advocate) {
    filter.advocate = { $regex: escapeRegex(String(query.advocate).trim()), $options: "i" };
  }

  if (query?.nextHearing) {
    // Accept either YYYY-MM-DD or a date. Filter by exact date (ignoring time).
    const d = new Date(query.nextHearing);
    if (!Number.isNaN(d.getTime())) {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      filter.nextHearingDate = { $gte: start, $lte: end };
    }
  }

  // DEVICE-FIRST (P0 isolation fix): the public/no-login app always sends a
  // validated X-Device-Id. When present, the list is scoped to THAT identity
  // only — a JWT that may also be attached (e.g. a stale admin token left in
  // AsyncStorage from an earlier login) must never widen the scope. This was
  // the exact cross-user leak: admin token + new device id returned ALL cases.
  if (deviceId) {
    filter.deviceId = deviceId;
    return filter;
  }

  // JWT path (no device identity header — legacy/white-label API clients)
  if (user) {
    const role = user.role;
    if (role === "admin") return filter;

    if (role === "lawyer") {
      filter.assignedTo = toObjectIdIfPossible(user._id);
      return filter;
    }

    // client AND any other/unknown role: strict createdBy scope.
    // (Previously any role outside admin/lawyer/client fell through to an
    // UNFILTERED query — a second isolation hole. Now closed.)
    filter.createdBy = toObjectIdIfPossible(user._id);
    return filter;
  }

  // If neither user nor deviceId, return a query that matches nothing
  filter._id = null;
  return filter;
}

async function createCase({ payload, user, deviceId }) {
  const validation = validateCaseCreatePayload(payload);
  if (!validation.ok) {
    return validation;
  }
  
  if (!user && !deviceId) {
    return { ok: false, message: "Authentication or valid Device ID required to create a case" };
  }
  
  let assignedTo = null;
  let createdBy = null;
  let finalDeviceId = null;
  let timeline = [];
  
  // If no caseNumber is provided, generate a collision-resistant one
  let finalCaseNumber = payload.caseNumber;
  if (!finalCaseNumber || finalCaseNumber.trim() === "") {
    finalCaseNumber = `ANON-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  // DEVICE-FIRST (P0 isolation fix): the public/no-login app always sends a
  // validated X-Device-Id. When present, ownership is ALWAYS derived from it —
  // even if a stale JWT is also attached by the axios interceptor. Previously
  // a stale token routed creation down the authenticated path, which demanded
  // `assignedTo` (400) or crashed with a Mongoose CastError (HTTP 500) when
  // the form's free-text "Assigned To" field held a non-ObjectId value.
  if (deviceId) {
    finalDeviceId = deviceId;
    createdBy = null;
    assignedTo = null;
    timeline = []; // No actor for anonymous timeline
  } else if (user) {
    // Authenticated path (no device identity header — legacy/white-label clients)
    if (!payload.assignedTo) {
      return { ok: false, message: "assignedTo is required" };
    }

    // Validate the ObjectId FORMAT before hitting the DB. Passing a free-text
    // value to User.findById() threw a Mongoose CastError that escaped as an
    // unexplained HTTP 500. A bad client input must be a 400, not a 500.
    if (!mongoose.isValidObjectId(payload.assignedTo)) {
      return { ok: false, message: "assignedTo must be a valid user id" };
    }

    // Ensure assignedTo exists
    const assignedUser = await User.findById(payload.assignedTo).select("_id role");
    if (!assignedUser) {
      return { ok: false, message: "assignedTo user not found" };
    }
    
    assignedTo = payload.assignedTo;
    createdBy = user._id;
    // For authenticated, deviceId is null to avoid cross-contamination
    finalDeviceId = null; 
    
    timeline = [
      makeTimelineEntry({
        type: "Case Created",
        description: `Case created: ${finalCaseNumber}`,
        actor: user._id,
        meta: { caseNumber: finalCaseNumber },
      }),
    ];
  } else {
    // No identity at all — unreachable unless both are absent (guarded above)
    return { ok: false, message: "Authentication or valid Device ID required to create a case" };
  }

  // Prevent creating with status/stage values invalid (validation already checked if provided)
  const doc = await Case.create({
    caseTitle: payload.caseTitle,
    caseNumber: finalCaseNumber,

    client: payload.client,
    advocate: payload.advocate,

    court: payload.court,
    judge: payload.judge,

    oppositeParty: payload.oppositeParty,
    oppositeAdvocate: payload.oppositeAdvocate,

    practiceArea: payload.practiceArea,
    caseType: payload.caseType,

    filingDate: payload.filingDate,
    registrationDate: payload.registrationDate,
    nextHearingDate: payload.nextHearingDate,

    currentStage: payload.currentStage,
    status: payload.status,
    priority: payload.priority,

    description: payload.description,
    importantNotes: payload.importantNotes,

    caseTags: payload.caseTags,

    createdBy,
    assignedTo,
    deviceId: finalDeviceId,

    expenses: payload.expenses,
    documents: payload.documents,
    notes: payload.notes,
    timeline,
  });

  return { ok: true, case: doc };
}

async function updateCase({ id, payload, user, deviceId }) {
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Case not found", code: 404 };
  const existing = await Case.findById(id);
  if (!existing) return { ok: false, message: "Case not found", code: 404 };

  if (!canEditCase({ user, deviceId, caseDoc: existing })) {
    return { ok: false, message: "Forbidden: Not authorized to edit this case", code: 403 };
  }

  const validation = validateCaseUpdatePayload(payload);
  if (!validation.ok) return validation;

  // If status/next hearing changes, append timeline entries (only if user)
  const nextTimeline = [...(existing.timeline || [])];

  const update = { ...payload };
  // safety checks: ignore attempts to inject ownership
  delete update.caseNumber;
  delete update.deviceId;
  delete update.createdBy;
  delete update.assignedTo;

  if (user) {
    if (payload.nextHearingDate !== undefined) {
      nextTimeline.push(
        makeTimelineEntry({
          type: "Next Hearing Changed",
          description: `Next hearing updated for ${existing.caseNumber}`,
          actor: user._id,
          meta: { nextHearingDate: payload.nextHearingDate },
        }),
      );
    }
  
    if (payload.status !== undefined) {
      nextTimeline.push(
        makeTimelineEntry({
          type: "Status Updated",
          description: `Status updated for ${existing.caseNumber}`,
          actor: user._id,
          meta: { status: payload.status },
        }),
      );
    }
  }

  // Apply update + timeline
  Object.assign(existing, update);
  existing.timeline = nextTimeline;

  await existing.save();
  return { ok: true, case: existing };
}

async function deleteCase({ id, user, deviceId, req }) {
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, message: "Invalid case id", code: 400 };
  }

  const existing = await Case.findById(id);
  // 404 for both "never existed" and "already deleted" — no existence leak.
  if (!existing) return { ok: false, message: "Case not found", code: 404 };

  // Ownership + strict scope separation (see canDeleteCase): a device-scoped
  // case is only deletable by its owning device; a JWT-scoped case only by
  // the assigned/created user or an admin (JWT-only request). Cross-scope
  // deletes are always denied — even an admin JWT cannot touch a device case
  // through this public route.
  if (!canDeleteCase({ user, deviceId, caseDoc: existing })) {
    return { ok: false, message: "Forbidden: Not authorized to delete this case", code: 403 };
  }

  await removeCaseAndReferences({ caseDoc: existing, actor: user, req });
  return { ok: true, id: String(existing._id) };
}

/**
 * Permanently remove a case together with everything that references it.
 *
 * Ordering (sequential guarded operations — the case document is the commit
 * point and is deleted LAST):
 *   1. Cascade-clean related AIConversation + Notification records (idempotent
 *      deleteMany) so no orphaned references can outlive the case.
 *   2. Delete the case itself. If any earlier step fails, the case survives
 *      and nothing is left half-deleted; the cleanup is safe to re-run.
 *   3. Write the audit trail (best-effort — a failed audit write must never
 *      roll back a completed deletion, so it is logged loudly and swallowed).
 *
 * Case documents (and their embedded documents[] sub-documents / notes /
 * timeline) are deleted wholesale with the case. Documents are URL references
 * (no server-side file blobs are stored for cases), so no file storage step is
 * required; any future uploaded-file store must add its own cleanup here.
 */
async function removeCaseAndReferences({ caseDoc, actor, req }) {
  const caseId = caseDoc._id;
  const caseIdStr = String(caseId);

  const aiConversations = await AIConversation.deleteMany({
    $or: [
      { "metadata.caseId": caseIdStr },
      { "messages.metadata.caseId": caseIdStr },
    ],
  });

  const notifications = await Notification.deleteMany({ "meta.caseId": caseIdStr });

  // Commit point — the case is removed only after its dependents are gone.
  await Case.deleteOne({ _id: caseId });

  await writeCaseDeleteAudit({
    caseDoc,
    actor,
    req,
    detail: {
      aiConversationsRemoved: aiConversations.deletedCount,
      notificationsRemoved: notifications.deletedCount,
    },
  });

  return { id: caseIdStr };
}

/**
 * Best-effort audit trail for a case deletion. Never throws and never leaves
 * an unhandled rejection — an audit failure must not break (or roll back) an
 * already-completed deletion, so it is logged loudly and swallowed.
 */
async function writeCaseDeleteAudit({ caseDoc, actor, req, detail }) {
  try {
    await AuditLog.create({
      adminId: actor && actor._id,
      adminName: (actor && actor.name) || "system",
      adminEmail: (actor && actor.email) || "",
      adminType: (actor && actor.adminType) || "",
      action: "case.delete",
      module: "cases",
      recordId: String(caseDoc._id),
      recordLabel: (caseDoc.caseNumber || caseDoc.caseTitle || String(caseDoc._id)).slice(0, 300),
      before: {
        caseNumber: caseDoc.caseNumber,
        caseTitle: caseDoc.caseTitle,
        status: caseDoc.status,
        currentStage: caseDoc.currentStage,
        priority: caseDoc.priority,
        deviceId: caseDoc.deviceId,
        createdBy: caseDoc.createdBy ? String(caseDoc.createdBy) : null,
        assignedTo: caseDoc.assignedTo ? String(caseDoc.assignedTo) : null,
        documents: Array.isArray(caseDoc.documents) ? caseDoc.documents.length : 0,
        notes: Array.isArray(caseDoc.notes) ? caseDoc.notes.length : 0,
      },
      after: { deletedAt: new Date(), ...(detail || {}) },
      changedFields: ["deleted"],
      ip: req && req.ip ? req.ip : "",
      userAgent: req && req.headers ? String(req.headers["user-agent"] || "").slice(0, 300) : "",
    });
  } catch (auditErr) {
    logger.error("CASE DELETE AUDIT WRITE FAILED — deletion succeeded but was not audited", {
      recordId: String(caseDoc._id),
      error: auditErr.message,
    });
  }
}

async function getCaseById({ id, user, deviceId }) {
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Case not found", code: 404 };
  const doc = await Case.findById(id);
  if (!doc) return { ok: false, message: "Case not found", code: 404 };

  // View visibility — delegated to the pure canViewCase guard so the
  // read-scoping rule has a single, testable source of truth.
  if (!canViewCase({ user, deviceId, caseDoc: doc })) {
    // Deny without leaking whether the case exists for the JWT-only
    // (lawyer) path — callers that want a 404-on-deny (e.g. courtdesk)
    // handle it at the route layer.
    return { ok: false, message: "Forbidden", code: 403 };
  }
  return { ok: true, case: doc };
}

async function getAllCases({ query, user, deviceId }) {
  const pagination = validatePaginationAndSorting(query);
  if (!pagination.ok) return pagination;

  const { page, limit, sort } = pagination;

  const filter = buildCaseQueryFilters({ query, user, deviceId });

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Case.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Case.countDocuments(filter),
  ]);

  return { ok: true, cases: items, total, page, limit };
}

async function addTimeline({ id, type, description, actor, meta, user }) {
  const doc = await Case.findById(id);
  if (!doc) return { ok: false, message: "Case not found", code: 404 };

  // SECURITY (ownership fix): a timeline entry records an actor against a
  // case, so only an identity permitted to EDIT the case may append to its
  // timeline. Previously ANY authenticated user could append to ANY case
  // (an ownership gap); the JWT-only POST /cases/:id/timeline route now
  // passes req.user through and we enforce canEditCase here.
  if (!canEditCase({ user, caseDoc: doc })) {
    return { ok: false, message: "Forbidden", code: 403 };
  }

  doc.timeline = doc.timeline || [];
  doc.timeline.push(
    makeTimelineEntry({ type, description, actor, meta }),
  );
  await doc.save();

  return { ok: true, timeline: doc.timeline };
}

async function addNote({ id, note, user }) {
  const existing = await Case.findById(id);
  if (!existing) return { ok: false, message: "Case not found", code: 404 };
  if (!canEditCase({ user, caseDoc: existing })) {
    return { ok: false, message: "Forbidden", code: 403 };
  }

  existing.notes = existing.notes || [];
  existing.notes.push({
    title: note.title,
    description: note.description || "",
    author: user._id,
    date: note.date || new Date(),
  });

  existing.timeline = existing.timeline || [];
  existing.timeline.push(
    makeTimelineEntry({
      type: "Note Added",
      description: `Note added to ${existing.caseNumber}`,
      actor: user._id,
      meta: { title: note.title },
    }),
  );

  await existing.save();
  return { ok: true, notes: existing.notes, timeline: existing.timeline };
}

async function addDocument({ id, document, user }) {
  const existing = await Case.findById(id);
  if (!existing) return { ok: false, message: "Case not found", code: 404 };
  if (!canEditCase({ user, caseDoc: existing })) {
    return { ok: false, message: "Forbidden", code: 403 };
  }

  existing.documents = existing.documents || [];
  existing.documents.push({
    documentName: document.documentName,
    fileUrl: document.fileUrl,
    uploadedBy: user._id,
    uploadedAt: document.uploadedAt || new Date(),
    category: document.category || "Other",
  });

  existing.timeline = existing.timeline || [];
  existing.timeline.push(
    makeTimelineEntry({
      type: "Document Uploaded",
      description: `Document uploaded to ${existing.caseNumber}`,
      actor: user._id,
      meta: { documentName: document.documentName, category: document.category || "Other" },
    }),
  );

  await existing.save();
  return { ok: true, documents: existing.documents, timeline: existing.timeline };
}

async function updateExpenses({ id, expenses, user }) {
  const existing = await Case.findById(id);
  if (!existing) return { ok: false, message: "Case not found", code: 404 };
  if (!canEditCase({ user, caseDoc: existing })) {
    return { ok: false, message: "Forbidden", code: 403 };
  }

  existing.expenses = {
    courtFee: expenses.courtFee ?? existing.expenses?.courtFee ?? 0,
    stamp: expenses.stamp ?? existing.expenses?.stamp ?? 0,
    printing: expenses.printing ?? existing.expenses?.printing ?? 0,
    travel: expenses.travel ?? existing.expenses?.travel ?? 0,
    miscellaneous: expenses.miscellaneous ?? existing.expenses?.miscellaneous ?? 0,
  };

  existing.timeline = existing.timeline || [];
  existing.timeline.push(
    makeTimelineEntry({
      type: "Expense Updated",
      description: `Expenses updated for ${existing.caseNumber}`,
      actor: user._id,
      meta: expenses,
    }),
  );

  await existing.save();
  return { ok: true, expenses: existing.expenses, timeline: existing.timeline };
}

module.exports = {
  createCase,
  updateCase,
  deleteCase,
  getCaseById,
  getAllCases,
  addNote,
  addDocument,
  addTimeline,
  updateExpenses,
  // Cascade deletion core — reused by the admin panel so admins get the same
  // orphan cleanup + audit guarantee as the public route.
  removeCaseAndReferences,
  // Pure authorization guards (exported for security unit tests):
  canViewCase,
  canEditCase,
  canDeleteCase,
};

