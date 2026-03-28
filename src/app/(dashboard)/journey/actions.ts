'use server'

import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import { userMilestones, milestoneDefinitions } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { getOrCreateProfile } from '@/lib/services/profile'
import { evaluateMilestones } from '@/lib/services/milestone-engine'
import { createAuditEvent } from '@/lib/services/audit'
import { milestoneCreateSchema } from '@/lib/validators/milestone'

export async function getMilestoneTimeline(params?: {
  page?: number
  pageSize?: number
}) {
  try {
    const profile = await getOrCreateProfile()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50

    const [achieved, countResult, definitions] = await Promise.all([
      db
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
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql<number>`count(*)` })
        .from(userMilestones)
        .where(eq(userMilestones.profileId, profile.id)),
      db
        .select()
        .from(milestoneDefinitions)
        .orderBy(milestoneDefinitions.sortOrder),
    ])

    const total = Number(countResult[0]?.count) || 0

    return {
      data: { achieved, definitions },
      total,
      page,
      pageSize,
      error: null,
    }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      total: 0,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load milestone timeline',
    }
  }
}

export async function runMilestoneEvaluation() {
  try {
    const profile = await getOrCreateProfile()
    const result = await evaluateMilestones(profile.id)
    return { data: result, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to run milestone evaluation',
    }
  }
}

export async function createManualMilestone(data: unknown) {
  try {
    const profile = await getOrCreateProfile()
    const validated = milestoneCreateSchema.parse(data)

    const inserted = await db
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

    const milestone = inserted[0]
    if (!milestone) {
      return { data: null, error: 'Failed to create milestone' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'user_milestone',
      entityId: milestone.id,
      action: 'create',
      changes: validated,
    })

    return { data: milestone, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to create milestone' }
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

    return { error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { error: 'Failed to delete milestone' }
  }
}
