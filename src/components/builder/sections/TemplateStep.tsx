'use client';

import { useCVStore } from '@/lib/state/cvStore';
import { TEMPLATE_LIST } from '@/lib/templates/registry';
import { COLOR_PRESET_LIST } from '@/lib/cv/colorPresets';
import { cn } from '@/lib/utils/cn';

export default function TemplateStep() {
  const cv = useCVStore((s) => s.cv);
  const setTemplate = useCVStore((s) => s.setTemplate);
  const setColorPreset = useCVStore((s) => s.setColorPreset);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink-900">Choose a template</h2>
        <p className="mt-1 text-sm text-ink-500">Switching templates never loses your data.</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TEMPLATE_LIST.map((t) => {
            const active = cv.template.templateId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={cn(
                  'rounded-2xl border-2 p-4 text-left transition',
                  active ? 'border-brand-500 bg-brand-50' : 'border-ink-100 hover:border-ink-200',
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-900">{t.name}</p>
                  {t.atsFriendly && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      ATS-friendly
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-500">{t.tagline}</p>
                <p className="mt-2 text-[11px] text-ink-400">{t.description}</p>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-ink-400">
                  Best for: {t.bestFor.join(', ')}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink-900">Accent colour</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {COLOR_PRESET_LIST.map((c) => {
            const active = cv.template.colorPreset === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setColorPreset(c.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition',
                  active ? 'border-ink-900' : 'border-transparent hover:border-ink-200',
                )}
                aria-label={c.label}
              >
                <span className="h-9 w-9 rounded-full ring-1 ring-black/5" style={{ background: c.primary }} />
                <span className="text-[10px] font-medium text-ink-600">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
