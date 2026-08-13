import { StyleSheet } from '@react-pdf/renderer';
import type { ColorPreset } from '@/lib/cv/colorPresets';

/**
 * Shared react-pdf style factory. react-pdf renders true, selectable-text
 * PDF (not a rasterised image) using standard embedded fonts — no external
 * font files need to be fetched at build time, which also means this works
 * fully offline. Swap `FONT_FAMILY` for a registered custom font later if
 * you want to move off the standard PDF fonts (see README "Fonts & Arabic
 * PDF export").
 */
export const FONT_FAMILY = 'Helvetica';
export const FONT_FAMILY_BOLD = 'Helvetica-Bold';

export const PAGE_STYLE = {
  fontFamily: FONT_FAMILY,
  fontSize: 10,
  color: '#1c1f2a',
};

export function makeSharedStyles(color: ColorPreset) {
  return StyleSheet.create({
    page: { ...PAGE_STYLE, backgroundColor: '#ffffff' },
    sectionHeading: {
      fontFamily: FONT_FAMILY_BOLD,
      fontSize: 9.5,
      color: color.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 4,
    },
    divider: { height: 1.5, width: 28, backgroundColor: color.primary, marginBottom: 8 },
    entryTitle: { fontFamily: FONT_FAMILY_BOLD, fontSize: 10.5, color: '#1c1f2a' },
    entryMeta: { fontSize: 8.5, color: '#66708c', marginTop: 1 },
    bulletRow: { flexDirection: 'row', marginTop: 2 },
    bulletDot: { width: 8, fontSize: 9 },
    bulletText: { flex: 1, fontSize: 9, lineHeight: 1.4, color: '#2f3444' },
    dateRange: { fontSize: 8.5, color: '#66708c' },
  });
}

export function formatDateRangePdf(start: string, end: string | null, current: boolean): string {
  const fmt = (v: string | null) => {
    if (!v) return '';
    const [y, m] = v.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = Number(m) - 1;
    return idx >= 0 && idx < 12 ? `${months[idx]} ${y}` : v;
  };
  const startLabel = fmt(start);
  const endLabel = current ? 'Present' : fmt(end);
  if (!startLabel && !endLabel) return '';
  return `${startLabel} — ${endLabel}`;
}
