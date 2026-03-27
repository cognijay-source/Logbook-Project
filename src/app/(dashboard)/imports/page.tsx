'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CsvUploadZone } from '@/components/imports/csv-upload-zone'
import { CsvPreviewTable } from '@/components/imports/csv-preview-table'
import { ColumnMappingStep } from '@/components/imports/column-mapping'
import { ImportHistory } from '@/components/imports/import-history'
import { BatchDetails } from '@/components/imports/batch-details'
import { AiImportSection } from '@/components/imports/ai-import-section'
import { uploadCsv, processImportBatch } from './actions'
import { autoDetectMapping, type ColumnMapping } from '@/lib/validators/import'
import { motion } from 'framer-motion'

type Step = 'upload' | 'mapping' | 'results' | 'batch-details'

export default function ImportsPage() {
  const queryClient = useQueryClient()

  // Wizard state
  const [step, setStep] = useState<Step>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Upload result
  const [batchId, setBatchId] = useState<string | null>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({})

  // Import results
  const [importResult, setImportResult] = useState<{
    batchId: string
  } | null>(null)

  // Batch details view
  const [viewBatchId, setViewBatchId] = useState<string | null>(null)

  // Error
  const [error, setError] = useState<string | null>(null)

  const handleFileSelected = useCallback(
    async (file: File) => {
      setIsUploading(true)
      setError(null)

      try {
        const text = await file.text()
        const result = await uploadCsv({
          fileName: file.name,
          csvContent: text,
        })

        if (result.error || !result.data) {
          setError(result.error ?? 'Upload failed')
          return
        }

        setBatchId(result.data.batchId)
        setCsvHeaders(result.data.headers)
        setPreview(result.data.preview)

        // Auto-detect column mapping
        const detected = autoDetectMapping(result.data.headers)
        setMapping(detected)

        setStep('mapping')
        await queryClient.invalidateQueries({ queryKey: ['importBatches'] })
      } catch (err) {
        Sentry.captureException(err)
        setError('Failed to upload file')
      } finally {
        setIsUploading(false)
      }
    },
    [queryClient],
  )

  const handleImport = useCallback(async () => {
    if (!batchId) return
    setIsProcessing(true)
    setError(null)

    try {
      const result = await processImportBatch({
        batchId,
        columnMapping: mapping,
      })

      if (result.error || !result.data) {
        setError(result.error ?? 'Import failed')
        return
      }

      setImportResult(result.data)
      setStep('results')
      await queryClient.invalidateQueries({ queryKey: ['importBatches'] })
    } catch (err) {
      Sentry.captureException(err)
      setError('Failed to process import')
    } finally {
      setIsProcessing(false)
    }
  }, [batchId, mapping, queryClient])

  const handleStartOver = useCallback(() => {
    setStep('upload')
    setBatchId(null)
    setCsvHeaders([])
    setPreview([])
    setMapping({})
    setImportResult(null)
    setError(null)
  }, [])

  const handleViewBatch = useCallback((id: string) => {
    setViewBatchId(id)
    setStep('batch-details')
  }, [])

  const handleBackFromBatch = useCallback(() => {
    setViewBatchId(null)
    setStep('upload')
  }, [])

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">📥 Imports</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Bring in flight records from other logbooks.
        </p>
      </div>

      <Tabs defaultValue="csv">
        <TabsList className="rounded-xl">
          <TabsTrigger value="csv" className="rounded-lg">CSV Import</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg">AI Import</TabsTrigger>
        </TabsList>

        <TabsContent value="csv">
          <div className="space-y-6">
            {error && (
              <div className="rounded-xl border border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 p-3 text-sm text-[var(--status-expired)]">
                {error}
              </div>
            )}

            {/* Step: Batch details view */}
            {step === 'batch-details' && viewBatchId && (
              <div className="card-elevated overflow-hidden">
                <div className="p-6 pb-4">
                  <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">Import Details</h3>
                </div>
                <div className="px-6 pb-6">
                  <BatchDetails
                    batchId={viewBatchId}
                    onBack={handleBackFromBatch}
                  />
                </div>
              </div>
            )}

            {/* Step: Upload */}
            {step === 'upload' && (
              <div className="card-elevated overflow-hidden">
                <div className="p-6 pb-4">
                  <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">Upload CSV</h3>
                </div>
                <div className="px-6 pb-6">
                  <CsvUploadZone
                    onFileSelected={handleFileSelected}
                    isLoading={isUploading}
                  />
                </div>
              </div>
            )}

            {/* Step: Column Mapping */}
            {step === 'mapping' && (
              <div className="card-elevated overflow-hidden">
                <div className="p-6 pb-4">
                  <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">Map Columns</h3>
                </div>
                <div className="space-y-6 px-6 pb-6">
                  <CsvPreviewTable headers={csvHeaders} rows={preview} />
                  <ColumnMappingStep
                    csvHeaders={csvHeaders}
                    preview={preview}
                    mapping={mapping}
                    onMappingChange={setMapping}
                    onImport={handleImport}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
            )}

            {/* Step: Results */}
            {step === 'results' && importResult && (
              <div className="card-elevated overflow-hidden">
                <div className="p-6 pb-4">
                  <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">Import Processing</h3>
                </div>
                <div className="space-y-4 px-6 pb-6">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Your import is being processed in the background. You can
                    track its progress in the import history below.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleStartOver}
                      className="text-sm text-[var(--accent-teal)] underline"
                    >
                      Import another file
                    </button>
                    <button
                      onClick={() => handleViewBatch(importResult.batchId)}
                      className="text-sm text-[var(--accent-teal)] underline"
                    >
                      View import details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Import History — always visible unless viewing batch details */}
            {step !== 'batch-details' && (
              <div className="card-elevated overflow-hidden">
                <div className="p-6 pb-4">
                  <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">Import History</h3>
                </div>
                <div className="px-6 pb-6">
                  <ImportHistory onViewBatch={handleViewBatch} />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <AiImportSection />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
