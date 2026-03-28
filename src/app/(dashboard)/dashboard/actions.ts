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
import type { CurrencyResult } from '@/lib/services/currency-evaluator'
import { evaluateCurrency } from '@/lib/services/currency-evaluator'
import {
  evaluateMedical,
  type MedicalInfo,
} from '@/lib/services/medical-calculator'

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
  medical: MedicalInfo | null
}

export async function getDashboardData(): Promise<{
  data: DashboardData | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()

    const [totals, recentFlightsRaw, currency, goalProgress, pilotProfile] =
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
        db
          .select()
          .from(schema.pilotProfiles)
          .where(eq(schema.pilotProfiles.profileId, profile.id))
          .limit(1),
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

    // Evaluate medical status
    const pp = pilotProfile[0] ?? null
    const medical = pp
      ? evaluateMedical(
          pp.medicalClass,
          pp.medicalIssueDate,
          pp.medicalExpiry?.toISOString().split('T')[0] ?? null,
          pp.dateOfBirth,
        )
      : null

    return {
      data: { totals, recentFlights, currency, goalProgress, medical },
      error: null,
    }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load dashboard data',
    }
  }
}
