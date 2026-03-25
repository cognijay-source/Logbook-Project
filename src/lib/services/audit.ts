import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

export type CreateAuditEventParams = {
  profileId: string
  entityType: string
  entityId: string
  action: string
  changes?: unknown
  metadata?: unknown
}

export async function createAuditEvent(
  params: CreateAuditEventParams,
): Promise<void> {
  try {
    await db.insert(schema.auditEvents).values({
      profileId: params.profileId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      changes: params.changes ?? null,
      metadata: params.metadata ?? null,
    })
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
