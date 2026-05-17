export type DateFormatStyle = "relative" | "short" | "long" | "datetime";

export function formatCurrency(amount: number, currency = "MYR", locale = "en-MY"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

/** Display IQD using Intl; Western numerals (latn) for both en and ar to match app copy. */
export function formatAppCurrency(amount: number, appLanguage: string): string {
  const norm = appLanguage.toLowerCase().startsWith("ar") ? "ar" : "en";
  const intlLocale = norm === "ar" ? "ar-IQ" : "en-IQ";
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: "IQD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    numberingSystem: "latn",
  }).format(amount);
}

/** Short date+time for admin tables and detail rows (Western numerals). */
export function formatAdminDateTime(iso: string, appLanguage: string): string {
  const locale = appLanguage.toLowerCase().startsWith("ar") ? "ar-IQ" : "en-IQ";
  return new Date(iso).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    numberingSystem: "latn",
  });
}

export function formatDate(input: Date | string | number, style: DateFormatStyle = "short", locale = "en-MY"): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";

  if (style === "relative") {
    const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const abs = Math.abs(diffSec);
    const div = (n: number) => Math.round(diffSec / n);
    if (abs < 60) return rtf.format(div(1), "second");
    if (abs < 3600) return rtf.format(div(60), "minute");
    if (abs < 86400) return rtf.format(div(3600), "hour");
    if (abs < 604800) return rtf.format(div(86400), "day");
    if (abs < 2592000) return rtf.format(div(604800), "week");
    if (abs < 31536000) return rtf.format(div(2592000), "month");
    return rtf.format(div(31536000), "year");
  }

  if (style === "short") {
    return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
  }
  if (style === "long") {
    return d.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" });
  }
  return d.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}

export function formatDistance(meters: number, locale = "en-MY"): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toLocaleString(locale, { maximumFractionDigits: 1 })} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h < 24) return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const hr = h % 24;
  return `${d}d ${hr}h`;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, Math.max(0, length - 1))}…`;
}

export function getInitials(name: string, max = 2): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, max).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).slice(0, max).toUpperCase();
}

export function formatPhone(phone: string, locale = "en-MY"): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return phone;
}
