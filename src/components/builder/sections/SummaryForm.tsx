'use client';

import { useCVStore } from '@/lib/state/cvStore';
import AISuggestBox from '@/components/builder/ai/AISuggestBox';

export default function SummaryForm() {
  const cv = useCVStore((s) => s.cv);
  const updateSummary = useCVStore((s) => s.updateSummary);
  const applyTextWithUndo = useCVStore((s) => s.applyTextWithUndo);
  const undoLastChange = useCVStore((s) => s.undoLastChange);
  const lastUndo = useCVStore((s) => s.lastUndo);

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-ink-900">Professional Summary</h2>
      <p className="mt-1 text-sm text-ink-500">
        2–4 sentences that introduce who you are professionally. This is often the first thing a recruiter reads.
      </p>

      <textarea
        className="input mt-4"
        rows={6}
        value={cv.summary}
        onChange={(e) => updateSummary(e.target.value)}
        placeholder="e.g. Detail-oriented Marketing Executive with 5+ years of experience running multi-channel campaigns for UAE retail brands…"
      />

      <div className="mt-3">
        <AISuggestBox
          field="summary"
          text={cv.summary}
          context={{
            professionalTitle: cv.personal.professionalTitle,
            existingSkills: [...cv.skills.technical, ...cv.skills.soft].map((s) => s.name),
          }}
          onApply={(text) => applyTextWithUndo('summary', text, 'Professional summary')}
        />
      </div>

      {lastUndo?.fieldPath === 'summary' && (
        <button
          type="button"
          onClick={undoLastChange}
          className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
        >
          Undo last AI change
        </button>
      )}
    </div>
  );
}
