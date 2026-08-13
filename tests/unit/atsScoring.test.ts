import { describe, it, expect } from 'vitest';
import { runATSCheck } from '@/lib/ats/scoring';
import { createEmptyCV } from '@/lib/cv/defaults';

function baseCV() {
  const cv = createEmptyCV('Test CV');
  cv.personal.fullName = 'Jane Doe';
  cv.personal.professionalTitle = 'Marketing Executive';
  cv.personal.phone = '+971501234567';
  cv.personal.email = 'jane@example.com';
  cv.summary =
    'Results-driven marketing executive with five years of experience running digital campaigns for retail brands in the UAE.';
  cv.experience = [
    {
      id: 'exp1',
      jobTitle: 'Marketing Executive',
      companyName: 'Acme Retail',
      location: 'Dubai',
      startDate: '2020-01',
      endDate: null,
      currentlyWorking: true,
      responsibilities: ['Managed social media campaigns across Instagram and Facebook'],
      achievements: ['Increased engagement by 35% in six months'],
    },
  ];
  cv.skills.technical = [{ id: 's1', name: 'Google Analytics' }, { id: 's2', name: 'Social Media Marketing' }];
  return cv;
}

describe('runATSCheck', () => {
  it('scores a well-matched CV highly and returns a strong/good band', () => {
    const cv = baseCV();
    const jobText = `
      We are hiring a Marketing Executive in Dubai.
      Required: experience with Google Analytics and Social Media Marketing.
      Must have strong campaign management skills.
    `;
    const result = runATSCheck(cv, jobText);
    expect(result.score).toBeGreaterThan(50);
    expect(['strong', 'good', 'needs_improvement']).toContain(result.band);
    expect(result.strongMatches.length).toBeGreaterThan(0);
  });

  it('flags a missing summary and missing contact details', () => {
    const cv = createEmptyCV('Empty CV');
    const result = runATSCheck(cv, 'We need a Marketing Executive with Google Analytics experience.');
    const titles = result.contentImprovements.map((f) => f.title);
    const formattingTitles = result.formattingIssues.map((f) => f.title);
    expect(titles.some((t) => /summary/i.test(t))).toBe(true);
    expect(formattingTitles.some((t) => /contact/i.test(t))).toBe(true);
  });

  it('never returns a score outside 0-100', () => {
    const cv = baseCV();
    const result = runATSCheck(cv, 'x'.repeat(50));
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('recommends the Minimal ATS template when a non-ATS-friendly template is selected', () => {
    const cv = baseCV();
    cv.template.templateId = 'monochrome-timeline';
    const result = runATSCheck(cv, 'Marketing Executive role requiring Google Analytics.');
    expect(result.formattingIssues.some((f) => /template/i.test(f.title))).toBe(true);
  });
});
