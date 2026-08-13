import type { TemplateId } from '@/lib/cv/types';

export type PhotoShape = 'circle' | 'rounded-square' | 'square' | 'rectangle';

export interface TemplateDefinition {
  id: TemplateId; name: string; tagline: string; description: string;
  layout: 'single-column' | 'sidebar-left' | 'technical-grid';
  bestFor: string[];
  photo: { enabledByDefault: boolean; shape: PhotoShape; sizeClass: string; position: 'sidebar-top' | 'top-right-small'; showsAtsWarningWhenEnabled: boolean };
  atsFriendly: boolean;
}

const photo = (enabledByDefault: boolean, sizeClass = 'h-28 w-28') => ({
  enabledByDefault, shape: 'circle' as const, sizeClass,
  position: (enabledByDefault ? 'sidebar-top' : 'top-right-small') as 'sidebar-top' | 'top-right-small',
  showsAtsWarningWhenEnabled: !enabledByDefault,
});

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateDefinition> = {
  'dark-sidebar-professional': { id: 'dark-sidebar-professional', name: 'Dark Sidebar Professional', tagline: 'Large portrait and confident hierarchy', description: 'Dark 36% sidebar with a large circular portrait, bright name treatment and spacious professional content.', layout: 'sidebar-left', bestFor: ['Software', 'Engineering', 'UAE applications'], photo: photo(true, 'h-36 w-36'), atsFriendly: true },
  'compact-dark-sidebar': { id: 'compact-dark-sidebar', name: 'Compact Dark Sidebar', tagline: 'Compact and recruiter-friendly', description: 'Narrow dark sidebar, compact typography and short underlined headings designed for a complete one-page CV.', layout: 'sidebar-left', bestFor: ['UX', 'Design', 'Corporate roles'], photo: photo(true), atsFriendly: true },
  'minimal-green-designer': { id: 'minimal-green-designer', name: 'Minimal Green Designer', tagline: 'Clean green editorial layout', description: 'White two-column design with green rules, contact icons, employment rows and visual skill indicators.', layout: 'technical-grid', bestFor: ['Designers', 'UI/UX', 'Creative professionals'], photo: photo(true, 'h-24 w-24'), atsFriendly: false },
  'executive-black-gold': { id: 'executive-black-gold', name: 'Executive Black & Gold', tagline: 'Premium management presentation', description: 'Black gradient sidebar, warm stone header, gold accents and compact executive experience blocks.', layout: 'sidebar-left', bestFor: ['Project managers', 'Executives', 'Construction'], photo: photo(true), atsFriendly: true },
  'classic-ats-professional': { id: 'classic-ats-professional', name: 'Classic ATS Professional', tagline: 'Maximum ATS compatibility', description: 'Black-and-white single-column CV with bold uppercase headings, full-width rules and compact bullet points.', layout: 'single-column', bestFor: ['Online applications', 'Marketing', 'Finance'], photo: photo(false), atsFriendly: true },
  'elegant-minimal-ats': { id: 'elegant-minimal-ats', name: 'Elegant Minimal ATS', tagline: 'Refined and understated', description: 'Centred letter-spaced identity, soft-grey contact band and elegant ruled sections with balanced whitespace.', layout: 'single-column', bestFor: ['Administration', 'Consulting', 'Corporate roles'], photo: photo(false), atsFriendly: true },
  'blue-line-ats': { id: 'blue-line-ats', name: 'Blue-Line ATS Resume', tagline: 'Clear blue section navigation', description: 'Centred blue identity with split heading rules, two-column qualifications and spacious achievement bullets.', layout: 'single-column', bestFor: ['Marketing', 'Sales', 'General applications'], photo: photo(false), atsFriendly: true },
  'monochrome-timeline': { id: 'monochrome-timeline', name: 'Monochrome Timeline', tagline: 'Editorial career timeline', description: 'Dark-grey profile rail, condensed headings and a structured timeline for experience and education.', layout: 'sidebar-left', bestFor: ['Technical roles', 'Creative roles', 'Experienced candidates'], photo: photo(true), atsFriendly: false },
};

export const TEMPLATE_LIST = Object.values(TEMPLATE_REGISTRY);
