export function normalizePhone(input: string): string {
  const normalized = input.replace(/[^\d+]/g, '');
  if (normalized.startsWith('+')) return normalized;
  if (normalized.startsWith('00')) return `+${normalized.slice(2)}`;
  if (normalized.startsWith('0')) return `+964${normalized.slice(1)}`;
  if (normalized.startsWith('964')) return `+${normalized}`;
  return `+${normalized}`;
}

export function generateTrackingCode(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TS-${stamp}-${rand}`;
}

export function formatIQD(amount: number, locale: 'ar' | 'en' = 'ar'): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-IQ' : 'en-IQ', {
    maximumFractionDigits: 0,
  }).format(rounded);
  return locale === 'ar' ? `${formatted} د.ع` : `${formatted} IQD`;
}

/**
 * Shared date/time formatter — renders month names and numerals in the app
 * locale (ar-IQ / en-IQ). Use this everywhere instead of bare
 * `toLocaleDateString`, which formats in the device locale.
 */
export function formatDate(
  value: Date | string | number | null | undefined,
  locale: 'ar' | 'en' = 'ar',
  opts: { withTime?: boolean } = {},
): string {
  if (value === null || value === undefined || value === '') return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  const intlLocale = locale === 'ar' ? 'ar-IQ' : 'en-IQ';
  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const timeOptions: Intl.DateTimeFormatOptions = opts.withTime
    ? { hour: '2-digit', minute: '2-digit' }
    : {};
  return new Intl.DateTimeFormat(intlLocale, { ...dateOptions, ...timeOptions }).format(date);
}
