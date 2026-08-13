import { createEmptyCV } from './defaults';
import type { CVDocument, TemplateId } from './types';
import { generateId } from '@/lib/utils/id';

/** Realistic sample CV used only for template previews (landing page, template gallery) — never persisted. */
export function createSampleCV(templateId: TemplateId = 'dark-sidebar-professional'): CVDocument {
  const base = createEmptyCV('Sample CV');
  const sample: CVDocument = {
    ...base,
    personal: {
      fullName: 'Sara Al Hashimi',
      professionalTitle: 'Senior Marketing Manager',
      phone: '+971 50 123 4567',
      email: 'sara.alhashimi@email.com',
      city: 'Dubai',
      country: 'United Arab Emirates',
      linkedInUrl: 'linkedin.com/in/saraalhashimi',
      portfolioUrl: '',
      photoEnabled: true,
    },
    uae: {
      nationality: 'United Arab Emirates',
      visaStatus: 'citizen',
      availability: 'Immediate',
      willingToRelocate: true,
    },
    summary:
      'Results-driven Marketing Manager with 8+ years of experience leading integrated campaigns for retail and hospitality brands across the UAE. Skilled in digital strategy, team leadership and budget management, with a track record of growing engagement and revenue.',
    experience: [
      {
        id: generateId('exp'),
        jobTitle: 'Senior Marketing Manager',
        companyName: 'Al Futtaim Group',
        location: 'Dubai, UAE',
        startDate: '2021-03',
        endDate: null,
        currentlyWorking: true,
        responsibilities: [
          'Lead a team of 6 marketing specialists across digital, content and events',
          'Own the annual marketing budget of AED 4.2M across 12 retail brands',
        ],
        achievements: [
          'Increased online engagement by 42% within 12 months through a refreshed content strategy',
          'Reduced customer acquisition cost by 18% by reallocating spend to higher-performing channels',
        ],
      },
      {
        id: generateId('exp'),
        jobTitle: 'Marketing Executive',
        companyName: 'Chalhoub Group',
        location: 'Dubai, UAE',
        startDate: '2017-06',
        endDate: '2021-02',
        currentlyWorking: false,
        responsibilities: ['Planned and executed seasonal campaigns across 8 retail locations'],
        achievements: ['Grew Instagram following from 12K to 65K in two years'],
      },
    ],
    education: [
      {
        id: generateId('edu'),
        institution: 'American University of Sharjah',
        qualification: 'Bachelor of Business Administration',
        fieldOfStudy: 'Marketing',
        location: 'Sharjah, UAE',
        startDate: '2013-09',
        endDate: '2017-05',
        currentlyStudying: false,
        gradeOrHonors: 'Cum Laude',
      },
    ],
    skills: {
      technical: [
        { id: generateId('skill'), name: 'Digital Strategy' },
        { id: generateId('skill'), name: 'Google Analytics' },
        { id: generateId('skill'), name: 'Meta Ads Manager' },
        { id: generateId('skill'), name: 'Budget Management' },
      ],
      soft: [
        { id: generateId('skill'), name: 'Team Leadership' },
        { id: generateId('skill'), name: 'Stakeholder Management' },
      ],
    },
    languages: [
      { id: generateId('lang'), name: 'Arabic', proficiency: 'native' },
      { id: generateId('lang'), name: 'English', proficiency: 'fluent' },
    ],
    certifications: [
      {
        id: generateId('cert'),
        name: 'Google Analytics Certified',
        issuingOrganization: 'Google',
        issueDate: '2022-01',
      },
    ],
    projects: [],
    references: [],
    template: { templateId, colorPreset: 'navy-blue' },
  };
  return sample;
}
