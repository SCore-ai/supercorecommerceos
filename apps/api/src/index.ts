import { serve } from '@hono/node-server';
import { closeDatabase, closeRedis, createLogger, getEnv, loadEnvFiles } from '@supercore/core';
import { bootstrapSuperAdmin } from '@supercore/identity';
import { createApp } from './app.js';

loadEnvFiles();
const env = getEnv();
const logger = createLogger('api');

if (env.BOOTSTRAP_SUPERADMIN_EMAIL && env.BOOTSTRAP_SUPERADMIN_PASSWORD) {
  await bootstrapSuperAdmin(env.BOOTSTRAP_SUPERADMIN_EMAIL, env.BOOTSTRAP_SUPERADMIN_PASSWORD);
  logger.info('Bootstrap super admin ensured');
}

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
