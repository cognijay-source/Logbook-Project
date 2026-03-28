'use server'

import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import {
  goalProfiles,
  goalChecklistProgress,
  userGoalAssignments,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getOrCreateProfile } from '@/lib/services/profile'
import { getFlightTotals } from '@/lib/services/flight-totals'
import { getGoalProgress } from '@/lib/services/goal-progress'
import { createAuditEvent } from '@/lib/services/audit'
import {
  goalAssignmentSchema,
  goalChecklistToggleSchema,
} from '@/lib/validators/goal'

export async function getProgressData() {
  try {
    const profile = await getOrCreateProfile()

    const [totals, progress] = await Promise.all([
      getFlightTotals(profile.id),
      getGoalProgress(profile.id),
    ])

    return { data: { totals, progress }, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load progress data',
    }
  }
}

export async function getAvailableGoals() {
  try {
    const goals = await db
      .select()
      .from(goalProfiles)
      .orderBy(goalProfiles.sortOrder)

    return { data: goals, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load available goals',
    }
  }
}

export async function assignGoal(data: unknown) {
  try {
    const profile = await getOrCreateProfile()
    const validated = goalAssignmentSchema.parse(data)

    // Query existing active assignments for audit
    const existingActive = await db
      .select({ id: userGoalAssignments.id })
      .from(userGoalAssignments)
      .where(
        and(
          eq(userGoalAssignments.profileId, profile.id),
          eq(userGoalAssignments.isActive, true),
        ),
      )

    // Deactivate existing active goals
    if (existingActive.length > 0) {
      await db
        .update(userGoalAssignments)
        .set({ isActive: false })
        .where(
          and(
            eq(userGoalAssignments.profileId, profile.id),
            eq(userGoalAssignments.isActive, true),
          ),
        )

      for (const existing of existingActive) {
        await createAuditEvent({
          profileId: profile.id,
          entityType: 'user_goal_assignment',
          entityId: existing.id,
          action: 'deactivated',
        })
      }
    }

    const [assignment] = await db
      .insert(userGoalAssignments)
      .values({
        profileId: profile.id,
        goalProfileId: validated.goalProfileId,
        isActive: validated.isActive ?? true,
      })
      .returning()

    if (!assignment) {
      return { data: null, error: 'Failed to create goal assignment' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'user_goal_assignment',
      entityId: assignment.id,
      action: 'create',
      changes: validated,
    })

    return { data: assignment, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error ? error.message : 'Failed to assign goal',
    }
  }
}

export async function toggleChecklistItem(
  data: unknown,
): Promise<{ data: boolean | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    const validated = goalChecklistToggleSchema.parse(data)

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    await db
      .insert(goalChecklistProgress)
      .values({
        profileId: profile.id,
        requirementId: validated.requirementId,
        completed: validated.completed,
        completedDate: validated.completed
          ? (validated.completedDate ?? todayStr)
          : null,
        notes: validated.notes ?? null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [goalChecklistProgress.profileId, goalChecklistProgress.requirementId],
        set: {
          completed: validated.completed,
          completedDate: validated.completed
            ? (validated.completedDate ?? todayStr)
            : null,
          notes: validated.notes ?? null,
          updatedAt: now,
        },
      })

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'goal_checklist_progress',
      entityId: validated.requirementId,
      action: validated.completed ? 'completed' : 'uncompleted',
      changes: validated,
    })

    return { data: validated.completed, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to update checklist item' }
  }
}
