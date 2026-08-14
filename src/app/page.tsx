import Link from 'next/link';

const OPTIONS = [
  {
    href: '/builder',
    title: 'CV Builder',
    description: 'Create a professional, ATS-friendly CV in minutes with guided AI suggestions.',
    action: 'Build my CV',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M7 3.75h7.5L19 8.25v12H7z" strokeLinejoin="round" />
        <path d="M14.5 3.75v4.5H19M10 12h6M10 15.5h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/job-match',
    title: 'Apply with Job Link',
    description: 'Paste a job link and create a tailored CV that matches the role and its keywords.',
    action: 'Use a job link',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M9.5 14.5l5-5M8 17H6.5a4 4 0 010-8H10M14 7h3.5a4 4 0 010 8H14" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <section className="relative flex min-h-[calc(100vh-8rem)] items-center overflow-hidden bg-ink-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(47,92,245,.35), transparent 38%), radial-gradient(circle at 85% 75%, rgba(212,175,55,.14), transparent 35%)',
        }}
      />
      <div className="relative mx-auto w-full max-w-4xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">OneClick CV</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">How would you like to start?</h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {OPTIONS.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="group flex min-h-64 flex-col rounded-3xl border border-white/15 bg-white/[0.07] p-7 backdrop-blur-sm transition hover:-translate-y-1 hover:border-brand-400/70 hover:bg-white/[0.11] focus:outline-none focus:ring-2 focus:ring-brand-400 sm:p-9"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-950/30">
                {option.icon}
              </span>
              <h2 className="mt-7 text-2xl font-bold">{option.title}</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{option.description}</p>
              <span className="mt-auto flex items-center gap-2 pt-7 text-sm font-semibold text-brand-300">
                {option.action}
                <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
