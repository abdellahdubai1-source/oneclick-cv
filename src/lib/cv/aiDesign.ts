import type { CVDocument, CVSectionId, ColorPresetId, TemplateId } from './types';
import type { ProfessionId } from './professionProfiles';

const COLORS: Record<ProfessionId, ColorPresetId[]> = {
  cleaning_housekeeping: ['dark-teal', 'royal-blue'], hospitality: ['burgundy', 'warm-beige'], customer_service: ['royal-blue', 'dark-teal'],
  sales: ['royal-blue', 'burgundy'], administration: ['navy-blue', 'charcoal'], security: ['charcoal', 'navy-blue'], delivery_driving: ['navy-blue', 'dark-teal'],
  digital_marketing: ['royal-blue', 'emerald-green', 'burgundy'], web_design: ['emerald-green', 'dark-teal', 'royal-blue'], software_development: ['charcoal', 'navy-blue'],
  information_technology: ['navy-blue', 'dark-teal'], engineering: ['charcoal', 'navy-blue'], accounting_finance: ['navy-blue', 'charcoal'], healthcare: ['dark-teal', 'royal-blue'],
  teaching: ['emerald-green', 'royal-blue'], construction: ['charcoal', 'warm-beige'], retail: ['burgundy', 'royal-blue'], custom: ['navy-blue', 'dark-teal', 'charcoal'],
};

const CREATIVE: ProfessionId[] = ['web_design', 'digital_marketing', 'hospitality'];
const TECHNICAL: ProfessionId[] = ['software_development', 'information_technology', 'engineering', 'construction'];

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) result = ((result << 5) - result + value.charCodeAt(index)) | 0;
  return Math.abs(result);
}

function templateCandidates(cv: CVDocument, profession: ProfessionId): TemplateId[] {
  if (CREATIVE.includes(profession)) return cv.personal.photoEnabled
    ? ['minimal-green-designer', 'compact-dark-sidebar', 'monochrome-timeline', 'blue-line-ats']
    : ['blue-line-ats', 'elegant-minimal-ats', 'minimal-green-designer'];
  if (TECHNICAL.includes(profession)) return ['monochrome-timeline', 'dark-sidebar-professional', 'classic-ats-professional'];
  if (['sales', 'administration', 'accounting_finance'].includes(profession)) return ['executive-black-gold', 'elegant-minimal-ats', 'classic-ats-professional'];
  return cv.personal.photoEnabled
    ? ['compact-dark-sidebar', 'dark-sidebar-professional', 'executive-black-gold']
    : ['classic-ats-professional', 'elegant-minimal-ats', 'blue-line-ats'];
}

export function generateAIDesign(cv: CVDocument, profession: ProfessionId, variation = 0): CVDocument {
  const seed = hash(`${cv.personal.fullName}|${cv.personal.professionalTitle}|${cv.experience.length}|${variation}`);
  const templates = templateCandidates(cv, profession);
  const colors = COLORS[profession];
  const priority: CVSectionId[] = cv.experience.length
    ? ['summary', 'experience', 'skills', 'education', 'projects', 'certifications', 'languages', 'references']
    : ['summary', 'skills', 'education', 'projects', 'certifications', 'languages', 'experience', 'references'];
  if (variation % 3 === 1) [priority[2], priority[3]] = [priority[3]!, priority[2]!];
  if (variation % 3 === 2) [priority[4], priority[5]] = [priority[5]!, priority[4]!];
  return {
    ...cv,
    template: {
      templateId: templates[seed % templates.length]!,
      colorPreset: colors[(seed + variation) % colors.length]!,
    },
    sections: { ...cv.sections, order: priority },
  };
}
