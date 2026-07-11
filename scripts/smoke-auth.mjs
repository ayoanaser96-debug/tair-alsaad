/**
 * Smoke test: auth + role + shipment endpoints.
 * Usage: node scripts/smoke-auth.mjs
 * Requires API running on PORT from repo .env (default 4000).
 */

import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnv({ path: path.join(root, '.env') });

const BASE = `http://127.0.0.1:${process.env.PORT ?? 4000}/api/v1`;

async function post(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

function assert(label, ok, detail = '') {
  const mark = ok ? 'PASS' : 'FAIL';
  process.stdout.write(`${mark} ${label}${detail ? ` — ${detail}` : ''}\n`);
  if (!ok) process.exitCode = 1;
}

async function loginWithOtp(phone) {
  const req = await post('/auth/otp/request', { phone });
  const code = req.json?.data?.devCode;
  assert(`OTP request ${phone}`, req.status === 200 && Boolean(code), `status=${req.status}`);
  if (!code) return null;
  const ver = await post('/auth/otp/verify', { phone, code });
  assert(`OTP verify ${phone}`, ver.status === 200 && ver.json?.ok, `status=${ver.status}`);
  return ver.json?.data ?? null;
}

async function main() {
  process.stdout.write(`Smoke test → ${BASE}\n\n`);

  const sender = await loginWithOtp('+964771111101');
  const driver = await loginWithOtp('+964772222201');
  const admin = await loginWithOtp('+964779000099');

  if (sender?.accessToken) {
    const mine = await get('/shipments/mine?page=1&limit=5', sender.accessToken);
    assert('GET /shipments/mine (sender)', mine.status === 200 && mine.json?.ok);
    const items = mine.json?.data?.items ?? [];
    if (items[0]) {
      const id = items[0]._id ?? items[0].id;
      const detail = await get(`/shipments/${id}`, sender.accessToken);
      assert('GET /shipments/:id (sender)', detail.status === 200 && detail.json?.ok);
    }
  }

  if (driver?.accessToken) {
    const me = await get('/driver/me', driver.accessToken);
    assert('GET /driver/me (driver)', me.status === 200 && me.json?.ok);
    const feed = await get('/shipments/feed?lat=33.3&lng=44.4&radius=50', driver.accessToken);
    assert('GET /shipments/feed (driver)', feed.status === 200 && feed.json?.ok);
  }

  if (admin?.accessToken) {
    const overview = await get('/admin/overview', admin.accessToken);
    assert('GET /admin/overview (admin)', overview.status === 200 && overview.json?.ok);
    const users = await get('/admin/users?page=1', admin.accessToken);
    assert('GET /admin/users (admin)', users.status === 200 && users.json?.ok);
  }

  // Receiver incoming uses sender phone on a shipment — test with sender token on incoming (should work if phone matches receiver)
  if (sender?.accessToken) {
    const incoming = await get('/shipments/incoming?page=1&limit=5', sender.accessToken);
    assert('GET /shipments/incoming', incoming.status === 200 && incoming.json?.ok);
    const first = incoming.json?.data?.items?.[0];
    if (first) {
      const hasSenderPhone = Boolean(first.senderPhone);
      assert('incoming enrichment senderPhone', hasSenderPhone, hasSenderPhone ? '' : 'field missing');
    }
  }

  const trackCode = 'TS-000001';
  const pub = await get(`/track/${trackCode}`);
  assert(`GET /track/${trackCode} (public)`, pub.status === 200 || pub.status === 404);

  process.stdout.write('\nDone.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
