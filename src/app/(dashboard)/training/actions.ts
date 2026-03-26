'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, desc, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'
import { createAuditEvent } from '@/lib/services/audit'
import {
  trainingEntryCreateSchema,
  trainingEntryUpdateSchema,
  certificateCreateSchema,
  certificateUpdateSchema,
  endorsementCreateSchema,
  endorsementUpdateSchema,
} from '@/lib/validators/training'

// ==================== Training Entries ====================

export async function getTrainingEntries(params?: {
  page?: number
  pageSize?: number
}) {
  try {
    const profile = await getOrCreateProfile()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50
    const conditions = eq(schema.trainingEntries.profileId, profile.id)

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(schema.trainingEntries)
        .where(conditions)
        .orderBy(desc(schema.trainingEntries.entryDate))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.trainingEntries)
        .where(conditions),
    ])

    const total = Number(countResult[0]?.count) || 0
    return { data: rows, total, page, pageSize, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 50,
      error: 'Failed to load training entries',
    }
  }
}

export async function createTrainingEntry(data: unknown) {
  try {
    const profile = await getOrCreateProfile()
    const parsed = trainingEntryCreateSchema.parse(data)

    const inserted = await db
      .insert(schema.trainingEntries)
      .values({
        profileId: profile.id,
        entryType: parsed.entryType,
        subject: parsed.subject,
        description: parsed.description ?? null,
        instructor: parsed.instructor ?? null,
        entryDate: parsed.entryDate,
        duration:
          parsed.duration !== undefined ? String(parsed.duration) : null,
        notes: parsed.notes ?? null,
      })
      .returning({ id: schema.trainingEntries.id })

    if (!inserted[0]) {
      return { id: null, error: 'Failed to create training entry' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'training_entry',
      entityId: inserted[0].id,
      action: 'create',
      changes: parsed,
    })

    return { id: inserted[0].id, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return { id: null, error: error.errors.map((e) => e.message).join(', ') }
    }
    return { id: null, error: 'Failed to create training entry' }
  }
}

export async function updateTrainingEntry(id: string, data: unknown) {
  try {
    const profile = await getOrCreateProfile()

    const existing = await db
      .select({ id: schema.trainingEntries.id })
      .from(schema.trainingEntries)
      .where(
        and(
          eq(schema.trainingEntries.id, id),
          eq(schema.trainingEntries.profileId, profile.id),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: 'Training entry not found' }
    }

    const parsed = trainingEntryUpdateSchema.parse(data)

    await db
      .update(schema.trainingEntries)
      .set({
        entryType: parsed.entryType,
        subject: parsed.subject,
        description: parsed.description ?? null,
        instructor: parsed.instructor ?? null,
        entryDate: parsed.entryDate,
        duration:
          parsed.duration !== undefined ? String(parsed.duration) : null,
        notes: parsed.notes ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.trainingEntries.id, id),
          eq(schema.trainingEntries.profileId, profile.id),
        ),
      )

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'training_entry',
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
    return { success: false, error: 'Failed to update training entry' }
  }
}

export async function deleteTrainingEntry(id: string) {
  try {
    const profile = await getOrCreateProfile()

    const deleted = await db
      .delete(schema.trainingEntries)
      .where(
        and(
          eq(schema.trainingEntries.id, id),
          eq(schema.trainingEntries.profileId, profile.id),
        ),
      )
      .returning({ id: schema.trainingEntries.id })

    if (deleted.length === 0) {
      return { success: false, error: 'Training entry not found' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'training_entry',
      entityId: id,
      action: 'delete',
    })

    return { success: true, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Failed to delete training entry' }
  }
}

// ==================== Certificates ====================

export async function getCertificates(params?: {
  page?: number
  pageSize?: number
}) {
  try {
    const profile = await getOrCreateProfile()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50
    const conditions = eq(schema.certificates.profileId, profile.id)

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(schema.certificates)
        .where(conditions)
        .orderBy(desc(schema.certificates.issuedDate))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.certificates)
        .where(conditions),
    ])

    const total = Number(countResult[0]?.count) || 0
    return { data: rows, total, page, pageSize, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 50,
      error: 'Failed to load certificates',
    }
  }
}

export async function createCertificate(data: unknown) {
  try {
    const profile = await getOrCreateProfile()
    const parsed = certificateCreateSchema.parse(data)

    const inserted = await db
      .insert(schema.certificates)
      .values({
        profileId: profile.id,
        certificateType: parsed.certificateType,
        name: parsed.name,
        issuedDate: parsed.issuedDate ?? null,
        expiryDate: parsed.expiryDate ?? null,
        issuingAuthority: parsed.issuingAuthority ?? null,
        notes: parsed.notes ?? null,
      })
      .returning({ id: schema.certificates.id })

    if (!inserted[0]) {
      return { id: null, error: 'Failed to create certificate' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'certificate',
      entityId: inserted[0].id,
      action: 'create',
      changes: parsed,
    })

    return { id: inserted[0].id, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return { id: null, error: error.errors.map((e) => e.message).join(', ') }
    }
    return { id: null, error: 'Failed to create certificate' }
  }
}

