import { z } from 'zod'

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v))

const aircraftBase = z.object({
  tailNumber: z
    .string()
    .min(1, 'Tail number is required')
    .max(20, 'Tail number must be 20 characters or fewer'),
  manufacturer: optionalString,
  model: optionalString,
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  category: optionalString,
  aircraftClass: optionalString,
  engineType: optionalString,
  isComplex: z.boolean().default(false),
  isHighPerformance: z.boolean().default(false),
  isMultiEngine: z.boolean().default(false),
  isTurbine: z.boolean().default(false),
  isTailwheel: z.boolean().default(false),
  isActive: z.boolean().default(true),
  notes: optionalString,
})

export const aircraftCreateSchema = aircraftBase

export const aircraftUpdateSchema = aircraftBase.partial()

export type AircraftCreate = z.infer<typeof aircraftCreateSchema>
export type AircraftUpdate = z.infer<typeof aircraftUpdateSchema>
