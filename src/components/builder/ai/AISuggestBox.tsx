'use client';

import { useEffect, useState } from 'react';
import { useAISuggestion } from '@/lib/ai/useAISuggestion';
import AIPrivacyNotice, { useAIPrivacyAcknowledged } from './AIPrivacyNotice';
import type { AISuggestRequest } from '@/lib/cv/schema';

export interface AIActionConfig {
  action: AISuggestRequest['action'];
  label: string;
}

const DEFAULT_ACTIONS: Record<AISuggestRequest['field'], AIActionConfig[]> = {
  professionalTitle: [{ action: 'improve', label: 'Improve wording' }],
  summary: [
    { action: 'create_summary', label: 'Suggest with AI' },
    { action: 'improve', label: 'Improve this text' },
    { action: 'make_professional', label: 'Make it professional' },
    { action: 'make_shorter', label: 'Make it shorter' },
    { action: 'fix_grammar', label: 'Fix grammar' },
  ],
  responsibility: [
    { action: 'improve_job_description', label: 'Improve this text' },
    { action: 'make_professional', label: 'Make it professional' },
    { action: 'fix_grammar', label: 'Fix grammar' },
    { action: 'make_shorter', label: 'Make it shorter' },
  ],
  achievement: [
    { action: 'generate_achievements', label: 'Generate achievements' },
    { action: 'improve', label: 'Improve this text' },
    { action: 'fix_grammar', label: 'Fix grammar' },
  ],
  skills: [{ action: 'add_skills', label: 'Add relevant skills' }],
};

interface AISuggestBoxProps {
  field: AISuggestRequest['field'];
  text: string;
  context?: AISuggestRequest['context'];
  onApply: (newText: string) => void;
  onApplyItem?: (item: string) => void;
  compact?: boolean;
}

/**
 * Reusable "Suggest with AI" control (spec §11). Shows the configured
 * action buttons for a field, a short privacy notice the first time it's
 * used, then original/suggested/reason with edit-before-applying,
 * apply/reject, loading and error states.
 */
export default function AISuggestBox({ field, text, context, onApply, onApplyItem, compact }: AISuggestBoxProps) {
  const { status, result, error, run, reset } = useAISuggestion();
  const [privacyAcknowledged, acknowledgePrivacy] = useAIPrivacyAcknowledged();
  const [pendingAction, setPendingAction] = useState<AISuggestRequest['action'] | null>(null);
  const [editableText, setEditableText] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);

  const actions = DEFAULT_ACTIONS[field];

  function requestAction(action: AISuggestRequest['action']) {
    setPendingAction(action);
    if (!privacyAcknowledged) {
      setShowPrivacy(true);
      return;
    }
    void execute(action);
  }

  async function execute(action: AISuggestRequest['action']) {
    reset();
    await run({ action, field, text, context });
  }

  // Sync editable textarea whenever a fresh suggestion arrives.
  useEffect(() => {
    if (status === 'success' && result?.suggestedText) {
      setEditableText(result.suggestedText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, result]);

  function handleReject() {
    reset();
    setEditableText('');
    setPendingAction(null);
  }

  function handleApply() {
    onApply(editableText);
    reset();
    setEditableText('');
    setPendingAction(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {actions.map((a) => (
          <button
            key={a.action}
            type="button"
            onClick={() => requestAction(a.action)}
            disabled={status === 'loading'}
            className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700 transition hover:bg-brand-100 disabled:opacity-50"
          >
            {status === 'loading' && pendingAction === a.action ? (
              <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
            ) : (
              <SparkleIcon />
            )}
            {a.label}
          </button>
        ))}
      </div>

      {showPrivacy && !privacyAcknowledged && (
        <AIPrivacyNotice
          onCancel={() => {
            setShowPrivacy(false);
            setPendingAction(null);
          }}
          onAcknowledge={() => {
            acknowledgePrivacy();
            setShowPrivacy(false);
            if (pendingAction) void execute(pendingAction);
          }}
        />
      )}

      {status === 'error' && error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => pendingAction && execute(pendingAction)} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {status === 'success' && result && (
        <div className="space-y-2 rounded-xl border border-ink-100 bg-ink-50 p-3">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                result.source === 'ai' ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {result.source === 'ai' ? 'AI suggestion' : 'Fallback suggestion'}
            </span>
            {result.degraded && (
              <span className="text-[10px] text-ink-400">AI provider unavailable — used fallback engine</span>
            )}
          </div>

          {result.suggestedItems && result.suggestedItems.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {result.suggestedItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onApplyItem?.(item)}
                  className="rounded-full border border-brand-300 bg-white px-2.5 py-1 text-[11px] font-medium text-brand-700 hover:bg-brand-50"
                >
                  + {item}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              rows={compact ? 2 : 4}
              className="w-full rounded-lg border border-ink-200 bg-white px-2.5 py-2 text-[12.5px] leading-relaxed text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          )}

          <p className="text-[11px] leading-relaxed text-ink-500">{result.reason}</p>

          {!result.suggestedItems && (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleReject}
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-[11px] font-semibold text-ink-600 hover:bg-white"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-[11px] font-semibold text-white hover:bg-brand-700"
              >
                Apply
              </button>
            </div>
          )}
          {result.suggestedItems && (
            <div className="flex justify-end">
              <button type="button" onClick={handleReject} className="text-[11px] font-semibold text-ink-500 hover:underline">
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
      <path
        d="M8 1.5 9.2 5.4 13 6.5 9.2 7.6 8 11.5 6.8 7.6 3 6.5 6.8 5.4 8 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
