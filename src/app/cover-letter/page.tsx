import type { Metadata } from 'next';
import CoverLetterForm from '@/components/coverletter/CoverLetterForm';

export const metadata: Metadata = {
  title: 'Cover Letter Generator',
  description: 'Generate a profession-specific, editable cover letter tailored to the role you are applying for.',
};

export default function CoverLetterPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Cover Letter Generator</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          Choose your profession and tone, and we'll draft a genuinely relevant letter — never a generic paragraph
          reused across every profession.
        </p>
      </div>
      <CoverLetterForm />
    </div>
  );
}
