/**
 * Validation helpers for Police Station management module.
 *
 * Follows the same style as caseValidation.js:
 * - Explicit, simple validations with consistent error messages.
 * - Returns { ok: true } on success or { ok: false, message, details } on failure.
 */

const VALID_STATUS = new Set(["draft", "published", "archived"]);
const VALID_TYPE = new Set([
  "Police Station",
  "Thana",
  "Detective Unit",
  "Sub-Divisional Special Unit",
]);

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const toDateOrUndefined = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
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

/**
 * Validate the payload for creating or updating a police station.
 * `isUpdate` allows null for optional fields on partial updates.
 */
function validatePoliceStationPayload(payload, isUpdate = false) {
  const errors = [];

  if (!isUpdate) {
    // Create requires: name, district, subdivision
    const name = normalizeString(payload?.name);
    if (!isNonEmptyString(name)) {
      errors.push("name is required");
    }

    const district = normalizeString(payload?.district);
    if (!isNonEmptyString(district)) {
      errors.push("district is required");
    }

    const subdivision = normalizeString(payload?.subdivision);
    if (!isNonEmptyString(subdivision)) {
      errors.push("subdivision is required");
    }
  }

  // Type validation (optional)
  if (payload?.type !== undefined) {
    const t = normalizeString(payload.type);
    if (t && !VALID_TYPE.has(t)) {
      errors.push(`Invalid type. Must be one of: ${Array.from(VALID_TYPE).join(", ")}`);
    }
  }

  // Status validation (optional)
  if (payload?.status !== undefined) {
    if (!VALID_STATUS.has(payload.status)) {
      errors.push(`Invalid status. Must be one of: ${Array.from(VALID_STATUS).join(", ")}`);
    }
  }

  // isActive validation (optional)
  if (payload?.isActive !== undefined && typeof payload.isActive !== "boolean") {
    errors.push("isActive must be a boolean");
  }

  // displayOrder validation (optional)
  if (payload?.displayOrder !== undefined) {
    const n = Number(payload.displayOrder);
    if (!Number.isFinite(n) || n < 0) {
      errors.push("displayOrder must be a non-negative number");
    }
  }

  // lastVerified date validation (optional)
  if (payload?.lastVerified !== undefined) {
    const d = toDateOrUndefined(payload.lastVerified);
    if (d === null) {
      errors.push("lastVerified must be a valid date");
    }
  }

  // location validation (optional)
  if (payload?.location !== undefined && payload.location !== null) {
    const loc = payload.location;
    if (typeof loc !== "object" || Array.isArray(loc)) {
      errors.push("location must be an object");
    } else {
      if (typeof loc.latitude !== "undefined" && loc.latitude !== null) {
        const lat = Number(loc.latitude);
        if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
          errors.push("location.latitude must be a number between -90 and 90");
        }
      }
      if (typeof loc.longitude !== "undefined" && loc.longitude !== null) {
        const lng = Number(loc.longitude);
        if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
          errors.push("location.longitude must be a number between -180 and 180");
        }
      }
    }
  }

  // sho validation (optional — must be object if provided)
  if (payload?.sho !== undefined && payload.sho !== null) {
    if (typeof payload.sho !== "object" || Array.isArray(payload.sho)) {
      errors.push("sho must be an object");
    }
  }

  return errors.length
    ? buildValidationError("Invalid request payload", { errors })
    : { ok: true };
}

module.exports = {
  validatePoliceStationPayload,
  VALID_STATUS,
  VALID_TYPE,
};
