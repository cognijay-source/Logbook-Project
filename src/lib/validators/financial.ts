import { z } from 'zod'

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v))

const optionalUuid = z
  .string()
  .uuid('Invalid UUID')
  .optional()
  .or(z.literal(''))
  .transform((v) => (v === '' ? undefined : v))

const financialBase = z.object({
  entryType: z.enum(['expense', 'income'], {
    required_error: 'Entry type is required',
  }),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce
    .number({ message: 'Amount must be a valid number' })
    .positive('Amount must be positive'),
  entryDate: z
    .string()
    .min(1, 'Entry date is required')
    .date('Invalid date format'),
  description: optionalString,
  aircraftId: optionalUuid,
  flightId: optionalUuid,
  careerPhase: optionalString,
  vendor: optionalString,
  notes: optionalString,
})

export const financialEntryCreateSchema = financialBase

export const financialEntryUpdateSchema = financialBase.partial()

export type FinancialEntryCreate = z.infer<typeof financialEntryCreateSchema>
export type FinancialEntryCreateInput = z.input<
  typeof financialEntryCreateSchema
>
export type FinancialEntryUpdate = z.infer<typeof financialEntryUpdateSchema>
