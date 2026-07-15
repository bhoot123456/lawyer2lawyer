const router = require("express").Router();
const auth = require("../middleware/auth");
const aiController = require("../controllers/aiController");

// All AI assistant endpoints require authentication and contextual session data.
router.use(auth);

// Chat endpoints
router.post("/chat", aiController.sendChatMessage);
router.post("/chat/continue", aiController.continueChat);

// Conversation management
router.post("/conversations", aiController.createConversation);
router.get("/conversations", aiController.listConversations);
router.get("/conversations/:id", aiController.getConversation);
router.patch("/conversations/:id", aiController.renameConversation);
router.delete("/conversations/:id", aiController.deleteConversation);
router.post("/conversations/:id/pin", aiController.pinConversation);
router.post("/conversations/:id/unpin", aiController.unpinConversation);
router.post("/conversations/:id/export", aiController.exportConversation);
router.get("/conversations/search", aiController.searchConversations);

// Context metadata for the AI copilot
router.get("/context", aiController.getContextMetadata);

module.exports = router;
