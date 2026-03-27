'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm'
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
} from '@/lib/validators/financial'

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
