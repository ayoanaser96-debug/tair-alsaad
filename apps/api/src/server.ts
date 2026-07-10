import http from 'node:http';

import { createApp } from './app.js';
import { connectDb, disconnectDb } from './config/db.js';
import { env } from './config/env.js';
import { closeRedis, getRedis } from './config/redis.js';
import { rootLogger } from './middleware/requestLogger.js';
import { attachSocket } from './sockets/io.js';
import { startNotificationWorker } from './workers/notifications.worker.js';

async function bootstrap() {
  process.stderr.write(`[api] booting (NODE_ENV=${env.NODE_ENV}, HOST=${env.HOST}, PORT=${env.PORT})\n`);

  await connectDb(rootLogger);
  void getRedis(rootLogger);

  void startNotificationWorker(rootLogger);

  const server = http.createServer(createApp());
  attachSocket(server);

  server.listen(env.PORT, env.HOST, () => {
    rootLogger.info(`[api] listening on http://${env.HOST}:${env.PORT}`);
  });

  server.on('error', (err) => {
    rootLogger.error({ err }, 'HTTP server fatal');
    process.exit(1);
  });

  registerShutdown(server);
  registerProcessHandlers();
}

/** Close the HTTP server, Mongo, and Redis cleanly when the host sends SIGTERM/SIGINT. */
function registerShutdown(server: http.Server): void {
  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    rootLogger.info({ signal }, '[api] shutting down');

    const forceExit = setTimeout(() => {
      rootLogger.error('[api] forced exit after shutdown timeout');
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(async () => {
      try {
        await disconnectDb();
        await Promise.resolve(closeRedis());
      } catch (err) {
        rootLogger.error({ err }, '[api] error during shutdown');
      } finally {
        clearTimeout(forceExit);
        rootLogger.info('[api] shutdown complete');
        process.exit(0);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/** Never let an unhandled rejection/exception leave the process in a zombie state. */
function registerProcessHandlers(): void {
  process.on('unhandledRejection', (reason) => {
    rootLogger.error({ err: reason }, '[api] unhandledRejection — exiting');
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    rootLogger.error({ err }, '[api] uncaughtException — exiting');
    process.exit(1);
  });
}

bootstrap().catch((err: unknown) => {
  rootLogger.error({ err }, 'bootstrap failed');
  const text = `${err instanceof Error ? err.message : ''} ${String(err)}`;
  if (/Mongo|27017|Mongoose|ECONNREFUSED|ENOTFOUND|querySrv/i.test(text)) {
    process.stderr.write(
      [
        '',
        '[api] ── MongoDB / database ─────────────────────────────────────',
        '[api] The API exited because it could not connect using MONGODB_URI.',
        '[api] • Verify MONGODB_URI is reachable from this host and credentials are correct.',
        '[api] • For MongoDB Atlas, whitelist the deploy platform egress IPs (or 0.0.0.0/0).',
        '[api] • Locally prefer 127.0.0.1 over "localhost" to avoid Windows IPv6 quirks.',
        '',
      ].join('\n'),
    );
  }
  process.exit(1);
});
