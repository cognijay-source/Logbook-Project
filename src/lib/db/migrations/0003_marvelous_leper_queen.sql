ALTER TABLE "flights" ADD COLUMN "night_landings_full_stop" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Backfill: treat existing night landings as full-stop (conservative assumption)
UPDATE flights SET night_landings_full_stop = night_landings WHERE night_landings > 0;