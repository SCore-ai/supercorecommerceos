export type AuditRecord = {
  actorId: string | null;
  tenantId: string | null;
  action: string;
  entity: string;
  entityId: string;
  occurredAt: Date;
  correlationId: string;
  oldValue?: unknown;
  newValue?: unknown;
  ip?: string;
  userAgent?: string;
};

const SECRET_KEYS = new Set(['password', 'passwordHash', 'secret', 'secretHash', 'invitationSecret']);

export function sanitizeAuditValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditValue(item));
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, nested]) => {
      if (SECRET_KEYS.has(key)) {
        return [key, undefined] as const;
      }
      return [key, sanitizeAuditValue(nested)] as const;
    });
    return Object.fromEntries(entries.filter(([, nested]) => nested !== undefined));
  }
  return value;
}
