import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import type { Logger } from 'pino';

import { dynamicHttpCorsOrigin } from './config/corsDynamic.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimit.js';
import { rootLogger } from './middleware/requestLogger.js';
import { httpLogging } from './middleware/requestLogger.js';
import { buildApiRouter } from './routes/v1.routes.js';
import { buildWhatsappWebhookRouter } from './routes/webhooks-whatsapp.routes.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Behind a host load balancer / reverse proxy: trust the first hop so req.ip
  // (used for rate limiting) reflects the real client, not the proxy.
  app.set('trust proxy', 1);

  const corsOptions: cors.CorsOptions = {
    origin: dynamicHttpCorsOrigin(),
    credentials: true,
    optionsSuccessStatus: 204,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  };

  // CORS must run before helmet so OPTIONS preflight gets Access-Control-* headers.
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
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

  // Liveness: 200 while the process is up. `db` reports Mongo readiness for operators.
  app.get('/health', (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbUp = dbState === 1;
    res.status(200).json({
      ok: dbUp,
      service: 'tayralsaad-api',
      db: dbUp ? 'up' : 'down',
      uptime: Math.round(process.uptime()),
    });
  });

  app.use(buildWhatsappWebhookRouter(rootLogger));

  app.use(env.API_PREFIX, generalRateLimiter, buildApiRouter());

  app.use(errorHandler);
  return app;
}
