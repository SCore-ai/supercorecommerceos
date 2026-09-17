CREATE TABLE IF NOT EXISTS "system_meta" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamptz NOT NULL
);
