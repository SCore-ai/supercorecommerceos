import { describe, expect, it } from 'vitest';
import { assertNotJsNumber, parseMoney, serializeMoney } from './decimal.js';
import { ValidationError } from './errors.js';

describe('decimal money strategy', () => {
  it('parses and serializes decimal strings', () => {
    const amount = parseMoney('19.9900');
    expect(serializeMoney(amount)).toBe('19.9900');
  });

  it('rejects javascript numbers', () => {
    expect(() => assertNotJsNumber(19.99)).toThrow(ValidationError);
  });
});
