import type { CVDocument } from '@/lib/cv/types';
import { COLOR_PRESETS } from '@/lib/cv/colorPresets';
import ExecutiveUAETemplate from './ExecutiveUAETemplate';
import ModernProfessionalTemplate from './ModernProfessionalTemplate';
import MinimalATSTemplate from './MinimalATSTemplate';
import CreativePortfolioTemplate from './CreativePortfolioTemplate';
import HospitalityUAETemplate from './HospitalityUAETemplate';
import TechnicalProfessionalTemplate from './TechnicalProfessionalTemplate';

/**
 * Single entry point that maps `cv.template.templateId` to its component.
 * Keeping the switch here (rather than scattering it across the app) means
 * adding a 7th template later is a one-line registration.
 */
export default function TemplateRenderer({
  cv,
  mode = 'preview',
}: {
  cv: CVDocument;
  mode?: 'preview' | 'print';
}) {
  const color = COLOR_PRESETS[cv.template.colorPreset];
  const props = { cv, color, mode };

  switch (cv.template.templateId) {
    case 'executive-uae':
      return <ExecutiveUAETemplate {...props} />;
    case 'modern-professional':
      return <ModernProfessionalTemplate {...props} />;
    case 'minimal-ats':
      return <MinimalATSTemplate {...props} />;
    case 'creative-portfolio':
      return <CreativePortfolioTemplate {...props} />;
    case 'hospitality-uae':
      return <HospitalityUAETemplate {...props} />;
    case 'technical-professional':
      return <TechnicalProfessionalTemplate {...props} />;
    default:
      return <ExecutiveUAETemplate {...props} />;
  }
}
