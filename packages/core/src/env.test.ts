import { describe, expect, it } from 'vitest';
import { envSchema } from './env.js';

const validEnv = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgres://supercore:supercore@127.0.0.1:5432/supercore_test',
  REDIS_URL: 'redis://127.0.0.1:6379',
  API_URL: 'http://127.0.0.1:4000',
  WEB_URL: 'http://127.0.0.1:3000',
  ADMIN_URL: 'http://127.0.0.1:3001',
};

describe('environment validation', () => {
  it('accepts a complete environment', () => {
    const parsed = envSchema.parse(validEnv);
    expect(parsed.NODE_ENV).toBe('test');
    expect(parsed.AUTH_DEV_BYPASS).toBe(false);
  });

  it('rejects a missing database url', () => {
    const result = envSchema.safeParse({ ...validEnv, DATABASE_URL: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid API url', () => {
    const result = envSchema.safeParse({ ...validEnv, API_URL: 'not-a-url' });
    expect(result.success).toBe(false);
  });
});
