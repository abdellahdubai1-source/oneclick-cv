import { describe, expect, it } from 'vitest';
import { createEmptyCV } from '@/lib/cv/defaults';
import { applyTailoring } from '@/lib/job/tailoring';
import { parseJobPosting } from '@/lib/job/jobParsing';

describe('applyTailoring', () => {
  it('prioritises only verified candidate skills and never inserts missing job skills', () => {
    const cv = createEmptyCV('Master CV');
    cv.skills.technical = [
      { id: '1', name: 'HTML/CSS' },
      { id: '2', name: 'CapCut' },
      { id: '3', name: 'Canva' },
    ];
    const job = parseJobPosting('Required: Teleprompter, CapCut, Video Editing and English.');
    const tailored = applyTailoring(cv, job);

    expect(tailored.skills.technical[0]?.name).toBe('CapCut');
    expect(tailored.skills.technical.map((skill) => skill.name)).toEqual(['CapCut', 'HTML/CSS', 'Canva']);
    expect(tailored.skills.technical.some((skill) => skill.name === 'Teleprompter')).toBe(false);
  });

  it('uses generated wording while preserving the master CV object', () => {
    const cv = createEmptyCV('Master CV');
    cv.summary = 'Original summary';
    const job = parseJobPosting('AI Content Creator role requiring CapCut.');
    const tailored = applyTailoring(cv, job, { summary: 'Tailored summary' });

    expect(tailored.summary).toBe('Tailored summary');
    expect(cv.summary).toBe('Original summary');
  });
});
