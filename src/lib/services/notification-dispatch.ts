import * as Sentry from '@sentry/nextjs'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

export type NotificationType =
  | 'currency_expiring'
  | 'currency_expired'
  | 'goal_completed'
  | 'milestone_achieved'
  | 'import_complete'
  | 'system'

interface DispatchInput {
  profileId: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  metadata?: Record<string, unknown>
}

/**
 * Dispatch a notification to a user.
 * Fire-and-forget — callers should `.catch(() => {})`.
 */
export async function dispatchNotification(input: DispatchInput): Promise<void> {
  try {
    await db.insert(schema.notifications).values({
      profileId: input.profileId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
      metadata: input.metadata,
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}

/**
 * Dispatch multiple notifications in a single insert.
 */
export async function dispatchNotifications(
  inputs: DispatchInput[],
): Promise<void> {
  if (inputs.length === 0) return
  try {
    await db.insert(schema.notifications).values(
      inputs.map((input) => ({
        profileId: input.profileId,
        type: input.type,
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl,
        metadata: input.metadata,
      })),
    )
  } catch (error) {
    Sentry.captureException(error)
  }
}
