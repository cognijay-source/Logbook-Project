'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PlusCircle, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AircraftCard } from '@/components/aircraft/aircraft-card'
import { AircraftForm } from '@/components/aircraft/aircraft-form'
import { createAircraft } from './actions'

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

type AircraftListClientProps = {
  aircraft: Aircraft[]
}

export function AircraftListClient({ aircraft }: AircraftListClientProps) {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['aircraft'] })
  }

  async function handleCreate(formData: FormData) {
    const result = await createAircraft(formData)
    if (!result.error) {
      setCreateOpen(false)
      refresh()
    }
    return result
  }

  if (aircraft.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
        <Plane className="text-muted-foreground mb-4 h-12 w-12" />
        <h2 className="text-lg font-semibold">No aircraft yet</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Add an aircraft to begin logging against it.
        </p>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Aircraft
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Aircraft</DialogTitle>
              <DialogDescription>New aircraft details.</DialogDescription>
            </DialogHeader>
            <AircraftForm
              action={handleCreate}
              onSuccess={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Aircraft
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Aircraft</DialogTitle>
              <DialogDescription>New aircraft details.</DialogDescription>
            </DialogHeader>
            <AircraftForm
              action={handleCreate}
              onSuccess={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {aircraft.map((a) => (
          <AircraftCard key={a.id} aircraft={a} onMutate={refresh} />
        ))}
      </div>
    </>
  )
}
