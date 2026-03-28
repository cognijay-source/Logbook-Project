import { z } from 'zod'

export const goalAssignmentSchema = z.object({
  goalProfileId: z.string().uuid('Invalid goal profile ID'),
  isActive: z.boolean().default(true),
})

export type GoalAssignment = z.infer<typeof goalAssignmentSchema>

export const goalChecklistToggleSchema = z.object({
  requirementId: z.string().uuid('Invalid requirement ID'),
  completed: z.boolean(),
  completedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
  notes: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
})

export type GoalChecklistToggle = z.infer<typeof goalChecklistToggleSchema>
