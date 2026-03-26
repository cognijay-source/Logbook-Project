import { eq, and, gte, sql } from 'drizzle-orm'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

export type CurrencyStatus = 'current' | 'expiring' | 'expired'

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
  status: CurrencyStatus
  isCurrent: boolean | null
  expiresAt: string | null
  details: string
  needed: string | null
  evaluatedAt: string
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
          result = await evaluateInstrument(profileId, rule)
          break
        case 'flight_review':
          result = await evaluateFlightReview(profileId, rule)
          break
        default:
          result = {
            rule,
            status: 'expired',
            isCurrent: null,
            expiresAt: null,
            details: `No evaluator implemented for rule: ${rule.code}`,
            needed: null,
            evaluatedAt: new Date().toISOString(),
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
 * 3 takeoffs and 3 landings within the preceding 90 days
 * in the same category, class, and type (if required).
 */
async function evaluatePassengerDay(
  profileId: string,
  rule: typeof schema.currencyRuleDefinitions.$inferSelect,
): Promise<CurrencyResult> {
  const requiredCount = rule.requiredCount ?? 3
  const cutoffDate = addDays(new Date(), -90).toISOString().split('T')[0]
  const now = new Date()

  // Get individual flights with day landings in the period, ordered by date desc
  const flights = await db
    .select({
      flightDate: schema.flights.flightDate,
      dayLandings: schema.flights.dayLandings,
    })
    .from(schema.flights)
    .where(
      and(
        eq(schema.flights.profileId, profileId),
        eq(schema.flights.status, 'final'),
        gte(schema.flights.flightDate, cutoffDate),
      ),
    )
    .orderBy(schema.flights.flightDate)

  const total = flights.reduce((sum, f) => sum + (f.dayLandings ?? 0), 0)
  const isCurrent = total >= requiredCount

  // Find the expiration date: date of the Nth-most-recent landing + 90 days
  const expiresAt = isCurrent
    ? findNthLandingExpiry(flights, 'dayLandings', requiredCount, 90)
    : null

  const status = computeStatus(isCurrent, expiresAt, now)
  const deficit = requiredCount - total
  const needed = deficit > 0 ? `Need ${deficit} more day landing(s)` : null

  return {
    rule,
    status,
    isCurrent,
    expiresAt,
    details: `${total} day landing(s) in last 90 days (${requiredCount} required)`,
    needed,
    evaluatedAt: now.toISOString(),
  }
}

/**
 * Passenger night currency (14 CFR 61.57(b)):
 * 3 takeoffs and 3 full-stop landings at night within the preceding 90 days.
 */
async function evaluatePassengerNight(
  profileId: string,
  rule: typeof schema.currencyRuleDefinitions.$inferSelect,
): Promise<CurrencyResult> {
  const requiredCount = rule.requiredCount ?? 3
  const cutoffDate = addDays(new Date(), -90).toISOString().split('T')[0]
  const now = new Date()

  const flights = await db
    .select({
      flightDate: schema.flights.flightDate,
      nightLandings: schema.flights.nightLandings,
    })
    .from(schema.flights)
    .where(
      and(
        eq(schema.flights.profileId, profileId),
        eq(schema.flights.status, 'final'),
        gte(schema.flights.flightDate, cutoffDate),
      ),
    )
    .orderBy(schema.flights.flightDate)

  const total = flights.reduce((sum, f) => sum + (f.nightLandings ?? 0), 0)
  const isCurrent = total >= requiredCount

  const expiresAt = isCurrent
    ? findNthLandingExpiry(flights, 'nightLandings', requiredCount, 90)
    : null

  const status = computeStatus(isCurrent, expiresAt, now)
  const deficit = requiredCount - total
  const needed = deficit > 0 ? `Need ${deficit} more night landing(s)` : null

  return {
    rule,
    status,
    isCurrent,
    expiresAt,
    details: `${total} night landing(s) in last 90 days (${requiredCount} required)`,
    needed,
    evaluatedAt: now.toISOString(),
  }
}

/**
 * Instrument currency (14 CFR 61.57(c)):
 * Within the preceding 6 calendar months: 6 instrument approaches,
 * holding procedures, and intercepting/tracking courses.
 * After that, a 6 calendar month grace period where you can use a
 * safety pilot but can't fly IFR with passengers.
 */
async function evaluateInstrument(
  profileId: string,
  rule: typeof schema.currencyRuleDefinitions.$inferSelect,
): Promise<CurrencyResult> {
  const requiredApproaches = rule.requiredCount ?? 6
  const now = new Date()

  // 6 calendar months back from the end of the current month
  const sixMonthCutoff = subtractCalendarMonths(now, 6)
  // 12 calendar months back (grace period boundary)
  const twelveMonthCutoff = subtractCalendarMonths(now, 12)

  // Count approaches in the last 6 calendar months
  const approachResult = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(schema.flightApproaches)
    .innerJoin(
      schema.flights,
      eq(schema.flightApproaches.flightId, schema.flights.id),
    )
    .where(
      and(
        eq(schema.flights.profileId, profileId),
        eq(schema.flights.status, 'final'),
        gte(schema.flights.flightDate, sixMonthCutoff),
      ),
    )

  const approachCount = Number(approachResult[0]?.count) || 0

  // Count holds in the last 6 calendar months
  const holdsResult = await db
    .select({
      total: sql<number>`coalesce(sum(${schema.flights.holds}), 0)`,
    })
    .from(schema.flights)
    .where(
      and(
        eq(schema.flights.profileId, profileId),
        eq(schema.flights.status, 'final'),
        gte(schema.flights.flightDate, sixMonthCutoff),
      ),
    )

  const holdsCount = Number(holdsResult[0]?.total) || 0
  const hasHolds = holdsCount >= 1

  const approachesMet = approachCount >= requiredApproaches
  const isCurrent = approachesMet && hasHolds

  // If not current in 6 months, check if still in grace period (6-12 months)
  let inGracePeriod = false
  if (!isCurrent) {
    const graceApproachResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(schema.flightApproaches)
      .innerJoin(
        schema.flights,
        eq(schema.flightApproaches.flightId, schema.flights.id),
      )
      .where(
        and(
          eq(schema.flights.profileId, profileId),
          eq(schema.flights.status, 'final'),
          gte(schema.flights.flightDate, twelveMonthCutoff),
        ),
      )

    const graceApproaches = Number(graceApproachResult[0]?.count) || 0

    const graceHoldsResult = await db
      .select({
        total: sql<number>`coalesce(sum(${schema.flights.holds}), 0)`,
      })
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.profileId, profileId),
          eq(schema.flights.status, 'final'),
          gte(schema.flights.flightDate, twelveMonthCutoff),
        ),
      )

    const graceHolds = Number(graceHoldsResult[0]?.total) || 0
    inGracePeriod = graceApproaches >= requiredApproaches && graceHolds >= 1
  }

  // Expiration: end of the 6th calendar month after the most recent qualifying period
  const expiresAt = isCurrent
    ? endOfCalendarMonth(addCalendarMonths(sixMonthCutoff, 6))
    : null

  let status: CurrencyStatus
  let details: string
  let needed: string | null = null

  if (isCurrent) {
    status = computeStatus(true, expiresAt, now)
    details = `${approachCount} approach(es), ${holdsCount} hold(s) in last 6 calendar months`
  } else if (inGracePeriod) {
    status = 'expiring'
    details = `In grace period — ${approachCount} approach(es), ${holdsCount} hold(s) in last 6 months. Can regain currency with a safety pilot or IPC`
    const approachDeficit = Math.max(0, requiredApproaches - approachCount)
    const holdDeficit = hasHolds ? 0 : 1
    const parts: string[] = []
    if (approachDeficit > 0) parts.push(`${approachDeficit} more approach(es)`)
    if (holdDeficit > 0) parts.push(`1 holding procedure`)
    needed =
      parts.length > 0
        ? `Need ${parts.join(' and ')} (with safety pilot or IPC)`
        : 'Complete an IPC to regain full currency'
  } else {
    status = 'expired'
    details = `${approachCount} approach(es), ${holdsCount} hold(s) in last 6 calendar months. Grace period expired — IPC required`
    needed = 'Instrument Proficiency Check (IPC) required'
  }

  return {
    rule,
    status,
    isCurrent,
    expiresAt,
    details,
    needed,
    evaluatedAt: now.toISOString(),
  }
}

