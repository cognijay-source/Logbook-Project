'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CsvUploadZone } from '@/components/imports/csv-upload-zone'
import { CsvPreviewTable } from '@/components/imports/csv-preview-table'
import { ColumnMappingStep } from '@/components/imports/column-mapping'
import { ImportHistory } from '@/components/imports/import-history'
import { BatchDetails } from '@/components/imports/batch-details'
import { AiImportSection } from '@/components/imports/ai-import-section'
import { uploadCsv, processImportBatch } from './actions'
import { autoDetectMapping, type ColumnMapping } from '@/lib/validators/import'

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Imports</h1>
        <p className="text-muted-foreground mt-2">
          Bring in flight records from other logbooks.
        </p>
      </div>

      <Tabs defaultValue="csv">
        <TabsList>
          <TabsTrigger value="csv">CSV Import</TabsTrigger>
          <TabsTrigger value="ai">AI Import</TabsTrigger>
        </TabsList>

        <TabsContent value="csv">
          <div className="space-y-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Step: Batch details view */}
            {step === 'batch-details' && viewBatchId && (
              <Card>
                <CardHeader>
                  <CardTitle>Import Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <BatchDetails
                    batchId={viewBatchId}
                    onBack={handleBackFromBatch}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step: Upload */}
            {step === 'upload' && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload CSV</CardTitle>
                </CardHeader>
                <CardContent>
                  <CsvUploadZone
                    onFileSelected={handleFileSelected}
                    isLoading={isUploading}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step: Column Mapping */}
            {step === 'mapping' && (
              <Card>
                <CardHeader>
                  <CardTitle>Map Columns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CsvPreviewTable headers={csvHeaders} rows={preview} />
                  <ColumnMappingStep
                    csvHeaders={csvHeaders}
                    preview={preview}
                    mapping={mapping}
                    onMappingChange={setMapping}
                    onImport={handleImport}
                    isProcessing={isProcessing}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step: Results */}
            {step === 'results' && importResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Import Processing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Your import is being processed in the background. You can
                    track its progress in the import history below.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleStartOver}
                      className="text-primary text-sm underline"
                    >
                      Import another file
                    </button>
                    <button
                      onClick={() => handleViewBatch(importResult.batchId)}
                      className="text-primary text-sm underline"
                    >
                      View import details
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Import History — always visible unless viewing batch details */}
            {step !== 'batch-details' && (
              <Card>
                <CardHeader>
                  <CardTitle>Import History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImportHistory onViewBatch={handleViewBatch} />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <AiImportSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
