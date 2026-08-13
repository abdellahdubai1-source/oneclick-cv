import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJobPosting } from '@/lib/job/jobParsing';
import { checkRateLimit, rateLimitKeyFromRequest } from '@/lib/security/rateLimit';
import { cleanUserText } from '@/lib/security/sanitize';

export const runtime = 'nodejs';

const requestSchema = z.object({
  text: z.string().trim().min(20).max(20000),
});

/**
 * Parses a pasted job description or extracted upload text (spec §15).
 * No outbound fetch happens here — this route exists mainly so the same
 * validation/rate-limiting posture applies whether a job description
 * arrived via URL, paste, or file upload. The client may also call
 * `parseJobPosting` directly (it has no server-only dependency) when an
 * instant, offline-friendly result is preferable.
 */
export async function POST(req: Request) {
  const rateLimit = checkRateLimit(rateLimitKeyFromRequest(req, 'job-parse-text'), 30);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please paste a longer job description (at least 20 characters).' }, { status: 400 });
  }

  const text = cleanUserText(parsed.data.text, 20000);
  const jobPosting = parseJobPosting(text);
  return NextResponse.json({ ok: true, jobPosting });
}
