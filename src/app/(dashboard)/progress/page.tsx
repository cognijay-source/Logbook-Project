'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProgressData, getAvailableGoals, assignGoal } from './actions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Info, Target, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const totalsConfig = [
  { key: 'totalTime', label: 'Total Time' },
  { key: 'pic', label: 'PIC' },
  { key: 'sic', label: 'SIC' },
  { key: 'crossCountry', label: 'Cross-Country' },
  { key: 'night', label: 'Night' },
  { key: 'actualInstrument', label: 'Actual Instrument' },
  { key: 'simulatedInstrument', label: 'Simulated Instrument' },
  { key: 'multiEngine', label: 'Multi-Engine' },
  { key: 'turbine', label: 'Turbine' },
  { key: 'dualGiven', label: 'Dual Given' },
  { key: 'dualReceived', label: 'Dual Received' },
  { key: 'solo', label: 'Solo' },
] as const

export default function ProgressPage() {
  const queryClient = useQueryClient()
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['progress'],
    queryFn: getProgressData,
  })

  const { data: availableGoals } = useQuery({
    queryKey: ['available-goals'],
    queryFn: getAvailableGoals,
    enabled: goalDialogOpen,
  })

  const assignMutation = useMutation({
    mutationFn: assignGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      setGoalDialogOpen(false)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Ready
        </h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">
            Could not load progress data.
          </p>
        </div>
      </div>
    )
  }

  const totals = data?.totals
  const progress = data?.progress

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Progress indicators reflect aggregate flight time totals based on your
          logged entries. Meeting minimum hour requirements does not constitute
          eligibility for a practical test. Verify all aeronautical experience
          requirements — including specific flight requirements — with your
          instructor and designated examiner.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Ready
          </h1>
          <p className="text-muted-foreground">
            {progress
              ? `Tracking toward ${progress.goalProfile.name}`
              : 'Select a goal to measure against'}
          </p>
        </div>
        <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Target className="mr-2 h-4 w-4" />
              {progress ? 'Change Goal' : 'Set Goal'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Goal</DialogTitle>
              <DialogDescription>
                Choose the certificate or position you are working toward.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              {availableGoals?.map((goal) => (
                <button
                  key={goal.id}
                  className="hover:bg-accent flex flex-col items-start rounded-lg border p-3 text-left transition-colors"
                  onClick={() =>
                    assignMutation.mutate({ goalProfileId: goal.id })
                  }
                  disabled={assignMutation.isPending}
                >
                  <span className="font-medium">{goal.name}</span>
                  {goal.description && (
                    <span className="text-muted-foreground text-sm">
                      {goal.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <DialogFooter />
          </DialogContent>
        </Dialog>
      </div>

      {/* Goal Progress */}
      {progress && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary h-5 w-5" />
            <h2 className="text-lg font-semibold">
              {progress.goalProfile.name} Requirements
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {progress.requirements.map((req) => (
              <Card key={req.field}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">{req.label}</span>
                    <span
                      className={`text-sm font-semibold ${req.percentage >= 100 ? 'text-green-600 dark:text-green-400' : ''}`}
                    >
                      {Math.round(req.percentage)}%
                    </span>
                  </div>
                  <div className="bg-muted mb-1 h-2 w-full rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ease-out ${req.percentage >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-sky-500 to-cyan-400'}`}
                      style={{
                        width: `${Math.min(100, req.percentage)}%`,
                      }}
                    />
                  </div>
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>
                      {req.current.toFixed(1)} / {req.required.toFixed(1)} hrs
                    </span>
                    {req.remaining > 0 && (
                      <span>{req.remaining.toFixed(1)} remaining</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Experience Totals */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Experience Totals</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {totalsConfig.map(({ key, label }) => {
            const value = totals?.[key] ?? 0
            return (
              <Card key={key}>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">{label}</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {value.toFixed(1)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {totals && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-muted-foreground text-sm">Total Flights</p>
                <p className="text-2xl font-bold tabular-nums">
                  {totals.totalFlights}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-muted-foreground text-sm">Day Landings</p>
                <p className="text-2xl font-bold tabular-nums">
                  {totals.dayLandings}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-muted-foreground text-sm">Night Landings</p>
                <p className="text-2xl font-bold tabular-nums">
                  {totals.nightLandings}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Empty state when no flights */}
      {totals && totals.totalFlights === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="text-muted-foreground/50 mb-4 h-12 w-12" />
            <CardTitle className="mb-2 text-lg">
              No flights logged yet
            </CardTitle>
            <CardDescription className="max-w-sm">
              Record your first flight to begin measuring progress toward
              certification requirements.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
