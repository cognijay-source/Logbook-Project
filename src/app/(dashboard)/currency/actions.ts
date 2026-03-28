'use server'

import * as Sentry from '@sentry/nextjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'
import type { CurrencyResult } from '@/lib/services/currency-evaluator'
import { evaluateCurrency } from '@/lib/services/currency-evaluator'
import {
  evaluateMedical,
  type MedicalInfo,
} from '@/lib/services/medical-calculator'

export type CurrencyPageData = {
  currency: CurrencyResult[]
  medical: MedicalInfo | null
}

export async function getCurrencyStatus(): Promise<{
  data: CurrencyPageData | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()

    const [currency, pilotProfile] = await Promise.all([
      evaluateCurrency(profile.id),
      db
        .select()
        .from(schema.pilotProfiles)
        .where(eq(schema.pilotProfiles.profileId, profile.id))
        .limit(1),
    ])

    const pp = pilotProfile[0] ?? null
    const medical = pp
      ? evaluateMedical(
          pp.medicalClass,
          pp.medicalIssueDate,
          pp.medicalExpiry?.toISOString().split('T')[0] ?? null,
          pp.dateOfBirth,
        )
      : null

    return { data: { currency, medical }, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load currency status',
    }
  }
}

export async function refreshCurrency(): Promise<{
  data: CurrencyPageData | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()

    const [currency, pilotProfile] = await Promise.all([
      evaluateCurrency(profile.id),
      db
        .select()
        .from(schema.pilotProfiles)
        .where(eq(schema.pilotProfiles.profileId, profile.id))
        .limit(1),
    ])

    const pp = pilotProfile[0] ?? null
    const medical = pp
      ? evaluateMedical(
          pp.medicalClass,
          pp.medicalIssueDate,
          pp.medicalExpiry?.toISOString().split('T')[0] ?? null,
          pp.dateOfBirth,
        )
      : null

    return { data: { currency, medical }, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to refresh currency status',
    }
  }
}
