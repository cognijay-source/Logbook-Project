import { eq, and } from 'drizzle-orm'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getFlightTotals, type FlightTotals } from './flight-totals'

export type RequirementProgress = {
  field: string
  label: string
  required: number
  current: number
  percentage: number
  remaining: number
}

export type GoalProgress = {
  goalProfile: {
    id: string
    code: string
    name: string
    description: string | null
    category: string | null
  }
  assignmentId: string
  requirements: RequirementProgress[]
}

export async function getGoalProgress(
  profileId: string,
): Promise<GoalProgress | null> {
  try {
    // Get the user's active goal assignment
    const assignments = await db
      .select()
      .from(schema.userGoalAssignments)
      .where(
        and(
          eq(schema.userGoalAssignments.profileId, profileId),
          eq(schema.userGoalAssignments.isActive, true),
        ),
      )
      .limit(1)

    const assignment = assignments[0]
    if (!assignment) return null

    // Get the goal profile
    const goalProfiles = await db
      .select()
      .from(schema.goalProfiles)
      .where(eq(schema.goalProfiles.id, assignment.goalProfileId))
      .limit(1)

    const goalProfile = goalProfiles[0]
    if (!goalProfile) return null

    // Get the goal requirements
    const requirements = await db
      .select()
      .from(schema.goalRequirements)
      .where(eq(schema.goalRequirements.goalProfileId, goalProfile.id))

    // Get the user's flight totals
    const totals = await getFlightTotals(profileId)

    // Calculate progress for each requirement
    const requirementProgress: RequirementProgress[] = requirements.map(
      (req) => {
        const required = parseFloat(req.requiredValue) || 0
        const current = getTotalForField(totals, req.field)
        const percentage =
          required > 0 ? Math.min((current / required) * 100, 100) : 0
        const remaining = Math.max(required - current, 0)

        return {
          field: req.field,
          label: req.label,
          required,
          current,
          percentage: Math.round(percentage * 10) / 10,
          remaining: Math.round(remaining * 10) / 10,
        }
      },
    )

    return {
      goalProfile: {
        id: goalProfile.id,
        code: goalProfile.code,
        name: goalProfile.name,
        description: goalProfile.description,
        category: goalProfile.category,
      },
      assignmentId: assignment.id,
      requirements: requirementProgress,
    }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

/** Map a requirement field name to the corresponding flight totals value. */
function getTotalForField(totals: FlightTotals, field: string): number {
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
