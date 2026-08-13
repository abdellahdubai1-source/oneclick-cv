import type { TemplateId } from '@/lib/cv/types';

export type PhotoShape = 'circle' | 'rounded-square' | 'square' | 'rectangle';

export interface TemplatePhotoSpec {
  enabledByDefault: boolean;
  shape: PhotoShape;
  /** Tailwind width/height classes for the preview render. */
  sizeClass: string;
  position: 'top-right' | 'sidebar-top' | 'top-right-small' | 'left-large' | 'centered-top' | 'beside-contact';
  showsAtsWarningWhenEnabled: boolean;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  layout: 'single-column' | 'sidebar-left' | 'editorial-left-photo' | 'centered-elegant' | 'technical-grid';
  bestFor: string[];
  photo: TemplatePhotoSpec;
  atsFriendly: boolean;
}

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateDefinition> = {
  'executive-uae': {
    id: 'executive-uae',
    name: 'Executive UAE',
    tagline: 'Premium corporate authority',
    description:
      'A dark navy header, elegant typography and a balanced single-column layout for managers, administrators and corporate professionals.',
    layout: 'single-column',
    bestFor: ['Managers', 'Administrators', 'Corporate professionals'],
    photo: {
      enabledByDefault: true,
      shape: 'circle',
      sizeClass: 'w-24 h-24',
      position: 'top-right',
      showsAtsWarningWhenEnabled: false,
    },
    atsFriendly: true,
  },
  'modern-professional': {
    id: 'modern-professional',
    name: 'Signature Sidebar',
    tagline: 'Elegant, clear and recruiter-friendly',
    description:
      'A polished dark sidebar with a circular portrait, contact details and skills, paired with a clean white content area for profile, experience and education.',
    layout: 'sidebar-left',
    bestFor: ['UAE applications', 'Corporate roles', 'Technical professionals'],
    photo: {
      enabledByDefault: true,
      shape: 'circle',
      sizeClass: 'w-32 h-32',
      position: 'sidebar-top',
      showsAtsWarningWhenEnabled: false,
    },
    atsFriendly: true,
  },
  'minimal-ats': {
    id: 'minimal-ats',
    name: 'Minimal ATS',
    tagline: 'Built for applicant tracking systems',
    description:
      'A clean single-column layout with no sidebar, tables or icons — optimised for reliable parsing by applicant tracking systems.',
    layout: 'single-column',
    bestFor: ['Online applications', 'Applicant tracking systems'],
    photo: {
      enabledByDefault: false,
      shape: 'square',
      sizeClass: 'w-16 h-16',
      position: 'top-right-small',
      showsAtsWarningWhenEnabled: true,
    },
    atsFriendly: true,
  },
  'creative-portfolio': {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    tagline: 'Editorial, project-forward layout',
    description:
      'A modern editorial layout with a large photo and strong professional title, tuned for designers, marketers and content creators.',
    layout: 'editorial-left-photo',
    bestFor: ['Designers', 'Marketers', 'Photographers', 'Content creators'],
    photo: {
      enabledByDefault: true,
      shape: 'rectangle',
      sizeClass: 'w-full h-56',
      position: 'left-large',
      showsAtsWarningWhenEnabled: false,
    },
    atsFriendly: false,
  },
  'hospitality-uae': {
    id: 'hospitality-uae',
    name: 'Hospitality UAE',
    tagline: 'Warm and welcoming presentation',
    description:
      'An elegant, welcoming design with a centred circular photo, built for hotel, restaurant, retail and hospitality roles.',
    layout: 'centered-elegant',
    bestFor: ['Hotels', 'Restaurants', 'Retail', 'Customer-facing roles'],
    photo: {
      enabledByDefault: true,
      shape: 'circle',
      sizeClass: 'w-24 h-24',
      position: 'centered-top',
      showsAtsWarningWhenEnabled: false,
    },
    atsFriendly: false,
  },
  'technical-professional': {
    id: 'technical-professional',
    name: 'Technical Professional',
    tagline: 'Structured for technical depth',
    description:
      'A structured layout that puts technical skills, projects and certifications front and centre for developers and engineers.',
    layout: 'technical-grid',
    bestFor: ['Developers', 'Engineers', 'Technicians', 'IT professionals'],
    photo: {
      enabledByDefault: true,
      shape: 'rounded-square',
      sizeClass: 'w-16 h-16',
      position: 'beside-contact',
      showsAtsWarningWhenEnabled: false,
    },
    atsFriendly: true,
  },
};

export const TEMPLATE_LIST: TemplateDefinition[] = Object.values(TEMPLATE_REGISTRY);
