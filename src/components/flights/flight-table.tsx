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
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-amber-50 text-amber-700 border border-amber-200'

  const dotColor = status === 'final' ? 'bg-emerald-500' : 'bg-amber-500'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${styles}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  )
}

export function FlightTable({ flights }: { flights: FlightRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b-0">
          <TableHead className="text-[11px] uppercase tracking-wide text-[#71717a]">
            Date
          </TableHead>
          <TableHead className="text-[11px] uppercase tracking-wide text-[#71717a]">
            Route
          </TableHead>
          <TableHead className="text-[11px] uppercase tracking-wide text-[#71717a]">
            Aircraft
          </TableHead>
          <TableHead className="text-right text-[11px] uppercase tracking-wide text-[#71717a]">
            Total Time
          </TableHead>
          <TableHead className="text-[11px] uppercase tracking-wide text-[#71717a]">
            Status
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flights.map((flight) => {
          const route = [flight.departureAirport, flight.arrivalAirport]
            .filter(Boolean)
            .join(' \u2192 ')

          return (
            <TableRow
              key={flight.id}
              className="group h-14 cursor-pointer transition-colors duration-150 hover:bg-[#f0f0f5]"
            >
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
                  {route || '\u2014'}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/flights/${flight.id}`}
                  className="block whitespace-nowrap"
                >
                  {flight.aircraft?.tailNumber ?? '\u2014'}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/flights/${flight.id}`}
                  className="block font-mono tabular-nums"
                >
                  {flight.totalTime ? `${flight.totalTime}` : '\u2014'}
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
