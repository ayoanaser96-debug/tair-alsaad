import type { Role } from '@tayralsaad/types';
import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../utils/httpError.js';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new ForbiddenError());
      return;
    }
    if (!roles.includes(req.auth.role)) {
      next(new ForbiddenError('FORBIDDEN', 'غير مسموح لهذا الدور', 'Insufficient role.'));
      return;
    }
    next();
  };
}
