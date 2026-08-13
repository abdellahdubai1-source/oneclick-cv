import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How OneClick CV handles your CV data, photos and job-description text.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink-900">Privacy</h1>
      <p className="mt-2 text-sm text-ink-500">Last updated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-700">
        <Section title="Your CV stays on your device by default">
          <p>
            Your CV content, uploaded photos and draft history are stored using your browser's local storage — not
            on our servers. If you clear your browser data or switch devices, your drafts won't follow you unless
            you export them yourself.
          </p>
        </Section>

        <Section title="When text is sent to AI">
          <p>
            When you use an AI action (like "Suggest with AI" or "Improve this text"), the specific field you're
            working on — not your whole CV — is sent to generate a suggestion. If no AI provider is configured, this
            is handled entirely by our built-in fallback engine and nothing leaves your session. We show a short
            notice before the first AI request in any session so you know what's being sent.
          </p>
        </Section>

        <Section title="Job-link analysis">
          <p>
            When you paste a public vacancy URL, our server fetches that page on your behalf, with strict safety
            controls (no access to private networks, cloud metadata endpoints or internal systems). We extract the
            likely job content and show it to you for confirmation — nothing extracted is trusted or applied to your
            CV automatically. We do not log the personal content of your CV.
          </p>
        </Section>

        <Section title="File uploads">
          <p>
            Photos are processed in your browser (crop, zoom, rotate) before being embedded directly into your CV
            draft. Job descriptions you upload as files are processed to extract text and are not permanently
            retained on our servers.
          </p>
        </Section>

        <Section title="What we never ask for">
          <p>
            We never request passport numbers, Emirates ID numbers, bank details or your full residential address —
            these aren't needed for a professional CV and we don't collect them.
          </p>
        </Section>

        <Section title="Questions">
          <p>
            If you have questions about how your data is handled, please reach out via the contact details on our
            website.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
