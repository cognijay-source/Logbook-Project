import { z } from 'zod'

export const refreshCurrencySchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
})

export type RefreshCurrency = z.infer<typeof refreshCurrencySchema>
