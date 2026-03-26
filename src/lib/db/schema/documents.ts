import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    documentType: text('document_type').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    fileUrl: text('file_url'),
    storagePath: text('storage_path'),
    mimeType: text('mime_type'),
    fileSize: integer('file_size'),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('documents_profile_id_idx').on(table.profileId),
    index('documents_entity_idx').on(table.entityType, table.entityId),
  ],
)
