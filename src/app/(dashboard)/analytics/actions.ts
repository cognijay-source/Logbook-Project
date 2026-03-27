'use server'

import * as Sentry from '@sentry/nextjs'
import { getOrCreateProfile } from '@/lib/services/profile'
import {
  getFlightTotals,
  type FlightTotals,
} from '@/lib/services/flight-totals'

export async function getAnalyticsData(): Promise<{
  data: FlightTotals | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const totals = await getFlightTotals(profile.id)
    return { data: totals, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to load analytics data' }
  }
}
