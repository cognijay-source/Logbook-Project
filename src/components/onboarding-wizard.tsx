'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Compass, ArrowLeft, ArrowRight, Plane, X } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  completeOnboarding,
  createOnboardingAircraft,
} from '@/app/(dashboard)/onboarding-actions'

const GOAL_OPTIONS = [
  {
    value: 'student',
    label: 'Student Pilot',
    description: 'Working toward Private Pilot certificate',
  },
  {
    value: 'private',
    label: 'Private Pilot',
    description: 'Working toward Instrument or just flying',
  },
  {
    value: 'instrument-commercial',
    label: 'Instrument / Commercial',
    description: 'Building time and ratings',
  },
  {
    value: 'career',
    label: 'Career Track',
    description: 'Heading to airlines',
  },
  {
    value: 'cfi',
    label: 'Flight Instructor',
    description: 'Teaching and building hours',
  },
  {
    value: 'logging',
    label: 'Just Logging Flights',
    description: 'No specific goal right now',
  },
] as const

const IMPORT_OPTIONS = [
  {
    value: 'csv',
    label: 'Yes, I have a CSV export',
    description: 'From ForeFlight, LogTen Pro, or other apps',
    redirect: '/imports',
  },
  {
    value: 'paper',
    label: 'Yes, I have a paper logbook',
    description: 'Use AI-assisted photo parsing',
    redirect: '/imports',
  },
  {
    value: 'fresh',
    label: "No, I'm starting fresh",
    description: 'Log your first flight right away',
    redirect: '/flights/new',
  },
] as const

const CATEGORIES = ['Airplane', 'Rotorcraft', 'Glider'] as const

const CLASSES: Record<string, string[]> = {
  Airplane: [
    'Single-Engine Land',
    'Multi-Engine Land',
    'Single-Engine Sea',
    'Multi-Engine Sea',
  ],
  Rotorcraft: ['Helicopter', 'Gyroplane'],
  Glider: ['Glider'],
}

type GoalValue = (typeof GOAL_OPTIONS)[number]['value']
type ImportValue = (typeof IMPORT_OPTIONS)[number]['value']

