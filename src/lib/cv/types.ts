/**
 * Core CV domain types.
 *
 * These types are the single source of truth for CV data shape. Keep this
 * file free of React/UI concerns — presentation lives in
 * `src/components/templates/*` and `src/lib/cv/sectionOrder.ts`.
 */

export type LanguageCode = 'en' | 'ar';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type LanguageProficiency =
  | 'basic'
  | 'conversational'
  | 'fluent'
  | 'native';

export type VisaStatus =
  | 'citizen'
  | 'employment_visa'
  | 'golden_visa'
  | 'family_sponsored'
  | 'visit_visa'
  | 'freelance_permit'
  | 'other'
  | 'prefer_not_to_say';

export interface PersonalDetails {
  fullName: string;
  professionalTitle: string;
  phone: string; // UAE-formatted, e.g. +971 5X XXX XXXX
  email: string;
  city: string;
  country: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  photoEnabled: boolean;
}

export interface UAEDetails {
  nationality?: string;
  visaStatus?: VisaStatus;
  hasUAEDrivingLicence?: boolean;
  availability?: string; // e.g. "Immediate", "1 month notice"
  noticePeriod?: string;
  willingToRelocate?: boolean;
}

export interface WorkExperienceEntry {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  startDate: string; // ISO yyyy-MM
  endDate: string | null; // null if currentlyWorking
  currentlyWorking: boolean;
  responsibilities: string[]; // bullet points
  achievements: string[]; // measurable achievement bullet points
}

export interface EducationEntry {
  id: string;
  institution: string;
  qualification: string;
  fieldOfStudy?: string;
  location?: string;
  startDate: string; // ISO yyyy-MM
  endDate: string | null;
  currentlyStudying: boolean;
  gradeOrHonors?: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate?: string; // ISO yyyy-MM
  expiryDate?: string | null;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string | null;
}

export interface ReferenceEntry {
  id: string;
  name: string;
  jobTitle?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  relationship?: string;
}

export interface SkillEntry {
  id: string;
  name: string;
  level?: SkillLevel;
}

export interface LanguageEntry {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
}

export interface PhotoCrop {
  x: number;
  y: number;
  zoom: number;
  rotationDeg: number;
  /** Pixel crop area on the *original* image, used to render the final export. */
  croppedAreaPixels: { x: number; y: number; width: number; height: number } | null;
}

export interface PhotoState {
  /** Data URL of the ORIGINAL uploaded image (kept so re-cropping is lossless). */
  originalDataUrl: string | null;
  /** Data URL of the final cropped/rotated image used in preview and export. */
  processedDataUrl: string | null;
  crop: PhotoCrop;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | null;
}

export const CV_SECTION_IDS = [
  'summary',
  'experience',
  'education',
  'skills',
  'languages',
  'certifications',
  'projects',
  'references',
] as const;

export type CVSectionId = (typeof CV_SECTION_IDS)[number];

export interface SectionSettings {
  /** Sections manually hidden by the user (in addition to auto-hidden empty ones). */
  hidden: CVSectionId[];
  /** Display order for sections that support reordering. */
  order: CVSectionId[];
}

export type TemplateId =
  | 'executive-uae'
  | 'modern-professional'
  | 'minimal-ats'
  | 'creative-portfolio'
  | 'hospitality-uae'
  | 'technical-professional';

export type ColorPresetId =
  | 'navy-blue'
  | 'royal-blue'
  | 'emerald-green'
  | 'dark-teal'
  | 'burgundy'
  | 'charcoal'
  | 'warm-beige';

export interface TemplateSettings {
  templateId: TemplateId;
  colorPreset: ColorPresetId;
}

export interface CVMeta {
  id: string;
  name: string; // draft name, e.g. "Marketing CV" or "Master CV"
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  language: LanguageCode;
  /** If this draft is a job-tailored copy, points back to the master draft id. */
  tailoredFromId?: string;
  tailoredForCompany?: string;
  tailoredForPosition?: string;
  tailoredScore?: number;
}

export interface CVDocument {
  meta: CVMeta;
  personal: PersonalDetails;
  uae: UAEDetails;
  summary: string;
  experience: WorkExperienceEntry[];
  education: EducationEntry[];
  skills: {
    technical: SkillEntry[];
    soft: SkillEntry[];
  };
  languages: LanguageEntry[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
  references: ReferenceEntry[];
  photo: PhotoState;
  template: TemplateSettings;
  sections: SectionSettings;
}

/** Four focused steps: enough detail for a strong CV without a long wizard. */
export const BUILDER_STEPS = ['personal', 'experience', 'skills', 'finish'] as const;

export type BuilderStepId = (typeof BUILDER_STEPS)[number];
