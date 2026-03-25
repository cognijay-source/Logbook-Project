import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  boolean,
  index,
} from 'drizzle-orm/pg-core'
import { profiles } from './profiles'
import { flights } from './flights'

export const milestoneDefinitions = pgTable('milestone_definitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  evaluationType: text('evaluation_type').notNull(), // 'threshold' | 'event' | 'manual'
  field: text('field'), // which flight field to evaluate
  threshold: integer('threshold'), // for threshold-type milestones
  sortOrder: integer('sort_order').default(0),
  isSystem: boolean('is_system').default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const userMilestones = pgTable(
  'user_milestones',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    milestoneDefinitionId: uuid('milestone_definition_id').references(
      () => milestoneDefinitions.id,
      { onDelete: 'set null' },
    ),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category'),
    achievedAt: date('achieved_at'),
    flightId: uuid('flight_id').references(() => flights.id, {
      onDelete: 'set null',
    }),
    isManual: boolean('is_manual').default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('user_milestones_profile_id_idx').on(table.profileId),
    index('user_milestones_achieved_at_idx').on(table.achievedAt),
  ],
)
