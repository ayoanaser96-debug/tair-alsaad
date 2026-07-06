import { env } from '../config/env.js';

import type { Logger } from 'pino';

import { otpGenerator } from '../utils/otpGenerator.js';

type PendingOtp = { code: string; expiresAt: number; attempts: number };
type OtpIssueResult = { expiresIn: number; devCode?: string };

/** Max wrong guesses before a code is burned (brute-force protection). */
const MAX_VERIFY_ATTEMPTS = 5;

/**
 * In-memory OTP store. NOTE: this is per-process — it is only correct for a
 * single API instance. For horizontal scaling move this to Redis with the same
 * expiry/single-use/attempt semantics (see DEPLOYMENT.md).
 */
const pending = new Map<string, PendingOtp>();

export function requestOtp(phone: string, logger?: Logger): OtpIssueResult {
  const code = otpGenerator();
  const ttlMs = env.NODE_ENV === 'production' ? 60_000 : 5 * 60_000;
  pending.set(phone, { code, expiresAt: Date.now() + ttlMs, attempts: 0 });

  // Never log the code in production; the dev stub log helps local QA only.
  if (env.NODE_ENV === 'production') {
    logger?.info({ phone }, '[otp] code issued');
  } else if (logger) {
    logger.info({ phone, code }, '[otp][dev] stub');
  }

  const expiresIn = Math.floor(ttlMs / 1000);
  if (env.NODE_ENV !== 'production') {
    return { expiresIn, devCode: code };
  }
  return { expiresIn };
}

export function consumeOtp(phone: string, code: string): boolean {
  const entry = pending.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    pending.delete(phone);
    return false;
  }
  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    pending.delete(phone);
    return false;
  }
  if (entry.code !== code) {
    entry.attempts += 1;
    if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
      pending.delete(phone);
    }
    return false;
  }
  pending.delete(phone);
  return true;
}
