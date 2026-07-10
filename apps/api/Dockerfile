# Production image for @tayralsaad/api.
# Build from the REPO ROOT so the pnpm workspace + lockfile are in context:
#   docker build -f apps/api/Dockerfile -t tayralsaad-api .
#   docker run -p 4000:4000 --env-file .env tayralsaad-api

# ---- Builder: install workspace, bundle the API ----
FROM node:20-alpine AS builder
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @tayralsaad/api build
# Produce a pruned, self-contained deployment (flattened prod node_modules).
RUN pnpm --filter @tayralsaad/api deploy --prod --legacy /app

# ---- Runner: minimal runtime ----
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /repo/apps/api/dist ./dist

USER nodejs
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-4000}/health" >/dev/null 2>&1 || exit 1

CMD ["node", "dist/server.js"]
