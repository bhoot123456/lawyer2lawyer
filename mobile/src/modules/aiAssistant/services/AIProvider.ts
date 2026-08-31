// ============================================================
// AI Provider Interface
// This defines the contract that all AI providers must implement.
// To switch from MockAIProvider to OpenAIProvider, change only
// the provider configuration, not the UI or business logic.
// ============================================================

import type {
  DraftLegalNoticeInput,
  DraftLegalNoticeResponse,
  SummarizeJudgmentInput,
  SummarizeJudgmentResponse,
  ExplainBareActInput,
  ExplainBareActResponse,
  GenerateCaseSummaryInput,
  CaseSummaryResponse,
  SearchLegalDocumentsInput,
  SearchDocumentsResponse,
  GenerateChecklistInput,
  GenerateChecklistResponse,
  FindLawyersInput,
  FindLawyersResponse,
} from "../types";

/**
 * AIProvider interface - all methods return Promises for async operation.
 * Implement this interface to create new AI providers.
 */
export interface AIProvider {
  /** Generate a legal notice based on input parameters */
  generateLegalNotice(input: DraftLegalNoticeInput): Promise<DraftLegalNoticeResponse>;

  /** Summarize a judgment from its full text */
  summarizeJudgment(input: SummarizeJudgmentInput): Promise<SummarizeJudgmentResponse>;

  /** Explain a bare act section in simple language */
  explainBareAct(input: ExplainBareActInput): Promise<ExplainBareActResponse>;

  /** Generate a structured case summary */
  generateCaseSummary(input: GenerateCaseSummaryInput): Promise<CaseSummaryResponse>;

  /** Search legal documents by keyword */
  searchLegalDocuments(input: SearchLegalDocumentsInput): Promise<SearchDocumentsResponse>;

  /** Generate a legal checklist for a given case type */
  generateChecklist(input: GenerateChecklistInput): Promise<GenerateChecklistResponse>;

  /** Find lawyers based on specialization, state, and/or city */
  findLawyers(input: FindLawyersInput): Promise<FindLawyersResponse>;
}