const router = require("express").Router();
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const { rateLimit } = require("../middleware/rateLimit");
const aiController = require("../controllers/aiController");

// ──────────────────────────────────────────────
// PUBLIC AI endpoints (optional auth)
// These support BOTH logged-in and anonymous/public users (Floating AI agent, public chat)
// Using optionalAuth middleware so that authenticated users are properly identified
// while anonymous users can still access these endpoints without a token.
// ──────────────────────────────────────────────
// SECURITY: Anonymous AI endpoints are rate-limited (lightweight, in-memory,
// IP-based) to prevent abuse/flooding. This does NOT change the success response
// contract of these endpoints — it only adds an HTTP 429 path on overflow.
// Configure with AI_RATE_LIMIT_MAX / AI_RATE_LIMIT_WINDOW_MS / AI_RATE_LIMIT_ENABLED.

// IMPORTANT: Specific sub-routes must be registered BEFORE the generic "/chat" route
// to ensure Express 5 (path-to-regexp v8) matches them correctly.

// Chat reset — must come BEFORE /chat to avoid being swallowed by the generic route
router.post("/chat/reset", rateLimit, optionalAuth, aiController.resetConversation);

// Chat continue — must come BEFORE /chat for the same reason
router.post("/chat/continue", rateLimit, optionalAuth, aiController.continueChat);

// Generic chat endpoint — must come AFTER specific sub-routes
router.post("/chat", rateLimit, optionalAuth, aiController.sendChatMessage);

// Conversation creation and retrieval — public users can start and restore conversations
router.post("/conversations", rateLimit, optionalAuth, aiController.createConversation);

// ──────────────────────────────────────────────
// PROTECTED AI endpoints (auth required)
// These require a logged-in user (admin/user management, history, etc.)
// ──────────────────────────────────────────────

// Conversation listing and management (auth-only)
// NOTE: "/conversations/search" MUST be registered BEFORE "/conversations/:id"
// otherwise GET /api/ai/conversations/search is captured by the :id route
// (id="search") and returns a wrong 404/CastError instead of search results.
router.get("/conversations", auth, aiController.listConversations);
router.get("/conversations/search", auth, aiController.searchConversations);
router.get("/conversations/:id", rateLimit, optionalAuth, aiController.getConversation);
router.patch("/conversations/:id", auth, aiController.renameConversation);
router.delete("/conversations/:id", auth, aiController.deleteConversation);
router.post("/conversations/:id/pin", auth, aiController.pinConversation);
router.post("/conversations/:id/unpin", auth, aiController.unpinConversation);
router.post("/conversations/:id/export", auth, aiController.exportConversation);

// Context metadata for the AI copilot (auth-only — requires user context)
router.get("/context", auth, aiController.getContextMetadata);

// AI insights for dashboard (public/global — no personal context required)
router.get("/insights", rateLimit, optionalAuth, async (req, res) => {
  res.json({ insights: [] });
});

module.exports = router;
