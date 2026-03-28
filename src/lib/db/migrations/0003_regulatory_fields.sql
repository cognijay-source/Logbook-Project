-- Part 1: Instructor and safety pilot fields on flights
ALTER TABLE "flights" ADD COLUMN "instructor_name" text;--> statement-breakpoint
ALTER TABLE "flights" ADD COLUMN "instructor_cert_number" text;--> statement-breakpoint
ALTER TABLE "flights" ADD COLUMN "safety_pilot_name" text;--> statement-breakpoint

-- Part 6: Medical certificate and DOB fields on pilot_profiles
ALTER TABLE "pilot_profiles" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "pilot_profiles" ADD COLUMN "medical_issue_date" date;