export async function updateCertificate(id: string, data: unknown) {
  try {
    const profile = await getOrCreateProfile()

    const existing = await db
      .select({ id: schema.certificates.id })
      .from(schema.certificates)
      .where(
        and(
          eq(schema.certificates.id, id),
          eq(schema.certificates.profileId, profile.id),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: 'Certificate not found' }
    }

    const parsed = certificateUpdateSchema.parse(data)

    await db
      .update(schema.certificates)
      .set({
        certificateType: parsed.certificateType,
        name: parsed.name,
        issuedDate: parsed.issuedDate ?? null,
        expiryDate: parsed.expiryDate ?? null,
        issuingAuthority: parsed.issuingAuthority ?? null,
        notes: parsed.notes ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.certificates.id, id),
          eq(schema.certificates.profileId, profile.id),
        ),
      )

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'certificate',
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
    return { success: false, error: 'Failed to update certificate' }
  }
}

export async function deleteCertificate(id: string) {
  try {
    const profile = await getOrCreateProfile()

    const deleted = await db
      .delete(schema.certificates)
      .where(
        and(
          eq(schema.certificates.id, id),
          eq(schema.certificates.profileId, profile.id),
        ),
      )
      .returning({ id: schema.certificates.id })

    if (deleted.length === 0) {
      return { success: false, error: 'Certificate not found' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'certificate',
      entityId: id,
      action: 'delete',
    })

    return { success: true, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Failed to delete certificate' }
  }
}

// ==================== Endorsements ====================

export async function getEndorsements(params?: {
  page?: number
  pageSize?: number
}) {
  try {
    const profile = await getOrCreateProfile()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50
    const conditions = eq(schema.endorsements.profileId, profile.id)

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(schema.endorsements)
        .where(conditions)
        .orderBy(desc(schema.endorsements.endorsedDate))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.endorsements)
        .where(conditions),
    ])

    const total = Number(countResult[0]?.count) || 0
    return { data: rows, total, page, pageSize, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 50,
      error: 'Failed to load endorsements',
    }
  }
}

export async function createEndorsement(data: unknown) {
  try {
    const profile = await getOrCreateProfile()
    const parsed = endorsementCreateSchema.parse(data)

    const inserted = await db
      .insert(schema.endorsements)
      .values({
        profileId: profile.id,
        endorsementType: parsed.endorsementType,
        description: parsed.description,
        endorsedDate: parsed.endorsedDate ?? null,
        instructorName: parsed.instructorName ?? null,
        instructorCertNumber: parsed.instructorCertNumber ?? null,
        notes: parsed.notes ?? null,
      })
      .returning({ id: schema.endorsements.id })

    if (!inserted[0]) {
      return { id: null, error: 'Failed to create endorsement' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'endorsement',
      entityId: inserted[0].id,
      action: 'create',
      changes: parsed,
    })

    return { id: inserted[0].id, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return { id: null, error: error.errors.map((e) => e.message).join(', ') }
    }
    return { id: null, error: 'Failed to create endorsement' }
  }
}

export async function updateEndorsement(id: string, data: unknown) {
  try {
    const profile = await getOrCreateProfile()

    const existing = await db
      .select({ id: schema.endorsements.id })
      .from(schema.endorsements)
      .where(
        and(
          eq(schema.endorsements.id, id),
          eq(schema.endorsements.profileId, profile.id),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: 'Endorsement not found' }
    }

    const parsed = endorsementUpdateSchema.parse(data)

    await db
      .update(schema.endorsements)
      .set({
        endorsementType: parsed.endorsementType,
        description: parsed.description,
        endorsedDate: parsed.endorsedDate ?? null,
        instructorName: parsed.instructorName ?? null,
        instructorCertNumber: parsed.instructorCertNumber ?? null,
        notes: parsed.notes ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.endorsements.id, id),
          eq(schema.endorsements.profileId, profile.id),
        ),
      )

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'endorsement',
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
    return { success: false, error: 'Failed to update endorsement' }
  }
}

export async function deleteEndorsement(id: string) {
  try {
    const profile = await getOrCreateProfile()

    const deleted = await db
      .delete(schema.endorsements)
      .where(
        and(
          eq(schema.endorsements.id, id),
          eq(schema.endorsements.profileId, profile.id),
        ),
      )
      .returning({ id: schema.endorsements.id })

    if (deleted.length === 0) {
      return { success: false, error: 'Endorsement not found' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'endorsement',
      entityId: id,
      action: 'delete',
    })

    return { success: true, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Failed to delete endorsement' }
  }
}
