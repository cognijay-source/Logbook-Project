'use client'

import { useQuery } from '@tanstack/react-query'
import { Loader2, Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { DocumentRecord } from './actions'
import { getDocumentUrl } from './actions'

type Props = {
  document: DocumentRecord | null
  onClose: () => void
}

export function DocumentPreview({ document: doc, onClose }: Props) {
  const { data: url, isLoading: loading } = useQuery({
    queryKey: ['document-url', doc?.id],
    queryFn: async () => {
      if (!doc) return null
      const result = await getDocumentUrl(doc.id)
      if (result.error || !result.data)
        throw new Error(result.error ?? 'Could not load file')
      return result.data
    },
    enabled: !!doc,
  })

  const isImage = doc?.mimeType?.startsWith('image/')
  const isPdf = doc?.mimeType === 'application/pdf'

  function handleDownload() {
    if (!url || !doc) return
    const a = window.document.createElement('a')
    a.href = url
    a.download = doc.name
    a.click()
  }

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate">{doc?.name}</DialogTitle>
          <DialogDescription>
            {doc?.mimeType ?? 'Document preview'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[300px] items-center justify-center">
          {loading && (
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          )}

          {!loading && url && isImage && (
            <img
              src={url}
              alt={doc?.name ?? 'Document'}
              className="max-h-[60vh] max-w-full rounded-lg object-contain"
            />
          )}

          {!loading && url && isPdf && (
            <iframe
              src={url}
              title={doc?.name ?? 'PDF preview'}
              className="h-[60vh] w-full rounded-lg border"
            />
          )}

          {!loading && url && !isImage && !isPdf && (
            <div className="text-muted-foreground flex flex-col items-center gap-3 text-center">
              <p className="text-sm">
                Preview is not available for this file type.
              </p>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download instead
              </Button>
            </div>
          )}

          {!loading && !url && doc && (
            <p className="text-muted-foreground text-sm">
              Could not load preview.
            </p>
          )}
        </div>

        {url && (isImage || isPdf) && (
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
