'use server'

import * as Sentry from '@sentry/nextjs'
import { getOrCreateProfile } from '@/lib/services/profile'
import type { CurrencyResult } from '@/lib/services/currency-evaluator'
import { evaluateCurrency } from '@/lib/services/currency-evaluator'

export async function getCurrencyStatus(): Promise<{
  data: CurrencyResult[] | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const results = await evaluateCurrency(profile.id)
    return { data: results, error: null }
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
  data: CurrencyResult[] | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const results = await evaluateCurrency(profile.id)
    return { data: results, error: null }
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
