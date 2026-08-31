// ============================================================
// AI Service Configuration
// ============================================================
// PRODUCTION SAFETY:
//
// The structured AI "feature" screens (Draft Legal Notice,
// Summarize Judgment, Explain Bare Act, Case Summary, Search
// Documents, Legal Checklist, Lawyer Assistant) previously defaulted
// to MockAIProvider, which FABRICATED legal output. That is
// unacceptable for production.
//
// The backend exposes a REAL generic AI chat (`POST /api/ai/chat`
// via OpenRouter), used by the Floating AI Agent. It does NOT expose
// structured per-feature endpoints matching these screens' response
// shapes. Because wiring them to real AI would require unreliable
// free-text -> structured parsing (crash / fabrication risk), the
// feature screens are now gated behind UnavailableAIProvider:
//
//   - No mocked or invented legal content can reach production.
//   - Direct navigation to an /ai-* feature shows a controlled
//     "not available" error (existing ErrorCard), never fake output.
//   - The real AI chat (Floating AI Agent) is unaffected.
//
// MockAIProvider / OpenAIProvider are retained as exports for
// development/testing reference only. They are NOT the active default.
// ============================================================

import type { AIProvider } from "./AIProvider";
import { UnavailableAIProvider } from "./UnavailableAIProvider";

let provider: AIProvider | null = null;

/**
 * Get the configured AI provider instance.
 * Defaults to UnavailableAIProvider (production-safe, no fabrication).
 */
export function getAIProvider(): AIProvider {
  if (!provider) {
    provider = new UnavailableAIProvider();
  }
  return provider;
}

/**
 * Reset the provider instance (useful for testing or switching at runtime).
 */
export function resetAIProvider(): void {
  provider = null;
}

export type { AIProvider } from "./AIProvider";
export { MockAIProvider } from "./MockAIProvider";
export { OpenAIProvider } from "./OpenAIProvider";
export { UnavailableAIProvider } from "./UnavailableAIProvider";