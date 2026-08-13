import type { CVDocument } from '@/lib/cv/types';
import { TEMPLATE_REGISTRY } from '@/lib/templates/registry';
import { extractKeywords } from './keywordExtraction';

export type MatchStatus = 'confirmed' | 'possible' | 'not_found' | 'needs_confirmation';

export interface KeywordMatch {
  keyword: string;
  status: MatchStatus;
}

export interface ATSFeedbackItem {
  id: string;
  category: 'strong_match' | 'missing_keyword' | 'missing_requirement' | 'formatting' | 'content' | 'recommended_skill';
  title: string;
  detail: string;
  whyItMatters: string;
  suggestedFix: string;
  /** Only set for `recommended_skill` — the UI must ask "do you genuinely have this skill?" before adding (spec §14/§16). */
  requiresConfirmation?: boolean;
}

export interface ATSAnalysisResult {
  score: number;
  band: 'strong' | 'good' | 'needs_improvement' | 'low';
  bandLabel: string;
  strongMatches: ATSFeedbackItem[];
  missingKeywords: ATSFeedbackItem[];
  missingRequirements: ATSFeedbackItem[];
  formattingIssues: ATSFeedbackItem[];
  contentImprovements: ATSFeedbackItem[];
  recommendedSkills: ATSFeedbackItem[];
  keywordCoverage: number; // 0-1
}

function bandFor(score: number): { band: ATSAnalysisResult['band']; label: string } {
  if (score >= 85) return { band: 'strong', label: 'Strong match' };
  if (score >= 70) return { band: 'good', label: 'Good, improvements recommended' };
  if (score >= 50) return { band: 'needs_improvement', label: 'Needs improvement' };
  return { band: 'low', label: 'Low match' };
}

