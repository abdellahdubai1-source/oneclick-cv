import { z } from 'zod';

/**
 * Runtime validation for CV data. Used by:
 *  - builder forms (per-step validation)
 *  - draft storage (validating data read back from localStorage)
 *  - API routes (validating any CV data sent to the server, e.g. for AI suggestions)
 *
 * Keep in sync with `src/lib/cv/types.ts`.
 */

// UAE mobile numbers: +971 5X XXX XXXX (also accepts landline-style local formats loosely).
const uaePhoneRegex = /^\+?971[-\s]?\d{1,2}[-\s]?\d{3}[-\s]?\d{3,4}$|^0\d{8,9}$/;

export const personalDetailsSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  professionalTitle: z.string().trim().min(2, 'Professional title is required').max(100),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .regex(uaePhoneRegex, 'Enter a valid UAE phone number, e.g. +971 50 123 4567'),
  email: z.string().trim().email('Enter a valid email address'),
  city: z.string().trim().min(1, 'City is required').max(60),
  country: z.string().trim().min(1, 'Country is required').max(60),
  linkedInUrl: z.string().trim().url('Enter a valid URL').or(z.literal('')).optional(),
  portfolioUrl: z.string().trim().url('Enter a valid URL').or(z.literal('')).optional(),
  photoEnabled: z.boolean(),
});

// Drafts are valid before the user completes required fields. Step-level
// submission still uses `personalDetailsSchema`, while stored CV documents
// accept empty values and validate populated values.
const draftPersonalDetailsSchema = z.object({
  fullName: z.string().trim().max(100),
  professionalTitle: z.string().trim().max(100),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || uaePhoneRegex.test(value), {
      message: 'Enter a valid UAE phone number, e.g. +971 50 123 4567',
    }),
  email: z.string().trim().email('Enter a valid email address').or(z.literal('')),
  city: z.string().trim().max(60),
  country: z.string().trim().max(60),
  linkedInUrl: z.string().trim().url('Enter a valid URL').or(z.literal('')).optional(),
  portfolioUrl: z.string().trim().url('Enter a valid URL').or(z.literal('')).optional(),
  photoEnabled: z.boolean(),
});

export const uaeDetailsSchema = z.object({
  nationality: z.string().trim().max(60).optional(),
  visaStatus: z
    .enum([
      'citizen',
      'employment_visa',
      'golden_visa',
      'family_sponsored',
      'visit_visa',
      'freelance_permit',
      'other',
      'prefer_not_to_say',
    ])
    .optional(),
  hasUAEDrivingLicence: z.boolean().optional(),
  availability: z.string().trim().max(60).optional(),
  noticePeriod: z.string().trim().max(60).optional(),
  willingToRelocate: z.boolean().optional(),
});

const monthYear = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use the format YYYY-MM')
  .or(z.literal(''));

export const workExperienceSchema = z
  .object({
    id: z.string(),
    jobTitle: z.string().trim().min(1, 'Job title is required').max(100),
    companyName: z.string().trim().min(1, 'Company name is required').max(100),
    location: z.string().trim().max(100),
    startDate: monthYear,
    endDate: monthYear.nullable(),
    currentlyWorking: z.boolean(),
    responsibilities: z.array(z.string().trim().max(500)).max(20),
    achievements: z.array(z.string().trim().max(500)).max(20),
  })
  .refine((entry) => entry.currentlyWorking || !!entry.endDate, {
    message: 'Provide an end date or mark this role as current',
    path: ['endDate'],
  });

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().trim().min(1, 'Institution is required').max(150),
  qualification: z.string().trim().min(1, 'Qualification is required').max(150),
  fieldOfStudy: z.string().trim().max(150).optional(),
  location: z.string().trim().max(100).optional(),
  startDate: monthYear,
  endDate: monthYear.nullable(),
  currentlyStudying: z.boolean(),
  gradeOrHonors: z.string().trim().max(60).optional(),
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Certification name is required').max(150),
  issuingOrganization: z.string().trim().min(1, 'Issuing organisation is required').max(150),
  issueDate: monthYear.optional(),
  expiryDate: monthYear.nullable().optional(),
  credentialId: z.string().trim().max(100).optional(),
  credentialUrl: z.string().trim().url('Enter a valid URL').or(z.literal('')).optional(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Project name is required').max(150),
  description: z.string().trim().max(600),
  technologies: z.array(z.string().trim().max(40)).max(20),
  url: z.string().trim().url('Enter a valid URL').or(z.literal('')).optional(),
  startDate: monthYear.optional(),
  endDate: monthYear.nullable().optional(),
});

