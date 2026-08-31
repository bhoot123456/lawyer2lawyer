// ============================================================
// Unavailable AI Provider
// ============================================================
// Production-safe provider used by the AI feature screens (the
// "AI TOOLS" cards on the AI hub).
//
// The backend only exposes a generic real-time AI chat
// (`POST /api/ai/chat` via OpenRouter), which is used by the
// Floating AI Agent. It does NOT expose structured per-feature
// endpoints (legal notice, judgment summary, checklist, etc.)
// that match the shape of these screens.
//
// WIRING THESE SCREENS TO REAL AI IS NOT YET SAFE:
//   - the backend returns free-text assistant replies, not the
//     structured response objects these screens expect to render;
//   - parsing free text into structured fields is unreliable and
//     can crash or fabricate (misshaped) legal output.
//
// Therefore these feature screens must NOT fabricate output, and
// must NOT claim to return real AI results. This provider throws a
// controlled, informative error so the screen's existing ErrorCard
// renders and the app never shows mocked or invented legal content.
//
// If the backend later adds structured operations for these
// features, replace this provider with a real implementation that
// calls those endpoints (keep the same AIProvider interface).
// ============================================================

import type { AIProvider } from "./AIProvider";
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

const UNAVAILABLE_MESSAGE =
  "This AI tool is not available yet. Use the AI Assistant chat (sparkle bubble) for real-time legal help.";

/**
 * UnavailableAIProvider - rejects every operation with a clear,
 * controlled message. Guarantees no fabricated legal output reaches
 * production for the structured AI feature screens.
 */
export class UnavailableAIProvider implements AIProvider {
  private fail(): Promise<never> {
    return Promise.reject(new Error(UNAVAILABLE_MESSAGE));
  }

  async generateLegalNotice(
    _input: DraftLegalNoticeInput
  ): Promise<DraftLegalNoticeResponse> {
    return this.fail();
  }

  async summarizeJudgment(
    _input: SummarizeJudgmentInput
  ): Promise<SummarizeJudgmentResponse> {
    return this.fail();
  }

  async explainBareAct(
    _input: ExplainBareActInput
  ): Promise<ExplainBareActResponse> {
    return this.fail();
  }

  async generateCaseSummary(
    _input: GenerateCaseSummaryInput
  ): Promise<CaseSummaryResponse> {
    return this.fail();
  }

  async searchLegalDocuments(
    _input: SearchLegalDocumentsInput
  ): Promise<SearchDocumentsResponse> {
    return this.fail();
  }

  async generateChecklist(
    _input: GenerateChecklistInput
  ): Promise<GenerateChecklistResponse> {
    return this.fail();
  }

  async findLawyers(_input: FindLawyersInput): Promise<FindLawyersResponse> {
    return this.fail();
  }
}