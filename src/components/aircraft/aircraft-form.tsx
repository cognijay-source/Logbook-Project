'use client'

import { useRef, useState, useTransition } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AircraftData = {
  id?: string
  tailNumber?: string | null
  manufacturer?: string | null
  model?: string | null
  year?: string | null
  category?: string | null
  aircraftClass?: string | null
  engineType?: string | null
  isComplex?: boolean | null
  isHighPerformance?: boolean | null
  isMultiEngine?: boolean | null
  isTurbine?: boolean | null
  isTailwheel?: boolean | null
  isActive?: boolean | null
  notes?: string | null
}

type AircraftFormProps = {
  initialData?: AircraftData
  action: (formData: FormData) => Promise<{ error: unknown }>
  onSuccess?: () => void
}

const CATEGORIES = [
  { value: '', label: 'Select category' },
  { value: 'airplane', label: 'Airplane' },
  { value: 'rotorcraft', label: 'Rotorcraft' },
  { value: 'glider', label: 'Glider' },
  { value: 'lighter-than-air', label: 'Lighter-than-air' },
]

const CLASSES = [
  { value: '', label: 'Select class' },
  { value: 'single-engine land', label: 'Single-engine land' },
  { value: 'multi-engine land', label: 'Multi-engine land' },
  { value: 'single-engine sea', label: 'Single-engine sea' },
  { value: 'multi-engine sea', label: 'Multi-engine sea' },
]

const ENGINE_TYPES = [
  { value: '', label: 'Select engine type' },
  { value: 'piston', label: 'Piston' },
  { value: 'turboprop', label: 'Turboprop' },
  { value: 'jet', label: 'Jet' },
  { value: 'electric', label: 'Electric' },
]

export function AircraftForm({
  initialData,
  action,
  onSuccess,
}: AircraftFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Client-side required field check
    const tailNumber = formData.get('tailNumber') as string
    if (!tailNumber?.trim()) {
      setErrors({ tailNumber: ['Tail number is required'] })
      return
    }

    setErrors({})

    startTransition(async () => {
      try {
        const result = await action(formData)
        if (result.error) {
          if (typeof result.error === 'object' && result.error !== null) {
            setErrors(result.error as Record<string, string[]>)
          } else {
            setErrors({ _form: [String(result.error)] })
          }
        } else {
          formRef.current?.reset()
          onSuccess?.()
        }
      } catch (error) {
        Sentry.captureException(error)
        setErrors({ _form: ['An unexpected error occurred'] })
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {errors._form && (
        <p className="text-destructive text-sm">{errors._form[0]}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="tailNumber">Tail Number *</Label>
        <Input
          id="tailNumber"
          name="tailNumber"
          defaultValue={initialData?.tailNumber ?? ''}
          placeholder="N12345"
          required
        />
        {errors.tailNumber && (
          <p className="text-destructive text-sm">{errors.tailNumber[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            id="manufacturer"
            name="manufacturer"
            defaultValue={initialData?.manufacturer ?? ''}
            placeholder="Cessna"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            name="model"
            defaultValue={initialData?.model ?? ''}
            placeholder="172S"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            min={1900}
            max={2100}
            defaultValue={initialData?.year ?? ''}
            placeholder="2020"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={initialData?.category ?? ''}
            className="border-input bg-background ring-offset-background focus:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus:ring-1 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="aircraftClass">Class</Label>
          <select
            id="aircraftClass"
            name="aircraftClass"
            defaultValue={initialData?.aircraftClass ?? ''}
            className="border-input bg-background ring-offset-background focus:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus:ring-1 focus:outline-none"
          >
            {CLASSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="engineType">Engine Type</Label>
          <select
            id="engineType"
            name="engineType"
            defaultValue={initialData?.engineType ?? ''}
            className="border-input bg-background ring-offset-background focus:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus:ring-1 focus:outline-none"
          >
            {ENGINE_TYPES.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Aircraft Flags</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isComplex"
              defaultChecked={initialData?.isComplex ?? false}
              className="rounded"
            />
            Complex
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isHighPerformance"
              defaultChecked={initialData?.isHighPerformance ?? false}
              className="rounded"
            />
            High Performance
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isMultiEngine"
              defaultChecked={initialData?.isMultiEngine ?? false}
              className="rounded"
            />
            Multi-Engine
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isTurbine"
              defaultChecked={initialData?.isTurbine ?? false}
              className="rounded"
            />
            Turbine
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isTailwheel"
              defaultChecked={initialData?.isTailwheel ?? false}
              className="rounded"
            />
            Tailwheel
          </label>
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initialData?.notes ?? ''}
          placeholder="Optional notes about this aircraft..."
          className="border-input bg-background ring-offset-background focus:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending
          ? 'Saving...'
          : initialData?.id
            ? 'Update Aircraft'
            : 'Add Aircraft'}
      </Button>
    </form>
  )
}
