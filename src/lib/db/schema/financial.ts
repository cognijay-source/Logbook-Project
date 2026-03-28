import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  numeric,
  integer,
  index,
} from 'drizzle-orm/pg-core'
import { profiles } from './profiles'
import { aircraft } from './aircraft'
import { flights } from './flights'

export const financialEntries = pgTable(
  'financial_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    entryType: text('entry_type').notNull(), // 'expense' | 'income'
    category: text('category').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    entryDate: date('entry_date').notNull(),
    description: text('description'),
    aircraftId: uuid('aircraft_id').references(() => aircraft.id, {
      onDelete: 'set null',
    }),
    flightId: uuid('flight_id').references(() => flights.id, {
      onDelete: 'set null',
    }),
    careerPhase: text('career_phase'),
    vendor: text('vendor'),
    paymentMethod: text('payment_method').default('cash'), // 'cash' | 'loan' | 'scholarship' | 'gi_bill' | 'other'
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('financial_entries_profile_id_idx').on(table.profileId),
    index('financial_entries_entry_date_idx').on(table.entryDate),
    index('financial_entries_entry_type_idx').on(table.entryType),
  ],
)

export const loans = pgTable(
  'loans',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    principalAmount: numeric('principal_amount', {
      precision: 12,
      scale: 2,
    }).notNull(),
    interestRate: numeric('interest_rate', { precision: 6, scale: 4 }),
    monthlyPayment: numeric('monthly_payment', { precision: 12, scale: 2 }),
    startDate: date('start_date'),
    termMonths: integer('term_months'),
    remainingBalance: numeric('remaining_balance', {
      precision: 12,
      scale: 2,
    }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('loans_profile_id_idx').on(table.profileId)],
)
