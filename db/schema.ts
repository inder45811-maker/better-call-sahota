import { sqliteTable,text,integer,index } from 'drizzle-orm/sqlite-core';
export const leads=sqliteTable('leads',{
 id:text('id').primaryKey(),kind:text('kind').notNull(),payload:text('payload').notNull(),createdAt:integer('created_at').notNull(),expiresAt:integer('expires_at').notNull(),emailStatus:text('email_status').notNull().default('pending'),callbackStatus:text('callback_status').notNull().default('pending'),consentVersion:text('consent_version').notNull(),
},table=>[index('leads_expiry_idx').on(table.expiresAt)]);
export const rateLimits=sqliteTable('rate_limits',{key:text('key').primaryKey(),uses:integer('uses').notNull(),expiresAt:integer('expires_at').notNull()},table=>[index('rate_limits_expiry_idx').on(table.expiresAt)]);
