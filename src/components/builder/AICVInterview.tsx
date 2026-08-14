'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import LivePreview from '@/components/preview/LivePreview';
import DownloadStep from './sections/DownloadStep';
import TemplateStep from './sections/TemplateStep';
import PhotoEditor from './photo/PhotoEditor';
import DraftManagerPanel from './DraftManagerPanel';
import { useCVStore } from '@/lib/state/cvStore';
import type { CVDocument, LanguageProficiency, TemplateId, VisaStatus } from '@/lib/cv/types';
import { generateId } from '@/lib/utils/id';
import { generateCoverLetter } from '@/lib/coverLetter/generator';
import { PROFESSION_PROFILES, type ProfessionId } from '@/lib/cv/professionProfiles';
import { generateAIDesign } from '@/lib/cv/aiDesign';

type Answers = Record<string, string>;
type AIAction = 'create_summary' | 'improve_job_description' | 'generate_achievements' | 'add_skills';
type AIField = 'summary' | 'responsibility' | 'achievement' | 'skills';
type Question = { key: string; label: string; help: string; placeholder?: string; required?: boolean; multiline?: boolean; choices?: string[]; suggestions?: string[]; inputType?: 'text' | 'month' | 'photo'; ai?: [AIAction, AIField]; show?: (a: Answers) => boolean };
type Section = { id: string; title: string; description: string; questions: Question[] };

