import { describe, it, expect } from 'vitest';
import { matchCVToJob } from '@/lib/job/matching';
import { parseJobPosting } from '@/lib/job/jobParsing';
import { createEmptyCV } from '@/lib/cv/defaults';

describe('matchCVToJob', () => {
  it('classifies a skill present on the CV as confirmed', () => {
    const cv = createEmptyCV('Test');
    cv.skills.technical = [{ id: 's1', name: 'Google Analytics' }];
    const job = parseJobPosting('We are looking for someone skilled in Google Analytics and reporting.');
    const result = matchCVToJob(cv, job);
    const match = result.requiredSkillMatches.find((m) => m.label === 'Google Analytics');
    expect(match?.status).toBe('confirmed');
  });

  it('classifies a skill absent from the CV as not_found', () => {
    const cv = createEmptyCV('Test');
    const job = parseJobPosting('Required: Adobe Photoshop and Illustrator experience.');
    const result = matchCVToJob(cv, job);
    expect(result.requiredSkillMatches.some((m) => m.status === 'not_found')).toBe(true);
  });

  it('always includes the compatibility disclaimer', () => {
    const cv = createEmptyCV('Test');
    const job = parseJobPosting('Looking for a Marketing Executive with Google Analytics experience.');
    const result = matchCVToJob(cv, job);
    expect(result.disclaimer).toMatch(/not a guarantee/i);
  });

  it('keeps the score within 0-100', () => {
    const cv = createEmptyCV('Test');
    const job = parseJobPosting('Looking for a candidate with Python, SQL, and AWS experience, 5+ years required.');
    const result = matchCVToJob(cv, job);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
