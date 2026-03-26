'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import {
  aircraftCreateSchema,
  aircraftUpdateSchema,
} from '@/lib/validators/aircraft'
import { createAuditEvent } from '@/lib/services/audit'
import { getOrCreateProfile } from '@/lib/services/profile'

function formDataToObject(formData: FormData) {
  return {
    tailNumber: formData.get('tailNumber') as string,
    manufacturer: (formData.get('manufacturer') as string) || undefined,
    model: (formData.get('model') as string) || undefined,
    year: (formData.get('year') as string) || undefined,
    category: (formData.get('category') as string) || undefined,
    aircraftClass: (formData.get('aircraftClass') as string) || undefined,
    engineType: (formData.get('engineType') as string) || undefined,
    isComplex: formData.get('isComplex') === 'on',
    isHighPerformance: formData.get('isHighPerformance') === 'on',
    isMultiEngine: formData.get('isMultiEngine') === 'on',
    isTurbine: formData.get('isTurbine') === 'on',
    isTailwheel: formData.get('isTailwheel') === 'on',
    isActive: formData.get('isActive') !== 'off',
    notes: (formData.get('notes') as string) || undefined,
  }
}

export async function getAircraft(params?: {
  page?: number
  pageSize?: number
}) {
  try {
    const profile = await getOrCreateProfile()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50

    const conditions = eq(schema.aircraft.profileId, profile.id)

    const [result, countResult] = await Promise.all([
      db
        .select()
        .from(schema.aircraft)
        .where(conditions)
        .orderBy(schema.aircraft.tailNumber)
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.aircraft)
        .where(conditions),
    ])

    const total = Number(countResult[0]?.count) || 0

    return { data: result, total, page, pageSize, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      total: 0,
      page: 1,
      pageSize: 50,
      error: 'Failed to fetch aircraft',
    }
  }
}

export async function createAircraft(formData: FormData) {
  try {
    const profile = await getOrCreateProfile()
    const raw = formDataToObject(formData)
    const parsed = aircraftCreateSchema.safeParse(raw)

    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.flatten().fieldErrors,
      }
    }

    const values = parsed.data

    const inserted = await db
      .insert(schema.aircraft)
      .values({
        profileId: profile.id,
        tailNumber: values.tailNumber,
        manufacturer: values.manufacturer ?? null,
        model: values.model ?? null,
        year: values.year ?? null,
        category: values.category ?? null,
        aircraftClass: values.aircraftClass ?? null,
        engineType: values.engineType ?? null,
        isComplex: values.isComplex,
        isHighPerformance: values.isHighPerformance,
        isMultiEngine: values.isMultiEngine,
        isTurbine: values.isTurbine,
        isTailwheel: values.isTailwheel,
        isActive: values.isActive,
        notes: values.notes ?? null,
      })
      .returning()

    if (!inserted[0]) {
      return { data: null, error: 'Failed to create aircraft' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'aircraft',
      entityId: inserted[0].id,
      action: 'create',
      changes: values,
    })

    return { data: inserted[0], error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to create aircraft' }
  }
}

export async function updateAircraft(id: string, formData: FormData) {
  try {
    const profile = await getOrCreateProfile()

    // Verify ownership
    const existing = await db
      .select()
      .from(schema.aircraft)
      .where(
        and(
          eq(schema.aircraft.id, id),
          eq(schema.aircraft.profileId, profile.id),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      return { data: null, error: 'Aircraft not found' }
    }

    const raw = formDataToObject(formData)
    const parsed = aircraftUpdateSchema.safeParse(raw)

    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.flatten().fieldErrors,
      }
    }

    const values = parsed.data

    const updated = await db
      .update(schema.aircraft)
      .set({
        tailNumber: values.tailNumber,
        manufacturer: values.manufacturer ?? null,
        model: values.model ?? null,
        year: values.year ?? null,
        category: values.category ?? null,
        aircraftClass: values.aircraftClass ?? null,
        engineType: values.engineType ?? null,
        isComplex: values.isComplex,
        isHighPerformance: values.isHighPerformance,
        isMultiEngine: values.isMultiEngine,
        isTurbine: values.isTurbine,
        isTailwheel: values.isTailwheel,
        isActive: values.isActive,
        notes: values.notes ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.aircraft.id, id),
          eq(schema.aircraft.profileId, profile.id),
        ),
      )
      .returning()

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'aircraft',
      entityId: id,
      action: 'update',
      changes: values,
    })

    return { data: updated[0], error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to update aircraft' }
  }
}

export async function deleteAircraft(id: string) {
  try {
    const profile = await getOrCreateProfile()

    // Verify ownership
    const existing = await db
      .select()
      .from(schema.aircraft)
      .where(
        and(
          eq(schema.aircraft.id, id),
          eq(schema.aircraft.profileId, profile.id),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      return { error: 'Aircraft not found' }
    }

    await db
      .delete(schema.aircraft)
      .where(
        and(
          eq(schema.aircraft.id, id),
          eq(schema.aircraft.profileId, profile.id),
        ),
      )

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'aircraft',
      entityId: id,
      action: 'delete',
      changes: { tailNumber: existing[0].tailNumber },
    })

    return { error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { error: 'Failed to delete aircraft' }
  }
}
