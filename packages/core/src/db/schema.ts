import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Phase 0 schema is intentionally minimal.
 * No commerce, CRM, accounting, or other business-domain tables.
 */
export const systemMeta = pgTable('system_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
});

export const schema = {
  systemMeta,
};
