// ============================================================
// AI Service Configuration
// ============================================================
// To switch from MockAIProvider to OpenAIProvider:
// Change the import statement below and the instance creation.
// No other file in the application needs to change.
// ============================================================

import type { AIProvider } from "./AIProvider";
import { MockAIProvider } from "./MockAIProvider";

// ============================================================
// PROVIDER CONFIGURATION
// ============================================================
// TODO: To switch to OpenAIProvider in production:
// 1. Import OpenAIProvider instead of MockAIProvider:
//    import { OpenAIProvider } from "./OpenAIProvider";
// 2. Change the instantiation below:
//    const provider: AIProvider = new OpenAIProvider();
// 3. Ensure EXPO_PUBLIC_OPENAI_API_KEY is set in your .env file
// 4. The rest of the application works without any changes
// ============================================================

let provider: AIProvider | null = null;

/**
 * Get the configured AI provider instance.
 * Uses lazy initialization with MockAIProvider as default.
 */
export function getAIProvider(): AIProvider {
  if (!provider) {
    provider = new MockAIProvider();
    // TODO: Replace with OpenAIProvider for production:
    // provider = new OpenAIProvider();
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