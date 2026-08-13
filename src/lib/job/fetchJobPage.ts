import 'server-only';
import { validateJobUrl, UrlSecurityError } from './urlValidation';

/**
 * Secure server-side fetch for the Job-Link Analyser (spec §15/§19).
 *
 * - Validates the URL and every redirect hop (`redirect: 'manual'` + manual
 *   re-validation, rather than trusting `fetch`'s automatic redirect
 *   follower).
 * - Enforces a strict timeout and response-size cap.
 * - Only accepts `text/html`-ish content types.
 * - Never forwards cookies or credentials.
 */

const DEFAULT_TIMEOUT_MS = Number(process.env.JOB_FETCH_TIMEOUT_MS ?? 8000);
const DEFAULT_MAX_BYTES = Number(process.env.JOB_FETCH_MAX_BYTES ?? 2_000_000);
const DEFAULT_MAX_REDIRECTS = Number(process.env.JOB_FETCH_MAX_REDIRECTS ?? 3);

export interface FetchedJobPage {
  finalUrl: string;
  html: string;
  contentType: string;
}

export class JobFetchError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'security_blocked'
      | 'timeout'
      | 'too_large'
      | 'unsupported_content_type'
      | 'http_error'
      | 'too_many_redirects'
      | 'network_error',
  ) {
    super(message);
    this.name = 'JobFetchError';
  }
}

export async function fetchJobPage(rawUrl: string): Promise<FetchedJobPage> {
  let currentUrl = rawUrl;

  for (let hop = 0; hop <= DEFAULT_MAX_REDIRECTS; hop++) {
    let validated;
    try {
      validated = await validateJobUrl(currentUrl);
    } catch (err) {
      if (err instanceof UrlSecurityError) {
        throw new JobFetchError(err.message, 'security_blocked');
      }
      throw new JobFetchError('Could not validate this URL.', 'security_blocked');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(validated.url.toString(), {
        method: 'GET',
        redirect: 'manual',
        credentials: 'omit',
        signal: controller.signal,
        headers: {
          'user-agent': 'OneClickCV-JobLinkAnalyser/1.0 (+https://oneclickcv.example/privacy)',
          accept: 'text/html,application/xhtml+xml',
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new JobFetchError('This page took too long to respond.', 'timeout');
      }
      throw new JobFetchError('We could not reach this page.', 'network_error');
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new JobFetchError('This page redirected without a destination.', 'http_error');
      if (hop === DEFAULT_MAX_REDIRECTS) {
        throw new JobFetchError('Too many redirects.', 'too_many_redirects');
      }
      currentUrl = new URL(location, validated.url).toString();
      continue; // loop re-validates the new URL from scratch
    }

    if (!response.ok) {
      throw new JobFetchError(`This page returned an error (HTTP ${response.status}).`, 'http_error');
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new JobFetchError('This link does not point to a readable web page.', 'unsupported_content_type');
    }

    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > DEFAULT_MAX_BYTES) {
      throw new JobFetchError('This page is too large to analyse.', 'too_large');
    }

    const html = await readBodyWithLimit(response, DEFAULT_MAX_BYTES);

    return { finalUrl: validated.url.toString(), html, contentType };
  }

  throw new JobFetchError('Too many redirects.', 'too_many_redirects');
}

async function readBodyWithLimit(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return response.text();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let result = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      throw new JobFetchError('This page is too large to analyse.', 'too_large');
    }
    result += decoder.decode(value, { stream: true });
  }
  result += decoder.decode();
  return result;
}
