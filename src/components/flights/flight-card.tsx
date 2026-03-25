'use client'

import Link from 'next/link'
import { Plane } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { FlightRow } from '@/app/(dashboard)/flights/actions'

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'final'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  )
}

export function FlightCard({ flight }: { flight: FlightRow }) {
  const route = [flight.departureAirport, flight.arrivalAirport]
    .filter(Boolean)
    .join(' → ')

  return (
    <Link href={`/flights/${flight.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <Plane className="text-muted-foreground h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">
                {route || 'No route'}
              </p>
              <StatusBadge status={flight.status} />
            </div>
            <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
              <span>{flight.flightDate}</span>
              {flight.aircraft && <span>{flight.aircraft.tailNumber}</span>}
              {flight.totalTime && <span>{flight.totalTime} hrs</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
