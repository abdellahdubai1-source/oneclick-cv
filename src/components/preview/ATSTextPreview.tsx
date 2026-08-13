'use client';

import { useMemo } from 'react';
import type { CVDocument } from '@/lib/cv/types';
import { getVisibleSections, SECTION_LABELS } from '@/lib/cv/sectionOrder';
import { formatDateRange } from '@/lib/utils/dates';

/**
 * Plain-text rendering of the CV in its approximate machine reading order
 * (spec §14 — ATS Text Preview). Lets users verify name, contact details,
 * headings, jobs, companies, dates, education, skills and certifications
 * exactly as a naive ATS parser would extract them.
 */
export function buildATSPlainText(cv: CVDocument): string {
  const lines: string[] = [];
  const lang = cv.meta.language;

  lines.push(cv.personal.fullName || '[Full name]');
  lines.push(cv.personal.professionalTitle || '[Professional title]');
  lines.push(
    [cv.personal.phone, cv.personal.email, [cv.personal.city, cv.personal.country].filter(Boolean).join(', ')]
      .filter(Boolean)
      .join(' | '),
  );
  if (cv.personal.linkedInUrl) lines.push(cv.personal.linkedInUrl);
  if (cv.personal.portfolioUrl) lines.push(cv.personal.portfolioUrl);
  lines.push('');

  for (const section of getVisibleSections(cv)) {
    lines.push(SECTION_LABELS[section][lang].toUpperCase());
    lines.push('-'.repeat(SECTION_LABELS[section][lang].length));

    switch (section) {
      case 'summary':
        lines.push(cv.summary);
        break;
      case 'experience':
        for (const exp of cv.experience) {
          lines.push(`${exp.jobTitle} — ${exp.companyName}${exp.location ? `, ${exp.location}` : ''}`);
          lines.push(formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking, lang));
          for (const r of exp.responsibilities) lines.push(`- ${r}`);
          for (const a of exp.achievements) lines.push(`- ${a}`);
          lines.push('');
        }
        break;
      case 'education':
        for (const edu of cv.education) {
          lines.push(`${edu.qualification} — ${edu.institution}`);
          lines.push(formatDateRange(edu.startDate, edu.endDate, edu.currentlyStudying, lang));
          lines.push('');
        }
        break;
      case 'skills':
        lines.push([...cv.skills.technical, ...cv.skills.soft].map((s) => s.name).join(', '));
        break;
      case 'languages':
        lines.push(cv.languages.map((l) => `${l.name} (${l.proficiency})`).join(', '));
        break;
      case 'certifications':
        for (const c of cv.certifications) {
          lines.push(`${c.name} — ${c.issuingOrganization}${c.issueDate ? ` (${c.issueDate})` : ''}`);
        }
        break;
      case 'projects':
        for (const p of cv.projects) {
          lines.push(`${p.name}: ${p.description}`);
        }
        break;
      case 'references':
        for (const r of cv.references) {
          lines.push(`${r.name}${r.jobTitle ? `, ${r.jobTitle}` : ''}${r.companyName ? `, ${r.companyName}` : ''}`);
        }
        break;
    }
    lines.push('');
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export default function ATSTextPreview({ cv }: { cv: CVDocument }) {
  const text = useMemo(() => buildATSPlainText(cv), [cv]);
  const risky = useMemo(
    () => !['classic-ats-professional', 'elegant-minimal-ats', 'blue-line-ats', 'dark-sidebar-professional', 'compact-dark-sidebar'].includes(cv.template.templateId),
    [cv.template.templateId],
  );

  return (
    <div className="space-y-3">
      {risky && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900">
          <span aria-hidden="true">⚠</span>
          <p>
            Your current template uses columns or styling that some applicant tracking systems may reorder or
            misread. For maximum ATS reliability, switch to the <strong>Minimal ATS</strong> template.
          </p>
        </div>
      )}
      <pre className="whitespace-pre-wrap rounded-xl border border-ink-100 bg-white p-4 font-mono text-[12.5px] leading-relaxed text-ink-800">
        {text}
      </pre>
    </div>
  );
}
