'use client';

import { useEffect, useMemo, useState } from 'react';
import LivePreview from '@/components/preview/LivePreview';
import DownloadStep from './sections/DownloadStep';
import TemplateStep from './sections/TemplateStep';
import PhotoEditor from './photo/PhotoEditor';
import DraftManagerPanel from './DraftManagerPanel';
import { useCVStore } from '@/lib/state/cvStore';
import type { CVDocument, LanguageProficiency, VisaStatus } from '@/lib/cv/types';
import { generateId } from '@/lib/utils/id';
import { generateCoverLetter } from '@/lib/coverLetter/generator';
import type { ProfessionId } from '@/lib/cv/professionProfiles';

type AnswerMap = Record<string, string>;
type Question = {
  key: string;
  prompt: string;
  help: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  choices?: string[];
  show?: (answers: AnswerMap) => boolean;
};

const QUESTIONS: Question[] = [
  { key: 'fullName', prompt: 'What is your full name?', help: 'Write it exactly as it should appear on your CV.', placeholder: 'e.g. Abdellah Teha', required: true },
  { key: 'professionalTitle', prompt: 'What job title are you targeting?', help: 'Use a clear title recruiters search for.', placeholder: 'e.g. Digital Marketing Specialist', required: true },
  { key: 'email', prompt: 'What is your professional email address?', help: 'Employers will use this to contact you.', placeholder: 'name@email.com', required: true },
  { key: 'phone', prompt: 'What is your phone number?', help: 'Include the country code.', placeholder: 'e.g. +971 50 123 4567', required: true },
  { key: 'city', prompt: 'Which city are you based in?', help: 'City is enough; a full home address is not required.', placeholder: 'e.g. Dubai', required: true },
  { key: 'country', prompt: 'Which country are you based in?', help: 'This will appear beside your city.', placeholder: 'United Arab Emirates', required: true },
  { key: 'linkedIn', prompt: 'Do you have a LinkedIn profile?', help: 'Paste the full link, or skip this question.', placeholder: 'https://linkedin.com/in/yourname' },
  { key: 'portfolio', prompt: 'Do you have a portfolio or personal website?', help: 'Recommended for design, marketing and technology roles.', placeholder: 'https://yourwebsite.com' },
  { key: 'nationality', prompt: 'What is your nationality?', help: 'Optional, but commonly included in UAE CVs.', placeholder: 'e.g. Ethiopian' },
  { key: 'visa', prompt: 'What is your UAE visa status?', help: 'Choose the closest option, or skip.', choices: ['Employment visa', 'Visit visa', 'Family sponsored', 'Golden visa', 'Freelance permit', 'Citizen', 'Prefer not to say'] },
  { key: 'availability', prompt: 'When can you start a new job?', help: 'Be specific about your availability or notice period.', placeholder: 'e.g. Immediately / 30 days' },
  { key: 'background', prompt: 'Tell me briefly about your professional background.', help: 'Write naturally. AI will turn this into a polished professional summary.', placeholder: 'e.g. I have 3 years of experience managing social media, creating videos and running Meta ads for small businesses…', required: true, multiline: true },
  { key: 'hasExperience', prompt: 'Do you have work experience?', help: 'Internships, freelance work and part-time roles also count.', choices: ['Yes', 'No'], required: true },
  { key: 'exp1Title', prompt: 'What was your most recent job title?', help: 'Use the official or closest accurate title.', placeholder: 'e.g. Social Media Manager', required: true, show: (a) => a.hasExperience === 'Yes' },
  { key: 'exp1Company', prompt: 'Which company or client did you work for?', help: 'Freelancers can write “Freelance” or their business name.', placeholder: 'e.g. ABC Trading LLC', required: true, show: (a) => a.hasExperience === 'Yes' },
  { key: 'exp1Location', prompt: 'Where was this role based?', help: 'City and country are enough.', placeholder: 'e.g. Dubai, UAE', show: (a) => a.hasExperience === 'Yes' },
  { key: 'exp1Start', prompt: 'When did you start this role?', help: 'Use YYYY-MM if possible.', placeholder: 'e.g. 2023-01', required: true, show: (a) => a.hasExperience === 'Yes' },
  { key: 'exp1End', prompt: 'When did you finish this role?', help: 'Write “Current” if you still work there.', placeholder: 'e.g. Current or 2025-06', required: true, show: (a) => a.hasExperience === 'Yes' },
  { key: 'exp1Duties', prompt: 'What were your main responsibilities?', help: 'List real tasks. Separate them with new lines; AI will rewrite them professionally.', placeholder: 'Managed social media pages\nCreated weekly videos\nResponded to customer messages', required: true, multiline: true, show: (a) => a.hasExperience === 'Yes' },
  { key: 'exp1Achievements', prompt: 'What results or achievements did you deliver?', help: 'Use real facts only. Numbers are helpful but not required.', placeholder: 'e.g. Improved engagement and brought more qualified enquiries through consistent content', multiline: true, show: (a) => a.hasExperience === 'Yes' },
  { key: 'hasSecondExperience', prompt: 'Would you like to add another work experience?', help: 'Add another relevant role, or choose No to continue.', choices: ['Yes', 'No'], required: true, show: (a) => a.hasExperience === 'Yes' },
  { key: 'exp2Title', prompt: 'What was your previous job title?', help: 'Enter the second most relevant role.', placeholder: 'e.g. Content Creator', required: true, show: (a) => a.hasSecondExperience === 'Yes' },
  { key: 'exp2Company', prompt: 'Which company or client was it?', help: 'Use the real company, client or freelance name.', placeholder: 'e.g. Freelance', required: true, show: (a) => a.hasSecondExperience === 'Yes' },
  { key: 'exp2Dates', prompt: 'What dates did you work there?', help: 'Write the start and end dates.', placeholder: 'e.g. 2021-03 to 2022-12', required: true, show: (a) => a.hasSecondExperience === 'Yes' },
  { key: 'exp2Duties', prompt: 'What did you do in this role?', help: 'Separate real responsibilities with new lines.', multiline: true, required: true, show: (a) => a.hasSecondExperience === 'Yes' },
  { key: 'hasEducation', prompt: 'Would you like to add education?', help: 'University, college, diploma or relevant vocational study.', choices: ['Yes', 'No'], required: true },
  { key: 'qualification', prompt: 'What qualification did you receive or study?', help: 'Write the full qualification name.', placeholder: 'e.g. Bachelor of Business Administration', required: true, show: (a) => a.hasEducation === 'Yes' },
  { key: 'institution', prompt: 'Which school, college or university?', help: 'Use the institution’s official name.', placeholder: 'e.g. Jimma University', required: true, show: (a) => a.hasEducation === 'Yes' },
  { key: 'educationDates', prompt: 'What were your study dates?', help: 'Write the start and graduation year, or “Current”.', placeholder: 'e.g. 2019 to 2023', required: true, show: (a) => a.hasEducation === 'Yes' },
  { key: 'technicalSkills', prompt: 'What are your strongest job-related skills?', help: 'Separate skills with commas. Add only skills you truly have.', placeholder: 'e.g. Meta Ads, Canva, CapCut, SEO, Content Strategy', required: true, multiline: true },
  { key: 'softSkills', prompt: 'What are your strongest professional qualities?', help: 'Choose qualities you can demonstrate at work.', placeholder: 'e.g. Communication, Time management, Teamwork, Problem-solving', multiline: true },
  { key: 'languages', prompt: 'Which languages do you speak?', help: 'Include proficiency for each language.', placeholder: 'e.g. Afaan Oromo — Native, English — Fluent, Amharic — Fluent', required: true, multiline: true },
  { key: 'certifications', prompt: 'Do you have relevant certifications or completed courses?', help: 'Separate each item with a new line, or skip.', placeholder: 'e.g. Google Digital Marketing Certificate — Google', multiline: true },
  { key: 'projects', prompt: 'Do you have relevant projects to showcase?', help: 'Write the project and what you achieved, or skip.', placeholder: 'e.g. Built a responsive booking website for a Dubai travel agency', multiline: true },
  { key: 'drivingLicence', prompt: 'Do you have a UAE driving licence?', help: 'This is useful for roles that require travel or driving.', choices: ['Yes', 'No'] },
  { key: 'relocate', prompt: 'Are you willing to relocate for the right role?', help: 'Choose the answer that is true for you.', choices: ['Yes', 'No'] },
  { key: 'targetCompany', prompt: 'Are you applying to a specific company?', help: 'This helps create a matching cover letter. You can skip.', placeholder: 'e.g. Emirates Group' },
  { key: 'jobRequirements', prompt: 'Paste the job requirements, if you have them.', help: 'AI will tailor the wording without inventing experience. Skip if you are creating a general CV.', placeholder: 'Paste the most important job description or requirements here…', multiline: true },
];