export const referenceSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Name is required').max(100),
  jobTitle: z.string().trim().max(100).optional(),
  companyName: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email('Enter a valid email address').or(z.literal('')).optional(),
  relationship: z.string().trim().max(60).optional(),
});

export const skillEntrySchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(60),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
});

export const languageEntrySchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(60),
  proficiency: z.enum(['basic', 'conversational', 'fluent', 'native']),
});

export const cvDocumentSchema = z.object({
  meta: z.object({
    id: z.string(),
    name: z.string().trim().min(1).max(80),
    createdAt: z.string(),
    updatedAt: z.string(),
    language: z.enum(['en', 'ar']),
    tailoredFromId: z.string().optional(),
    tailoredForCompany: z.string().optional(),
    tailoredForPosition: z.string().optional(),
    tailoredScore: z.number().min(0).max(100).optional(),
  }),
  personal: draftPersonalDetailsSchema,
  uae: uaeDetailsSchema,
  summary: z.string().max(1200),
  experience: z.array(workExperienceSchema).max(30),
  education: z.array(educationSchema).max(20),
  skills: z.object({
    technical: z.array(skillEntrySchema).max(40),
    soft: z.array(skillEntrySchema).max(40),
  }),
  languages: z.array(languageEntrySchema).max(15),
  certifications: z.array(certificationSchema).max(30),
  projects: z.array(projectSchema).max(20),
  references: z.array(referenceSchema).max(10),
  photo: z.object({
    originalDataUrl: z.string().nullable(),
    processedDataUrl: z.string().nullable(),
    crop: z.object({
      x: z.number(),
      y: z.number(),
      zoom: z.number(),
      rotationDeg: z.number(),
      croppedAreaPixels: z
        .object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() })
        .nullable(),
    }),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).nullable(),
  }),
  template: z.object({
    templateId: z.enum([
      'executive-uae',
      'modern-professional',
      'minimal-ats',
      'creative-portfolio',
      'hospitality-uae',
      'technical-professional',
    ]),
    colorPreset: z.enum([
      'navy-blue',
      'royal-blue',
      'emerald-green',
      'dark-teal',
      'burgundy',
      'charcoal',
      'warm-beige',
    ]),
  }),
  sections: z.object({
    hidden: z.array(
      z.enum([
        'summary',
        'experience',
        'education',
        'skills',
        'languages',
        'certifications',
        'projects',
        'references',
      ]),
    ),
    order: z.array(
      z.enum([
        'summary',
        'experience',
        'education',
        'skills',
        'languages',
        'certifications',
        'projects',
        'references',
      ]),
    ),
  }),
});

export type CVDocumentInput = z.infer<typeof cvDocumentSchema>;

/** Max characters allowed for any single text block sent to an AI route (spec §13 input-size limits). */
export const AI_TEXT_MAX_CHARS = 6000;

export const aiSuggestRequestSchema = z.object({
  action: z.enum([
    'suggest',
    'improve',
    'make_professional',
    'fix_grammar',
    'make_shorter',
    'add_skills',
    'generate_achievements',
    'improve_job_description',
    'create_summary',
  ]),
  field: z.enum([
    'professionalTitle',
    'summary',
    'responsibility',
    'achievement',
    'skills',
  ]),
  text: z.string().max(AI_TEXT_MAX_CHARS).default(''),
  context: z
    .object({
      professionalTitle: z.string().max(200).optional(),
      profession: z.string().max(60).optional(),
      yearsOfExperience: z.number().min(0).max(60).optional(),
      industry: z.string().max(100).optional(),
      existingSkills: z.array(z.string().max(60)).max(60).optional(),
      targetJob: z
        .object({
          positionTitle: z.string().max(150),
          company: z.string().max(150).optional(),
          summary: z.string().max(1200).optional(),
          responsibilities: z.array(z.string().max(500)).max(20).optional(),
          requiredSkills: z.array(z.string().max(60)).max(40).optional(),
        })
        .optional(),
    })
    .optional(),
});
export type AISuggestRequest = z.infer<typeof aiSuggestRequestSchema>;
