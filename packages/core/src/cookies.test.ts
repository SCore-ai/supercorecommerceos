import { describe, expect, it } from 'vitest';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from './security/cookies.js';

describe('session cookie', () => {
  it('is httpOnly with a 12 hour maxAge', () => {
    const options = sessionCookieOptions('test');
    expect(SESSION_COOKIE_NAME).toBe('supercore_session');
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe('lax');
    expect(options.maxAge).toBe(12 * 60 * 60);
    expect(sessionCookieOptions('production').secure).toBe(true);
  });
});
