'use client'

import * as React from 'react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { SummaryCards } from '@/components/money/summary-cards'
import { EntryCard } from '@/components/money/entry-card'
import { FinancialEntryForm } from '@/components/money/financial-entry-form'
import type { FinancialEntryCreate } from '@/lib/validators/financial'
import { useToast } from '@/hooks/use-toast'
import { PageTransition } from '@/components/dashboard/page-transition'
import {
  getFinancialEntries,
  createFinancialEntry,
  updateFinancialEntry,
  deleteFinancialEntry,
  getFinancialOverview,
  getLoans,
  createLoan,
  deleteLoan,
  getFinancialAnalytics,
  type FinancialEntry,
} from './actions'

const TEAL = '#10B981'
const TEAL_PALETTE = ['#10B981', '#059669', '#047857', '#34D399', '#6EE7B7']

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
  const [page, setPage] = useState(1)
  const [period, setPeriod] = React.useState<Period>('month')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingEntry, setEditingEntry] = React.useState<FinancialEntry | null>(
    null,
  )
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const periodParams = getPeriodParams(period)

  const entriesQuery = useQuery({
    queryKey: ['financial-entries', periodParams, page],
    queryFn: async () => {
      const result = await getFinancialEntries({ ...periodParams, page })
      return result
    },
  })

  const overviewQuery = useQuery({
    queryKey: ['financial-overview', periodParams],
    queryFn: async () => {
      const result = await getFinancialOverview(periodParams)
      if (result.error) throw new Error(result.error)
      return result.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: FinancialEntryCreate) => {
      const result = await createFinancialEntry(data)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] })
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] })
      setDialogOpen(false)
      toast({
        title: 'Entry added',
        description: 'Entry recorded.',
      })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Could not save entry.',
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: FinancialEntryCreate
    }) => {
      const result = await updateFinancialEntry(id, data)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] })
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] })
      setDialogOpen(false)
      setEditingEntry(null)
      toast({
        title: 'Entry updated',
        description: 'Entry updated.',
      })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Could not update entry.',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFinancialEntry(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] })
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] })
      toast({ title: 'Entry removed' })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Could not remove entry.',
        variant: 'destructive',
      })
    },
  })

  function handleEdit(id: string) {
    const entry = entriesQuery.data?.data?.find((e) => e.id === id)
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

  const analyticsQuery = useQuery({
    queryKey: ['financial-analytics'],
    queryFn: async () => {
      const result = await getFinancialAnalytics()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 5 * 60 * 1000,
  })

  const loansQuery = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const result = await getLoans()
      if (result.error) throw new Error(result.error)
      return result.data
    },
  })

  const [loanDialogOpen, setLoanDialogOpen] = useState(false)

  const createLoanMutation = useMutation({
    mutationFn: async (formData: {
      name: string
      principalAmount: number
      interestRate?: number
      monthlyPayment?: number
      startDate?: string
      termMonths?: number
      remainingBalance?: number
      notes?: string
    }) => {
      const result = await createLoan(formData)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['financial-analytics'] })
      setLoanDialogOpen(false)
      toast({ title: 'Loan added' })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({ title: 'Error', description: 'Could not add loan.', variant: 'destructive' })
    },
  })

  const deleteLoanMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteLoan(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['financial-analytics'] })
      toast({ title: 'Loan removed' })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({ title: 'Error', description: 'Could not remove loan.', variant: 'destructive' })
    },
  })

  function handleLoanSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createLoanMutation.mutate({
      name: fd.get('name') as string,
      principalAmount: parseFloat(fd.get('principalAmount') as string),
      interestRate: fd.get('interestRate') ? parseFloat(fd.get('interestRate') as string) / 100 : undefined,
      monthlyPayment: fd.get('monthlyPayment') ? parseFloat(fd.get('monthlyPayment') as string) : undefined,
      startDate: (fd.get('startDate') as string) || undefined,
      termMonths: fd.get('termMonths') ? parseInt(fd.get('termMonths') as string) : undefined,
      notes: (fd.get('notes') as string) || undefined,
    })
  }

  return (
    <PageTransition>
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-[32px]">💰 Costs</h1>
          <p className="text-muted-foreground mt-1">
            Expenses, income, and financial position.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Entry
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
                onClick={() => {
                  setPeriod(option.value)
                  setPage(1)
                }}
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

          <SummaryCards
            totalExpenses={overviewQuery.data?.totalExpenses ?? 0}
            totalIncome={overviewQuery.data?.totalIncome ?? 0}
            netAmount={overviewQuery.data?.netAmount ?? 0}
            isLoading={overviewQuery.isLoading}
          />

          {analyticsQuery.data && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Cost / Flight Hour</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {analyticsQuery.data.costPerFlightHour != null
                      ? `$${analyticsQuery.data.costPerFlightHour.toFixed(2)}`
                      : '\u2014'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Cost / Landing</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {analyticsQuery.data.costPerLanding != null
                      ? `$${analyticsQuery.data.costPerLanding.toFixed(2)}`
                      : '\u2014'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Monthly Burn Rate</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {analyticsQuery.data.trainingBurnRate != null
                      ? `$${analyticsQuery.data.trainingBurnRate.toFixed(0)}/mo`
                      : '\u2014'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-3">
            {entriesQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : entriesQuery.isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-800">Could not load entries.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => entriesQuery.refetch()}>
                  Retry
                </Button>
              </div>
            ) : entriesQuery.data && entriesQuery.data.data.length > 0 ? (
              entriesQuery.data.data.map((entry) => (
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
                <p className="text-muted-foreground text-lg font-medium">No entries yet</p>
                <p className="text-muted-foreground mt-1 text-sm">Record your first expense or income entry.</p>
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Entry
                </Button>
              </div>
            )}
            {entriesQuery.data && (
              <PaginationControls
                page={entriesQuery.data.page}
                pageSize={entriesQuery.data.pageSize}
                total={entriesQuery.data.total}
                onPageChange={setPage}
              />
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analyticsQuery.isLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : analyticsQuery.data ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending</CardTitle>
                  <CardDescription>Expenses over the last 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsQuery.data.monthlySpendingTrend.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">No spending data.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsQuery.data.monthlySpendingTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                        <Line type="monotone" dataKey="amount" stroke={TEAL} strokeWidth={2} name="Expenses" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Per-Aircraft Costs</CardTitle>
                    <CardDescription>Expenses by aircraft</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsQuery.data.perAircraftCost.length === 0 ? (
                      <p className="text-muted-foreground py-8 text-center text-sm">No data.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analyticsQuery.data.perAircraftCost} layout="vertical" margin={{ left: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis type="category" dataKey="aircraftName" tick={{ fontSize: 12 }} width={80} />
                          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                          <Bar dataKey="amount" fill={TEAL} radius={[0, 4, 4, 0]} name="Amount" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Cash vs financed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsQuery.data.paymentMethodSplit.length === 0 ? (
                      <p className="text-muted-foreground py-8 text-center text-sm">No data.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analyticsQuery.data.paymentMethodSplit}
                            dataKey="amount"
                            nameKey="method"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: $${(value ?? 0).toFixed(0)}`}
                          >
                            {analyticsQuery.data.paymentMethodSplit.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={TEAL_PALETTE[index % TEAL_PALETTE.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Loan Tracking</h2>
            <Button size="sm" onClick={() => setLoanDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Loan
            </Button>
          </div>

          {loansQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : loansQuery.data && loansQuery.data.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {loansQuery.data.map((loan) => (
                <Card key={loan.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{loan.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          if (window.confirm('Delete this loan?')) {
                            deleteLoanMutation.mutate(loan.id)
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Principal</p>
                        <p className="font-medium tabular-nums">
                          ${Number(loan.principalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-medium tabular-nums">
                          ${Number(loan.remainingBalance || 0).toLocaleString()}
                        </p>
                      </div>
                      {loan.interestRate && (
                        <div>
                          <p className="text-muted-foreground">Rate</p>
                          <p className="font-medium tabular-nums">
                            {(Number(loan.interestRate) * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {loan.monthlyPayment && (
                        <div>
                          <p className="text-muted-foreground">Monthly</p>
                          <p className="font-medium tabular-nums">
                            ${Number(loan.monthlyPayment).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {loan.notes && (
                      <p className="text-muted-foreground text-xs italic">{loan.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
              <p className="text-muted-foreground text-lg font-medium">No loans tracked</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Add flight training loans to track balances and payments.
              </p>
            </div>
          )}

          {/* Loan summary */}
          {analyticsQuery.data && analyticsQuery.data.loanSummary.loanCount > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Total Borrowed</p>
                  <p className="text-2xl font-bold tabular-nums">
                    ${analyticsQuery.data.loanSummary.totalBorrowed.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Monthly Payments</p>
                  <p className="text-2xl font-bold tabular-nums">
                    ${analyticsQuery.data.loanSummary.totalMonthlyPayments.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Active Loans</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {analyticsQuery.data.loanSummary.loanCount}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Add loan dialog */}
          <Dialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen}>
            <DialogContent>
              <form onSubmit={handleLoanSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Loan</DialogTitle>
                  <DialogDescription>Track a flight training loan.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="loan-name">Loan Name</Label>
                    <Input id="loan-name" name="name" required placeholder="e.g., Flight Training Loan" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="loan-principal">Principal ($)</Label>
                      <Input id="loan-principal" name="principalAmount" type="number" step="0.01" min="0" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="loan-rate">Interest Rate (%)</Label>
                      <Input id="loan-rate" name="interestRate" type="number" step="0.01" min="0" placeholder="6.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="loan-monthly">Monthly Payment ($)</Label>
                      <Input id="loan-monthly" name="monthlyPayment" type="number" step="0.01" min="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="loan-term">Term (months)</Label>
                      <Input id="loan-term" name="termMonths" type="number" min="1" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="loan-start">Start Date</Label>
                    <Input id="loan-start" name="startDate" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="loan-notes">Notes</Label>
                    <Input id="loan-notes" name="notes" placeholder="Optional notes" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createLoanMutation.isPending}>
                    {createLoanMutation.isPending ? 'Adding...' : 'Add Loan'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Create / Edit entry dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Entry' : 'Record Entry'}
            </DialogTitle>
            <DialogDescription>
              {editingEntry
                ? 'Update this entry.'
                : 'Log an expense or income.'}
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
                    paymentMethod: (editingEntry.paymentMethod as 'cash' | 'loan' | 'scholarship' | 'gi_bill' | 'other') ?? undefined,
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
    </PageTransition>
  )
}
