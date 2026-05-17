import { randomUUID } from 'node:crypto';

import type { IncomingMessage } from 'node:http';

import pino from 'pino';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';

import { env } from '../config/env.js';

type LoggerRequest = IncomingMessage & { requestId?: string; logger?: Logger };

export const rootLogger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});

export function httpLogging() {
  return pinoHttp({
    logger: rootLogger,
    genReqId(req) {
      const r = req as LoggerRequest;
      const id = typeof r.headers['x-request-id'] === 'string' ? r.headers['x-request-id'] : randomUUID();
      r.requestId = id;
      return id;
    },
    serializers: {},
    quietReqLogger: false,
    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
    customReceivedMessage(req) {
      return `${req.method} ${req.url ?? ''}`;
    },
  });
}

export function bindChildLogger(req: LoggerRequest & { log: Logger }, _res: unknown, next: () => void) {
  req.logger = req.log;
  req.requestId ??= typeof req.headers['x-request-id'] === 'string' ? req.headers['x-request-id'] : randomUUID();
  next();
}
