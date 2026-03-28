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

export async function getCurrencyStatus(): Promise<CurrencyPageData> {
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

    return { currency, medical }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function refreshCurrency(): Promise<CurrencyPageData> {
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

    return { currency, medical }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
