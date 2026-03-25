import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/flights'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      Sentry.captureMessage('Auth callback code exchange failed', {
        level: 'warning',
        extra: { error: error.message },
      })
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  // If code exchange fails or no code, redirect to login with error
  return NextResponse.redirect(`${origin}/login`)
}
