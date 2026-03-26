'use client'

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { AircraftListClient } from './aircraft-list-client'
import { getAircraft } from './actions'

export default function AircraftPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['aircraft'],
    queryFn: async () => {
      const result = await getAircraft()
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Aircraft</h1>
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

      {data && <AircraftListClient aircraft={data} />}
    </div>
  )
}
