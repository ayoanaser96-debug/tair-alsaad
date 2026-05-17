import type { Env } from '../config/env.js';
import { sendWhatsAppText, whatsappRecipientDigits } from './whatsappCloud.js';

function trackLink(env: Env, trackingCode: string): string {
  const base = env.WEB_PUBLIC_URL.replace(/\/+$/, '');
  return `${base}/track/${encodeURIComponent(trackingCode.trim().toUpperCase())}`;
}

export async function notifyShipmentViaWhatsApp(
  env: Env,
  opts: {
    kind: string;
    trackingCode?: string | undefined;
    receiverPhone?: string | undefined;
  },
): Promise<void> {
  const digits = whatsappRecipientDigits(env, opts.receiverPhone);
  if (!digits || !opts.trackingCode) return;

  const link = trackLink(env, opts.trackingCode);

  let body = '';
  switch (opts.kind) {
    case 'created':
      body = `[Tayr Al-Saad]\nShipment created.\nLive track: ${link}`;
      break;
    case 'assigned':
      body = `[Tayr Al-Saad]\nA driver accepted your shipment.\nLive track: ${link}`;
      break;
    case 'delivered':
      body = `[Tayr Al-Saad]\nDelivered successfully.\n${link}`;
      break;
    default:
      body = `[Tayr Al-Saad]\nUpdate (${opts.kind})\n${link}`;
  }

  await sendWhatsAppText(env, digits, body);
}
