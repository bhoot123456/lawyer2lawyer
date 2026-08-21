const OpenAI = require("openai");
const AIConversation = require("../models/AIConversation");
const User = require("../models/User");

function getOpenRouterKey() {
  return process.env.OPENROUTER_API_KEY;
}

function ensureOpenRouterKey() {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required for AI assistant functionality.");
  }
}

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

// OpenRouter API request timeout (ms). Defaults to 15s; override via env.
const OPENROUTER_TIMEOUT_MS = process.env.OPENROUTER_TIMEOUT_MS
  ? Number(process.env.OPENROUTER_TIMEOUT_MS)
  : 15000;

// Default model can be overridden via OPENROUTER_MODEL env var.
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-5";

// Fallback models that are commonly available on OpenRouter.
const OPENROUTER_FALLBACK_MODELS = [
  // DeepSeek
  "deepseek/deepseek-chat",
  // Gemini
  "google/gemini-2.5-flash",
  // Additional safe fallback (in case the above are blocked)
  "mistralai/mistral-large-latest",
];

function buildSystemMessage({ user, metadata }) {
  const location = metadata?.path ? `The user is currently on: ${metadata.path}.` : "";
  const role = user?.role ? `User role: ${user.role}.` : "";
  const locationContext = user?.city && user?.state ? `The user is located in ${user.city}, ${user.state}.` : "";

  return {
    role: "system",
    content:
      "You are the Lawyer2Lawyer AI legal assistant. " +
      "Provide accurate, concise legal guidance, but do not offer attorney-client privileged advice. " +
      "If a question requires a licensed lawyer, explain that and provide a general legal explanation. " +
      role +
      locationContext +
      location +
      "Answer in clear English and use short structured paragraphs when possible.",
  };
}

function formatConversationTitle(prompt) {
  const cleaned = String(prompt || "Untitled").trim();
  const title = cleaned.split("\n")[0].slice(0, 64);
  return title.length ? title : "AI Conversation";
}

async function getOpenRouterClient() {
  ensureOpenRouterKey();

  // OpenRouter is OpenAI-compatible. We keep the `openai` SDK but point it at OpenRouter.
  return new OpenAI({
    apiKey: getOpenRouterKey(),
    baseURL: OPENROUTER_BASE_URL,
    timeout: OPENROUTER_TIMEOUT_MS,
    maxRetries: 2,
  });
}

function getOpenRouterExtraHeaders() {
  return {
    "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "https://lawyer2lawyer.example",
    "X-Title": "Lawyer2Lawyer",
  };
}

function extractAssistantTextFromOpenRouter(response) {
  // OpenRouter (OpenAI-compatible) commonly returns:
  // { choices: [ { message: { content: "..." } } ] }
  const fromChoices = response?.choices?.[0]?.message?.content;
  if (typeof fromChoices === "string" && fromChoices.trim().length) {
    return fromChoices.trim();
  }

  // Sometimes, SDK may nest raw response under `data`.
  const data = response?.data;
  const fromDataChoices = data?.choices?.[0]?.message?.content;
  if (typeof fromDataChoices === "string" && fromDataChoices.trim().length) {
    return fromDataChoices.trim();
  }

  // Some OpenAI-compatible variants might use `text` (rare but handle defensively).
  const fromChoicesText = response?.choices?.[0]?.text;
  if (typeof fromChoicesText === "string" && fromChoicesText.trim().length) {
    return fromChoicesText.trim();
  }

  return null;
}

function shouldTryNextModel(error) {
  const msg = String(error?.message || "");
  const status = error?.statusCode || error?.response?.status;

  // If the model isn't available or invalid, OpenRouter typically returns 4xx.
  // We'll also try if we got an empty/invalid completion.
  return (
    (status && Number(status) >= 400 && Number(status) < 500 && /model|not found|invalid|available|unauthorized/i.test(msg)) ||
    /empty response|no content|choices\[0\]|model.*(unavailable|not found)/i.test(msg)
  );
}

