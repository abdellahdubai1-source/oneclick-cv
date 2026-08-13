import { extractKeywords } from '@/lib/ats/keywordExtraction';

/**
 * Heuristic job-description parser (spec §15). Works on any plain job-text
 * — whether it came from the URL extractor, a pasted description, or an
 * uploaded file's extracted text — so it deliberately has no server-only
 * dependency.
 *
 * Everything here is "best effort": results are always shown to the user
 * for correction and confirmation before being used anywhere else (spec:
 * "Never apply extracted content automatically").
 */

export interface ParsedJobPosting {
  positionTitle: string;
  company: string;
  location: string;
  employmentType: string;
  summary: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperience: string;
  education: string;
  certifications: string[];
  tools: string[];
  languages: string[];
  visaRequirements: string;
  deadline: string;
  repeatedKeywords: string[];
  rawText: string;
}

const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'temporary', 'freelance', 'permanent'];
const UAE_LOCATIONS = ['dubai', 'abu dhabi', 'sharjah', 'ajman', 'fujairah', 'ras al khaimah', 'umm al quwain', 'uae', 'united arab emirates'];
const KNOWN_LANGUAGES = ['english', 'arabic', 'hindi', 'urdu', 'french', 'tagalog', 'russian', 'chinese', 'mandarin'];

function findFirstMatch(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return '';
}

export function parseJobPosting(rawText: string, pageTitle?: string): ParsedJobPosting {
  const text = rawText.trim();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const lowerText = text.toLowerCase();

  const positionTitle = (pageTitle && pageTitle.split(/[-|·]/)[0]?.trim()) || lines[0] || '';

  const companyMatch = text.match(/(?:at|company:|employer:)\s+([A-Z][A-Za-z0-9&.,'\- ]{2,60})/);
  const company = companyMatch?.[1]?.trim() ?? '';

  const location = UAE_LOCATIONS.find((loc) => lowerText.includes(loc)) ?? '';
  const employmentType = EMPLOYMENT_TYPES.find((t) => lowerText.includes(t)) ?? '';

  const requiredExperience = findFirstMatch(text, [/\b\d{1,2}\+?\s*(?:-\s*\d{1,2})?\s*years?\s+(?:of\s+)?experience\b/i]);
  const education = findFirstMatch(text, [
    /\b(bachelor'?s?|master'?s?|phd|doctorate|diploma|high school diploma)\b[^.\n]{0,60}/i,
  ]);
  const deadline = findFirstMatch(text, [
    /(?:deadline|closing date|apply by)[:\s]+([A-Za-z0-9,\s]{4,30})/i,
  ]);
  const visaRequirements = findFirstMatch(text, [
    /\b(?:visa sponsorship available|visa sponsorship|work permit required|must have a valid uae visa|own visa required)\b/i,
  ]);

  const { knownSkills, freeKeywords, requirementLines, preferredLines } = extractKeywords(text);

  const languages = KNOWN_LANGUAGES.filter((lang) => lowerText.includes(lang)).map(
    (l) => l.charAt(0).toUpperCase() + l.slice(1),
  );

  const responsibilities = lines
    .filter((l) => /^[-•*]/.test(l) || /responsib/i.test(l))
    .map((l) => l.replace(/^[-•*]\s*/, ''))
    .slice(0, 15);

  const summary =
    lines.find((l) => l.length > 60 && !/^[-•*]/.test(l)) ?? lines.slice(0, 3).join(' ').slice(0, 400);

  return {
    positionTitle: positionTitle.slice(0, 150),
    company,
    location,
    employmentType,
    summary: summary.slice(0, 500),
    responsibilities,
    requiredSkills: knownSkills.slice(0, 20),
    preferredSkills: preferredLines.slice(0, 10),
    requiredExperience,
    education,
    certifications: knownSkills.filter((s) => /certif|license|licence/i.test(s)),
    tools: knownSkills,
    languages,
    visaRequirements,
    deadline,
    repeatedKeywords: freeKeywords,
    rawText: text,
  };
}
