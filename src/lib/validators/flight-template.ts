import { z } from 'zod'

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v))

export const flightTemplateCreateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  aircraftId: optionalString,
  departureAirport: optionalString,
  arrivalAirport: optionalString,
  route: optionalString,
  operationType: optionalString,
  role: optionalString,
  instructorName: optionalString,
  instructorCertNumber: optionalString,
  defaultTotalTime: optionalString,
  isFavorite: z.boolean().default(false),
})

export const flightTemplateUpdateSchema = flightTemplateCreateSchema.partial()

export type FlightTemplateCreate = z.infer<typeof flightTemplateCreateSchema>
export type FlightTemplateUpdate = z.infer<typeof flightTemplateUpdateSchema>
