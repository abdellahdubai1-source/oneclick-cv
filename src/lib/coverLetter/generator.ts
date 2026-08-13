import { PROFESSION_PROFILES } from '@/lib/cv/professionProfiles';
import type { CoverLetterCandidate, CoverLetterInput, GeneratedCoverLetter, CoverLetterTone } from './types';

/**
 * Profession-based cover-letter generator (spec §12).
 *
 * Deliberately NOT one generic paragraph reused for every profession: the
 * middle paragraph is built from that profession's themes and value
 * propositions, and only ever references skills/experience the candidate
 * explicitly confirmed. A Cleaning letter never mentions digital marketing;
 * a Web Design letter leads with responsive design, UX and business goals.
 */

const TONE_OPENERS: Record<CoverLetterTone, (position: string, company: string) => string> = {
  professional: (position, company) =>
    `I am writing to apply for the ${position} position at ${company}. `,
  confident: (position, company) =>
    `I'm excited to apply for the ${position} role at ${company} — I'm confident I can make an immediate, positive impact. `,
  warm: (position, company) =>
    `I was delighted to see the opening for ${position} at ${company}, and I would love the opportunity to contribute to your team. `,
  concise: (position, company) => `I am applying for the ${position} position at ${company}. `,
};

const TONE_CLOSERS: Record<CoverLetterTone, string> = {
  professional:
    'Thank you for considering my application. I would welcome the opportunity to discuss how my background aligns with your needs.',
  confident:
    'I would welcome the chance to speak further about how I can contribute to your team’s success — thank you for your time and consideration.',
  warm: 'Thank you so much for taking the time to review my application — I would be genuinely glad to talk further whenever suits you.',
  concise: 'Thank you for your consideration. I am available at your convenience for an interview.',
};

function experiencePhrase(level: CoverLetterInput['experienceLevel']): string {
  switch (level) {
    case 'entry':
      return 'a strong foundation and genuine enthusiasm for this field';
    case 'mid':
      return 'solid, hands-on experience in this field';
    case 'senior':
      return 'extensive, proven experience in this field';
  }
}

export function generateCoverLetter(
  input: CoverLetterInput,
  candidate: CoverLetterCandidate,
): GeneratedCoverLetter {
  const profile = PROFESSION_PROFILES[input.profession];
  const professionLabel =
    input.profession === 'custom' && input.customProfessionLabel ? input.customProfessionLabel : profile.label;

  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const greeting = input.hiringManagerName ? `Dear ${input.hiringManagerName},` : 'Dear Hiring Manager,';

  const opener =
    TONE_OPENERS[input.tone](input.positionTitle || professionLabel, input.companyName || 'your company') +
    `With ${experiencePhrase(input.experienceLevel)}, I bring ${profile.valuePropositions[0]} to this role.`;

  const skillsClause =
    input.confirmedSkills.length > 0
      ? `My core strengths include ${formatList(input.confirmedSkills)}, which I have applied directly to ${profile.themes
          .slice(0, 2)
          .join(' and ')}.`
      : `I focus closely on ${profile.themes.slice(0, 3).join(', ')}, which are central to excelling in ${professionLabel.toLowerCase()} roles.`;

  const requirementsClause = input.importantRequirements
    ? ` I have paid particular attention to your requirement for ${truncate(input.importantRequirements, 160)}, which closely matches my background.`
    : '';

  const middleParagraph = `${skillsClause}${requirementsClause} I take pride in ${profile.valuePropositions[1] ?? profile.valuePropositions[0]}.`;

  const evidence = [
    candidate.recentRole ? `In my recent work as ${candidate.recentRole}, I applied these strengths in practical, client-focused work.` : '',
    candidate.confirmedAchievements?.[0] ? ` One relevant result from my CV is: ${truncate(candidate.confirmedAchievements[0], 190)}` : '',
    candidate.projects?.[0] ? ` My experience also includes the project “${truncate(candidate.projects[0], 100)}”.` : '',
  ].join('').trim();

  const reasonParagraph = input.reasonForApplying
    ? `${truncate(input.reasonForApplying, 400)}`
    : `I am particularly drawn to ${input.companyName || 'your organisation'} and would welcome the opportunity to bring my ${professionLabel.toLowerCase()} experience to your team.`;

  const closing = TONE_CLOSERS[input.tone];
  const signOff = `Sincerely,\n${candidate.fullName || '[Your name]'}`;

  const contactLine = [candidate.phone, candidate.email, [candidate.city, candidate.country].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' | ');

  const paragraphs = [opener, middleParagraph, evidence, reasonParagraph].filter(Boolean);

  const fullText = [
    date,
    '',
    contactLine,
    '',
    input.companyName,
    '',
    greeting,
    '',
    ...paragraphs.flatMap((p) => [p, '']),
    closing,
    '',
    signOff,
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { date, greeting, paragraphs, closing, signOff, fullText };
}

function formatList(items: string[]): string {
  if (items.length === 1) return items[0] as string;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}
