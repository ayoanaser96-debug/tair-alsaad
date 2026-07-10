# Production image for @tayralsaad/api.
# Build from the REPO ROOT so the pnpm workspace + lockfile are in context:
#   docker build -f apps/api/Dockerfile -t tayralsaad-api .
#   docker run -p 4000:4000 --env-file .env tayralsaad-api

FROM node:20-alpine AS builder
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.5.2 --activate
WORKDIR /repo

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @tayralsaad/api build
RUN test -f apps/api/dist/server.js
RUN pnpm --filter @tayralsaad/api deploy --prod /app

FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs \
  && apk add --no-cache wget

COPY --from=builder --chown=nodejs:nodejs /app ./
COPY --from=builder --chown=nodejs:nodejs /repo/apps/api/dist ./dist
RUN mkdir -p /app/var/uploads && chown -R nodejs:nodejs /app/var

USER nodejs
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=5 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-4000}/health" >/dev/null 2>&1 || exit 1

CMD ["node", "dist/server.js"]
