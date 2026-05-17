import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../utils/httpError.js';
import { verifyAccessToken } from '../utils/verifyTokens.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const [kind, token] = header.split(' ');
  if (kind !== 'Bearer' || !token) {
    next(new UnauthorizedError());
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      role: payload.role,
    };
    next();
  } catch {
    next(new UnauthorizedError('UNAUTHORIZED', 'جلسة منتهية', 'Session expired.'));
  }
}
