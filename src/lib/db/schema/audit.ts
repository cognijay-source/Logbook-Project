import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    action: text('action').notNull(), // 'create' | 'update' | 'delete'
    changes: jsonb('changes'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('audit_events_profile_id_idx').on(table.profileId),
    index('audit_events_entity_type_idx').on(table.entityType),
    index('audit_events_entity_id_idx').on(table.entityId),
    index('audit_events_created_at_idx').on(table.createdAt),
  ],
)
