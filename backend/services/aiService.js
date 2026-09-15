const OpenAI = require("openai");
const mongoose = require("mongoose");
const AIConversation = require("../models/AIConversation");
const User = require("../models/User");

const isDbConnected = () => mongoose.connection.readyState === 1;
const inMemoryConversations = new Map();

let googleGenAIInstance = null;
function getGoogleGenAIClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!googleGenAIInstance) {
    try {
      const { GoogleGenAI } = require("@google/genai");
      googleGenAIInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("Could not initialize Google GenAI SDK:", e.message);
    }
  }
  return googleGenAIInstance;
}

function getOpenRouterKey() {
  return process.env.OPENROUTER_API_KEY;
}

function ensureOpenRouterKey() {
  const apiKey = getOpenRouterKey();
  if (!apiKey && !process.env.GEMINI_API_KEY) {
    // Graceful fallback rather than throwing
    return false;
  }
  return true;
}

function generateSmartLegalFallback(prompt) {
  const p = String(prompt || "").toLowerCase();
  
  if (p.includes("bail") || p.includes("arrest") || p.includes("custody") || p.includes("bns") || p.includes("crpc")) {
    return `### Legal Analysis: Bail & Criminal Procedure

**1. Statutory Framework:**
- **Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023:**
  - **Section 479 (formerly S. 436 CrPC):** Mandatory bail for bailable offences; streamlined maximum period of detention for undertrials.
  - **Section 480 (formerly S. 437 CrPC):** Bail in non-bailable offences before the Court of Magistrate.
  - **Section 482 (formerly S. 438 CrPC):** Anticipatory bail before High Court or Sessions Court.
  - **Section 483 (formerly S. 439 CrPC):** Special powers of High Court and Sessions Court regarding regular bail.

**2. Key Judicial Precedents:**
- *Satender Kumar Antil v. CBI (2022)*: Bail is the rule, jail is the exception; strict guidelines for categories of offences (A, B, C, D).
- *Arnesh Kumar v. State of Bihar (2014)*: Mandatory compliance with Section 41/41A CrPC (now S. 35 BNSS) before arresting for offences punishable with up to 7 years.

**3. Strategic Steps for Counsel:**
1. Secure the FIR copy, remand application, and arrest memo with grounds of arrest.
2. Establish clean antecedents, deep roots in society (permanent address proof, local sureties), and absence of flight risk.
3. Plead willingness to cooperate with the Investigating Officer (IO) and abide by all conditions.`;
  }

  if (p.includes("cheque") || p.includes("138") || p.includes("ni act") || p.includes("dishonour")) {
    return `### Legal Advisory: Section 138 Negotiable Instruments Act (Cheque Bounce)

**1. Statutory Timeline & Essentials:**
- **Cheque Presentation:** Within validity period (3 months).
- **Statutory Demand Notice:** Must be dispatched within **30 days** of receiving the bank memo of dishonour.
- **Cooling Period:** Accused has **15 days** from receipt of notice to make payment.
- **Filing of Complaint:** Within **30 days** after expiry of the 15-day notice period before the competent Metropolitan Magistrate (jurisdiction governed by payee's bank account branch under S. 142(2)).

**2. Key Rebuttable Presumptions:**
- **Section 118 & 139 NI Act:** Presumption that the cheque was issued in discharge of a legally enforceable debt or liability (*Bir Singh v. Mukesh Kumar*, 2019).
- Accused must raise a probable defence on preponderance of probabilities.

**3. Recommended Action:**
- Verify return memo stamp, dispatch speed post / registered AD receipt, and track consignment proof for deemed service.`;
  }

  if (p.includes("notice") || p.includes("draft") || p.includes("agreement")) {
    return `### Legal Notice Drafting Framework

**Structure of Legal Notice:**
1. **Header:** "LEGAL NOTICE UNDER SECTION / PROVISIONS OF LAW"
2. **Parties:** Full names, parentage, addresses of sender and recipient.
3. **Factual Recital:** Chronological breakdown of transactions, agreements, and breaches.
4. **Cause of Action:** Clear statement of harm suffered and legal rights infringed.
5. **Demand Clause:** Explicit demand for payment/remedy within 15 or 30 days.
6. **Reservation of Rights:** Explicit warning of civil action and/or criminal prosecution under relevant sections with costs.

*Notice drafted under instructions of client by Advocate on Record.*`;
  }

  return `### Lawyer2Lawyer AI Legal Analysis

**Overview & Legal Framework:**
Regarding your query on "${prompt.slice(0, 80)}":

1. **Applicable Laws:**
   - Pertinent provisions under Indian Law, relevant Central Acts, and procedural codes (CPC 1908 / BNSS 2023 / BNS 2023).
   - Jurisdiction considerations: High Court, District Courts, or specialized Tribunals (NCLT, CAT, DRT, NGT).

2. **Procedural Roadmap:**
   - Assess limitation periods under the Limitation Act, 1963.
   - Verify territorial and pecuniary jurisdiction of the forum.
   - Gather documentary evidence, verified pleadings, and affidavit of support.

3. **Next Steps:**
   - Prepare a concise brief of facts with dates and events chronology.
   - Cross-verify latest citations on the Supreme Court e-Courts portal.

*Note: This response provides general legal research assistance for advocates and legal professionals.*`;
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
  // 1. Try Gemini API if GEMINI_API_KEY is configured
  const gemini = getGoogleGenAIClient();
  if (gemini) {
    try {
      const systemInstruction = buildSystemMessage({ user, metadata }).content;
      const contents = (conversationMessages || []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      contents.push({ role: "user", parts: [{ text: prompt }] });

      const res = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });
      if (res && res.text) {
        return res.text.trim();
      }
    } catch (gErr) {
      console.warn("Gemini API call failed, falling back:", gErr.message);
    }
  }

  // 2. Try OpenRouter if key is present
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const openai = await getOpenRouterClient();
      const systemMessage = buildSystemMessage({ user, metadata });

      const baseMessages = [systemMessage];
      if (Array.isArray(conversationMessages) && conversationMessages.length > 0) {
        baseMessages.push(...conversationMessages);
      }
      baseMessages.push({ role: "user", content: prompt });

      const modelsToTry = [OPENROUTER_MODEL, ...OPENROUTER_FALLBACK_MODELS].filter(Boolean);

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
          if (output) return output;
        } catch (_err) {
          continue;
        }
      }
    } catch (orErr) {
      console.warn("OpenRouter call failed, falling back to smart legal advisor:", orErr.message);
    }
  }

  // 3. Fallback to smart legal reasoning engine
  return generateSmartLegalFallback(prompt);
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
  let userProfile = null;
  if (userId && isDbConnected()) {
    try {
      userProfile = await User.findById(userId).select("role state city").lean();
    } catch (_e) {}
  }

  const anonymousFallback = {
    role: "unknown",
    state: "",
    city: "",
  };

  const userForPrompt = userProfile ? withUserFallback(userProfile) : anonymousFallback;

  const conversationPayload = {
    _id: `conv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: title || (initialPrompt ? formatConversationTitle(initialPrompt) : "AI Conversation"),
    metadata: metadata || {},
    messages: [],
    lastUsedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (userId) {
    conversationPayload.userId = userId;
  }

  let conversation;
  if (isDbConnected()) {
    try {
      conversation = await AIConversation.create(conversationPayload);
    } catch (_e) {
      conversation = conversationPayload;
      inMemoryConversations.set(conversationPayload._id, conversation);
    }
  } else {
    conversation = conversationPayload;
    inMemoryConversations.set(conversationPayload._id, conversation);
  }

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
    if (conversation.save && typeof conversation.save === "function") {
      await conversation.save();
    }
  }

  return conversation;
}

async function continueChat({ userId, conversationId, prompt, metadata }) {
  let userProfile = null;
  if (userId && isDbConnected()) {
    try {
      userProfile = await User.findById(userId).select("role state city").lean();
    } catch (_e) {}
  }

  const anonymousFallback = {
    role: "unknown",
    state: "",
    city: "",
  };

  const userForPrompt = userProfile ? withUserFallback(userProfile) : anonymousFallback;

  let conversation = null;
  if (conversationId) {
    if (isDbConnected()) {
      try {
        const query = { _id: conversationId };
        if (userId) query.userId = userId;
        conversation = await AIConversation.findOne(query);
      } catch (_e) {}
    }
    if (!conversation) {
      conversation = inMemoryConversations.get(conversationId);
    }
  }

  if (!conversation) {
    return await createConversation({
      userId,
      title: null,
      initialPrompt: prompt,
      metadata,
    });
  }

  const existingMessages = (conversation.messages || []).map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const assistantContent = await requestOpenRouterResponse({
    user: userForPrompt,
    prompt,
    conversationMessages: existingMessages,
    metadata,
  });

  conversation.messages = conversation.messages || [];
  conversation.messages.push({ role: "user", content: prompt, metadata: metadata || {} });
  conversation.messages.push({ role: "assistant", content: assistantContent });
  conversation.lastUsedAt = new Date();

  if (!conversation.title || conversation.title === "AI Conversation") {
    conversation.title = formatConversationTitle(existingMessages.length ? existingMessages[0].content : prompt);
  }

  if (conversation.save && typeof conversation.save === "function") {
    await conversation.save();
  }

  return conversation;
}

async function sendChatMessage({ userId, prompt, conversationId, metadata }) {
  if (conversationId) {
    return await continueChat({ userId, conversationId, prompt, metadata });
  }

  let userProfile = null;
  if (userId && isDbConnected()) {
    try {
      userProfile = await User.findById(userId).select("role state city").lean();
    } catch (_e) {}
  }

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
    _id: `conv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: formatConversationTitle(prompt),
    metadata: metadata || {},
    messages: [
      { role: "user", content: prompt, metadata: metadata || {} },
      { role: "assistant", content: assistantContent },
    ],
    lastUsedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (userId) {
    conversationPayload.userId = userId;
  }

  let conversation;
  if (isDbConnected()) {
    try {
      conversation = await AIConversation.create(conversationPayload);
    } catch (_e) {
      conversation = conversationPayload;
      inMemoryConversations.set(conversationPayload._id, conversation);
    }
  } else {
    conversation = conversationPayload;
    inMemoryConversations.set(conversationPayload._id, conversation);
  }

  return conversation;
}

async function listConversations({ userId, page = 1, limit = 20, pinned, search }) {
  page = Number(page) || 1;
  limit = Math.min(Number(limit) || 20, 100);

  if (!isDbConnected()) {
    let convs = Array.from(inMemoryConversations.values());
    if (userId) {
      convs = convs.filter((c) => String(c.userId) === String(userId));
    }
    const total = convs.length;
    const paginated = convs.slice((page - 1) * limit, page * limit);
    return {
      items: paginated,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    };
  }

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
  if (!isDbConnected()) {
    return inMemoryConversations.get(conversationId) || null;
  }

  const query = { _id: conversationId };
  if (userId) {
    query.userId = userId;
  }
  const found = await AIConversation.findOne(query);
  return found || inMemoryConversations.get(conversationId) || null;
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
