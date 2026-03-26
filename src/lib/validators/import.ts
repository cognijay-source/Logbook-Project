import { z } from 'zod'

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v))

const optionalNumericString = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === '' || v === undefined || v === null) return undefined
    const n = Number(v)
    if (isNaN(n)) return undefined
    return n
  })
  .pipe(z.number().min(0).optional())

const optionalInt = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === '' || v === undefined || v === null) return undefined
    const n = Number(v)
    if (isNaN(n) || !Number.isInteger(n)) return undefined
    return n
  })
  .pipe(z.number().int().min(0).optional())

export const importRowSchema = z.object({
  aircraftId: z
    .string()
    .uuid('Invalid aircraft ID')
    .optional()
    .or(z.literal('')),
  flightDate: z
    .string()
    .min(1, 'Flight date is required')
    .date('Invalid date format'),
  departureAirport: optionalString,
  arrivalAirport: optionalString,
  route: optionalString,

  // Flight times
  totalTime: optionalNumericString,
  pic: optionalNumericString,
  sic: optionalNumericString,
  crossCountry: optionalNumericString,
  night: optionalNumericString,
  actualInstrument: optionalNumericString,
  simulatedInstrument: optionalNumericString,
  dualReceived: optionalNumericString,
  dualGiven: optionalNumericString,
  solo: optionalNumericString,
  multiEngine: optionalNumericString,
  turbine: optionalNumericString,

  // Landings
  dayLandings: optionalInt,
  nightLandings: optionalInt,
  holds: optionalInt,

  // Classification
  operationType: optionalString,
  roleType: optionalString,
  remarks: optionalString,
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'final', 'archived']).default('draft'),

  // Flags
  isSoloFlight: z.boolean().default(false),
  isCheckride: z.boolean().default(false),

  // Import-specific: raw tail number for matching
  tailNumber: optionalString,
})

export type ImportRow = z.infer<typeof importRowSchema>

// ---------- SkyLog flight fields that can be mapped from CSV ----------

export const skylogFields = [
  'flightDate',
  'tailNumber',
  'departureAirport',
  'arrivalAirport',
  'route',
  'totalTime',
  'pic',
  'sic',
  'crossCountry',
  'night',
  'actualInstrument',
  'simulatedInstrument',
  'dualReceived',
  'dualGiven',
  'solo',
  'multiEngine',
  'turbine',
  'dayLandings',
  'nightLandings',
  'holds',
  'remarks',
] as const

export type SkylogField = (typeof skylogFields)[number]

export const skylogFieldLabels: Record<SkylogField, string> = {
  flightDate: 'Flight Date',
  tailNumber: 'Tail Number',
  departureAirport: 'Departure Airport',
  arrivalAirport: 'Arrival Airport',
  route: 'Route',
  totalTime: 'Total Time',
  pic: 'PIC',
  sic: 'SIC',
  crossCountry: 'Cross Country',
  night: 'Night',
  actualInstrument: 'Actual Instrument',
  simulatedInstrument: 'Simulated Instrument',
  dualReceived: 'Dual Received',
  dualGiven: 'Dual Given',
  solo: 'Solo',
  multiEngine: 'Multi-Engine',
  turbine: 'Turbine',
  dayLandings: 'Day Landings',
  nightLandings: 'Night Landings',
  holds: 'Holds',
  remarks: 'Remarks',
}

// ---------- Column mapping schema ----------

export const columnMappingSchema = z.record(
  z.string(), // CSV column name
  z.enum([...skylogFields, '' as const]), // SkyLog field or unmapped
)

export type ColumnMapping = z.infer<typeof columnMappingSchema>

export const processImportSchema = z.object({
  batchId: z.string().uuid('Invalid batch ID'),
  columnMapping: columnMappingSchema,
})

export const retryImportSchema = z.object({
  batchId: z.string().uuid('Invalid batch ID'),
})

// ---------- Auto-detect column mappings for popular logbook apps ----------

type ColumnAliasMap = Record<string, SkylogField>

const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, '')

const foreflightAliases: ColumnAliasMap = {
  date: 'flightDate',
  aircraftid: 'tailNumber',
  from: 'departureAirport',
  to: 'arrivalAirport',
  route: 'route',
  totaltime: 'totalTime',
  pic: 'pic',
  sic: 'sic',
  crosscountry: 'crossCountry',
  night: 'night',
  actualinstrument: 'actualInstrument',
  simulatedinstrument: 'simulatedInstrument',
  dualreceived: 'dualReceived',
  dualrecd: 'dualReceived',
  dualgiven: 'dualGiven',
  solo: 'solo',
  daylandingsfullstop: 'dayLandings',
  nightlandingsfullstop: 'nightLandings',
  holds: 'holds',
  remarks: 'remarks',
  pilotcomments: 'remarks',
  multiengine: 'multiEngine',
  turbine: 'turbine',
}

