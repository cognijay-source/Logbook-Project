'use client'

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTransition } from '@/components/dashboard/page-transition'
import { DocumentsClient } from './documents-client'
import { getDocuments } from './actions'

export default function DocumentsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const result = await getDocuments()
      if (result.error) throw new Error(result.error)
      return result.data
    },
  })

  return (
    <PageTransition>
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-[32px]">📁 Documents</h1>
        <p className="text-muted-foreground mt-1">
          Certificates, endorsements, and supporting records.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {isError && (
        <div className="text-destructive rounded-lg border p-4">
          Could not load documents.
        </div>
      )}

      {data && <DocumentsClient documents={data} />}
    </div>
    </PageTransition>
  )
}
