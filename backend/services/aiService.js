const OpenAI = require("openai");
const AIConversation = require("../models/AIConversation");
const User = require("../models/User");

function getOpenRouterKey() {
  return process.env.OPENROUTER_API_KEY;
}

function ensureOpenRouterKey() {
  console.log("API Key loaded?", Boolean(process.env.OPENROUTER_API_KEY));

  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required for AI assistant functionality.");
  }
}

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

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
  });
}

function getOpenRouterExtraHeaders() {
  return {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Lawyer2Lawyer",
  };
}

function serializeOpenRouterResponseForLogs(response) {
  // Avoid gigantic nested objects while still keeping the critical parts.
  try {
    return {
      id: response?.id,
      model: response?.model,
      status: response?.status,
      headers: response?.headers,
      data: response?.data,
      choices: response?.choices,
      usage: response?.usage,
      // Keep raw for debugging
      raw: response,
    };
  } catch {
    return response;
  }
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
      console.log("OpenRouter request model:", model);

      const response = await openai.chat.completions.create({
        model,
        messages: baseMessages,
        temperature: 0.3,
        max_tokens: 900,
        extraHeaders: getOpenRouterExtraHeaders(),
      });

      console.log("OpenRouter Response (complete):");
      console.dir(serializeOpenRouterResponseForLogs(response), { depth: null });

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
  const user = await User.findById(userId).select("role state city");
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  const conversation = await AIConversation.create({
    userId,
    title: title || (initialPrompt ? formatConversationTitle(initialPrompt) : "AI Conversation"),
    metadata: metadata || {},
    messages: [],
    lastUsedAt: new Date(),
  });

  if (initialPrompt) {
    const assistantContent = await requestOpenRouterResponse({
      user: withUserFallback(user),
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
  const user = await User.findById(userId).select("role state city");
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  // If conversationId is invalid, missing, or belongs to another user, we must not fail the chat.
  // Instead, automatically create a new conversation and proceed.
  let conversation = null;
  if (conversationId) {
    conversation = await AIConversation.findOne({ _id: conversationId, userId });
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
    user: withUserFallback(user),
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

  const user = await User.findById(userId).select("role state city");
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  const assistantContent = await requestOpenRouterResponse({
    user: withUserFallback(user),
    prompt,
    conversationMessages: [],
    metadata,
  });

  const conversation = await AIConversation.create({
    userId,
    title: formatConversationTitle(prompt),
    metadata: metadata || {},
    messages: [
      { role: "user", content: prompt, metadata: metadata || {} },
      { role: "assistant", content: assistantContent },
    ],
    lastUsedAt: new Date(),
  });

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
  return await AIConversation.findOne({ _id: conversationId, userId });
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
  setConversationPinned,
  exportConversation,
  searchConversations,
  getContextMetadata,
};

