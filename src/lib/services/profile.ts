'use server'

import * as Sentry from '@sentry/nextjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'

export async function getOrCreateProfile() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  try {
    const existing = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, user.id))
      .limit(1)

    if (existing.length > 0) {
      return existing[0]
    }

    const inserted = await db
      .insert(schema.profiles)
      .values({
        userId: user.id,
        email: user.email ?? '',
      })
      .onConflictDoUpdate({
        target: schema.profiles.userId,
        set: { updatedAt: new Date() },
      })
      .returning()

    return inserted[0]
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
