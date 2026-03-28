'use client'

import { useCallback } from 'react'

const STORAGE_KEY = 'crosscheck-flight-defaults'

export interface FlightDefaults {
  aircraftId?: string
  departureAirport?: string
  operationType?: string
  roleType?: string
}

export function useFlightDefaults() {
  const getDefaults = useCallback((): FlightDefaults => {
    if (typeof window === 'undefined') return {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return {}
      return JSON.parse(raw) as FlightDefaults
    } catch {
      return {}
    }
  }, [])

  const saveDefaults = useCallback((values: FlightDefaults) => {
    if (typeof window === 'undefined') return
    try {
      const existing = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? '{}',
      ) as FlightDefaults
      const merged = { ...existing, ...values }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    } catch {
      // Ignore storage errors
    }
  }, [])

  const clearDefaults = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { getDefaults, saveDefaults, clearDefaults }
}
