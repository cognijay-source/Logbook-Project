ALTER TABLE "financial_entries" ADD COLUMN "payment_method" text DEFAULT 'cash';--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "training_environment" text DEFAULT 'part_61';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"principal_amount" numeric(12, 2) NOT NULL,
	"interest_rate" numeric(6, 4),
	"monthly_payment" numeric(12, 2),
	"start_date" date,
	"term_months" integer,
	"remaining_balance" numeric(12, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "loans" ADD CONSTRAINT "loans_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "loans_profile_id_idx" ON "loans" USING btree ("profile_id");
