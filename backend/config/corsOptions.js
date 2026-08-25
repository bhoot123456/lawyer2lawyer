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
 *   the CORS_ORIGIN env var (comma-separated allowlist of FULL origins, i.e.
 *   scheme + host + port, e.g. `https://app.example.com`). When CORS_ORIGIN is
 *   not configured in production, non-loopback cross-origin browser requests
 *   are DENIED by default; only same-origin / origin-less requests (curl,
 *   mobile native apps, SSR) proceed.
 * - LOOPBACK origins (`http://localhost:*`, `http://127.0.0.1:*`,
 *   `http://[::1]:*`) are ALWAYS allowed, including in production. Rationale:
 *   browsers only ever attach a loopback Origin header for pages served by
 *   software running on the end user's OWN machine — a third-party website can
 *   never claim `localhost`. This keeps local development (e.g. Expo web on
 *   http://localhost:8081) working against the production API without opening
 *   the API to arbitrary public websites. No wildcard is used anywhere.
 * - In NON-production (dev/test), when no allowlist is configured, the request
 *   origin is reflected for local-development convenience (preserves prior
 *   developer UX, e.g. LAN-device testing via http://192.168.x.x:8081).
 *
 * This module does NOT alter authentication or authorization. CORS only
 * governs whether a browser will allow a response to be read cross-origin;
 * protected routes still require valid authentication tokens.
 *
 * Production configuration (Railway):
 * ─────────────────────────────────────────────────────────
 *   Variable:       CORS_ORIGIN
 *   Required value: comma-separated full origins of every trusted browser
 *                   frontend, e.g.
 *                   CORS_ORIGIN=http://localhost:8081,http://127.0.0.1:8081,https://your-production-frontend.example
 *   Where:          Railway service → Variables
 *   Why:            without it, only loopback/dev origins may call the API
 *                   from a browser; any deployed web frontend would be blocked.
 *
 * Blocked cross-origin requests are logged (warn) so misconfiguration is
 * observable in Railway logs instead of surfacing only as silent browser
 * CORS errors.
 */

const logger = require("../utils/logger");

const isProduction = process.env.NODE_ENV === "production";

/**
 * Normalize an origin string so allowlist comparison is stable regardless of
 * how operators type values into Railway (case, trailing slash).
 * Returns null for empty/invalid input.
 */
function normalizeOrigin(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    // An origin is scheme + host(+port); drop anything else.
    return `${url.protocol}//${url.host.toLowerCase()}`;
  } catch {
    // Not a parsable absolute origin — fall back to basic cleanup so callers
    // still get a deterministic value (it simply won't match an allowlist).
    return trimmed.replace(/\/+$/, "");
  }
}

const allowedOrigins = (() => {
  if (!process.env.CORS_ORIGIN) return [];
  return process.env.CORS_ORIGIN.split(",")
    .map(normalizeOrigin)
    .filter(Boolean);
})();

// Hosts that can ONLY appear as Origin for pages served on the user's own
// machine. new URL("http://[::1]:8081").hostname === "[::1]".
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function isLoopbackOrigin(origin) {
  try {
    const url = new URL(origin);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      LOOPBACK_HOSTS.has(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

/**
 * cors-compatible origin function.
 * Signature: function (origin, callback)
 */
function corsOrigin(origin, callback) {
  // No Origin header => non-browser / same-origin / origin-less client.
  // These carry no cross-origin browser risk, so allow them through.
  if (!origin) return callback(null, true);

  const normalized = normalizeOrigin(origin);

  // Explicitly allowlisted origins (production control plane).
  if (normalized && allowedOrigins.includes(normalized)) {
    return callback(null, origin);
  }

  // Developer-machine origins: safe by construction (see header comment).
  if (normalized && isLoopbackOrigin(normalized)) {
    return callback(null, origin);
  }

  // Legacy dev/test convenience: with no allowlist configured, reflect the
  // request origin so LAN/device testing keeps working outside production.
  if (allowedOrigins.length === 0 && !isProduction) {
    return callback(null, origin);
  }

  // Deny: do not emit CORS headers. The request itself still completes (the
  // cors package merely omits Access-Control-* headers), so curl/mobile/SSR
  // clients are unaffected — only browsers will refuse to read the response.
  logger.warn("CORS: blocked request from disallowed origin", {
    origin,
    ...(isProduction && allowedOrigins.length === 0
      ? {
          hint:
            "CORS_ORIGIN is not set in production. Configure it on Railway with your trusted frontend origin(s) if a browser client should be allowed.",
        }
      : {}),
  });
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
corsOptions.isLoopbackOrigin = isLoopbackOrigin;
corsOptions.normalizeOrigin = normalizeOrigin;

module.exports = corsOptions;