export function OnboardingWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Step 1 state
  const [selectedGoal, setSelectedGoal] = useState<GoalValue | null>(null)

  // Step 2 state
  const [selectedImport, setSelectedImport] = useState<ImportValue | null>(null)

  // Step 3 state
  const [tailNumber, setTailNumber] = useState('')
  const [makeModel, setMakeModel] = useState('')
  const [category, setCategory] = useState('')
  const [aircraftClass, setAircraftClass] = useState('')

  async function handleComplete(skipAircraft = false) {
    setSaving(true)
    try {
      if (!skipAircraft && tailNumber.trim()) {
        const acResult = await createOnboardingAircraft({
          tailNumber: tailNumber.trim().toUpperCase(),
          makeModel: makeModel.trim(),
          category,
          aircraftClass,
        })
        if (acResult.error) {
          toast({
            title: 'Warning',
            description: acResult.error,
            variant: 'destructive',
          })
        }
      }

      const goalCode =
        selectedGoal === 'student'
          ? 'private-pilot'
          : selectedGoal === 'private'
            ? 'instrument-rating'
            : selectedGoal === 'instrument-commercial'
              ? 'commercial'
              : selectedGoal === 'career'
                ? 'atp'
                : null

      const result = await completeOnboarding(goalCode)
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      const redirect =
        IMPORT_OPTIONS.find((o) => o.value === selectedImport)?.redirect ??
        '/dashboard'
      router.push(redirect)
      router.refresh()
    } catch (error) {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleSkipSetup() {
    setSaving(true)
    try {
      await completeOnboarding(null)
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      Sentry.captureException(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111118]">
      <div className="flex h-full w-full max-w-2xl flex-col px-6 py-8 sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:bg-white sm:shadow-2xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00d4aa] shadow-lg shadow-[#00d4aa]/20">
            <Compass className="h-6 w-6 text-[#111118]" />
          </div>
          <h1 className="text-center text-xl font-semibold text-white sm:text-[#111118]">
            Welcome to CrossCheck
          </h1>
          <p className="text-center text-sm text-white/60 sm:text-[#6b6b7b]">
            {step === 0 && "Let's set up your logbook."}
            {step === 1 && 'Do you have existing flights?'}
            {step === 2 && 'What do you fly most?'}
          </p>
        </div>

        {/* Progress dots */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                i === step
                  ? 'bg-[#00d4aa]'
                  : i < step
                    ? 'bg-[#00d4aa]/40'
                    : 'bg-white/20 sm:bg-[#e0e0e3]',
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {step === 0 && (
            <div className="grid gap-3">
              <p className="mb-2 text-sm font-medium text-white/80 sm:text-[#4a4a5a]">
                What are you working toward?
              </p>
              {GOAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedGoal(option.value)}
                  className={cn(
                    'flex flex-col gap-1 rounded-xl border-2 p-4 text-left transition-all',
                    selectedGoal === option.value
                      ? 'border-[#00d4aa] bg-[#00d4aa]/10'
                      : 'border-white/10 hover:border-white/20 sm:border-[#e0e0e3] sm:hover:border-[#c0c0c3]',
                  )}
                >
                  <span className="text-sm font-medium text-white sm:text-[#111118]">
                    {option.label}
                  </span>
                  <span className="text-xs text-white/50 sm:text-[#8a8a9a]">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3">
              {IMPORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedImport(option.value)}
                  className={cn(
                    'flex flex-col gap-1 rounded-xl border-2 p-4 text-left transition-all',
                    selectedImport === option.value
                      ? 'border-[#00d4aa] bg-[#00d4aa]/10'
                      : 'border-white/10 hover:border-white/20 sm:border-[#e0e0e3] sm:hover:border-[#c0c0c3]',
                  )}
                >
                  <span className="text-sm font-medium text-white sm:text-[#111118]">
                    {option.label}
                  </span>
                  <span className="text-xs text-white/50 sm:text-[#8a8a9a]">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white sm:text-[#111118]">
                  Tail Number
                </Label>
                <Input
                  value={tailNumber}
                  onChange={(e) => setTailNumber(e.target.value)}
                  placeholder="e.g. N12345"
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white sm:text-[#111118]">
                  Make / Model
                </Label>
                <Input
                  value={makeModel}
                  onChange={(e) => setMakeModel(e.target.value)}
                  placeholder="e.g. Cessna 172"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white sm:text-[#111118]">Category</Label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setAircraftClass('')
                  }}
                  className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {category && CLASSES[category] && (
                <div className="space-y-2">
                  <Label className="text-white sm:text-[#111118]">Class</Label>
                  <select
                    value={aircraftClass}
                    onChange={(e) => setAircraftClass(e.target.value)}
                    className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  >
                    <option value="">Select class</option>
                    {CLASSES[category].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleComplete(true)}
                disabled={saving}
                className="mt-2 text-sm text-white/50 underline hover:text-white/70 sm:text-[#8a8a9a] sm:hover:text-[#4a4a5a]"
              >
                Skip — I&apos;ll add aircraft later
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {step > 0 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                disabled={saving}
                className="text-white/60 hover:text-white sm:text-[#6b6b7b] sm:hover:text-[#111118]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <button
                type="button"
                onClick={handleSkipSetup}
                disabled={saving}
                className="text-sm text-white/40 hover:text-white/60 sm:text-[#8a8a9a] sm:hover:text-[#4a4a5a]"
              >
                Skip setup
              </button>
            )}
          </div>
          <div>
            {step < 2 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 0 && !selectedGoal) ||
                  (step === 1 && !selectedImport)
                }
                className="bg-[#00d4aa] text-[#111118] hover:bg-[#00b894]"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => handleComplete(false)}
                disabled={saving}
                className="bg-[#00d4aa] text-[#111118] hover:bg-[#00b894]"
              >
                {saving ? 'Setting up...' : "Let's go"}
                {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
