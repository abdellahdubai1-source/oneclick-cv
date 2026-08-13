import Link from 'next/link';
import { TEMPLATE_LIST } from '@/lib/templates/registry';
import { createSampleCV } from '@/lib/cv/sampleData';
import TemplateRenderer from '@/components/templates/TemplateRenderer';

export default function TemplatesPreview() {
  return (
    <section className="bg-ink-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Premium templates, genuinely different</h2>
          <p className="mt-2 text-sm text-ink-500">
            Not one layout recoloured six times — each template has its own structure, spacing and photo treatment.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_LIST.slice(0, 3).map((t) => (
            <div key={t.id} className="card overflow-hidden transition hover:shadow-card-hover">
              <div className="h-64 overflow-hidden bg-white">
                <div className="origin-top-left" style={{ transform: 'scale(0.31)', width: '323%' }}>
                  <TemplateRenderer cv={createSampleCV(t.id)} mode="preview" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-ink-900">{t.name}</h3>
                <p className="mt-1 text-xs text-ink-500">{t.tagline}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/templates" className="text-sm font-semibold text-brand-600 hover:underline">
            View all six templates →
          </Link>
        </div>
      </div>
    </section>
  );
}
