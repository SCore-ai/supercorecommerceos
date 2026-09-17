import { closeRedis, createLogger, getEnv, loadEnvFiles } from '@supercore/core';
import { createSystemWorker } from './queue.js';

loadEnvFiles();
getEnv();
const logger = createLogger('worker');

const worker = createSystemWorker();

worker.on('ready', () => {
  logger.info('Worker ready');
});

worker.on('failed', (job, error) => {
  logger.error({ err: error, jobId: job?.id }, 'Job failed');
});

async function shutdown(): Promise<void> {
  logger.info('Worker shutting down');
  await worker.close();
  await closeRedis();
}

process.on('SIGINT', () => {
  void shutdown().then(() => process.exit(0));
});
process.on('SIGTERM', () => {
  void shutdown().then(() => process.exit(0));
});
