CREATE TABLE "pilot_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"certificate_level" text,
	"certificate_number" text,
	"medical_class" text,
	"medical_expiry" timestamp with time zone,
	"flight_review_date" timestamp with time zone,
	"home_airport" text,
	"career_phase" text,
	"bio" text,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pilot_profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"timezone" text DEFAULT 'UTC',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "aircraft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"tail_number" text NOT NULL,
	"manufacturer" text,
	"model" text,
	"year" text,
	"category" text,
	"aircraft_class" text,
	"engine_type" text,
	"is_complex" boolean DEFAULT false,
	"is_high_performance" boolean DEFAULT false,
	"is_multi_engine" boolean DEFAULT false,
	"is_turbine" boolean DEFAULT false,
	"is_tailwheel" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flight_approaches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flight_id" uuid NOT NULL,
	"approach_type" text NOT NULL,
	"runway" text,
	"airport" text,
	"is_circle_to_land" boolean DEFAULT false,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flight_crew" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flight_id" uuid NOT NULL,
	"crew_role" text NOT NULL,
	"name" text NOT NULL,
	"certificate_number" text,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flight_legs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flight_id" uuid NOT NULL,
	"leg_order" integer NOT NULL,
	"departure_airport" text,
	"arrival_airport" text,
	"departure_time" timestamp with time zone,
	"arrival_time" timestamp with time zone,
	"total_time" numeric(6, 1),
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"aircraft_id" uuid,
	"flight_date" date NOT NULL,
	"departure_airport" text,
	"arrival_airport" text,
	"route" text,
	"total_time" numeric(6, 1),
	"pic" numeric(6, 1),
	"sic" numeric(6, 1),
	"cross_country" numeric(6, 1),
	"night" numeric(6, 1),
	"actual_instrument" numeric(6, 1),
	"simulated_instrument" numeric(6, 1),
	"dual_received" numeric(6, 1),
	"dual_given" numeric(6, 1),
	"solo" numeric(6, 1),
	"multi_engine" numeric(6, 1),
	"turbine" numeric(6, 1),
	"day_landings" integer DEFAULT 0,
	"night_landings" integer DEFAULT 0,
	"holds" integer DEFAULT 0,
	"operation_type" text,
	"role_type" text,
	"remarks" text,
	"tags" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_solo_flight" boolean DEFAULT false,
	"is_checkride" boolean DEFAULT false,
	"source_type" text DEFAULT 'manual',
	"import_batch_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"entry_type" text NOT NULL,
	"category" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"entry_date" date NOT NULL,
	"description" text,
	"aircraft_id" uuid,
	"flight_id" uuid,
	"career_phase" text,
	"vendor" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestone_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"evaluation_type" text NOT NULL,
	"field" text,
	"threshold" integer,
	"sort_order" integer DEFAULT 0,
	"is_system" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "milestone_definitions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"milestone_definition_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"achieved_at" date,
	"flight_id" uuid,
	"is_manual" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goal_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"sort_order" integer DEFAULT 0,
	"is_system" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goal_profiles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "goal_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_profile_id" uuid NOT NULL,
	"field" text NOT NULL,
	"label" text NOT NULL,
	"required_value" numeric(8, 1) NOT NULL,
	"unit" text DEFAULT 'hours',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_goal_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"goal_profile_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"certificate_type" text NOT NULL,
	"name" text NOT NULL,
	"issued_date" date,
	"expiry_date" date,
	"issuing_authority" text,
	"document_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "endorsements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"endorsement_type" text NOT NULL,
	"description" text NOT NULL,
	"instructor_name" text,
	"instructor_cert_number" text,
	"endorsed_date" date,
	"document_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"entry_type" text NOT NULL,
	"subject" text NOT NULL,
	"description" text,
	"instructor" text,
	"entry_date" date NOT NULL,
	"duration" numeric(6, 1),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currency_rule_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"regulation" text,
	"required_count" integer,
	"required_field" text,
	"period_days" integer,
	"category" text,
	"is_system" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currency_rule_definitions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_currency_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"rule_definition_id" uuid NOT NULL,
	"is_current" boolean DEFAULT false,
	"expires_at" date,
	"last_evaluated_at" timestamp with time zone,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"file_name" text,
	"file_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_rows" integer DEFAULT 0,
	"processed_rows" integer DEFAULT 0,
	"error_rows" integer DEFAULT 0,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"row_number" integer NOT NULL,
	"raw_data" jsonb,
	"normalized_data" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"errors" jsonb,
	"flight_id" uuid,
	"is_reviewed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"file_url" text,
	"storage_path" text,
	"mime_type" text,
	"entity_type" text,
	"entity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"changes" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pilot_profiles" ADD CONSTRAINT "pilot_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_approaches" ADD CONSTRAINT "flight_approaches_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_crew" ADD CONSTRAINT "flight_crew_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_legs" ADD CONSTRAINT "flight_legs_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights" ADD CONSTRAINT "flights_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights" ADD CONSTRAINT "flights_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_milestones" ADD CONSTRAINT "user_milestones_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_milestones" ADD CONSTRAINT "user_milestones_milestone_definition_id_milestone_definitions_id_fk" FOREIGN KEY ("milestone_definition_id") REFERENCES "public"."milestone_definitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_milestones" ADD CONSTRAINT "user_milestones_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_requirements" ADD CONSTRAINT "goal_requirements_goal_profile_id_goal_profiles_id_fk" FOREIGN KEY ("goal_profile_id") REFERENCES "public"."goal_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_goal_assignments" ADD CONSTRAINT "user_goal_assignments_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_goal_assignments" ADD CONSTRAINT "user_goal_assignments_goal_profile_id_goal_profiles_id_fk" FOREIGN KEY ("goal_profile_id") REFERENCES "public"."goal_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_entries" ADD CONSTRAINT "training_entries_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_currency_status" ADD CONSTRAINT "user_currency_status_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_currency_status" ADD CONSTRAINT "user_currency_status_rule_definition_id_currency_rule_definitions_id_fk" FOREIGN KEY ("rule_definition_id") REFERENCES "public"."currency_rule_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_batch_id_import_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."import_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "flight_approaches_flight_id_idx" ON "flight_approaches" USING btree ("flight_id");--> statement-breakpoint
