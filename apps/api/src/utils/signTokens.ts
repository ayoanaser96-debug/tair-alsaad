import { createHash } from 'node:crypto';

import jwt from 'jsonwebtoken';

import type { PreferredLanguage, Role } from '@tayralsaad/types';

import { env } from '../config/env.js';

export type AccessTokenPayload = {
  sub: string;
  role: Role;
  prefs: PreferredLanguage;
  typ: 'access';
};

export type RefreshTokenPayload = {
  sub: string;
  fam: string;
  jti: string;
  typ: 'refresh';
};

export function hashRefreshJti(jti: string): string {
  const pepper = env.JWT_REFRESH_SECRET;
  return createHash('sha256').update(`${jti}:${pepper}`).digest('hex');
}

export function signAccessToken(input: Omit<AccessTokenPayload, 'typ'>): string {
  const payload: AccessTokenPayload = { ...input, typ: 'access' };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL_SECONDS });
}

export function signRefreshToken(input: Omit<RefreshTokenPayload, 'typ'>): string {
  const payload: RefreshTokenPayload = { ...input, typ: 'refresh' };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL_SECONDS });
}
