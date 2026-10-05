import { afterEach, describe, expect, it } from 'vitest';
import { resetEnvCache } from '@supercore/core';

function installTestEnv(): void {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgres://supercore:supercore@127.0.0.1:5432/supercore_test';
  process.env.REDIS_URL = 'redis://127.0.0.1:6379';
  process.env.API_URL = 'http://127.0.0.1:4000';
  process.env.WEB_URL = 'http://127.0.0.1:3000';
  process.env.ADMIN_URL = 'http://127.0.0.1:3001';
  process.env.AUTH_DEV_BYPASS = 'false';
  resetEnvCache();
}

describe('API health endpoints', () => {
  afterEach(() => {
    resetEnvCache();
  });

  it('returns health without secrets', async () => {
    installTestEnv();
    const { createApp } = await import('./app.js');
    const app = createApp();
    const response = await app.request('/health');
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string; service: string };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('api');
    const text = JSON.stringify(body);
    expect(text).not.toMatch(/postgres:\/\//);
    expect(text).not.toMatch(/REDIS_URL/);
  });

  it('returns liveness', async () => {
    installTestEnv();
    const { createApp } = await import('./app.js');
    const app = createApp();
    const response = await app.request('/live');
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string };
    expect(body.status).toBe('alive');
  });

  it('rejects client-supplied tenant IDs', async () => {
    installTestEnv();
    const { createApp } = await import('./app.js');
    const app = createApp();
    const response = await app.request('/health?tenantId=evil');
    expect(response.status).toBe(403);
  });

  it('answers the GraphQL health query', async () => {
    installTestEnv();
    const { createApp } = await import('./app.js');
    const app = createApp();
    const response = await app.request('/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ health { status service } }' }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      data: { health: { status: string; service: string } };
    };
    expect(body.data.health.status).toBe('ok');
    expect(body.data.health.service).toBe('api');
  });

  it('requires authentication for GraphQL me', async () => {
    installTestEnv();
    const { createApp } = await import('./app.js');
    const app = createApp();
    const response = await app.request('/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ me { email } }' }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { errors?: Array<{ message: string }> };
    expect(body.errors?.[0]?.message).toMatch(/Authentication required/i);
  });
});
