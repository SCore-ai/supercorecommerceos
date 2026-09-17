import { describe, expect, it } from 'vitest';
import { isInternalId } from '@supercore/core';
import { createDomainEvent } from './event.js';

describe('domain event foundation', () => {
  it('creates traceable event metadata', () => {
    const event = createDomainEvent({
      eventName: 'system.health.checked',
      tenantId: 'tenant-1',
      aggregateId: 'agg-1',
      correlationId: 'corr-1',
      payload: { ok: true },
    });

    expect(isInternalId(event.eventId)).toBe(true);
    expect(event.eventName).toBe('system.health.checked');
    expect(event.tenantId).toBe('tenant-1');
    expect(event.aggregateId).toBe('agg-1');
    expect(event.correlationId).toBe('corr-1');
    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.payload).toEqual({ ok: true });
  });
});
