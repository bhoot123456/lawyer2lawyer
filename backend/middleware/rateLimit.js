/**
 * Lightweight, dependency-free IP-based rate limiter.
 *
 * Why a custom limiter (instead of express-rate-limit):
 * - express-rate-limit is NOT installed in this project and we want the
 *   smallest safe change with no new dependencies to fetch/install.
 * - The anonymous AI endpoints only need basic request-shaping protection.
 *
 * Design:
 * - In-memory, single-instance. Suitable for the current single-process
 *   deployment model. For multi-instance deployments, swap the in-memory store
 *   for a shared store (e.g., Redis) — out of scope here.
 * - Two pre-configured limiters:
 *     1. AI endpoints (rateLimit) — moderate, configurable via AI_* env vars
 *     2. Auth endpoints (authRateLimit) — stricter, configurable via AUTH_* env vars
 * - Returns HTTP 429 with a `Retry-After` header and a stable JSON body on
 *   overflow. This does NOT change the success response contract of protected
 *   routes (only adds a 429 path).
 *
 * NOTE: This intentionally only rate-shapes requests; it does not log request
 * bodies or secrets. The OpenRouter API key is never read or logged here.
 */

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    // First hop in the forwarded chain is the originating client.
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

/**
 * Factory that creates an IP-based rate limiter.
 * @param {Object} config
 * @param {boolean} [config.enabled]        - whether limiting is active
 * @param {number}  [config.windowMs]       - time window in ms
 * @param {number}  [config.max]            - max requests per window per IP
 * @param {string}  [config.message]         - 429 response message
 */
function createRateLimiter(config = {}) {
  const enabled = config.enabled !== false;
  const windowMs = config.windowMs || 60000;
  const max = config.max || 60;
  const message =
    config.message ||
    "Too many requests. Please slow down and retry later.";

  // In-memory store: ip -> { count, resetTs }
  const store = new Map();

  // Purge expired entries periodically to bound memory usage.
  const cleanupIntervalMs = Math.min(windowMs, 60000);
  let cleanupStarted = false;
  function startCleanup() {
    if (cleanupStarted) return;
    cleanupStarted = true;
    const interval = setInterval(() => {
      const now = Date.now();
      for (const key of store.keys()) {
        const entry = store.get(key);
        if (entry && entry.resetTs <= now) store.delete(key);
      }
    }, cleanupIntervalMs);
    if (typeof interval.unref === "function") interval.unref();
  }
  startCleanup();

  function rateLimit(req, res, next) {
    if (!enabled) return next();

    const key = getClientIp(req);
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || entry.resetTs <= now) {
      entry = { count: 0, resetTs: now + windowMs };
    }

    entry.count += 1;
    store.set(key, entry);

    if (entry.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.resetTs - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({
        success: false,
        message: message,
      });
    }

    next();
  }

  rateLimit.reset = () => store.clear();
  rateLimit.getStore = () => store;
  rateLimit.isEnabled = () => enabled;
  rateLimit.windowMs = windowMs;
  rateLimit.max = max;

  return rateLimit;
}

// ── Pre-configured limiters ──

// AI endpoints: moderate rate limit (public-facing, anonymous-accessible)
const aiRateLimit = createRateLimiter({
  enabled: (process.env.AI_RATE_LIMIT_ENABLED || "true").toLowerCase() !== "false",
  windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 60000,
  max: Number(process.env.AI_RATE_LIMIT_MAX) || 60,
});

// Auth endpoints: stricter rate limit (login/register/refresh — abuse-prone)
const authRateLimit = createRateLimiter({
  enabled: (process.env.AUTH_RATE_LIMIT_ENABLED || "true").toLowerCase() !== "false",
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 60000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: "Too many authentication attempts. Please try again later.",
});

// Default export is the AI rate limiter (backward compatibility for existing
// require() callers that use it as `const rateLimit = require(...)`).
module.exports = aiRateLimit;
module.exports.createRateLimiter = createRateLimiter;
module.exports.rateLimit = aiRateLimit;
module.exports.authRateLimit = authRateLimit;
module.exports.windowMs = aiRateLimit.windowMs;
module.exports.max = aiRateLimit.max;
module.exports.isEnabled = aiRateLimit.isEnabled;
module.exports.getStore = aiRateLimit.getStore;
module.exports.reset = aiRateLimit.reset;
