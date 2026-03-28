CREATE INDEX IF NOT EXISTS "idx_certificates_profile_id" ON "certificates" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_certificates_created_at" ON "certificates" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_endorsements_profile_id" ON "endorsements" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_endorsements_created_at" ON "endorsements" USING btree ("created_at");
