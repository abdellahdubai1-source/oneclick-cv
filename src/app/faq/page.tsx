import type { Metadata } from 'next';
import FAQAccordion from '@/components/landing/FAQAccordion';
import { FAQ_ITEMS } from '@/lib/content/faq';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about OneClick CV — templates, ATS scoring, AI suggestions and privacy.',
};

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink-900">Frequently asked questions</h1>
      <div className="mt-8">
        <FAQAccordion items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
