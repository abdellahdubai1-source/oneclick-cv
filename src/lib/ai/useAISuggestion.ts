'use client';

import { useState, useCallback } from 'react';
import type { AISuggestRequest } from '@/lib/cv/schema';
import type { AISuggestionResult } from './providerInterface';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseAISuggestionState {
  status: Status;
  result: (AISuggestionResult & { degraded?: boolean }) | null;
  error: string | null;
  run: (request: AISuggestRequest) => Promise<void>;
  reset: () => void;
}

/** Thin client hook around POST /api/ai/suggest with loading/error state (spec §11: show loading and error states). */
export function useAISuggestion(): UseAISuggestionState {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<(AISuggestionResult & { degraded?: boolean }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (request: AISuggestRequest) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${response.status})`);
      }
      const data = (await response.json()) as AISuggestionResult & { degraded?: boolean };
      setResult(data);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, run, reset };
}