function buildCVCorpus(cv: CVDocument): string {
  const parts = [
    cv.personal.professionalTitle,
    cv.summary,
    ...cv.experience.flatMap((e) => [e.jobTitle, e.companyName, ...e.responsibilities, ...e.achievements]),
    ...cv.education.map((e) => `${e.qualification} ${e.fieldOfStudy ?? ''}`),
    ...cv.skills.technical.map((s) => s.name),
    ...cv.skills.soft.map((s) => s.name),
    ...cv.languages.map((l) => l.name),
    ...cv.certifications.map((c) => `${c.name} ${c.issuingOrganization}`),
    ...cv.projects.map((p) => `${p.name} ${p.description} ${p.technologies.join(' ')}`),
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function runATSCheck(cv: CVDocument, jobDescriptionText: string): ATSAnalysisResult {
  const corpus = buildCVCorpus(cv);
  const { knownSkills, freeKeywords, requirementLines } = extractKeywords(jobDescriptionText);

  const allKeywords = Array.from(new Set([...knownSkills, ...freeKeywords]));
  const matches: KeywordMatch[] = allKeywords.map((keyword) => ({
    keyword,
    status: corpus.includes(keyword.toLowerCase()) ? 'confirmed' : 'not_found',
  }));

  const strongMatches: ATSFeedbackItem[] = matches
    .filter((m) => m.status === 'confirmed')
    .map((m) => ({
      id: nextId('strong'),
      category: 'strong_match',
      title: m.keyword,
      detail: `"${m.keyword}" from the job description appears on your CV.`,
      whyItMatters: 'Matching keywords are what most ATS filters and recruiters scan for first.',
      suggestedFix: 'No action needed — this is already covered.',
    }));

  const missingKeywords: ATSFeedbackItem[] = matches
    .filter((m) => m.status === 'not_found')
    .slice(0, 20)
    .map((m) => ({
      id: nextId('missing-kw'),
      category: 'missing_keyword',
      title: m.keyword,
      detail: `"${m.keyword}" appears in the job description but wasn't found on your CV.`,
      whyItMatters: 'ATS systems and recruiters often filter by exact keyword matches from the vacancy.',
      suggestedFix: `If you genuinely have experience with "${m.keyword}", add it to your skills or a relevant bullet point.`,
      requiresConfirmation: true,
    }));

  const missingRequirements: ATSFeedbackItem[] = requirementLines
    .filter((line) => !corpus.includes(normaliseForContains(line)))
    .slice(0, 10)
    .map((line) => ({
      id: nextId('missing-req'),
      category: 'missing_requirement',
      title: truncate(line, 80),
      detail: line,
      whyItMatters: 'This looks like an explicit requirement from the job posting.',
      suggestedFix: 'Review this requirement and add truthful, relevant detail to your CV if you meet it.',
      requiresConfirmation: true,
    }));

  // ---- Formatting risk checks (spec §14) --------------------------------
  const formattingIssues: ATSFeedbackItem[] = [];
  const templateDef = TEMPLATE_REGISTRY[cv.template.templateId];
  if (!templateDef.atsFriendly) {
    formattingIssues.push({
      id: nextId('fmt'),
      category: 'formatting',
      title: 'Template may be harder for some ATS to parse',
      detail: `"${templateDef.name}" uses a layout (sidebar, columns or graphics) that some applicant tracking systems can misread.`,
      whyItMatters: 'Complex layouts can scramble reading order in older or stricter ATS parsers.',
      suggestedFix: 'Switch to the Minimal ATS template before submitting to an online application system.',
    });
  }
  if (!cv.personal.phone || !cv.personal.email) {
    formattingIssues.push({
      id: nextId('fmt'),
      category: 'formatting',
      title: 'Missing contact details',
      detail: 'Phone number or email address is missing from your Personal Details.',
      whyItMatters: 'Recruiters and ATS systems need a direct way to contact you.',
      suggestedFix: 'Add a phone number and email address in Personal Details.',
    });
  }
  const missingDatesCount = cv.experience.filter((e) => !e.startDate || (!e.endDate && !e.currentlyWorking)).length;
  if (missingDatesCount > 0) {
    formattingIssues.push({
      id: nextId('fmt'),
      category: 'formatting',
      title: 'Incomplete employment dates',
      detail: `${missingDatesCount} work experience entr${missingDatesCount === 1 ? 'y is' : 'ies are'} missing a start or end date.`,
      whyItMatters: 'Gaps or missing dates are one of the most common reasons ATS systems and recruiters flag a CV.',
      suggestedFix: 'Add start and end dates (or mark the role as current) for every work experience entry.',
    });
  }

  // ---- Content quality checks --------------------------------------------
  const contentImprovements: ATSFeedbackItem[] = [];
  if (!cv.summary || cv.summary.trim().length < 40) {
    contentImprovements.push({
      id: nextId('content'),
      category: 'content',
      title: 'Weak or missing professional summary',
      detail: 'Your professional summary is very short or empty.',
      whyItMatters: 'The summary is often the first thing a recruiter reads — a weak one reduces read-through.',
      suggestedFix: 'Use "Suggest with AI" on the Professional Summary step to draft a stronger opening.',
    });
  }
  const totalAchievements = cv.experience.reduce((sum, e) => sum + e.achievements.length, 0);
  const measurableAchievements = cv.experience.reduce(
    (sum, e) => sum + e.achievements.filter((a) => /\d/.test(a)).length,
    0,
  );
  if (totalAchievements === 0) {
    contentImprovements.push({
      id: nextId('content'),
      category: 'content',
      title: 'No measurable achievements listed',
      detail: 'None of your work experience entries include a measurable achievement.',
      whyItMatters: 'Quantified achievements (numbers, percentages, timeframes) are far more persuasive than duty lists.',
      suggestedFix: 'Use "Generate achievements" on a work experience entry, then fill in real, truthful numbers.',
    });
  } else if (measurableAchievements === 0) {
    contentImprovements.push({
      id: nextId('content'),
      category: 'content',
      title: 'Achievements aren’t measurable yet',
      detail: 'Your achievement bullets don’t currently include any numbers or metrics.',
      whyItMatters: 'Unmeasurable claims ("improved efficiency") are much weaker than quantified ones ("reduced processing time by 20%").',
      suggestedFix: 'Add a specific, truthful number, percentage or timeframe to at least one achievement.',
    });
  }

  const allBullets = cv.experience.flatMap((e) => [...e.responsibilities, ...e.achievements]);
  const duplicateBullets = allBullets.filter((b, i) => allBullets.indexOf(b) !== i && b.trim().length > 0);
  if (duplicateBullets.length > 0) {
    contentImprovements.push({
      id: nextId('content'),
      category: 'content',
      title: 'Repeated bullet points',
      detail: `${new Set(duplicateBullets).size} bullet point(s) are repeated across your CV.`,
      whyItMatters: 'Repetition wastes space and can read as low effort to a recruiter or ATS keyword scan.',
      suggestedFix: 'Vary the wording of repeated bullets, or remove duplicates.',
    });
  }

  const wordCount = corpus.split(/\s+/).filter(Boolean).length;
  if (wordCount < 80) {
    contentImprovements.push({
      id: nextId('content'),
      category: 'content',
      title: 'CV content is very short',
      detail: 'Your CV currently has very little content, which limits keyword coverage.',
      whyItMatters: 'A too-short CV usually under-represents relevant experience and skills.',
      suggestedFix: 'Add more detail to your summary, experience and skills sections.',
    });
  } else if (wordCount > 1200) {
    contentImprovements.push({
      id: nextId('content'),
      category: 'content',
      title: 'CV content may be too long',
      detail: 'Your CV currently has a large amount of text, which risks running past 2 pages.',
      whyItMatters: 'Most UAE recruiters prefer 1–2 page CVs; excessive length reduces read-through.',
      suggestedFix: 'Use "Make it shorter" on your longest sections, and keep only your most relevant, recent roles in full detail.',
    });
  }

  // ---- Recommended skills (only suggested, never auto-added) -------------
  const recommendedSkills: ATSFeedbackItem[] = missingKeywords.slice(0, 8).map((m) => ({
    ...m,
    id: nextId('rec-skill'),
    category: 'recommended_skill',
    suggestedFix: `Do you genuinely have experience with "${m.title}"? Only add it if the answer is yes.`,
    requiresConfirmation: true,
  }));

  // ---- Score -----------------------------------------------------------
  const keywordCoverage = allKeywords.length > 0 ? strongMatches.length / allKeywords.length : 0.6;
  const summaryScore = cv.summary && cv.summary.trim().length >= 40 ? 1 : 0.3;
  const achievementsScore = totalAchievements === 0 ? 0.2 : measurableAchievements > 0 ? 1 : 0.6;
  const contactScore = cv.personal.phone && cv.personal.email ? 1 : 0.4;
  const datesScore = missingDatesCount === 0 ? 1 : Math.max(0, 1 - missingDatesCount * 0.25);
  const templateScore = templateDef.atsFriendly ? 1 : 0.6;

  const rawScore =
    keywordCoverage * 50 +
    summaryScore * 10 +
    achievementsScore * 15 +
    contactScore * 10 +
    datesScore * 10 +
    templateScore * 5;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));
  const { band, label } = bandFor(score);

  return {
    score,
    band,
    bandLabel: label,
    strongMatches,
    missingKeywords,
    missingRequirements,
    formattingIssues,
    contentImprovements,
    recommendedSkills,
    keywordCoverage,
  };
}

function normaliseForContains(text: string): string {
  return text.toLowerCase().replace(/^[-•*\s]+/, '').slice(0, 40);
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
