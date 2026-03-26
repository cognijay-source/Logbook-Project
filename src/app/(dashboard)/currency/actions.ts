'use server'

import * as Sentry from '@sentry/nextjs'
import { getOrCreateProfile } from '@/lib/services/profile'
import type { CurrencyResult } from '@/lib/services/currency-evaluator'
import { evaluateCurrency } from '@/lib/services/currency-evaluator'

export async function getCurrencyStatus(): Promise<CurrencyResult[]> {
  try {
    const profile = await getOrCreateProfile()
    return await evaluateCurrency(profile.id)
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function refreshCurrency(): Promise<CurrencyResult[]> {
  try {
    const profile = await getOrCreateProfile()
    return await evaluateCurrency(profile.id)
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
