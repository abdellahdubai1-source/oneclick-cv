import type { CVDocument, CVSectionId } from './types';

export const DEFAULT_SECTION_ORDER: CVSectionId[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'languages',
  'certifications',
  'projects',
  'references',
];

/** Sections users are allowed to manually hide (all are optional to display). */
export const HIDEABLE_SECTIONS: CVSectionId[] = [
  'projects',
  'references',
  'certifications',
  'languages',
];

export const SECTION_LABELS: Record<CVSectionId, { en: string; ar: string }> = {
  summary: { en: 'Professional Summary', ar: 'الملخص المهني' },
  experience: { en: 'Work Experience', ar: 'الخبرة العملية' },
  education: { en: 'Education', ar: 'التعليم' },
  skills: { en: 'Skills', ar: 'المهارات' },
  languages: { en: 'Languages', ar: 'اللغات' },
  certifications: { en: 'Certifications', ar: 'الشهادات' },
  projects: { en: 'Projects', ar: 'المشاريع' },
  references: { en: 'References', ar: 'المراجع' },
};

/**
 * A section is considered "empty" (and is hidden from preview/export
 * automatically per spec §6/§21) when it has no meaningful content.
 */
export function isSectionEmpty(cv: CVDocument, section: CVSectionId): boolean {
  switch (section) {
    case 'summary':
      return cv.summary.trim().length === 0;
    case 'experience':
      return cv.experience.length === 0;
    case 'education':
      return cv.education.length === 0;
    case 'skills':
      return cv.skills.technical.length === 0 && cv.skills.soft.length === 0;
    case 'languages':
      return cv.languages.length === 0;
    case 'certifications':
      return cv.certifications.length === 0;
    case 'projects':
      return cv.projects.length === 0;
    case 'references':
      return cv.references.length === 0;
    default:
      return true;
  }
}

/** Sections to actually render: respects manual hide + auto-hides empty sections, in the user's chosen order. */
export function getVisibleSections(cv: CVDocument): CVSectionId[] {
  const order = cv.sections.order.length > 0 ? cv.sections.order : DEFAULT_SECTION_ORDER;
  return order.filter(
    (section) => !cv.sections.hidden.includes(section) && !isSectionEmpty(cv, section),
  );
}
