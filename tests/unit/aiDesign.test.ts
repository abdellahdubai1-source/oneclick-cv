import { describe, expect, it } from 'vitest';
import { createEmptyCV } from '@/lib/cv/defaults';
import { generateAIDesign } from '@/lib/cv/aiDesign';

describe('AI design engine', () => {
  it('creates a profession-aware design without changing CV content', () => {
    const cv = createEmptyCV();
    cv.personal.fullName = 'Amina Noor';
    cv.personal.professionalTitle = 'Web Designer';
    cv.summary = 'A concise verified profile.';
    const designed = generateAIDesign(cv, 'web_design');
    expect(['minimal-green-designer', 'compact-dark-sidebar', 'monochrome-timeline', 'blue-line-ats', 'elegant-minimal-ats']).toContain(designed.template.templateId);
    expect(designed.summary).toBe(cv.summary);
    expect(designed.sections.order[0]).toBe('summary');
  });

  it('produces another valid design variation on request', () => {
    const cv = createEmptyCV();
    cv.personal.fullName = 'Amina Noor';
    const first = generateAIDesign(cv, 'administration', 0);
    const next = generateAIDesign(cv, 'administration', 1);
    expect(first.template.templateId !== next.template.templateId || first.template.colorPreset !== next.template.colorPreset || first.sections.order.join() !== next.sections.order.join()).toBe(true);
  });
});
