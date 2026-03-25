import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  index,
} from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const goalProfiles = pgTable('goal_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  sortOrder: integer('sort_order').default(0),
  isSystem: boolean('is_system').default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const goalRequirements = pgTable(
  'goal_requirements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    goalProfileId: uuid('goal_profile_id')
      .notNull()
      .references(() => goalProfiles.id, { onDelete: 'cascade' }),
    field: text('field').notNull(),
    label: text('label').notNull(),
    requiredValue: numeric('required_value', {
      precision: 8,
      scale: 1,
    }).notNull(),
    unit: text('unit').default('hours'),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('goal_requirements_goal_profile_id_idx').on(table.goalProfileId),
  ],
)

export const userGoalAssignments = pgTable(
  'user_goal_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    goalProfileId: uuid('goal_profile_id')
      .notNull()
      .references(() => goalProfiles.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').default(true),
    assignedAt: timestamp('assigned_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('user_goal_assignments_profile_id_idx').on(table.profileId),
  ],
)
