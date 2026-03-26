'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'
import {
  getFlightTotals,
  type FlightTotals,
} from '@/lib/services/flight-totals'
import {
  getGoalProgress,
  type GoalProgress,
} from '@/lib/services/goal-progress'
import {
  evaluateCurrency,
  type CurrencyResult,
} from '@/lib/services/currency-evaluator'

export type RecentFlight = {
  id: string
  flightDate: string
  departureAirport: string | null
  arrivalAirport: string | null
  totalTime: string | null
  aircraft: { tailNumber: string; model: string | null } | null
}

export type DashboardData = {
  totals: FlightTotals
  recentFlights: RecentFlight[]
  currency: CurrencyResult[]
  goalProgress: GoalProgress | null
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const profile = await getOrCreateProfile()

    const [totals, recentFlightsRaw, currency, goalProgress] =
      await Promise.all([
        getFlightTotals(profile.id),
        db
          .select({
            id: schema.flights.id,
            flightDate: schema.flights.flightDate,
            departureAirport: schema.flights.departureAirport,
            arrivalAirport: schema.flights.arrivalAirport,
            totalTime: schema.flights.totalTime,
            aircraftTail: schema.aircraft.tailNumber,
            aircraftModel: schema.aircraft.model,
          })
          .from(schema.flights)
          .leftJoin(
            schema.aircraft,
            eq(schema.flights.aircraftId, schema.aircraft.id),
          )
          .where(
            and(
              eq(schema.flights.profileId, profile.id),
              eq(schema.flights.status, 'final'),
            ),
          )
          .orderBy(desc(schema.flights.flightDate))
          .limit(5),
        evaluateCurrency(profile.id),
        getGoalProgress(profile.id),
      ])

    const recentFlights: RecentFlight[] = recentFlightsRaw.map((f) => ({
      id: f.id,
      flightDate: f.flightDate,
      departureAirport: f.departureAirport,
      arrivalAirport: f.arrivalAirport,
      totalTime: f.totalTime,
      aircraft: f.aircraftTail
        ? { tailNumber: f.aircraftTail, model: f.aircraftModel }
        : null,
    }))

    return { totals, recentFlights, currency, goalProgress }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
