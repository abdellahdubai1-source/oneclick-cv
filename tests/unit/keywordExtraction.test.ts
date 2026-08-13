import { describe, it, expect } from 'vitest';
import { extractKeywords } from '@/lib/ats/keywordExtraction';

describe('extractKeywords', () => {
  it('recognises known multi-word skills from the built-in glossary', () => {
    const { knownSkills } = extractKeywords('We need someone experienced in Project Management and Customer Service.');
    expect(knownSkills).toContain('Project Management');
    expect(knownSkills).toContain('Customer Service');
  });

  it('detects requirement lines', () => {
    const { requirementLines } = extractKeywords('- Must have 3 years of experience\n- Required: valid UAE driving licence');
    expect(requirementLines.length).toBeGreaterThan(0);
  });

  it('detects preferred lines separately from requirements', () => {
    const { preferredLines } = extractKeywords('Experience with Arabic is preferred but not required.');
    expect(preferredLines.length).toBeGreaterThan(0);
  });
});
