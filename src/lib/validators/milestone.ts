import { z } from 'zod'

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v))

const milestoneBase = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or fewer'),
  description: optionalString,
  category: optionalString,
  achievedAt: z
    .string()
    .date('Invalid date format')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' ? undefined : v)),
  notes: optionalString,
})

export const milestoneCreateSchema = milestoneBase

export const milestoneUpdateSchema = milestoneBase.partial()

export type MilestoneCreate = z.infer<typeof milestoneCreateSchema>
export type MilestoneUpdate = z.infer<typeof milestoneUpdateSchema>
