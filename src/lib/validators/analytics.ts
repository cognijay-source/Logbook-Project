import { z } from 'zod'

export const analyticsDateRangeSchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
})

export type AnalyticsDateRange = z.infer<typeof analyticsDateRangeSchema>
