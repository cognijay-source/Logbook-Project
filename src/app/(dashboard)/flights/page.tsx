'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Plane } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { FlightTable } from '@/components/flights/flight-table'
import { FlightCard } from '@/components/flights/flight-card'
import { getFlights, getAircraftList } from './actions'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

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
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">📖 Logbook</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {flightsQuery.isSuccess
              ? `${total} ${total === 1 ? 'entry' : 'entries'}`
              : '\u00A0'}
          </p>
        </div>
        <Link
          href="/flights/new"
          className="btn-primary inline-flex items-center text-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Log Flight
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} transition={{ duration: 0.3 }} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <Input
            placeholder="Search flights..."
            value={search}
            onChange={(e) => setSearchAndReset(e.target.value)}
            className="rounded-xl pl-9 focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal)]/20"
          />
        </div>
        <select
          value={aircraftId}
          onChange={(e) => setAircraftIdAndReset(e.target.value)}
          className="h-9 rounded-xl border border-[var(--text-primary)]/8 bg-white px-3 text-sm shadow-sm transition-colors duration-200 focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20 focus:outline-none"
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
          className="h-9 rounded-xl border border-[var(--text-primary)]/8 bg-white px-3 text-sm shadow-sm transition-colors duration-200 focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="final">Final</option>
        </select>
      </motion.div>

      {/* Loading */}
      {flightsQuery.isLoading && <FlightsLoadingSkeleton />}

      {/* Error */}
      {flightsQuery.isError && (
        <div className="card-elevated border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 p-6 text-center">
          <p className="text-sm text-[var(--status-expired)]">
            Could not load flights.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-xl"
            onClick={() => flightsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty state */}
      {flightsQuery.isSuccess && flights.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--text-primary)]/10 py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-primary)]">
            <Plane className="h-6 w-6 text-[var(--text-secondary)]" />
          </div>
          <h3 className="mt-4 font-heading text-lg font-semibold text-[var(--text-primary)]">No flights found</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {search || aircraftId !== 'all' || status !== 'all'
              ? 'Adjust your filters to find matching entries.'
              : 'Record your first flight to begin building your logbook.'}
          </p>
          {!search && aircraftId === 'all' && status === 'all' && (
            <Link
              href="/flights/new"
              className="btn-primary mt-4 inline-flex items-center text-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Log Flight
            </Link>
          )}
        </div>
      )}

      {/* Flight list */}
      {flightsQuery.isSuccess && flights.length > 0 && (
        <motion.div variants={fadeInUp} transition={{ duration: 0.3 }}>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="card-elevated overflow-hidden">
              <FlightTable flights={flights} />
            </div>
          </div>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {flights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>
          <div className="mt-4">
            <PaginationControls
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function FlightsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="card-elevated flex items-center gap-4 p-4">
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
