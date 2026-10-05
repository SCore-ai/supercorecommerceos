import { describe, expect, it } from 'vitest';
import { signBody, verifySignature } from './hmac.js';

describe('webhook HMAC', () => {
  it('accepts a matching hex digest and rejects a truncated one', () => {
    const secret = 'test-secret';
    const body = '{"toState":"PaymentSettled"}';
    const sig = signBody(secret, body);
    expect(verifySignature(secret, body, sig)).toBe(true);
    expect(verifySignature(secret, body, sig.slice(0, 8))).toBe(false);
    expect(verifySignature(secret, body, undefined)).toBe(false);
  });
});
