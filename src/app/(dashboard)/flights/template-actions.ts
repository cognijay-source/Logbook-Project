'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'
import { createAuditEvent } from '@/lib/services/audit'
import { flightTemplateCreateSchema } from '@/lib/validators/flight-template'
import { z } from 'zod'

export type FlightTemplate = typeof schema.flightTemplates.$inferSelect

export async function createTemplate(
  data: unknown,
): Promise<{ data: FlightTemplate | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    const parsed = flightTemplateCreateSchema.parse(data)

    const inserted = await db
      .insert(schema.flightTemplates)
      .values({
        profileId: profile.id,
        name: parsed.name,
        aircraftId: parsed.aircraftId || null,
        departureAirport: parsed.departureAirport || null,
        arrivalAirport: parsed.arrivalAirport || null,
        route: parsed.route || null,
        operationType: parsed.operationType || null,
        role: parsed.role || null,
        instructorName: parsed.instructorName || null,
        instructorCertNumber: parsed.instructorCertNumber || null,
        defaultTotalTime: parsed.defaultTotalTime || null,
        isFavorite: parsed.isFavorite,
      })
      .returning()

    if (!inserted[0]) {
      return { data: null, error: 'Failed to create template' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'flight_template',
      entityId: inserted[0].id,
      action: 'create',
      changes: parsed,
    })

    return { data: inserted[0], error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: error.errors.map((e) => e.message).join(', '),
      }
    }
    return { data: null, error: 'Failed to create template' }
  }
}

export async function getTemplates(): Promise<{
  data: FlightTemplate[]
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()

    const rows = await db
      .select()
      .from(schema.flightTemplates)
      .where(eq(schema.flightTemplates.profileId, profile.id))
      .orderBy(
        desc(schema.flightTemplates.isFavorite),
        desc(schema.flightTemplates.updatedAt),
      )

    return { data: rows, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: [], error: 'Failed to load templates' }
  }
}

export async function deleteTemplate(
  id: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()

    const deleted = await db
      .delete(schema.flightTemplates)
      .where(
        and(
          eq(schema.flightTemplates.id, id),
          eq(schema.flightTemplates.profileId, profile.id),
        ),
      )
      .returning({ id: schema.flightTemplates.id })

    if (deleted.length === 0) {
      return { success: false, error: 'Template not found' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'flight_template',
      entityId: id,
      action: 'delete',
    })

    return { success: true, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Failed to delete template' }
  }
}

export async function updateTemplate(
  id: string,
  data: unknown,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    const parsed = flightTemplateCreateSchema.parse(data)

    const updated = await db
      .update(schema.flightTemplates)
      .set({
        name: parsed.name,
        aircraftId: parsed.aircraftId || null,
        departureAirport: parsed.departureAirport || null,
        arrivalAirport: parsed.arrivalAirport || null,
        route: parsed.route || null,
        operationType: parsed.operationType || null,
        role: parsed.role || null,
        instructorName: parsed.instructorName || null,
        instructorCertNumber: parsed.instructorCertNumber || null,
        defaultTotalTime: parsed.defaultTotalTime || null,
        isFavorite: parsed.isFavorite,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.flightTemplates.id, id),
          eq(schema.flightTemplates.profileId, profile.id),
        ),
      )
      .returning({ id: schema.flightTemplates.id })

    if (updated.length === 0) {
      return { success: false, error: 'Template not found' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'flight_template',
      entityId: id,
      action: 'update',
      changes: parsed,
    })

    return { success: true, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      }
    }
    return { success: false, error: 'Failed to update template' }
  }
}
