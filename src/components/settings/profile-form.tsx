'use client'

import { useRef, useState, useTransition } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  CERTIFICATE_LEVELS,
  MEDICAL_CLASSES,
  CAREER_PHASES,
} from '@/lib/validators/settings'

type ProfileData = {
  displayName?: string | null
  email?: string | null
}

type PilotProfileData = {
  certificateLevel?: string | null
  certificateNumber?: string | null
  medicalClass?: string | null
  medicalExpiry?: Date | null
  homeAirport?: string | null
  careerPhase?: string | null
}

type ProfileFormProps = {
  profile: ProfileData
  pilotProfile: PilotProfileData | null
  action: (formData: FormData) => Promise<{ data: unknown; error: unknown }>
}

const selectClass =
  'border-input bg-background ring-offset-background focus:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus:ring-1 focus:outline-none'

function formatDate(date: Date | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function ProfileForm({
  profile,
  pilotProfile,
  action,
}: ProfileFormProps) {
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
            title: 'Profile updated',
            description: 'Your changes have been saved.',
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
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your personal and pilot information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {errors._form && (
            <p className="text-destructive text-sm">{errors._form[0]}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={profile.displayName ?? ''}
              placeholder="Your name"
            />
            {errors.displayName && (
              <p className="text-destructive text-sm">
                {errors.displayName[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email ?? ''}
              disabled
              className="bg-muted"
            />
            <p className="text-muted-foreground text-xs">
              Email is managed through your authentication provider.
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-medium">Pilot Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="certificateLevel">Certificate Level</Label>
                <select
                  id="certificateLevel"
                  name="certificateLevel"
                  defaultValue={pilotProfile?.certificateLevel ?? ''}
                  className={selectClass}
                >
                  <option value="">Select level</option>
                  {CERTIFICATE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.certificateLevel && (
                  <p className="text-destructive text-sm">
                    {errors.certificateLevel[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input
                  id="certificateNumber"
                  name="certificateNumber"
                  defaultValue={pilotProfile?.certificateNumber ?? ''}
                  placeholder="1234567"
                />
                {errors.certificateNumber && (
                  <p className="text-destructive text-sm">
                    {errors.certificateNumber[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalClass">Medical Class</Label>
                <select
                  id="medicalClass"
                  name="medicalClass"
                  defaultValue={pilotProfile?.medicalClass ?? ''}
                  className={selectClass}
                >
                  <option value="">Select class</option>
                  {MEDICAL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                {errors.medicalClass && (
                  <p className="text-destructive text-sm">
                    {errors.medicalClass[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalExpiry">Medical Expiry Date</Label>
                <Input
                  id="medicalExpiry"
                  name="medicalExpiry"
                  type="date"
                  defaultValue={formatDate(pilotProfile?.medicalExpiry)}
                />
                {errors.medicalExpiry && (
                  <p className="text-destructive text-sm">
                    {errors.medicalExpiry[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeAirport">Home Airport</Label>
                <Input
                  id="homeAirport"
                  name="homeAirport"
                  defaultValue={pilotProfile?.homeAirport ?? ''}
                  placeholder="KJFK"
                  maxLength={4}
                  className="uppercase"
                />
                {errors.homeAirport && (
                  <p className="text-destructive text-sm">
                    {errors.homeAirport[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="careerPhase">Career Phase</Label>
                <select
                  id="careerPhase"
                  name="careerPhase"
                  defaultValue={pilotProfile?.careerPhase ?? ''}
                  className={selectClass}
                >
                  <option value="">Select phase</option>
                  {CAREER_PHASES.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </select>
                {errors.careerPhase && (
                  <p className="text-destructive text-sm">
                    {errors.careerPhase[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
