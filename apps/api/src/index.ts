import { serve } from '@hono/node-server';
import { closeDatabase, closeRedis, createLogger, getEnv, loadEnvFiles } from '@supercore/core';
import { createApp } from './app.js';

loadEnvFiles();
const env = getEnv();
const logger = createLogger('api');
const app = createApp();

const server = serve({
  fetch: app.fetch,
  port: env.API_PORT,
  hostname: '127.0.0.1',
});

logger.info({ port: env.API_PORT }, 'API listening');

async function shutdown(): Promise<void> {
  logger.info('API shutting down');
  server.close();
  await closeDatabase();
  await closeRedis();
}

process.on('SIGINT', () => {
  void shutdown().then(() => process.exit(0));
});
process.on('SIGTERM', () => {
  void shutdown().then(() => process.exit(0));
});
