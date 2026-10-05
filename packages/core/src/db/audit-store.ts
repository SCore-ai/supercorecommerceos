import { type getDb } from './client.js';
import { auditRecords } from './schema.js';
import { createInternalId } from '../ids.js';
import { sanitizeAuditValue, type AuditRecord } from '../audit.js';

type CoreDb = ReturnType<typeof getDb>;
export type CoreTx = Parameters<Parameters<CoreDb['transaction']>[0]>[0];

export async function insertAuditRecord(db: CoreTx | CoreDb, record: AuditRecord): Promise<void> {
  await db.insert(auditRecords).values({
    id: createInternalId(),
    tenantId: record.tenantId,
    actorId: record.actorId,
    action: record.action,
    entity: record.entity,
    entityId: record.entityId,
    occurredAt: record.occurredAt,
    correlationId: record.correlationId,
    oldValue: sanitizeAuditValue(record.oldValue) ?? null,
    newValue: sanitizeAuditValue(record.newValue) ?? null,
    ip: record.ip ?? null,
    userAgent: record.userAgent ?? null,
  });
}
