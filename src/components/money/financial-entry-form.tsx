'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Sentry from '@sentry/nextjs'
import {
  financialEntryCreateSchema,
  type FinancialEntryCreate,
} from '@/lib/validators/financial'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const EXPENSE_CATEGORIES = [
  'Flight Training',
  'Fuel',
  'Aircraft Rental',
  'Maintenance',
  'Insurance',
  'Examiner Fees',
  'Medical',
  'Supplies',
  'Other',
]

const INCOME_CATEGORIES = [
  'Flight Instruction',
  'Charter',
  'Salary',
  'Stipend',
  'Reimbursement',
  'Other',
]

const CAREER_PHASES = [
  'Student',
  'Private',
  'Instrument',
  'Commercial',
  'CFI',
  'Regional FO',
  '135 Pilot',
  'Other',
]

type FinancialEntryFormProps = {
  defaultValues?: Partial<FinancialEntryCreate>
  onSubmit: (data: FinancialEntryCreate) => Promise<void>
  isSubmitting?: boolean
}

export function FinancialEntryForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: FinancialEntryFormProps) {
  const form = useForm<FinancialEntryCreate>({
    resolver: zodResolver(financialEntryCreateSchema),
    defaultValues: {
      entryType: defaultValues?.entryType ?? 'expense',
      category: defaultValues?.category ?? '',
      amount: defaultValues?.amount ?? (undefined as unknown as number),
      entryDate:
        defaultValues?.entryDate ?? new Date().toISOString().split('T')[0],
      description: defaultValues?.description ?? '',
      careerPhase: defaultValues?.careerPhase ?? '',
      vendor: defaultValues?.vendor ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  const entryType = form.watch('entryType')
  const categories =
    entryType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  // Reset category when entry type changes if current category is not in new list
  React.useEffect(() => {
    const currentCategory = form.getValues('category')
    if (currentCategory && !categories.includes(currentCategory)) {
      form.setValue('category', '')
    }
  }, [entryType, categories, form])

  async function handleSubmit(data: FinancialEntryCreate) {
    try {
      await onSubmit(data)
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="entryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                      field.value === 'expense'
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-input bg-background hover:bg-accent'
                    }`}
                    onClick={() => field.onChange('expense')}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                      field.value === 'income'
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-input bg-background hover:bg-accent'
                    }`}
                    onClick={() => field.onChange('income')}
                  >
                    Income
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Description"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="careerPhase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Career Phase</FormLabel>
              <FormControl>
                <select
                  className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                >
                  <option value="">Select phase</option>
                  {CAREER_PHASES.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <FormControl>
                <Input
                  placeholder="Vendor"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <textarea
                  className="border-input bg-background focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                  placeholder="Notes"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : defaultValues?.entryType
              ? 'Update Entry'
              : 'Record Entry'}
        </Button>
      </form>
    </Form>
  )
}
