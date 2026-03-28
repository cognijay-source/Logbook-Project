'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PhotoUploadZone } from './photo-upload-zone'
import { AiReviewTable } from './ai-review-table'
import {
  parseLogbookImages,
  confirmAiImport,
} from '@/app/(dashboard)/imports/actions'
import { type AiParsedFlight } from '@/lib/validators/import'

type AiStep = 'upload' | 'review' | 'results'

export function AiImportSection() {
  const queryClient = useQueryClient()

  const [step, setStep] = useState<AiStep>('upload')
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [batchId, setBatchId] = useState<string | null>(null)
  const [flights, setFlights] = useState<AiParsedFlight[]>([])
  const [importResult, setImportResult] = useState<{
    imported: number
    needsReview: number
    batchId: string
  } | null>(null)

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      setIsParsing(true)
      setError(null)

      try {
        const formData = new FormData()
        for (const file of files) {
          formData.append('images', file)
        }

        const result = await parseLogbookImages(formData)

        if (result.error || !result.data) {
          setError(result.error ?? 'Failed to parse images')
          return
        }

        setBatchId(result.data.batchId)
        setFlights(result.data.flights)
        setStep('review')
        await queryClient.invalidateQueries({ queryKey: ['importBatches'] })
      } catch (err) {
        Sentry.captureException(err)
        setError('Failed to parse logbook images')
      } finally {
        setIsParsing(false)
      }
    },
    [queryClient],
  )

  const handleConfirmImport = useCallback(async () => {
    if (!batchId || flights.length === 0) return
    setIsImporting(true)
    setError(null)

    try {
      const result = await confirmAiImport({ batchId, flights })

      if (result.error || !result.data) {
        setError(result.error ?? 'Failed to import flights')
        return
      }

      setImportResult(result.data)
      setStep('results')
      await queryClient.invalidateQueries({ queryKey: ['importBatches'] })
    } catch (err) {
      Sentry.captureException(err)
      setError('Failed to import flights')
    } finally {
      setIsImporting(false)
    }
  }, [batchId, flights, queryClient])

  const handleStartOver = useCallback(() => {
    setStep('upload')
    setBatchId(null)
    setFlights([])
    setImportResult(null)
    setError(null)
  }, [])

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* AI accuracy warning */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <span className="mt-0.5 shrink-0">&#9888;&#65039;</span>
        <p>
          AI-extracted flight data may contain errors. Handwriting recognition is
          not perfect — numbers, letters, and decimal points may be misread. You
          must carefully review and verify every field against your original
          logbook before confirming this import.
        </p>
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Import from Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUploadZone
              onFilesSelected={handleFilesSelected}
              isLoading={isParsing}
            />
          </CardContent>
        </Card>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Review Extracted Flights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AiReviewTable flights={flights} onFlightsChange={setFlights} />
            <div className="flex gap-3">
              <Button
                onClick={handleConfirmImport}
                disabled={isImporting || flights.length === 0}
              >
                {isImporting ? 'Importing...' : 'Confirm and Import'}
              </Button>
              <Button
                variant="outline"
                onClick={handleStartOver}
                disabled={isImporting}
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Results */}
      {step === 'results' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Import Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">{importResult.imported}</span>{' '}
                flight
                {importResult.imported !== 1 ? 's' : ''} imported
                {importResult.needsReview > 0 && (
                  <>
                    ,{' '}
                    <span className="font-medium text-yellow-600">
                      {importResult.needsReview}
                    </span>{' '}
                    need{importResult.needsReview !== 1 ? '' : 's'} manual
                    review
                  </>
                )}
              </p>
              <p className="text-muted-foreground text-xs">
                Imported flights are saved as drafts. Review them in your
                flights list.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleStartOver}>
                Import more photos
              </Button>
              <a
                href="/flights"
                className="text-primary text-sm leading-9 underline"
              >
                View flights
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
