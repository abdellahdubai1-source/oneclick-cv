import { describe, expect, it } from 'vitest';
import { inferProfessionFromTitle } from '@/lib/cv/professionProfiles';

describe('profession inference', () => {
  it('maps web design titles to the web design profile', () => {
    expect(inferProfessionFromTitle('Web Designer')).toBe('web_design');
    expect(inferProfessionFromTitle('Frontend UI/UX Developer')).toBe('web_design');
  });

  it('maps digital marketing titles to the marketing profile', () => {
    expect(inferProfessionFromTitle('Digital Marketing Specialist')).toBe('digital_marketing');
  });

  it('falls back safely for an unknown title', () => {
    expect(inferProfessionFromTitle('Professional')).toBe('custom');
  });
});
