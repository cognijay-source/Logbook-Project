'use server'

import { redirect } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'

export async function logout() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (err) {
    Sentry.captureException(err)
  }

  redirect('/login')
}