/**
 * Flight review (14 CFR 61.56):
 * Must be completed within the preceding 24 calendar months.
 * Check: pilot_profiles.flightReviewDate, flights with isCheckride=true,
 * or training entries flagged as flight reviews.
 */
async function evaluateFlightReview(
  profileId: string,
  rule: typeof schema.currencyRuleDefinitions.$inferSelect,
): Promise<CurrencyResult> {
  const now = new Date()
  const twentyFourMonthCutoff = subtractCalendarMonths(now, 24)

  // Source 1: pilotProfiles.flightReviewDate
  const pilotProfile = await db
    .select({ flightReviewDate: schema.pilotProfiles.flightReviewDate })
    .from(schema.pilotProfiles)
    .where(eq(schema.pilotProfiles.profileId, profileId))
    .limit(1)

  let latestReviewDate: Date | null = null
  if (pilotProfile[0]?.flightReviewDate) {
    latestReviewDate = new Date(pilotProfile[0].flightReviewDate)
  }

  // Source 2: most recent checkride (counts as a flight review per 14 CFR 61.56(d))
  const checkrideResult = await db
    .select({
      flightDate: schema.flights.flightDate,
    })
    .from(schema.flights)
    .where(
      and(
        eq(schema.flights.profileId, profileId),
        eq(schema.flights.status, 'final'),
        eq(schema.flights.isCheckride, true),
      ),
    )
    .orderBy(sql`${schema.flights.flightDate} desc`)
    .limit(1)

  if (checkrideResult[0]?.flightDate) {
    const checkrideDate = new Date(checkrideResult[0].flightDate)
    if (!latestReviewDate || checkrideDate > latestReviewDate) {
      latestReviewDate = checkrideDate
    }
  }

  // Source 3: training entries with type 'flight_review'
  const trainingResult = await db
    .select({
      entryDate: schema.trainingEntries.entryDate,
    })
    .from(schema.trainingEntries)
    .where(
      and(
        eq(schema.trainingEntries.profileId, profileId),
        eq(schema.trainingEntries.entryType, 'flight_review'),
      ),
    )
    .orderBy(sql`${schema.trainingEntries.entryDate} desc`)
    .limit(1)

  if (trainingResult[0]?.entryDate) {
    const trainingDate = new Date(trainingResult[0].entryDate)
    if (!latestReviewDate || trainingDate > latestReviewDate) {
      latestReviewDate = trainingDate
    }
  }

  if (!latestReviewDate) {
    return {
      rule,
      status: 'expired',
      isCurrent: false,
      expiresAt: null,
      details: 'No flight review on record',
      needed: 'Complete a flight review (BFR) with a CFI',
      evaluatedAt: now.toISOString(),
    }
  }

  // Flight review expires at end of 24th calendar month after the review
  const expiresAt = endOfCalendarMonth(addCalendarMonths(latestReviewDate, 24))
  const isCurrent = latestReviewDate >= new Date(twentyFourMonthCutoff)
  const status = computeStatus(isCurrent, expiresAt, now)

  const reviewDateStr = latestReviewDate.toISOString().split('T')[0]
  const details = `Last flight review: ${reviewDateStr}`
  const needed = !isCurrent ? 'Complete a flight review (BFR) with a CFI' : null

  return {
    rule,
    status,
    isCurrent,
    expiresAt,
    details,
    needed,
    evaluatedAt: now.toISOString(),
  }
}

