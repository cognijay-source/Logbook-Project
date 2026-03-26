'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
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
}

export async function getFinancialEntries(
  params?: GetEntriesParams,
): Promise<FinancialEntry[]> {
  try {
    const profile = await getOrCreateProfile()
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

    const entries = await db
      .select()
      .from(schema.financialEntries)
      .where(and(...conditions))
      .orderBy(desc(schema.financialEntries.entryDate))

    return entries
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function createFinancialEntry(
  data: unknown,
): Promise<FinancialEntry> {
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
      throw new Error('Failed to create financial entry')
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'financial_entry',
      entityId: entry.id,
      action: 'create',
      changes: validated,
    })

    return entry
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function updateFinancialEntry(
  id: string,
  data: unknown,
): Promise<FinancialEntry> {
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
      throw new Error('Financial entry not found')
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
      throw new Error('Failed to update financial entry')
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'financial_entry',
      entityId: id,
      action: 'update',
      changes: validated,
    })

    return updated[0]
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function deleteFinancialEntry(id: string): Promise<void> {
  try {
    const profile = await getOrCreateProfile()

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
      throw new Error('Financial entry not found')
    }

    await db
      .delete(schema.financialEntries)
      .where(
        and(
          eq(schema.financialEntries.id, id),
          eq(schema.financialEntries.profileId, profile.id),
        ),
      )

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'financial_entry',
      entityId: id,
      action: 'delete',
    })
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}

export async function getFinancialOverview(options?: {
  year?: number
  month?: number
}): Promise<FinancialSummary> {
  try {
    const profile = await getOrCreateProfile()
    return await getFinancialSummary(profile.id, options)
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
