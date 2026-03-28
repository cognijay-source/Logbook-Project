'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { FlightRow } from '@/app/(dashboard)/flights/actions'

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'final'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-amber-50 text-amber-700 border border-amber-200'

  const dotColor = status === 'final' ? 'bg-emerald-500' : 'bg-amber-500'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  )
}

export function FlightCard({ flight }: { flight: FlightRow }) {
  const route = [flight.departureAirport, flight.arrivalAirport]
    .filter(Boolean)
    .join(' \u2192 ')

  return (
    <Link href={`/flights/${flight.id}`}>
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981]/10 text-lg">
            ✈️
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">
                {route || 'Local'}
              </p>
              <StatusBadge status={flight.status} />
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{flight.flightDate}</span>
              {flight.aircraft && <span>{flight.aircraft.tailNumber}</span>}
              {flight.totalTime && (
                <span className="font-mono tabular-nums">
                  {flight.totalTime} hrs
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
