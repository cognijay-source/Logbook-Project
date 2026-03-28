import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  numeric,
  index,
} from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const trainingEntries = pgTable(
  'training_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    entryType: text('entry_type').notNull(),
    subject: text('subject').notNull(),
    description: text('description'),
    instructor: text('instructor'),
    entryDate: date('entry_date').notNull(),
    duration: numeric('duration', { precision: 6, scale: 1 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('training_entries_profile_id_idx').on(table.profileId)],
)

export const certificates = pgTable(
  'certificates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    certificateType: text('certificate_type').notNull(),
    name: text('name').notNull(),
    issuedDate: date('issued_date'),
    expiryDate: date('expiry_date'),
    issuingAuthority: text('issuing_authority'),
    documentUrl: text('document_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_certificates_profile_id').on(table.profileId),
    index('idx_certificates_created_at').on(table.createdAt),
  ],
)

export const endorsements = pgTable(
  'endorsements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    endorsementType: text('endorsement_type').notNull(),
    description: text('description').notNull(),
    instructorName: text('instructor_name'),
    instructorCertNumber: text('instructor_cert_number'),
    endorsedDate: date('endorsed_date'),
    documentUrl: text('document_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_endorsements_profile_id').on(table.profileId),
    index('idx_endorsements_created_at').on(table.createdAt),
  ],
)
