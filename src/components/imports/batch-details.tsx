'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getImportBatchDetails,
  retryFailedRows,
} from '@/app/(dashboard)/imports/actions'

interface BatchDetailsProps {
  batchId: string
  onBack: () => void
}

export function BatchDetails({ batchId, onBack }: BatchDetailsProps) {
  const queryClient = useQueryClient()
  const [retrying, setRetrying] = useState(false)
  const [retryResult, setRetryResult] = useState<{
    processed: number
    errored: number
  } | null>(null)

  const detailsQuery = useQuery({
    queryKey: ['importBatchDetails', batchId],
    queryFn: async () => {
      const result = await getImportBatchDetails(batchId)
      if (result.error) {
        const err = new Error(result.error)
        Sentry.captureException(err)
        throw err
      }
      return result.data
    },
  })

  async function handleRetry() {
    setRetrying(true)
    setRetryResult(null)
    try {
      const result = await retryFailedRows({ batchId })
      if (result.error) {
        Sentry.captureException(new Error(result.error))
      } else if (result.data) {
        setRetryResult(result.data)
      }
      await queryClient.invalidateQueries({ queryKey: ['importBatchDetails', batchId] })
      await queryClient.invalidateQueries({ queryKey: ['importBatches'] })
    } catch (error) {
      Sentry.captureException(error)
    } finally {
      setRetrying(false)
    }
  }

  if (detailsQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (detailsQuery.isError || !detailsQuery.data) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-destructive text-sm">Failed to load batch details.</p>
        <Button variant="outline" size="sm" onClick={() => detailsQuery.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const { batch, rows } = detailsQuery.data
  const erroredRows = rows.filter((r) => r.status === 'errored')
  const hasErrors = erroredRows.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            &larr; Back to imports
          </Button>
        </div>
        <div className="text-right text-sm">
          <span className="font-medium">{batch.fileName}</span>
          <span className="text-muted-foreground ml-2">
            {batch.processedRows ?? 0} imported, {batch.errorRows ?? 0} failed of{' '}
            {batch.totalRows ?? 0} total
          </span>
        </div>
      </div>

      {retryResult && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm">
          Retry complete: {retryResult.processed} imported, {retryResult.errored} still
          failed.
        </div>
      )}

      {hasErrors && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Failed rows ({erroredRows.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? 'Retrying...' : 'Retry failed rows'}
            </Button>
          </div>
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead>Errors</TableHead>
                  <TableHead>Raw Data (excerpt)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {erroredRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.rowNumber}</TableCell>
                    <TableCell>
                      <ErrorList errors={row.errors} />
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-xs">
                      {summarizeRaw(row.rawData)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {!hasErrors && rows.length > 0 && (
        <p className="text-muted-foreground text-center text-sm">
          All {rows.length} rows processed successfully.
        </p>
      )}
    </div>
  )
}

function ErrorList({ errors }: { errors: unknown }) {
  if (!Array.isArray(errors)) return <span className="text-muted-foreground">-</span>
  return (
    <ul className="list-inside list-disc text-xs">
      {(errors as { path: string; message: string }[]).map((e, i) => (
        <li key={i} className="text-destructive">
          {e.path ? `${e.path}: ` : ''}
          {e.message}
        </li>
      ))}
    </ul>
  )
}

function summarizeRaw(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '-'
  const entries = Object.entries(raw as Record<string, string>)
  return entries
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
}
