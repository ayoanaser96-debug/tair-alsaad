import type { CorsOptions } from 'cors';

import { env } from './env.js';

/** Any localhost loopback origin with an optional dev port */
const localhostDev = /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/;

/**
 * RFC 1918-style LAN origins for dev (phone / another PC hitting Vite via machine IP).
 * Optional port so `http://192.168.x.x:5174` matches when Vite hops ports.
 */
const privateLanDev =
  /^https?:\/\/((10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(192\.168\.\d{1,3}\.\d{1,3})|(172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}))(?::\d+)?$/;

function devOriginAllowed(origin: string): boolean {
  return localhostDev.test(origin) || privateLanDev.test(origin);
}

/**
 * Production: locked to `CORS_ORIGIN`.
 * Non-production: `CORS_ORIGIN` plus localhost / LAN IPs so Vite (`--host`) works from other devices.
 */
export function dynamicHttpCorsOrigin(): CorsOptions['origin'] {
  if (env.NODE_ENV === 'production') return env.CORS_ORIGIN;
  const primary = env.CORS_ORIGIN;
  return (origin, cb) => {
    if (!origin) {
      cb(null, true);
      return;
    }
    if (origin === primary || devOriginAllowed(origin)) {
      cb(null, true);
      return;
    }
    cb(null, false);
  };
}

/** Same rules as Express CORS for Socket.IO */
export function dynamicSocketIoCorsOrigin(): string | boolean | RegExp | (string | RegExp)[] {
  if (env.NODE_ENV === 'production') return env.CORS_ORIGIN;
  return [localhostDev, privateLanDev];
}
