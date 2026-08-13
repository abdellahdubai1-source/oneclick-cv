import { NextResponse } from 'next/server';
import { aiSuggestRequestSchema, AI_TEXT_MAX_CHARS } from '@/lib/cv/schema';
import { getAIProvider } from '@/lib/ai/provider.server';
import { AIProviderError } from '@/lib/ai/providerInterface';
import { fallbackProvider } from '@/lib/ai/fallbackEngine';
import { checkRateLimit, rateLimitKeyFromRequest } from '@/lib/security/rateLimit';
import { cleanUserText } from '@/lib/security/sanitize';

export const runtime = 'nodejs';

const RATE_LIMIT_PER_MINUTE = Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 20);

export async function POST(req: Request) {
  const rateLimitKey = rateLimitKeyFromRequest(req, 'ai-suggest');
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_PER_MINUTE);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.retryAfterMs / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = aiSuggestRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const request = {
    ...parsed.data,
    text: cleanUserText(parsed.data.text, AI_TEXT_MAX_CHARS),
  };

  const provider = getAIProvider();

  try {
    const result = await provider.suggest(request);
    return NextResponse.json(result);
  } catch (err) {
    // Never fail the user's workflow because the AI provider is down —
    // degrade to the fallback engine and label the result accordingly
    // (spec §13: "the application must still work using a high-quality
    // profession-based fallback engine").
    // eslint-disable-next-line no-console
    console.error('AI provider error, falling back:', err instanceof AIProviderError ? err.code : err);
    try {
      const fallbackResult = await fallbackProvider.suggest(request);
      return NextResponse.json({
        ...fallbackResult,
        degraded: true,
        degradedReason:
          err instanceof AIProviderError ? err.code : 'unknown_error',
      });
    } catch {
      return NextResponse.json({ error: 'Suggestion service is temporarily unavailable.' }, { status: 502 });
    }
  }
}
