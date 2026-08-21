const aiService = require("../services/aiService");

function sendError(res, statusCode, message, details) {
  return res.status(statusCode).json({ success: false, message, ...(details ? { details } : {}) });
}

exports.sendChatMessage = async (req, res) => {
  try {
    // userId is optional — undefined for unauthenticated (public) users
    const userId = req.user?._id;
    const { prompt, conversationId, metadata } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return sendError(res, 400, "Prompt is required and must be a string.");
    }

    const result = await aiService.sendChatMessage({ userId, prompt, conversationId, metadata });
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI chat error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to process chat message.");
  }
};

exports.continueChat = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { conversationId, prompt, metadata } = req.body || {};

    if (!conversationId) {
      return sendError(res, 400, "conversationId is required to continue a conversation.");
    }
    if (!prompt || typeof prompt !== "string") {
      return sendError(res, 400, "Prompt is required and must be a string.");
    }

    const result = await aiService.continueChat({ userId, conversationId, prompt, metadata });
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI continue chat error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to continue chat conversation.");
  }
};

exports.createConversation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { title, initialPrompt, metadata } = req.body || {};

    if (!title || typeof title !== "string") {
      return sendError(res, 400, "Conversation title is required.");
    }

    const conversation = await aiService.createConversation({ userId, title, initialPrompt, metadata });
    return res.json({ success: true, data: conversation });
  } catch (error) {
    console.error("AI create conversation error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to create conversation.");
  }
};

exports.listConversations = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 20, pinned, search } = req.query;
    const conversations = await aiService.listConversations({ userId, page, limit, pinned, search });
    return res.json({ success: true, data: conversations });
  } catch (error) {
    console.error("AI list conversations error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to list conversations.");
  }
};

exports.getConversation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const conversationId = req.params.id;
    const conversation = await aiService.getConversation({ userId, conversationId });

    if (!conversation) {
      return sendError(res, 404, "Conversation not found.");
    }

    return res.json({ success: true, data: conversation });
  } catch (error) {
    console.error("AI get conversation error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to fetch conversation.");
  }
};

exports.renameConversation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const conversationId = req.params.id;
    const { title } = req.body || {};

    if (!title || typeof title !== "string") {
      return sendError(res, 400, "A new title is required to rename the conversation.");
    }

    const updated = await aiService.renameConversation({ userId, conversationId, title });
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("AI rename conversation error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to rename conversation.");
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const conversationId = req.params.id;

    await aiService.deleteConversation({ userId, conversationId });
    return res.json({ success: true, data: { conversationId } });
  } catch (error) {
    console.error("AI delete conversation error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to delete conversation.");
  }
};

exports.pinConversation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const conversationId = req.params.id;

    const updated = await aiService.setConversationPinned({ userId, conversationId, pinned: true });
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("AI pin conversation error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to pin conversation.");
  }
};

exports.unpinConversation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const conversationId = req.params.id;

    const updated = await aiService.setConversationPinned({ userId, conversationId, pinned: false });
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("AI unpin conversation error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to unpin conversation.");
  }
};

exports.exportConversation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const conversationId = req.params.id;

    const exportPayload = await aiService.exportConversation({ userId, conversationId });
    return res.json({ success: true, data: exportPayload });
  } catch (error) {
    console.error("AI export conversation error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to export conversation.");
  }
};

exports.searchConversations = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { q, page = 1, limit = 20 } = req.query;

    const results = await aiService.searchConversations({ userId, query: q, page, limit });
    return res.json({ success: true, data: results });
  } catch (error) {
    console.error("AI search conversations error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to search conversations.");
  }
};

/**
 * Reset conversation: delete old (if exists) and create a brand new empty conversation.
 * Public endpoint — no auth required.
 * For authenticated users (via optional auth token), userId is extracted for ownership.
 * For anonymous users, conversationId is used directly.
 */
exports.resetConversation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { conversationId, metadata } = req.body || {};

    const result = await aiService.resetConversation({ userId, conversationId, metadata });
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI reset conversation error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to reset conversation.");
  }
};

exports.getContextMetadata = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { path } = req.query || {};
    const metadata = await aiService.getContextMetadata({ userId, path });
    return res.json({ success: true, data: metadata });
  } catch (error) {
    console.error("AI context metadata error:", error);
    return sendError(res, error.statusCode || 500, error.message || "Failed to build AI context metadata.");
  }
};
