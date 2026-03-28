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
} from 'drizzle-orm/pg-core'
import { profiles } from './profiles'
import { aircraft } from './aircraft'

export const flights = pgTable(
  'flights',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    aircraftId: uuid('aircraft_id').references(() => aircraft.id, {
      onDelete: 'set null',
    }),
    flightDate: date('flight_date').notNull(),
    departureAirport: text('departure_airport'),
    arrivalAirport: text('arrival_airport'),
    route: text('route'),

    // Time buckets (stored as decimal hours)
    totalTime: numeric('total_time', { precision: 6, scale: 1 }),
    pic: numeric('pic', { precision: 6, scale: 1 }),
    sic: numeric('sic', { precision: 6, scale: 1 }),
    crossCountry: numeric('cross_country', { precision: 6, scale: 1 }),
    night: numeric('night', { precision: 6, scale: 1 }),
    actualInstrument: numeric('actual_instrument', { precision: 6, scale: 1 }),
    simulatedInstrument: numeric('simulated_instrument', {
      precision: 6,
      scale: 1,
    }),
    dualReceived: numeric('dual_received', { precision: 6, scale: 1 }),
    dualGiven: numeric('dual_given', { precision: 6, scale: 1 }),
    solo: numeric('solo', { precision: 6, scale: 1 }),
    multiEngine: numeric('multi_engine', { precision: 6, scale: 1 }),
    turbine: numeric('turbine', { precision: 6, scale: 1 }),

    // Landings
    dayLandings: integer('day_landings').default(0),
    nightLandings: integer('night_landings').default(0),
    nightLandingsFullStop: integer('night_landings_full_stop')
      .notNull()
      .default(0),

    // Holds
    holds: integer('holds').default(0),

    // Classification
    operationType: text('operation_type'),
    roleType: text('role_type'),

    // Meta
    remarks: text('remarks'),
    tags: text('tags'),
    status: text('status').default('draft').notNull(),
    isSoloFlight: boolean('is_solo_flight').default(false),
    isCheckride: boolean('is_checkride').default(false),
    // Personnel
    instructorName: text('instructor_name'),
    instructorCertNumber: text('instructor_cert_number'),
    safetyPilotName: text('safety_pilot_name'),

    sourceType: text('source_type').default('manual'),
    importBatchId: uuid('import_batch_id'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('flights_profile_id_idx').on(table.profileId),
    index('flights_flight_date_idx').on(table.flightDate),
    index('flights_aircraft_id_idx').on(table.aircraftId),
    index('flights_status_idx').on(table.status),
  ],
)

export const flightLegs = pgTable(
  'flight_legs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    flightId: uuid('flight_id')
      .notNull()
      .references(() => flights.id, { onDelete: 'cascade' }),
    legOrder: integer('leg_order').notNull(),
    departureAirport: text('departure_airport'),
    arrivalAirport: text('arrival_airport'),
    departureTime: timestamp('departure_time', { withTimezone: true }),
    arrivalTime: timestamp('arrival_time', { withTimezone: true }),
    totalTime: numeric('total_time', { precision: 6, scale: 1 }),
    remarks: text('remarks'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('flight_legs_flight_id_idx').on(table.flightId)],
)

export const flightApproaches = pgTable(
  'flight_approaches',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    flightId: uuid('flight_id')
      .notNull()
      .references(() => flights.id, { onDelete: 'cascade' }),
    approachType: text('approach_type').notNull(),
    runway: text('runway'),
    airport: text('airport'),
    isCircleToLand: boolean('is_circle_to_land').default(false),
    remarks: text('remarks'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('flight_approaches_flight_id_idx').on(table.flightId)],
)

export const flightCrew = pgTable(
  'flight_crew',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    flightId: uuid('flight_id')
      .notNull()
      .references(() => flights.id, { onDelete: 'cascade' }),
    crewRole: text('crew_role').notNull(),
    name: text('name').notNull(),
    certificateNumber: text('certificate_number'),
    remarks: text('remarks'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('flight_crew_flight_id_idx').on(table.flightId)],
)
