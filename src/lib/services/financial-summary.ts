import { eq, and, gte, lte, sql } from 'drizzle-orm'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

export type CategoryBreakdown = {
  category: string
  total: number
}

export type FinancialSummary = {
  totalExpenses: number
  totalIncome: number
  netAmount: number
  expensesByCategory: CategoryBreakdown[]
  incomeByCategory: CategoryBreakdown[]
}

export type FinancialSummaryOptions = {
  year?: number
  month?: number
}

export async function getFinancialSummary(
  profileId: string,
  options?: FinancialSummaryOptions,
): Promise<FinancialSummary> {
  try {
    const conditions = [eq(schema.financialEntries.profileId, profileId)]

    if (options?.year) {
      const startDate = options.month
        ? `${options.year}-${String(options.month).padStart(2, '0')}-01`
        : `${options.year}-01-01`

      let endDate: string
      if (options.month) {
        // Last day of the given month
        const lastDay = new Date(options.year, options.month, 0).getDate()
        endDate = `${options.year}-${String(options.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      } else {
        endDate = `${options.year}-12-31`
      }

      conditions.push(gte(schema.financialEntries.entryDate, startDate))
      conditions.push(lte(schema.financialEntries.entryDate, endDate))
    }

    const whereClause = and(...conditions)

    // Get totals by entry type
    const totalsResult = await db
      .select({
        entryType: schema.financialEntries.entryType,
        total: sql<string>`coalesce(sum(${schema.financialEntries.amount}), 0)`,
      })
      .from(schema.financialEntries)
      .where(whereClause)
      .groupBy(schema.financialEntries.entryType)

    let totalExpenses = 0
    let totalIncome = 0

    for (const row of totalsResult) {
      const amount = parseFloat(row.total) || 0
      if (row.entryType === 'expense') {
        totalExpenses = amount
      } else if (row.entryType === 'income') {
        totalIncome = amount
      }
    }

    // Get breakdown by category
    const categoryResult = await db
      .select({
        entryType: schema.financialEntries.entryType,
        category: schema.financialEntries.category,
        total: sql<string>`coalesce(sum(${schema.financialEntries.amount}), 0)`,
      })
      .from(schema.financialEntries)
      .where(whereClause)
      .groupBy(
        schema.financialEntries.entryType,
        schema.financialEntries.category,
      )

    const expensesByCategory: CategoryBreakdown[] = []
    const incomeByCategory: CategoryBreakdown[] = []

    for (const row of categoryResult) {
      const breakdown: CategoryBreakdown = {
        category: row.category,
        total: parseFloat(row.total) || 0,
      }

      if (row.entryType === 'expense') {
        expensesByCategory.push(breakdown)
      } else if (row.entryType === 'income') {
        incomeByCategory.push(breakdown)
      }
    }

    return {
      totalExpenses,
      totalIncome,
      netAmount: totalIncome - totalExpenses,
      expensesByCategory,
      incomeByCategory,
    }
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
