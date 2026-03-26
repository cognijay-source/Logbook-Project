'use client'

import { useCallback } from 'react'
import { type AiParsedFlight } from '@/lib/validators/import'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface AiReviewTableProps {
  flights: AiParsedFlight[]
  onFlightsChange: (flights: AiParsedFlight[]) => void
}

const columns: { key: keyof AiParsedFlight; label: string; type: 'text' | 'number' }[] = [
  { key: 'date', label: 'Date', type: 'text' },
  { key: 'aircraft_type', label: 'Type', type: 'text' },
  { key: 'aircraft_ident', label: 'Tail #', type: 'text' },
  { key: 'route_from', label: 'From', type: 'text' },
  { key: 'route_to', label: 'To', type: 'text' },
  { key: 'route_via', label: 'Via', type: 'text' },
  { key: 'total_time', label: 'Total', type: 'number' },
  { key: 'pic_time', label: 'PIC', type: 'number' },
  { key: 'sic_time', label: 'SIC', type: 'number' },
  { key: 'dual_received', label: 'Dual Rcvd', type: 'number' },
  { key: 'cross_country', label: 'XC', type: 'number' },
  { key: 'night_time', label: 'Night', type: 'number' },
  { key: 'instrument_actual', label: 'Inst Act', type: 'number' },
  { key: 'instrument_simulated', label: 'Inst Sim', type: 'number' },
  { key: 'day_landings', label: 'Day Ldg', type: 'number' },
  { key: 'night_landings', label: 'Ngt Ldg', type: 'number' },
  { key: 'remarks', label: 'Remarks', type: 'text' },
]

export function AiReviewTable({ flights, onFlightsChange }: AiReviewTableProps) {
  const updateField = useCallback(
    (rowIndex: number, key: keyof AiParsedFlight, value: string) => {
      const updated = [...flights]
      const col = columns.find((c) => c.key === key)

      if (col?.type === 'number') {
        if (value === '') {
          updated[rowIndex] = { ...updated[rowIndex], [key]: null }
        } else {
          const n = Number(value)
          if (!isNaN(n)) {
            updated[rowIndex] = { ...updated[rowIndex], [key]: n }
          }
        }
      } else {
        updated[rowIndex] = { ...updated[rowIndex], [key]: value || null }
      }

      onFlightsChange(updated)
    },
    [flights, onFlightsChange],
  )

  const removeRow = useCallback(
    (index: number) => {
      onFlightsChange(flights.filter((_, i) => i !== index))
    },
    [flights, onFlightsChange],
  )

  if (flights.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No flights were extracted. Try uploading a clearer image.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">
        {flights.length} flight{flights.length !== 1 ? 's' : ''} extracted — review and edit before
        importing
      </p>
      <p className="text-muted-foreground text-xs">
        Fields highlighted in yellow could not be read clearly and need review. Empty fields were not
        found on the page.
      </p>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              {columns.map((col) => (
                <TableHead key={col.key} className="min-w-[80px] whitespace-nowrap text-xs">
                  {col.label}
                </TableHead>
              ))}
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {flights.map((flight, rowIdx) => (
              <TableRow key={rowIdx}>
                <TableCell className="text-muted-foreground text-xs">{rowIdx + 1}</TableCell>
                {columns.map((col) => {
                  const value = flight[col.key]
                  const isEmpty = value === null || value === undefined
                  const isRequired = ['date', 'route_from', 'route_to', 'total_time'].includes(
                    col.key,
                  )
                  const needsReview = isEmpty && isRequired

                  return (
                    <TableCell key={col.key} className="p-1">
                      <Input
                        className={cn(
                          'h-7 text-xs',
                          needsReview && 'border-yellow-400 bg-yellow-50',
                        )}
                        type={col.type === 'number' ? 'text' : 'text'}
                        inputMode={col.type === 'number' ? 'decimal' : 'text'}
                        value={value ?? ''}
                        placeholder={needsReview ? 'needs review' : ''}
                        onChange={(e) => updateField(rowIdx, col.key, e.target.value)}
                      />
                    </TableCell>
                  )
                })}
                <TableCell className="p-1">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIdx)}
                    className="text-muted-foreground hover:text-destructive text-xs"
                    title="Remove row"
                  >
                    &times;
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
