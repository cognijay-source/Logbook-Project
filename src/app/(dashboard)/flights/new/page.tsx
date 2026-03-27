'use client'

import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FlightForm } from '@/components/flights/flight-form'
import { getAircraftList } from '../actions'

export default function NewFlightPage() {
  const aircraftQuery = useQuery({
    queryKey: ['aircraft-list'],
    queryFn: async () => {
      const result = await getAircraftList()
      if (result.error) {
        const err = new Error(result.error)
        Sentry.captureException(err)
        throw err
      }
      return result.data
    },
  })

  return (
    <motion.div
      className="mx-auto max-w-3xl space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href="/flights">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">New Flight</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Record a new entry
          </p>
        </div>
      </div>

      {aircraftQuery.isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      )}

      {aircraftQuery.isError && (
        <div className="card-elevated border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 p-6 text-center">
          <p className="text-sm text-[var(--status-expired)]">
            Could not load aircraft list.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-xl"
            onClick={() => aircraftQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {aircraftQuery.isSuccess && (
        <FlightForm aircraftList={aircraftQuery.data} />
      )}
    </motion.div>
  )
}
