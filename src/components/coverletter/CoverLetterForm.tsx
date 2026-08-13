'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { PROFESSION_LIST, inferProfessionFromTitle } from '@/lib/cv/professionProfiles';
import type { ProfessionId } from '@/lib/cv/professionProfiles';
import { generateCoverLetter } from '@/lib/coverLetter/generator';
import type { CoverLetterInput, CoverLetterTone, ExperienceLevel } from '@/lib/coverLetter/types';
import { useCVStore } from '@/lib/state/cvStore';
import { cn } from '@/lib/utils/cn';

const TONES: { id: CoverLetterTone; label: string; description: string }[] = [
  { id: 'professional', label: 'Professional', description: 'Formal, measured, classic' },
  { id: 'confident', label: 'Confident', description: 'Assertive, outcome-focused' },
  { id: 'warm', label: 'Warm', description: 'Friendly and personable' },
  { id: 'concise', label: 'Concise', description: 'Short and to the point' },
];

const LEVELS: { id: ExperienceLevel; label: string }[] = [
  { id: 'entry', label: 'Entry-level' },
  { id: 'mid', label: 'Mid-level' },
  { id: 'senior', label: 'Senior' },
];

export default function CoverLetterForm() {
  const cv = useCVStore((s) => s.cv);
  const inferredProfession = inferProfessionFromTitle(cv.personal.professionalTitle);
  const [profession, setProfession] = useState<ProfessionId>(inferredProfession);
  const [customProfessionLabel, setCustomProfessionLabel] = useState(
    inferredProfession === 'custom' ? cv.personal.professionalTitle : '',
  );
  const [positionTitle, setPositionTitle] = useState(cv.personal.professionalTitle);
  const [companyName, setCompanyName] = useState('');
  const [hiringManagerName, setHiringManagerName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [importantRequirements, setImportantRequirements] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('mid');
  const [reasonForApplying, setReasonForApplying] = useState('');
  const [tone, setTone] = useState<CoverLetterTone>('professional');
  const [skillInput, setSkillInput] = useState('');
  const [confirmedSkills, setConfirmedSkills] = useState<string[]>(
    [...cv.skills.technical, ...cv.skills.soft].slice(0, 4).map((s) => s.name),
  );
  const [editableText, setEditableText] = useState<string | null>(null);

  const input: CoverLetterInput = useMemo(
    () => ({
      profession,
      customProfessionLabel,
      positionTitle,
      companyName,
      hiringManagerName,
      jobDescription,
      importantRequirements,
      experienceLevel,
      confirmedSkills,
      reasonForApplying,
      tone,
    }),
    [
      profession,
      customProfessionLabel,
      positionTitle,
      companyName,
      hiringManagerName,
      jobDescription,
      importantRequirements,
      experienceLevel,
      confirmedSkills,
      reasonForApplying,
      tone,
    ],
  );

  const generated = useMemo(
    () =>
      generateCoverLetter(input, {
        fullName: cv.personal.fullName,
        phone: cv.personal.phone,
        email: cv.personal.email,
        city: cv.personal.city,
        country: cv.personal.country,
        summary: cv.summary,
        recentRole: cv.experience[0] ? `${cv.experience[0].jobTitle} at ${cv.experience[0].companyName}` : undefined,
        confirmedAchievements: cv.experience.flatMap((role) => role.achievements).filter(Boolean).slice(0, 3),
        projects: cv.projects.map((project) => project.name).filter(Boolean).slice(0, 3),
      }),
    [input, cv],
  );

  const displayText = editableText ?? generated.fullText;

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed || confirmedSkills.includes(trimmed)) return;
    setConfirmedSkills((prev) => [...prev, trimmed]);
    setSkillInput('');
  }

  async function handleDownload() {
    const { downloadCoverLetterPdf } = await import('@/lib/export/pdfDocuments');
    await downloadCoverLetterPdf({
      candidateName: cv.personal.fullName || 'Candidate',
      positionTitle,
      text: displayText,
    });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(displayText);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <p className="font-semibold">Generated from your current CV</p>
          <p className="mt-1 text-xs leading-relaxed">
            Your name, contact details, profession, confirmed skills, experience, achievements and projects are reused automatically. Add a job description for a more tailored letter.
          </p>
        </div>
        <FormSection title="Role details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Profession">
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value as ProfessionId)}
                className="input"
              >
                {PROFESSION_LIST.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
            {profession === 'custom' && (
              <Field label="Describe the profession">
                <input
                  value={customProfessionLabel}
                  onChange={(e) => setCustomProfessionLabel(e.target.value)}
                  className="input"
                  placeholder="e.g. Event Coordinator"
                />
              </Field>
            )}
            <Field label="Exact position title">
              <input value={positionTitle} onChange={(e) => setPositionTitle(e.target.value)} className="input" />
            </Field>
            <Field label="Company name">
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input" />
            </Field>
            <Field label="Hiring manager name (optional)">
              <input value={hiringManagerName} onChange={(e) => setHiringManagerName(e.target.value)} className="input" />
            </Field>
            <Field label="Experience level">
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="input"
              >
                {LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Job description">
          <Field label="Paste the job description (optional)">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="input"
              placeholder="Paste the vacancy text here for more targeted wording…"
            />
          </Field>
          <Field label="Important requirements to address (optional)">
            <input
              value={importantRequirements}
              onChange={(e) => setImportantRequirements(e.target.value)}
              className="input"
              placeholder="e.g. 3+ years UAE hospitality experience"
            />
          </Field>
        </FormSection>

        <FormSection title="Confirmed relevant skills">
          <p className="mb-2 text-xs text-ink-500">
            Only add skills you genuinely have — the generator will only reference what you confirm here.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {confirmedSkills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
                {s}
                <button type="button" onClick={() => setConfirmedSkills((prev) => prev.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="input"
              placeholder="Add a skill and press Enter"
            />
            <button type="button" onClick={addSkill} className="rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-600 hover:bg-ink-50">
              Add
            </button>
          </div>
        </FormSection>

        <FormSection title="Why you're applying (optional)">
          <textarea
            value={reasonForApplying}
            onChange={(e) => setReasonForApplying(e.target.value)}
            rows={3}
            className="input"
            placeholder="A sentence or two on why this role/company interests you"
          />
        </FormSection>

        <FormSection title="Tone">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={cn(
                  'rounded-xl border p-3 text-left transition',
                  tone === t.id ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:border-ink-300',
                )}
              >
                <p className="text-sm font-semibold text-ink-900">{t.label}</p>
                <p className="text-[11px] text-ink-500">{t.description}</p>
              </button>
            ))}
          </div>
        </FormSection>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-ink-100 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
            <p className="text-sm font-semibold text-ink-900">Preview</p>
            <div className="flex gap-2">
              <button type="button" onClick={handleCopy} className="text-xs font-semibold text-ink-500 hover:text-ink-800">
                Copy
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                Download PDF
              </button>
            </div>
          </div>
          <textarea
            value={displayText}
            onChange={(e) => setEditableText(e.target.value)}
            rows={22}
            className="w-full resize-none rounded-b-2xl border-0 px-6 py-6 font-serif text-[13px] leading-relaxed text-ink-800 focus:outline-none"
          />
          {editableText !== null && (
            <div className="border-t border-ink-100 px-5 py-2.5 text-right">
              <button
                type="button"
                onClick={() => setEditableText(null)}
                className="text-[11px] font-semibold text-brand-600 hover:underline"
              >
                Regenerate from form
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <h3 className="mb-3 text-sm font-semibold text-ink-900">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-medium text-ink-600">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
