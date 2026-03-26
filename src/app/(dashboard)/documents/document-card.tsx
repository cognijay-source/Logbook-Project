'use client'

import { useState } from 'react'
import {
  FileText,
  Image,
  File,
  Download,
  Pencil,
  Trash2,
  MoreVertical,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { DOCUMENT_CATEGORIES } from '@/lib/validators/document'
import type { DocumentRecord } from './actions'
import { getDocumentUrl, deleteDocument } from './actions'

type Props = {
  document: DocumentRecord
  onPreview: () => void
  onEdit: () => void
  onDeleted: () => void
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <File className="h-8 w-8" />
  if (mimeType.startsWith('image/')) return <Image className="h-8 w-8" />
  if (mimeType === 'application/pdf') return <FileText className="h-8 w-8" />
  return <File className="h-8 w-8" />
}

function getCategoryLabel(type: string) {
  return DOCUMENT_CATEGORIES.find((c) => c.value === type)?.label ?? type
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function DocumentCard({ document: doc, onPreview, onEdit, onDeleted }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { toast } = useToast()

  async function handleDownload() {
    setDownloading(true)
    const result = await getDocumentUrl(doc.id)
    setDownloading(false)

    if (result.error || !result.data) {
      toast({ title: 'Download failed', description: result.error ?? 'Could not get URL', variant: 'destructive' })
      return
    }

    const a = window.document.createElement('a')
    a.href = result.data
    a.download = doc.name
    a.click()
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteDocument(doc.id)
    setDeleting(false)

    if (result.error) {
      toast({ title: 'Delete failed', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Document deleted', description: doc.name })
      setDeleteOpen(false)
      onDeleted()
    }
  }

  const entityLabel = doc.entityType
    ? `Linked to ${doc.entityType}`
    : null

  return (
    <>
      <div className="group flex flex-col rounded-xl border p-4 transition-shadow hover:shadow-md">
        {/* Icon + info */}
        <div className="flex items-start gap-3">
          <div className="text-muted-foreground flex-shrink-0">
            {getFileIcon(doc.mimeType)}
          </div>
          <div className="min-w-0 flex-1">
            <button
              onClick={onPreview}
              className="max-w-full truncate text-left text-sm font-medium hover:underline"
              title={doc.name}
            >
              {doc.name}
            </button>
            <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 text-xs">
              <span>{getCategoryLabel(doc.documentType)}</span>
              {doc.fileSize && <span>{formatSize(doc.fileSize)}</span>}
              <span>{formatDate(doc.createdAt)}</span>
            </div>
            {entityLabel && (
              <p className="text-muted-foreground mt-1 text-xs italic">
                {entityLabel}
              </p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPreview}>
                <FileText className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} disabled={downloading}>
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{doc.name}&quot;? This will
              remove it from storage and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
