'use client'

import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  skylogFields,
  skylogFieldLabels,
  type ColumnMapping,
  type SkylogField,
} from '@/lib/validators/import'

interface ColumnMappingProps {
  csvHeaders: string[]
  preview: Record<string, string>[]
  mapping: ColumnMapping
  onMappingChange: (mapping: ColumnMapping) => void
  onImport: () => void
  isProcessing: boolean
}

export function ColumnMappingStep({
  csvHeaders,
  preview,
  mapping,
  onMappingChange,
  onImport,
  isProcessing,
}: ColumnMappingProps) {
  const usedFields = useMemo(() => {
    const used = new Set<string>()
    for (const field of Object.values(mapping)) {
      if (field) used.add(field)
    }
    return used
  }, [mapping])

  const mappedCount = usedFields.size
  const hasFlightDate = usedFields.has('flightDate')

  function handleSelectChange(csvCol: string, value: string) {
    onMappingChange({ ...mapping, [csvCol]: value as SkylogField | '' })
  }

  // Build preview of mapped data (first 5 rows)
  const mappedPreview = useMemo(() => {
    const rows: Record<string, string>[] = []
    const activeMappings = Object.entries(mapping).filter(([, v]) => v)

    for (const previewRow of preview.slice(0, 5)) {
      const mapped: Record<string, string> = {}
      for (const [csvCol, skylogField] of activeMappings) {
        if (skylogField) {
          mapped[skylogFieldLabels[skylogField as SkylogField]] =
            previewRow[csvCol] ?? ''
        }
      }
      rows.push(mapped)
    }
    return rows
  }, [mapping, preview])

  const mappedHeaders = useMemo(
    () => (mappedPreview.length > 0 ? Object.keys(mappedPreview[0]) : []),
    [mappedPreview],
  )

  return (
    <div className="space-y-6">
      {/* Mapping selectors */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Map CSV columns to CrossCheck fields</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {csvHeaders.map((col) => (
            <div key={col} className="flex flex-col gap-1">
              <label className="text-muted-foreground truncate text-xs" title={col}>
                {col}
              </label>
              <select
                value={mapping[col] ?? ''}
                onChange={(e) => handleSelectChange(col, e.target.value)}
                className="border-input bg-background ring-offset-background focus:ring-ring h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <option value="">-- Skip --</option>
                {skylogFields.map((field) => (
                  <option
                    key={field}
                    value={field}
                    disabled={usedFields.has(field) && mapping[col] !== field}
                  >
                    {skylogFieldLabels[field]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Mapped data preview */}
      {mappedHeaders.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium">
            Preview of mapped data ({mappedCount} field{mappedCount !== 1 ? 's' : ''}{' '}
            mapped)
          </h3>
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {mappedHeaders.map((h) => (
                    <TableHead key={h} className="whitespace-nowrap">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedPreview.map((row, i) => (
                  <TableRow key={i}>
                    {mappedHeaders.map((h) => (
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
      )}

      {/* Import button */}
      <div className="flex items-center gap-3">
        <Button onClick={onImport} disabled={!hasFlightDate || isProcessing}>
          {isProcessing ? 'Importing...' : 'Import'}
        </Button>
        {!hasFlightDate && (
          <p className="text-destructive text-sm">
            Flight Date must be mapped to start the import.
          </p>
        )}
      </div>
    </div>
  )
}
