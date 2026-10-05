import { describe, expect, it } from 'vitest';
import { isTenantSlug, parseTenantSlug } from './slug.js';
import { ValidationError } from './errors.js';

describe('tenant slug', () => {
  it('accepts a valid slug', () => {
    expect(parseTenantSlug('Acme-Co')).toBe('acme-co');
    expect(isTenantSlug('gb-hq')).toBe(true);
  });

  it('rejects short or leading-hyphen slugs', () => {
    expect(() => parseTenantSlug('ab')).toThrow(ValidationError);
    expect(() => parseTenantSlug('-abc')).toThrow(ValidationError);
  });
});
