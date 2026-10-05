import { describe, expect, it } from 'vitest';
import { isAllowedOrigin, originAllowList, requiresOriginCheck, resolveRequestOrigin } from './security/origin.js';

describe('origin checks', () => {
  const env = {
    WEB_URL: 'http://127.0.0.1:3000',
    ADMIN_URL: 'http://127.0.0.1:3001',
    API_URL: 'http://127.0.0.1:4000',
    CORS_ORIGINS: 'http://127.0.0.1:3000',
  };

  it('builds an allow list from app URLs', () => {
    expect(originAllowList(env)).toContain('http://127.0.0.1:3001');
  });

  it('reads Origin then Referer', () => {
    const headers = new Headers({ referer: 'http://127.0.0.1:3001/users' });
    expect(resolveRequestOrigin(headers)).toBe('http://127.0.0.1:3001');
    expect(isAllowedOrigin(resolveRequestOrigin(headers), originAllowList(env))).toBe(true);
  });

  it('requires origin on mutations', () => {
    expect(requiresOriginCheck('POST')).toBe(true);
    expect(requiresOriginCheck('GET')).toBe(false);
  });
});
