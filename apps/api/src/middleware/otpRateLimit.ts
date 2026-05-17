import type { NextFunction, Request, Response } from 'express';

import { normalizePhone } from '@tayralsaad/utils';

import { env } from '../config/env.js';
import { HTTP } from '../constants.js';
import { sendFail } from '../utils/apiResponse.js';

const hits = new Map<string, number[]>();

function prune(list: number[], windowMs: number, now: number) {
  return list.filter((t) => now - t <= windowMs);
}

export function otpPhoneRateLimiter() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Keep local QA friction-free (new users can retry quickly).
    if (env.NODE_ENV !== 'production') {
      next();
      return;
    }
    const raw = typeof req.body?.phone === 'string' ? req.body.phone : '';
    if (!raw) {
      next();
      return;
    }
    const phone = normalizePhone(raw);
    const now = Date.now();
    let timestamps = hits.get(phone) ?? [];
    timestamps = prune(timestamps, 3600 * 1000, now);
    const lastMinuteCount = prune(timestamps, 60 * 1000, now).length;
    const lastHourCount = prune(timestamps, 3600 * 1000, now).length;
    if (lastMinuteCount >= 1 || lastHourCount >= 5) {
      sendFail(res, HTTP.TOO_MANY_REQUESTS, {
        code: 'RATE_LIMITED',
        message: 'محاولات كثيرة لهذا الرقم',
        messageEn: 'Too many OTP requests for this number.',
      });
      return;
    }
    timestamps.push(now);
    hits.set(phone, timestamps);
    next();
  };
}
