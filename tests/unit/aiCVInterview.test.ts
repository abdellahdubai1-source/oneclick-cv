import { describe, expect, it } from 'vitest';
import { createEmptyCV } from '@/lib/cv/defaults';
import { buildCVFromInterview } from '@/components/builder/AICVInterview';

describe('AI CV interview data mapping', () => {
  it('creates a truthful CV from one-answer-at-a-time interview data', () => {
    const cv = buildCVFromInterview(createEmptyCV('Interview CV'), {
      fullName: 'Amina Hassan',
      professionalTitle: 'Customer Service Representative',
      email: 'amina@example.com',
      phone: '+971 50 123 4567',
      city: 'Dubai',
      country: 'United Arab Emirates',
      background: 'Customer service professional with retail experience.',
      hasExperience: 'Yes',
      exp1Title: 'Customer Service Assistant',
      exp1Company: 'ABC Retail',
      exp1Start: '2023-01',
      exp1End: 'Current',
      exp1Duties: 'Answered customer questions\nResolved order issues',
      technicalSkills: 'CRM, Order processing',
      softSkills: 'Communication, Patience',
      languages: 'English — Fluent, Arabic — Conversational',
      hasEducation: 'No',
    });

    expect(cv.personal.fullName).toBe('Amina Hassan');
    expect(cv.experience).toHaveLength(1);
    expect(cv.experience[0]?.currentlyWorking).toBe(true);
    expect(cv.experience[0]?.responsibilities).toEqual(['Answered customer questions', 'Resolved order issues']);
    expect(cv.skills.technical.map((skill) => skill.name)).toEqual(['CRM', 'Order processing']);
    expect(cv.languages.map((language) => language.proficiency)).toEqual(['fluent', 'conversational']);
    expect(cv.education).toHaveLength(0);
  });

  it('does not invent experience when the visitor answers no', () => {
    const cv = buildCVFromInterview(createEmptyCV('Entry CV'), {
      fullName: 'Entry Candidate',
      professionalTitle: 'Junior Designer',
      hasExperience: 'No',
      hasEducation: 'No',
      technicalSkills: 'Canva, Figma',
      languages: 'English — Fluent',
    });

    expect(cv.experience).toEqual([]);
    expect(cv.education).toEqual([]);
  });
});
