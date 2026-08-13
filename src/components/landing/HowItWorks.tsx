const STEPS = [
  {
    title: 'Fill in your details',
    description: 'Personal details, experience, education and skills — with helpful examples and validation at every step.',
  },
  {
    title: 'Pick a premium template',
    description: 'Six genuinely different, professionally designed layouts. Preview live in true A4 as you edit.',
  },
  {
    title: 'Refine with AI & ATS checks',
    description: 'Get contextual writing suggestions and an estimated ATS readiness score before you apply.',
  },
  {
    title: 'Download and apply',
    description: 'Export a selectable-text PDF or ATS-friendly DOCX, plus a tailored cover letter, in seconds.',
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">How it works</h2>
        <p className="mt-2 text-sm text-ink-500">From blank page to ready-to-send CV in four steps.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div key={step.title} className="card p-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {i + 1}
            </span>
            <h3 className="mt-4 text-sm font-semibold text-ink-900">{step.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
