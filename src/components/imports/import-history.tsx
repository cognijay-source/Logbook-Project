'use client'

import { useQuery } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
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
import { getImportBatches } from '@/app/(dashboard)/imports/actions'

interface ImportHistoryProps {
  onViewBatch: (batchId: string) => void
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  )
}

function formatDate(date: Date | string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ImportHistory({ onViewBatch }: ImportHistoryProps) {
  const batchesQuery = useQuery({
    queryKey: ['importBatches'],
    queryFn: async () => {
      const result = await getImportBatches()
      if (result.error) {
        const err = new Error(result.error)
        Sentry.captureException(err)
        throw err
      }
      return result.data
    },
  })

  if (batchesQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (batchesQuery.isError) {
    return (
      <div className="text-center">
        <p className="text-destructive text-sm">
          Failed to load import history.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => batchesQuery.refetch()}
        >
          Retry
        </Button>
      </div>
    )
  }

  const batches = batchesQuery.data ?? []

  if (batches.length === 0) {
    return (
      <p className="text-muted-foreground text-center text-sm">
        No imports yet. Upload a CSV to get started.
      </p>
    )
  }

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Imported</TableHead>
            <TableHead className="text-right">Failed</TableHead>
            <TableHead>Date</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell className="max-w-[200px] truncate font-medium">
                {batch.fileName ?? 'Untitled'}
              </TableCell>
              <TableCell>{statusBadge(batch.status)}</TableCell>
              <TableCell className="text-right">
                {batch.totalRows ?? 0}
              </TableCell>
              <TableCell className="text-right">
                {batch.processedRows ?? 0}
              </TableCell>
              <TableCell className="text-right">
                {batch.errorRows ?? 0}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(batch.createdAt)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewBatch(batch.id)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
