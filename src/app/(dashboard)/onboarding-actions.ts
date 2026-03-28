'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'
import { createAuditEvent } from '@/lib/services/audit'
import { z } from 'zod'

const aircraftSchema = z.object({
  tailNumber: z.string().min(1, 'Tail number is required'),
  makeModel: z.string().optional(),
  category: z.string().optional(),
  aircraftClass: z.string().optional(),
})

export async function createOnboardingAircraft(
  data: unknown,
): Promise<{ error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    const parsed = aircraftSchema.parse(data)

    const parts = parsed.makeModel?.split(' ') ?? []
    const manufacturer = parts.length > 0 ? parts[0] : undefined
    const model = parts.length > 1 ? parts.slice(1).join(' ') : undefined

    await db.insert(schema.aircraft).values({
      profileId: profile.id,
      tailNumber: parsed.tailNumber,
      manufacturer: manufacturer || null,
      model: model || parsed.makeModel || null,
      category: parsed.category || null,
      aircraftClass: parsed.aircraftClass || null,
      isMultiEngine:
        parsed.aircraftClass === 'Multi-Engine Land' ||
        parsed.aircraftClass === 'Multi-Engine Sea',
    })

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'aircraft',
      entityId: profile.id,
      action: 'create',
      changes: parsed,
    })

    return { error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(', ') }
    }
    return { error: 'Failed to create aircraft' }
  }
}

export async function completeOnboarding(
  goalCode: string | null,
): Promise<{ error: string | null }> {
  try {
    const profile = await getOrCreateProfile()

    // Set onboarding completed
    await db
      .update(schema.profiles)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(schema.profiles.id, profile.id))

    // Assign goal if selected
    if (goalCode) {
      const goalProfiles = await db
        .select()
        .from(schema.goalProfiles)
        .where(eq(schema.goalProfiles.code, goalCode))
        .limit(1)

      if (goalProfiles.length > 0) {
        // Deactivate existing goals
        await db
          .update(schema.userGoalAssignments)
          .set({ isActive: false })
          .where(
            and(
              eq(schema.userGoalAssignments.profileId, profile.id),
              eq(schema.userGoalAssignments.isActive, true),
            ),
          )

        // Assign the new goal
        await db.insert(schema.userGoalAssignments).values({
          profileId: profile.id,
          goalProfileId: goalProfiles[0].id,
          isActive: true,
        })
      }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'profile',
      entityId: profile.id,
      action: 'onboarding_complete',
      changes: { goalCode },
    })

    return { error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { error: 'Failed to complete onboarding' }
  }
}

export async function checkOnboardingStatus(): Promise<{
  showWizard: boolean
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()

    if (profile.onboardingCompleted) {
      return { showWizard: false, error: null }
    }

    // Check if user has any flights — if so, silently complete onboarding
    const flightCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.flights)
      .where(eq(schema.flights.profileId, profile.id))

    const count = Number(flightCount[0]?.count) || 0

    if (count > 0) {
      await db
        .update(schema.profiles)
        .set({ onboardingCompleted: true, updatedAt: new Date() })
        .where(eq(schema.profiles.id, profile.id))

      return { showWizard: false, error: null }
    }

    return { showWizard: true, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { showWizard: false, error: 'Failed to check onboarding status' }
  }
}
