import { describe, it, expect } from 'vitest';
import { getVisibleSections, isSectionEmpty } from '@/lib/cv/sectionOrder';
import { createEmptyCV } from '@/lib/cv/defaults';

describe('sectionOrder', () => {
  it('hides empty sections automatically', () => {
    const cv = createEmptyCV('Test');
    expect(isSectionEmpty(cv, 'experience')).toBe(true);
    expect(getVisibleSections(cv)).not.toContain('experience');
  });

  it('shows a section once it has content', () => {
    const cv = createEmptyCV('Test');
    cv.summary = 'A short professional summary.';
    expect(getVisibleSections(cv)).toContain('summary');
  });

  it('respects manually hidden sections even if they have content', () => {
    const cv = createEmptyCV('Test');
    cv.languages = [{ id: 'l1', name: 'English', proficiency: 'native' }];
    cv.sections.hidden = ['languages'];
    expect(getVisibleSections(cv)).not.toContain('languages');
  });
});
