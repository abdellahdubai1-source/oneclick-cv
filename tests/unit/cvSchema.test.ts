import { describe, it, expect } from 'vitest';
import { cvDocumentSchema, personalDetailsSchema } from '@/lib/cv/schema';
import { createEmptyCV } from '@/lib/cv/defaults';

describe('cvDocumentSchema', () => {
  it('validates a freshly created empty CV', () => {
    const cv = createEmptyCV('My CV');
    const result = cvDocumentSchema.safeParse(cv);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid UAE phone number', () => {
    const result = personalDetailsSchema.safeParse({
      fullName: 'Test User',
      professionalTitle: 'Engineer',
      phone: '123',
      email: 'test@example.com',
      city: 'Dubai',
      country: 'UAE',
      photoEnabled: true,
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid UAE phone number', () => {
    const result = personalDetailsSchema.safeParse({
      fullName: 'Test User',
      professionalTitle: 'Engineer',
      phone: '+971501234567',
      email: 'test@example.com',
      city: 'Dubai',
      country: 'UAE',
      photoEnabled: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email address', () => {
    const result = personalDetailsSchema.safeParse({
      fullName: 'Test User',
      professionalTitle: 'Engineer',
      phone: '+971501234567',
      email: 'not-an-email',
      city: 'Dubai',
      country: 'UAE',
      photoEnabled: true,
    });
    expect(result.success).toBe(false);
  });
});
