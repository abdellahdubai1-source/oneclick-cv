import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchJobPage, JobFetchError } from '@/lib/job/fetchJobPage';
import { extractJobPageContent } from '@/lib/job/htmlExtraction';
import { parseJobPosting } from '@/lib/job/jobParsing';
import { checkRateLimit, rateLimitKeyFromRequest } from '@/lib/security/rateLimit';
import { looksLikePromptInjection } from '@/lib/security/sanitize';

export const runtime = 'nodejs';

const RATE_LIMIT_PER_MINUTE = Number(process.env.JOB_FETCH_RATE_LIMIT_PER_MINUTE ?? 10);

const requestSchema = z.object({
  url: z.string().trim().min(4).max(2000),
});

/**
 * Public Job-Link Analyser server route (spec §15/§19).
 *
 * This is the ONLY place in the app that fetches an arbitrary, user-supplied
 * URL. Every response — success or failure — is treated as untrusted data:
 * we never let extracted page content control this route's behaviour, and
 * we always give the client a clear, safe fallback message rather than an
 * endless loading state or a raw server error.
 */
export async function POST(req: Request) {
  const rateLimitKey = rateLimitKeyFromRequest(req, 'job-extract');
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_PER_MINUTE);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many link checks. Please wait a moment before trying another link.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.retryAfterMs / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please provide a valid URL.' }, { status: 400 });
  }

  try {
    const page = await fetchJobPage(parsed.data.url);
    const extracted = extractJobPageContent(page.html);
    if (!extracted.structuredJob && extracted.text.length < 120) {
      throw new JobFetchError('The page did not expose a readable job description.', 'unsupported_content_type');
    }
    const sourceText = extracted.structuredJob?.description || extracted.text;
    const jobPosting = {
      ...parseJobPosting(sourceText, extracted.title, extracted.structuredJob),
      sourceUrl: page.finalUrl,
      extractionMethod: extracted.structuredJob ? 'structured_data' as const : 'page_text' as const,
    };

    return NextResponse.json({
      ok: true,
      finalUrl: page.finalUrl,
      pageTitle: extracted.title,
      jobPosting,
      promptInjectionDetected: looksLikePromptInjection(sourceText),
      extractionMethod: jobPosting.extractionMethod,
    });
  } catch (err) {
    const fetchError = err instanceof JobFetchError ? err : null;
    // Never leak raw internal error details (spec §19: "do not expose raw server errors").
    // eslint-disable-next-line no-console
    console.error('Job link fetch failed:', fetchError?.code ?? 'unknown', err instanceof Error ? err.message : err);

    return NextResponse.json(
      {
        ok: false,
        error:
          "We couldn't read this job page automatically. Please copy and paste the job description below.",
        code: fetchError?.code ?? 'unknown_error',
      },
      { status: 200 }, // 200 on purpose: this is an expected, handled outcome the UI renders inline, not a hard failure
    );
  }
}
