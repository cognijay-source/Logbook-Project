'use server'

import * as Sentry from '@sentry/nextjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { createAuditEvent } from '@/lib/services/audit'
import { getOrCreateProfile } from '@/lib/services/profile'
import {
  profileUpdateSchema,
  preferencesSchema,
  changePasswordSchema,
} from '@/lib/validators/settings'

export async function getProfile() {
  try {
    const profile = await getOrCreateProfile()

    const pilotProfile = await db
      .select()
      .from(schema.pilotProfiles)
      .where(eq(schema.pilotProfiles.profileId, profile.id))
      .limit(1)

    return {
      data: {
        profile,
        pilotProfile: pilotProfile[0] ?? null,
      },
      error: null,
    }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to fetch profile' }
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const profile = await getOrCreateProfile()

    const raw = {
      displayName: formData.get('displayName') as string,
      certificateLevel: formData.get('certificateLevel') as string,
      certificateNumber: formData.get('certificateNumber') as string,
      medicalClass: formData.get('medicalClass') as string,
      medicalExpiry: formData.get('medicalExpiry') as string,
      homeAirport: formData.get('homeAirport') as string,
      careerPhase: formData.get('careerPhase') as string,
    }

    const parsed = profileUpdateSchema.safeParse(raw)

    if (!parsed.success) {
      return { data: null, error: parsed.error.flatten().fieldErrors }
    }

    const values = parsed.data

    // Update display name on profile
    await db
      .update(schema.profiles)
      .set({
        displayName: values.displayName ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, profile.id))

    // Upsert pilot profile
    const medicalExpiry = values.medicalExpiry
      ? new Date(values.medicalExpiry)
      : null

    const existing = await db
      .select()
      .from(schema.pilotProfiles)
      .where(eq(schema.pilotProfiles.profileId, profile.id))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(schema.pilotProfiles)
        .set({
          certificateLevel: values.certificateLevel ?? null,
          certificateNumber: values.certificateNumber ?? null,
          medicalClass: values.medicalClass ?? null,
          medicalExpiry,
          homeAirport: values.homeAirport ?? null,
          careerPhase: values.careerPhase ?? null,
          updatedAt: new Date(),
        })
        .where(eq(schema.pilotProfiles.profileId, profile.id))
    } else {
      await db.insert(schema.pilotProfiles).values({
        profileId: profile.id,
        certificateLevel: values.certificateLevel ?? null,
        certificateNumber: values.certificateNumber ?? null,
        medicalClass: values.medicalClass ?? null,
        medicalExpiry,
        homeAirport: values.homeAirport ?? null,
        careerPhase: values.careerPhase ?? null,
      })
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'profile',
      entityId: profile.id,
      action: 'update',
      changes: values,
    })

    return { data: true, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to update profile' }
  }
}

export async function updatePreferences(formData: FormData) {
  try {
    const profile = await getOrCreateProfile()

    const raw = {
      timeFormat: formData.get('timeFormat') as string,
      timezone: formData.get('timezone') as string,
    }

    const parsed = preferencesSchema.safeParse(raw)

    if (!parsed.success) {
      return { data: null, error: parsed.error.flatten().fieldErrors }
    }

    const values = parsed.data

    await db
      .update(schema.profiles)
      .set({
        timeFormat: values.timeFormat,
        timezone: values.timezone,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, profile.id))

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'profile',
      entityId: profile.id,
      action: 'update_preferences',
      changes: values,
    })

    return { data: true, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to update preferences' }
  }
}

export async function changePassword(formData: FormData) {
  try {
    const profile = await getOrCreateProfile()

    const raw = {
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const parsed = changePasswordSchema.safeParse(raw)

    if (!parsed.success) {
      return { data: null, error: parsed.error.flatten().fieldErrors }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    })

    if (error) {
      return { data: null, error: error.message }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'profile',
      entityId: profile.id,
      action: 'password_changed',
    })

    return { data: true, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to change password' }
  }
}

export async function deleteAccount() {
  try {
    const profile = await getOrCreateProfile()

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'profile',
      entityId: profile.id,
      action: 'account_deleted',
    })

    // Delete the profile row — all related data cascades
    await db.delete(schema.profiles).where(eq(schema.profiles.id, profile.id))

    // Delete the Supabase Auth user
    const supabase = await createClient()

    // Sign out to clear the session
    await supabase.auth.signOut()

    return { error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { error: 'Failed to delete account' }
  }
}
