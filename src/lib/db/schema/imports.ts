import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  index,
  jsonb,
} from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const importBatches = pgTable(
  'import_batches',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    sourceType: text('source_type').notNull(),
    fileName: text('file_name'),
    fileUrl: text('file_url'),
    status: text('status').default('pending').notNull(),
    totalRows: integer('total_rows').default(0),
    processedRows: integer('processed_rows').default(0),
    errorRows: integer('error_rows').default(0),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('import_batches_profile_id_idx').on(table.profileId)],
)

export const importRows = pgTable(
  'import_rows',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    batchId: uuid('batch_id')
      .notNull()
      .references(() => importBatches.id, { onDelete: 'cascade' }),
    rowNumber: integer('row_number').notNull(),
    rawData: jsonb('raw_data'),
    normalizedData: jsonb('normalized_data'),
    status: text('status').default('pending').notNull(),
    errors: jsonb('errors'),
    flightId: uuid('flight_id'),
    isReviewed: boolean('is_reviewed').default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('import_rows_batch_id_idx').on(table.batchId)],
)
