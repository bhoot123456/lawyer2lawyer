require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");

const authRoutes = require("./routes/auth");
const lawyerRoutes = require("./routes/lawyers");

const stateRoutes = require("./routes/states");
const bareActsRoutes = require("./routes/bare-acts");
const criminalLawActsRoutes = require("./routes/criminal-law-acts");
const miscFormsRoutes = require("./routes/misc-forms");
const tribunalRoutes = require("./routes/tribunalRoutes");
const caseRoutes = require("./routes/cases");
const revenueCourtRoutes = require("./routes/revenue-court");
const taxCorporateRoutes = require("./routes/tax-corporate");
const knowledgeHubRoutes = require("./routes/knowledge-hub");
const draftLibraryRoutes = require("./routes/draft-library");
const adminRoutes = require("./routes/admin");
const adminCmsRoutes = require("./routes/admin-cms");
const adminSystemRoutes = require("./routes/admin-system");
const notificationRoutes = require("./routes/notifications");
const aiRoutes = require("./routes/ai");
const judicialIntelligenceSearchRoutes = require("./routes/judicial-intelligence-search");
const supremeCourtRoutes = require("./routes/supreme-court");
const bareActsFavouritesRoutes = require("./routes/bare-acts-favourites");
const bareActsRecentlyOpenedRoutes = require("./routes/bare-acts-recently-opened");
const dashboardRoutes = require("./routes/dashboard");
const judgeDirectoryRoutes = require("./routes/judge-directory");
const districtCourtJudgesRoutes = require("./routes/district-court-judges");
const policeStationRoutes = require("./routes/police-stations");

const logger = require("./utils/logger");
const { authRateLimit } = require("./middleware/rateLimit");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

// ─────────────────────────────────────────────────────────
// Fail-fast: production must have critical secrets configured.
// This prevents the app from booting with development defaults
// that would leave it insecure or non-functional in production.
// ─────────────────────────────────────────────────────────
if (isProduction) {
  const requiredSecrets = ["JWT_SECRET", "MONGO_URI", "OPENROUTER_API_KEY"];
  const missing = requiredSecrets.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    for (const key of missing) {
      logger.error("Missing required environment variable in production", { key });
    }
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────
// Security headers (Step 5)
// ─────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  }),
);

// Prevent search engines from indexing API responses.
app.use((req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex");
  next();
});

// ─────────────────────────────────────────────────────────
// Reverse-proxy awareness (Step 2)
// Express must trust the first proxy hop so that req.ip,
// x-forwarded-for, and x-forwarded-proto are parsed correctly
// when deployed behind a load balancer / reverse proxy that
// terminates TLS.
// ─────────────────────────────────────────────────────────
app.set("trust proxy", isProduction ? 1 : 0);

// ─────────────────────────────────────────────────────────
// CORS (Step 3 — hardened via corsOptions.js)
//
// Production note: CORS_ORIGIN controls which NON-loopback browser origins
// may call this API cross-origin. Loopback dev origins (localhost /
// 127.0.0.1 / [::1]) are always allowed so local frontends keep working.
// Warn loudly at boot if production is missing the variable, otherwise a
// deployed web frontend silently fails with browser CORS errors.
// ─────────────────────────────────────────────────────────
app.use(cors(require("./config/corsOptions")));

if (isProduction && !process.env.CORS_ORIGIN) {
  logger.warn(
    "CORS_ORIGIN is not configured in production. Browser cross-origin access is limited to loopback dev origins (localhost / 127.0.0.1 / [::1]). Set CORS_ORIGIN on Railway to a comma-separated list of trusted frontend origins (e.g. http://localhost:8081,https://your-frontend.example) if a deployed web frontend needs access.",
  );
}

// ─────────────────────────────────────────────────────────
// Request parsing (Step 1) — size limits prevent DoS
// ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// ─────────────────────────────────────────────────────────
// Structured request logging (Step 8)
// Logs method, path, status, duration, and client IP.
// Never logs request bodies, tokens, or secrets.
// ─────────────────────────────────────────────────────────
const crypto = require("crypto");
app.use((req, res, next) => {
  const startTime = Date.now();
  req.id = crypto.randomUUID();

  res.on("finish", () => {
    logger.info("HTTP request", {
      id: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - startTime,
      ip: req.ip,
    });
  });

  next();
});

// ─────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────
app.use("/api/auth", authRateLimit, authRoutes);

app.use("/api/lawyers", lawyerRoutes);

app.use("/api/states", stateRoutes);

