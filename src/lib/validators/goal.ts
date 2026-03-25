import { z } from 'zod'

export const goalAssignmentSchema = z.object({
  goalProfileId: z.string().uuid('Invalid goal profile ID'),
  isActive: z.boolean().default(true),
})

export type GoalAssignment = z.infer<typeof goalAssignmentSchema>
