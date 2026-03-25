'use client'

import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

export function FlightTable({ flights }: { flights: FlightRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Aircraft</TableHead>
          <TableHead className="text-right">Total Time</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flights.map((flight) => {
          const route = [flight.departureAirport, flight.arrivalAirport]
            .filter(Boolean)
            .join(' → ')

          return (
            <TableRow key={flight.id} className="cursor-pointer">
              <TableCell>
                <Link
                  href={`/flights/${flight.id}`}
                  className="block whitespace-nowrap"
                >
                  {flight.flightDate}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/flights/${flight.id}`} className="block">
                  {route || '—'}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/flights/${flight.id}`}
                  className="block whitespace-nowrap"
                >
                  {flight.aircraft?.tailNumber ?? '—'}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/flights/${flight.id}`} className="block">
                  {flight.totalTime ? `${flight.totalTime}` : '—'}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/flights/${flight.id}`} className="block">
                  <StatusBadge status={flight.status} />
                </Link>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
