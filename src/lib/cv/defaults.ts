import { generateId } from '@/lib/utils/id';
import { DEFAULT_SECTION_ORDER } from './sectionOrder';
import type {
  CVDocument,
  WorkExperienceEntry,
  EducationEntry,
  CertificationEntry,
  ProjectEntry,
  ReferenceEntry,
} from './types';

export function createEmptyCV(name = 'Untitled CV'): CVDocument {
  const now = new Date().toISOString();
  return {
    meta: {
      id: generateId('cv'),
      name,
      createdAt: now,
      updatedAt: now,
      language: 'en',
    },
    personal: {
      fullName: '',
      professionalTitle: '',
      phone: '',
      email: '',
      city: '',
      country: 'United Arab Emirates',
      linkedInUrl: '',
      portfolioUrl: '',
      photoEnabled: true,
    },
    uae: {
      nationality: '',
      visaStatus: undefined,
      hasUAEDrivingLicence: undefined,
      availability: '',
      noticePeriod: '',
      willingToRelocate: undefined,
    },
    summary: '',
    experience: [],
    education: [],
    skills: { technical: [], soft: [] },
    languages: [],
    certifications: [],
    projects: [],
    references: [],
    photo: {
      originalDataUrl: null,
      processedDataUrl: null,
      crop: { x: 0, y: 0, zoom: 1, rotationDeg: 0, croppedAreaPixels: null },
      mimeType: null,
    },
    template: {
      templateId: 'dark-sidebar-professional',
      colorPreset: 'navy-blue',
    },
    sections: {
      hidden: [],
      order: [...DEFAULT_SECTION_ORDER],
    },
  };
}

export function createEmptyWorkExperience(): WorkExperienceEntry {
  return {
    id: generateId('exp'),
    jobTitle: '',
    companyName: '',
    location: '',
    startDate: '',
    endDate: null,
    currentlyWorking: false,
    responsibilities: [],
    achievements: [],
  };
}

export function createEmptyEducation(): EducationEntry {
  return {
    id: generateId('edu'),
    institution: '',
    qualification: '',
    fieldOfStudy: '',
    location: '',
    startDate: '',
    endDate: null,
    currentlyStudying: false,
    gradeOrHonors: '',
  };
}

export function createEmptyCertification(): CertificationEntry {
  return {
    id: generateId('cert'),
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: null,
    credentialId: '',
    credentialUrl: '',
  };
}

export function createEmptyProject(): ProjectEntry {
  return {
    id: generateId('proj'),
    name: '',
    description: '',
    technologies: [],
    url: '',
    startDate: '',
    endDate: null,
  };
}

export function createEmptyReference(): ReferenceEntry {
  return {
    id: generateId('ref'),
    name: '',
    jobTitle: '',
    companyName: '',
    phone: '',
    email: '',
    relationship: '',
  };
}
