import { eq, and, gte, sql } from 'drizzle-orm'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

export type CurrencyResult = {
  rule: {
    id: string
    code: string
    name: string
    description: string | null
    regulation: string | null
    requiredCount: number | null
    periodDays: number | null
    category: string | null
  }
  isCurrent: boolean | null
  expiresAt: string | null
  details: string
}

export async function evaluateCurrency(
  profileId: string,
): Promise<CurrencyResult[]> {
  try {
    const rules = await db.select().from(schema.currencyRuleDefinitions)

    const results: CurrencyResult[] = []

    for (const rule of rules) {
      let result: CurrencyResult

      switch (rule.code) {
        case 'passenger_day':
          result = await evaluatePassengerDay(profileId, rule)
          break
        case 'passenger_night':
          result = await evaluatePassengerNight(profileId, rule)
          break
        case 'instrument':
          // Placeholder: instrument currency requires tracking approaches,
          // holds, and intercepting/tracking courses from the flight_approaches
          // table over the last 6 calendar months. Full implementation needs
          // calendar-month logic and approach counting which is not yet built.
          result = {
            rule,
            isCurrent: null,
            expiresAt: null,
            details:
              'Instrument currency evaluation not yet fully implemented. Requires approach tracking over 6 calendar months.',
          }
          break
        case 'flight_review':
          // Placeholder: flight review currency depends on endorsement records
          // or checkride dates which are stored outside the flights table.
          // Full implementation pending endorsement/document integration.
          result = {
            rule,
            isCurrent: null,
            expiresAt: null,
            details:
              'Flight review currency evaluation not yet fully implemented. Requires endorsement or checkride date tracking.',
          }
          break
        default:
          // Unknown rule — return as not evaluated
          result = {
            rule,
            isCurrent: null,
            expiresAt: null,
            details: `No evaluator implemented for rule: ${rule.code}`,
          }
          break
      }

      results.push(result)
    }

    return results
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

/**
 * Passenger day currency (14 CFR 61.57(a)):
 * 3 takeoffs and landings within the preceding 90 days.
 * Fully implemented — counts day_landings from final flights.
 */
async function evaluatePassengerDay(
  profileId: string,
  rule: typeof schema.currencyRuleDefinitions.$inferSelect,
): Promise<CurrencyResult> {
  const periodDays = rule.periodDays ?? 90
  const requiredCount = rule.requiredCount ?? 3
  const cutoffDate = getCutoffDate(periodDays)

  const result = await db
    .select({
      total: sql<number>`coalesce(sum(${schema.flights.dayLandings}), 0)`,
      lastFlightDate: sql<string>`max(${schema.flights.flightDate})`,
    })
    .from(schema.flights)
    .where(
      and(
        eq(schema.flights.profileId, profileId),
        eq(schema.flights.status, 'final'),
        gte(schema.flights.flightDate, cutoffDate),
      ),
    )

  const total = Number(result[0]?.total) || 0
  const isCurrent = total >= requiredCount

  // Estimate expiration based on the oldest qualifying flight in the window.
  // A precise calculation would find the date of the Nth-most-recent landing,
  // but for now we use the last flight date + period.
  const lastDate = result[0]?.lastFlightDate
  const expiresAt = lastDate
    ? addDays(new Date(lastDate), periodDays).toISOString().split('T')[0]
    : null

  return {
    rule,
    isCurrent,
    expiresAt: isCurrent ? expiresAt : null,
    details: `${total} day landing(s) in last ${periodDays} days (${requiredCount} required)`,
  }
}

/**
 * Passenger night currency (14 CFR 61.57(b)):
 * 3 takeoffs and full-stop landings at night within the preceding 90 days.
 * Fully implemented — counts night_landings from final flights.
 */
async function evaluatePassengerNight(
  profileId: string,
  rule: typeof schema.currencyRuleDefinitions.$inferSelect,
): Promise<CurrencyResult> {
  const periodDays = rule.periodDays ?? 90
  const requiredCount = rule.requiredCount ?? 3
  const cutoffDate = getCutoffDate(periodDays)

  const result = await db
    .select({
      total: sql<number>`coalesce(sum(${schema.flights.nightLandings}), 0)`,
      lastFlightDate: sql<string>`max(${schema.flights.flightDate})`,
    })
    .from(schema.flights)
    .where(
      and(
        eq(schema.flights.profileId, profileId),
        eq(schema.flights.status, 'final'),
        gte(schema.flights.flightDate, cutoffDate),
      ),
    )

  const total = Number(result[0]?.total) || 0
  const isCurrent = total >= requiredCount

  const lastDate = result[0]?.lastFlightDate
  const expiresAt = lastDate
    ? addDays(new Date(lastDate), periodDays).toISOString().split('T')[0]
    : null

  return {
    rule,
    isCurrent,
    expiresAt: isCurrent ? expiresAt : null,
    details: `${total} night landing(s) in last ${periodDays} days (${requiredCount} required)`,
  }
}

function getCutoffDate(days: number): string {
  return addDays(new Date(), -days).toISOString().split('T')[0]
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
