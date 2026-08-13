import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(47,92,245,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(212,175,55,0.18), transparent 40%)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 animate-fadeIn">
            Built for UAE job seekers
          </span>
          <h1 className="mt-6 animate-fadeInUp text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Create a CV that gets you noticed.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-fadeInUp text-base leading-relaxed text-white/70 sm:text-lg" style={{ animationDelay: '80ms' }}>
            Build a professional UAE-ready CV and tailored cover letter in minutes with smart writing suggestions,
            ATS guidance and premium templates.
          </p>
          <div className="mt-9 flex animate-fadeInUp flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: '160ms' }}>
            <Link href="/builder" className="btn-primary w-full sm:w-auto">
              Create My CV
            </Link>
            <Link
              href="/cover-letter"
              className="w-full rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Generate Cover Letter
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/50">No account or payment required to start building.</p>
        </div>
      </div>
    </section>
  );
}
