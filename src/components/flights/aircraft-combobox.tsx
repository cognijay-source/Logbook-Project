'use client'

import { useCallback, useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { quickCreateAircraft } from '@/app/(dashboard)/flights/actions'

export interface AircraftOption {
  id: string
  tailNumber: string
  model: string | null
}

interface AircraftComboboxProps {
  value: string
  onChange: (value: string) => void
  aircraftList: AircraftOption[]
  onAircraftCreated?: (aircraft: AircraftOption) => void
}

export function AircraftCombobox({
  value,
  onChange,
  aircraftList,
  onAircraftCreated,
}: AircraftComboboxProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleSearch = useCallback(
    (query: string): ComboboxOption[] => {
      if (!query) {
        return aircraftList.map((ac) => ({
          value: ac.id,
          label: ac.tailNumber,
          sublabel: ac.model ?? undefined,
        }))
      }
      const q = query.toUpperCase()
      return aircraftList
        .filter(
          (ac) =>
            ac.tailNumber.toUpperCase().includes(q) ||
            (ac.model && ac.model.toUpperCase().includes(q)),
        )
        .map((ac) => ({
          value: ac.id,
          label: ac.tailNumber,
          sublabel: ac.model ?? undefined,
        }))
    },
    [aircraftList],
  )

  // Find display label for current value
  const selected = aircraftList.find((ac) => ac.id === value)
  const displayValue = selected
    ? `${selected.tailNumber}${selected.model ? ` - ${selected.model}` : ''}`
    : ''

  function handleQuickCreate(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await quickCreateAircraft(formData)
        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
          return
        }
        if (result.data) {
          onChange(result.data.id)
          onAircraftCreated?.(result.data)
          toast({ title: 'Aircraft added' })
        }
        setDialogOpen(false)
      } catch (error) {
        Sentry.captureException(error)
        toast({
          title: 'Error',
          description: 'Could not create aircraft.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <>
      <Combobox
        value={displayValue}
        onChange={(val) => {
          // If val matches an aircraft id, use it; otherwise it's free text
          const match = aircraftList.find((ac) => ac.id === val)
          if (match) {
            onChange(match.id)
          }
        }}
        onSearch={handleSearch}
        placeholder="Search aircraft..."
        allowFreeText={false}
        footerAction={
          <button
            type="button"
            className="flex w-full items-center gap-2 text-sm text-[#10B981] hover:text-[#059669]"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add new aircraft
          </button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add Aircraft</DialogTitle>
          </DialogHeader>
          <form action={handleQuickCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qa-tail">Tail Number *</Label>
              <Input
                id="qa-tail"
                name="tailNumber"
                required
                placeholder="N12345"
                className="uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="qa-manufacturer">Manufacturer</Label>
                <Input
                  id="qa-manufacturer"
                  name="manufacturer"
                  placeholder="Cessna"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qa-model">Model</Label>
                <Input id="qa-model" name="model" placeholder="172S" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Adding...' : 'Add Aircraft'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
