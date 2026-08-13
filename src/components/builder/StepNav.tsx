'use client';

import { BUILDER_STEPS, type BuilderStepId } from '@/lib/cv/types';
import { cn } from '@/lib/utils/cn';

export const STEP_LABELS: Record<BuilderStepId, string> = {
  personal: 'Personal Details',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills & Languages',
  certifications: 'Certifications',
  uae: 'UAE Details',
  template: 'Template',
  ats: 'ATS & Job Match',
  review: 'Final Review',
  download: 'Download',
};

export default function StepNav({
  current,
  onSelect,
  completed,
}: {
  current: BuilderStepId;
  onSelect: (step: BuilderStepId) => void;
  completed: Set<BuilderStepId>;
}) {
  const currentIndex = BUILDER_STEPS.indexOf(current);

  return (
    <nav aria-label="CV builder steps" className="space-y-1">
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / BUILDER_STEPS.length) * 100}%` }}
        />
      </div>
      {BUILDER_STEPS.map((step, i) => {
        const isActive = step === current;
        const isDone = completed.has(step);
        return (
          <button
            key={step}
            type="button"
            onClick={() => onSelect(step)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition',
              isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50',
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                isActive
                  ? 'bg-brand-600 text-white'
                  : isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-ink-100 text-ink-400',
              )}
            >
              {isDone && !isActive ? '✓' : i + 1}
            </span>
            {STEP_LABELS[step]}
          </button>
        );
      })}
    </nav>
  );
}
