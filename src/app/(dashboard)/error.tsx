'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
      <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
        CrossCheck encountered an unexpected error. If this persists, try
        refreshing the page or contact support.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-[#00b894] px-4 py-2 text-sm font-semibold text-[#0a0a0f] transition-colors duration-200 hover:bg-[#00c4a0]"
      >
        Try again
      </button>
    </div>
  )
}
