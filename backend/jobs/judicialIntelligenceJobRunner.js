/**
 * Judicial Intelligence Job Runner (v1)
 *
 * Purpose:
 * - Provide a cron-like scheduled entrypoint.
 * - Calls ingestion adapters (to be implemented per source/type).
 *
 * NOTE:
 * - The codebase currently doesn't include a cron dependency.
 * - This runner is designed to be used in TWO ways:
 *   1) By adding a cron dependency later (node-cron)
 *   2) By using setInterval in process for local dev
 *
 * In this repository iteration we keep it lightweight and export a `start()`
 * that uses setInterval.
 */

const { newIngestionRunId } = require("../services/judicialIntelligenceIngestionService");

// Placeholder: ingestion adapters will be added progressively.
// For now, we only log the run.
async function runJudicialIntelligenceIngestionV1({ logger = console } = {}) {
  const runId = newIngestionRunId("jie-v1");
  logger.log(`[JIE] Starting ingestion run: ${runId}`);

  // TODO: Call concrete adapters:
  // - supreme court judgments
  // - high court judgments
  // - cause list
  // - court holidays
  // - circulars / government notifications
  // - bare act amendments
  // - legal news

  logger.log(`[JIE] Completed ingestion run (v1 placeholder): ${runId}`);
}

function start({ intervalMs = 1000 * 60 * 60 * 24, logger = console } = {}) {
  // Default: once per day. For local dev you can lower interval.
  // intervalMs will be overridden by process env in backend/index.js later.

  // Run once at startup as well.
  runJudicialIntelligenceIngestionV1({ logger }).catch((e) => {
    logger.error("[JIE] Ingestion run failed:", e);
  });

  setInterval(() => {
    runJudicialIntelligenceIngestionV1({ logger }).catch((e) => {
      logger.error("[JIE] Ingestion run failed:", e);
    });
  }, intervalMs);
}

module.exports = {
  start,
  runJudicialIntelligenceIngestionV1,
};