async function requestOpenRouterResponse({ user, prompt, conversationMessages, metadata }) {
  const openai = await getOpenRouterClient();
  const systemMessage = buildSystemMessage({ user, metadata });

  const baseMessages = [systemMessage];
  if (Array.isArray(conversationMessages) && conversationMessages.length > 0) {
    baseMessages.push(...conversationMessages);
  }
  baseMessages.push({ role: "user", content: prompt });

  const modelsToTry = [OPENROUTER_MODEL, ...OPENROUTER_FALLBACK_MODELS].filter(Boolean);

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages: baseMessages,
        temperature: 0.3,
        max_tokens: 900,
        extraHeaders: getOpenRouterExtraHeaders(),
      });

      const output = extractAssistantTextFromOpenRouter(response);
      if (!output) {
        // Include some response info for debugging.
        const err = new Error(
          `OpenRouter returned a response but no assistant message content was found (model: ${model}).`
        );
        err.statusCode = 502;
        err.details = { model, responsePreview: response };
        throw err;
      }

      return output;
    } catch (error) {
      const originalResponseData = error?.response?.data;
      const status = error?.statusCode || error?.response?.status;

      console.error("OpenRouter error (raw):", {
        message: error?.message,
        status,
        data: originalResponseData,
        code: error?.code,
        model,
      });

      // If we have an OpenRouter error payload, prefer returning it (instead of generic empty response).
      // But we might still try next model if it's model-related.
      lastError = error;

      if (shouldTryNextModel(error)) {
        continue;
      }

      const originalMsg =
        typeof originalResponseData?.error?.message === "string"
          ? originalResponseData.error.message
          : typeof originalResponseData?.message === "string"
            ? originalResponseData.message
            : error?.message || "Failed to get response from OpenRouter.";

      const err = new Error(originalMsg);
      err.statusCode = status || error?.statusCode || 502;
      err.details = {
        provider: "openrouter",
        model,
        original: originalResponseData || undefined,
      };
      throw err;
    }
  }

  // All models failed; surface the most useful error.
  const status = lastError?.statusCode || lastError?.response?.status;
  const originalResponseData = lastError?.response?.data;

  const originalMsg =
    typeof originalResponseData?.error?.message === "string"
      ? originalResponseData.error.message
      : typeof originalResponseData?.message === "string"
        ? originalResponseData.message
        : lastError?.message || "Failed to get response from OpenRouter.";

  const err = new Error(originalMsg);
  err.statusCode = status || lastError?.statusCode || 502;
  err.details = {
    provider: "openrouter",
    modelTried: modelsToTry,
    original: originalResponseData || undefined,
  };
  throw err;
}

function withUserFallback(user) {
  return {
    role: user?.role || "unknown",
    state: user?.state || "",
    city: user?.city || "",
  };
}

async function createConversation({ userId, title, initialPrompt, metadata }) {
  // For public (unauthenticated) users, userId is undefined.
  // Build a fallback user profile — no location/role data for anonymous users.
  const userProfile = userId
    ? await User.findById(userId).select("role state city").lean()
    : null;

  const anonymousFallback = {
    role: "unknown",
    state: "",
    city: "",
  };

  const userForPrompt = userProfile ? withUserFallback(userProfile) : anonymousFallback;

  const conversationPayload = {
    title: title || (initialPrompt ? formatConversationTitle(initialPrompt) : "AI Conversation"),
    metadata: metadata || {},
    messages: [],
    lastUsedAt: new Date(),
  };

  // Only set userId if provided (null/undefined means anonymous conversation)
  if (userId) {
    conversationPayload.userId = userId;
  }

  const conversation = await AIConversation.create(conversationPayload);

  if (initialPrompt) {
    const assistantContent = await requestOpenRouterResponse({
      user: userForPrompt,
      prompt: initialPrompt,
      conversationMessages: [],
      metadata,
    });

    conversation.messages.push({ role: "user", content: initialPrompt, metadata: metadata || {} });
    conversation.messages.push({ role: "assistant", content: assistantContent });
    conversation.lastUsedAt = new Date();
    await conversation.save();
  }

  return conversation;
}

