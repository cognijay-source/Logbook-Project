'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FlightForm } from '@/components/flights/flight-form'
import { useToast } from '@/hooks/use-toast'
import { getFlight, getAircraftList, deleteFlight } from '../actions'

export default function FlightDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const flightQuery = useQuery({
    queryKey: ['flight', params.id],
    queryFn: async () => {
      const result = await getFlight(params.id)
      if (result.error) {
        const err = new Error(result.error)
        Sentry.captureException(err)
        throw err
      }
      if (!result.data) {
        throw new Error('Flight not found')
      }
      return result.data
    },
  })

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

  async function handleDelete() {
    setDeleting(true)
    try {
      const result = await deleteFlight(params.id)
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }
      toast({ title: 'Flight deleted' })
      await queryClient.invalidateQueries({ queryKey: ['flights'] })
      router.push('/flights')
      router.refresh()
    } catch (error) {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Failed to delete flight',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const isLoading = flightQuery.isLoading || aircraftQuery.isLoading
  const isError = flightQuery.isError || aircraftQuery.isError
  const isReady = flightQuery.isSuccess && aircraftQuery.isSuccess

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/flights">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Flight</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {flightQuery.data?.flightDate ?? 'Loading...'}
            </p>
          </div>
        </div>

        {isReady && (
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Flight</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this flight? This action
                  cannot be undone. All associated legs, approaches, and crew
                  records will also be removed.
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
                  {deleting ? 'Deleting...' : 'Delete Flight'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">
            {flightQuery.error?.message === 'Flight not found'
              ? 'Flight not found. It may have been deleted.'
              : 'Failed to load flight. Please try again.'}
          </p>
          <div className="mt-3 flex justify-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/flights">Back to Flights</Link>
            </Button>
            {flightQuery.error?.message !== 'Flight not found' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  flightQuery.refetch()
                  aircraftQuery.refetch()
                }}
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      {isReady && flightQuery.data && aircraftQuery.data && (
        <FlightForm
          initialData={flightQuery.data}
          aircraftList={aircraftQuery.data}
        />
      )}
    </div>
  )
}
