'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CsvUploadZoneProps {
  onFileSelected: (file: File) => void
  isLoading: boolean
}

export function CsvUploadZone({
  onFileSelected,
  isLoading,
}: CsvUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.csv')) return
      onFileSelected(file)
    },
    [onFileSelected],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
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
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
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
      <Upload className="text-muted-foreground mb-4 h-10 w-10" />
      <p className="text-sm font-medium">
        {isLoading ? 'Uploading...' : 'Drag & drop your CSV file here'}
      </p>
      <p className="text-muted-foreground mt-1 text-xs">
        or click to browse. Accepts .csv files only.
      </p>
      <p className="text-muted-foreground mt-2 text-xs">
        Supports ForeFlight, LogTen Pro, and MyFlightBook exports
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