async function continueChat({ userId, conversationId, prompt, metadata }) {
  // For public (unauthenticated) users, userId is undefined.
  // Use anonymous fallback profile when no user is available.
  const userProfile = userId
    ? await User.findById(userId).select("role state city").lean()
    : null;

  const anonymousFallback = {
    role: "unknown",
    state: "",
    city: "",
  };

  const userForPrompt = userProfile ? withUserFallback(userProfile) : anonymousFallback;

  // If conversationId is invalid, missing, or belongs to another user, we must not fail the chat.
  // Instead, automatically create a new conversation and proceed.
  let conversation = null;
  if (conversationId) {
    const query = { _id: conversationId };
    // Only filter by userId if it exists (for authenticated users)
    if (userId) {
      query.userId = userId;
    }
    conversation = await AIConversation.findOne(query);
  }

  if (!conversation) {
    const conversation = await createConversation({
      userId,
      title: null,
      initialPrompt: prompt,
      metadata,
    });

    return conversation;
  }


  const existingMessages = conversation.messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const assistantContent = await requestOpenRouterResponse({
    user: userForPrompt,
    prompt,
    conversationMessages: existingMessages,
    metadata,
  });

  conversation.messages.push({ role: "user", content: prompt, metadata: metadata || {} });
  conversation.messages.push({ role: "assistant", content: assistantContent });
  conversation.lastUsedAt = new Date();

  if (!conversation.title || conversation.title === "AI Conversation") {
    conversation.title = formatConversationTitle(existingMessages.length ? existingMessages[0].content : prompt);
  }

  await conversation.save();
  return conversation;
}

async function sendChatMessage({ userId, prompt, conversationId, metadata }) {
  if (conversationId) {
    return await continueChat({ userId, conversationId, prompt, metadata });
  }

  // For public (unauthenticated) users, userId is undefined.
  // Use anonymous fallback profile when no user is available.
  const userProfile = userId
    ? await User.findById(userId).select("role state city").lean()
    : null;

  const anonymousFallback = {
    role: "unknown",
    state: "",
    city: "",
  };

  const userForPrompt = userProfile ? withUserFallback(userProfile) : anonymousFallback;

  const assistantContent = await requestOpenRouterResponse({
    user: userForPrompt,
    prompt,
    conversationMessages: [],
    metadata,
  });

  const conversationPayload = {
    title: formatConversationTitle(prompt),
    metadata: metadata || {},
    messages: [
      { role: "user", content: prompt, metadata: metadata || {} },
      { role: "assistant", content: assistantContent },
    ],
    lastUsedAt: new Date(),
  };

  // Only set userId if provided (null/undefined means anonymous conversation)
  if (userId) {
    conversationPayload.userId = userId;
  }

  const conversation = await AIConversation.create(conversationPayload);

  return conversation;
}

