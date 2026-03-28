import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  timezone: text('timezone').default('UTC'),
  timeFormat: text('time_format').default('decimal'),
  onboardingCompleted: boolean('onboarding_completed')
    .default(false)
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const flightTemplates = pgTable(
  'flight_templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    aircraftId: uuid('aircraft_id'),
    departureAirport: text('departure_airport'),
    arrivalAirport: text('arrival_airport'),
    route: text('route'),
    operationType: text('operation_type'),
    role: text('role'),
    instructorName: text('instructor_name'),
    instructorCertNumber: text('instructor_cert_number'),
    defaultTotalTime: text('default_total_time'),
    isFavorite: boolean('is_favorite').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_flight_templates_profile').on(table.profileId)],
)

export const pilotProfiles = pgTable('pilot_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .unique()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  certificateLevel: text('certificate_level'),
  certificateNumber: text('certificate_number'),
  medicalClass: text('medical_class'),
  medicalExpiry: timestamp('medical_expiry', { withTimezone: true }),
  flightReviewDate: timestamp('flight_review_date', { withTimezone: true }),
  homeAirport: text('home_airport'),
  careerPhase: text('career_phase'),
  bio: text('bio'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
