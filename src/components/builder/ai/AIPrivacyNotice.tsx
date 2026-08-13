'use client';

import { useEffect, useState } from 'react';

const ACK_KEY = 'oneclickcv:ai-privacy-ack';

/**
 * Short privacy notice shown before the first time any text is sent to an
 * AI provider (spec §13). Dismissing it is remembered per-browser so it
 * doesn't interrupt every suggestion request afterwards.
 */
export function useAIPrivacyAcknowledged(): [boolean, () => void] {
  const [acknowledged, setAcknowledged] = useState(true);

  useEffect(() => {
    setAcknowledged(typeof window !== 'undefined' && window.localStorage.getItem(ACK_KEY) === '1');
  }, []);

  function acknowledge() {
    window.localStorage.setItem(ACK_KEY, '1');
    setAcknowledged(true);
  }

  return [acknowledged, acknowledge];
}

export default function AIPrivacyNotice({ onAcknowledge, onCancel }: { onAcknowledge: () => void; onCancel: () => void }) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
      <p className="font-semibold">Before we send this to AI</p>
      <p className="mt-1 leading-relaxed">
        The text in this field will be sent to generate a suggestion. If no AI provider is configured, this happens
        entirely on our built-in fallback engine and nothing leaves your session. We never send your full CV — only
        the specific field you're improving — and suggestions are never applied automatically; you choose to accept
        or reject each one.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onAcknowledge}
          className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
