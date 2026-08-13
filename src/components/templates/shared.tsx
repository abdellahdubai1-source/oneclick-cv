import type { CVDocument, CVSectionId } from '@/lib/cv/types';
import { getVisibleSections, SECTION_LABELS } from '@/lib/cv/sectionOrder';
import { formatDateRange } from '@/lib/utils/dates';

/** Ordered, already-filtered list of sections every template should render identically. */
export function useVisibleSections(cv: CVDocument): CVSectionId[] {
  return getVisibleSections(cv);
}

export function sectionLabel(section: CVSectionId, lang: 'en' | 'ar'): string {
  return SECTION_LABELS[section][lang];
}

export function ExperienceDateRange({
  start,
  end,
  current,
  lang,
}: {
  start: string;
  end: string | null;
  current: boolean;
  lang: 'en' | 'ar';
}) {
  return <span>{formatDateRange(start, end, current, lang)}</span>;
}

/** A round/square avatar with graceful empty state — never distorts the source image (spec §10). */
export function Avatar({
  src,
  shape,
  sizeClass,
  ringColor,
  alt,
}: {
  src: string | null;
  shape: 'circle' | 'rounded-square' | 'square' | 'rectangle';
  sizeClass: string;
  ringColor?: string;
  alt: string;
}) {
  const radius =
    shape === 'circle'
      ? '9999px'
      : shape === 'rounded-square'
        ? '16px'
        : shape === 'rectangle'
          ? '4px'
          : '2px';

  if (!src) {
    return (
      <div
        className={`${sizeClass} flex shrink-0 items-center justify-center bg-ink-100 text-ink-400`}
        style={{ borderRadius: radius, border: ringColor ? `3px solid ${ringColor}` : undefined }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-1/2 w-1/2 opacity-50">
          <path
            d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12Zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.5h19.6v-2.5c0-3.3-6.5-4.9-9.8-4.9Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} shrink-0 object-cover`}
      style={{ borderRadius: radius, border: ringColor ? `3px solid ${ringColor}` : undefined }}
    />
  );
}

export function ContactLine({ items }: { items: (string | undefined | null | false)[] }) {
  const visible = items.filter(Boolean) as string[];
  if (visible.length === 0) return null;
  return (
    <p className="text-[11px] leading-relaxed opacity-90">
      {visible.map((item, i) => (
        <span key={item}>
          {item}
          {i < visible.length - 1 ? '  ·  ' : ''}
        </span>
      ))}
    </p>
  );
}
