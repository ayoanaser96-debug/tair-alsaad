import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type { Logger } from 'pino';

import { dynamicHttpCorsOrigin } from './config/corsDynamic.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rootLogger } from './middleware/requestLogger.js';
import { httpLogging } from './middleware/requestLogger.js';
import { buildApiRouter } from './routes/v1.routes.js';
import { buildWhatsappWebhookRouter } from './routes/webhooks-whatsapp.routes.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: dynamicHttpCorsOrigin(),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use(httpLogging());
  app.use((req, _res, next) => {
    const enriched = req as express.Request & { log?: Logger; id?: unknown };
    req.logger = enriched.log ?? rootLogger;
    const headerRid = req.headers['x-request-id'];
    const fromHeader =
      typeof headerRid === 'string' ? headerRid : Array.isArray(headerRid) ? headerRid[0] : undefined;
    req.requestId = enriched.id !== undefined ? String(enriched.id) : fromHeader ?? req.requestId;
    next();
  });

  app.get('/', (_req, res) =>
    res.status(200).json({
      ok: true,
      service: 'tayralsaad-api',
      health: '/health',
      apiBase: env.API_PREFIX,
    }),
  );
  app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

  app.use(buildWhatsappWebhookRouter(rootLogger));

  app.use(env.API_PREFIX, buildApiRouter());

  app.use(errorHandler);
  return app;
}
