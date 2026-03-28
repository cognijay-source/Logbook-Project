'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Minus,
  Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Sentry from '@sentry/nextjs'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import type { AircraftOption } from '@/app/(dashboard)/flights/actions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormValues = any

interface FlightFormWizardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  aircraftList: AircraftOption[]
  saving: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (values: any, status: 'draft' | 'final') => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmitAndLogAnother?: (values: any) => Promise<void>
  isEdit: boolean
}

const OPERATION_TYPES = [
  'Part 91',
  'Part 135',
  'Part 121',
  'Training',
  'Personal',
]

const ROLE_TYPES = [
  'PIC',
  'SIC',
  'Dual Received',
  'CFI',
  'Safety Pilot',
  'Observer',
]

const STEP_LABELS = ['Flight', 'Time', 'Landings', 'Details', 'Review']

function Stepper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const num = parseInt(value) || 0
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(String(Math.max(0, num - 1)))}
        className="flex h-11 w-11 items-center justify-center rounded-lg border bg-white active:bg-gray-50"
      >
        <Minus className="h-4 w-4" />
      </button>
      <Input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-16 text-center text-lg"
        min="0"
      />
      <button
        type="button"
        onClick={() => onChange(String(num + 1))}
        className="flex h-11 w-11 items-center justify-center rounded-lg border bg-white active:bg-gray-50"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export function FlightFormWizard({
  form,
  aircraftList,
  saving,
  onSubmit,
  onSubmitAndLogAnother,
  isEdit,
}: FlightFormWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const approachesField = useFieldArray({
    control: form.control,
    name: 'approaches',
  })

  function goTo(nextStep: number) {
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
  }

  function next() {
    goTo(Math.min(step + 1, 4))
  }

  function prev() {
    goTo(Math.max(step - 1, 0))
  }

  const roleType = form.watch('roleType')

  return (
    <div className="flex min-h-[calc(100dvh-120px)] flex-col">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="mb-2 flex justify-between px-1">
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                'text-xs font-medium transition-colors',
                i === step
                  ? 'text-[#00916e]'
                  : i < step
                    ? 'text-[#00d4aa]'
                    : 'text-muted-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i <= step ? 'bg-[#00d4aa]' : 'bg-gray-200',
              )}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <StepFlightDetails form={form} aircraftList={aircraftList} />
            )}
            {step === 1 && <StepTime form={form} roleType={roleType} />}
            {step === 2 && (
              <StepLandings
                form={form}
                approachesField={approachesField}
              />
            )}
            {step === 3 && <StepDetails form={form} />}
            {step === 4 && (
              <StepReview
                form={form}
                aircraftList={aircraftList}
                onEditStep={goTo}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="border-t bg-white pt-4">
        {step < 4 ? (
          <div className="flex gap-3">
            {step > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={prev}
                className="flex-none"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={next}
              className="flex-1 bg-[#00d4aa] text-[#111118] hover:bg-[#00b894]"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              disabled={saving}
              onClick={form.handleSubmit((v) => onSubmit(v, 'final'))}
              className="h-12 w-full bg-[#00d4aa] text-base font-semibold text-[#111118] hover:bg-[#00b894]"
            >
              {saving ? 'Saving...' : 'Finalize Entry'}
            </Button>
            {onSubmitAndLogAnother && (
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={form.handleSubmit((v) => onSubmitAndLogAnother(v))}
                className="h-12 w-full border-[#00d4aa] text-base text-[#00916e]"
              >
                Finalize & Log Another
              </Button>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={form.handleSubmit((v) => onSubmit(v, 'draft'))}
              className="text-sm text-muted-foreground"
            >
              Save Draft
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- Step 1: Flight Details ----------

function StepFlightDetails({
  form,
  aircraftList,
}: {
  form: UseFormReturn<FormValues>
  aircraftList: AircraftOption[]
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="flightDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date *</FormLabel>
            <FormControl>
              <Input type="date" {...field} className="h-12 text-base" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="aircraftId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Aircraft</FormLabel>
            <FormControl>
              <select
                className="border-input bg-background h-12 w-full rounded-md border px-3 text-base"
                {...field}
              >
                <option value="">Select aircraft</option>
                {aircraftList.map((ac) => (
                  <option key={ac.id} value={ac.id}>
                    {ac.tailNumber}
                    {ac.model ? ` - ${ac.model}` : ''}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="departureAirport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departure</FormLabel>
              <FormControl>
                <Input
                  placeholder="ICAO"
                  {...field}
                  className="h-12 text-base uppercase"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="arrivalAirport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Arrival</FormLabel>
              <FormControl>
                <Input
                  placeholder="ICAO"
                  {...field}
                  className="h-12 text-base uppercase"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="route"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Route (optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. KORD V7 JOT"
                {...field}
                className="h-12 text-base uppercase"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// ---------- Step 2: Time ----------

function StepTime({
  form,
  roleType,
}: {
  form: UseFormReturn<FormValues>
  roleType: string
}) {
  const primaryField =
    roleType === 'SIC'
      ? 'sic'
      : roleType === 'Dual Received'
        ? 'dualReceived'
        : roleType === 'CFI'
          ? 'dualGiven'
          : 'pic'

  const primaryLabel =
    roleType === 'SIC'
      ? 'SIC'
      : roleType === 'Dual Received'
        ? 'Dual Received'
        : roleType === 'CFI'
          ? 'Dual Given'
          : 'PIC'

  const secondaryFields = [
    ['night', 'Night'],
    ['crossCountry', 'Cross-Country'],
    ['actualInstrument', 'Actual Inst.'],
    ['simulatedInstrument', 'Sim. Inst.'],
    ['multiEngine', 'Multi-Engine'],
    ['solo', 'Solo'],
  ] as const

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="totalTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Time</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                placeholder="0.0"
                {...field}
                className="h-14 text-center text-2xl font-semibold"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={primaryField}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{primaryLabel}</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                placeholder="0.0"
                {...field}
                value={field.value as string}
                className="h-12 text-center text-lg"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        {secondaryFields.map(([name, label]) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    {...field}
                    className="h-12"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ---------- Step 3: Landings & Approaches ----------

function StepLandings({
  form,
  approachesField,
}: {
  form: UseFormReturn<FormValues>
  approachesField: ReturnType<typeof useFieldArray<FormValues, 'approaches'>>
}) {
  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="dayLandings"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Day Landings</FormLabel>
            <Stepper value={field.value} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nightLandings"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Night Landings</FormLabel>
            <Stepper value={field.value} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="holds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Holds</FormLabel>
            <Stepper value={field.value} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <Label className="text-sm font-medium">Approaches</Label>
          <span className="text-xs text-muted-foreground">
            {approachesField.fields.length} logged
          </span>
        </div>
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Count: {approachesField.fields.length}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            approachesField.append({
              approachType: 'ILS',
              runway: '',
              airport: '',
              isCircleToLand: false,
              remarks: '',
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Approach
        </Button>
        {approachesField.fields.map((field, index) => (
          <div
            key={field.id}
            className="mt-2 flex items-center gap-2 rounded-lg border p-2"
          >
            <FormField
              control={form.control}
              name={`approaches.${index}.approachType`}
              render={({ field }) => (
                <FormControl>
                  <select
                    className="border-input bg-background h-10 flex-1 rounded-md border px-2 text-sm"
                    {...field}
                  >
                    <option value="ILS">ILS</option>
                    <option value="LOC">LOC</option>
                    <option value="VOR">VOR</option>
                    <option value="RNAV/GPS">RNAV/GPS</option>
                    <option value="LPV">LPV</option>
                    <option value="Visual">Visual</option>
                  </select>
                </FormControl>
              )}
            />
            <FormField
              control={form.control}
              name={`approaches.${index}.airport`}
              render={({ field }) => (
                <FormControl>
                  <Input
                    placeholder="APT"
                    {...field}
                    value={field.value ?? ''}
                    className="h-10 w-20 uppercase"
                  />
                </FormControl>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => approachesField.remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- Step 4: Details ----------

function StepDetails({ form }: { form: UseFormReturn<FormValues> }) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="operationType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Operation Type</FormLabel>
            <FormControl>
              <select
                className="border-input bg-background h-12 w-full rounded-md border px-3 text-base"
                {...field}
              >
                <option value="">Select...</option>
                {OPERATION_TYPES.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="roleType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <FormControl>
              <select
                className="border-input bg-background h-12 w-full rounded-md border px-3 text-base"
                {...field}
              >
                <option value="">Select...</option>
                {ROLE_TYPES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="remarks"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Remarks</FormLabel>
            <FormControl>
              <textarea
                className="border-input bg-background min-h-[100px] w-full rounded-md border px-3 py-2 text-base"
                placeholder="Remarks, endorsements, notes..."
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <Input
                placeholder="checkride, ifr, night"
                {...field}
                className="h-12 text-base"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <div className="flex flex-wrap gap-6">
        <FormField
          control={form.control}
          name="isSoloFlight"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-5 w-5 rounded border"
                />
              </FormControl>
              <FormLabel className="font-normal">Solo Flight</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isCheckride"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-5 w-5 rounded border"
                />
              </FormControl>
              <FormLabel className="font-normal">Checkride</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

// ---------- Step 5: Review ----------

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value || value === '0' || value === '0.0') return null
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function StepReview({
  form,
  aircraftList,
  onEditStep,
}: {
  form: UseFormReturn<FormValues>
  aircraftList: AircraftOption[]
  onEditStep: (step: number) => void
}) {
  const values = form.getValues()
  const aircraft = aircraftList.find((a) => a.id === values.aircraftId)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Flight</h3>
          <button
            type="button"
            onClick={() => onEditStep(0)}
            className="text-xs text-[#00916e]"
          >
            Edit
          </button>
        </div>
        <ReviewRow label="Date" value={values.flightDate} />
        <ReviewRow
          label="Aircraft"
          value={
            aircraft
              ? `${aircraft.tailNumber}${aircraft.model ? ` (${aircraft.model})` : ''}`
              : ''
          }
        />
        <ReviewRow label="Departure" value={values.departureAirport} />
        <ReviewRow label="Arrival" value={values.arrivalAirport} />
        <ReviewRow label="Route" value={values.route} />
      </div>

      <div className="rounded-xl border p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Time</h3>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-xs text-[#00916e]"
          >
            Edit
          </button>
        </div>
        <ReviewRow label="Total Time" value={values.totalTime} />
        <ReviewRow label="PIC" value={values.pic} />
        <ReviewRow label="SIC" value={values.sic} />
        <ReviewRow label="Dual Received" value={values.dualReceived} />
        <ReviewRow label="Dual Given" value={values.dualGiven} />
        <ReviewRow label="Night" value={values.night} />
        <ReviewRow label="Cross-Country" value={values.crossCountry} />
        <ReviewRow label="Actual Inst." value={values.actualInstrument} />
        <ReviewRow label="Sim. Inst." value={values.simulatedInstrument} />
        <ReviewRow label="Multi-Engine" value={values.multiEngine} />
        <ReviewRow label="Solo" value={values.solo} />
      </div>

      <div className="rounded-xl border p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Landings</h3>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-xs text-[#00916e]"
          >
            Edit
          </button>
        </div>
        <ReviewRow label="Day Landings" value={values.dayLandings} />
        <ReviewRow label="Night Landings" value={values.nightLandings} />
        <ReviewRow label="Holds" value={values.holds} />
        <ReviewRow
          label="Approaches"
          value={
            values.approaches.length > 0
              ? String(values.approaches.length)
              : ''
          }
        />
      </div>

      {(values.operationType ||
        values.roleType ||
        values.remarks ||
        values.tags) && (
        <div className="rounded-xl border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Details</h3>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-xs text-[#00916e]"
            >
              Edit
            </button>
          </div>
          <ReviewRow label="Operation" value={values.operationType} />
          <ReviewRow label="Role" value={values.roleType} />
          <ReviewRow label="Remarks" value={values.remarks} />
          <ReviewRow label="Tags" value={values.tags} />
        </div>
      )}
    </div>
  )
}
