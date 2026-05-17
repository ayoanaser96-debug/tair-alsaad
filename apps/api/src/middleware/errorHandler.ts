import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env.js';
import { HTTP } from '../constants.js';
import { rootLogger } from './requestLogger.js';
import { sendFail } from '../utils/apiResponse.js';
import { HttpError } from '../utils/httpError.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const log = req.logger ?? rootLogger;

  if (err instanceof HttpError) {
    sendFail(res, err.status, {
      code: err.code,
      message: err.messageAr,
      messageEn: err.messageEn,
    });
    return;
  }
  if (err instanceof ZodError) {
    const msgEn = err.issues.map((i) => i.path.join('.') || 'field').join(', ');
    sendFail(res, HTTP.BAD_REQUEST, {
      code: 'VALIDATION_FAILED',
      message: 'خطأ تحقق',
      messageEn: msgEn,
    });
    return;
  }
  if (err instanceof Error && err.message === 'invalid_token_type') {
    sendFail(res, HTTP.BAD_REQUEST, {
      code: 'VALIDATION_FAILED',
      message: 'رمز غير صالح',
      messageEn: 'Invalid token.',
    });
    return;
  }
  log.error({ err }, 'Unhandled error');
  if (env.NODE_ENV === 'production') {
    sendFail(res, HTTP.SERVER_ERROR, {
      code: 'UNKNOWN',
      message: 'خطأ غير متوقع',
      messageEn: 'Unexpected server error.',
    });
    return;
  }
  if (err instanceof Error) {
    sendFail(res, HTTP.SERVER_ERROR, {
      code: 'UNKNOWN',
      message: err.message,
      messageEn: err.message,
    });
    return;
  }
  sendFail(res, HTTP.SERVER_ERROR, {
    code: 'UNKNOWN',
    message: 'خطأ غير متوقع',
    messageEn: 'Unexpected server error.',
  });
}
