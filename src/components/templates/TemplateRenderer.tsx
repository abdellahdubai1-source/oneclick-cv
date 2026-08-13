import type { CVDocument } from '@/lib/cv/types';
import { COLOR_PRESETS } from '@/lib/cv/colorPresets';
import ReferenceTemplate from './ReferenceTemplate';

export default function TemplateRenderer({ cv, mode = 'preview' }: { cv: CVDocument; mode?: 'preview' | 'print' }) {
  return <ReferenceTemplate cv={cv} color={COLOR_PRESETS[cv.template.colorPreset]} mode={mode} />;
}
