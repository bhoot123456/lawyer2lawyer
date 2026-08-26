/**
 * Shared HTTP error helpers.
 *
 * Purpose:
 * - Give every controller/service one consistent way to classify expected
 *   client errors (invalid identifiers, missing resources, duplicates,
 *   validation failures) instead of letting them fall through as 500s.
 * - Keep Mongoose-specific error types (CastError, ValidationError,
 *   duplicate key) out of controllers by classifying them centrally.
 */

const mongoose = require("mongoose");

/**
 * True when `id` is a string/ObjectId that Mongoose can cast to an ObjectId.
 */
function isValidObjectId(id) {
  if (id === null || id === undefined) return false;
  try {
    return mongoose.Types.ObjectId.isValid(String(id));
  } catch {
    return false;
  }
}

/**
 * Create an Error carrying an HTTP status code.
 */
function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function badRequest(message = "Invalid request") {
  return httpError(400, message);
}

function notFound(message = "Resource not found") {
  return httpError(404, message);
}

function forbidden(message = "Forbidden") {
  return httpError(403, message);
}

function unauthorized(message = "Authentication required") {
  return httpError(401, message);
}

function conflict(message = "Conflict") {
  return httpError(409, message);
}

/**
 * Classify an unknown error into a deliberate HTTP response.
 *
 * Classification rules:
 * - err.statusCode already set  -> honour it
 * - Mongoose CastError          -> 400 (malformed identifier)
 * - Mongoose ValidationError    -> 400 (malformed payload)
 * - Mongo duplicate key 11000   -> 409
 * - anything else               -> fallbackStatus (default 500)
 *
 * In production, unexpected (5xx) messages are replaced with a generic
 * message so internal details never reach the client.
 */
function sendClassifiedError(res, err, options = {}) {
  const { fallbackMessage = "Internal server error", logger } = options;
  const isProduction = process.env.NODE_ENV === "production";

  let statusCode = err?.statusCode || err?.status || null;
  let message = err?.message || fallbackMessage;

  if (!statusCode && err?.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier format";
  }

  if (!statusCode && err?.name === "ValidationError") {
    statusCode = 400;
    message = isProduction ? "Validation failed" : message;
  }

  if (!statusCode && err?.code === 11000) {
    statusCode = 409;
    message = "Duplicate resource";
  }

  if (!statusCode) {
    statusCode = 500;
  }

  // Never leak internals for unexpected server errors in production.
  if (isProduction && statusCode >= 500) {
    message = fallbackMessage;
  }

  if (typeof logger === "function") {
    logger(err, statusCode);
  } else if (statusCode >= 500) {
    console.error("[httpError] unclassified error:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = {
  isValidObjectId,
  httpError,
  badRequest,
  notFound,
  forbidden,
  unauthorized,
  conflict,
  sendClassifiedError,
};