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

export const paymentMethodEnum = z.enum([
  'cash',
  'loan',
  'scholarship',
  'gi_bill',
  'other',
])

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
  paymentMethod: paymentMethodEnum.optional(),
  notes: optionalString,
})

export const financialEntryCreateSchema = financialBase

export const financialEntryUpdateSchema = financialBase.partial()

export type FinancialEntryCreate = z.infer<typeof financialEntryCreateSchema>
export type FinancialEntryCreateInput = z.input<
  typeof financialEntryCreateSchema
>
export type FinancialEntryUpdate = z.infer<typeof financialEntryUpdateSchema>

// Loan validators
export const loanCreateSchema = z.object({
  name: z.string().min(1, 'Loan name is required'),
  principalAmount: z.coerce
    .number({ message: 'Principal must be a valid number' })
    .positive('Principal must be positive'),
  interestRate: z.coerce.number().min(0).max(1).optional(),
  monthlyPayment: z.coerce.number().positive().optional(),
  startDate: z.string().date().optional(),
  termMonths: z.coerce.number().int().positive().optional(),
  remainingBalance: z.coerce.number().min(0).optional(),
  notes: optionalString,
})

export const loanUpdateSchema = loanCreateSchema.partial()

export type LoanCreate = z.infer<typeof loanCreateSchema>
export type LoanUpdate = z.infer<typeof loanUpdateSchema>
