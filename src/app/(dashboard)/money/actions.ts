'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, gte, lte, desc, sql, sum } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'
import { createAuditEvent } from '@/lib/services/audit'
import {
  getFinancialSummary,
  type FinancialSummary,
} from '@/lib/services/financial-summary'
import {
  financialEntryCreateSchema,
  financialEntryUpdateSchema,
  loanCreateSchema,
  loanUpdateSchema,
} from '@/lib/validators/financial'

export type LoanRecord = typeof schema.loans.$inferSelect

export type FinancialEntry = typeof schema.financialEntries.$inferSelect

type GetEntriesParams = {
  year?: number
  month?: number
  type?: string
  page?: number
  pageSize?: number
}

export async function getFinancialEntries(params?: GetEntriesParams): Promise<{
  data: FinancialEntry[]
  total: number
  page: number
  pageSize: number
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50
    const conditions = [eq(schema.financialEntries.profileId, profile.id)]

    if (params?.year) {
      const startDate = params.month
        ? `${params.year}-${String(params.month).padStart(2, '0')}-01`
        : `${params.year}-01-01`

      let endDate: string
      if (params.month) {
        const lastDay = new Date(params.year, params.month, 0).getDate()
        endDate = `${params.year}-${String(params.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      } else {
        endDate = `${params.year}-12-31`
      }

      conditions.push(gte(schema.financialEntries.entryDate, startDate))
      conditions.push(lte(schema.financialEntries.entryDate, endDate))
    }

    if (
      params?.type &&
      (params.type === 'expense' || params.type === 'income')
    ) {
      conditions.push(eq(schema.financialEntries.entryType, params.type))
    }

    const [entries, countResult] = await Promise.all([
      db
        .select()
        .from(schema.financialEntries)
        .where(and(...conditions))
        .orderBy(desc(schema.financialEntries.entryDate))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.financialEntries)
        .where(and(...conditions)),
    ])

    const total = Number(countResult[0]?.count) || 0

    return { data: entries, total, page, pageSize, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: [],
      total: 0,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load financial entries',
    }
  }
}

export async function createFinancialEntry(
  data: unknown,
): Promise<{ data: FinancialEntry | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    const validated = financialEntryCreateSchema.parse(data)

    const inserted = await db
      .insert(schema.financialEntries)
      .values({
        profileId: profile.id,
        entryType: validated.entryType,
        category: validated.category,
        amount: String(validated.amount),
        entryDate: validated.entryDate,
        description: validated.description ?? null,
        aircraftId: validated.aircraftId ?? null,
        flightId: validated.flightId ?? null,
        careerPhase: validated.careerPhase ?? null,
        vendor: validated.vendor ?? null,
        paymentMethod: validated.paymentMethod ?? 'cash',
        notes: validated.notes ?? null,
      })
      .returning()

    const entry = inserted[0]
    if (!entry) {
      return { data: null, error: 'Failed to create financial entry' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'financial_entry',
      entityId: entry.id,
      action: 'create',
      changes: validated,
    })

    return { data: entry, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create financial entry',
    }
  }
}

export async function updateFinancialEntry(
  id: string,
  data: unknown,
): Promise<{ data: FinancialEntry | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    const validated = financialEntryUpdateSchema.parse(data)

    // Verify ownership
    const existing = await db
      .select()
      .from(schema.financialEntries)
      .where(
        and(
          eq(schema.financialEntries.id, id),
          eq(schema.financialEntries.profileId, profile.id),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      return { data: null, error: 'Financial entry not found' }
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() }
    if (validated.entryType !== undefined)
      updateValues.entryType = validated.entryType
    if (validated.category !== undefined)
      updateValues.category = validated.category
    if (validated.amount !== undefined)
      updateValues.amount = String(validated.amount)
    if (validated.entryDate !== undefined)
      updateValues.entryDate = validated.entryDate
    if (validated.description !== undefined)
      updateValues.description = validated.description ?? null
    if (validated.aircraftId !== undefined)
      updateValues.aircraftId = validated.aircraftId ?? null
    if (validated.flightId !== undefined)
      updateValues.flightId = validated.flightId ?? null
    if (validated.careerPhase !== undefined)
      updateValues.careerPhase = validated.careerPhase ?? null
    if (validated.vendor !== undefined)
      updateValues.vendor = validated.vendor ?? null
    if (validated.paymentMethod !== undefined)
      updateValues.paymentMethod = validated.paymentMethod
    if (validated.notes !== undefined)
      updateValues.notes = validated.notes ?? null

    const updated = await db
      .update(schema.financialEntries)
      .set(updateValues)
      .where(
        and(
          eq(schema.financialEntries.id, id),
          eq(schema.financialEntries.profileId, profile.id),
        ),
      )
      .returning()

    if (!updated[0]) {
      return { data: null, error: 'Failed to update financial entry' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'financial_entry',
      entityId: id,
      action: 'update',
      changes: validated,
    })

    return { data: updated[0], error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update financial entry',
    }
  }
}

export async function deleteFinancialEntry(
  id: string,
): Promise<{ error: string | null }> {
  try {
    const profile = await getOrCreateProfile()

    const deleted = await db
      .delete(schema.financialEntries)
      .where(
        and(
          eq(schema.financialEntries.id, id),
          eq(schema.financialEntries.profileId, profile.id),
        ),
      )
      .returning({ id: schema.financialEntries.id })

    if (deleted.length === 0) {
      return { error: 'Financial entry not found' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'financial_entry',
      entityId: id,
      action: 'delete',
    })

    return { error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to delete financial entry',
    }
  }
}

export async function getFinancialOverview(options?: {
  year?: number
  month?: number
}): Promise<{ data: FinancialSummary | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    const summary = await getFinancialSummary(profile.id, options)
    return { data: summary, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load financial overview',
    }
  }
}

// ---------- Loan CRUD ----------

export async function getLoans(): Promise<{
  data: LoanRecord[]
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const rows = await db
      .select()
      .from(schema.loans)
      .where(eq(schema.loans.profileId, profile.id))
      .orderBy(desc(schema.loans.createdAt))
    return { data: rows, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: [], error: 'Failed to load loans' }
  }
}

export async function createLoan(
  data: unknown,
): Promise<{ data: LoanRecord | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    const validated = loanCreateSchema.parse(data)

    const inserted = await db
      .insert(schema.loans)
      .values({
        profileId: profile.id,
        name: validated.name,
        principalAmount: String(validated.principalAmount),
        interestRate: validated.interestRate != null ? String(validated.interestRate) : null,
        monthlyPayment: validated.monthlyPayment != null ? String(validated.monthlyPayment) : null,
        startDate: validated.startDate ?? null,
        termMonths: validated.termMonths ?? null,
        remainingBalance: validated.remainingBalance != null ? String(validated.remainingBalance) : String(validated.principalAmount),
        notes: validated.notes ?? null,
      })
      .returning()

    const loan = inserted[0]
    if (!loan) {
      return { data: null, error: 'Failed to create loan' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'loan',
      entityId: loan.id,
      action: 'create',
      changes: validated,
    })

    return { data: loan, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create loan',
    }
  }
}

export async function updateLoan(
  id: string,
  data: unknown,
): Promise<{ data: LoanRecord | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    const validated = loanUpdateSchema.parse(data)

    const existing = await db
      .select()
      .from(schema.loans)
      .where(
        and(eq(schema.loans.id, id), eq(schema.loans.profileId, profile.id)),
      )
      .limit(1)

    if (existing.length === 0) {
      return { data: null, error: 'Loan not found' }
    }

    const updateValues: Record<string, unknown> = { updatedAt: new Date() }
    if (validated.name !== undefined) updateValues.name = validated.name
    if (validated.principalAmount !== undefined)
      updateValues.principalAmount = String(validated.principalAmount)
    if (validated.interestRate !== undefined)
      updateValues.interestRate =
        validated.interestRate != null ? String(validated.interestRate) : null
    if (validated.monthlyPayment !== undefined)
      updateValues.monthlyPayment =
        validated.monthlyPayment != null
          ? String(validated.monthlyPayment)
          : null
    if (validated.startDate !== undefined)
      updateValues.startDate = validated.startDate ?? null
    if (validated.termMonths !== undefined)
      updateValues.termMonths = validated.termMonths ?? null
    if (validated.remainingBalance !== undefined)
      updateValues.remainingBalance =
        validated.remainingBalance != null
          ? String(validated.remainingBalance)
          : null
    if (validated.notes !== undefined)
      updateValues.notes = validated.notes ?? null

    const updated = await db
      .update(schema.loans)
      .set(updateValues)
      .where(
        and(eq(schema.loans.id, id), eq(schema.loans.profileId, profile.id)),
      )
      .returning()

    if (!updated[0]) {
      return { data: null, error: 'Failed to update loan' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'loan',
      entityId: id,
      action: 'update',
      changes: validated,
    })

    return { data: updated[0], error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update loan',
    }
  }
}

export async function deleteLoan(
  id: string,
): Promise<{ error: string | null }> {
  try {
    const profile = await getOrCreateProfile()

    const deleted = await db
      .delete(schema.loans)
      .where(
        and(eq(schema.loans.id, id), eq(schema.loans.profileId, profile.id)),
      )
      .returning({ id: schema.loans.id })

    if (deleted.length === 0) {
      return { error: 'Loan not found' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'loan',
      entityId: id,
      action: 'delete',
    })

    return { error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      error: error instanceof Error ? error.message : 'Failed to delete loan',
    }
  }
}

// ---------- Financial Analytics ----------

export type FinancialAnalytics = {
  costPerFlightHour: number | null
  costPerLanding: number | null
  monthlySpendingTrend: { month: string; amount: number }[]
  perAircraftCost: { aircraftName: string; amount: number }[]
  trainingBurnRate: number | null
  loanSummary: {
    totalBorrowed: number
    totalMonthlyPayments: number
    loanCount: number
  }
  paymentMethodSplit: { method: string; amount: number }[]
}

export async function getFinancialAnalytics(): Promise<{
  data: FinancialAnalytics | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const profileId = profile.id

    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const threeMonthCutoff = threeMonthsAgo.toISOString().split('T')[0]

    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    const twelveMonthCutoff = twelveMonthsAgo.toISOString().split('T')[0]

    const [
      totalExpenseResult,
      flightTotalsResult,
      monthlyTrendRaw,
      perAircraftRaw,
      burnRateRaw,
      loanRows,
      paymentMethodRaw,
    ] = await Promise.all([
      // Total expenses
      db
        .select({
          total: sql<number>`coalesce(sum(${schema.financialEntries.amount}::numeric), 0)`,
        })
        .from(schema.financialEntries)
        .where(
          and(
            eq(schema.financialEntries.profileId, profileId),
            eq(schema.financialEntries.entryType, 'expense'),
          ),
        ),
      // Flight totals for per-hour/per-landing
      db
        .select({
          totalHours: sql<number>`coalesce(sum(${schema.flights.totalTime}::numeric), 0)`,
          totalLandings: sql<number>`coalesce(sum(coalesce(${schema.flights.dayLandings}, 0) + coalesce(${schema.flights.nightLandings}, 0)), 0)`,
        })
        .from(schema.flights)
        .where(
          and(
            eq(schema.flights.profileId, profileId),
            eq(schema.flights.status, 'final'),
          ),
        ),
      // Monthly spending trend (last 12 months)
      db
        .select({
          month: sql<string>`to_char(${schema.financialEntries.entryDate}::date, 'YYYY-MM')`,
          amount: sql<number>`coalesce(sum(${schema.financialEntries.amount}::numeric), 0)`,
        })
        .from(schema.financialEntries)
        .where(
          and(
            eq(schema.financialEntries.profileId, profileId),
            eq(schema.financialEntries.entryType, 'expense'),
            gte(schema.financialEntries.entryDate, twelveMonthCutoff),
          ),
        )
        .groupBy(
          sql`to_char(${schema.financialEntries.entryDate}::date, 'YYYY-MM')`,
        )
        .orderBy(
          sql`to_char(${schema.financialEntries.entryDate}::date, 'YYYY-MM')`,
        ),
      // Per-aircraft cost
      db
        .select({
          aircraftName: sql<string>`coalesce(${schema.aircraft.tailNumber}, 'Unassigned')`,
          amount: sql<number>`coalesce(sum(${schema.financialEntries.amount}::numeric), 0)`,
        })
        .from(schema.financialEntries)
        .leftJoin(
          schema.aircraft,
          eq(schema.financialEntries.aircraftId, schema.aircraft.id),
        )
        .where(
          and(
            eq(schema.financialEntries.profileId, profileId),
            eq(schema.financialEntries.entryType, 'expense'),
          ),
        )
        .groupBy(sql`coalesce(${schema.aircraft.tailNumber}, 'Unassigned')`)
        .orderBy(desc(sql`coalesce(sum(${schema.financialEntries.amount}::numeric), 0)`)),
      // Burn rate (last 3 months)
      db
        .select({
          total: sql<number>`coalesce(sum(${schema.financialEntries.amount}::numeric), 0)`,
        })
        .from(schema.financialEntries)
        .where(
          and(
            eq(schema.financialEntries.profileId, profileId),
            eq(schema.financialEntries.entryType, 'expense'),
            gte(schema.financialEntries.entryDate, threeMonthCutoff),
          ),
        ),
      // Loans
      db
        .select()
        .from(schema.loans)
        .where(eq(schema.loans.profileId, profileId)),
      // Payment method split
      db
        .select({
          method: sql<string>`coalesce(${schema.financialEntries.paymentMethod}, 'cash')`,
          amount: sql<number>`coalesce(sum(${schema.financialEntries.amount}::numeric), 0)`,
        })
        .from(schema.financialEntries)
        .where(
          and(
            eq(schema.financialEntries.profileId, profileId),
            eq(schema.financialEntries.entryType, 'expense'),
          ),
        )
        .groupBy(sql`coalesce(${schema.financialEntries.paymentMethod}, 'cash')`),
    ])

    const totalExpenses = Number(totalExpenseResult[0]?.total) || 0
    const totalHours = Number(flightTotalsResult[0]?.totalHours) || 0
    const totalLandings = Number(flightTotalsResult[0]?.totalLandings) || 0

    const costPerFlightHour =
      totalHours > 0 ? Math.round((totalExpenses / totalHours) * 100) / 100 : null
    const costPerLanding =
      totalLandings > 0
        ? Math.round((totalExpenses / totalLandings) * 100) / 100
        : null

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlySpendingTrend = monthlyTrendRaw.map((r) => {
      const [, monthStr] = r.month.split('-')
      const monthIdx = parseInt(monthStr, 10) - 1
      return {
        month: monthNames[monthIdx] ?? r.month,
        amount: Number(r.amount),
      }
    })

    const perAircraftCost = perAircraftRaw.map((r) => ({
      aircraftName: r.aircraftName,
      amount: Number(r.amount),
    }))

    const burnRateTotal = Number(burnRateRaw[0]?.total) || 0
    const trainingBurnRate = burnRateTotal > 0 ? Math.round((burnRateTotal / 3) * 100) / 100 : null

    const totalBorrowed = loanRows.reduce(
      (acc, l) => acc + Number(l.principalAmount || 0),
      0,
    )
    const totalMonthlyPayments = loanRows.reduce(
      (acc, l) => acc + Number(l.monthlyPayment || 0),
      0,
    )

    const methodLabels: Record<string, string> = {
      cash: 'Cash',
      loan: 'Loan',
      scholarship: 'Scholarship',
      gi_bill: 'GI Bill',
      other: 'Other',
    }
    const paymentMethodSplit = paymentMethodRaw.map((r) => ({
      method: methodLabels[r.method] ?? r.method,
      amount: Number(r.amount),
    }))

    return {
      data: {
        costPerFlightHour,
        costPerLanding,
        monthlySpendingTrend,
        perAircraftCost,
        trainingBurnRate,
        loanSummary: {
          totalBorrowed,
          totalMonthlyPayments,
          loanCount: loanRows.length,
        },
        paymentMethodSplit,
      },
      error: null,
    }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load financial analytics',
    }
  }
}
