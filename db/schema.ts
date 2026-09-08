import { pgTable, text, integer, bigint, index } from 'drizzle-orm/pg-core';
export const leads = pgTable(
  'leads',
  {
    id: text('id').primaryKey(),
    kind: text('kind').notNull(),
    payload: text('payload').notNull(),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
    expiresAt: bigint('expires_at', { mode: 'number' }).notNull(),
    emailStatus: text('email_status').notNull().default('pending'),
    callbackStatus: text('callback_status').notNull().default('pending'),
    consentVersion: text('consent_version').notNull(),
  },
  (table) => [index('leads_expiry_idx').on(table.expiresAt)],
);
export const rateLimits = pgTable(
  'rate_limits',
  {
    key: text('key').primaryKey(),
    uses: integer('uses').notNull(),
    expiresAt: bigint('expires_at', { mode: 'number' }).notNull(),
  },
  (table) => [index('rate_limits_expiry_idx').on(table.expiresAt)],
);
