import type { CVDocument } from '@/lib/cv/types';
import type { ParsedJobPosting } from './jobParsing';
import type { MatchStatus } from '@/lib/ats/scoring';

/**
 * CV-to-job matching (spec §16/§17). Classifies each requirement instead of
 * silently guessing — "Confirmed match" is only used when there's actual
 * textual evidence on the CV, never inferred.
 */

export interface RequirementMatch {
  id: string;
  label: string;
  status: MatchStatus;
  evidence?: string;
}

export interface JobMatchResult {
  score: number;
  band: 'strong' | 'good' | 'needs_improvement' | 'low';
  bandLabel: string;
  titleMatch: RequirementMatch;
  requiredSkillMatches: RequirementMatch[];
  preferredSkillMatches: RequirementMatch[];
  educationMatch: RequirementMatch;
  experienceMatch: RequirementMatch;
  languageMatches: RequirementMatch[];
  locationMatch: RequirementMatch;
  disclaimer: string;
}

function corpusOf(cv: CVDocument): string {
  return [
    cv.personal.professionalTitle,
    cv.personal.city,
    cv.personal.country,
    cv.summary,
    ...cv.experience.flatMap((e) => [e.jobTitle, e.companyName, ...e.responsibilities, ...e.achievements]),
    ...cv.education.map((e) => `${e.qualification} ${e.fieldOfStudy ?? ''}`),
    ...cv.skills.technical.map((s) => s.name),
    ...cv.skills.soft.map((s) => s.name),
    ...cv.languages.map((l) => l.name),
    ...cv.certifications.map((c) => c.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function classify(corpus: string, term: string): MatchStatus {
  if (!term) return 'needs_confirmation';
  const t = term.toLowerCase();
  if (corpus.includes(t)) return 'confirmed';
  // "Possible" when a shortened form of a multi-word term partially matches (e.g. one significant word overlaps).
  const words = t.split(/\s+/).filter((w) => w.length > 3);
  if (words.some((w) => corpus.includes(w))) return 'possible';
  return 'not_found';
}

let counter = 0;
function id(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function matchCVToJob(cv: CVDocument, job: ParsedJobPosting): JobMatchResult {
  const corpus = corpusOf(cv);

  const titleMatch: RequirementMatch = {
    id: id('title'),
    label: job.positionTitle || 'Position title',
    status: classify(corpus, job.positionTitle),
  };

  const requiredSkillMatches: RequirementMatch[] = job.requiredSkills.map((skill) => ({
    id: id('req-skill'),
    label: skill,
    status: classify(corpus, skill),
  }));

  const preferredSkillMatches: RequirementMatch[] = job.preferredSkills.map((skill) => ({
    id: id('pref-skill'),
    label: skill,
    status: classify(corpus, skill),
  }));

  const educationMatch: RequirementMatch = {
    id: id('education'),
    label: job.education || 'Education requirement',
    status: job.education ? classify(corpus, job.education) : 'needs_confirmation',
  };

  const experienceMatch: RequirementMatch = {
    id: id('experience'),
    label: job.requiredExperience || 'Experience requirement',
    status: job.requiredExperience ? classify(corpus, job.requiredExperience) : 'needs_confirmation',
  };

  const languageMatches: RequirementMatch[] = job.languages.map((lang) => ({
    id: id('lang'),
    label: lang,
    status: classify(corpus, lang),
  }));

  const locationMatch: RequirementMatch = {
    id: id('location'),
    label: job.location || 'Location',
    status: job.location ? classify(corpus, job.location) : 'needs_confirmation',
  };

  const allMatches = [
    titleMatch,
    ...requiredSkillMatches,
    ...preferredSkillMatches,
    educationMatch,
    experienceMatch,
    ...languageMatches,
    locationMatch,
  ];
  const confirmedCount = allMatches.filter((m) => m.status === 'confirmed').length;
  const possibleCount = allMatches.filter((m) => m.status === 'possible').length;
  const total = allMatches.length || 1;
  const score = Math.round(Math.min(100, ((confirmedCount + possibleCount * 0.5) / total) * 100));

  const band = score >= 85 ? 'strong' : score >= 70 ? 'good' : score >= 50 ? 'needs_improvement' : 'low';
  const bandLabel =
    band === 'strong'
      ? 'Strong match'
      : band === 'good'
        ? 'Good, improvements recommended'
        : band === 'needs_improvement'
          ? 'Needs improvement'
          : 'Low match';

  return {
    score,
    band,
    bandLabel,
    titleMatch,
    requiredSkillMatches,
    preferredSkillMatches,
    educationMatch,
    experienceMatch,
    languageMatches,
    locationMatch,
    disclaimer: 'This is an estimated compatibility score, not a guarantee of interview selection or employment.',
  };
}
