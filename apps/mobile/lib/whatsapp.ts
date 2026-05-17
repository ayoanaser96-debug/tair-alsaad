import * as Linking from 'expo-linking';

/** Opens WhatsApp with Iraqi-friendly normalization (+964…). */
export function openWhatsAppForPhone(raw: string, presetMessage?: string): void {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (!digits.startsWith('964') && digits.length >= 10) digits = `964${digits}`;
  const qs = presetMessage?.trim() ? `?text=${encodeURIComponent(presetMessage.trim())}` : '';
  const url = `https://wa.me/${digits}${qs}`;
  void Linking.openURL(url);
}
