import ATSChecker from '@/components/ats/ATSChecker';

export default function ATSStep() {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-ink-900">ATS &amp; Job Match</h2>
      <p className="mt-1 mb-5 text-sm text-ink-500">
        Paste a job description to see an estimated ATS readiness and job-match score, with specific, actionable
        feedback.
      </p>
      <ATSChecker />
    </div>
  );
}
