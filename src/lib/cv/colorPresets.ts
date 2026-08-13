import type { ColorPresetId } from './types';

export interface ColorPreset {
  id: ColorPresetId;
  label: string;
  /** Primary accent — headers, sidebars, section headings, dividers. */
  primary: string;
  /** Darker shade for gradients / hover states. */
  primaryDark: string;
  /** Lighter tint — subtle backgrounds, chips. */
  primaryTint: string;
  /** Text colour to use ON TOP of `primary` (kept accessible per spec §9). */
  onPrimary: string;
}

export const COLOR_PRESETS: Record<ColorPresetId, ColorPreset> = {
  'navy-blue': {
    id: 'navy-blue',
    label: 'Navy Blue',
    primary: '#0f1b52',
    primaryDark: '#0a1238',
    primaryTint: '#e8ecfa',
    onPrimary: '#ffffff',
  },
  'royal-blue': {
    id: 'royal-blue',
    label: 'Royal Blue',
    primary: '#1f43d6',
    primaryDark: '#182c86',
    primaryTint: '#e6ebfd',
    onPrimary: '#ffffff',
  },
  'emerald-green': {
    id: 'emerald-green',
    label: 'Emerald Green',
    primary: '#0f6b4f',
    primaryDark: '#0b4f3a',
    primaryTint: '#e3f4ee',
    onPrimary: '#ffffff',
  },
  'dark-teal': {
    id: 'dark-teal',
    label: 'Dark Teal',
    primary: '#0d4b52',
    primaryDark: '#093a3f',
    primaryTint: '#e1f0f1',
    onPrimary: '#ffffff',
  },
  burgundy: {
    id: 'burgundy',
    label: 'Burgundy',
    primary: '#6c1230',
    primaryDark: '#4c0c22',
    primaryTint: '#f6e6ea',
    onPrimary: '#ffffff',
  },
  charcoal: {
    id: 'charcoal',
    label: 'Charcoal',
    primary: '#2b2f38',
    primaryDark: '#1a1d23',
    primaryTint: '#eceef1',
    onPrimary: '#ffffff',
  },
  'warm-beige': {
    id: 'warm-beige',
    label: 'Warm Beige',
    primary: '#8a6a45',
    primaryDark: '#654c31',
    primaryTint: '#f5efe6',
    onPrimary: '#ffffff',
  },
};

export const COLOR_PRESET_LIST: ColorPreset[] = Object.values(COLOR_PRESETS);
