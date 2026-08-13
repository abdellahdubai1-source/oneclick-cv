import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import TemplatesPreview from '@/components/landing/TemplatesPreview';
import FeatureGrid from '@/components/landing/FeatureGrid';
import FAQAccordion from '@/components/landing/FAQAccordion';
import FinalCTA from '@/components/landing/FinalCTA';
import { FAQ_ITEMS } from '@/lib/content/faq';

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <TemplatesPreview />
      <FeatureGrid />
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Frequently asked questions</h2>
        </div>
        <div className="mt-10">
          <FAQAccordion items={FAQ_ITEMS.slice(0, 6)} />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}
