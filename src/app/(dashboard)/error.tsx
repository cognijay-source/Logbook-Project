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
      <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
        CrossCheck encountered an unexpected error. If this persists, try
        refreshing the page or contact support.
      </p>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
      >
        Try again
      </button>
    </div>
  )
}
