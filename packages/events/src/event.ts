import { createInternalId } from '@supercore/core';

export type DomainEvent<TPayload = Record<string, never>> = {
  eventId: string;
  eventName: string;
  occurredAt: Date;
  tenantId: string;
  aggregateId: string;
  correlationId: string;
  payload: TPayload;
};

export function createDomainEvent<TPayload>(input: {
  eventName: string;
  tenantId: string;
  aggregateId: string;
  correlationId: string;
  payload: TPayload;
  occurredAt?: Date;
}): DomainEvent<TPayload> {
  return {
    eventId: createInternalId(),
    eventName: input.eventName,
    occurredAt: input.occurredAt ?? new Date(),
    tenantId: input.tenantId,
    aggregateId: input.aggregateId,
    correlationId: input.correlationId,
    payload: input.payload,
  };
}
