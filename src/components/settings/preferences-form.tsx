'use client'

import { useRef, useState, useTransition } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

type PreferencesFormProps = {
  timeFormat: string
  timezone: string
  action: (formData: FormData) => Promise<{ data: unknown; error: unknown }>
}

const selectClass =
  'border-input bg-background ring-offset-background focus:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus:ring-1 focus:outline-none'

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Phoenix',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Australia/Perth',
  'Pacific/Auckland',
]

export function PreferencesForm({
  timeFormat,
  timezone,
  action,
}: PreferencesFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const { toast } = useToast()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
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
          toast({
            title: 'Preferences updated',
            description: 'Your preferences have been saved.',
          })
        }
      } catch (error) {
        Sentry.captureException(error)
        setErrors({ _form: ['Something went wrong. Try again.'] })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize how times and dates are displayed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {errors._form && (
            <p className="text-destructive text-sm">{errors._form[0]}</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <select
                id="timeFormat"
                name="timeFormat"
                defaultValue={timeFormat}
                className={selectClass}
              >
                <option value="decimal">Decimal (1.5)</option>
                <option value="hhmm">HH:MM (1:30)</option>
              </select>
              {errors.timeFormat && (
                <p className="text-destructive text-sm">
                  {errors.timeFormat[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                name="timezone"
                defaultValue={timezone}
                className={selectClass}
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              {errors.timezone && (
                <p className="text-destructive text-sm">
                  {errors.timezone[0]}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
