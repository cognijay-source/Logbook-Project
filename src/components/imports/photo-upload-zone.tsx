'use client'

import { useCallback, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PhotoUploadZoneProps {
  onFilesSelected: (files: File[]) => void
  isLoading: boolean
}

export function PhotoUploadZone({ onFilesSelected, isLoading }: PhotoUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const accepted = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
      const valid = newFiles.filter((f) => accepted.includes(f.type))
      if (valid.length === 0) return

      const updated = [...selectedFiles, ...valid]
      setSelectedFiles(updated)

      // Generate previews
      for (const file of valid) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      }
    },
    [selectedFiles],
  )

  const removeFile = useCallback(
    (index: number) => {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
      setPreviews((prev) => prev.filter((_, i) => i !== index))
    },
    [],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      addFiles(files)
    },
    [addFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      addFiles(files)
      // Reset input so re-selecting same files works
      if (inputRef.current) inputRef.current.value = ''
    },
    [addFiles],
  )

  const handleParse = useCallback(() => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles)
    }
  }, [selectedFiles, onFilesSelected])

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          isLoading && 'pointer-events-none opacity-50',
        )}
      >
        <Camera className="text-muted-foreground mb-4 h-10 w-10" />
        <p className="text-sm font-medium">
          {isLoading ? 'Parsing with AI...' : 'Drag & drop logbook photos here'}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          or click to browse. Accepts JPG, PNG, and HEIC images.
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          Upload one or more photos of your paper logbook pages
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Thumbnails */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="group relative">
                <img
                  src={src}
                  alt={selectedFiles[i]?.name ?? `Image ${i + 1}`}
                  className="h-24 w-24 rounded-md border object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(i)
                  }}
                  className="bg-destructive text-destructive-foreground absolute -right-2 -top-2 rounded-full p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="mt-1 max-w-24 truncate text-xs text-muted-foreground">
                  {selectedFiles[i]?.name}
                </p>
              </div>
            ))}
          </div>
          <Button onClick={handleParse} disabled={isLoading || selectedFiles.length === 0}>
            {isLoading ? 'Parsing with AI...' : 'Parse with AI'}
          </Button>
        </div>
      )}
    </div>
  )
}
