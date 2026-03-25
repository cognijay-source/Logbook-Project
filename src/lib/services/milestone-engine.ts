import { eq, and, sql } from 'drizzle-orm'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getFlightTotals, type FlightTotals } from './flight-totals'

export type MilestoneResult = {
  definition: {
    id: string
    code: string
    name: string
    description: string | null
    category: string
    evaluationType: string
    field: string | null
    threshold: number | null
  }
  isAchieved: boolean
  achievedDate?: string | null
  currentValue?: number
  progress?: number
}

export type MilestoneEvaluation = {
  achieved: MilestoneResult[]
  pending: MilestoneResult[]
}

export async function evaluateMilestones(
  profileId: string,
): Promise<MilestoneEvaluation> {
  try {
    // Get all system milestone definitions
    const definitions = await db
      .select()
      .from(schema.milestoneDefinitions)
      .where(eq(schema.milestoneDefinitions.isSystem, true))

    // Get existing user milestones (to preserve manual entries and achieved dates)
    const existingMilestones = await db
      .select()
      .from(schema.userMilestones)
      .where(eq(schema.userMilestones.profileId, profileId))

    const existingByDefinitionId = new Map(
      existingMilestones
        .filter((m) => m.milestoneDefinitionId)
        .map((m) => [m.milestoneDefinitionId!, m]),
    )

    // Get flight totals
    const totals = await getFlightTotals(profileId)

    // Get first flights for event-type milestones
    const firstFlights = await getFirstFlights(profileId)

    const achieved: MilestoneResult[] = []
    const pending: MilestoneResult[] = []

    for (const def of definitions) {
      const existing = existingByDefinitionId.get(def.id)
      let result: MilestoneResult

      if (def.evaluationType === 'threshold') {
        result = evaluateThreshold(def, totals, existing)
      } else if (def.evaluationType === 'event') {
        result = evaluateEvent(def, firstFlights, existing)
      } else {
        // Manual milestones — achieved only if user recorded it
        result = {
          definition: def,
          isAchieved: !!existing?.achievedAt,
          achievedDate: existing?.achievedAt ?? null,
        }
      }

      if (result.isAchieved) {
        achieved.push(result)
      } else {
        pending.push(result)
      }
    }

    return { achieved, pending }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

function evaluateThreshold(
  def: typeof schema.milestoneDefinitions.$inferSelect,
  totals: FlightTotals,
  existing: typeof schema.userMilestones.$inferSelect | undefined,
): MilestoneResult {
  const threshold = def.threshold ?? 0
  const currentValue = getFieldValue(totals, def.field)
  const isAchieved = currentValue >= threshold
  const progress =
    threshold > 0 ? Math.min((currentValue / threshold) * 100, 100) : 0

  return {
    definition: def,
    isAchieved,
    achievedDate: existing?.achievedAt ?? null,
    currentValue,
    progress: Math.round(progress * 10) / 10,
  }
}

function evaluateEvent(
  def: typeof schema.milestoneDefinitions.$inferSelect,
  firstFlights: FirstFlightMap,
  existing: typeof schema.userMilestones.$inferSelect | undefined,
): MilestoneResult {
  // Map milestone codes to first-flight lookup keys
  const eventMap: Record<string, keyof FirstFlightMap> = {
    first_solo: 'solo',
    first_xc: 'crossCountry',
    first_night: 'night',
    first_instrument: 'instrument',
    first_checkride: 'checkride',
  }

  const lookupKey = eventMap[def.code]
  const firstFlight = lookupKey ? firstFlights[lookupKey] : null

  const isAchieved = !!firstFlight || !!existing?.achievedAt

  return {
    definition: def,
    isAchieved,
    achievedDate: firstFlight ?? existing?.achievedAt ?? null,
  }
}

type FirstFlightMap = {
  solo: string | null
  crossCountry: string | null
  night: string | null
  instrument: string | null
  checkride: string | null
}

async function getFirstFlights(profileId: string): Promise<FirstFlightMap> {
  const baseWhere = and(
    eq(schema.flights.profileId, profileId),
    eq(schema.flights.status, 'final'),
  )

  const [soloResult, xcResult, nightResult, instrumentResult, checkrideResult] =
    await Promise.all([
      db
        .select({ flightDate: sql<string>`min(${schema.flights.flightDate})` })
        .from(schema.flights)
        .where(and(baseWhere, eq(schema.flights.isSoloFlight, true))),
      db
        .select({ flightDate: sql<string>`min(${schema.flights.flightDate})` })
        .from(schema.flights)
        .where(and(baseWhere, sql`${schema.flights.crossCountry} > 0`)),
      db
        .select({ flightDate: sql<string>`min(${schema.flights.flightDate})` })
        .from(schema.flights)
        .where(and(baseWhere, sql`${schema.flights.night} > 0`)),
      db
        .select({ flightDate: sql<string>`min(${schema.flights.flightDate})` })
        .from(schema.flights)
        .where(
          and(
            baseWhere,
            sql`(${schema.flights.actualInstrument} > 0 OR ${schema.flights.simulatedInstrument} > 0)`,
          ),
        ),
      db
        .select({ flightDate: sql<string>`min(${schema.flights.flightDate})` })
        .from(schema.flights)
        .where(and(baseWhere, eq(schema.flights.isCheckride, true))),
    ])

  return {
    solo: soloResult[0]?.flightDate ?? null,
    crossCountry: xcResult[0]?.flightDate ?? null,
    night: nightResult[0]?.flightDate ?? null,
    instrument: instrumentResult[0]?.flightDate ?? null,
    checkride: checkrideResult[0]?.flightDate ?? null,
  }
}

function getFieldValue(totals: FlightTotals, field: string | null): number {
  if (!field) return 0

  const fieldMap: Record<string, keyof FlightTotals> = {
    total_time: 'totalTime',
    totalTime: 'totalTime',
    pic: 'pic',
    sic: 'sic',
    cross_country: 'crossCountry',
    crossCountry: 'crossCountry',
    night: 'night',
    actual_instrument: 'actualInstrument',
    actualInstrument: 'actualInstrument',
    simulated_instrument: 'simulatedInstrument',
    simulatedInstrument: 'simulatedInstrument',
    dual_received: 'dualReceived',
    dualReceived: 'dualReceived',
    dual_given: 'dualGiven',
    dualGiven: 'dualGiven',
    solo: 'solo',
    multi_engine: 'multiEngine',
    multiEngine: 'multiEngine',
    turbine: 'turbine',
    day_landings: 'dayLandings',
    dayLandings: 'dayLandings',
    night_landings: 'nightLandings',
    nightLandings: 'nightLandings',
    holds: 'holds',
    total_flights: 'totalFlights',
    totalFlights: 'totalFlights',
  }

  const key = fieldMap[field]
  if (key) return totals[key]
  return 0
}
