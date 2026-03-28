import aircraftTypes from '@/lib/data/aircraft-types.json'

export type AircraftTypeInfo = {
  manufacturer: string
  model: string
  typeDesignator: string
  category: string
  class: string
  engineType: string
}

const normalizedIndex = new Map<string, AircraftTypeInfo[]>()

// Build a search index on first access
function getIndex(): Map<string, AircraftTypeInfo[]> {
  if (normalizedIndex.size > 0) return normalizedIndex

  for (const entry of aircraftTypes as AircraftTypeInfo[]) {
    const keys = [
      entry.model.toLowerCase(),
      `${entry.manufacturer.toLowerCase()} ${entry.model.toLowerCase()}`,
      entry.typeDesignator.toLowerCase(),
    ]
    for (const key of keys) {
      const existing = normalizedIndex.get(key) ?? []
      existing.push(entry)
      normalizedIndex.set(key, existing)
    }
  }

  return normalizedIndex
}

/**
 * Search the static aircraft type database by model name or type designator.
 * Returns matching aircraft types sorted by relevance.
 */
export function searchAircraftTypes(query: string): AircraftTypeInfo[] {
  if (!query || query.trim().length < 2) return []

  const index = getIndex()
  const normalizedQuery = query.toLowerCase().trim()
  const results = new Map<string, AircraftTypeInfo>()

  // Exact match on type designator or model
  const exact = index.get(normalizedQuery)
  if (exact) {
    for (const entry of exact) {
      results.set(`${entry.manufacturer}-${entry.model}`, entry)
    }
  }

  // Partial match
  for (const [key, entries] of index) {
    if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
      for (const entry of entries) {
        results.set(`${entry.manufacturer}-${entry.model}`, entry)
      }
    }
  }

  return Array.from(results.values()).slice(0, 20)
}
