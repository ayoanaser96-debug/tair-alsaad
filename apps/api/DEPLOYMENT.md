# Deploying `@tayralsaad/api`

Production deployment guide for the Express + MongoDB API. The web and mobile
apps are hosted separately and call this API over the public internet.

## Runtime

- **Node:** `>= 20.9.0` (pinned via `engines` and `.nvmrc`). The build produces a
  plain-JS bundle, so any Node 20+ works — no TypeScript loader required at runtime.
- **Process:** single HTTP server + optional BullMQ worker (in-process).

## Required environment variables

See [`.env.example`](./.env.example) for the full annotated list. Minimum for a
production boot:

| Var | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | yes | Set to `production`. |
| `PORT` | recommended | Host usually injects it; falls back to `4000`. |
| `HOST` | no | Defaults to `0.0.0.0` (correct for containers/hosts). |
| `MONGODB_URI` | **yes** | Full connection string. Whitelist platform egress IPs in Atlas. |
| `JWT_ACCESS_SECRET` | **yes** | ≥32 chars, strong, unique. Boot refuses placeholders in prod. |
| `JWT_REFRESH_SECRET` | **yes** | ≥32 chars, must differ from access secret. |
| `CORS_ORIGIN` | **yes** | Comma-separated browser origins (web + admin), no trailing slash. |
| `WEB_PUBLIC_URL` | recommended | Public web app URL for link building. |
| `REDIS_URL` | optional | Enables the notification queue/worker. Omitted = queues off. |
| `PUBLIC_API_URL` | optional | Absolute base URL of this API (for upload links). |
| `WHATSAPP_*`, `META_APP_SECRET` | optional | WhatsApp Cloud notifications + webhook verify. |

The app **validates env at boot** and exits with a clear, itemized error if
anything required is missing or a placeholder secret is used in production.

## Build & start (from the API package)

```bash
pnpm install --frozen-lockfile
pnpm build      # bundles src -> dist/server.js (tsup, workspace deps inlined)
pnpm start      # node dist/server.js  (no nodemon/tsx in prod)
```

## Build & start (monorepo root — what a host should run)

The API lives in a pnpm workspace. From the repo root:

```bash
pnpm install --frozen-lockfile
pnpm --filter @tayralsaad/api build
pnpm --filter @tayralsaad/api start
```

## Health check

- Path: `GET /health`
- Returns `200 {"ok":true,"db":"up",...}` when MongoDB is connected.
- Returns `503 {"ok":false,"db":"down",...}` when it is not.

Point the platform's liveness/readiness probe at `/health`.

## Docker (optional, recommended)

A production multi-stage image is provided at [`Dockerfile`](./Dockerfile). Build
from the **repo root** (the pnpm workspace must be in context):

```bash
docker build -f apps/api/Dockerfile -t tayralsaad-api .
docker run -p 4000:4000 --env-file .env tayralsaad-api
```

The image runs as a non-root user, includes a `HEALTHCHECK`, and ships only the
bundled `dist` + pruned production `node_modules`.

## Graceful shutdown

On `SIGTERM`/`SIGINT` (sent by hosts on redeploy) the server stops accepting
connections, drains, closes MongoDB and Redis, then exits (10s force-exit guard).

## Security posture

- `helmet` security headers, `x-powered-by` disabled.
- CORS locked to `CORS_ORIGIN` allow-list in production (no `*`).
- Rate limiting: global per-IP, plus stricter per-IP + per-phone limits on OTP
  request/verify.
- All request bodies/queries validated with zod; JWTs verified with expiry;
  malformed tokens → 401.
- OTP codes expire, are single-use, capped at 5 verify attempts, and never
  returned or logged in production. Logs redact auth headers, tokens, and OTPs.

## Scaling note (OTP store)

OTP codes are held **in-process** (`Map`). This is correct for a **single API
instance**. To run multiple replicas, move the OTP store to Redis (same
expiry/single-use/attempt semantics) or pin the deployment to one instance.

## File uploads (ephemeral filesystem warning)

`POST /api/v1/uploads` writes to local disk (`var/uploads`). Container/host
filesystems are **ephemeral** — uploaded files are lost on redeploy/restart and
are not shared across replicas. Before relying on uploads in production, switch
to object storage (Cloudinary/S3) and return the provider URL. The API logs a
warning on boot in production as a reminder.
