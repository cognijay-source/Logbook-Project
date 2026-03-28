'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useMediaQuery } from '@/hooks/use-media-query'
import { FlightFormWizard } from '@/components/flights/flight-form-wizard'
import {
  createFlight,
  updateFlight,
  type FlightDetail,
  type AircraftOption,
} from '@/app/(dashboard)/flights/actions'
import {
  createTemplate,
  type FlightTemplate,
} from '@/app/(dashboard)/flights/template-actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  checkFlightWarnings,
  checkAirportCode,
  type FlightWarning,
  type AirportHint,
} from '@/lib/utils/flight-warnings'

// ---------- Form schema ----------

const formLegSchema = z.object({
  legOrder: z.coerce.number().int().min(1),
  departureAirport: z.string().optional(),
  arrivalAirport: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  totalTime: z.string().optional(),
  remarks: z.string().optional(),
})

const formApproachSchema = z.object({
  approachType: z.string().min(1, 'Approach type is required'),
  runway: z.string().optional(),
  airport: z.string().optional(),
  isCircleToLand: z.boolean(),
  remarks: z.string().optional(),
})

const formCrewSchema = z.object({
  crewRole: z.string().min(1, 'Crew role is required'),
  name: z.string().min(1, 'Name is required'),
  certificateNumber: z.string().optional(),
  remarks: z.string().optional(),
})

const formSchema = z.object({
  flightDate: z.string().min(1, 'Flight date is required'),
  aircraftId: z.string().optional(),
  departureAirport: z.string().optional(),
  arrivalAirport: z.string().optional(),
  route: z.string().optional(),

  totalTime: z.string().optional(),
  pic: z.string().optional(),
  sic: z.string().optional(),
  crossCountry: z.string().optional(),
  night: z.string().optional(),
  actualInstrument: z.string().optional(),
  simulatedInstrument: z.string().optional(),
  dualReceived: z.string().optional(),
  dualGiven: z.string().optional(),
  solo: z.string().optional(),
  multiEngine: z.string().optional(),
  turbine: z.string().optional(),

  dayLandings: z.string().optional(),
  nightLandings: z.string().optional(),
  holds: z.string().optional(),

  operationType: z.string().optional(),
  roleType: z.string().optional(),
  remarks: z.string().optional(),
  tags: z.string().optional(),
  isSoloFlight: z.boolean(),
  isCheckride: z.boolean(),
  status: z.enum(['draft', 'final']),

  legs: z.array(formLegSchema),
  approaches: z.array(formApproachSchema),
  crew: z.array(formCrewSchema),
})

type FormValues = z.infer<typeof formSchema>

// ---------- Props ----------

interface FlightFormProps {
  initialData?: FlightDetail
  aircraftList: AircraftOption[]
  template?: FlightTemplate | null
}

// ---------- Helpers ----------

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

const APPROACH_TYPES = [
  'ILS',
  'LOC',
  'VOR',
  'RNAV/GPS',
  'LPV',
  'LNAV',
  'LNAV/VNAV',
  'Visual',
  'NDB',
  'SDF',
  'LDA',
  'PAR',
  'ASR',
  'Contact',
  'Circling',
]

const CREW_ROLES = [
  'PIC',
  'SIC',
  'CFI',
  'Safety Pilot',
  'Examiner',
  'Observer',
  'Other',
]

// ---------- Warning Display ----------

function FieldWarning({ warnings, field }: { warnings: FlightWarning[]; field: string }) {
  const fieldWarnings = warnings.filter((w) => w.field === field)
  if (fieldWarnings.length === 0) return null
  return (
    <>
      {fieldWarnings.map((w, i) => (
        <p
          key={i}
          className={cn(
            'mt-1 text-xs',
            w.severity === 'warning' ? 'text-amber-600' : 'text-amber-500',
          )}
        >
          {w.severity === 'warning' ? '\u26a0\ufe0f' : '\u26a0\ufe0f'} {w.message}
        </p>
      ))}
    </>
  )
}

