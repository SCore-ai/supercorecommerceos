export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE_ERROR'
  | 'INTEGRATION_ERROR'
  | 'INFRASTRUCTURE_ERROR';

export type AppErrorOptions = {
  cause?: unknown;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  expose?: boolean;
  status?: number;
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly expose: boolean;
  readonly metadata?: Record<string, unknown>;
  readonly correlationId?: string;

  constructor(code: AppErrorCode, message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    this.code = code;
    this.status = options.status ?? 500;
    this.expose = options.expose ?? this.status < 500;
    this.metadata = options.metadata;
    this.correlationId = options.correlationId;
  }

  toPublicJSON(correlationId?: string) {
    return {
      error: {
        code: this.code,
        message: this.expose ? this.message : 'An unexpected error occurred',
        correlationId: correlationId ?? this.correlationId ?? null,
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super('VALIDATION_ERROR', message, { status: 400, expose: true, ...options });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', options: AppErrorOptions = {}) {
    super('AUTHENTICATION_ERROR', message, { status: 401, expose: true, ...options });
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Not authorized', options: AppErrorOptions = {}) {
    super('AUTHORIZATION_ERROR', message, { status: 403, expose: true, ...options });
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', options: AppErrorOptions = {}) {
    super('NOT_FOUND', message, { status: 404, expose: true, ...options });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super('CONFLICT', message, { status: 409, expose: true, ...options });
    this.name = 'ConflictError';
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super('BUSINESS_RULE_ERROR', message, { status: 422, expose: true, ...options });
    this.name = 'BusinessRuleError';
  }
}

export class IntegrationError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super('INTEGRATION_ERROR', message, { status: 502, expose: false, ...options });
    this.name = 'IntegrationError';
  }
}

export class InfrastructureError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super('INFRASTRUCTURE_ERROR', message, { status: 503, expose: false, ...options });
    this.name = 'InfrastructureError';
  }
}
