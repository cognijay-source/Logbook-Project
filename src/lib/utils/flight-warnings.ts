export interface FlightWarning {
  field: string
  message: string
  severity: 'info' | 'warning'
}

const TIME_FIELDS = [
  'totalTime',
  'pic',
  'sic',
  'dualReceived',
  'dualGiven',
  'solo',
  'night',
  'crossCountry',
  'actualInstrument',
  'simulatedInstrument',
  'multiEngine',
  'turbine',
] as const

export function checkFlightWarnings(
  formData: Record<string, unknown>,
): FlightWarning[] {
  const warnings: FlightWarning[] = []

  // Time field checks
  for (const field of TIME_FIELDS) {
    const raw = formData[field]
    if (raw === undefined || raw === null || raw === '') continue
    const strVal = String(raw)
    const value = parseFloat(strVal) || 0

    if (value <= 0) continue

    if (value > 24) {
      warnings.push({
        field,
        message: 'Total time exceeds 24 hours. This is likely an error.',
        severity: 'warning',
      })
    } else if (value > 12) {
      warnings.push({
        field,
        message: `${value} hours exceeds 12. Long flights are unusual — please double-check.`,
        severity: 'warning',
      })
    } else if (value > 8) {
      warnings.push({
        field,
        message: `${value} hours exceeds 8. Please verify.`,
        severity: 'info',
      })
    }

    // Check for possible decimal error (e.g., "15" instead of "1.5")
    if (value > 5 && !strVal.includes('.') && Number.isInteger(value)) {
      warnings.push({
        field,
        message: `Did you mean ${(value / 10).toFixed(1)}? Whole numbers above 5 are unusual for single flights.`,
        severity: 'warning',
      })
    }
  }

  // Landing count checks
  const dayLandings = parseInt(String(formData.dayLandings ?? '0')) || 0
  const nightLandings = parseInt(String(formData.nightLandings ?? '0')) || 0
  const totalLandings = dayLandings + nightLandings

  if (totalLandings > 20) {
    warnings.push({
      field: 'dayLandings',
      message: `${totalLandings} total landings on a single flight — please verify.`,
      severity: 'info',
    })
  }

  return warnings
}

// Common US IATA→ICAO airport code suggestions
const IATA_TO_ICAO: Record<string, string> = {
  JFK: 'KJFK',
  LAX: 'KLAX',
  ORD: 'KORD',
  ATL: 'KATL',
  SFO: 'KSFO',
  DFW: 'KDFW',
  DEN: 'KDEN',
  SEA: 'KSEA',
  MIA: 'KMIA',
  BOS: 'KBOS',
  IAH: 'KIAH',
  MSP: 'KMSP',
  DTW: 'KDTW',
  PHL: 'KPHL',
  LGA: 'KLGA',
  EWR: 'KEWR',
  CLT: 'KCLT',
  PHX: 'KPHX',
  IAD: 'KIAD',
  DCA: 'KDCA',
  BWI: 'KBWI',
  SAN: 'KSAN',
  TPA: 'KTPA',
  PDX: 'KPDX',
  STL: 'KSTL',
  BNA: 'KBNA',
  AUS: 'KAUS',
  RDU: 'KRDU',
  MCI: 'KMCI',
  SNA: 'KSNA',
  OAK: 'KOAK',
  SMF: 'KSMF',
  SJC: 'KSJC',
  IND: 'KIND',
  CVG: 'KCVG',
  PIT: 'KPIT',
  MKE: 'KMKE',
  CLE: 'KCLE',
  CMH: 'KCMH',
  SAT: 'KSAT',
  OMA: 'KOMA',
  BDL: 'KBDL',
  PVD: 'KPVD',
  BED: 'KBED',
}

export interface AirportHint {
  type: 'not_found' | 'iata_suggestion' | 'found'
  message: string
}

export function checkAirportCode(code: string): AirportHint | null {
  if (!code || code.length < 3) return null

  const upper = code.toUpperCase()

  // Check if it's a 3-character IATA code we know
  if (upper.length === 3 && IATA_TO_ICAO[upper]) {
    return {
      type: 'iata_suggestion',
      message: `Did you mean ${IATA_TO_ICAO[upper]}? US airports use 4-character ICAO codes.`,
    }
  }

  // Check if it's a 3-character code that could be a US ICAO
  if (upper.length === 3 && /^[A-Z]{3}$/.test(upper)) {
    return {
      type: 'iata_suggestion',
      message: `Did you mean K${upper}? US airports use 4-character ICAO codes.`,
    }
  }

  return null
}
