'use client'

import { useQuery } from '@tanstack/react-query'
import { FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { getDocumentsForEntity } from '@/app/(dashboard)/documents/actions'
import type { DocumentRecord } from '@/app/(dashboard)/documents/actions'
import { DOCUMENT_CATEGORIES } from '@/lib/validators/document'

type Props = {
  entityType: 'flight' | 'aircraft' | 'training'
  entityId: string
}

function getCategoryLabel(type: string) {
  return DOCUMENT_CATEGORIES.find((c) => c.value === type)?.label ?? type
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function EntityDocuments({ entityType, entityId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['documents', 'entity', entityType, entityId],
    queryFn: async () => {
      const result = await getDocumentsForEntity(entityType, entityId)
      if (result.error) throw new Error(result.error)
      return result.data
    },
  })

  if (isLoading) {
    return <Skeleton className="h-16 rounded-lg" />
  }

  if (!data || data.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText className="text-muted-foreground h-4 w-4" />
        <h3 className="text-sm font-medium">
          Linked Documents ({data.length})
        </h3>
        <Link
          href="/documents"
          className="text-muted-foreground ml-auto text-xs hover:underline"
        >
          View all
          <ExternalLink className="ml-1 inline h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y rounded-lg border">
        {data.map((doc: DocumentRecord) => (
          <div key={doc.id} className="flex items-center gap-3 px-3 py-2">
            <FileText className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{doc.name}</p>
              <p className="text-muted-foreground text-xs">
                {getCategoryLabel(doc.documentType)} &middot;{' '}
                {formatDate(doc.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
