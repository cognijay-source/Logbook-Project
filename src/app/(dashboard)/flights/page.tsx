'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Plane } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { FlightTable } from '@/components/flights/flight-table'
import { FlightCard } from '@/components/flights/flight-card'
import { getFlights, getAircraftList } from './actions'

export default function FlightsPage() {
  const [search, setSearch] = useState('')
  const [aircraftId, setAircraftId] = useState('all')
  const [status, setStatus] = useState('all')

  const flightsQuery = useQuery({
    queryKey: ['flights', { search, aircraftId, status }],
    queryFn: async () => {
      const result = await getFlights({ search, aircraftId, status })
      if (result.error) {
        const err = new Error(result.error)
        Sentry.captureException(err)
        throw err
      }
      return result.data
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

  const flights = flightsQuery.data ?? []
  const aircraftOptions = aircraftQuery.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Flights</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {flightsQuery.isSuccess
              ? `${flights.length} flight${flights.length !== 1 ? 's' : ''} logged`
              : 'Loading your flights...'}
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
            placeholder="Search airports, routes, remarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={aircraftId}
          onChange={(e) => setAircraftId(e.target.value)}
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
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
          onChange={(e) => setStatus(e.target.value)}
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
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
            Failed to load flights. Please try again.
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
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
            <Plane className="text-muted-foreground h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No flights found</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {search || aircraftId !== 'all' || status !== 'all'
              ? 'Try adjusting your filters.'
              : 'Log your first flight to get started.'}
          </p>
          {!search && aircraftId === 'all' && status === 'all' && (
            <Button asChild className="mt-4">
              <Link href="/flights/new">
                <Plus className="mr-2 h-4 w-4" />
                Log Flight
              </Link>
            </Button>
          )}
        </div>
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
        </>
      )}
    </div>
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
