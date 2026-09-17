export type AuditRecord = {
  actorId: string | null;
  tenantId: string;
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
