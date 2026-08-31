// ============================================================
// AI Legal Assistant - Custom Hook
// Manages loading, success, error, history, and saved states.
// ============================================================

import { useState, useCallback, useRef } from "react";
import type {
  AIFeature,
  AIResponse,
  AIHistoryEntry,
  DraftLegalNoticeInput,
  SummarizeJudgmentInput,
  ExplainBareActInput,
  GenerateCaseSummaryInput,
  SearchLegalDocumentsInput,
  GenerateChecklistInput,
  FindLawyersInput,
} from "../types";
import { getAIProvider } from "../services";
import {
  saveHistoryEntry,
  loadHistory,
  deleteHistoryEntry,
  clearAllHistory,
  saveRecentPrompt,
  saveResult,
} from "../utils/storage";

interface AIAssistantState {
  loading: boolean;
  error: string | null;
  data: AIResponse | null;
}

type FeatureHandler<TInput> = (input: TInput) => Promise<AIResponse>;

/**
 * Hook to manage AI assistant operations.
 * Provides loading/error/data state management and history/save integration.
 */
export function useAIAssistant(feature: AIFeature) {
  const [state, setState] = useState<AIAssistantState>({
    loading: false,
    error: null,
    data: null,
  });
  const [history, setHistory] = useState<AIHistoryEntry[]>([]);
  const abortRef = useRef<boolean>(false);

  /** Execute an AI operation with state management */
  const execute = useCallback(
    async (handler: FeatureHandler<any>, input: any) => {
      // Cancel any previous operation
      abortRef.current = false;

      setState({ loading: true, error: null, data: null });

      try {
        const result = await handler(input);

        if (abortRef.current) return;

        setState({ loading: false, error: null, data: result });

        // Save to history and recent prompts
        const promptStr = typeof input === "string" ? input : JSON.stringify(input);
        await saveHistoryEntry(feature, promptStr, result);
        await saveRecentPrompt(promptStr);

        return result;
      } catch (err) {
        if (abortRef.current) return;

        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
        setState({ loading: false, error: errorMessage, data: null });
        return null;
      }
    },
    [feature]
  );

  /** Cancel the current operation */
  const cancel = useCallback(() => {
    abortRef.current = true;
    setState({ loading: false, error: "Operation cancelled", data: null });
  }, []);

  /** Clear error state */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /** Reset the state completely */
  const reset = useCallback(() => {
    abortRef.current = true;
    setState({ loading: false, error: null, data: null });
  }, []);

  // ---- AI Provider methods ----

  const generateLegalNotice = useCallback(
    (input: DraftLegalNoticeInput) => {
      const provider = getAIProvider();
      return execute((i: DraftLegalNoticeInput) => provider.generateLegalNotice(i), input);
    },
    [execute]
  );

  const summarizeJudgment = useCallback(
    (input: SummarizeJudgmentInput) => {
      const provider = getAIProvider();
      return execute((i: SummarizeJudgmentInput) => provider.summarizeJudgment(i), input);
    },
    [execute]
  );

  const explainBareAct = useCallback(
    (input: ExplainBareActInput) => {
      const provider = getAIProvider();
      return execute((i: ExplainBareActInput) => provider.explainBareAct(i), input);
    },
    [execute]
  );

  const generateCaseSummary = useCallback(
    (input: GenerateCaseSummaryInput) => {
      const provider = getAIProvider();
      return execute((i: GenerateCaseSummaryInput) => provider.generateCaseSummary(i), input);
    },
    [execute]
  );

  const searchLegalDocuments = useCallback(
    (input: SearchLegalDocumentsInput) => {
      const provider = getAIProvider();
      return execute((i: SearchLegalDocumentsInput) => provider.searchLegalDocuments(i), input);
    },
    [execute]
  );

  const generateChecklist = useCallback(
    (input: GenerateChecklistInput) => {
      const provider = getAIProvider();
      return execute((i: GenerateChecklistInput) => provider.generateChecklist(i), input);
    },
    [execute]
  );

  const findLawyers = useCallback(
    (input: FindLawyersInput) => {
      const provider = getAIProvider();
      return execute((i: FindLawyersInput) => provider.findLawyers(i), input);
    },
    [execute]
  );

  // ---- History management ----

  const refreshHistory = useCallback(async () => {
    const entries = await loadHistory();
    setHistory(entries);
  }, []);

  const removeHistoryEntry = useCallback(async (id: string) => {
    await deleteHistoryEntry(id);
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearHistory = useCallback(async () => {
    await clearAllHistory();
    setHistory([]);
  }, []);

  // ---- Save management ----

  const saveCurrentResult = useCallback(
    async (notes?: string) => {
      if (!state.data) return null;
      const promptStr = `AI Legal Assistant - ${feature}`;
      const historyEntry = await saveHistoryEntry(feature, promptStr, state.data);
      return await saveResult(historyEntry.id, feature, promptStr, state.data, notes);
    },
    [feature, state.data]
  );

  return {
    // State
    loading: state.loading,
    error: state.error,
    data: state.data,

    // AI operations
    generateLegalNotice,
    summarizeJudgment,
    explainBareAct,
    generateCaseSummary,
    searchLegalDocuments,
    generateChecklist,
    findLawyers,

    // State management
    cancel,
    clearError,
    reset,

    // History
    history,
    refreshHistory,
    removeHistoryEntry,
    clearHistory,

    // Save
    saveCurrentResult,
  };
}