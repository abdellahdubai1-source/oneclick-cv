'use client';

import { useMemo, useState } from 'react';
import { useCVStore } from '@/lib/state/cvStore';
import { runATSCheck, type ATSFeedbackItem } from '@/lib/ats/scoring';
import ATSScoreGauge from './ATSScoreGauge';
import ATSTextPreview from '@/components/preview/ATSTextPreview';
import { cn } from '@/lib/utils/cn';

type SkillDecision = 'yes' | 'yes_edit' | 'no' | 'not_sure';

export default function ATSChecker() {
  const cv = useCVStore((s) => s.cv);
  const addSkill = useCVStore((s) => s.addSkill);
  const [jobText, setJobText] = useState('');
  const [analysed, setAnalysed] = useState(false);
  const [view, setView] = useState<'feedback' | 'ats-text'>('feedback');
  const [confirmingSkill, setConfirmingSkill] = useState<ATSFeedbackItem | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());

  const result = useMemo(() => (analysed ? runATSCheck(cv, jobText) : null), [analysed, cv, jobText]);

  function handleAnalyse() {
    setAnalysed(true);
  }

  function openSkillConfirm(item: ATSFeedbackItem) {
    setConfirmingSkill(item);
    setEditValue(item.title);
  }

  function resolveSkillDecision(decision: SkillDecision) {
    if (!confirmingSkill) return;
    if (decision === 'yes') {
      addSkill('technical', { name: confirmingSkill.title });
      setAddedSkills((prev) => new Set(prev).add(confirmingSkill.title));
    } else if (decision === 'yes_edit') {
      if (editValue.trim()) {
        addSkill('technical', { name: editValue.trim() });
        setAddedSkills((prev) => new Set(prev).add(confirmingSkill.title));
      }
    }
    setConfirmingSkill(null);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
        <h3 className="mb-1 text-sm font-semibold text-ink-900">Paste a job description</h3>
        <p className="mb-3 text-xs text-ink-500">
          We'll compare it against your current CV to estimate ATS readiness and job match.
        </p>
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          rows={8}
          placeholder="Paste the full job description here…"
          className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-[13px] leading-relaxed text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleAnalyse}
            disabled={jobText.trim().length < 20}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Analyse match
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <ATSScoreGauge result={result} />
          </div>

          <div className="flex gap-2 border-b border-ink-100">
            <TabButton active={view === 'feedback'} onClick={() => setView('feedback')} label="Feedback" />
            <TabButton active={view === 'ats-text'} onClick={() => setView('ats-text')} label="ATS text preview" />
          </div>

          {view === 'feedback' ? (
            <div className="space-y-5">
              <FeedbackGroup title="Strong matches" items={result.strongMatches} tone="positive" />
              <FeedbackGroup
                title="Missing keywords"
                items={result.missingKeywords}
                tone="warning"
                onAction={openSkillConfirm}
                actionLabel="Confirm & add"
                addedSkills={addedSkills}
              />
              <FeedbackGroup title="Missing requirements" items={result.missingRequirements} tone="warning" />
              <FeedbackGroup title="Formatting issues" items={result.formattingIssues} tone="warning" />
              <FeedbackGroup title="Content improvements" items={result.contentImprovements} tone="neutral" />
              <FeedbackGroup
                title="Recommended skills"
                items={result.recommendedSkills}
                tone="neutral"
                onAction={openSkillConfirm}
                actionLabel="Confirm & add"
                addedSkills={addedSkills}
              />
            </div>
          ) : (
            <ATSTextPreview cv={cv} />
          )}
        </div>
      )}

      {confirmingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-scaleIn">
            <h4 className="text-sm font-semibold text-ink-900">
              Do you genuinely have this skill or experience?
            </h4>
            <p className="mt-1 text-xs text-ink-500">"{confirmingSkill.title}"</p>

            <div className="mt-3">
              <label className="text-xs font-medium text-ink-600">Skill wording to add</label>
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => resolveSkillDecision('yes')}
                className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
              >
                Yes, add it professionally
              </button>
              <button
                type="button"
                onClick={() => resolveSkillDecision('yes_edit')}
                className="rounded-lg border border-brand-300 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                Yes, but edit before adding
              </button>
              <button
                type="button"
                onClick={() => resolveSkillDecision('no')}
                className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-600 hover:bg-ink-50"
              >
                No, do not add
              </button>
              <button
                type="button"
                onClick={() => resolveSkillDecision('not_sure')}
                className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-600 hover:bg-ink-50"
              >
                Not sure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition',
        active ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-700',
      )}
    >
      {label}
    </button>
  );
}

function FeedbackGroup({
  title,
  items,
  tone,
  onAction,
  actionLabel,
  addedSkills,
}: {
  title: string;
  items: ATSFeedbackItem[];
  tone: 'positive' | 'warning' | 'neutral';
  onAction?: (item: ATSFeedbackItem) => void;
  actionLabel?: string;
  addedSkills?: Set<string>;
}) {
  if (items.length === 0) return null;
  const toneClass =
    tone === 'positive' ? 'border-emerald-200 bg-emerald-50' : tone === 'warning' ? 'border-amber-200 bg-amber-50' : 'border-ink-100 bg-white';

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-ink-900">
        {title} <span className="font-normal text-ink-400">({items.length})</span>
      </h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className={cn('rounded-xl border p-3', toneClass)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-ink-900">{item.title}</p>
                <p className="mt-0.5 text-[12px] text-ink-600">{item.detail}</p>
                <p className="mt-1 text-[11px] text-ink-500">
                  <span className="font-semibold">Why it matters: </span>
                  {item.whyItMatters}
                </p>
                <p className="text-[11px] text-ink-500">
                  <span className="font-semibold">Suggested: </span>
                  {item.suggestedFix}
                </p>
              </div>
              {onAction && item.requiresConfirmation && (
                <button
                  type="button"
                  onClick={() => onAction(item)}
                  disabled={addedSkills?.has(item.title)}
                  className="shrink-0 whitespace-nowrap rounded-lg border border-brand-300 px-2.5 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                >
                  {addedSkills?.has(item.title) ? 'Added' : actionLabel}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
