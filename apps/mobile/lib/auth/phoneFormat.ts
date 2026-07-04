/** Iraqi mobile local number helpers for phone auth UI. */

export function stripLocalPhoneDigits(input: string): string {
  return input.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10);
}

export function formatLocalPhoneDisplay(digits: string, locale: string): string {
  const clean = stripLocalPhoneDigits(digits);
  let formatted = clean;

  if (clean.length > 3) {
    formatted = `${clean.slice(0, 3)} ${clean.slice(3)}`;
  }
  if (clean.length > 6) {
    formatted = `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }

  return localizeDigits(formatted, locale);
}

export function isValidIraqiLocalPhone(digits: string): boolean {
  const clean = stripLocalPhoneDigits(digits);
  return clean.length === 10 && clean.startsWith('7');
}

export function localizeDigits(text: string, locale: string): string {
  if (!locale.startsWith('ar')) return text;
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return text.replace(/\d/g, (digit) => arabicNumerals[Number(digit)] ?? digit);
}

export function formatCountdown(seconds: number, locale: string): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const raw = `${mins}:${secs.toString().padStart(2, '0')}`;
  return localizeDigits(raw, locale);
}

export function formatPhoneForDisplay(phone: string, locale: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('964') ? digits.slice(3) : digits.replace(/^0+/, '');
  return localizeDigits(`+964 ${formatLocalPhoneDisplay(local, 'en')}`, locale);
}
