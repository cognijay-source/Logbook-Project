import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  numeric,
  integer,
  boolean,
  index,
  unique,
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
    requirementType: text('requirement_type').default('hours').notNull(),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('goal_requirements_goal_profile_id_idx').on(table.goalProfileId),
  ],
)

export const goalChecklistProgress = pgTable(
  'goal_checklist_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    requirementId: uuid('requirement_id')
      .notNull()
      .references(() => goalRequirements.id, { onDelete: 'cascade' }),
    completed: boolean('completed').default(false).notNull(),
    completedDate: date('completed_date'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('goal_checklist_progress_profile_id_idx').on(table.profileId),
    unique('goal_checklist_progress_unique').on(
      table.profileId,
      table.requirementId,
    ),
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
