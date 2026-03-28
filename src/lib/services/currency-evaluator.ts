import { eq, and, gte, sql, desc } from 'drizzle-orm'
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

// Pre-fetched flight data shared across rule evaluators
interface FlightData {
  landingFlights: {
    flightDate: string
    dayLandings: number | null
    nightLandings: number | null
    holds: number | null
  }[]
  approachCount6m: number
  approachCount12m: number
  holdsTotal6m: number
  holdsTotal12m: number
  pilotProfile: { flightReviewDate: Date | null } | null
  latestCheckride: { flightDate: string } | null
  latestFlightReviewTraining: { entryDate: string } | null
  latestWingsPhase: { entryDate: string } | null
  latestProficiencyCheck: { entryDate: string } | null
  lastInstrumentEventDate: string | null
}

async function prefetchFlightData(
  profileId: string,
  ninetyDayCutoff: string,
  sixMonthCutoff: string,
  twelveMonthCutoff: string,
): Promise<FlightData> {
  const [
    landingFlights,
    approachResult6m,
    approachResult12m,
    holdsAndFlights,
    pilotProfileResult,
    checkrideResult,
    trainingResult,
    wingsResult,
    profCheckResult,
    lastInstrumentEventResult,
  ] = await Promise.all([
    // All flights in last 90 days with landings
    db
      .select({
        flightDate: schema.flights.flightDate,
        dayLandings: schema.flights.dayLandings,
        nightLandings: schema.flights.nightLandings,
        holds: schema.flights.holds,
      })
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.profileId, profileId),
          eq(schema.flights.status, 'final'),
          gte(schema.flights.flightDate, ninetyDayCutoff),
        ),
      )
      .orderBy(schema.flights.flightDate),
    // Approaches in last 6 months
    db
      .select({ count: sql<number>`count(*)` })
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
      ),
    // Approaches in last 12 months
    db
      .select({ count: sql<number>`count(*)` })
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
      ),
    // Holds totals for 6 and 12 months via single query
    db
      .select({
        flightDate: schema.flights.flightDate,
        holds: schema.flights.holds,
      })
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.profileId, profileId),
          eq(schema.flights.status, 'final'),
          gte(schema.flights.flightDate, twelveMonthCutoff),
        ),
      ),
    // Pilot profile for flight review date
    db
      .select({ flightReviewDate: schema.pilotProfiles.flightReviewDate })
      .from(schema.pilotProfiles)
      .where(eq(schema.pilotProfiles.profileId, profileId))
      .limit(1),
    // Latest checkride
    db
      .select({ flightDate: schema.flights.flightDate })
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.profileId, profileId),
          eq(schema.flights.status, 'final'),
          eq(schema.flights.isCheckride, true),
        ),
      )
      .orderBy(desc(schema.flights.flightDate))
      .limit(1),
    // Latest flight review training entry
    db
      .select({ entryDate: schema.trainingEntries.entryDate })
      .from(schema.trainingEntries)
      .where(
        and(
          eq(schema.trainingEntries.profileId, profileId),
          eq(schema.trainingEntries.entryType, 'flight_review'),
        ),
      )
      .orderBy(desc(schema.trainingEntries.entryDate))
      .limit(1),
    // Latest WINGS phase completion
    db
      .select({ entryDate: schema.trainingEntries.entryDate })
      .from(schema.trainingEntries)
      .where(
        and(
          eq(schema.trainingEntries.profileId, profileId),
          eq(schema.trainingEntries.entryType, 'wings_phase'),
        ),
      )
      .orderBy(desc(schema.trainingEntries.entryDate))
      .limit(1),
    // Latest proficiency check
    db
      .select({ entryDate: schema.trainingEntries.entryDate })
      .from(schema.trainingEntries)
      .where(
        and(
          eq(schema.trainingEntries.profileId, profileId),
          eq(schema.trainingEntries.entryType, 'proficiency_check'),
        ),
      )
      .orderBy(desc(schema.trainingEntries.entryDate))
      .limit(1),
    // Last instrument qualifying event (approach or hold) in 12 months for grace period calc
    db
      .select({ flightDate: schema.flights.flightDate })
      .from(schema.flights)
      .innerJoin(
        schema.flightApproaches,
        eq(schema.flightApproaches.flightId, schema.flights.id),
      )
      .where(
        and(
          eq(schema.flights.profileId, profileId),
          eq(schema.flights.status, 'final'),
          gte(schema.flights.flightDate, twelveMonthCutoff),
        ),
      )
      .orderBy(desc(schema.flights.flightDate))
      .limit(1),
  ])

  // Compute holds totals for 6m and 12m from the single query
  const holdsTotal6m = holdsAndFlights
    .filter((f) => f.flightDate >= sixMonthCutoff)
    .reduce((sum, f) => sum + (f.holds ?? 0), 0)
  const holdsTotal12m = holdsAndFlights.reduce(
    (sum, f) => sum + (f.holds ?? 0),
    0,
  )

  return {
    landingFlights,
    approachCount6m: Number(approachResult6m[0]?.count) || 0,
    approachCount12m: Number(approachResult12m[0]?.count) || 0,
    holdsTotal6m,
    holdsTotal12m,
    pilotProfile: pilotProfileResult[0] ?? null,
    latestCheckride: checkrideResult[0] ?? null,
    latestFlightReviewTraining: trainingResult[0] ?? null,
    latestWingsPhase: wingsResult[0] ?? null,
    latestProficiencyCheck: profCheckResult[0] ?? null,
    lastInstrumentEventDate: lastInstrumentEventResult[0]?.flightDate ?? null,
  }
}

