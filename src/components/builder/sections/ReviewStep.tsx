'use client';

import { useCVStore } from '@/lib/state/cvStore';
import { CV_SECTION_IDS } from '@/lib/cv/types';
import { SECTION_LABELS, HIDEABLE_SECTIONS, isSectionEmpty } from '@/lib/cv/sectionOrder';

export default function ReviewStep() {
  const cv = useCVStore((s) => s.cv);
  const toggleSectionHidden = useCVStore((s) => s.toggleSectionHidden);
  const reorderSections = useCVStore((s) => s.reorderSections);

  const order = cv.sections.order.length > 0 ? cv.sections.order : [...CV_SECTION_IDS];

  function move(index: number, direction: -1 | 1) {
    const next = [...order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const currentSection = next[index];
    const targetSection = next[target];
    if (!currentSection || !targetSection) return;
    next[index] = targetSection;
    next[target] = currentSection;
    reorderSections(next);
  }

  const requiredFilled =
    cv.personal.fullName && cv.personal.professionalTitle && cv.personal.phone && cv.personal.email;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink-900">Final Review</h2>
        <p className="mt-1 text-sm text-ink-500">Confirm everything looks right, then reorder or hide sections below.</p>

        {!requiredFilled && (
          <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            Some required personal details are missing — go back to Personal Details to complete them.
          </div>
        )}

        <div className="mt-5 space-y-2">
          {order.map((section, index) => {
            const empty = isSectionEmpty(cv, section);
            const hidden = cv.sections.hidden.includes(section);
            return (
              <div key={section} className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink-800">{SECTION_LABELS[section].en}</p>
                  {empty && <p className="text-[11px] text-ink-400">Empty — automatically hidden from preview</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="rounded-md border border-ink-200 px-2 py-1 text-xs text-ink-500 disabled:opacity-30">↑</button>
                  <button type="button" disabled={index === order.length - 1} onClick={() => move(index, 1)} className="rounded-md border border-ink-200 px-2 py-1 text-xs text-ink-500 disabled:opacity-30">↓</button>
                  {HIDEABLE_SECTIONS.includes(section) && (
                    <button
                      type="button"
                      onClick={() => toggleSectionHidden(section)}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                        hidden ? 'border-ink-200 text-ink-400' : 'border-brand-200 text-brand-700'
                      }`}
                    >
                      {hidden ? 'Hidden' : 'Visible'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
