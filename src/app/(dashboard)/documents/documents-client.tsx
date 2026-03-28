'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DocumentsIllustration } from '@/components/empty-state-illustrations'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { DOCUMENT_CATEGORIES } from '@/lib/validators/document'
import type { DocumentRecord } from './actions'
import { UploadZone } from './upload-zone'
import { DocumentCard } from './document-card'
import { DocumentPreview } from './document-preview'
import { DocumentEditDialog } from './document-edit-dialog'

type Props = {
  documents: DocumentRecord[]
}

export function DocumentsClient({ documents }: Props) {
  const queryClient = useQueryClient()
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null)
  const [editDoc, setEditDoc] = useState<DocumentRecord | null>(null)

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['documents'] })
  }

  const filtered =
    categoryFilter === 'all'
      ? documents
      : documents.filter((d) => d.documentType === categoryFilter)

  return (
    <>
      {/* Upload zone */}
      <UploadZone
        onUploadComplete={() => {
          refresh()
        }}
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={categoryFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategoryFilter('all')}
        >
          All
        </Button>
        {DOCUMENT_CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={categoryFilter === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <div className="mb-4"><DocumentsIllustration /></div>
          <h2 className="text-lg font-semibold">No documents</h2>
          <p className="text-muted-foreground text-sm">
            {categoryFilter === 'all'
              ? 'Upload your first document above.'
              : 'No documents in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onPreview={() => setPreviewDoc(doc)}
              onEdit={() => setEditDoc(doc)}
              onDeleted={refresh}
            />
          ))}
        </div>
      )}

      {/* Preview dialog */}
      <DocumentPreview
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      {/* Edit dialog */}
      <Dialog
        open={!!editDoc}
        onOpenChange={(open) => !open && setEditDoc(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update category or link to an entity.
            </DialogDescription>
          </DialogHeader>
          {editDoc && (
            <DocumentEditDialog
              document={editDoc}
              onSaved={() => {
                setEditDoc(null)
                refresh()
              }}
              onCancel={() => setEditDoc(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