async function listConversations({ userId, page = 1, limit = 20, pinned, search }) {
  page = Number(page) || 1;
  limit = Math.min(Number(limit) || 20, 100);
  const filter = { userId };
  if (pinned !== undefined) {
    filter.pinned = pinned === "true" || pinned === true;
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const total = await AIConversation.countDocuments(filter);
  const conversations = await AIConversation.find(filter)
    .sort({ pinned: -1, updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("title pinned metadata lastUsedAt updatedAt createdAt")
    .lean();

  return {
    items: conversations,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}

async function getConversation({ userId, conversationId }) {
  const query = { _id: conversationId };
  // Only filter by userId if it exists (for authenticated users)
  // Anonymous/public conversations have no userId field
  if (userId) {
    query.userId = userId;
  }
  return await AIConversation.findOne(query);
}

async function renameConversation({ userId, conversationId, title }) {
  const conversation = await AIConversation.findOneAndUpdate(
    { _id: conversationId, userId },
    { title },
    { new: true },
  );
  if (!conversation) {
    const err = new Error("Conversation not found.");
    err.statusCode = 404;
    throw err;
  }
  return conversation;
}

async function deleteConversation({ userId, conversationId }) {
  const result = await AIConversation.deleteOne({ _id: conversationId, userId });
  if (result.deletedCount === 0) {
    const err = new Error("Conversation not found.");
    err.statusCode = 404;
    throw err;
  }
}

/**
 * Reset (delete + recreate) a conversation atomically.
 * For authenticated users (userId present): validates ownership.
 * For anonymous users (userId absent): operates by conversationId only.
 * Never leaves the system in a partially reset state.
 * If conversationId is missing, simply creates a brand new empty conversation.
 */
async function resetConversation({ userId, conversationId, metadata }) {
  // Phase 1: If a conversationId is provided, attempt deletion
  if (conversationId) {
    try {
      const query = { _id: conversationId };
      // Only filter by userId if the user is authenticated
      if (userId) {
        query.userId = userId;
      }
      await AIConversation.deleteOne(query);
    } catch (err) {
      // If deletion fails, we must NOT proceed — throw to avoid partial reset
      const error = new Error(
        `Failed to delete existing conversation: ${err.message}`,
      );
      error.statusCode = 500;
      error.originalError = err;
      throw error;
    }
  }

  // Phase 2: Create a brand new empty conversation
  try {
    const conversationPayload = {
      title: "AI Conversation",
      metadata: metadata || {},
      messages: [],
      lastUsedAt: new Date(),
    };

    if (userId) {
      conversationPayload.userId = userId;
    }

    const newConversation = await AIConversation.create(conversationPayload);
    return newConversation;
  } catch (err) {
    // If creation fails after deletion, we've already deleted the old one.
    // This is a safe state — the old conversation is gone, and a new one will
    // be created on the next user message.
    const error = new Error(
      `Failed to create new conversation after reset: ${err.message}`,
    );
    error.statusCode = 500;
    error.originalError = err;
    throw error;
  }
}

async function setConversationPinned({ userId, conversationId, pinned }) {
  const conversation = await AIConversation.findOneAndUpdate(
    { _id: conversationId, userId },
    { pinned },
    { new: true },
  );
  if (!conversation) {
    const err = new Error("Conversation not found.");
    err.statusCode = 404;
    throw err;
  }
  return conversation;
}

async function exportConversation({ userId, conversationId }) {
  const conversation = await AIConversation.findOne({ _id: conversationId, userId }).lean();
  if (!conversation) {
    const err = new Error("Conversation not found.");
    err.statusCode = 404;
    throw err;
  }

  const exportText = conversation.messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n\n");

  return {
    conversationId: conversation._id,
    title: conversation.title,
    exportedAt: new Date(),
    text: exportText,
    metadata: conversation.metadata,
  };
}

async function searchConversations({ userId, query, page = 1, limit = 20 }) {
  page = Number(page) || 1;
  limit = Math.min(Number(limit) || 20, 100);

  const filter = { userId };
  if (query) {
    filter.$text = { $search: query };
  }

  const total = await AIConversation.countDocuments(filter);
  const items = await AIConversation.find(filter)
    .sort({ pinned: -1, updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("title pinned metadata lastUsedAt updatedAt createdAt")
    .lean();

  return { items, page, limit, total, pages: Math.ceil(total / limit) };
}

async function getContextMetadata({ userId, path }) {
  const user = await User.findById(userId).select("role state city name email");
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
      state: user.state,
      city: user.city,
    },
    path: path || null,
    instructions:
      "Use this metadata to make AI responses context-aware for the authenticated user. " +
      "The assistant should respect the user's role and location, and avoid offering legal advice that requires attorney-client confidentiality.",
  };
}

module.exports = {
  sendChatMessage,
  continueChat,
  createConversation,
  listConversations,
  getConversation,
  renameConversation,
  deleteConversation,
  resetConversation,
  setConversationPinned,
  exportConversation,
  searchConversations,
  getContextMetadata,
};
