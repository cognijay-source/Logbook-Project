import { eq, and, sql } from 'drizzle-orm'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

export type FlightTotals = {
  totalTime: number
  pic: number
  sic: number
  crossCountry: number
  night: number
  actualInstrument: number
  simulatedInstrument: number
  dualReceived: number
  dualGiven: number
  solo: number
  multiEngine: number
  turbine: number
  dayLandings: number
  nightLandings: number
  holds: number
  totalFlights: number
}

const ZERO_TOTALS: FlightTotals = {
  totalTime: 0,
  pic: 0,
  sic: 0,
  crossCountry: 0,
  night: 0,
  actualInstrument: 0,
  simulatedInstrument: 0,
  dualReceived: 0,
  dualGiven: 0,
  solo: 0,
  multiEngine: 0,
  turbine: 0,
  dayLandings: 0,
  nightLandings: 0,
  holds: 0,
  totalFlights: 0,
}

export async function getFlightTotals(
  profileId: string,
): Promise<FlightTotals> {
  try {
    const result = await db
      .select({
        totalTime: sql<string>`coalesce(sum(${schema.flights.totalTime}), 0)`,
        pic: sql<string>`coalesce(sum(${schema.flights.pic}), 0)`,
        sic: sql<string>`coalesce(sum(${schema.flights.sic}), 0)`,
        crossCountry: sql<string>`coalesce(sum(${schema.flights.crossCountry}), 0)`,
        night: sql<string>`coalesce(sum(${schema.flights.night}), 0)`,
        actualInstrument: sql<string>`coalesce(sum(${schema.flights.actualInstrument}), 0)`,
        simulatedInstrument: sql<string>`coalesce(sum(${schema.flights.simulatedInstrument}), 0)`,
        dualReceived: sql<string>`coalesce(sum(${schema.flights.dualReceived}), 0)`,
        dualGiven: sql<string>`coalesce(sum(${schema.flights.dualGiven}), 0)`,
        solo: sql<string>`coalesce(sum(${schema.flights.solo}), 0)`,
        multiEngine: sql<string>`coalesce(sum(${schema.flights.multiEngine}), 0)`,
        turbine: sql<string>`coalesce(sum(${schema.flights.turbine}), 0)`,
        dayLandings: sql<number>`coalesce(sum(${schema.flights.dayLandings}), 0)`,
        nightLandings: sql<number>`coalesce(sum(${schema.flights.nightLandings}), 0)`,
        holds: sql<number>`coalesce(sum(${schema.flights.holds}), 0)`,
        totalFlights: sql<number>`count(*)`,
      })
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.profileId, profileId),
          eq(schema.flights.status, 'final'),
        ),
      )

    const row = result[0]
    if (!row) return { ...ZERO_TOTALS }

    return {
      totalTime: parseFloat(row.totalTime) || 0,
      pic: parseFloat(row.pic) || 0,
      sic: parseFloat(row.sic) || 0,
      crossCountry: parseFloat(row.crossCountry) || 0,
      night: parseFloat(row.night) || 0,
      actualInstrument: parseFloat(row.actualInstrument) || 0,
      simulatedInstrument: parseFloat(row.simulatedInstrument) || 0,
      dualReceived: parseFloat(row.dualReceived) || 0,
      dualGiven: parseFloat(row.dualGiven) || 0,
      solo: parseFloat(row.solo) || 0,
      multiEngine: parseFloat(row.multiEngine) || 0,
      turbine: parseFloat(row.turbine) || 0,
      dayLandings: Number(row.dayLandings) || 0,
      nightLandings: Number(row.nightLandings) || 0,
      holds: Number(row.holds) || 0,
      totalFlights: Number(row.totalFlights) || 0,
    }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
