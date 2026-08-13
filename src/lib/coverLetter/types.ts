import type { ProfessionId } from '@/lib/cv/professionProfiles';

export type CoverLetterTone = 'professional' | 'confident' | 'warm' | 'concise';
export type ExperienceLevel = 'entry' | 'mid' | 'senior';

export interface CoverLetterInput {
  profession: ProfessionId;
  customProfessionLabel?: string;
  positionTitle: string;
  companyName: string;
  hiringManagerName?: string;
  jobDescription?: string;
  importantRequirements?: string;
  experienceLevel: ExperienceLevel;
  /** Only skills the user has explicitly confirmed they possess — never inferred. */
  confirmedSkills: string[];
  reasonForApplying?: string;
  tone: CoverLetterTone;
}

export interface CoverLetterCandidate {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  summary?: string;
  recentRole?: string;
  confirmedAchievements?: string[];
  projects?: string[];
}

export interface GeneratedCoverLetter {
  date: string;
  greeting: string;
  paragraphs: string[];
  closing: string;
  signOff: string;
  fullText: string;
}
