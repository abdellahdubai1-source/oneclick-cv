import { describe, it, expect } from 'vitest';
import { generateCoverLetter } from '@/lib/coverLetter/generator';
import type { CoverLetterInput } from '@/lib/coverLetter/types';

const candidate = { fullName: 'Ahmed Khan', phone: '+971501234567', email: 'ahmed@example.com', city: 'Dubai', country: 'UAE' };

function makeInput(overrides: Partial<CoverLetterInput>): CoverLetterInput {
  return {
    profession: 'cleaning_housekeeping',
    positionTitle: 'Housekeeping Attendant',
    companyName: 'Grand Hotel',
    experienceLevel: 'mid',
    confirmedSkills: ['Deep cleaning', 'Attention to detail'],
    tone: 'professional',
    ...overrides,
  };
}

describe('generateCoverLetter', () => {
  it('generates a Cleaning letter that does not mention digital marketing', () => {
    const letter = generateCoverLetter(makeInput({}), candidate);
    expect(letter.fullText.toLowerCase()).not.toContain('digital marketing');
    expect(letter.fullText.toLowerCase()).not.toContain('web design');
    expect(letter.fullText.toLowerCase()).toMatch(/hygiene|cleaning|reliab/);
  });

  it('generates a Web Design letter that references relevant web skills', () => {
    const letter = generateCoverLetter(
      makeInput({
        profession: 'web_design',
        positionTitle: 'Web Designer',
        confirmedSkills: ['Responsive design', 'Figma'],
      }),
      candidate,
    );
    expect(letter.fullText.toLowerCase()).toMatch(/responsive|ux|design/);
    expect(letter.fullText.toLowerCase()).not.toContain('sanitisation');
  });

  it('includes the candidate name and company name', () => {
    const letter = generateCoverLetter(makeInput({ companyName: 'Grand Hotel' }), candidate);
    expect(letter.fullText).toContain('Ahmed Khan');
    expect(letter.fullText).toContain('Grand Hotel');
  });

  it('only references confirmed skills, never invents new ones', () => {
    const letter = generateCoverLetter(makeInput({ confirmedSkills: ['Deep cleaning'] }), candidate);
    expect(letter.fullText).toContain('Deep cleaning');
    expect(letter.fullText).not.toMatch(/certified|licensed professional/i);
  });
});
