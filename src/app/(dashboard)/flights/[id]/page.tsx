'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import { motion } from 'framer-motion'

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
    <motion.div
      className="mx-auto max-w-3xl space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl">
            <Link href="/flights">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Edit Flight</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {flightQuery.data?.flightDate ?? 'Loading...'}
            </p>
          </div>
        </div>

        {isReady && (
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="rounded-xl">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Flight</DialogTitle>
                <DialogDescription>
                  This will permanently remove this flight and all associated
                  legs, approaches, and crew records.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-xl"
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
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      )}

      {isError && (
        <div className="card-elevated border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 p-6 text-center">
          <p className="text-sm text-[var(--status-expired)]">
            {flightQuery.error?.message === 'Flight not found'
              ? 'Flight not found.'
              : 'Could not load flight.'}
          </p>
          <div className="mt-3 flex justify-center gap-3">
            <Button variant="outline" size="sm" asChild className="rounded-xl">
              <Link href="/flights">Back to Flights</Link>
            </Button>
            {flightQuery.error?.message !== 'Flight not found' && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
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
    </motion.div>
  )
}
