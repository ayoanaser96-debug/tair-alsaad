import http from 'node:http';

import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { getRedis } from './config/redis.js';
import { rootLogger } from './middleware/requestLogger.js';
import { attachSocket } from './sockets/io.js';
import { startNotificationWorker } from './workers/notifications.worker.js';

async function bootstrap() {
  await connectDb(rootLogger);
  void getRedis(rootLogger);

  void startNotificationWorker(rootLogger);

  const server = http.createServer(createApp());
  attachSocket(server);

  server.listen(env.PORT, () => {
    rootLogger.info(`[api] http://localhost:${env.PORT}`);
  });

  server.on('error', (err) => {
    rootLogger.error({ err }, 'HTTP server fatal');
    process.exit(1);
  });
}

bootstrap().catch((err: unknown) => {
  rootLogger.error({ err }, 'bootstrap failed');
  const text = `${err instanceof Error ? err.message : ''} ${String(err)}`;
  if (/Mongo|27017|Mongoose|ECONNREFUSED|ENOTFOUND/i.test(text)) {
    process.stderr.write(
      [
        '',
        '[api] ── MongoDB / database ─────────────────────────────────────',
        '[api] The API exited because it could not use MONGODB_URI from .env.',
        '[api] • Prefer: mongodb://127.0.0.1:27017/your-db  (avoid "localhost" on Windows IPv6 quirks)',
        '[api] • Start Mongo: install Docker Desktop, then `pnpm services` OR install MongoDB Community',
        '[api] • Port conflict: pick another host port (e.g. 27018) and match MONGODB_URI',
        '[api] See README section “MongoDB & port 27017”.',
        '',
      ].join('\n'),
    );
  }
  process.exit(1);
});
