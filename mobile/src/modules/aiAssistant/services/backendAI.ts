import { api } from "@/services/api";

export interface SendAIChatRequest {
  prompt: string;
  conversationId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AIChatConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIChatConversation {
  _id?: string;
  id?: string;
  title?: string;
  messages?: AIChatConversationMessage[];
  pinned?: boolean;
  metadata?: Record<string, unknown>;
  lastUsedAt?: string;
}

export async function sendAIChatMessage({
  prompt,
  conversationId,
  metadata,
}: SendAIChatRequest): Promise<AIChatConversation> {
  const response = await api.post("/ai/chat", {
    prompt,
    conversationId,
    metadata,
  });

  return response.data?.data;
}

export async function getAIConversationById(
  conversationId: string,
): Promise<AIChatConversation> {
  const response = await api.get(`/ai/conversations/${conversationId}`);
  return response.data?.data;
}

/**
 * Reset (delete + recreate) a conversation atomically.
 * Sends the current conversationId to the backend to be deleted,
 * and returns a brand new empty conversation.
 */
export async function resetConversation({
  conversationId,
  metadata,
}: {
  conversationId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<AIChatConversation> {
  const response = await api.post("/ai/chat/reset", {
    conversationId,
    metadata,
  });
  return response.data?.data;
}
