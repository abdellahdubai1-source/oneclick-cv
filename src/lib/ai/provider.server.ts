import 'server-only';
import type { AIProvider } from './providerInterface';
import { fallbackProvider } from './fallbackEngine';
import { AnthropicProvider } from './anthropicProvider';
import { OpenAIProvider } from './openaiProvider';

/**
 * Server-only provider selection. Import this ONLY from API routes —
 * never from client components — so provider API keys can never end up in
 * client bundles (spec §13: "never expose keys in frontend code").
 */
export function getAIProvider(): AIProvider {
  const selected = (process.env.AI_PROVIDER ?? 'fallback').toLowerCase();
  const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 20000);

  if (selected === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    return new AnthropicProvider(
      process.env.ANTHROPIC_API_KEY,
      process.env.ANTHROPIC_MODEL ?? 'claude-3-5-haiku-20241022',
      timeoutMs,
    );
  }

  if (selected === 'openai' && process.env.OPENAI_API_KEY) {
    return new OpenAIProvider(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL ?? 'gpt-4o-mini', timeoutMs);
  }

  // No key configured (or AI_PROVIDER=fallback) — always fall back so the
  // app keeps working end-to-end without any environment variables set.
  return fallbackProvider;
}
