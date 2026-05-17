/**
 * Sends WhatsApp Cloud API text messages when tokens are configured.
 * https://developers.facebook.com/docs/whatsapp/cloud-api
 */
import type { Env } from '../config/env.js';

function digitsWhatsApp(recipientRaw: string | undefined): string | null {
  if (!recipientRaw) return null;
  const d = recipientRaw.replace(/\D/g, '');
  if (d.length < 10) return null;
  return d;
}

export async function sendWhatsAppText(env: Env, toPhoneDigitsOnly: string, body: string): Promise<boolean> {
  const token = env.WHATSAPP_ACCESS_TOKEN;
  const pnid = env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !pnid) return false;

  const url = `https://graph.facebook.com/${encodeURIComponent(env.WHATSAPP_CLOUD_API_VERSION)}/${encodeURIComponent(pnid)}/messages`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhoneDigitsOnly,
        type: 'text',
        text: { preview_url: true, body },
      }),
    });

    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const err = typeof json?.error === 'object' ? (json.error as { message?: string }) : {};
      console.warn('[whatsapp]', res.status, err?.message ?? JSON.stringify(json));
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[whatsapp] network error', e);
    return false;
  }
}

export function whatsappRecipientDigits(env: Env, phoneRaw: string | undefined): string | null {
  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) return null;
  return digitsWhatsApp(phoneRaw ?? '');
}
