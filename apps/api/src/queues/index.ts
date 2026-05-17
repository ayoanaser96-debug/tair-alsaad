import { Queue } from 'bullmq';

import { redisDupForQueues } from '../config/redis.js';

const connection = redisDupForQueues();

export const notificationQueue = connection
  ? new Queue('notifications', { connection })
  : undefined;

export const payoutQueue = connection ? new Queue('payout', { connection }) : undefined;