const logtenProAliases: ColumnAliasMap = {
  flightdate: 'flightDate',
  date: 'flightDate',
  aircrafttype: 'tailNumber',
  aircraftid: 'tailNumber',
  aircraftident: 'tailNumber',
  departurecode: 'departureAirport',
  departureplace: 'departureAirport',
  arrivalcode: 'arrivalAirport',
  arrivalplace: 'arrivalAirport',
  route: 'route',
  totaltime: 'totalTime',
  totalduration: 'totalTime',
  pic: 'pic',
  pilofincommand: 'pic',
  sic: 'sic',
  secondincommand: 'sic',
  crosscountry: 'crossCountry',
  night: 'night',
  nighttime: 'night',
  actualinstrument: 'actualInstrument',
  simulatedinstrument: 'simulatedInstrument',
  hoodinstrument: 'simulatedInstrument',
  dualreceived: 'dualReceived',
  dualgiven: 'dualGiven',
  instructor: 'dualGiven',
  solo: 'solo',
  daylandings: 'dayLandings',
  nightlandings: 'nightLandings',
  holds: 'holds',
  remarks: 'remarks',
  flightremarks: 'remarks',
  multiengine: 'multiEngine',
  turbine: 'turbine',
}

const myFlightBookAliases: ColumnAliasMap = {
  date: 'flightDate',
  tailnumber: 'tailNumber',
  tail: 'tailNumber',
  from: 'departureAirport',
  to: 'arrivalAirport',
  route: 'route',
  totalflighttime: 'totalTime',
  total: 'totalTime',
  pic: 'pic',
  sic: 'sic',
  crosscountry: 'crossCountry',
  xc: 'crossCountry',
  night: 'night',
  imcsimulated: 'simulatedInstrument',
  imc: 'actualInstrument',
  dualreceived: 'dualReceived',
  cfi: 'dualGiven',
  solo: 'solo',
  daylandingsfullstop: 'dayLandings',
  fulltouchandgolandings: 'dayLandings',
  nightlandingsfullstop: 'nightLandings',
  holds: 'holds',
  comments: 'remarks',
  multiengine: 'multiEngine',
  turbine: 'turbine',
}

const allAliases: ColumnAliasMap = {
  ...myFlightBookAliases,
  ...logtenProAliases,
  ...foreflightAliases,
}

/**
 * Given CSV column headers, returns a best-guess mapping to SkyLog fields.
 * Unrecognized columns are mapped to '' (unmapped).
 */
// ---------- AI-parsed flight schema ----------

const nullableString = z
  .string()
  .nullable()
  .transform((v) => (v === '' ? null : v))

const nullableNumeric = z
  .union([z.string(), z.number()])
  .nullable()
  .transform((v) => {
    if (v === '' || v === undefined || v === null) return null
    const n = Number(v)
    if (isNaN(n)) return null
    return n
  })
  .pipe(z.number().min(0).nullable())

const nullableInt = z
  .union([z.string(), z.number()])
  .nullable()
  .transform((v) => {
    if (v === '' || v === undefined || v === null) return null
    const n = Number(v)
    if (isNaN(n) || !Number.isInteger(n)) return null
    return n
  })
  .pipe(z.number().int().min(0).nullable())

export const aiParsedFlightSchema = z.object({
  date: nullableString,
  aircraft_type: nullableString,
  aircraft_ident: nullableString,
  route_from: nullableString,
  route_to: nullableString,
  route_via: nullableString,
  total_time: nullableNumeric,
  pic_time: nullableNumeric,
  sic_time: nullableNumeric,
  dual_received: nullableNumeric,
  cross_country: nullableNumeric,
  night_time: nullableNumeric,
  instrument_actual: nullableNumeric,
  instrument_simulated: nullableNumeric,
  day_landings: nullableInt,
  night_landings: nullableInt,
  remarks: nullableString,
})

export type AiParsedFlight = z.infer<typeof aiParsedFlightSchema>

/** Fields where AI returned null — these need user review */
export function getNeedsReviewFields(flight: AiParsedFlight): string[] {
  const required: (keyof AiParsedFlight)[] = ['date', 'aircraft_ident', 'route_from', 'route_to', 'total_time']
  return required.filter((key) => flight[key] === null)
}

export function autoDetectMapping(csvColumns: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  const usedFields = new Set<string>()

  for (const col of csvColumns) {
    const key = normalize(col)
    const match = allAliases[key]
    if (match && !usedFields.has(match)) {
      mapping[col] = match
      usedFields.add(match)
    } else {
      mapping[col] = ''
    }
  }

  return mapping
}
