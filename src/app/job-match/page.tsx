import type { Metadata } from 'next';
import JobMatchClient from '@/components/jobmatch/JobMatchClient';

export const metadata: Metadata = {
  title: 'Match CV to a Job',
  description: 'Paste a job link or description to see an estimated ATS readiness and job-match score.',
};

export default function JobMatchPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Match CV to a Job</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          Paste a public vacancy link or the job description text. We'll extract the key requirements, ask you to
          confirm them, and compare against your current CV — nothing is applied automatically.
        </p>
      </div>
      <JobMatchClient />
    </div>
  );
}
