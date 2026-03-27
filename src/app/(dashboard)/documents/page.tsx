'use client'

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { DocumentsClient } from './documents-client'
import { getDocuments } from './actions'
import { motion } from 'framer-motion'

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
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">📁 Documents</h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Certificates, endorsements, and supporting records.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {isError && (
        <div className="card-elevated border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 p-4 text-center text-sm text-[var(--status-expired)]">
          Could not load documents.
        </div>
      )}

      {data && <DocumentsClient documents={data} />}
    </motion.div>
  )
}
