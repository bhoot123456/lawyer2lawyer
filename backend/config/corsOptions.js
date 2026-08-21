/**
 * Explicit CORS configuration (security hardening).
 *
 * Background:
 * - The previous config reflected ANY request origin when the CORS_ORIGIN
 *   environment variable was unset (`origin: ... : true`). That effectively
 *   disables the same-origin policy for browsers in production, which is a
 *   meaningful cross-origin risk.
 *
 * Hardening:
 * - In PRODUCTION, cross-origin requests are ONLY allowed for origins listed in
 *   the CORS_ORIGIN env var (comma-separated allowlist). When CORS_ORIGIN is
 *   not configured in production, cross-origin browser requests are DENIED by
 *   default; only same-origin / origin-less requests (curl, mobile, SSR) proceed.
 * - In NON-production (dev/test), when no allowlist is configured, the request
 *   origin is reflected for local-development convenience (preserves prior
 *   developer UX).
 *
 * This module does NOT alter authentication or authorization. CORS only
 * governs whether a browser will allow a response to be read cross-origin;
 * protected routes still require valid authentication tokens.
 *
 * Configure your real frontend origin(s) in production via the CORS_ORIGIN
 * environment variable, e.g.:
 *   CORS_ORIGIN=https://app.lawyer2lawyer.example,https://admin.lawyer2lawyer.example
 */
const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = (() => {
  if (!process.env.CORS_ORIGIN) return [];
  return process.env.CORS_ORIGIN.split(",")
    .map((origin) => origin && origin.trim())
    .filter(Boolean);
})();

/**
 * cors-compatible origin function.
 * Signature: function (origin, callback)
 */
function corsOrigin(origin, callback) {
  // No Origin header => non-browser / same-origin / origin-less client.
  // These carry no cross-origin browser risk, so allow them through.
  if (!origin) return callback(null, true);

  if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
    return callback(null, origin);
  }

  if (allowedOrigins.length === 0 && !isProduction) {
    // Dev/test convenience: reflect the request origin when no allowlist is set.
    return callback(null, origin);
  }

  // Production without a matching allowlist => deny cross-origin access.
  return callback(null, false);
}

const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Expose helpers for tests / diagnostics (harmless extra keys for the cors lib).
corsOptions.allowedOrigins = allowedOrigins;
corsOptions.isProduction = isProduction;

module.exports = corsOptions;
