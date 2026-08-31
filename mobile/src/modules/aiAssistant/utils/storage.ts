// ============================================================
// AI Legal Assistant - Local Storage Utilities
// Manages history, saved results, and recent prompts using AsyncStorage.
// Architecture supports future backend sync via a StorageBackend interface.
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AIHistoryEntry, AISavedResult, AIFeature, AIResponse } from "../types";
import { STORAGE_KEYS, MAX_HISTORY_ENTRIES, MAX_RECENT_PROMPTS } from "../constants";

/** Generate a unique ID */
const generateId = (): string =>
  `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/**
 * Clear ALL AI-related AsyncStorage keys atomically.
 * This ensures no orphaned keys remain when a user resets their conversation.
 */
export async function clearAllAIData(): Promise<void> {
  const keys = [
    STORAGE_KEYS.AI_HISTORY,
    STORAGE_KEYS.AI_SAVED,
    STORAGE_KEYS.AI_RECENT_PROMPTS,
    "@lawyer2lawyer/ai_conversation_id",
    "@lawyer2lawyer/ai_agent_panel_open",
    "@lawyer2lawyer/ai_agent_position",
  ];

  try {
    if (typeof AsyncStorage.multiRemove === "function") {
      await AsyncStorage.multiRemove(keys);
    } else {
      // Fallback for environments without multiRemove
      await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
    }
  } catch (err) {
    console.error("clearAllAIData: failed to clear AI storage keys", err);
    throw err;
  }
}

// ---- History Management ----

/** Load all history entries from storage */
export async function loadHistory(): Promise<AIHistoryEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.AI_HISTORY);
    return data ? (JSON.parse(data) as AIHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

/** Save a new history entry */
export async function saveHistoryEntry(
  feature: AIFeature,
  prompt: string,
  result: AIResponse
): Promise<AIHistoryEntry> {
  const entry: AIHistoryEntry = {
    id: generateId(),
    feature,
    prompt,
    result,
    createdAt: new Date().toISOString(),
    isBookmarked: false,
  };

  const history = await loadHistory();
  history.unshift(entry);

  // Trim to max entries
  if (history.length > MAX_HISTORY_ENTRIES) {
    history.length = MAX_HISTORY_ENTRIES;
  }

  await AsyncStorage.setItem(STORAGE_KEYS.AI_HISTORY, JSON.stringify(history));
  return entry;
}

/** Delete a history entry by ID */
export async function deleteHistoryEntry(id: string): Promise<void> {
  const history = await loadHistory();
  const filtered = history.filter((entry) => entry.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.AI_HISTORY, JSON.stringify(filtered));
}

/** Clear all history */
export async function clearAllHistory(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.AI_HISTORY, JSON.stringify([]));
}

/** Toggle bookmark status for a history entry */
export async function toggleBookmark(id: string): Promise<AIHistoryEntry | null> {
  const history = await loadHistory();
  const entry = history.find((e) => e.id === id);
  if (!entry) return null;

  entry.isBookmarked = !entry.isBookmarked;
  await AsyncStorage.setItem(STORAGE_KEYS.AI_HISTORY, JSON.stringify(history));
  return entry;
}

// ---- Saved Results Management ----

/** Load all saved/bookmarked results */
export async function loadSavedResults(): Promise<AISavedResult[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.AI_SAVED);
    return data ? (JSON.parse(data) as AISavedResult[]) : [];
  } catch {
    return [];
  }
}

/** Save a result as a bookmark */
export async function saveResult(
  historyId: string,
  feature: AIFeature,
  prompt: string,
  result: AIResponse,
  notes?: string
): Promise<AISavedResult> {
  const saved: AISavedResult = {
    id: generateId(),
    historyId,
    feature,
    prompt,
    result,
    savedAt: new Date().toISOString(),
    notes,
  };

  const savedList = await loadSavedResults();
  savedList.unshift(saved);
  await AsyncStorage.setItem(STORAGE_KEYS.AI_SAVED, JSON.stringify(savedList));
  return saved;
}

/** Delete a saved result */
export async function deleteSavedResult(id: string): Promise<void> {
  const savedList = await loadSavedResults();
  const filtered = savedList.filter((s) => s.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.AI_SAVED, JSON.stringify(filtered));
}

// ---- Recent Prompts Management ----

/** Load recent prompts */
export async function loadRecentPrompts(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.AI_RECENT_PROMPTS);
    return data ? (JSON.parse(data) as string[]) : [];
  } catch {
    return [];
  }
}

/** Save a prompt to recent list */
export async function saveRecentPrompt(prompt: string): Promise<void> {
  const recent = await loadRecentPrompts();
  // Remove duplicate if exists
  const filtered = recent.filter((p) => p !== prompt);
  filtered.unshift(prompt);

  if (filtered.length > MAX_RECENT_PROMPTS) {
    filtered.length = MAX_RECENT_PROMPTS;
  }

  await AsyncStorage.setItem(STORAGE_KEYS.AI_RECENT_PROMPTS, JSON.stringify(filtered));
}