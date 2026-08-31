// ============================================================
// OpenAI Provider
// ============================================================
// TODO: Implement real OpenAI integration here.
//
// Steps for production integration:
// 1. Add `openai` npm package: npm install openai
// 2. Configure API key via environment/config (never hardcode):
//    EXPO_PUBLIC_OPENAI_API_KEY in .env file
// 3. Initialize OpenAI client with:
//    const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });
// 4. Implement each method with proper prompt engineering
// 5. Handle rate limiting, retries, and token usage
// 6. Add streaming support for better UX
//
// Once implemented, update the provider configuration in index.ts
// to switch from MockAIProvider to OpenAIProvider.
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

/**
 * OpenAIProvider - Production AI provider using OpenAI API.
 * TODO: Implement all methods with actual OpenAI API calls.
 */
export class OpenAIProvider implements AIProvider {
  // TODO: Initialize OpenAI client in constructor
  // constructor() {
  //   this.client = new OpenAI({
  //     apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  //     dangerouslyAllowBrowser: true, // Required for React Native
  //   });
  // }

  async generateLegalNotice(_input: DraftLegalNoticeInput): Promise<DraftLegalNoticeResponse> {
    // TODO: Implement with OpenAI chat completion
    // const prompt = `Draft a legal notice with the following details:
    //   Notice Type: ${input.noticeType}
    //   Client: ${input.clientName}
    //   Recipient: ${input.recipientName}
    //   Facts: ${input.facts}
    //   Relief Sought: ${input.reliefSought}
    //   Language: ${input.language}`;
    //
    // const response = await this.client.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [{ role: "user", content: prompt }],
    // });
    // return JSON.parse(response.choices[0].message.content ?? "{}");
    throw new Error("OpenAIProvider not yet implemented. Use MockAIProvider for development.");
  }

  async summarizeJudgment(_input: SummarizeJudgmentInput): Promise<SummarizeJudgmentResponse> {
    throw new Error("OpenAIProvider not yet implemented. Use MockAIProvider for development.");
  }

  async explainBareAct(_input: ExplainBareActInput): Promise<ExplainBareActResponse> {
    throw new Error("OpenAIProvider not yet implemented. Use MockAIProvider for development.");
  }

  async generateCaseSummary(_input: GenerateCaseSummaryInput): Promise<CaseSummaryResponse> {
    throw new Error("OpenAIProvider not yet implemented. Use MockAIProvider for development.");
  }

  async searchLegalDocuments(_input: SearchLegalDocumentsInput): Promise<SearchDocumentsResponse> {
    throw new Error("OpenAIProvider not yet implemented. Use MockAIProvider for development.");
  }

  async generateChecklist(_input: GenerateChecklistInput): Promise<GenerateChecklistResponse> {
    throw new Error("OpenAIProvider not yet implemented. Use MockAIProvider for development.");
  }

  async findLawyers(_input: FindLawyersInput): Promise<FindLawyersResponse> {
    throw new Error("OpenAIProvider not yet implemented. Use MockAIProvider for development.");
  }
}