/**
 * Date helpers for CV entries. Dates are stored as `yyyy-MM` strings
 * (month precision, matches how CV dates are typically presented) to avoid
 * timezone bugs that come from storing full ISO datetimes for month pickers.
 */

const MONTH_LABELS: Record<LanguageCode, string[]> = {
  en: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ],
  ar: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ],
};

type LanguageCode = 'en' | 'ar';

export function formatMonthYear(value: string | null, lang: LanguageCode = 'en'): string {
  if (!value) return '';
  const [yearStr, monthStr] = value.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  if (!Number.isFinite(year) || monthIndex < 0 || monthIndex > 11) return value;
  const label = MONTH_LABELS[lang][monthIndex];
  return `${label} ${year}`;
}

export function formatDateRange(
  start: string,
  end: string | null,
  current: boolean,
  lang: LanguageCode = 'en',
): string {
  const startLabel = formatMonthYear(start, lang);
  const endLabel = current
    ? lang === 'ar'
      ? 'الحالي'
      : 'Present'
    : formatMonthYear(end, lang);
  if (!startLabel && !endLabel) return '';
  return `${startLabel} — ${endLabel}`;
}

/** yyyy-MM -> total months since year 0, for sorting/duration math. */
export function monthIndex(value: string | null): number {
  if (!value) return 0;
  const [yearStr, monthStr] = value.split('-');
  const year = Number(yearStr) || 0;
  const month = Number(monthStr) || 0;
  return year * 12 + month;
}

export function durationInMonths(start: string, end: string | null, current: boolean): number {
  const startIdx = monthIndex(start);
  const endIdx = current || !end ? monthIndex(todayYearMonth()) : monthIndex(end);
  return Math.max(0, endIdx - startIdx);
}

export function todayYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatDraftTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
