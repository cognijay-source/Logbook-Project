'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { SummaryCards } from '@/components/money/summary-cards'
import { EntryCard } from '@/components/money/entry-card'
import { FinancialEntryForm } from '@/components/money/financial-entry-form'
import type { FinancialEntryCreate } from '@/lib/validators/financial'
import { useToast } from '@/hooks/use-toast'
import {
  getFinancialEntries,
  createFinancialEntry,
  updateFinancialEntry,
  deleteFinancialEntry,
  getFinancialOverview,
  type FinancialEntry,
} from './actions'

type Period = 'month' | 'year' | 'all'

function getPeriodParams(period: Period): { year?: number; month?: number } {
  const now = new Date()
  switch (period) {
    case 'month':
      return { year: now.getFullYear(), month: now.getMonth() + 1 }
    case 'year':
      return { year: now.getFullYear() }
    case 'all':
      return {}
  }
}

export default function MoneyPage() {
  const [period, setPeriod] = React.useState<Period>('month')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingEntry, setEditingEntry] = React.useState<FinancialEntry | null>(
    null,
  )
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const periodParams = getPeriodParams(period)

  const entriesQuery = useQuery({
    queryKey: ['financial-entries', periodParams],
    queryFn: () => getFinancialEntries(periodParams),
  })

  const overviewQuery = useQuery({
    queryKey: ['financial-overview', periodParams],
    queryFn: () => getFinancialOverview(periodParams),
  })

  const createMutation = useMutation({
    mutationFn: (data: FinancialEntryCreate) => createFinancialEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] })
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] })
      setDialogOpen(false)
      toast({
        title: 'Entry added',
        description: 'Financial entry created successfully.',
      })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Failed to create entry. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FinancialEntryCreate }) =>
      updateFinancialEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] })
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] })
      setDialogOpen(false)
      setEditingEntry(null)
      toast({
        title: 'Entry updated',
        description: 'Financial entry updated successfully.',
      })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Failed to update entry. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFinancialEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] })
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] })
      toast({ title: 'Entry deleted', description: 'Financial entry removed.' })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Failed to delete entry. Please try again.',
        variant: 'destructive',
      })
    },
  })

  function handleEdit(id: string) {
    const entry = entriesQuery.data?.find((e) => e.id === id)
    if (entry) {
      setEditingEntry(entry)
      setDialogOpen(true)
    }
  }

  function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteMutation.mutate(id)
    }
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setEditingEntry(null)
    }
    setDialogOpen(open)
  }

  async function handleFormSubmit(data: FinancialEntryCreate) {
    if (editingEntry) {
      await updateMutation.mutateAsync({ id: editingEntry.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Money</h1>
          <p className="text-muted-foreground mt-1">
            Track your aviation expenses and income.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </div>

      {/* Period filter */}
      <div className="flex gap-2">
        {(
          [
            { value: 'month', label: 'This Month' },
            { value: 'year', label: 'This Year' },
            { value: 'all', label: 'All Time' },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPeriod(option.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === option.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <SummaryCards
        totalExpenses={overviewQuery.data?.totalExpenses ?? 0}
        totalIncome={overviewQuery.data?.totalIncome ?? 0}
        netAmount={overviewQuery.data?.netAmount ?? 0}
        isLoading={overviewQuery.isLoading}
      />

      {/* Entry list */}
      <div className="space-y-3">
        {entriesQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : entriesQuery.data && entriesQuery.data.length > 0 ? (
          entriesQuery.data.map((entry) => (
            <EntryCard
              key={entry.id}
              id={entry.id}
              entryType={entry.entryType}
              category={entry.category}
              amount={entry.amount}
              entryDate={entry.entryDate}
              description={entry.description}
              vendor={entry.vendor}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
            <p className="text-muted-foreground text-lg font-medium">
              No entries yet
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Add your first financial entry to start tracking.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Entry' : 'Add Entry'}
            </DialogTitle>
            <DialogDescription>
              {editingEntry
                ? 'Update the details of this financial entry.'
                : 'Record a new expense or income entry.'}
            </DialogDescription>
          </DialogHeader>
          <FinancialEntryForm
            key={editingEntry?.id ?? 'new'}
            defaultValues={
              editingEntry
                ? {
                    entryType: editingEntry.entryType as 'expense' | 'income',
                    category: editingEntry.category,
                    amount: parseFloat(editingEntry.amount ?? '0'),
                    entryDate: editingEntry.entryDate,
                    description: editingEntry.description ?? undefined,
                    careerPhase: editingEntry.careerPhase ?? undefined,
                    vendor: editingEntry.vendor ?? undefined,
                    notes: editingEntry.notes ?? undefined,
                  }
                : undefined
            }
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
