import { Queue, Worker, type Job } from 'bullmq';
import { createLogger, getRedis } from '@supercore/core';
import { createDomainEvent } from '@supercore/events';
import { SYSTEM_HEALTH_JOB, SYSTEM_HEALTH_QUEUE } from './jobs.js';

const logger = createLogger('worker');

export type SystemHealthJobData = {
  correlationId: string;
};

export type SystemHealthJobResult = {
  ok: true;
  checkedAt: string;
  eventId: string;
};

export function createSystemQueue(): Queue<SystemHealthJobData, SystemHealthJobResult> {
  return new Queue(SYSTEM_HEALTH_QUEUE, { connection: getRedis() });
}

export function createSystemWorker(): Worker<SystemHealthJobData, SystemHealthJobResult> {
  return new Worker(
    SYSTEM_HEALTH_QUEUE,
    async (job: Job<SystemHealthJobData>): Promise<SystemHealthJobResult> => {
      if (job.name !== SYSTEM_HEALTH_JOB) {
        throw new Error(`Unsupported job: ${job.name}`);
      }

      const event = createDomainEvent({
        eventName: SYSTEM_HEALTH_JOB,
        tenantId: 'internal',
        aggregateId: 'system',
        correlationId: job.data.correlationId,
        payload: { ok: true },
      });

      logger.info({ eventId: event.eventId, jobId: job.id }, 'system.health.check processed');
      return {
        ok: true,
        checkedAt: event.occurredAt.toISOString(),
        eventId: event.eventId,
      };
    },
    { connection: getRedis() },
  );
}
