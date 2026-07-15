// Central validation helpers for Case management module.
// No new architecture: keep simple, explicit validations with consistent error messages.

const VALID_STATUS = new Set([
  "Pending",
  "Filed",
  "Notice Issued",
  "Reply Filed",
  "Evidence",
  "Arguments",
  "Reserved",
  "Disposed",
  "Closed",
]);

const VALID_PRIORITY = new Set(["Low", "Medium", "High", "Urgent"]);

const VALID_STAGE = new Set([
  "Draft",
  "Pending",
  "Filed",
  "Notice Issued",
  "Reply Filed",
  "Evidence",
  "Arguments",
  "Reserved",
  "Disposed",
  "Closed",
]);

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const toDateOrUndefined = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const normalizeString = (v) => (typeof v === "string" ? v.trim() : v);

function buildValidationError(message, details) {
  return {
    ok: false,
    message,
    ...(details ? { details } : {}),
  };
}

function validateCaseCreatePayload(payload) {
  const errors = [];

  const caseNumber = normalizeString(payload?.caseNumber);
  if (!isNonEmptyString(caseNumber)) errors.push("caseNumber is required");

  if (payload?.caseTitle !== undefined && typeof payload.caseTitle !== "string") {
    errors.push("caseTitle must be a string");
  }

  const requiredOwnership = ["assignedTo"];
  for (const k of requiredOwnership) {
    if (!payload?.[k]) errors.push(`${k} is required`);
  }

  // Enums
  if (payload?.status !== undefined) {
    if (!VALID_STATUS.has(payload.status)) errors.push("Invalid status");
  }

  if (payload?.priority !== undefined) {
    if (!VALID_PRIORITY.has(payload.priority)) errors.push("Invalid priority");
  }

  if (payload?.currentStage !== undefined) {
    if (!VALID_STAGE.has(payload.currentStage)) errors.push("Invalid currentStage");
  }

  // Date fields
  const dateFields = [
    "filingDate",
    "registrationDate",
    "nextHearingDate",
  ];
  for (const f of dateFields) {
    if (payload?.[f] !== undefined) {
      const d = toDateOrUndefined(payload[f]);
      if (d === null) errors.push(`${f} must be a valid date`);
    }
  }

  // Array fields
  if (payload?.caseTags !== undefined) {
    if (!Array.isArray(payload.caseTags) || payload.caseTags.some((t) => typeof t !== "string")) {
      errors.push("caseTags must be an array of strings");
    }
  }

  return errors.length
    ? buildValidationError("Invalid request payload", { errors })
    : { ok: true };
}

function validateCaseUpdatePayload(payload) {
  const errors = [];

  // caseNumber updates are allowed? For safety, we do NOT allow updating caseNumber.
  if (payload?.caseNumber !== undefined) {
    errors.push("caseNumber cannot be updated");
  }

  if (payload?.status !== undefined && !VALID_STATUS.has(payload.status)) errors.push("Invalid status");
  if (payload?.priority !== undefined && !VALID_PRIORITY.has(payload.priority)) errors.push("Invalid priority");
  if (payload?.currentStage !== undefined && !VALID_STAGE.has(payload.currentStage)) errors.push("Invalid currentStage");

  const dateFields = [
    "filingDate",
    "registrationDate",
    "nextHearingDate",
  ];
  for (const f of dateFields) {
    if (payload?.[f] !== undefined) {
      const d = toDateOrUndefined(payload[f]);
      if (d === null) errors.push(`${f} must be a valid date`);
    }
  }

  if (payload?.caseTags !== undefined) {
    if (!Array.isArray(payload.caseTags) || payload.caseTags.some((t) => typeof t !== "string")) {
      errors.push("caseTags must be an array of strings");
    }
  }

  return errors.length
    ? buildValidationError("Invalid request payload", { errors })
    : { ok: true };
}

function validatePaginationAndSorting(query) {
  const page = Number(query?.page ?? 1);
  const limit = Number(query?.limit ?? 10);

  if (!Number.isFinite(page) || page < 1) {
    return buildValidationError("Invalid pagination", { errors: ["page must be >= 1"] });
  }
  if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
    return buildValidationError("Invalid pagination", { errors: ["limit must be between 1 and 100"] });
  }

  const sortBy = typeof query?.sortBy === "string" ? query.sortBy : "createdAt";
  const sortOrder = query?.sortOrder === "asc" ? 1 : -1;

  // Restrict sortBy to safe known fields
  const allowedSortFields = new Set([
    "createdAt",
    "updatedAt",
    "nextHearingDate",
    "priority",
    "status",
    "caseNumber",
  ]);
  const finalSortBy = allowedSortFields.has(sortBy) ? sortBy : "createdAt";

  return {
    ok: true,
    page,
    limit,
    sort: { [finalSortBy]: sortOrder },
  };
}

module.exports = {
  validateCaseCreatePayload,
  validateCaseUpdatePayload,
  validatePaginationAndSorting,
  VALID_STATUS,
  VALID_PRIORITY,
  VALID_STAGE,
};

