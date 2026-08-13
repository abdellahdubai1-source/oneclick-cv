import type { CVDocument, SkillEntry } from '@/lib/cv/types';
import type { ParsedJobPosting } from './jobParsing';

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#]/g, '');
}

function prioritiseSkills(skills: SkillEntry[], required: string[]): SkillEntry[] {
  const wanted = required.map(normalise).filter(Boolean);
  return [...skills].sort((a, b) => {
    const aName = normalise(a.name);
    const bName = normalise(b.name);
    const aIndex = wanted.findIndex((item) => item === aName || item.includes(aName) || aName.includes(item));
    const bIndex = wanted.findIndex((item) => item === bName || item.includes(bName) || bName.includes(item));
    if (aIndex < 0 && bIndex < 0) return 0;
    if (aIndex < 0) return 1;
    if (bIndex < 0) return -1;
    return aIndex - bIndex;
  });
}

/**
 * Produces a vacancy-specific CV without adding claims the candidate did not
 * provide. AI-written text is accepted only for fields derived from existing
 * text; skills are reordered, never invented or silently inserted.
 */
export function applyTailoring(
  cv: CVDocument,
  job: ParsedJobPosting,
  generated?: { summary?: string; experience?: Record<string, string[]> },
): CVDocument {
  return {
    ...cv,
    meta: {
      ...cv.meta,
      tailoredForCompany: job.company,
      tailoredForPosition: job.positionTitle,
      updatedAt: new Date().toISOString(),
    },
    summary: generated?.summary?.trim() || cv.summary,
    experience: cv.experience.map((entry) => {
      const tailoredResponsibilities = generated?.experience?.[entry.id];
      return {
        ...entry,
        responsibilities: tailoredResponsibilities && tailoredResponsibilities.length > 0
          ? tailoredResponsibilities
          : entry.responsibilities,
      };
    }),
    skills: {
      technical: prioritiseSkills(cv.skills.technical, job.requiredSkills),
      soft: prioritiseSkills(cv.skills.soft, job.requiredSkills),
    },
  };
}
