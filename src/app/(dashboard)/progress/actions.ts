'use server'

import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import { goalProfiles, userGoalAssignments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateProfile } from '@/lib/services/profile'
import { getFlightTotals } from '@/lib/services/flight-totals'
import { getGoalProgress } from '@/lib/services/goal-progress'
import { createAuditEvent } from '@/lib/services/audit'
import { goalAssignmentSchema } from '@/lib/validators/goal'

export async function getProgressData() {
  try {
    const profile = await getOrCreateProfile()

    const [totals, progress] = await Promise.all([
      getFlightTotals(profile.id),
      getGoalProgress(profile.id),
    ])

    return { totals, progress }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function getAvailableGoals() {
  try {
    const goals = await db
      .select()
      .from(goalProfiles)
      .orderBy(goalProfiles.sortOrder)

    return goals
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function assignGoal(data: unknown) {
  try {
    const profile = await getOrCreateProfile()
    const validated = goalAssignmentSchema.parse(data)

    // Deactivate existing active goals
    await db
      .update(userGoalAssignments)
      .set({ isActive: false })
      .where(eq(userGoalAssignments.profileId, profile.id))

    const [assignment] = await db
      .insert(userGoalAssignments)
      .values({
        profileId: profile.id,
        goalProfileId: validated.goalProfileId,
        isActive: validated.isActive ?? true,
      })
      .returning()

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'user_goal_assignment',
      entityId: assignment.id,
      action: 'create',
      changes: validated,
    })

    return { success: true, assignment }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Failed to assign goal' }
  }
}
