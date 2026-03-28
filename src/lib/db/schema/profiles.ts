import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  date,
} from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  timezone: text('timezone').default('UTC'),
  timeFormat: text('time_format').default('decimal'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const pilotProfiles = pgTable('pilot_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .unique()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  certificateLevel: text('certificate_level'),
  certificateNumber: text('certificate_number'),
  dateOfBirth: date('date_of_birth'),
  medicalClass: text('medical_class'),
  medicalIssueDate: date('medical_issue_date'),
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
