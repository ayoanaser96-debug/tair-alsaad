import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

import type { AccessTokenPayload, RefreshTokenPayload } from './signTokens.js';

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  if (payload.typ !== 'access') throw new Error('invalid_token_type');
  return payload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  if (payload.typ !== 'refresh') throw new Error('invalid_token_type');
  return payload;
}
