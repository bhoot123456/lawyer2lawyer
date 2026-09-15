// ============================================================
// AI Legal Assistant - Constants & Feature Metadata
// ============================================================

import type { AIFeatureMeta } from "../types";
import { colors } from "@/theme/designSystem";

/** Gold accent color used throughout the AI module (canonical design-system token) */
export const AI_GOLD = colors.accent.gold;
export const AI_GOLD_LIGHT = colors.border.gold;
export const AI_GOLD_DARK = colors.accent.goldDark;
export const AI_BG = colors.bg.primary;
export const AI_CARD_BG = colors.bg.elevated;
export const AI_TEXT_PRIMARY = colors.text.primary;
export const AI_TEXT_SECONDARY = colors.text.secondary;
export const AI_TEXT_MUTED = colors.text.muted;
export const AI_ERROR_RED = colors.semantic.danger;
export const AI_SUCCESS_GREEN = colors.semantic.success;

/** Simulated delay range for mock AI responses (ms) */
export const MOCK_DELAY_MIN = 1500;
export const MOCK_DELAY_MAX = 3000;

/** Storage keys for AsyncStorage */
export const STORAGE_KEYS = {
  AI_HISTORY: "@lawyer2lawyer/ai_history",
  AI_SAVED: "@lawyer2lawyer/ai_saved",
  AI_RECENT_PROMPTS: "@lawyer2lawyer/ai_recent_prompts",
} as const;

/** Maximum number of history entries to keep */
export const MAX_HISTORY_ENTRIES = 100;

/** Maximum number of recent prompts to keep */
export const MAX_RECENT_PROMPTS = 20;

/** Feature metadata for the 6 AI tools */
export const AI_FEATURES: AIFeatureMeta[] = [
  {
    key: "find-lawyers",
    title: "Lawyer Assistant",
    subtitle: "Find lawyers by practice area and location",
    icon: "people-outline",
    screen: "ai-find-lawyers",
    description: "Discover suitable lawyers using specialization, state, and city filters.",
  },
  {
    key: "draft-legal-notice",
    title: "Draft Legal Notice",
    subtitle: "Generate professional legal notices",
    icon: "document-text-outline",
    screen: "ai-draft-legal-notice",
    description: "Draft legally sound notices with proper formatting and legal language.",
  },
  {
    key: "summarize-judgment",
    title: "Summarize Judgment",
    subtitle: "Get concise judgment summaries",
    icon: "scale-outline",
    screen: "ai-summarize-judgment",
    description: "Extract key facts, issues, findings, and ratio decidendi from judgments.",
  },
  {
    key: "explain-bare-act",
    title: "Explain Bare Act",
    subtitle: "Understand legal provisions simply",
    icon: "book-outline",
    screen: "ai-explain-bare-act",
    description: "Get plain-language explanations of legal sections with examples.",
  },
  {
    key: "case-summary",
    title: "Case Summary",
    subtitle: "Generate comprehensive case briefs",
    icon: "briefcase-outline",
    screen: "ai-case-summary",
    description: "Create structured case summaries with background, issues, and outcome.",
  },
  {
    key: "search-documents",
    title: "Search Documents",
    subtitle: "Find relevant legal documents",
    icon: "search-outline",
    screen: "ai-search-documents",
    description: "Search through legal documents and find relevant passages.",
  },
  {
    key: "legal-checklist",
    title: "Legal Checklist",
    subtitle: "Get case-type-specific checklists",
    icon: "checkmark-circle-outline",
    screen: "ai-legal-checklist",
    description: "Generate comprehensive checklists for different case types.",
  },
];

/** Notice type options for the Draft Legal Notice feature */
export const NOTICE_TYPE_OPTIONS = [
  { label: "Legal Notice", value: "legal-notice" as const },
  { label: "Demand Notice", value: "demand-notice" as const },
  { label: "Eviction Notice", value: "eviction-notice" as const },
  { label: "Termination Notice", value: "termination-notice" as const },
  { label: "Breach Notice", value: "breach-notice" as const },
  { label: "Custom", value: "custom" as const },
];

/** Case type options for the Legal Checklist feature */
export const CASE_TYPE_OPTIONS = [
  { label: "Civil", value: "civil" as const },
  { label: "Criminal", value: "criminal" as const },
  { label: "Property", value: "property" as const },
  { label: "Family", value: "family" as const },
  { label: "Consumer", value: "consumer" as const },
  { label: "Cheque Bounce", value: "cheque-bounce" as const },
];

/** Language options */
export const LANGUAGE_OPTIONS = [
  { label: "English", value: "english" as const },
  { label: "Hindi", value: "hindi" as const },
];