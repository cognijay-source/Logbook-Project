'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
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
        'group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300',
        isDragOver
          ? 'scale-[1.01] border-sky-500 bg-sky-500/5 shadow-lg shadow-sky-500/10'
          : 'border-muted-foreground/25 hover:border-sky-500/50 hover:bg-muted/30',
        isLoading && 'pointer-events-none opacity-50',
      )}
    >
      {isLoading ? (
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-muted-foreground" />
      ) : (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted transition-colors duration-300 group-hover:bg-sky-500/10">
          <Upload className="h-6 w-6 text-muted-foreground transition-colors duration-300 group-hover:text-sky-500" />
        </div>
      )}
      <p className="text-sm font-medium">
        {isLoading ? 'Uploading...' : 'Drag & drop your CSV file here'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        or click to browse. Accepts .csv files only.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
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