const splitItems = (value = '') => value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
const splitLines = (value = '') => value.split(/\n|\s*[•▪]\s*/).map((item) => item.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
const visaMap: Record<string, VisaStatus> = { 'Employment visa': 'employment_visa', 'Visit visa': 'visit_visa', 'Family sponsored': 'family_sponsored', 'Golden visa': 'golden_visa', 'Freelance permit': 'freelance_permit', Citizen: 'citizen', 'Prefer not to say': 'prefer_not_to_say' };

function normaliseDate(value: string, fallback = '') {
  const match = value.match(/\d{4}(?:-\d{2})?/);
  return match?.[0] ?? fallback;
}

function inferProfession(title: string): ProfessionId {
  if (/web|ui|ux|front.?end/i.test(title)) return 'web_design';
  if (/market|social|content|seo/i.test(title)) return 'digital_marketing';
  if (/software|developer|programmer/i.test(title)) return 'software_development';
  if (/sales|business development/i.test(title)) return 'sales';
  if (/driver|delivery|rider/i.test(title)) return 'delivery_driving';
  if (/hotel|hospitality|waiter|barista/i.test(title)) return 'hospitality';
  if (/admin|secretary|reception/i.test(title)) return 'administration';
  if (/engineer/i.test(title)) return 'engineering';
  return 'custom';
}

export function buildCVFromInterview(base: CVDocument, answers: AnswerMap): CVDocument {
  const experiences: CVDocument['experience'] = [];
  if (answers.hasExperience === 'Yes') {
    experiences.push({ id: generateId('exp'), jobTitle: answers.exp1Title || '', companyName: answers.exp1Company || '', location: answers.exp1Location || '', startDate: normaliseDate(answers.exp1Start || ''), endDate: /current/i.test(answers.exp1End || '') ? null : normaliseDate(answers.exp1End || ''), currentlyWorking: /current/i.test(answers.exp1End || ''), responsibilities: splitLines(answers.exp1Duties), achievements: splitLines(answers.exp1Achievements) });
  }
  if (answers.hasSecondExperience === 'Yes') {
    const dates = answers.exp2Dates || '';
    const found = dates.match(/\d{4}(?:-\d{2})?/g) ?? [];
    experiences.push({ id: generateId('exp'), jobTitle: answers.exp2Title || '', companyName: answers.exp2Company || '', location: '', startDate: found[0] || '', endDate: found[1] || null, currentlyWorking: false, responsibilities: splitLines(answers.exp2Duties), achievements: [] });
  }
  const educationDates = answers.educationDates || '';
  const education: CVDocument['education'] = answers.hasEducation === 'Yes' ? [{ id: generateId('edu'), institution: answers.institution || '', qualification: answers.qualification || '', fieldOfStudy: '', location: '', startDate: normaliseDate(educationDates), endDate: (educationDates.match(/\d{4}(?:-\d{2})?/g) ?? [])[1] || null, currentlyStudying: /current/i.test(educationDates), gradeOrHonors: '' }] : [];
  const languages = splitItems(answers.languages).map((item) => {
    const [name, level] = item.split(/\s*[—–-]\s*/);
    const raw = (level || '').toLowerCase();
    const proficiency: LanguageProficiency = raw.includes('native') ? 'native' : raw.includes('fluent') || raw.includes('proficient') ? 'fluent' : raw.includes('conversation') ? 'conversational' : 'basic';
    return { id: generateId('lang'), name: name || item, proficiency };
  });
  return {
    ...base,
    meta: { ...base.meta, name: `${answers.fullName || 'My'} CV`, updatedAt: new Date().toISOString() },
    personal: { ...base.personal, fullName: answers.fullName || '', professionalTitle: answers.professionalTitle || '', email: answers.email || '', phone: answers.phone || '', city: answers.city || '', country: answers.country || 'United Arab Emirates', linkedInUrl: answers.linkedIn || '', portfolioUrl: answers.portfolio || '' },
    uae: { ...base.uae, nationality: answers.nationality || '', visaStatus: visaMap[answers.visa || ''], availability: answers.availability || '', hasUAEDrivingLicence: answers.drivingLicence === 'Yes', willingToRelocate: answers.relocate === 'Yes' },
    summary: answers.background || '', experience: experiences, education,
    skills: { technical: splitItems(answers.technicalSkills).map((name) => ({ id: generateId('skill'), name })), soft: splitItems(answers.softSkills).map((name) => ({ id: generateId('skill'), name })) },
    languages,
    certifications: splitItems(answers.certifications).map((item) => { const [name, issuingOrganization = ''] = item.split(/\s*[—–]\s*/); return { id: generateId('cert'), name: name || item, issuingOrganization }; }),
    projects: splitItems(answers.projects).map((description, index) => ({ id: generateId('proj'), name: `Project ${index + 1}`, description, technologies: [] })),
  };
}

async function aiSuggestion(payload: unknown) {
  const response = await fetch('/api/ai/suggest', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) return null;
  return response.json() as Promise<{ suggestedText?: string; suggestedItems?: string[] }>;
}

export default function AICVInterview() {
  const hydrate = useCVStore((s) => s.hydrate); const hydrated = useCVStore((s) => s.hydrated);
  const cv = useCVStore((s) => s.cv); const replaceCV = useCVStore((s) => s.replaceCV);
  const [answers, setAnswers] = useState<AnswerMap>({ country: 'United Arab Emirates' });
  const [index, setIndex] = useState(0); const [value, setValue] = useState('');
  const [generated, setGenerated] = useState(false); const [generating, setGenerating] = useState(false);
  const [improving, setImproving] = useState(false); const [error, setError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState(''); const [draftsOpen, setDraftsOpen] = useState(false);
  const visibleQuestions = useMemo(() => QUESTIONS.filter((q) => !q.show || q.show(answers)), [answers]);
  const question = visibleQuestions[index];

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('oneclickcv:interview-answers');
      if (saved) setAnswers({ country: 'United Arab Emirates', ...JSON.parse(saved) });
    } catch { /* A blocked storage API should never block CV creation. */ }
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem('oneclickcv:interview-answers', JSON.stringify(answers)); } catch { /* Ignore storage limits. */ }
  }, [answers, hydrated]);
  useEffect(() => { setValue(question ? answers[question.key] || '' : ''); }, [question, answers]);

  if (!hydrated) return <div className="flex h-[60vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" /></div>;

  function validate(): string | null {
    if (!question) return null;
    if (question.required && !value.trim()) return 'Please answer this question to continue.';
    if (question.key === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) return 'Please enter a valid email address.';
    if (question.key === 'phone' && value.replace(/\D/g, '').length < 7) return 'Please enter a valid phone number with country code.';
    return null;
  }

  async function next(overrideValue?: string) {
    const submittedValue = overrideValue ?? value;
    const previousValue = value;
    if (overrideValue !== undefined) setValue(overrideValue);
    const validation = overrideValue === undefined ? validate() : question?.required && !submittedValue.trim() ? 'Please answer this question to continue.' : null;
    if (validation) { setError(validation); if (overrideValue !== undefined) setValue(previousValue); return; }
    if (!question) return;
    const nextAnswers = { ...answers, [question.key]: submittedValue.trim() }; setAnswers(nextAnswers); setError(null);
    const nextQuestions = QUESTIONS.filter((q) => !q.show || q.show(nextAnswers));
    if (index < nextQuestions.length - 1) { setIndex(index + 1); return; }
    await generate(nextAnswers);
  }

  async function generate(finalAnswers: AnswerMap) {
    setGenerating(true); setError(null);
    let nextCV = buildCVFromInterview(cv, finalAnswers);
    try {
      const [summary, ...roles] = await Promise.all([
        aiSuggestion({ action: 'create_summary', field: 'summary', text: finalAnswers.background || '', context: { professionalTitle: finalAnswers.professionalTitle, existingSkills: splitItems(finalAnswers.technicalSkills), targetJob: finalAnswers.jobRequirements ? { positionTitle: finalAnswers.professionalTitle, company: finalAnswers.targetCompany || undefined, summary: finalAnswers.jobRequirements } : undefined } }),
        ...nextCV.experience.map((role) => aiSuggestion({ action: 'improve_job_description', field: 'responsibility', text: role.responsibilities.join('\n'), context: { professionalTitle: finalAnswers.professionalTitle, existingSkills: splitItems(finalAnswers.technicalSkills), targetJob: finalAnswers.jobRequirements ? { positionTitle: finalAnswers.professionalTitle, company: finalAnswers.targetCompany || undefined, summary: finalAnswers.jobRequirements } : undefined } })),
      ]);
      if (summary?.suggestedText) nextCV = { ...nextCV, summary: summary.suggestedText };
      nextCV = { ...nextCV, experience: nextCV.experience.map((role, i) => ({ ...role, responsibilities: roles[i]?.suggestedItems?.length ? roles[i]!.suggestedItems! : roles[i]?.suggestedText ? splitLines(roles[i]!.suggestedText!) : role.responsibilities })) };
    } catch { /* The truthful local draft remains usable when AI is unavailable. */ }
    replaceCV(nextCV);
    const profession = inferProfession(finalAnswers.professionalTitle || '');
    const letter = generateCoverLetter({ profession, customProfessionLabel: finalAnswers.professionalTitle, positionTitle: finalAnswers.professionalTitle || 'the advertised role', companyName: finalAnswers.targetCompany || 'your company', jobDescription: finalAnswers.jobRequirements, importantRequirements: finalAnswers.jobRequirements, experienceLevel: nextCV.experience.length > 1 ? 'mid' : 'entry', confirmedSkills: nextCV.skills.technical.map((s) => s.name), tone: 'professional' }, { fullName: nextCV.personal.fullName, phone: nextCV.personal.phone, email: nextCV.personal.email, city: nextCV.personal.city, country: nextCV.personal.country });
    setCoverLetter(letter.fullText); setGenerated(true); setGenerating(false);
  }

  async function improveWriting() {
    setImproving(true); setError(null);
    try {
      const result = await aiSuggestion({ action: 'improve', field: 'summary', text: cv.summary, context: { professionalTitle: cv.personal.professionalTitle, existingSkills: cv.skills.technical.map((s) => s.name) } });
      if (result?.suggestedText) replaceCV({ ...cv, summary: result.suggestedText });
    } catch { setError('AI writing is temporarily unavailable. Your CV is still ready to use.'); }
    setImproving(false);
  }

  if (generated) return <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">AI CV complete</p><h1 className="text-2xl font-bold text-ink-900">Your professional CV is ready</h1></div><button type="button" className="btn-secondary" onClick={() => setDraftsOpen(true)}>My drafts</button></div>{error && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>}<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)]"><div className="space-y-4"><div className="card p-5"><h2 className="font-semibold text-ink-900">Finish and download</h2><div className="mt-4 flex flex-wrap gap-2"><button type="button" className="btn-secondary" onClick={() => { setGenerated(false); setIndex(0); }}>Edit my answers</button><button type="button" className="btn-primary" onClick={improveWriting} disabled={improving}>{improving ? 'Improving…' : 'Improve writing with AI'}</button></div></div><DownloadStep /><details className="card p-5"><summary className="cursor-pointer font-semibold text-ink-800">Change template and colour</summary><div className="mt-5"><TemplateStep /></div></details><details className="card p-5"><summary className="cursor-pointer font-semibold text-ink-800">Add or change profile photo</summary><div className="mt-5"><PhotoEditor /></div></details><div className="card p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-ink-900">Matching cover letter</h2><p className="text-xs text-ink-500">Generated from the same truthful information.</p></div><button type="button" className="btn-secondary" onClick={() => navigator.clipboard.writeText(coverLetter)}>Copy</button></div><textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="input mt-4 min-h-[320px] resize-y text-sm leading-relaxed" /></div></div><div className="card h-[calc(100vh-7rem)] overflow-hidden lg:sticky lg:top-20"><LivePreview cv={cv} className="h-full" /></div></div>{draftsOpen && <DraftManagerPanel onClose={() => setDraftsOpen(false)} />}</div>;

  return <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14"><div className="mb-7 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">OneClick AI CV Interview</p><h1 className="mt-1 text-2xl font-bold text-ink-900 sm:text-3xl">Let’s build your CV together</h1></div><button type="button" className="btn-secondary" onClick={() => setDraftsOpen(true)}>My drafts</button></div><div className="mb-5"><div className="flex justify-between text-xs font-medium text-ink-500"><span>Question {Math.min(index + 1, visibleQuestions.length)} of {visibleQuestions.length}</span><span>{Math.round(((index + 1) / visibleQuestions.length) * 100)}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${((index + 1) / visibleQuestions.length) * 100}%` }} /></div></div><div className="card p-6 sm:p-9"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-xl">✦</div><h2 className="text-xl font-bold text-ink-900 sm:text-2xl">{question?.prompt}</h2><p className="mt-2 text-sm leading-relaxed text-ink-500">{question?.help}</p>{question?.choices ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{question.choices.map((choice) => <button key={choice} type="button" onClick={() => setValue(choice)} className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition ${value === choice ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-100 text-ink-700 hover:border-ink-200'}`}>{choice}</button>)}</div> : question?.multiline ? <textarea autoFocus value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') void next(); }} placeholder={question.placeholder} className="input mt-6 min-h-[150px] resize-y text-base leading-relaxed" /> : <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void next(); }} placeholder={question?.placeholder} className="input mt-6 py-3 text-base" />}{error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<div className="mt-7 flex items-center justify-between gap-3"><button type="button" className="btn-secondary" disabled={index === 0 || generating} onClick={() => { setError(null); setIndex((i) => Math.max(0, i - 1)); }}>← Back</button><div className="flex gap-2">{!question?.required && <button type="button" className="btn-secondary" disabled={generating} onClick={() => void next('')}>Skip</button>}<button type="button" className="btn-primary min-w-28" disabled={generating} onClick={() => void next()}>{generating ? 'Creating CV…' : index === visibleQuestions.length - 1 ? 'Generate my CV' : 'Continue →'}</button></div></div></div><p className="mt-4 text-center text-xs text-ink-400">One question at a time · Your answers are saved on this device · AI never invents experience</p>{draftsOpen && <DraftManagerPanel onClose={() => setDraftsOpen(false)} />}</div>;
}
