import { afterAll, describe, expect, it } from 'vitest';
import {
  closeDatabase,
  closeRedis,
  getEnv,
  loadEnvFiles,
  pingDatabase,
  pingRedis,
  resetEnvCache,
} from './index.js';

const integrationEnabled = process.env.RUN_INTEGRATION === '1';

describe.skipIf(!integrationEnabled)('infrastructure connectivity', () => {
  afterAll(async () => {
    await closeDatabase();
    await closeRedis();
  });

  it('connects to PostgreSQL', async () => {
    loadEnvFiles();
    process.env.NODE_ENV ??= 'test';
    resetEnvCache();
    getEnv();
    await pingDatabase();
    expect(true).toBe(true);
  });

  it('connects to Redis', async () => {
    loadEnvFiles();
    process.env.NODE_ENV ??= 'test';
    resetEnvCache();
    getEnv();
    await pingRedis();
    expect(true).toBe(true);
  });
});
