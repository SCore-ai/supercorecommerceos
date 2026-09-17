import { describe, expect, it } from 'vitest';
import { createInternalId, isInternalId } from './ids.js';

describe('UUIDv7 identity', () => {
  it('creates a UUIDv7 internal id', () => {
    const id = createInternalId();
    expect(isInternalId(id)).toBe(true);
  });

  it('rejects non-v7 uuids', () => {
    expect(isInternalId('not-a-uuid')).toBe(false);
    expect(isInternalId('00000000-0000-4000-8000-000000000000')).toBe(false);
  });
});
