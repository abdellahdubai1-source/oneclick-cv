import type { AISuggestRequest } from '@/lib/cv/schema';

export interface AISuggestionResult {
  suggestedText: string;
  reason: string;
  /** Whether this came from a real AI model or the built-in fallback engine — surfaced in the UI so nothing is mislabeled (spec §13). */
  source: 'ai' | 'fallback';
  /** For actions that add multiple discrete items (skills, achievements). */
  suggestedItems?: string[];
}

/**
 * Every AI backend (real provider or fallback) implements this interface.
 * `src/app/api/ai/suggest/route.ts` depends only on this contract, so
 * swapping OpenAI for Anthropic — or adding a third provider — never
 * touches route or UI code.
 */
export interface AIProvider {
  readonly name: string;
  suggest(request: AISuggestRequest): Promise<AISuggestionResult>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code: 'timeout' | 'upstream_error' | 'invalid_response' | 'not_configured',
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}