// Recently Opened must be registered before favourites/other bare-acts routes
// to avoid potential route conflicts.
app.use("/api/bare-acts", bareActsRecentlyOpenedRoutes);
app.use("/api/bare-acts", bareActsFavouritesRoutes);
app.use("/api/bare-acts", bareActsRoutes);

app.use("/api/criminal-law-acts", criminalLawActsRoutes);

app.use("/api/misc-forms", miscFormsRoutes);
app.use("/api/tribunals", tribunalRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/revenue-court", revenueCourtRoutes);
app.use("/api/tax-corporate", taxCorporateRoutes);
app.use("/api/knowledge-hub", knowledgeHubRoutes);
app.use("/api/draft-library", draftLibraryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/cms", adminCmsRoutes);
app.use("/api/admin/system", adminSystemRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/judicial-intelligence", judicialIntelligenceSearchRoutes);
app.use("/api/supreme-court", supremeCourtRoutes);

// Judge Directory — public endpoint to fetch published judges by courtId
app.use("/api/judge-directory", judgeDirectoryRoutes);

// District Court Judges — public endpoint for district court judge listings
app.use("/api/district-courts", districtCourtJudgesRoutes);

// Police Stations Directory — public read endpoints
app.use("/api/police-stations", policeStationRoutes);

// Dashboard-related endpoints (client-calls, court-holidays, daily-cause-list, legal-news, activity/recent, dashboard/stats)
app.use("/api", dashboardRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Lawyer2Lawyer backend is running" });
});

// ─────────────────────────────────────────────────────────
// Android App Links — Digital Asset Links verification
// GET /.well-known/assetlinks.json
// Required for Android App Link autoVerify to succeed.
// IMPORTANT: Replace REPLACE_WITH_EAS_SHA256_FINGERPRINT below
// with the actual SHA256 certificate fingerprint from your EAS
// Android production signing credential BEFORE deploying.
// To obtain it: run `eas credentials -p android` (interactive),
// then copy the SHA256 Fingerprint shown for the production keystore.
// The fingerprint format is: AB:CD:EF:... (colon-separated hex, uppercase)
// ─────────────────────────────────────────────────────────
app.get("/.well-known/assetlinks.json", (_req, res) => {
  const sha256Fingerprint = (process.env.ANDROID_SHA256_FINGERPRINT || "").trim();

  // PRODUCTION SAFETY (no fabricated data):
  // Android App Links must only advertise the REAL SHA256 fingerprint of the
  // EAS Android production signing keystore (obtain via `eas credentials
  // -p android`, interactive; see .env.example?. When it is not configured,
  // this endpoint returns 404 instead of serving a placeholder/substituted
  // value -- a fake digest would break autoVerify and misrepresent a real
  // credential. The endpoint activates only once a genuine fingerprint is set.
  const looksLikePlaceholder = /REPLACE|example/i.test(sha256Fingerprint);
  if (!sha256Fingerprint || looksLikePlaceholder) {
    logger.warn(
      "ANDROID_SHA256_FINGERPRINT is not configured; /.well-known/assetlinks.json is disabled (no fabricated fingerprint served).",
      );
    return res.status(404).json({
      success: false,
      message: "Android App Links are not configured.",
    });
  }


  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.lawyer2lawyer.mobile",
        sha256_cert_fingerprints: [sha256Fingerprint],
      },
    },
  ]);
});

// ─────────────────────────────────────────────────────────
// Health checks (Step 13)
// /health  — basic liveness (always returns 200 if process is alive)
// /health/ready — readiness (200 only if database is connected)
// ─────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

app.get("/health/ready", (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    ok: dbReady,
    db: dbReady ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────
// 404 handler — catch unmatched routes
// ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "The requested resource was not found.",
  });
});

// ─────────────────────────────────────────────────────────
// Centralized error handler (Step 9)
// In production: never exposes stack traces, file paths, or
// internal details. In development: includes stack for debugging.
//
// Error classification (root-cause fix for "invalid ObjectId → 500"):
// - Mongoose CastError       -> 400 (malformed identifier in URL/body)
// - Mongoose ValidationError -> 400 (malformed payload)
// - Mongo duplicate key      -> 409 (conflict)
// Controllers that classify their own errors take precedence; this is
// defense-in-depth for anything that reaches the global handler.
// ─────────────────────────────────────────────────────────
function classifyErrorStatus(err) {
  if (err?.statusCode || err?.status) {
    return err.statusCode || err.status;
  }
  if (err?.name === "CastError") return 400;
  if (err?.name === "ValidationError") return 400;
  if (err?.code === 11000) return 409;
  return 500;
}

