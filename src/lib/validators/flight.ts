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

const flightBase = z.object({
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
})

export const flightCreateSchema = flightBase.transform((data) => ({
  ...data,
  aircraftId: data.aircraftId === '' ? undefined : data.aircraftId,
}))

export const flightUpdateSchema = flightBase.partial()

export type FlightCreate = z.infer<typeof flightCreateSchema>
export type FlightUpdate = z.infer<typeof flightUpdateSchema>
