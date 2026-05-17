import { HTTP } from '../constants.js';

export class HttpError extends Error {
  readonly status: number;

  readonly code: string;

  readonly messageAr: string;

  readonly messageEn: string;

  constructor(
    status: number,
    code: string,
    messageAr: string,
    messageEn: string,
  ) {
    super(messageEn);
    this.status = status;
    this.code = code;
    this.messageAr = messageAr;
    this.messageEn = messageEn;
  }
}

export class NotFoundError extends HttpError {
  constructor(code = 'NOT_FOUND', msgAr = 'غير موجود', msgEn = 'Not found.') {
    super(HTTP.NOT_FOUND, code, msgAr, msgEn);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(code = 'UNAUTHORIZED', msgAr = 'غير مصرح', msgEn = 'Unauthorized.') {
    super(HTTP.UNAUTHORIZED, code, msgAr, msgEn);
  }
}

export class ForbiddenError extends HttpError {
  constructor(code = 'FORBIDDEN', msgAr = 'ممنوع', msgEn = 'Forbidden.') {
    super(HTTP.FORBIDDEN, code, msgAr, msgEn);
  }
}

export class ConflictError extends HttpError {
  constructor(code: string, msgAr: string, msgEn: string) {
    super(HTTP.CONFLICT, code, msgAr, msgEn);
  }
}

export class ValidationError extends HttpError {
  constructor(msgAr = 'خطأ تحقق', msgEn = 'Validation failed.') {
    super(HTTP.BAD_REQUEST, 'VALIDATION_FAILED', msgAr, msgEn);
  }
}
