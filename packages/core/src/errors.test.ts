import { describe, expect, it } from 'vitest';
import { AppError, ValidationError } from './errors.js';

describe('error model', () => {
  it('exposes validation errors to clients', () => {
    const error = new ValidationError('Invalid payload', { correlationId: 'corr-1' });
    expect(error.status).toBe(400);
    expect(error.toPublicJSON().error.message).toBe('Invalid payload');
    expect(error.toPublicJSON().error.correlationId).toBe('corr-1');
  });

  it('hides infrastructure details in production-facing payloads', () => {
    const error = new AppError('INFRASTRUCTURE_ERROR', 'ECONNREFUSED postgres://secret', {
      status: 503,
      expose: false,
    });
    expect(error.toPublicJSON('corr-2').error.message).toBe('An unexpected error occurred');
    expect(error.toPublicJSON('corr-2').error.correlationId).toBe('corr-2');
  });
});
