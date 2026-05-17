import { Worker } from 'bullmq';
import type { Logger } from 'pino';

import { env } from '../config/env.js';
import { redisDupForQueues } from '../config/redis.js';
import { notifyShipmentViaWhatsApp } from '../services/shipmentNotifications.js';

type NotifyJob =
  | { shipmentId?: string; trackingCode?: string; receiverPhone?: string }
  | Record<string, unknown>;

export function startNotificationWorker(logger: Logger): Worker<NotifyJob, void, string> | null {
  const connection = redisDupForQueues();
  if (!connection) {
    logger.info('[notifications.worker] skipping (no Redis)');
    return null;
  }

  const worker = new Worker<NotifyJob, void, string>(
    'notifications',
    async (job) => {
      const payload = job.data as {
        shipmentId?: string;
        trackingCode?: string;
        receiverPhone?: string;
      };
      logger.info({ name: job.name, ...payload }, '[notifications.worker] job');
      await notifyShipmentViaWhatsApp(env, {
        kind: job.name,
        trackingCode: payload.trackingCode,
        receiverPhone: payload.receiverPhone,
      });
    },
    {
      connection,
    },
  );

  worker.on('failed', (job, err) => {
    logger.warn({ jobId: job?.id, err }, '[notifications.worker] failed');
  });

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, '[notifications.worker] completed');
  });

  logger.info('[notifications.worker] started');
  return worker;
}
