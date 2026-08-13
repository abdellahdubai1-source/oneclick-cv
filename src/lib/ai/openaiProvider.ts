import type { AISuggestRequest } from '@/lib/cv/schema';
import type { AIProvider, AISuggestionResult } from './providerInterface';
import { AIProviderError } from './providerInterface';
import { AI_SYSTEM_PROMPT, buildUserPrompt } from './prompts';

/**
 * Optional OpenAI backend. Only used when AI_PROVIDER=openai and
 * OPENAI_API_KEY is set (see .env.example). Implemented with plain
 * `fetch` — no SDK dependency required.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly timeoutMs: number,
  ) {}

  async suggest(request: AISuggestRequest): Promise<AISuggestionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: AI_SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(request) },
          ],
          max_completion_tokens: 700,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new AIProviderError(`OpenAI API returned ${response.status}`, 'upstream_error');
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new AIProviderError('Empty response from OpenAI', 'invalid_response');

      return parseModelJson(content);
    } catch (err) {
      if (err instanceof AIProviderError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new AIProviderError('OpenAI request timed out', 'timeout');
      }
      throw new AIProviderError('Failed to reach OpenAI API', 'upstream_error');
    } finally {
      clearTimeout(timeout);
    }
  }
}

function parseModelJson(text: string): AISuggestionResult {
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed.suggestedText !== 'string' || typeof parsed.reason !== 'string') {
      throw new Error('missing fields');
    }
    return {
      suggestedText: parsed.suggestedText,
      reason: parsed.reason,
      suggestedItems: Array.isArray(parsed.suggestedItems) ? parsed.suggestedItems : undefined,
      source: 'ai',
    };
  } catch {
    throw new AIProviderError('AI provider returned an unparseable response', 'invalid_response');
  }
}
