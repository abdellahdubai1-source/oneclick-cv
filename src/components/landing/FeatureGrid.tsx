const FEATURES = [
  {
    title: 'Estimated ATS readiness',
    description:
      'Paste a job description and see keyword coverage, formatting risks and content gaps — grouped and explained, never just a number.',
  },
  {
    title: 'Match CV to a job link',
    description:
      'Paste a public vacancy URL and we\'ll securely read the page, extract the requirements, and let you confirm before comparing.',
  },
  {
    title: 'Contextual AI suggestions',
    description:
      'Improve wording, fix grammar, or generate profession-specific skills and achievement templates — always editable before you apply them.',
  },
  {
    title: 'Privacy-first by design',
    description:
      'Your CV and photos stay on your device by default. We show exactly what is sent to AI, and only when you ask for a suggestion.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Built for how UAE hiring actually works</h2>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-6">
            <h3 className="text-sm font-semibold text-ink-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
