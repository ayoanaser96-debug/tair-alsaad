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

/** Parse the comma-separated CORS_ORIGIN allow-list into normalized origins. */
export function corsAllowList(): string[] {
  return env.CORS_ORIGIN.split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/**
 * Production: locked to the CORS_ORIGIN allow-list (comma-separated web + admin domains).
 * Non-production: allow-list plus localhost / LAN IPs so Vite (`--host`) works from other devices.
 * Requests with no Origin header (native mobile app, curl, server-to-server) are always allowed.
 */
export function dynamicHttpCorsOrigin(): CorsOptions['origin'] {
  const allow = corsAllowList();
  const isProd = env.NODE_ENV === 'production';
  return (origin, cb) => {
    if (!origin) {
      cb(null, true);
      return;
    }
    const normalized = origin.replace(/\/$/, '');
    if (allow.includes(normalized) || (!isProd && devOriginAllowed(normalized))) {
      cb(null, true);
      return;
    }
    cb(null, false);
  };
}

/** Same rules as Express CORS for Socket.IO */
export function dynamicSocketIoCorsOrigin(): string | boolean | RegExp | (string | RegExp)[] {
  if (env.NODE_ENV === 'production') return corsAllowList();
  return [localhostDev, privateLanDev];
}
