/**
 * Minimal in-memory rate limiter (sliding window counter).
 *
 * This is process-local, dependency-free, and good enough for a single
 * Node.js server instance. If you deploy across multiple serverless
 * instances/regions, swap this for a shared store (Upstash Redis,
 * Vercel KV, etc.) behind the same `checkRateLimit` signature — nothing
 * else in the codebase needs to change.
 */

interface Bucket {
  count: number;
  windowStartedAt: number;
}

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;

// Periodically forget stale buckets so this Map can't grow unbounded on a
// long-lived server process.
let lastSweep = Date.now();
function sweep() {
  const now = Date.now();
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.windowStartedAt > WINDOW_MS) buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  maxPerMinute: number,
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  sweep();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStartedAt > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStartedAt: now });
    return { allowed: true, remaining: maxPerMinute - 1, retryAfterMs: 0 };
  }

  if (bucket.count >= maxPerMinute) {
    return { allowed: false, remaining: 0, retryAfterMs: WINDOW_MS - (now - bucket.windowStartedAt) };
  }

  bucket.count += 1;
  return { allowed: true, remaining: maxPerMinute - bucket.count, retryAfterMs: 0 };
}

/** Derives a rate-limit key from a request without relying on trusting client-supplied headers for auth. */
export function rateLimitKeyFromRequest(req: Request, scope: string): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  return `${scope}:${ip}`;
}
