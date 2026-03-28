'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { AircraftListClient } from './aircraft-list-client'
import { PageTransition } from '@/components/page-transition'
import { getAircraft } from './actions'

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
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">✈️ Aircraft</h1>
            <p className="text-muted-foreground mt-1">Your fleet</p>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-destructive rounded-lg border p-4">
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
      </div>
    </PageTransition>
  )
}
