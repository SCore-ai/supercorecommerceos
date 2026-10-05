CREATE TABLE IF NOT EXISTS "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamptz NOT NULL,
	"updated_at" timestamptz NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "tenants_slug_uidx" ON "tenants" ("slug");

CREATE TABLE IF NOT EXISTS "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL REFERENCES "tenants"("id"),
	"business_id" text,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamptz NOT NULL,
	"updated_at" timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "organizations_tenant_idx" ON "organizations" ("tenant_id");

CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text REFERENCES "tenants"("id"),
	"business_id" text,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text,
	"status" text NOT NULL,
	"created_at" timestamptz NOT NULL,
	"updated_at" timestamptz NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_tenant_email_uidx" ON "users" ("tenant_id", "email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_platform_email_uidx" ON "users" ("email") WHERE "tenant_id" IS NULL;
CREATE INDEX IF NOT EXISTS "users_tenant_idx" ON "users" ("tenant_id");

CREATE TABLE IF NOT EXISTS "organization_memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL REFERENCES "tenants"("id"),
	"organization_id" text NOT NULL REFERENCES "organizations"("id"),
	"user_id" text NOT NULL REFERENCES "users"("id"),
	"created_at" timestamptz NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "organization_memberships_org_user_uidx" ON "organization_memberships" ("organization_id", "user_id");
CREATE INDEX IF NOT EXISTS "organization_memberships_tenant_idx" ON "organization_memberships" ("tenant_id");

CREATE TABLE IF NOT EXISTS "user_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text REFERENCES "tenants"("id"),
	"user_id" text NOT NULL REFERENCES "users"("id"),
	"role" text NOT NULL,
	"created_at" timestamptz NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_user_role_uidx" ON "user_roles" ("user_id", "role");

CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "users"("id"),
	"tenant_id" text REFERENCES "tenants"("id"),
	"expires_at" timestamptz NOT NULL,
	"created_at" timestamptz NOT NULL,
	"revoked_at" timestamptz
);
CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "sessions" ("user_id");

CREATE TABLE IF NOT EXISTS "user_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL REFERENCES "tenants"("id"),
	"user_id" text NOT NULL REFERENCES "users"("id"),
	"secret_hash" text NOT NULL,
	"expires_at" timestamptz NOT NULL,
	"consumed_at" timestamptz,
	"created_at" timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "user_invitations_user_idx" ON "user_invitations" ("user_id");

CREATE TABLE IF NOT EXISTS "countries" (
	"id" text PRIMARY KEY NOT NULL,
	"iso_alpha2" text NOT NULL,
	"iso_alpha3" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "countries_iso_alpha2_uidx" ON "countries" ("iso_alpha2");

CREATE TABLE IF NOT EXISTS "currencies" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"minor_unit" integer NOT NULL,
	"is_active" boolean NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "currencies_code_uidx" ON "currencies" ("code");

CREATE TABLE IF NOT EXISTS "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL REFERENCES "tenants"("id"),
	"organization_id" text REFERENCES "organizations"("id"),
	"business_id" text,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"status" text NOT NULL,
	"created_at" timestamptz NOT NULL,
	"updated_at" timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "customers_tenant_idx" ON "customers" ("tenant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "customers_tenant_email_uidx" ON "customers" ("tenant_id", "email") WHERE "email" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "suppliers" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL REFERENCES "tenants"("id"),
	"organization_id" text REFERENCES "organizations"("id"),
	"business_id" text,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"status" text NOT NULL,
	"created_at" timestamptz NOT NULL,
	"updated_at" timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "suppliers_tenant_idx" ON "suppliers" ("tenant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "suppliers_tenant_email_uidx" ON "suppliers" ("tenant_id", "email") WHERE "email" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL REFERENCES "tenants"("id"),
	"organization_id" text REFERENCES "organizations"("id"),
	"customer_id" text REFERENCES "customers"("id"),
	"supplier_id" text REFERENCES "suppliers"("id"),
	"label" text,
	"line1" text NOT NULL,
	"line2" text,
	"city" text NOT NULL,
	"region" text,
	"postal_code" text,
	"country_id" text NOT NULL REFERENCES "countries"("id"),
	"is_primary" boolean NOT NULL,
	"created_at" timestamptz NOT NULL,
	"updated_at" timestamptz NOT NULL,
	CONSTRAINT "addresses_one_owner" CHECK (
		(CASE WHEN "organization_id" IS NOT NULL THEN 1 ELSE 0 END) +
		(CASE WHEN "customer_id" IS NOT NULL THEN 1 ELSE 0 END) +
		(CASE WHEN "supplier_id" IS NOT NULL THEN 1 ELSE 0 END) = 1
	)
);
CREATE INDEX IF NOT EXISTS "addresses_tenant_idx" ON "addresses" ("tenant_id");

CREATE TABLE IF NOT EXISTS "audit_records" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text REFERENCES "tenants"("id"),
	"actor_id" text,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"occurred_at" timestamptz NOT NULL,
	"correlation_id" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip" text,
	"user_agent" text
);
CREATE INDEX IF NOT EXISTS "audit_records_tenant_idx" ON "audit_records" ("tenant_id");
CREATE INDEX IF NOT EXISTS "audit_records_entity_idx" ON "audit_records" ("entity", "entity_id");