// --- Helpers ---

/**
 * Find the expiration date based on the Nth-most-recent qualifying landing.
 * Walk backwards through flights summing landings until we reach requiredCount;
 * that flight's date + periodDays = expiration.
 */
function findNthLandingExpiry(
  flights: {
    flightDate: string
    dayLandings?: number | null
    nightLandings?: number | null
  }[],
  field: 'dayLandings' | 'nightLandings',
  requiredCount: number,
  periodDays: number,
): string | null {
  // Walk from most recent backward
  let accumulated = 0
  for (let i = flights.length - 1; i >= 0; i--) {
    const count = flights[i][field] ?? 0
    accumulated += count
    if (accumulated >= requiredCount) {
      // This flight date is when the Nth landing occurred
      return addDays(new Date(flights[i].flightDate), periodDays)
        .toISOString()
        .split('T')[0]
    }
  }
  return null
}

function computeStatus(
  isCurrent: boolean | null,
  expiresAt: string | null,
  now: Date,
): CurrencyStatus {
  if (!isCurrent) return 'expired'
  if (!expiresAt) return 'current'

  const expiryDate = new Date(expiresAt)
  const thirtyDaysFromNow = addDays(now, 30)

  if (expiryDate <= thirtyDaysFromNow) return 'expiring'
  return 'current'
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Subtract N calendar months from a date.
 * Returns the first day of that month as a YYYY-MM-DD string for SQL comparison.
 */
function subtractCalendarMonths(date: Date, months: number): string {
  const d = new Date(date)
  d.setMonth(d.getMonth() - months)
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

/**
 * Add N calendar months to a date.
 */
function addCalendarMonths(date: Date | string, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

/**
 * Return the last day of the month as YYYY-MM-DD.
 */
function endOfCalendarMonth(date: Date): string {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  d.setDate(0) // last day of previous month
  return d.toISOString().split('T')[0]
}
