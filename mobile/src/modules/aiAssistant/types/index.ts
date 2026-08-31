// ============================================================
// AI Legal Assistant - Type Definitions
// ============================================================

/** Feature identifiers for the AI assistant */
export type AIFeature =
  | "draft-legal-notice"
  | "summarize-judgment"
  | "explain-bare-act"
  | "case-summary"
  | "search-documents"
  | "legal-checklist"
  | "find-lawyers";

/** Supported languages */
export type Language = "english" | "hindi";

/** Notice types for legal notice drafting */
export type NoticeType =
  | "legal-notice"
  | "demand-notice"
  | "eviction-notice"
  | "termination-notice"
  | "breach-notice"
  | "custom";

/** Case types for checklist generation */
export type ChecklistCaseType =
  | "civil"
  | "criminal"
  | "property"
  | "family"
  | "consumer"
  | "cheque-bounce";

// ---- Input types for each feature ----

export interface DraftLegalNoticeInput {
  noticeType: NoticeType;
  clientName: string;
  recipientName: string;
  facts: string;
  reliefSought: string;
  language: Language;
}

export interface SummarizeJudgmentInput {
  judgmentText: string;
}

export interface ExplainBareActInput {
  actName: string;
  sectionNumber: string;
}

export interface GenerateCaseSummaryInput {
  caseFacts: string;
  parties: string;
  issues: string;
  court: string;
}

export interface SearchLegalDocumentsInput {
  keyword: string;
}

export interface FindLawyersInput {
  specialization?: string;
  state?: string;
  city?: string;
}

export interface GenerateChecklistInput {
  caseType: ChecklistCaseType;
}

// ---- Response types for each feature ----

export interface DraftLegalNoticeResponse {
  noticeTitle: string;
  noticeBody: string;
  generatedAt: string;
}

export interface SummarizeJudgmentResponse {
  facts: string;
  issues: string;
  courtFindings: string;
  decision: string;
  keyObservations: string;
  ratioDecidendi: string;
}

export interface ExplainBareActResponse {
  simpleExplanation: string;
  importantKeywords: string[];
  example: string;
  futureCaseReferences: string;
}

export interface CaseSummaryResponse {
  background: string;
  legalIssues: string;
  arguments: string;
  evidence: string;
  outcome: string;
  importantPoints: string[];
}

export interface LegalDocumentSearchResult {
  id: string;
  title: string;
  matchedText: string;
  relevance: number;
}

export interface SearchDocumentsResponse {
  results: LegalDocumentSearchResult[];
  totalResults: number;
  query: string;
}

export interface ChecklistItem {
  category: string;
  items: string[];
}

export interface GenerateChecklistResponse {
  caseType: string;
  requiredDocuments: string[];
  importantDates: string[];
  applicableLaws: string[];
  courtProcedure: string[];
  estimatedTimeline: string;
  checklists: ChecklistItem[];
}

export interface LawyerMatchResult {
  id: string;
  name: string;
  specialization: string;
  city: string;
  state: string;
  phone?: string;
  about?: string;
}

export interface FindLawyersResponse {
  query: string;
  totalResults: number;
  summary: string;
  results: LawyerMatchResult[];
}

/** Union type for all AI responses */
export type AIResponse =
  | DraftLegalNoticeResponse
  | SummarizeJudgmentResponse
  | ExplainBareActResponse
  | CaseSummaryResponse
  | SearchDocumentsResponse
  | GenerateChecklistResponse
  | FindLawyersResponse;

/** History entry stored locally */
export interface AIHistoryEntry {
  id: string;
  feature: AIFeature;
  prompt: string;
  result: AIResponse;
  createdAt: string;
  isBookmarked: boolean;
}

/** Saved/bookmarked AI output */
export interface AISavedResult {
  id: string;
  historyId: string;
  feature: AIFeature;
  prompt: string;
  result: AIResponse;
  savedAt: string;
  notes?: string;
}

/** Generic loading/error state for any AI operation */
export interface AIOperationState<T = AIResponse> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

/** Feature metadata for cards */
export interface AIFeatureMeta {
  key: AIFeature;
  title: string;
  subtitle: string;
  icon: string;
  screen: string;
  description: string;
}