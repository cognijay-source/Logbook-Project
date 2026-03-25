import { z } from 'zod'

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v))

export const flightCrewSchema = z.object({
  crewRole: z.string().min(1, 'Crew role is required'),
  name: z.string().min(1, 'Name is required'),
  certificateNumber: optionalString,
  remarks: optionalString,
})

export type FlightCrew = z.infer<typeof flightCrewSchema>