CREATE INDEX "flight_crew_flight_id_idx" ON "flight_crew" USING btree ("flight_id");--> statement-breakpoint
CREATE INDEX "flight_legs_flight_id_idx" ON "flight_legs" USING btree ("flight_id");--> statement-breakpoint
CREATE INDEX "flights_profile_id_idx" ON "flights" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "flights_flight_date_idx" ON "flights" USING btree ("flight_date");--> statement-breakpoint
CREATE INDEX "flights_aircraft_id_idx" ON "flights" USING btree ("aircraft_id");--> statement-breakpoint
CREATE INDEX "flights_status_idx" ON "flights" USING btree ("status");--> statement-breakpoint
CREATE INDEX "financial_entries_profile_id_idx" ON "financial_entries" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "financial_entries_entry_date_idx" ON "financial_entries" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "financial_entries_entry_type_idx" ON "financial_entries" USING btree ("entry_type");--> statement-breakpoint
CREATE INDEX "user_milestones_profile_id_idx" ON "user_milestones" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "user_milestones_achieved_at_idx" ON "user_milestones" USING btree ("achieved_at");--> statement-breakpoint
CREATE INDEX "goal_requirements_goal_profile_id_idx" ON "goal_requirements" USING btree ("goal_profile_id");--> statement-breakpoint
CREATE INDEX "user_goal_assignments_profile_id_idx" ON "user_goal_assignments" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "training_entries_profile_id_idx" ON "training_entries" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "user_currency_status_profile_id_idx" ON "user_currency_status" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "import_batches_profile_id_idx" ON "import_batches" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "import_rows_batch_id_idx" ON "import_rows" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "documents_profile_id_idx" ON "documents" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "audit_events_profile_id_idx" ON "audit_events" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "audit_events_entity_type_idx" ON "audit_events" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_events_entity_id_idx" ON "audit_events" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "audit_events_created_at_idx" ON "audit_events" USING btree ("created_at");