app.use((err, req, res, _next) => {
  const classified = classifyErrorStatus(err);

  logger.error("Unhandled route error", {
    id: req.id,
    path: req.path,
    method: req.method,
    status: classified,
    error: err.message,
  });

  if (res.headersSent) {
    return;
  }

  const statusCode = classified;

  if (isProduction) {
    // Production: only expose safe messages
    const isClientError = statusCode >= 400 && statusCode < 500;
    res.status(statusCode).json({
      success: false,
      message: isClientError
        ? err.message
        : "Internal server error",
    });
  } else {
    // Development: include stack trace for debugging
    res.status(statusCode).json({
      success: false,
      message: err.message,
      ...(err.stack ? { stack: err.stack } : {}),
    });
  }
});

// ─────────────────────────────────────────────────────────
// Server startup with MongoDB connection
// ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// In production, MONGO_URI is validated above (fail-fast).
// In development, fall back to local MongoDB for convenience.
const MONGO_URI =
  process.env.MONGO_URI ||
  (isProduction
    ? null
    : "mongodb://127.0.0.1:27017/lawyer2lawyer");

mongoose.set("strictQuery", false);

const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true,
  autoIndex: isProduction ? false : true,
};

let server;

const MONGO_CONNECT_MAX_ATTEMPTS = Number(process.env.MONGO_CONNECT_MAX_ATTEMPTS) || 5;
const MONGO_CONNECT_RETRY_DELAY_MS = Number(process.env.MONGO_CONNECT_RETRY_DELAY_MS) || 3000;

/**
 * Connect to MongoDB with bounded retries so a transient network failure
 * at boot does not crash the deployment before the process manager can
 * stabilize. Fails permanently after MONGO_CONNECT_MAX_ATTEMPTS attempts.
 */
async function connectMongoWithRetry(attempt = 1) {
  try {
    await mongoose.connect(MONGO_URI, mongoOptions);
  } catch (err) {
    logger.error("MongoDB connection attempt failed", {
      attempt,
      maxAttempts: MONGO_CONNECT_MAX_ATTEMPTS,
      error: err.message,
    });

    if (attempt >= MONGO_CONNECT_MAX_ATTEMPTS) {
      throw err;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, MONGO_CONNECT_RETRY_DELAY_MS),
    );
    return connectMongoWithRetry(attempt + 1);
  }
}

connectMongoWithRetry()
  .then(() => {
    logger.info("MongoDB connected", {
      db: mongoose.connection.name,
      host: mongoose.connection.host,
    });

    // Start Judicial Intelligence Engine cron jobs (v1 placeholder runner)
    try {
      const judicialJobRunner = require("./jobs/judicialIntelligenceJobRunner");
      const intervalMs =
        process.env.JIE_JOB_INTERVAL_MS &&
        Number.isFinite(Number(process.env.JIE_JOB_INTERVAL_MS))
          ? Number(process.env.JIE_JOB_INTERVAL_MS)
          : undefined;

      judicialJobRunner.start({
        intervalMs: intervalMs || undefined,
        logger,
      });
    } catch (e) {
      logger.error("Failed to start JIE job runner", { error: e.message });
    }

    server = app.listen(PORT, () => {
      logger.info("Server started", {
        port: PORT,
        env: process.env.NODE_ENV || "development",
      });
    });

    // Socket-level timeout: closes idle connections (Step 7)
    server.timeout = 30000;
    server.keepAliveTimeout = 65000;
  })
  .catch((err) => {
    logger.error("MongoDB connection failed after all retries", {
      error: err.message,
    });
    process.exit(1);
  });

// ─────────────────────────────────────────────────────────
// Graceful shutdown (Step 11)
// On SIGTERM/SIGINT: stop accepting new requests, finish active
// requests, close MongoDB, then exit cleanly.
// ─────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  logger.info("Shutting down gracefully", { signal });

  const closeDb = async () => {
    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
    } catch (err) {
      logger.error("Error closing MongoDB connection", { error: err.message });
    }
  };

  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed");
      await closeDb();
      process.exit(0);
    });

    // Force-exit after 30 seconds if connections don't close
    setTimeout(() => {
      logger.error(
        "Could not close connections within 30s, forcing exit",
      );
      process.exit(1);
    }, 30000);
  } else {
    await closeDb();
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ─────────────────────────────────────────────────────────
// Process-level error handlers (Step 10)
// Log the error and exit so the process manager can restart.
// Do NOT attempt to continue running after uncaught exceptions.
// ─────────────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { error: err.message, stack: err.stack });
  setTimeout(() => process.exit(1), 1000);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    error: reason instanceof Error ? reason.message : String(reason),
  });
});
