'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { FlightTable } from '@/components/flights/flight-table'
import { FlightCard } from '@/components/flights/flight-card'
import { PageTransition } from '@/components/dashboard/page-transition'
import { EmptyState } from '@/components/dashboard/empty-state'
import { getFlights, getAircraftList } from './actions'

export default function FlightsPage() {
  const [search, setSearch] = useState('')
  const [aircraftId, setAircraftId] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const setSearchAndReset = useCallback((v: string) => {
    setSearch(v)
    setPage(1)
  }, [])
  const setAircraftIdAndReset = useCallback((v: string) => {
    setAircraftId(v)
    setPage(1)
  }, [])
  const setStatusAndReset = useCallback((v: string) => {
    setStatus(v)
    setPage(1)
  }, [])

  const flightsQuery = useQuery({
    queryKey: ['flights', { search, aircraftId, status, page }],
    queryFn: async () => {
      const result = await getFlights({ search, aircraftId, status, page })
      if (result.error) {
        const err = new Error(result.error)
        Sentry.captureException(err)
        throw err
      }
      return result
    },
  })

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

  const flights = flightsQuery.data?.data ?? []
  const total = flightsQuery.data?.total ?? 0
  const pageSize = flightsQuery.data?.pageSize ?? 50
  const aircraftOptions = aircraftQuery.data ?? []

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-[32px]">📖 Logbook</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {flightsQuery.isSuccess
              ? `${total} ${total === 1 ? 'entry' : 'entries'}`
              : '\u00A0'}
          </p>
        </div>
        <Button asChild>
          <Link href="/flights/new">
            <Plus className="mr-2 h-4 w-4" />
            Log Flight
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search flights..."
            value={search}
            onChange={(e) => setSearchAndReset(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={aircraftId}
          onChange={(e) => setAircraftIdAndReset(e.target.value)}
          className="border-input bg-background focus:border-ring focus:ring-ring/20 h-9 rounded-md border px-3 text-sm shadow-sm transition-colors duration-200 focus:ring-2 focus:outline-none"
        >
          <option value="all">All Aircraft</option>
          {aircraftOptions.map((ac) => (
            <option key={ac.id} value={ac.id}>
              {ac.tailNumber}
              {ac.model ? ` (${ac.model})` : ''}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatusAndReset(e.target.value)}
          className="border-input bg-background focus:border-ring focus:ring-ring/20 h-9 rounded-md border px-3 text-sm shadow-sm transition-colors duration-200 focus:ring-2 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="final">Final</option>
        </select>
      </div>

      {/* Loading */}
      {flightsQuery.isLoading && <FlightsLoadingSkeleton />}

      {/* Error */}
      {flightsQuery.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">
            Could not load flights.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => flightsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty state */}
      {flightsQuery.isSuccess && flights.length === 0 && (
        <EmptyState
          illustration="logbook"
          title="No flights found"
          subtitle={
            search || aircraftId !== 'all' || status !== 'all'
              ? 'Adjust your filters to find matching entries.'
              : 'Record your first flight to begin building your logbook.'
          }
          actionLabel={!search && aircraftId === 'all' && status === 'all' ? 'Log Flight' : undefined}
          actionHref={!search && aircraftId === 'all' && status === 'all' ? '/flights/new' : undefined}
        />
      )}

      {/* Flight list */}
      {flightsQuery.isSuccess && flights.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <FlightTable flights={flights} />
          </div>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {flights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>
          <PaginationControls
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
    </PageTransition>
  )
}

function FlightsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  )
}
