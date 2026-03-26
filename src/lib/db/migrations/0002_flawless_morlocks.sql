ALTER TABLE "documents" ADD COLUMN "file_size" integer;--> statement-breakpoint
CREATE INDEX "documents_entity_idx" ON "documents" USING btree ("entity_type","entity_id");