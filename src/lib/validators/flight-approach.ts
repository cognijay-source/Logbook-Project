import { z } from 'zod'

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v))

export const flightApproachSchema = z.object({
  approachType: z.string().min(1, 'Approach type is required'),
  runway: optionalString,
  airport: optionalString,
  isCircleToLand: z.boolean().default(false),
  remarks: optionalString,
})

export type FlightApproach = z.infer<typeof flightApproachSchema>
