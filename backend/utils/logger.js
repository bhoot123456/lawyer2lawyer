/**
 * Simple structured logger for production-safe operational logging.
 *
 * - Production: emits JSON lines for easy ingestion by log aggregators.
 * - Development: emits human-readable, colored output via console.
 *
 * This module does NOT log secrets. Callers must never pass tokens,
 * passwords, or credentials as metadata. The request logging middleware
 * in index.js only logs method, path, status, duration, and IP.
 */

const isProduction = process.env.NODE_ENV === "production";

function format(level, message, meta) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (meta) {
    for (const key of Object.keys(meta)) {
      entry[key] = meta[key];
    }
  }

  if (isProduction) {
    return JSON.stringify(entry);
  }

  const metaStr =
    meta && Object.keys(meta).length > 0
      ? " " + JSON.stringify(meta)
      : "";
  return `${entry.timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
}

module.exports = {
  info: (msg, meta) => console.log(format("info", msg, meta)),
  log: (msg, meta) => console.log(format("info", msg, meta)),
  warn: (msg, meta) => console.warn(format("warn", msg, meta)),
  error: (msg, meta) => console.error(format("error", msg, meta)),
  debug: (msg, meta) => console.log(format("debug", msg, meta)),
  isProduction,
};
