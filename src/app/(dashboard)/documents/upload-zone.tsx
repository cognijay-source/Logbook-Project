'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
} from '@/lib/validators/document'
import { useToast } from '@/hooks/use-toast'
import { uploadDocument } from './actions'

type Props = {
  onUploadComplete: () => void
}

export function UploadZone({ onUploadComplete }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState<DocumentCategory>('other')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file)
  }, [])

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  async function handleUpload() {
    if (!selectedFile) return

    setUploading(true)
    setProgress(30)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('category', category)

    setProgress(60)
    const result = await uploadDocument(formData)
    setProgress(100)

    if (result.error) {
      toast({
        title: 'Upload failed',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Document uploaded', description: selectedFile.name })
      setSelectedFile(null)
      if (inputRef.current) inputRef.current.value = ''
      onUploadComplete()
    }

    setUploading(false)
    setProgress(0)
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <Upload className="text-muted-foreground mb-3 h-8 w-8" />
        <p className="text-sm font-medium">
          Drag & drop a file here, or click to browse
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Images, PDFs, and documents up to 10MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.txt,.csv"
          onChange={handleFileInput}
        />
      </div>

      {/* Selected file + category */}
      {selectedFile && (
        <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{selectedFile.name}</p>
            <p className="text-muted-foreground text-xs">
              {formatSize(selectedFile.size)}
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="category" className="text-xs">
              Category
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="border-input bg-background ring-offset-background focus:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none sm:w-40"
            >
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFile(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
