'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCVStore } from '@/lib/state/cvStore';
import { parseJobPosting, type ParsedJobPosting } from '@/lib/job/jobParsing';
import { matchCVToJob, type JobMatchResult, type RequirementMatch } from '@/lib/job/matching';
import { createTailoredCopy, saveDraft, setActiveDraftId } from '@/lib/state/draftStorage';
import { applyTailoring } from '@/lib/job/tailoring';
import { cn } from '@/lib/utils/cn';

type InputMode = 'url' | 'paste' | 'upload';
type Stage = 'input' | 'confirm' | 'results';

const STATUS_STYLES: Record<RequirementMatch['status'], { label: string; className: string }> = {
  confirmed: { label: 'Confirmed match', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  possible: { label: 'Possible match', className: 'bg-brand-50 text-brand-700 border-brand-200' },
  not_found: { label: 'Not found in CV', className: 'bg-red-50 text-red-700 border-red-200' },
  needs_confirmation: { label: 'Confirmation required', className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function JobMatchClient() {
  const router = useRouter();
  const cv = useCVStore((s) => s.cv);
  const replaceCV = useCVStore((s) => s.replaceCV);
  const [mode, setMode] = useState<InputMode>('url');
  const [stage, setStage] = useState<Stage>('input');
  const [url, setUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [job, setJob] = useState<ParsedJobPosting | null>(null);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [tailoredMessage, setTailoredMessage] = useState<string | null>(null);
  const [tailoring, setTailoring] = useState(false);

  async function handleAnalyzeUrl() {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/job/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!data.ok) {
        setFetchError(data.error);
        setMode('paste');
        return;
      }
      setJob(data.jobPosting);
      setStage('confirm');
    } catch {
      setFetchError("We couldn't read this job page automatically. Please copy and paste the job description below.");
      setMode('paste');
    } finally {
      setLoading(false);
    }
  }

  function handleParsePaste() {
    if (pastedText.trim().length < 20) return;
    const parsed = parseJobPosting(pastedText);
    setJob(parsed);
    setStage('confirm');
  }

  function handleFileSelected(file: File) {
    setUploadNotice(null);
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = () => {
        setPastedText(String(reader.result ?? ''));
        setMode('paste');
      };
      reader.readAsText(file);
      return;
    }
    setUploadNotice(
      `Automatic text extraction for ${file.type || 'this file type'} isn't available in this build yet. ` +
        'Please open the file and paste its text below instead.',
    );
    setMode('paste');
  }

  function updateJobField<K extends keyof ParsedJobPosting>(key: K, value: ParsedJobPosting[K]) {
    setJob((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleMakeCVForJob() {
    if (!job) return;
    try {
      const key = 'oneclickcv:interview-answers-v2';
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({
        ...saved,
        professionalTitle: job.positionTitle || saved.professionalTitle || '',
        targetCompany: job.company || '',
        jobRequirements: [job.summary, ...job.responsibilities, ...job.requiredSkills].filter(Boolean).join('\n'),
        technicalSkills: job.requiredSkills.slice(0, 8).join(', '),
      }));
      sessionStorage.setItem('oneclickcv:target-job', JSON.stringify(job));
    } catch {}
    router.push('/builder');
  }

  async function requestTailoredText(
    field: 'summary' | 'responsibility',
    text: string,
  ): Promise<{ suggestedText?: string; suggestedItems?: string[] } | null> {
    if (!job || !text.trim()) return null;
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: field === 'summary' ? 'improve' : 'improve_job_description',
          field,
          text,
          context: {
            professionalTitle: cv.personal.professionalTitle,
            existingSkills: [...cv.skills.technical, ...cv.skills.soft].map((skill) => skill.name),
            targetJob: {
              positionTitle: job.positionTitle,
              company: job.company,
              summary: job.summary,
              responsibilities: job.responsibilities,
              requiredSkills: job.requiredSkills,
            },
          },
        }),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async function handleCreateTailoredCopy() {
    if (!job) return;
    setTailoring(true);
    setTailoredMessage(null);
    const copy = createTailoredCopy(cv.meta.id, job.company || 'Company', job.positionTitle || 'Role');
    if (!copy) {
      setTailoring(false);
      setTailoredMessage('Save your CV first, then try creating the tailored version again.');
      return;
    }

    const experiencesToTailor = cv.experience.slice(0, 5);
    const [summaryResult, ...experienceResults] = await Promise.all([
      requestTailoredText('summary', cv.summary),
      ...experiencesToTailor.map((entry) =>
        requestTailoredText('responsibility', entry.responsibilities.join('\n')),
      ),
    ]);
    const experience = Object.fromEntries(
      experiencesToTailor.map((entry, index) => {
        const response = experienceResults[index];
        const items = response?.suggestedItems?.length
          ? response.suggestedItems
          : response?.suggestedText?.split('\n').map((line) => line.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
        return [entry.id, items?.slice(0, 6) ?? []];
      }),
    );
    const tailored = applyTailoring(copy, job, {
      summary: summaryResult?.suggestedText,
      experience,
    });
    const saved = saveDraft(tailored);
    if (!saved.ok) {
      setTailoring(false);
      setTailoredMessage(saved.error);
      return;
    }
    setActiveDraftId(tailored.meta.id);
    replaceCV(tailored);
    router.push('/builder');
  }

  return (
    <div className="space-y-6">
      {stage === 'input' && (
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <div className="mb-4 flex gap-2 border-b border-ink-100">
            <ModeTab active={mode === 'url'} onClick={() => setMode('url')} label="Paste a link" />
            <ModeTab active={mode === 'paste'} onClick={() => setMode('paste')} label="Paste description" />
            <ModeTab active={mode === 'upload'} onClick={() => setMode('upload')} label="Upload a file" />
          </div>

          {mode === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-ink-600">
                Public vacancy URL
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://careers.example.com/jobs/12345"
                  className="input mt-1"
                />
              </label>
              {fetchError && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{fetchError}</p>
              )}
              <button
                type="button"
                onClick={handleAnalyzeUrl}
                disabled={!url.trim() || loading}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? 'Reading page…' : 'Analyse link'}
              </button>
              <p className="text-[11px] text-ink-400">
                We only read publicly accessible pages server-side, with strict safety checks. Pages requiring
                login, CAPTCHA or JavaScript rendering can't be read automatically — paste the description instead.
              </p>
            </div>
          )}

          {mode === 'paste' && (
            <div className="space-y-3">
              {uploadNotice && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{uploadNotice}</p>}
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={10}
                placeholder="Paste the full job description here…"
                className="input"
              />
              <button
                type="button"
                onClick={handleParsePaste}
                disabled={pastedText.trim().length < 20}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {mode === 'upload' && (
            <div className="space-y-3">
              <input
                type="file"
                accept=".txt,.pdf,.docx,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelected(file);
                }}
                className="block w-full text-sm text-ink-600"
              />
              <p className="text-[11px] text-ink-400">
                Supported: plain text (.txt) is extracted automatically. PDF, DOCX and screenshots are accepted but
                currently require you to paste the text manually — see note below after upload.
              </p>
            </div>
          )}
        </div>
      )}

      {stage === 'confirm' && job && (
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h3 className="mb-1 text-sm font-semibold text-ink-900">Confirm extracted details</h3>
          <p className="mb-4 text-xs text-ink-500">
            We treat anything read from a job page or file as untrusted until you confirm it. Edit anything that
            looks wrong before comparing.
          </p>
          {job.sourceUrl && (
            <div className="mb-4 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-xs text-brand-800">
              <p className="font-semibold">
                Vacancy-specific data read from this link
                {job.extractionMethod === 'structured_data' ? ' (verified structured job data)' : ' (page text)'}
              </p>
              <a href={job.sourceUrl} target="_blank" rel="noreferrer" className="mt-0.5 block truncate underline">
                {job.sourceUrl}
              </a>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ConfirmField label="Position title" value={job.positionTitle} onChange={(v) => updateJobField('positionTitle', v)} />
            <ConfirmField label="Company" value={job.company} onChange={(v) => updateJobField('company', v)} />
            <ConfirmField label="Location" value={job.location} onChange={(v) => updateJobField('location', v)} />
            <ConfirmField label="Employment type" value={job.employmentType} onChange={(v) => updateJobField('employmentType', v)} />
            <ConfirmField label="Required experience" value={job.requiredExperience} onChange={(v) => updateJobField('requiredExperience', v)} />
            <ConfirmField label="Education" value={job.education} onChange={(v) => updateJobField('education', v)} />
          </div>
          <div className="mt-3">
            <label className="block text-xs font-medium text-ink-600">
              Required skills (comma-separated)
              <textarea
                value={job.requiredSkills.join(', ')}
                onChange={(e) => updateJobField('requiredSkills', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                rows={2}
                className="input mt-1"
              />
            </label>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-ink-600">
              Job summary extracted from the link
              <textarea value={job.summary} onChange={(e) => updateJobField('summary', e.target.value)} rows={6} className="input mt-1" />
            </label>
            <label className="block text-xs font-medium text-ink-600">
              Responsibilities extracted from the link
              <textarea
                value={job.responsibilities.join('\n')}
                onChange={(e) => updateJobField('responsibilities', e.target.value.split('\n').map((line) => line.trim()).filter(Boolean))}
                rows={6}
                className="input mt-1"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setStage('input')} className="rounded-lg border border-ink-200 px-3.5 py-2 text-xs font-semibold text-ink-600 hover:bg-ink-50">
              Back
            </button>
            <button
              type="button"
              onClick={handleMakeCVForJob}
              className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
            >
              Make CV for This Job
            </button>
          </div>
        </div>
      )}

      {stage === 'results' && result && job && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-ink-900">{result.score}<span className="text-base font-medium text-ink-400">/100</span></p>
                <p className="text-sm font-semibold text-ink-700">{result.bandLabel}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateTailoredCopy} disabled={tailoring} type="button" className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  {tailoring ? 'Preparing your tailored CV…' : 'Create CV for this job'}
                </button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-ink-400">{result.disclaimer}</p>
            {job.sourceUrl && (
              <p className="mt-2 text-xs text-brand-700">
                Result based on: <a href={job.sourceUrl} target="_blank" rel="noreferrer" className="underline">{job.positionTitle || 'vacancy link'}</a>
              </p>
            )}
            {tailoredMessage && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{tailoredMessage}</p>}
            <p className="mt-2 text-[11px] text-ink-500">
              Creates a separate CV, rewrites only your existing facts for this vacancy and prioritises skills already confirmed on your CV.
            </p>
          </div>

          <RequirementGroup title="Position title" items={[result.titleMatch]} />
          <RequirementGroup title="Required skills" items={result.requiredSkillMatches} />
          <RequirementGroup title="Preferred skills" items={result.preferredSkillMatches} />
          <RequirementGroup title="Education & experience" items={[result.educationMatch, result.experienceMatch]} />
          <RequirementGroup title="Languages" items={result.languageMatches} />
          <RequirementGroup title="Location" items={[result.locationMatch]} />

          <div className="flex justify-end">
            <button type="button" onClick={() => setStage('input')} className="text-xs font-semibold text-ink-500 hover:underline">
              Check another job
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ModeTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition',
        active ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-700',
      )}
    >
      {label}
    </button>
  );
}

function ConfirmField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-xs font-medium text-ink-600">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input mt-1" />
    </label>
  );
}

function RequirementGroup({ title, items }: { title: string; items: RequirementMatch[] }) {
  const visible = items.filter((i) => i.label);
  if (visible.length === 0) return null;
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <h4 className="mb-2 text-sm font-semibold text-ink-900">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {visible.map((item) => {
          const style = STATUS_STYLES[item.status];
          return (
            <span key={item.id} className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium', style.className)}>
              {item.label} · {style.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
