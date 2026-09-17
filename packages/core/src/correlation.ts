import { randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
  requestId: string;
  correlationId: string;
};

const storage = new AsyncLocalStorage<RequestContext>();

export function createRequestId(): string {
  return randomUUID();
}

export function runWithRequestContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

export function requireRequestContext(): RequestContext {
  const context = getRequestContext();
  if (!context) {
    throw new Error('Request context is not available');
  }
  return context;
}

export function resolveCorrelationIds(headers: {
  get(name: string): string | null;
}): RequestContext {
  const incomingRequestId = headers.get('x-request-id');
  const incomingCorrelationId = headers.get('x-correlation-id');
  const requestId = incomingRequestId && incomingRequestId.trim() !== '' ? incomingRequestId : createRequestId();
  const correlationId =
    incomingCorrelationId && incomingCorrelationId.trim() !== '' ? incomingCorrelationId : requestId;
  return { requestId, correlationId };
}
