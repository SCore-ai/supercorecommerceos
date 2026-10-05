import { describe, expect, it } from 'vitest';
import { assertPasswordPolicy, hashPassword, verifyPassword } from './password.js';
import { ValidationError } from '@supercore/core';

describe('password hashing', () => {
  it('rejects short passwords', () => {
    expect(() => assertPasswordPolicy('short')).toThrow(ValidationError);
  });

  it('hashes with scrypt and verifies', async () => {
    const hash = await hashPassword('correct-horse-battery');
    expect(hash.includes('.')).toBe(true);
    expect(await verifyPassword('correct-horse-battery', hash)).toBe(true);
    expect(await verifyPassword('wrong-password-xx', hash)).toBe(false);
  });
});
