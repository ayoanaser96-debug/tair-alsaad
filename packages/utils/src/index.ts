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

export function formatIQD(value: number): string {
  return new Intl.NumberFormat('en-IQ', {
    style: 'currency',
    currency: 'IQD',
    maximumFractionDigits: 0,
  }).format(value);
}
