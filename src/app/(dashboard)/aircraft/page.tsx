'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { AircraftListClient } from './aircraft-list-client'
import { getAircraft } from './actions'
import { motion } from 'framer-motion'

export default function AircraftPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['aircraft', { page }],
    queryFn: async () => {
      const result = await getAircraft({ page })
      if (result.error) throw new Error(result.error)
      return result
    },
  })

  const aircraft = data?.data ?? []
  const total = data?.total ?? 0
  const pageSize = data?.pageSize ?? 50

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">✈️ Aircraft</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Your fleet</p>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="card-elevated border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 p-4 text-center text-sm text-[var(--status-expired)]">
          Could not load aircraft.
        </div>
      )}

      {aircraft.length > 0 && (
        <>
          <AircraftListClient aircraft={aircraft} />
          <PaginationControls
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}

      {!isLoading && !isError && aircraft.length === 0 && data && (
        <AircraftListClient aircraft={[]} />
      )}
    </motion.div>
  )
}
