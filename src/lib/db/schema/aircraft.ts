import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const aircraft = pgTable('aircraft', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  tailNumber: text('tail_number').notNull(),
  manufacturer: text('manufacturer'),
  model: text('model'),
  year: text('year'),
  category: text('category'),
  aircraftClass: text('aircraft_class'),
  engineType: text('engine_type'),
  isComplex: boolean('is_complex').default(false),
  isHighPerformance: boolean('is_high_performance').default(false),
  isMultiEngine: boolean('is_multi_engine').default(false),
  isTurbine: boolean('is_turbine').default(false),
  isTailwheel: boolean('is_tailwheel').default(false),
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
