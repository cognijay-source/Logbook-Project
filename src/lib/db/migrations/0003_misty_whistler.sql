CREATE TABLE "goal_checklist_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"requirement_id" uuid NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goal_checklist_progress_unique" UNIQUE("profile_id","requirement_id")
);
--> statement-breakpoint
ALTER TABLE "goal_requirements" ADD COLUMN "requirement_type" text DEFAULT 'hours' NOT NULL;--> statement-breakpoint
ALTER TABLE "goal_checklist_progress" ADD CONSTRAINT "goal_checklist_progress_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_checklist_progress" ADD CONSTRAINT "goal_checklist_progress_requirement_id_goal_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."goal_requirements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "goal_checklist_progress_profile_id_idx" ON "goal_checklist_progress" USING btree ("profile_id");