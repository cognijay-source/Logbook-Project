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

export const flightLegSchema = z.object({
  legOrder: z.coerce.number().int().min(1, 'Leg order must be at least 1'),
  departureAirport: optionalString,
  arrivalAirport: optionalString,
  departureTime: z
    .string()
    .datetime({ message: 'Invalid ISO date-time' })
    .optional()
    .or(z.literal('')),
  arrivalTime: z
    .string()
    .datetime({ message: 'Invalid ISO date-time' })
    .optional()
    .or(z.literal('')),
  totalTime: optionalNumericString,
  remarks: optionalString,
})

export type FlightLeg = z.infer<typeof flightLegSchema>