const q = (key: string, label: string, help: string, extra: Partial<Question> = {}): Question => ({ key, label, help, ...extra });
const JOB_TITLES = ['Web Designer', 'Web Developer', 'Frontend Developer', 'UI/UX Designer', 'Digital Marketing Specialist', 'Social Media Manager', 'Graphic Designer', 'Cleaner', 'Cleaning Supervisor', 'Clinic Receptionist', 'Customer Service Representative', 'Cashier', 'Sales Executive', 'Administrative Assistant', 'Accountant', 'Delivery Driver', 'Security Guard', 'Waiter', 'Barista', 'Teacher', 'Nurse'];
const NATIONALITIES = ['Emirati', 'Ethiopian', 'Egyptian', 'Eritrean', 'Indian', 'Pakistani', 'Bangladeshi', 'Nepalese', 'Filipino', 'Kenyan', 'Nigerian', 'Somali', 'Sudanese', 'Syrian', 'Jordanian', 'Lebanese', 'Moroccan', 'Tunisian', 'Ugandan', 'Ghanaian'];
const INSTITUTIONS = ['Jimma University', 'Addis Ababa University', 'University of Dubai', 'American University in Dubai', 'University of Sharjah', 'Zayed University', 'Higher Colleges of Technology', 'Heriot-Watt University Dubai'];
const LANGUAGES = ['Afaan Oromo', 'English', 'Amharic', 'Arabic', 'French', 'Hindi', 'Urdu', 'Bengali', 'Tagalog', 'Somali', 'Swahili'];
const SECTIONS: Section[] = [
  { id: 'personal', title: 'Personal details', description: 'The essential details recruiters need.', questions: [
    q('fullName', 'Full name', 'As it should appear on your CV.', { required: true, placeholder: 'e.g. Abdellah Teha' }),
    q('professionalTitle', 'Target job title', 'Type to choose a standard job title.', { required: true, placeholder: 'Start typing: web, clean, customer…', suggestions: JOB_TITLES }),
    q('email', 'Professional email', 'Use an email you check regularly.', { required: true, placeholder: 'name@email.com' }),
  ] },
  { id: 'contact', title: 'Contact & location', description: 'Keep this short and professional.', questions: [
    q('phone', 'Phone number', 'Include the country code.', { required: true, placeholder: '+971 50 123 4567' }),
    q('cityCountry', 'City and country', 'A full address is not needed.', { required: true, placeholder: 'Dubai, United Arab Emirates' }),
    q('links', 'LinkedIn or portfolio', 'Optional. Put each link on a new line.', { multiline: true, placeholder: 'https://linkedin.com/in/name\nhttps://portfolio.com' }),
  ] },
  { id: 'uae', title: 'UAE employment details', description: 'Useful details for UAE recruiters.', questions: [
    q('nationality', 'Nationality', 'Type to search and select the correct nationality.', { placeholder: 'Start typing: E…', suggestions: NATIONALITIES }),
    q('visa', 'Visa status', 'Choose the accurate option.', { choices: ['Employment visa', 'Visit visa', 'Family sponsored', 'Golden visa', 'Freelance permit', 'Citizen', 'Prefer not to say'] }),
    q('availability', 'Availability', 'Choose the accurate start time.', { choices: ['Immediately', 'Within 1 week', 'Within 2 weeks', 'Within 30 days', 'After notice period'] }),
  ] },
  { id: 'profile', title: 'Professional profile', description: 'Short answers are enough — AI will polish them.', questions: [
    q('background', 'Professional background', 'Mention years, work and industries.', { required: true, multiline: true, placeholder: '3 years managing social media, creating videos and running ads…', ai: ['create_summary', 'summary'] }),
    q('technicalSkills', 'Job-related skills', 'Only 6–8 relevant skills you genuinely use.', { required: true, multiline: true, placeholder: 'Figma, Responsive Design, HTML/CSS', ai: ['add_skills', 'skills'] }),
    q('softSkills', 'Professional strengths', 'Only 4–6 qualities; do not repeat technical skills.', { multiline: true, placeholder: 'Communication, attention to detail, teamwork', ai: ['add_skills', 'skills'] }),
  ] },
  { id: 'role', title: 'Recent work experience', description: 'Freelance, internship and part-time work count too.', questions: [
    q('hasExperience', 'Do you have work experience?', 'Choose No for your first CV.', { required: true, choices: ['Yes', 'No'] }),
    q('exp1Title', 'Most recent job title', 'Use the official or closest accurate title.', { required: true, placeholder: 'Social Media Manager', show: a => a.hasExperience === 'Yes' }),
    q('exp1Company', 'Company or client', 'Freelancers can write “Freelance”.', { required: true, placeholder: 'ABC Trading LLC', show: a => a.hasExperience === 'Yes' }),
  ] },
  { id: 'roleDetails', title: 'Role details', description: 'AI turns simple facts into strong bullet points.', questions: [
    q('exp1Location', 'Location', 'City and country are enough.', { placeholder: 'Dubai, UAE', show: a => a.hasExperience === 'Yes' }),
    q('exp1Start', 'Start date', 'Choose the month and year.', { required: true, inputType: 'month', show: a => a.hasExperience === 'Yes' }),
    q('exp1End', 'End date', 'Choose the month, year, or Current.', { required: true, inputType: 'month', show: a => a.hasExperience === 'Yes' }),
    q('exp1Duties', 'Main responsibilities', 'Only 3–5 main tasks; one per line.', { required: true, multiline: true, placeholder: 'Designed responsive websites\nCreated wireframes\nWorked with clients', ai: ['improve_job_description', 'responsibility'], show: a => a.hasExperience === 'Yes' }),
  ] },
  { id: 'moreWork', title: 'Achievements & previous role', description: 'Real examples make the CV convincing.', questions: [
    q('exp1Achievements', 'Results or achievements', 'Only include results you can explain.', { multiline: true, placeholder: 'Increased engagement through consistent content', ai: ['generate_achievements', 'achievement'], show: a => a.hasExperience === 'Yes' }),
    q('hasSecondExperience', 'Add another role?', 'Choose No if one role is enough.', { choices: ['Yes', 'No'], show: a => a.hasExperience === 'Yes' }),
    q('exp2Role', 'Previous title and company', 'Title first, then company.', { required: true, placeholder: 'Content Creator — Freelance', show: a => a.hasSecondExperience === 'Yes' }),
  ] },
  { id: 'secondRole', title: 'Previous role details', description: 'Only shown when you add a second role.', questions: [
    q('exp2Dates', 'Dates', 'Start and end dates.', { required: true, placeholder: '2021 to 2022', show: a => a.hasSecondExperience === 'Yes' }),
    q('exp2Duties', 'Responsibilities', 'Write simple, truthful tasks.', { required: true, multiline: true, ai: ['improve_job_description', 'responsibility'], show: a => a.hasSecondExperience === 'Yes' }),
    q('exp2Achievements', 'Achievements', 'Optional real results.', { multiline: true, ai: ['generate_achievements', 'achievement'], show: a => a.hasSecondExperience === 'Yes' }),
  ] },
  { id: 'education', title: 'Education', description: 'University, college, diploma or vocational study.', questions: [
    q('hasEducation', 'Add education?', 'Choose No if not relevant.', { required: true, choices: ['Yes', 'No'] }),
    q('qualification', 'Qualification', 'Choose the correct level.', { required: true, choices: ['High School', 'Certificate', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Vocational Training'], show: a => a.hasEducation === 'Yes' }),
    q('institution', 'Institution', 'Type to search or enter the official name.', { required: true, placeholder: 'Start typing the school name…', suggestions: INSTITUTIONS, show: a => a.hasEducation === 'Yes' }),
  ] },
  { id: 'credentials', title: 'Qualifications & languages', description: 'Details that strengthen the application.', questions: [
    q('educationStart', 'Study start date', 'Choose the month and year.', { required: true, inputType: 'month', show: a => a.hasEducation === 'Yes' }),
    q('educationEnd', 'Graduation date', 'Choose the month and year.', { required: true, inputType: 'month', show: a => a.hasEducation === 'Yes' }),
    q('fieldOfStudy', 'Field of study', 'Use the official programme name.', { placeholder: 'e.g. Computer Science', show: a => a.hasEducation === 'Yes' }),
  ] },
  { id: 'languages', title: 'Languages', description: 'Choose accurate language levels only.', questions: [
    q('language1', 'Language', 'Type to search for a language.', { required: true, suggestions: LANGUAGES, placeholder: 'e.g. Afaan Oromo' }),
    q('language1Level', 'Proficiency', 'Choose one accurate level.', { required: true, choices: ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'] }),
    q('languagesAdditional', 'Additional languages', 'Optional. Add one per line with proficiency.', { multiline: true, placeholder: 'English — Fluent\nArabic — Conversational' }),
  ] },
  { id: 'certifications', title: 'Certifications & courses', description: 'Add only qualifications you actually completed.', questions: [
    q('certificationName', 'Certificate or course', 'Optional. Enter the official name.', { suggestions: ['Google Digital Marketing & E-commerce', 'Google Data Analytics', 'AWS Certified Cloud Practitioner', 'Microsoft Office Specialist', 'IELTS', 'First Aid'] }),
    q('certificationIssuer', 'Issuing organisation', 'Optional. Enter the official provider.', { placeholder: 'Google, AWS, Microsoft, British Council' }),
    q('certificationDate', 'Completion date', 'Optional month and year.', { inputType: 'month' }),
  ] },
  { id: 'extras', title: 'Projects & preferences', description: 'Final optional details for a stronger UAE CV.', questions: [
    q('projects', 'Relevant projects', 'Mention what you built or achieved.', { multiline: true, placeholder: 'Built a booking website for a Dubai travel agency', ai: ['improve_job_description', 'responsibility'] }),
    q('drivingLicence', 'UAE driving licence', 'Useful for travel roles.', { choices: ['Yes', 'No'] }),
    q('relocate', 'Willing to relocate', 'Choose the true answer.', { choices: ['Yes', 'No'] }),
  ] },
  { id: 'target', title: 'Target job', description: 'Optional — tailor the CV and cover letter.', questions: [
    q('targetCompany', 'Target company', 'Leave blank for a general CV.', { placeholder: 'Emirates Group' }),
    q('jobRequirements', 'Important job requirements', 'Paste the vacancy; AI matches wording without inventing.', { multiline: true, placeholder: 'Paste the most important requirements here…' }),
  ] },
  { id: 'photo', title: 'Professional photo', description: 'Optional. Upload and crop a clear profile photo.', questions: [
    q('photo', 'Upload photo', 'JPG, PNG or WebP. You can change it after generation.', { inputType: 'photo' }),
  ] },
];

const splitItems = (v = '') => v.split(/\n|,/).map(x => x.trim().replace(/^[&,+;/\s]+/, '')).filter(Boolean);
const splitLines = (v = '') => v.split(/\n|\s*[•▪]\s*/).map(x => x.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
const dates = (v = '') => v.match(/\d{4}(?:-\d{2})?/g) ?? [];
const uniqueLimited = (items: string[], limit: number) => {
  const seen = new Set<string>();
  return items.filter(item => { const key = item.toLowerCase(); if (!item || seen.has(key)) return false; seen.add(key); return true; }).slice(0, limit);
};
const clampWords = (text: string, limit: number) => text.trim().split(/\s+/).slice(0, limit).join(' ').replace(/[,;:]?$/, '.');
const visaMap: Record<string, VisaStatus> = { 'Employment visa': 'employment_visa', 'Visit visa': 'visit_visa', 'Family sponsored': 'family_sponsored', 'Golden visa': 'golden_visa', 'Freelance permit': 'freelance_permit', Citizen: 'citizen', 'Prefer not to say': 'prefer_not_to_say' };

function profession(title: string): ProfessionId {
  if (/web|ui|ux|front.?end|design/i.test(title)) return 'web_design';
  if (/market|social|content|seo/i.test(title)) return 'digital_marketing';
  if (/software|developer|programmer/i.test(title)) return 'software_development';
  if (/sales|business development/i.test(title)) return 'sales';
  if (/driver|delivery|rider/i.test(title)) return 'delivery_driving';
  if (/hotel|hospitality|waiter|barista/i.test(title)) return 'hospitality';
  if (/admin|secretary|reception/i.test(title)) return 'administration';
  if (/engineer/i.test(title)) return 'engineering';
  return 'custom';
}

function templateFor(title: string): TemplateId {
  const p = profession(title);
  if (p === 'web_design') return 'minimal-green-designer';
  if (p === 'software_development' || p === 'engineering') return 'monochrome-timeline';
  if (p === 'sales' || p === 'administration') return 'executive-black-gold';
  if (p === 'delivery_driving' || p === 'hospitality') return 'compact-dark-sidebar';
  if (p === 'digital_marketing') return 'blue-line-ats';
  return 'classic-ats-professional';
}

export function buildCVFromInterview(base: CVDocument, a: Answers): CVDocument {
  const experience: CVDocument['experience'] = [];
  const firstDates = dates(a.exp1Start || a.exp1End ? `${a.exp1Start || ''} ${a.exp1End || ''}` : a.exp1Dates || '');
  if (a.hasExperience === 'Yes') {
    const current = /current|present/i.test(`${a.exp1End || ''} ${a.exp1Dates || ''}`);
    experience.push({ id: generateId('exp'), jobTitle: a.exp1Title || '', companyName: a.exp1Company || '', location: a.exp1Location || '', startDate: firstDates[0] || '', endDate: current ? null : firstDates[1] || null, currentlyWorking: current, responsibilities: uniqueLimited(splitLines(a.exp1Duties), 5), achievements: uniqueLimited(splitLines(a.exp1Achievements), 2) });
  }
  if (a.hasSecondExperience === 'Yes') {
    const [jobTitle = '', companyName = ''] = (a.exp2Role || `${a.exp2Title || ''} — ${a.exp2Company || ''}`).split(/\s*[—–]\s*/);
    const d = dates(a.exp2Dates);
    experience.push({ id: generateId('exp'), jobTitle, companyName, location: '', startDate: d[0] || '', endDate: d[1] || null, currentlyWorking: false, responsibilities: splitLines(a.exp2Duties), achievements: splitLines(a.exp2Achievements) });
  }
  const studyDates = dates(`${a.educationStart || ''} ${a.educationEnd || ''}`);
  const education: CVDocument['education'] = a.hasEducation === 'Yes' ? [{ id: generateId('edu'), institution: a.institution || '', qualification: a.qualification || '', fieldOfStudy: a.fieldOfStudy || '', location: '', startDate: studyDates[0] || '', endDate: studyDates[1] || null, currentlyStudying: /current/i.test(a.educationEnd || ''), gradeOrHonors: '' }] : [];
  const languages = splitItems(a.languages || `${a.language1 || ''} — ${a.language1Level || ''}\n${a.languagesAdditional || ''}`).map(item => {
    const [name, level] = item.split(/\s*[—–-]\s*/); const raw = (level || '').toLowerCase();
    const proficiency: LanguageProficiency = raw.includes('native') ? 'native' : raw.includes('fluent') || raw.includes('proficient') ? 'fluent' : raw.includes('conversation') ? 'conversational' : 'basic';
    return { id: generateId('lang'), name: name || item, proficiency };
  });
  const [city = '', country = 'United Arab Emirates'] = (a.cityCountry || `${a.city || ''}, ${a.country || ''}`).split(',').map(x => x.trim());
  const links = splitLines(a.links);
  return { ...base,
    meta: { ...base.meta, name: `${a.fullName || 'My'} CV`, updatedAt: new Date().toISOString() },
    personal: { ...base.personal, fullName: a.fullName || '', professionalTitle: a.professionalTitle || '', email: a.email || '', phone: a.phone || '', city, country: country || 'United Arab Emirates', linkedInUrl: links.find(x => /linkedin/i.test(x)) || a.linkedIn || '', portfolioUrl: links.find(x => !/linkedin/i.test(x)) || a.portfolio || '' },
    uae: { ...base.uae, nationality: a.nationality || '', visaStatus: visaMap[a.visa || ''], availability: a.availability || '', hasUAEDrivingLicence: a.drivingLicence === 'Yes', willingToRelocate: a.relocate === 'Yes' },
    summary: clampWords(a.background || '', 70), experience, education,
    skills: { technical: uniqueLimited(splitItems(a.technicalSkills), 8).map(name => ({ id: generateId('skill'), name })), soft: uniqueLimited(splitItems(a.softSkills), 5).filter(name => !splitItems(a.technicalSkills).some(skill => skill.toLowerCase() === name.toLowerCase())).map(name => ({ id: generateId('skill'), name })) },
    languages,
    certifications: a.certificationName ? [{ id: generateId('cert'), name: a.certificationName, issuingOrganization: a.certificationIssuer || '', issueDate: a.certificationDate || '' }] : [],
    projects: splitLines(a.projects).slice(0, 3).map((description) => ({ id: generateId('proj'), name: description.split(/[-—:]/)[0]?.trim().slice(0, 55) || 'Relevant Project', description: clampWords(description, 30), technologies: [] })),
    template: { ...base.template, templateId: templateFor(a.professionalTitle || '') },
  };
}

async function askAI(payload: unknown) {
  const res = await fetch('/api/ai/suggest', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) return null;
  return res.json() as Promise<{ suggestedText?: string; suggestedItems?: string[] }>;
}
const shown = (section: Section, a: Answers) => section.questions.filter(question => !question.show || question.show(a));

export default function AICVInterview() {
  const hydrate = useCVStore(s => s.hydrate); const hydrated = useCVStore(s => s.hydrated);
  const cv = useCVStore(s => s.cv); const replaceCV = useCVStore(s => s.replaceCV);
  const [answers, setAnswers] = useState<Answers>({ cityCountry: 'Dubai, United Arab Emirates' });
  const [step, setStep] = useState(0); const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false); const [suggesting, setSuggesting] = useState<string | null>(null);
  const [improving, setImproving] = useState(false); const [error, setError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState(''); const [draftsOpen, setDraftsOpen] = useState(false);
  const [designVariation, setDesignVariation] = useState(0);
  const sections = useMemo(() => SECTIONS.filter(section => shown(section, answers).length), [answers]);
  const section = sections[Math.min(step, sections.length - 1)]; const questions = section ? shown(section, answers) : [];

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { try {
    const saved = localStorage.getItem('oneclickcv:interview-answers-v2');
    if (saved) {
      const parsed = JSON.parse(saved) as Answers;
      const technical = uniqueLimited(splitItems(parsed.technicalSkills), 8);
      const technicalKeys = new Set(technical.map(item => item.toLowerCase()));
      const soft = uniqueLimited(splitItems(parsed.softSkills), 6).filter(item => !technicalKeys.has(item.toLowerCase()));
      setAnswers({ cityCountry: 'Dubai, United Arab Emirates', ...parsed, technicalSkills: technical.join(', '), softSkills: soft.join(', ') });
    }
  } catch {} }, []);
  useEffect(() => { if (hydrated) try { localStorage.setItem('oneclickcv:interview-answers-v2', JSON.stringify(answers)); } catch {} }, [answers, hydrated]);
  if (!hydrated) return <div className="flex h-[60vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" /></div>;

  const set = (key: string, value: string) => { setAnswers(current => ({ ...current, [key]: value })); setError(null); };
  function validate() {
    for (const question of questions) {
      const value = answers[question.key] || '';
      if (question.required && !value.trim()) return `Please complete “${question.label}”.`;
      if (question.key === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) return 'Please enter a valid email address.';
      if (question.key === 'phone' && value.replace(/\D/g, '').length < 7) return 'Please enter a valid phone number.';
    }
    return null;
  }
  async function suggest(question: Question) {
    if (!question.ai) return; setSuggesting(question.key); setError(null);
    const [action, field] = question.ai; const current = answers[question.key] || '';
    const profile = PROFESSION_PROFILES[profession(answers.exp1Title || answers.professionalTitle || '')];
    if (question.key === 'technicalSkills') {
      set(question.key, uniqueLimited(profile.suggestedSkills, 8).join(', '));
      setSuggesting(null); return;
    }
    if (question.key === 'softSkills') {
      const technicalKeys = new Set(splitItems(answers.technicalSkills).map(item => item.toLowerCase()));
      set(question.key, uniqueLimited(profile.suggestedSoftSkills, 6).filter(item => !technicalKeys.has(item.toLowerCase())).join(', '));
      setSuggesting(null); return;
    }
    const seed = current || [answers.background, answers.exp1Title, answers.exp1Company, answers.exp1Duties].filter(Boolean).join('. ') || `Truthful suggestions for a ${answers.professionalTitle || 'professional'} CV`;
    try {
      const result = await askAI({ action, field, text: seed, context: { profession: profession(answers.exp1Title || answers.professionalTitle || ''), professionalTitle: answers.exp1Title || answers.professionalTitle || '', existingSkills: splitItems(answers.technicalSkills), targetJob: answers.jobRequirements ? { positionTitle: answers.professionalTitle || '', company: answers.targetCompany || undefined, summary: answers.jobRequirements } : undefined } });
      const value = result?.suggestedItems?.length ? result.suggestedItems.join(field === 'skills' ? ', ' : '\n') : result?.suggestedText;
      if (value) set(question.key, value);
      else if (question.key === 'background') {
        const title = answers.professionalTitle || profile.label;
        const skills = uniqueLimited(splitItems(answers.technicalSkills).length ? splitItems(answers.technicalSkills) : profile.suggestedSkills, 4);
        set(question.key, `${title} with practical capability in ${skills.join(', ')}. Focused on quality, clear communication and reliable delivery, with an adaptable approach to supporting team and business goals.`);
      } else setError('Add one short fact first, then AI can improve it.');
    } catch { setError('AI suggestion is temporarily unavailable. You can continue normally.'); }
    setSuggesting(null);
  }
  async function next() {
    const issue = validate(); if (issue) { setError(issue); return; }
    if (step < sections.length - 1) { setStep(x => x + 1); scrollTo({ top: 0, behavior: 'smooth' }); return; }
    await generate();
  }
  async function generate() {
    setGenerating(true); setError(null); let nextCV = buildCVFromInterview(cv, answers);
    try {
      const [summary, ...roles] = await Promise.all([
        askAI({ action: 'create_summary', field: 'summary', text: answers.background || '', context: { profession: profession(answers.professionalTitle || ''), professionalTitle: answers.professionalTitle || '', existingSkills: splitItems(answers.technicalSkills), targetJob: answers.jobRequirements ? { positionTitle: answers.professionalTitle || '', company: answers.targetCompany || undefined, summary: answers.jobRequirements } : undefined } }),
        ...nextCV.experience.map(role => askAI({ action: 'improve_job_description', field: 'responsibility', text: role.responsibilities.join('\n'), context: { profession: profession(role.jobTitle || answers.professionalTitle || ''), professionalTitle: role.jobTitle || answers.professionalTitle || '', existingSkills: splitItems(answers.technicalSkills) } })),
      ]);
      if (summary?.suggestedText) nextCV = { ...nextCV, summary: clampWords(summary.suggestedText, 70) };
      nextCV = { ...nextCV, experience: nextCV.experience.map((role, i) => ({ ...role, responsibilities: uniqueLimited(roles[i]?.suggestedItems?.length ? roles[i]!.suggestedItems! : roles[i]?.suggestedText ? splitLines(roles[i]!.suggestedText!) : role.responsibilities, 5) })) };
    } catch {}
    nextCV = generateAIDesign(nextCV, profession(answers.professionalTitle || ''), 0);
    replaceCV(nextCV);
    const letter = generateCoverLetter({ profession: profession(answers.professionalTitle || ''), customProfessionLabel: answers.professionalTitle, positionTitle: answers.professionalTitle || 'the advertised role', companyName: answers.targetCompany || 'your company', jobDescription: answers.jobRequirements, importantRequirements: answers.jobRequirements, experienceLevel: nextCV.experience.length > 1 ? 'mid' : 'entry', confirmedSkills: nextCV.skills.technical.map(x => x.name), tone: 'professional' }, { fullName: nextCV.personal.fullName, phone: nextCV.personal.phone, email: nextCV.personal.email, city: nextCV.personal.city, country: nextCV.personal.country, summary: nextCV.summary, recentRole: nextCV.experience[0] ? `${nextCV.experience[0].jobTitle} at ${nextCV.experience[0].companyName}` : undefined, confirmedAchievements: nextCV.experience.flatMap(x => x.achievements).slice(0, 3), projects: nextCV.projects.map(x => x.name).slice(0, 3) });
    setCoverLetter(letter.fullText); setGenerated(true); setGenerating(false); scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function improve() {
    setImproving(true); const result = await askAI({ action: 'improve', field: 'summary', text: cv.summary, context: { profession: profession(cv.personal.professionalTitle), professionalTitle: cv.personal.professionalTitle, existingSkills: cv.skills.technical.map(x => x.name) } }).catch(() => null);
    if (result?.suggestedText) replaceCV({ ...cv, summary: clampWords(result.suggestedText, 70) }); else setError('AI writing is temporarily unavailable.'); setImproving(false);
  }
  function regenerateDesign() {
    const nextVariation = designVariation + 1;
    setDesignVariation(nextVariation);
    replaceCV(generateAIDesign(cv, profession(cv.personal.professionalTitle || ''), nextVariation));
  }
  const tabs = <div className="mx-auto mb-7 grid max-w-xl grid-cols-2 rounded-2xl bg-ink-100 p-1.5"><button type="button" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-brand-700 shadow-sm">CV Builder</button><Link href="/job-match" className="rounded-xl px-4 py-3 text-center text-sm font-bold text-ink-600 hover:bg-white">Apply with Job Link</Link></div>;

  if (generated) return <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">{tabs}<div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">AI CV complete</p><h1 className="text-2xl font-bold text-ink-900">Your professional CV is ready</h1><p className="mt-1 text-sm text-ink-500">AI generated a profession-aware design. Regenerate it or fine-tune every detail.</p></div><button className="btn-secondary" onClick={() => setDraftsOpen(true)}>My drafts</button></div>{error ? <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p> : null}<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)]"><div className="space-y-5"><div className="card p-5"><div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => { setGenerated(false); setStep(0); }}>Edit information</button><button className="btn-primary" onClick={() => void improve()} disabled={improving}>{improving ? 'Improving…' : 'Improve writing with AI'}</button><button className="btn-secondary" onClick={regenerateDesign}>✦ Regenerate AI design</button><Link href="/job-match" className="btn-secondary">Tailor for a job link</Link></div></div><div className="rounded-2xl border-2 border-brand-200 bg-brand-50/40 p-1"><TemplateStep /></div><DownloadStep /><details className="card p-5"><summary className="cursor-pointer font-semibold">Add or change profile photo</summary><div className="mt-5"><PhotoEditor /></div></details><div className="card p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Matching cover letter</h2><p className="text-xs text-ink-500">Generated from the same information.</p></div><button className="btn-secondary" onClick={() => navigator.clipboard.writeText(coverLetter)}>Copy</button></div><textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="input mt-4 min-h-[320px]" /></div></div><div className="card h-[calc(100vh-7rem)] overflow-hidden lg:sticky lg:top-20"><LivePreview cv={cv} className="h-full" /></div></div>{draftsOpen ? <DraftManagerPanel onClose={() => setDraftsOpen(false)} /> : null}</div>;

  const progress = ((step + 1) / sections.length) * 100;
  return <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{tabs}<div className="mb-7 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">OneClick AI CV Builder</p><h1 className="mt-1 text-2xl font-bold text-ink-900 sm:text-3xl">Complete one short section at a time</h1><p className="mt-2 text-sm text-ink-500">Three questions per section. Use AI whenever you are unsure.</p></div><button className="btn-secondary" onClick={() => setDraftsOpen(true)}>My drafts</button></div><div className="mb-5"><div className="flex justify-between text-xs font-medium text-ink-500"><span>Section {step + 1} of {sections.length}</span><span>{Math.round(progress)}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} /></div></div><div className="card p-5 sm:p-8"><div className="mb-6"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-xl">✦</div><h2 className="text-xl font-bold sm:text-2xl">{section?.title}</h2><p className="mt-1 text-sm text-ink-500">{section?.description}</p></div><div className={`grid gap-5 ${questions.length === 1 ? 'mx-auto max-w-xl' : 'md:grid-cols-3'}`}>{questions.map(question => <div key={question.key} className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4"><label htmlFor={question.key} className="text-sm font-bold">{question.label}{question.required ? <span className="ml-1 text-red-500">*</span> : null}</label><p className="mt-1 min-h-9 text-xs leading-relaxed text-ink-500">{question.help}</p>{question.inputType === 'photo' ? <div className="mt-3"><PhotoEditor /></div> : question.choices ? <div className="mt-3 flex flex-wrap gap-2">{question.choices.map(choice => <button key={choice} type="button" onClick={() => set(question.key, choice)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${(answers[question.key] || '') === choice ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-200 bg-white text-ink-600'}`}>{choice}</button>)}</div> : question.multiline ? <textarea id={question.key} value={question.inputType === 'month' && /present|current/i.test(answers[question.key] || '') ? '' : answers[question.key] || ''} disabled={question.inputType === 'month' && /present|current/i.test(answers[question.key] || '')} onChange={e => set(question.key, e.target.value)} placeholder={question.placeholder} className="input mt-3 min-h-[128px] resize-y text-sm" /> : <><input id={question.key} type={question.inputType === 'month' ? 'month' : 'text'} list={question.suggestions ? `${question.key}-options` : undefined} value={answers[question.key] || ''} onChange={e => set(question.key, e.target.value)} placeholder={question.placeholder} className="input mt-3 text-sm" />{question.suggestions ? <datalist id={`${question.key}-options`}>{question.suggestions.map(item => <option key={item} value={item} />)}</datalist> : null}{question.key === 'exp1End' || question.key === 'educationEnd' ? <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-brand-700"><input type="checkbox" checked={/present|current/i.test(answers[question.key] || '')} onChange={e => set(question.key, e.target.checked ? (question.key === 'educationEnd' ? 'Current' : 'Present') : '')} />{question.key === 'educationEnd' ? 'I am currently studying' : 'I currently work here'}</label> : null}</>}{question.ai ? <button type="button" disabled={suggesting !== null} onClick={() => void suggest(question)} className="mt-3 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-700 disabled:opacity-50">✦ {suggesting === question.key ? 'AI is writing…' : (answers[question.key] || '').trim() ? 'Improve with AI' : 'Suggest with AI'}</button> : null}</div>)}</div>{error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}<div className="mt-7 flex justify-between gap-3"><button className="btn-secondary" disabled={step === 0 || generating} onClick={() => { setError(null); setStep(x => Math.max(0, x - 1)); }}>← Back</button><button className="btn-primary min-w-36" disabled={generating} onClick={() => void next()}>{generating ? 'AI is creating your CV…' : step === sections.length - 1 ? 'Generate my CV ✦' : 'Save & continue →'}</button></div></div><p className="mt-4 text-center text-xs text-ink-400">Answers are saved · AI improves only the facts you provide</p>{draftsOpen ? <DraftManagerPanel onClose={() => setDraftsOpen(false)} /> : null}</div>;
}
