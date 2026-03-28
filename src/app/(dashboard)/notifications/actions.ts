'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'

export type NotificationRow = typeof schema.notifications.$inferSelect

export async function getNotifications(params?: {
  page?: number
  pageSize?: number
}): Promise<{
  data: NotificationRow[]
  total: number
  page: number
  pageSize: number
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50
    const offset = (page - 1) * pageSize

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(schema.notifications)
        .where(
          and(
            eq(schema.notifications.profileId, profile.id),
            eq(schema.notifications.isDismissed, false),
          ),
        )
        .orderBy(desc(schema.notifications.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.notifications)
        .where(
          and(
            eq(schema.notifications.profileId, profile.id),
            eq(schema.notifications.isDismissed, false),
          ),
        ),
    ])

    return {
      data: rows,
      total: Number(countResult[0]?.count ?? 0),
      page,
      pageSize,
      error: null,
    }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 50,
      error: 'Failed to load notifications',
    }
  }
}

export async function getUnreadCount(): Promise<{
  data: number
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.profileId, profile.id),
          eq(schema.notifications.isRead, false),
          eq(schema.notifications.isDismissed, false),
        ),
      )
    return { data: Number(result[0]?.count ?? 0), error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: 0, error: 'Failed to get unread count' }
  }
}

export async function markAsRead(
  notificationId: string,
): Promise<{ error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    await db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.notifications.id, notificationId),
          eq(schema.notifications.profileId, profile.id),
        ),
      )
    return { error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { error: 'Failed to mark notification as read' }
  }
}

export async function markAllAsRead(): Promise<{ error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    await db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.notifications.profileId, profile.id),
          eq(schema.notifications.isRead, false),
        ),
      )
    return { error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { error: 'Failed to mark all as read' }
  }
}

export async function dismissNotification(
  notificationId: string,
): Promise<{ error: string | null }> {
  try {
    const profile = await getOrCreateProfile()
    await db
      .update(schema.notifications)
      .set({ isDismissed: true })
      .where(
        and(
          eq(schema.notifications.id, notificationId),
          eq(schema.notifications.profileId, profile.id),
        ),
      )
    return { error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { error: 'Failed to dismiss notification' }
  }
}
