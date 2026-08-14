import { describe, expect, it } from 'vitest';
import { createEmptyCV } from '@/lib/cv/defaults';
import { getPdfLayoutScale } from '@/lib/export/pdfDocuments';

describe('adaptive PDF layout', () => {
  it('uses a more spacious scale for a sparse early-career CV', () => {
    const cv = createEmptyCV('Sparse CV');
    cv.summary = 'A concise professional summary.';
    const scale = getPdfLayoutScale(cv);
    expect(scale.bodySize).toBeGreaterThanOrEqual(10.5);
    expect(scale.sectionGap).toBeGreaterThanOrEqual(17);
  });

  it('uses a compact scale for a content-rich CV to protect one-page output', () => {
    const cv = createEmptyCV('Detailed CV');
    cv.summary = 'Professional summary '.repeat(30);
    cv.experience = Array.from({ length: 4 }, (_, index) => ({
      id: `exp-${index}`,
      jobTitle: 'Web Designer',
      companyName: 'Company',
      location: 'Dubai',
      startDate: '2022-01',
      endDate: null,
      currentlyWorking: true,
      responsibilities: Array(5).fill('Designed responsive websites.'),
      achievements: Array(3).fill('Improved the customer experience.'),
    }));
    const scale = getPdfLayoutScale(cv);
    expect(scale.bodySize).toBeGreaterThanOrEqual(10);
    expect(scale.sectionGap).toBeLessThan(12);
  });
});
