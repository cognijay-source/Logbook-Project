'use client'

import { useState, useTransition } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Pencil, Trash2, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { AircraftForm } from './aircraft-form'
import {
  updateAircraft,
  deleteAircraft,
} from '@/app/(dashboard)/aircraft/actions'

type Aircraft = {
  id: string
  tailNumber: string
  manufacturer: string | null
  model: string | null
  year: string | null
  category: string | null
  aircraftClass: string | null
  engineType: string | null
  isComplex: boolean | null
  isHighPerformance: boolean | null
  isMultiEngine: boolean | null
  isTurbine: boolean | null
  isTailwheel: boolean | null
  isActive: boolean | null
  notes: string | null
}

type AircraftCardProps = {
  aircraft: Aircraft
  onMutate: () => void
}

const FLAGS: { key: keyof Aircraft; label: string }[] = [
  { key: 'isComplex', label: 'Complex' },
  { key: 'isHighPerformance', label: 'HP' },
  { key: 'isMultiEngine', label: 'Multi' },
  { key: 'isTurbine', label: 'Turbine' },
  { key: 'isTailwheel', label: 'Tailwheel' },
]

export function AircraftCard({ aircraft, onMutate }: AircraftCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, startDeleteTransition] = useTransition()

  const activeFlags = FLAGS.filter((f) => aircraft[f.key])

  const displayName = [aircraft.manufacturer, aircraft.model]
    .filter(Boolean)
    .join(' ')

  function handleEdit(formData: FormData) {
    return updateAircraft(aircraft.id, formData).then((result) => {
      if (!result.error) {
        setEditOpen(false)
        onMutate()
      }
      return result
    })
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      try {
        const result = await deleteAircraft(aircraft.id)
        if (!result.error) {
          setDeleteOpen(false)
          onMutate()
        }
      } catch (error) {
        Sentry.captureException(error)
      }
    })
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Plane className="text-muted-foreground h-5 w-5" />
            <CardTitle className="text-lg">{aircraft.tailNumber}</CardTitle>
          </div>
          {aircraft.isActive === false && (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
              Inactive
            </span>
          )}
        </div>
        {displayName && <CardDescription>{displayName}</CardDescription>}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {aircraft.year && <span>Year: {aircraft.year}</span>}
          {aircraft.engineType && (
            <span className="capitalize">{aircraft.engineType}</span>
          )}
          {aircraft.category && (
            <span className="capitalize">{aircraft.category}</span>
          )}
        </div>

        {activeFlags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeFlags.map((f) => (
              <span
                key={f.key}
                className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium"
              >
                {f.label}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 pt-3">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Aircraft</DialogTitle>
              <DialogDescription>
                Update details for {aircraft.tailNumber}.
              </DialogDescription>
            </DialogHeader>
            <AircraftForm
              initialData={aircraft}
              action={handleEdit}
              onSuccess={() => setEditOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Aircraft</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {aircraft.tailNumber}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
