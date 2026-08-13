import type { CVDocument } from '@/lib/cv/types';
import type { ColorPreset } from '@/lib/cv/colorPresets';

export interface TemplateProps {
  cv: CVDocument;
  color: ColorPreset;
  /** 'preview' renders inside the scaled A4 preview pane; 'print' renders at true size for PDF/print capture. */
  mode?: 'preview' | 'print';
}
