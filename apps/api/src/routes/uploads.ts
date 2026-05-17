import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import express, { Router } from 'express';
import multer from 'multer';

import { env } from '../config/env.js';
import { authenticate } from '../middleware/authenticate.js';
import { sendOk } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ValidationError } from '../utils/httpError.js';

const UPLOAD_ROOT = path.join(process.cwd(), 'var', 'uploads');
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 6 * 1024 * 1024 } });

export function buildUploadRoutes(): Router {
  const router = Router();

  router.post(
    '/',
    authenticate,
    upload.single('file'),
    asyncHandler(async (req, res) => {
      if (!req.file?.filename) throw new ValidationError('استخدم ملفًا صالحًا', 'Invalid file.');
      const hostBase = env.PUBLIC_API_URL ?? `${req.protocol}://${req.get('host') ?? 'localhost'}`;
      const url = `${hostBase.replace(/\/$/, '')}${env.API_PREFIX}/uploads/public/${req.file.filename}`;
      sendOk(res, { url });
    }),
  );

  router.use('/public', express.static(UPLOAD_ROOT));
  return router;
}
