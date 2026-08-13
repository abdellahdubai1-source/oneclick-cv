import type { AISuggestRequest } from '@/lib/cv/schema';
import type { AIProvider, AISuggestionResult } from './providerInterface';
import { AIProviderError } from './providerInterface';
import { AI_SYSTEM_PROMPT, buildUserPrompt } from './prompts';

/**
 * Optional Anthropic Claude backend. Only used when AI_PROVIDER=anthropic
 * and ANTHROPIC_API_KEY is set (see .env.example). Implemented with plain
 * `fetch` — no SDK dependency required.
 */
export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly timeoutMs: number,
  ) {}

  async suggest(request: AISuggestRequest): Promise<AISuggestionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 700,
          system: AI_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildUserPrompt(request) }],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new AIProviderError(`Anthropic API returned ${response.status}`, 'upstream_error');
      }

      const data = (await response.json()) as { content?: { type: string; text?: string }[] };
      const textBlock = data.content?.find((b) => b.type === 'text');
      if (!textBlock?.text) throw new AIProviderError('Empty response from Anthropic', 'invalid_response');

      return parseModelJson(textBlock.text);
    } catch (err) {
      if (err instanceof AIProviderError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new AIProviderError('Anthropic request timed out', 'timeout');
      }
      throw new AIProviderError('Failed to reach Anthropic API', 'upstream_error');
    } finally {
      clearTimeout(timeout);
    }
  }
}

function parseModelJson(text: string): AISuggestionResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
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
