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

const flightBaseObject = z.object({
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
  nightLandingsFullStop: optionalInt,
  holds: optionalInt,

  // Personnel
  instructorName: optionalString,
  instructorCertNumber: optionalString,
  safetyPilotName: optionalString,

  // Classification
  operationType: optionalString,
  roleType: optionalString,
  remarks: optionalString,
  tags: z.string().optional(),
  status: z.enum(['draft', 'final', 'archived']).default('draft'),

  // Flags
  isSoloFlight: z.boolean().default(false),
  isCheckride: z.boolean().default(false),
})

function crossFieldValidation(
  data: z.infer<typeof flightBaseObject>,
  ctx: z.RefinementCtx,
) {
  const total = data.totalTime ?? 0
  const pic = data.pic ?? 0
  const sic = data.sic ?? 0
  const dual = data.dualReceived ?? 0
  const solo = data.solo ?? 0
  const night = data.night ?? 0
  const xc = data.crossCountry ?? 0
  const actualInst = data.actualInstrument ?? 0
  const simInst = data.simulatedInstrument ?? 0
  const dualGiven = data.dualGiven ?? 0
  const multiEngine = data.multiEngine ?? 0
  const nightFull = data.nightLandingsFullStop ?? 0
  const nightTotal = data.nightLandings ?? 0

  if (solo > 0 && dual > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A flight cannot be both solo and dual received',
      path: ['solo'],
    })
  }

  if (pic > total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'PIC time cannot exceed total time',
      path: ['pic'],
    })
  }
  if (sic > total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'SIC time cannot exceed total time',
      path: ['sic'],
    })
  }
  if (night > total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Night time cannot exceed total time',
      path: ['night'],
    })
  }
  if (xc > total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Cross-country time cannot exceed total time',
      path: ['crossCountry'],
    })
  }
  if (actualInst + simInst > total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Total instrument time cannot exceed total time',
      path: ['actualInstrument'],
    })
  }
  if (dual > total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Dual received cannot exceed total time',
      path: ['dualReceived'],
    })
  }
  if (solo > total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Solo time cannot exceed total time',
      path: ['solo'],
    })
  }
  if (dualGiven > total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Dual given cannot exceed total time',
      path: ['dualGiven'],
    })
  }
  if (multiEngine > total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Multi-engine time cannot exceed total time',
      path: ['multiEngine'],
    })
  }

  if (nightFull > nightTotal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Night full-stop landings cannot exceed total night landings',
      path: ['nightLandingsFullStop'],
    })
  }

  if (
    total === 0 &&
    (pic > 0 || sic > 0 || dual > 0 || solo > 0 || night > 0 || xc > 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Total time cannot be zero when subcategory times are logged',
      path: ['totalTime'],
    })
  }
}

export const flightCreateSchema = flightBaseObject
  .superRefine(crossFieldValidation)
  .transform((data) => ({
    ...data,
    aircraftId: data.aircraftId === '' ? undefined : data.aircraftId,
  }))

export const flightUpdateSchema = flightBaseObject.partial()

export type FlightCreate = z.infer<typeof flightCreateSchema>
export type FlightUpdate = z.infer<typeof flightUpdateSchema>
