import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'currency_expiring' | 'currency_expired' | 'goal_completed' | 'milestone_achieved' | 'import_complete' | 'system'
    title: text('title').notNull(),
    message: text('message').notNull(),
    actionUrl: text('action_url'),
    metadata: jsonb('metadata'),
    isRead: boolean('is_read').default(false).notNull(),
    isDismissed: boolean('is_dismissed').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('notifications_profile_id_idx').on(table.profileId),
    index('notifications_profile_unread_idx').on(
      table.profileId,
      table.isRead,
    ),
    index('notifications_created_at_idx').on(table.createdAt),
  ],
)
