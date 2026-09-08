CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"payload" text NOT NULL,
	"created_at" bigint NOT NULL,
	"expires_at" bigint NOT NULL,
	"email_status" text DEFAULT 'pending' NOT NULL,
	"callback_status" text DEFAULT 'pending' NOT NULL,
	"consent_version" text NOT NULL
);

--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"uses" integer NOT NULL,
	"expires_at" bigint NOT NULL
);

--> statement-breakpoint
CREATE INDEX "leads_expiry_idx" ON "leads" USING btree ("expires_at");
--> statement-breakpoint
CREATE INDEX "rate_limits_expiry_idx" ON "rate_limits" USING btree ("expires_at");
