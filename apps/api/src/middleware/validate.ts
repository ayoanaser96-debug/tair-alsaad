import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';

import { HTTP } from '../constants.js';
import { sendFail } from '../utils/apiResponse.js';

type Segment = 'body' | 'query' | 'params';

function formatZod(err: ZodError): string {
  return err.issues.map((i) => i.path.join('.')).filter(Boolean).join(', ') || 'invalid';
}

export function validate<S extends ZodSchema>(segment: Segment, schema: S) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const raw = segment === 'body' ? req.body : segment === 'query' ? req.query : req.params;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const msgEn = formatZod(parsed.error);
      sendFail(res, HTTP.BAD_REQUEST, {
        code: 'VALIDATION_FAILED',
        message: 'خطأ تحقق',
        messageEn: msgEn,
      });
      return;
    }
    if (segment === 'body') {
      req.body = parsed.data;
    } else if (segment === 'query') {
      req.query = parsed.data as Request['query'];
    } else {
      req.params = parsed.data as Request['params'];
    }
    next();
  };
}