function AirportHintDisplay({ code }: { code: string }) {
  const hint = checkAirportCode(code)
  if (!hint) return null
  return (
    <p
      className={cn(
        'mt-1 text-xs',
        hint.type === 'iata_suggestion'
          ? 'text-blue-600'
          : hint.type === 'not_found'
            ? 'text-amber-600'
            : 'text-green-600',
      )}
    >
      {hint.type === 'iata_suggestion' ? '\ud83d\udca1' : '\u26a0\ufe0f'} {hint.message}
    </p>
  )
}

// ---------- Component ----------

export function FlightForm({
  initialData,
  aircraftList,
  template,
}: FlightFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [legsOpen, setLegsOpen] = useState((initialData?.legs?.length ?? 0) > 0)
  const [approachesOpen, setApproachesOpen] = useState(
    (initialData?.approaches?.length ?? 0) > 0,
  )
  const [crewOpen, setCrewOpen] = useState((initialData?.crew?.length ?? 0) > 0)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const isMobile = useMediaQuery('(max-width: 767px)')

  const isEdit = !!initialData

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          flightDate: initialData.flightDate,
          aircraftId: initialData.aircraftId ?? '',
          departureAirport: initialData.departureAirport ?? '',
          arrivalAirport: initialData.arrivalAirport ?? '',
          route: initialData.route ?? '',
          totalTime: initialData.totalTime ?? '',
          pic: initialData.pic ?? '',
          sic: initialData.sic ?? '',
          crossCountry: initialData.crossCountry ?? '',
          night: initialData.night ?? '',
          actualInstrument: initialData.actualInstrument ?? '',
          simulatedInstrument: initialData.simulatedInstrument ?? '',
          dualReceived: initialData.dualReceived ?? '',
          dualGiven: initialData.dualGiven ?? '',
          solo: initialData.solo ?? '',
          multiEngine: initialData.multiEngine ?? '',
          turbine: initialData.turbine ?? '',
          dayLandings: String(initialData.dayLandings ?? ''),
          nightLandings: String(initialData.nightLandings ?? ''),
          holds: String(initialData.holds ?? ''),
          operationType: initialData.operationType ?? '',
          roleType: initialData.roleType ?? '',
          remarks: initialData.remarks ?? '',
          tags: initialData.tags ?? '',
          isSoloFlight: initialData.isSoloFlight ?? false,
          isCheckride: initialData.isCheckride ?? false,
          status: (initialData.status as 'draft' | 'final') ?? 'draft',
          legs: initialData.legs.map((l) => ({
            legOrder: l.legOrder,
            departureAirport: l.departureAirport ?? '',
            arrivalAirport: l.arrivalAirport ?? '',
            departureTime: l.departureTime
              ? new Date(l.departureTime).toISOString().slice(0, 16)
              : '',
            arrivalTime: l.arrivalTime
              ? new Date(l.arrivalTime).toISOString().slice(0, 16)
              : '',
            totalTime: l.totalTime ?? '',
            remarks: l.remarks ?? '',
          })),
          approaches: initialData.approaches.map((a) => ({
            approachType: a.approachType,
            runway: a.runway ?? '',
            airport: a.airport ?? '',
            isCircleToLand: a.isCircleToLand ?? false,
            remarks: a.remarks ?? '',
          })),
          crew: initialData.crew.map((c) => ({
            crewRole: c.crewRole,
            name: c.name,
            certificateNumber: c.certificateNumber ?? '',
            remarks: c.remarks ?? '',
          })),
        }
      : {
          flightDate: new Date().toISOString().slice(0, 10),
          aircraftId: '',
          departureAirport: '',
          arrivalAirport: '',
          route: '',
          totalTime: '',
          pic: '',
          sic: '',
          crossCountry: '',
          night: '',
          actualInstrument: '',
          simulatedInstrument: '',
          dualReceived: '',
          dualGiven: '',
          solo: '',
          multiEngine: '',
          turbine: '',
          dayLandings: '',
          nightLandings: '',
          holds: '',
          operationType: '',
          roleType: '',
          remarks: '',
          tags: '',
          isSoloFlight: false,
          isCheckride: false,
          status: 'draft',
          legs: [],
          approaches: [],
          crew: [],
        },
  })

  const legsField = useFieldArray({ control: form.control, name: 'legs' })
  const approachesField = useFieldArray({
    control: form.control,
    name: 'approaches',
  })
  const crewField = useFieldArray({ control: form.control, name: 'crew' })

  // Compute fat-finger warnings
  const watchedValues = form.watch()
  const warnings = checkFlightWarnings(watchedValues as Record<string, unknown>)

  // Apply template values when template changes
  useEffect(() => {
    if (template && !isEdit) {
      if (template.aircraftId) form.setValue('aircraftId', template.aircraftId)
      if (template.departureAirport)
        form.setValue('departureAirport', template.departureAirport)
      if (template.arrivalAirport)
        form.setValue('arrivalAirport', template.arrivalAirport)
      if (template.route) form.setValue('route', template.route)
      if (template.operationType)
        form.setValue('operationType', template.operationType)
      if (template.role) form.setValue('roleType', template.role)
    }
  }, [template, isEdit, form])

  async function handleSaveAsTemplate() {
    if (!templateName.trim()) return
    const values = form.getValues()
    const result = await createTemplate({
      name: templateName.trim(),
      aircraftId: values.aircraftId || undefined,
      departureAirport: values.departureAirport || undefined,
      arrivalAirport: values.arrivalAirport || undefined,
      route: values.route || undefined,
      operationType: values.operationType || undefined,
      role: values.roleType || undefined,
    })
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Template saved' })
    }
    setTemplateDialogOpen(false)
    setTemplateName('')
  }

  async function onSubmit(values: FormValues, status: 'draft' | 'final') {
    setSaving(true)
    try {
      const flightPayload = {
        flightDate: values.flightDate,
        aircraftId: values.aircraftId || '',
        departureAirport: values.departureAirport,
        arrivalAirport: values.arrivalAirport,
        route: values.route,
        totalTime: values.totalTime,
        pic: values.pic,
        sic: values.sic,
        crossCountry: values.crossCountry,
        night: values.night,
        actualInstrument: values.actualInstrument,
        simulatedInstrument: values.simulatedInstrument,
        dualReceived: values.dualReceived,
        dualGiven: values.dualGiven,
        solo: values.solo,
        multiEngine: values.multiEngine,
        turbine: values.turbine,
        dayLandings: values.dayLandings,
        nightLandings: values.nightLandings,
        holds: values.holds,
        operationType: values.operationType,
        roleType: values.roleType,
        remarks: values.remarks,
        tags: values.tags,
        isSoloFlight: values.isSoloFlight,
        isCheckride: values.isCheckride,
        status,
      }

      const legsPayload = values.legs.map((l) => ({
        ...l,
        departureTime: l.departureTime
          ? new Date(l.departureTime).toISOString()
          : undefined,
        arrivalTime: l.arrivalTime
          ? new Date(l.arrivalTime).toISOString()
          : undefined,
      }))

      const payload = {
        flight: flightPayload,
        legs: legsPayload,
        approaches: values.approaches,
        crew: values.crew,
      }

      if (isEdit && initialData) {
        const result = await updateFlight(initialData.id, payload)
        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
          return
        }
        toast({ title: 'Flight saved' })
        router.push('/flights')
        router.refresh()
      } else {
        const result = await createFlight(payload)
        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
          return
        }
        toast({ title: 'Flight recorded' })
        router.push('/flights')
        router.refresh()
      }
    } catch (error) {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description:
          'Could not save flight. Check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleFinalizeAndLogAnother(values: FormValues) {
    setSaving(true)
    try {
      const flightPayload = {
        flightDate: values.flightDate,
        aircraftId: values.aircraftId || '',
        departureAirport: values.departureAirport,
        arrivalAirport: values.arrivalAirport,
        route: values.route,
        totalTime: values.totalTime,
        pic: values.pic,
        sic: values.sic,
        crossCountry: values.crossCountry,
        night: values.night,
        actualInstrument: values.actualInstrument,
        simulatedInstrument: values.simulatedInstrument,
        dualReceived: values.dualReceived,
        dualGiven: values.dualGiven,
        solo: values.solo,
        multiEngine: values.multiEngine,
        turbine: values.turbine,
        dayLandings: values.dayLandings,
        nightLandings: values.nightLandings,
        holds: values.holds,
        operationType: values.operationType,
        roleType: values.roleType,
        remarks: values.remarks,
        tags: values.tags,
        isSoloFlight: values.isSoloFlight,
        isCheckride: values.isCheckride,
        status: 'final' as const,
      }

      const legsPayload = values.legs.map((l) => ({
        ...l,
        departureTime: l.departureTime
          ? new Date(l.departureTime).toISOString()
          : undefined,
        arrivalTime: l.arrivalTime
          ? new Date(l.arrivalTime).toISOString()
          : undefined,
      }))

      const result = await createFlight({
        flight: flightPayload,
        legs: legsPayload,
        approaches: values.approaches,
        crew: values.crew,
      })

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({ title: 'Flight saved' })

      // Reset with smart defaults: keep aircraft, use arrival as new departure
      form.reset({
        flightDate: new Date().toISOString().slice(0, 10),
        aircraftId: values.aircraftId,
        departureAirport: values.arrivalAirport || '',
        arrivalAirport: '',
        route: '',
        totalTime: '',
        pic: '',
        sic: '',
        crossCountry: '',
        night: '',
        actualInstrument: '',
        simulatedInstrument: '',
        dualReceived: '',
        dualGiven: '',
        solo: '',
        multiEngine: '',
        turbine: '',
        dayLandings: '',
        nightLandings: '',
        holds: '',
        operationType: values.operationType,
        roleType: values.roleType,
        remarks: '',
        tags: '',
        isSoloFlight: false,
        isCheckride: false,
        status: 'draft',
        legs: [],
        approaches: [],
        crew: [],
      })

      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description:
          'Could not save flight. Check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (isMobile && !isEdit) {
    return (
      <Form {...form}>
        <FlightFormWizard
          form={form}
          aircraftList={aircraftList}
          saving={saving}
          onSubmit={onSubmit}
          onSubmitAndLogAnother={handleFinalizeAndLogAnother}
          isEdit={isEdit}
        />
      </Form>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => onSubmit(v, v.status))}
        className="space-y-6"
      >
        {/* ---- Save as Template Dialog ---- */}
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder='e.g. "Local Training — KBED"'
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTemplateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim()}
                >
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ---- Flight Info ---- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Flight Details</CardTitle>
            {!isEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTemplateDialogOpen(true)}
                className="text-xs text-muted-foreground"
              >
                Save as Template
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="flightDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                        className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
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
              <FormField
                control={form.control}
                name="departureAirport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ICAO/IATA"
                        {...field}
                        className="uppercase"
                      />
                    </FormControl>
                    <FormMessage />
                    <AirportHintDisplay code={field.value} />
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
                        placeholder="ICAO/IATA"
                        {...field}
                        className="uppercase"
                      />
                    </FormControl>
                    <FormMessage />
                    <AirportHintDisplay code={field.value} />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="route"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. KORD V7 JOT V9 KSTL"
                      {...field}
                      className="uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ---- Flight Times ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {(
                [
                  ['totalTime', 'Total Time'],
                  ['pic', 'PIC'],
                  ['sic', 'SIC'],
                  ['crossCountry', 'Cross Country'],
                  ['night', 'Night'],
                  ['actualInstrument', 'Actual Inst.'],
                  ['simulatedInstrument', 'Sim. Inst.'],
                  ['dualReceived', 'Dual Received'],
                  ['dualGiven', 'Dual Given'],
                  ['solo', 'Solo'],
                  ['multiEngine', 'Multi-Engine'],
                  ['turbine', 'Turbine'],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min="0"
                          placeholder="0.0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <FieldWarning warnings={warnings} field={name} />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ---- Landings & Holds ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Landings & Holds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {(
                [
                  ['dayLandings', 'Day Landings'],
                  ['nightLandings', 'Night Landings'],
                  ['holds', 'Holds'],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          step="1"
                          min="0"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <FieldWarning warnings={warnings} field={name} />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ---- Operation ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Operation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="operationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operation Type</FormLabel>
                    <FormControl>
                      <select
                        className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
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
                    <FormMessage />
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
                        className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ---- Remarks & Meta ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Remarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <textarea
                      className="border-input bg-background min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="Remarks, endorsements, notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                    <Input placeholder="checkride, ifr, night" {...field} />
                  </FormControl>
                  <FormMessage />
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
                        className="h-4 w-4 rounded border"
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
                        className="h-4 w-4 rounded border"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Checkride</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ---- Legs (collapsible) ---- */}
        <Card>
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setLegsOpen(!legsOpen)}
          >
            <div className="flex items-center gap-2">
              {legsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <CardTitle>
                Legs{' '}
                {legsField.fields.length > 0 && (
                  <span className="text-muted-foreground text-sm font-normal">
                    ({legsField.fields.length})
                  </span>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          {legsOpen && (
            <CardContent className="space-y-4">
              {legsField.fields.map((field, index) => (
                <div key={field.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Leg {index + 1}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => legsField.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`legs.${index}.departureAirport`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ICAO"
                              {...field}
                              className="uppercase"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`legs.${index}.arrivalAirport`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ICAO"
                              {...field}
                              className="uppercase"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`legs.${index}.totalTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="0.1"
                              min="0"
                              placeholder="0.0"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`legs.${index}.departureTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dep. Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`legs.${index}.arrivalTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Arr. Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`legs.${index}.remarks`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Optional" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  legsField.append({
                    legOrder: legsField.fields.length + 1,
                    departureAirport: '',
                    arrivalAirport: '',
                    departureTime: '',
                    arrivalTime: '',
                    totalTime: '',
                    remarks: '',
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Leg
              </Button>
            </CardContent>
          )}
        </Card>

        {/* ---- Approaches (collapsible) ---- */}
        <Card>
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setApproachesOpen(!approachesOpen)}
          >
            <div className="flex items-center gap-2">
              {approachesOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <CardTitle>
                Approaches{' '}
                {approachesField.fields.length > 0 && (
                  <span className="text-muted-foreground text-sm font-normal">
                    ({approachesField.fields.length})
                  </span>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          {approachesOpen && (
            <CardContent className="space-y-4">
              {approachesField.fields.map((field, index) => (
                <div key={field.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Approach {index + 1}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => approachesField.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`approaches.${index}.approachType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type *</FormLabel>
                          <FormControl>
                            <select
                              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                              {...field}
                            >
                              <option value="">Select...</option>
                              {APPROACH_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`approaches.${index}.airport`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Airport</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ICAO"
                              {...field}
                              className="uppercase"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`approaches.${index}.runway`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Runway</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 28L" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`approaches.${index}.isCircleToLand`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Circle to Land
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`approaches.${index}.remarks`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Remarks" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  approachesField.append({
                    approachType: '',
                    runway: '',
                    airport: '',
                    isCircleToLand: false,
                    remarks: '',
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Approach
              </Button>
            </CardContent>
          )}
        </Card>

        {/* ---- Crew (collapsible) ---- */}
        <Card>
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setCrewOpen(!crewOpen)}
          >
            <div className="flex items-center gap-2">
              {crewOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <CardTitle>
                Crew{' '}
                {crewField.fields.length > 0 && (
                  <span className="text-muted-foreground text-sm font-normal">
                    ({crewField.fields.length})
                  </span>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          {crewOpen && (
            <CardContent className="space-y-4">
              {crewField.fields.map((field, index) => (
                <div key={field.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Crew Member {index + 1}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => crewField.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <FormField
                      control={form.control}
                      name={`crew.${index}.crewRole`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role *</FormLabel>
                          <FormControl>
                            <select
                              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                              {...field}
                            >
                              <option value="">Select...</option>
                              {CREW_ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`crew.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`crew.${index}.certificateNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificate #</FormLabel>
                          <FormControl>
                            <Input placeholder="Optional" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`crew.${index}.remarks`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Optional" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  crewField.append({
                    crewRole: '',
                    name: '',
                    certificateNumber: '',
                    remarks: '',
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Crew Member
              </Button>
            </CardContent>
          )}
        </Card>

        {/* ---- Action Buttons ---- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/flights')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={form.handleSubmit((v) => onSubmit(v, 'draft'))}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={form.handleSubmit((v) => onSubmit(v, 'final'))}
          >
            {saving ? 'Saving...' : 'Finalize Entry'}
          </Button>
          {!isEdit && (
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={form.handleSubmit(handleFinalizeAndLogAnother)}
              className="border-[#00d4aa] text-[#00916e] hover:bg-[#00d4aa]/10"
            >
              {saving ? 'Saving...' : 'Finalize & Log Another'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
