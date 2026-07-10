# Production API image for Back4app / container hosts.
# Build context must be the repo root (pnpm workspace).
# Prefer this over `npx tsx` at runtime — bundles dist/server.js + pruned deps.

FROM node:20-alpine AS builder
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @tayralsaad/api build
RUN pnpm --filter @tayralsaad/api deploy --prod --legacy /app

FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /repo/apps/api/dist ./dist

RUN mkdir -p /app/var/uploads && chown -R nodejs:nodejs /app/var
USER nodejs
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=5 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-4000}/health" >/dev/null 2>&1 || exit 1

CMD ["node", "dist/server.js"]
