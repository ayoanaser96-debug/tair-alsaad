/**
 * Copies `.env.example` → `.env` when `.env` is missing (never overwrites).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, '.env');
const template = path.join(root, '.env.example');

if (fs.existsSync(target)) {
  process.stdout.write('dev-setup: .env already exists, leaving it unchanged.\n');
  process.exit(0);
}

if (!fs.existsSync(template)) {
  process.stderr.write('dev-setup: missing .env.example\n');
  process.exit(1);
}

fs.copyFileSync(template, target);
process.stdout.write('dev-setup: created .env from .env.example (edit secrets if needed).\n');
