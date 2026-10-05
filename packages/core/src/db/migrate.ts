import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { loadEnvFiles, getEnv } from '../env.js';
import { getDb, closeDatabase } from './client.js';
import { createLogger } from '../logger.js';
import { seedReferenceData } from './seed-reference.js';

const logger = createLogger('db-migrate');

async function runMigrations(): Promise<void> {
  loadEnvFiles();
  getEnv();
  const here = dirname(fileURLToPath(import.meta.url));
  const migrationsFolder = resolve(here, '../../drizzle');
  await migrate(getDb(), { migrationsFolder });
  await seedReferenceData();
}

try {
  await runMigrations();
  logger.info('Migrations complete');
  await closeDatabase();
} catch (error: unknown) {
  logger.error({ err: error }, 'Migration failed');
  await closeDatabase();
  process.exitCode = 1;
}
