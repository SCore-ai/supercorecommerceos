import { QueueEvents } from 'bullmq';
import { afterAll, describe, expect, it } from 'vitest';
import { closeRedis, getEnv, loadEnvFiles, resetEnvCache } from '@supercore/core';
import { SYSTEM_HEALTH_JOB, SYSTEM_HEALTH_QUEUE } from './jobs.js';
import { createSystemQueue, createSystemWorker } from './queue.js';

const integrationEnabled = process.env.RUN_INTEGRATION === '1';

describe.skipIf(!integrationEnabled)('worker system.health.check', () => {
  afterAll(async () => {
    await closeRedis();
  });

  it('processes the infrastructure health job', async () => {
    loadEnvFiles();
    process.env.NODE_ENV ??= 'test';
    resetEnvCache();
    getEnv();

    const queue = createSystemQueue();
    const worker = createSystemWorker();
    const events = new QueueEvents(SYSTEM_HEALTH_QUEUE, { connection: worker.opts.connection });
    await worker.waitUntilReady();
    await events.waitUntilReady();

    const job = await queue.add(SYSTEM_HEALTH_JOB, { correlationId: 'test-job' });
    const result = await job.waitUntilFinished(events, 15_000);

    expect(result).toMatchObject({ ok: true });
    expect(result.eventId).toBeTruthy();

    await events.close();
    await worker.close();
    await queue.close();
  });
});
