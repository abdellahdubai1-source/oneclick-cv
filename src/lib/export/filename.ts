/**
 * Descriptive export filenames (spec §22): `Firstname-Lastname-CV.pdf`,
 * `Firstname-Lastname-Role-CV.pdf`, `Firstname-Lastname-Cover-Letter.pdf`.
 */
function slugPart(input: string): string {
  return input
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .join('-');
}

export function cvFilename(fullName: string, professionalTitle: string | undefined, ext: 'pdf' | 'docx'): string {
  const name = slugPart(fullName) || 'CV';
  const role = professionalTitle ? slugPart(professionalTitle) : '';
  const parts = role ? [name, role, 'CV'] : [name, 'CV'];
  return `${parts.join('-')}.${ext}`;
}

export function coverLetterFilename(fullName: string, ext: 'pdf' = 'pdf'): string {
  const name = slugPart(fullName) || 'Candidate';
  return `${name}-Cover-Letter.${ext}`;
}
