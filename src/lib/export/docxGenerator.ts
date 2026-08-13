import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import type { CVDocument } from '@/lib/cv/types';
import { getVisibleSections, SECTION_LABELS } from '@/lib/cv/sectionOrder';
import { formatDateRange } from '@/lib/utils/dates';
import { cvFilename } from './filename';
import { downloadBlob } from './downloadBlob';

/**
 * DOCX export (spec §14/§22 — "DOCX where practical").
 *
 * Deliberately template-agnostic: regardless of which visual template the
 * user picked, the DOCX always uses one clean, ATS-friendly structure —
 * standard headings, single column, no tables/text boxes, selectable text,
 * correct reading order. This matches the spec's framing of DOCX as an
 * ATS-oriented export format rather than a pixel copy of each template.
 */
export function buildCVDocx(cv: CVDocument): Document {
  const lang = cv.meta.language;
  const sections = getVisibleSections(cv);
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: cv.personal.fullName || 'Your Name', bold: true })],
    }),
    new Paragraph({
      children: [new TextRun({ text: cv.personal.professionalTitle || 'Professional Title', italics: true })],
    }),
    new Paragraph({
      children: [
        new TextRun(
          [
            cv.personal.phone,
            cv.personal.email,
            [cv.personal.city, cv.personal.country].filter(Boolean).join(', '),
            cv.personal.linkedInUrl,
            cv.personal.portfolioUrl,
          ]
            .filter(Boolean)
            .join('  |  '),
        ),
      ],
      spacing: { after: 200 },
    }),
  );

  for (const section of sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: SECTION_LABELS[section][lang].toUpperCase(), bold: true })],
        spacing: { before: 200, after: 100 },
      }),
    );

    switch (section) {
      case 'summary':
        children.push(new Paragraph({ children: [new TextRun(cv.summary)] }));
        break;
      case 'experience':
        for (const exp of cv.experience) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `${exp.jobTitle} — ${exp.companyName}`, bold: true })],
              spacing: { before: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${exp.location ? `${exp.location} · ` : ''}${formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking, lang)}`,
                  italics: true,
                  size: 20,
                }),
              ],
            }),
          );
          for (const line of [...exp.responsibilities, ...exp.achievements]) {
            children.push(new Paragraph({ text: line, bullet: { level: 0 } }));
          }
        }
        break;
      case 'education':
        for (const edu of cv.education) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `${edu.qualification} — ${edu.institution}`, bold: true })],
              spacing: { before: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: formatDateRange(edu.startDate, edu.endDate, edu.currentlyStudying, lang),
                  italics: true,
                  size: 20,
                }),
              ],
            }),
          );
        }
        break;
      case 'skills':
        children.push(
          new Paragraph({
            children: [new TextRun([...cv.skills.technical, ...cv.skills.soft].map((s) => s.name).join(', '))],
          }),
        );
        break;
      case 'languages':
        children.push(
          new Paragraph({
            children: [new TextRun(cv.languages.map((l) => `${l.name} (${l.proficiency})`).join(', '))],
          }),
        );
        break;
      case 'certifications':
        for (const c of cv.certifications) {
          children.push(
            new Paragraph({
              text: `${c.name} — ${c.issuingOrganization}${c.issueDate ? ` (${c.issueDate})` : ''}`,
              bullet: { level: 0 },
            }),
          );
        }
        break;
      case 'projects':
        for (const p of cv.projects) {
          children.push(
            new Paragraph({ children: [new TextRun({ text: p.name, bold: true })] }),
            new Paragraph({ text: p.description }),
          );
        }
        break;
      case 'references':
        for (const r of cv.references) {
          children.push(
            new Paragraph({
              text: `${r.name}${r.jobTitle ? `, ${r.jobTitle}` : ''}${r.companyName ? `, ${r.companyName}` : ''}`,
            }),
          );
        }
        break;
    }
  }

  return new Document({
    creator: 'OneClick CV',
    title: cvFilename(cv.personal.fullName, cv.personal.professionalTitle, 'docx'),
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22 } },
      },
    },
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

export async function downloadCVDocx(cv: CVDocument): Promise<void> {
  const doc = buildCVDocx(cv);
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, cvFilename(cv.personal.fullName, cv.personal.professionalTitle, 'docx'));
}

// Re-export for callers that only need alignment/heading constants without pulling in the whole module surface.
export { AlignmentType };
