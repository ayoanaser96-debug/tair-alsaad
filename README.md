# Tayr Al-Saad — local development

Prerequisites: **Node 20+**, [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended for Mongo + Redis).

This repo expects **pnpm 9.14.x** (see `packageManager` in root `package.json`). If `pnpm` is **not recognized** in PowerShell, use one of the options below—**do not skip this**, or the quick start will fail.

### Use pnpm (pick one)

**A — Corepack (recommended if it works on your machine)**

```powershell
corepack enable
corepack prepare pnpm@9.14.4 --activate
pnpm -v
```

**B — No global install: call pnpm through npx (works when `pnpm` is missing)**

Use this form for every command (same as `pnpm …`):

```powershell
npx --yes pnpm@9.14.4 install
npx --yes pnpm@9.14.4 run setup
npx --yes pnpm@9.14.4 run services
npx --yes pnpm@9.14.4 run dev
# optional:
npx --yes pnpm@9.14.4 run db:seed
```

After **A**, you can shorten the above to `pnpm install`, `pnpm run setup`, etc.

---

### Quick start (after pnpm works, or substitute `pnpm` → `npx --yes pnpm@9.14.4` as in option B)

```bash
pnpm install
pnpm setup               # copies .env.example → .env if .env does not exist
pnpm services             # Mongo + Redis (Docker)
pnpm dev
pnpm db:seed              # optional demo data
```

### Run dependencies (Mongo + Redis)

```bash
pnpm services            # docker compose up -d
pnpm services:stop       # docker compose down
```

If you omit Redis locally, comment out `REDIS_URL` in `.env`; the API runs without queues.

### MongoDB & port 27017

Symptoms: API exits immediately or login shows **API unreachable**; logs mention **ECONNREFUSED**, **27017**, or **Mongoose**.

1. **Use `127.0.0.1` in `MONGODB_URI`** (already in `.env.example`). On Windows, **`mongodb://localhost:...`** can target **IPv6** (`::1`) while Mongo listens on **IPv4 only**, so the driver never connects—prefer **`mongodb://127.0.0.1:27017/tayralsaad`** in `.env`.

2. **Something must actually listen on that port:**
   - **Docker:** Docker Desktop installed, running, and `docker` on your PATH → then **`pnpm services`** (or **`npx … pnpm@9.14.4 run services`**). If **`docker`** is “not recognized”, Mongo never starts via compose.
   - **Local install:** [MongoDB Community Server](https://www.mongodb.com/try/download/community) on Windows — ensure **`mongod`** is running as a service and bound to **`127.0.0.1:27017`**.

3. **Port already in use / conflict:** From the repo root, try **`pnpm free:27017`** (or **`npx --yes pnpm@9.14.4 run free:27017`**) to stop the Windows process listening on **27017**. If that reports “nothing listening”, the conflict may be inside WSL/Docker only—use **`pnpm services:stop`** then **`pnpm services`**, or change the published port (see **`docker-compose.yml`**) and **`MONGODB_URI`**. As a last resort, stop the stray instance in **Services** (e.g. older **MongoDB**) or **Task Manager**.

4. **Cloud option:** Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier), put the **`mongodb+srv://…`** URI in **`MONGODB_URI`**.

The API waits up to ~12s for Mongo, then exits with a short hint on **`stderr`** if the connection fails.

### Run the stack

```bash
pnpm dev
```

- Web: **http://localhost:5173** by default (`apps/web`). If that port is in use, Vite picks **5174, 5175, …**; in **development only** the API allows any **`http(s)://localhost:*`** origin so browser calls still work.
- API: http://localhost:4000 (`MONGODB_URI` and JWT secrets in `.env`)

### Port 5173 stuck (Windows)

**Do not kill PID 0 — that is the Idle session; `Stop-Process` will fail with “Access is denied”.**

Safely stop whatever is listening on **5173** (skips bogus / system PIDs):

```powershell
# from repo root
pnpm run free:5173

# without global pnpm:
npx --yes pnpm@9.14.4 run free:5173

# or run the script directly:
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\free-port.ps1 5173
```

### Mobile app

```bash
npx --yes pnpm@9.14.4 --filter @tayralsaad/mobile run start
```

(Or `pnpm --filter @tayralsaad/mobile run start` if `pnpm` is on your PATH.)

After the API is up, ensure `EXPO_PUBLIC_API_URL` in the Expo config points at that API.
