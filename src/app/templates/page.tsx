import type { Metadata } from 'next';
import Link from 'next/link';
import { TEMPLATE_LIST } from '@/lib/templates/registry';
import { createSampleCV } from '@/lib/cv/sampleData';
import TemplateRenderer from '@/components/templates/TemplateRenderer';

export const metadata: Metadata = {
  title: 'Templates',
  description: 'Six genuinely different, professional CV templates for UAE job seekers — from executive to ATS-optimised.',
};

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Professional templates</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-ink-500">
          Six genuinely different layouts — not one design recoloured six times. Every template can be switched
          without losing your data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_LIST.map((t) => (
          <div key={t.id} className="card overflow-hidden">
            <div className="h-72 overflow-hidden bg-ink-50">
              <div className="origin-top-left" style={{ transform: 'scale(0.34)', width: '294%' }}>
                <TemplateRenderer cv={createSampleCV(t.id)} mode="preview" />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink-900">{t.name}</h2>
                {t.atsFriendly && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    ATS-friendly
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-ink-500">{t.description}</p>
              <Link href="/builder" className="mt-3 inline-block text-xs font-semibold text-brand-600 hover:underline">
                Use this template →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
