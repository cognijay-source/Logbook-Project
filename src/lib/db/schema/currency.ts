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

export const currencyRuleDefinitions = pgTable('currency_rule_definitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  regulation: text('regulation'),
  requiredCount: integer('required_count'),
  requiredField: text('required_field'),
  periodDays: integer('period_days'),
  category: text('category'),
  isSystem: boolean('is_system').default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const userCurrencyStatus = pgTable(
  'user_currency_status',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    ruleDefinitionId: uuid('rule_definition_id')
      .notNull()
      .references(() => currencyRuleDefinitions.id, { onDelete: 'cascade' }),
    isCurrent: boolean('is_current').default(false),
    expiresAt: date('expires_at'),
    lastEvaluatedAt: timestamp('last_evaluated_at', { withTimezone: true }),
    details: text('details'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('user_currency_status_profile_id_idx').on(table.profileId)],
)
