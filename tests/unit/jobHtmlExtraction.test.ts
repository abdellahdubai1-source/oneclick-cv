import { describe, expect, it, vi } from 'vitest';
import { parseJobPosting } from '@/lib/job/jobParsing';

vi.mock('server-only', () => ({}));

describe('job link structured-data extraction', () => {
  it('extracts a vacancy-specific schema.org JobPosting before scripts are removed', async () => {
    const { extractJobPageContent } = await import('@/lib/job/htmlExtraction');
    const html = `<!doctype html><html><head><title>Careers</title>
      <script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org', '@type': 'JobPosting', title: 'Senior Web Designer',
        hiringOrganization: { '@type': 'Organization', name: 'Example Studio LLC' },
        jobLocation: { address: { addressLocality: 'Dubai', addressCountry: 'AE' } },
        employmentType: 'FULL_TIME',
        description: '<p>Design responsive websites and collaborate with product teams.</p>',
        skills: 'Figma, Responsive Web Design, HTML/CSS',
        experienceRequirements: '3+ years of experience',
        educationRequirements: "Bachelor's degree",
        validThrough: '2026-09-30',
      })}</script></head><body><div id="app">Enable JavaScript</div></body></html>`;

    const extracted = extractJobPageContent(html);
    expect(extracted.structuredJob?.positionTitle).toBe('Senior Web Designer');
    expect(extracted.structuredJob?.company).toBe('Example Studio LLC');
    expect(extracted.structuredJob?.location).toContain('Dubai');

    const parsed = parseJobPosting(extracted.structuredJob?.description ?? '', extracted.title, extracted.structuredJob);
    expect(parsed.positionTitle).toBe('Senior Web Designer');
    expect(parsed.requiredSkills).toContain('Figma');
    expect(parsed.requiredExperience).toContain('3+ years');
  });

  it('keeps LinkedIn-style job sections and recognises creator requirements', async () => {
    const { extractJobPageContent } = await import('@/lib/job/htmlExtraction');
    const description = `<p>OMNIVAI is hiring a bilingual creator-presenter to make AI easy to understand.</p>
      <h2>What you'll do</h2><ul>
        <li>Research, script and present content about AI tools and case studies.</li>
        <li>Shoot and edit short-form video and own the content calendar.</li>
        <li>Create product demos and software walkthroughs.</li>
      </ul><h2>Requirements</h2><ul>
        <li>Fluent Arabic and English.</li>
        <li>Strong on-camera presentation, teleprompter and unscripted delivery.</li>
        <li>Video editing with CapCut, Adobe Premiere Pro or similar.</li>
      </ul><h2>Nice to have</h2><ul><li>Existing audience or published work.</li></ul>`;
    const html = `<html><head><script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: 'AI Content Creator & Presenter',
      hiringOrganization: { '@type': 'Organization', name: 'OMNIVAI' },
      jobLocation: { address: { addressLocality: 'Dubai', addressCountry: 'AE' } },
      employmentType: 'FULL_TIME',
      description,
    })}</script></head><body>Sign in to view this job</body></html>`;

    const extracted = extractJobPageContent(html);
    const parsed = parseJobPosting(extracted.structuredJob?.description ?? '', '', extracted.structuredJob);

    expect(parsed.positionTitle).toBe('AI Content Creator & Presenter');
    expect(parsed.company).toBe('OMNIVAI');
    expect(parsed.location).toContain('Dubai');
    expect(parsed.responsibilities).toContain('Shoot and edit short-form video and own the content calendar.');
    expect(parsed.requiredSkills).toEqual(expect.arrayContaining([
      'AI Tools', 'Content Calendar', 'Short-form Video', 'On-camera Presentation',
      'Teleprompter', 'CapCut', 'Adobe Premiere Pro', 'Arabic', 'English',
    ]));
  });
});
