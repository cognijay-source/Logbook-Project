'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Star, Plane } from 'lucide-react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FlightForm } from '@/components/flights/flight-form'
import { PageTransition } from '@/components/page-transition'
import { getAircraftList } from '../actions'
import {
  getTemplates,
  type FlightTemplate,
} from '../template-actions'
import { cn } from '@/lib/utils'

export default function NewFlightPage() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<FlightTemplate | null>(null)

  const aircraftQuery = useQuery({
    queryKey: ['aircraft-list'],
    queryFn: async () => {
      const result = await getAircraftList()
      if (result.error) {
        const err = new Error(result.error)
        Sentry.captureException(err)
        throw err
      }
      return result.data
    },
  })

  const templatesQuery = useQuery({
    queryKey: ['flight-templates'],
    queryFn: async () => {
      const result = await getTemplates()
      if (result.error) {
        Sentry.captureException(new Error(result.error))
      }
      return result.data
    },
  })

  const templates = templatesQuery.data ?? []

  function applyTemplate(template: FlightTemplate) {
    setSelectedTemplate(template)
  }

  return (
    <PageTransition>
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/flights">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-3xl font-bold">New Flight</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Record a new entry
          </p>
        </div>
      </div>

      {/* Templates bar */}
      {templates.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                selectedTemplate?.id === t.id
                  ? 'border-[#00d4aa] bg-[#00d4aa]/10 text-[#00916e]'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              {t.isFavorite && <Star className="h-3 w-3 fill-current" />}
              <Plane className="h-3 w-3" />
              {t.name}
            </button>
          ))}
        </div>
      )}

      {aircraftQuery.isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      )}

      {aircraftQuery.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">
            Could not load aircraft list.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => aircraftQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {aircraftQuery.isSuccess && (
        <FlightForm
          aircraftList={aircraftQuery.data}
          template={selectedTemplate}
        />
      )}
    </div>
    </PageTransition>
  )
}