export async function evaluateCurrency(
  profileId: string,
): Promise<CurrencyResult[]> {
  try {
    const now = new Date()
    const ninetyDayCutoff = addDays(now, -90).toISOString().split('T')[0]
    const sixMonthCutoff = subtractCalendarMonths(now, 6)
    const twelveMonthCutoff = subtractCalendarMonths(now, 12)

    const [rules, flightData] = await Promise.all([
      db.select().from(schema.currencyRuleDefinitions),
      prefetchFlightData(
        profileId,
        ninetyDayCutoff,
        sixMonthCutoff,
        twelveMonthCutoff,
      ),
    ])

    const results: CurrencyResult[] = []

    for (const rule of rules) {
      let result: CurrencyResult

      switch (rule.code) {
        case 'passenger_day':
          result = evaluatePassengerDay(rule, flightData, now)
          break
        case 'passenger_night':
          result = evaluatePassengerNight(rule, flightData, now)
          break
        case 'instrument':
          result = evaluateInstrument(rule, flightData, now, sixMonthCutoff)
          break
        case 'flight_review':
          result = evaluateFlightReview(rule, flightData, now)
          break
        default:
          result = {
            rule,
            status: 'expired',
            isCurrent: null,
            expiresAt: null,
            details: `No evaluator implemented for rule: ${rule.code}`,
            needed: null,
            evaluatedAt: now.toISOString(),
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
function evaluatePassengerDay(
  rule: typeof schema.currencyRuleDefinitions.$inferSelect,
  flightData: FlightData,
  now: Date,
): CurrencyResult {
  const requiredCount = rule.requiredCount ?? 3
  const flights = flightData.landingFlights

  const total = flights.reduce((sum, f) => sum + (f.dayLandings ?? 0), 0)
  const isCurrent = total >= requiredCount

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
function evaluatePassengerNight(
  rule: typeof schema.currencyRuleDefinitions.$inferSelect,
  flightData: FlightData,
  now: Date,
): CurrencyResult {
  const requiredCount = rule.requiredCount ?? 3
  const flights = flightData.landingFlights

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
function evaluateInstrument(
  rule: typeof schema.currencyRuleDefinitions.$inferSelect,
  flightData: FlightData,
  now: Date,
  sixMonthCutoff: string,
): CurrencyResult {
  const requiredApproaches = rule.requiredCount ?? 6

  const approachCount = flightData.approachCount6m
  const holdsCount = flightData.holdsTotal6m
  const hasHolds = holdsCount >= 1

  const approachesMet = approachCount >= requiredApproaches
  const isCurrent = approachesMet && hasHolds

  // If not current in 6 months, check if still in grace period (6-12 months)
  let inGracePeriod = false
  let graceExpiresAt: string | null = null
  if (!isCurrent) {
    const graceApproaches = flightData.approachCount12m
    const graceHolds = flightData.holdsTotal12m
    inGracePeriod = graceApproaches >= requiredApproaches && graceHolds >= 1

    if (inGracePeriod && flightData.lastInstrumentEventDate) {
      // Grace period ends at end of calendar month 12 months after last qualifying event
      graceExpiresAt = endOfCalendarMonth(
        addCalendarMonths(flightData.lastInstrumentEventDate, 12),
      )
    }
  }

  // Expiration: end of the 6th calendar month after the most recent qualifying period
  const expiresAt = isCurrent
    ? endOfCalendarMonth(addCalendarMonths(sixMonthCutoff, 6))
    : graceExpiresAt

  let status: CurrencyStatus
  let details: string
  let needed: string | null = null

  if (isCurrent) {
    status = computeStatus(true, expiresAt, now)
    details = `${approachCount} approach(es), ${holdsCount} hold(s) in last 6 calendar months`
  } else if (inGracePeriod) {
    status = 'expiring'
    const graceEndStr = graceExpiresAt ?? 'unknown'
    details = `Grace period ends ${graceEndStr}. Complete 6 approaches, holding, and tracking before this date or an IPC will be required`
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
function evaluateFlightReview(
  rule: typeof schema.currencyRuleDefinitions.$inferSelect,
  flightData: FlightData,
  now: Date,
): CurrencyResult {
  const twentyFourMonthCutoff = subtractCalendarMonths(now, 24)

  let latestReviewDate: Date | null = null

  // Source 1: pilotProfiles.flightReviewDate
  if (flightData.pilotProfile?.flightReviewDate) {
    latestReviewDate = new Date(flightData.pilotProfile.flightReviewDate)
  }

  // Source 2: most recent checkride (counts as a flight review per 14 CFR 61.56(d))
  if (flightData.latestCheckride?.flightDate) {
    const checkrideDate = new Date(flightData.latestCheckride.flightDate)
    if (!latestReviewDate || checkrideDate > latestReviewDate) {
      latestReviewDate = checkrideDate
    }
  }

  // Source 3: training entries with type 'flight_review'
  if (flightData.latestFlightReviewTraining?.entryDate) {
    const trainingDate = new Date(
      flightData.latestFlightReviewTraining.entryDate,
    )
    if (!latestReviewDate || trainingDate > latestReviewDate) {
      latestReviewDate = trainingDate
    }
  }

  // Source 4: WINGS phase completion (§ 61.56(e))
  if (flightData.latestWingsPhase?.entryDate) {
    const wingsDate = new Date(flightData.latestWingsPhase.entryDate)
    if (!latestReviewDate || wingsDate > latestReviewDate) {
      latestReviewDate = wingsDate
    }
  }

  // Source 5: Proficiency check (§ 61.56(d))
  if (flightData.latestProficiencyCheck?.entryDate) {
    const profCheckDate = new Date(flightData.latestProficiencyCheck.entryDate)
    if (!latestReviewDate || profCheckDate > latestReviewDate) {
      latestReviewDate = profCheckDate
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
