-- Part 1: Add onboarding_completed to profiles
ALTER TABLE profiles ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;

-- Part 3: Flight templates table
CREATE TABLE flight_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  aircraft_id uuid,
  departure_airport text,
  arrival_airport text,
  route text,
  operation_type text,
  role text,
  instructor_name text,
  instructor_cert_number text,
  default_total_time text,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_flight_templates_profile ON flight_templates(profile_id);
