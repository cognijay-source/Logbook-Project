'use server'

import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import { userMilestones, milestoneDefinitions } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getOrCreateProfile } from '@/lib/services/profile'
import { evaluateMilestones } from '@/lib/services/milestone-engine'
import { createAuditEvent } from '@/lib/services/audit'
import { milestoneCreateSchema } from '@/lib/validators/milestone'

export async function getMilestoneTimeline() {
  try {
    const profile = await getOrCreateProfile()

    const achieved = await db
      .select({
        id: userMilestones.id,
        name: userMilestones.name,
        description: userMilestones.description,
        category: userMilestones.category,
        achievedAt: userMilestones.achievedAt,
        isManual: userMilestones.isManual,
        notes: userMilestones.notes,
      })
      .from(userMilestones)
      .where(eq(userMilestones.profileId, profile.id))
      .orderBy(desc(userMilestones.achievedAt))

    const definitions = await db
      .select()
      .from(milestoneDefinitions)
      .orderBy(milestoneDefinitions.sortOrder)

    return { achieved, definitions }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function runMilestoneEvaluation() {
  try {
    const profile = await getOrCreateProfile()
    const result = await evaluateMilestones(profile.id)
    return result
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function createManualMilestone(data: unknown) {
  try {
    const profile = await getOrCreateProfile()
    const validated = milestoneCreateSchema.parse(data)

    const [milestone] = await db
      .insert(userMilestones)
      .values({
        profileId: profile.id,
        name: validated.name,
        description: validated.description,
        category: validated.category || 'manual',
        achievedAt: validated.achievedAt,
        isManual: true,
        notes: validated.notes,
      })
      .returning()

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'user_milestone',
      entityId: milestone.id,
      action: 'create',
      changes: validated,
    })

    return { success: true, milestone }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Failed to create milestone' }
  }
}

export async function deleteUserMilestone(id: string) {
  try {
    const profile = await getOrCreateProfile()

    await db
      .delete(userMilestones)
      .where(
        and(
          eq(userMilestones.id, id),
          eq(userMilestones.profileId, profile.id),
        ),
      )

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'user_milestone',
      entityId: id,
      action: 'delete',
    })

    return { success: true }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Failed to delete milestone' }
  }
}
