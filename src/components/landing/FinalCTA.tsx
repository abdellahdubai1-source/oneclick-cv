import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-ink-950 px-8 py-14 text-center text-white shadow-a4">
        <h2 className="text-2xl font-bold sm:text-3xl">Ready to build your CV?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-white/70">
          Start free — no account required. Your first draft is ready in minutes.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/builder" className="w-full rounded-xl bg-white px-5 py-2.5 text-center text-sm font-semibold text-ink-900 transition hover:bg-white/90 sm:w-auto">
            Create My CV
          </Link>
          <Link href="/cover-letter" className="w-full rounded-xl border border-white/25 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto">
            Generate Cover Letter
          </Link>
        </div>
      </div>
    </section>
  );
}
