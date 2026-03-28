CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "action_url" text,
  "metadata" jsonb,
  "is_read" boolean NOT NULL DEFAULT false,
  "is_dismissed" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "notifications_profile_id_idx" ON "notifications" ("profile_id");
CREATE INDEX IF NOT EXISTS "notifications_profile_unread_idx" ON "notifications" ("profile_id", "is_read");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" ("created_at");
