import { Router } from 'express';

import type { Logger } from 'pino';

import { env } from '../config/env.js';

export function buildWhatsappWebhookRouter(logger: Logger): Router {
  const router = Router();

  router.get('/webhooks/whatsapp', (req, res) => {
    if (!env.WHATSAPP_VERIFY_TOKEN) {
      logger.warn('[whatsapp.webhook] WHATSAPP_VERIFY_TOKEN not configured');
      return res.status(503).send('WhatsApp webhook not configured');
    }
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (typeof mode === 'string' && mode === 'subscribe' && typeof token === 'string' && typeof challenge === 'string') {
      if (env.WHATSAPP_VERIFY_TOKEN && token === env.WHATSAPP_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      }
      logger.warn({ token }, '[whatsapp.webhook] verify token mismatch');
      return res.sendStatus(403);
    }
    logger.info('[whatsapp.webhook] verify ignored (missing META params)');
    return res.sendStatus(400);
  });

  router.post('/webhooks/whatsapp', (req, res) => {
    // Avoid logging full payloads (contain phone numbers / message content).
    const entryCount = Array.isArray((req.body as { entry?: unknown[] })?.entry)
      ? (req.body as { entry: unknown[] }).entry.length
      : 0;
    logger.info({ entryCount }, '[whatsapp.webhook] inbound');
    /** Meta expects 200 quickly; ACK here. Implement signature check with META_APP_SECRET if needed. */
    return res.sendStatus(200);
  });

  return router;
}
