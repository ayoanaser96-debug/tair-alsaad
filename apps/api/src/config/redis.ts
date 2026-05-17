import { Redis } from 'ioredis';
import type { Logger } from 'pino';

import { env } from './env.js';

let redis: Redis | undefined;

/** Shared Redis connection (optional in dev seed-only flows). */
export function getRedis(logger?: Logger): Redis | undefined {
  if (!env.REDIS_URL) return undefined;
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      /** Avoid endless reconnect noise when Redis is not running locally. */
      retryStrategy(times) {
        if (times > 8) return null;
        return Math.min(times * 150, 2000);
      },
    });
    redis.on('error', (err) => (logger ?? console).warn({ err }, 'Redis connection error'));
    (logger ?? console).info('Redis client created');
  }
  return redis;
}

export function closeRedis(): Promise<'OK' | void> | void {
  if (!redis) return;
  const c = redis;
  redis = undefined;
  return c.quit();
}

export function redisDupForQueues(): Redis | undefined {
  return getRedis()?.duplicate({
    maxRetriesPerRequest: null,
  });
}
