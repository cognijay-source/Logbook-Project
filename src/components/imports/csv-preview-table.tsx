'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CsvPreviewTableProps {
  headers: string[]
  rows: Record<string, string>[]
}

export function CsvPreviewTable({ headers, rows }: CsvPreviewTableProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium">
        Preview — first {rows.length} rows of your CSV
      </h3>
      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h) => (
                <TableHead key={h} className="whitespace-nowrap">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {headers.map((h) => (
                  <TableCell key={h} className="max-w-[200px] truncate">
                    {row[h] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
