import { describe, it, expect } from 'vitest';
import { fallbackProvider } from '@/lib/ai/fallbackEngine';

describe('fallbackProvider', () => {
  it('creates a substantial copy-ready summary without placeholders or invented metrics', async () => {
    const result = await fallbackProvider.suggest({
      action: 'create_summary',
      field: 'summary',
      text: '',
      context: { professionalTitle: 'Sales Executive', profession: 'sales', yearsOfExperience: 4 },
    });
    expect(result.source).toBe('fallback');
    expect(result.suggestedText.split(/\s+/).length).toBeGreaterThanOrEqual(70);
    expect(result.suggestedText).not.toMatch(/[\[\]]/);
    expect(result.suggestedText).not.toMatch(/\d+%/);
    expect(result.suggestedText).not.toMatch(/\b(add|replace|specify)\b/i);
  });

  it('returns complete achievement statements without editing instructions', async () => {
    const result = await fallbackProvider.suggest({
      action: 'generate_achievements',
      field: 'achievement',
      text: '',
      context: { profession: 'web_design' },
    });
    expect(result.suggestedItems).toHaveLength(4);
    expect(result.suggestedText).not.toMatch(/[\[\]]/);
    expect(result.suggestedText).not.toMatch(/\b(add|replace|specify)\b/i);
  });

  it('produces distinct suggested skills per profession (cleaning vs web design)', async () => {
    const cleaning = await fallbackProvider.suggest({
      action: 'add_skills',
      field: 'skills',
      text: '',
      context: { profession: 'cleaning_housekeeping' },
    });
    const webDesign = await fallbackProvider.suggest({
      action: 'add_skills',
      field: 'skills',
      text: '',
      context: { profession: 'web_design' },
    });
    expect(cleaning.suggestedItems).toBeDefined();
    expect(webDesign.suggestedItems).toBeDefined();
    expect(cleaning.suggestedItems).not.toEqual(webDesign.suggestedItems);
    expect(webDesign.suggestedText.toLowerCase()).not.toContain('sanitisation');
    expect(cleaning.suggestedText.toLowerCase()).not.toContain('figma');
  });

  it('fixes basic grammar issues', async () => {
    const result = await fallbackProvider.suggest({
      action: 'fix_grammar',
      field: 'responsibility',
      text: 'i managed a team and improved sales.i also trained staff',
      context: {},
    });
    expect(result.suggestedText.startsWith('I')).toBe(true);
    expect(result.suggestedText).toMatch(/\. [A-Z]/);
  });

  it('shortens text to fewer sentences', async () => {
    const longText = 'First point here. Second point here. Third point here. Fourth point here.';
    const result = await fallbackProvider.suggest({
      action: 'make_shorter',
      field: 'summary',
      text: longText,
      context: {},
    });
    const originalSentenceCount = longText.split('.').filter(Boolean).length;
    const newSentenceCount = result.suggestedText.split('.').filter(Boolean).length;
    expect(newSentenceCount).toBeLessThan(originalSentenceCount);
  });
});
