'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProgressData, getAvailableGoals, assignGoal } from './actions'
import { Button } from '@/components/ui/button'
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
import { Target, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

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
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          🎯 Ready
        </h1>
        <div className="card-elevated border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 p-6 text-center">
          <p className="text-sm text-[var(--status-expired)]">
            Could not load progress data.
          </p>
        </div>
      </div>
    )
  }

  const totals = data?.totals
  const progress = data?.progress

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div
        variants={fadeInUp}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            🎯 Ready
          </h1>
          <p className="text-[var(--text-secondary)]">
            {progress
              ? `Tracking toward ${progress.goalProfile.name}`
              : 'Select a goal to measure against'}
          </p>
        </div>
        <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl">
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
                  className="flex flex-col items-start rounded-xl border border-[var(--text-primary)]/8 p-3 text-left transition-colors hover:bg-[var(--accent-teal)]/5 hover:border-[var(--accent-teal)]/30"
                  onClick={() =>
                    assignMutation.mutate({ goalProfileId: goal.id })
                  }
                  disabled={assignMutation.isPending}
                >
                  <span className="font-medium text-[var(--text-primary)]">{goal.name}</span>
                  {goal.description && (
                    <span className="text-sm text-[var(--text-secondary)]">
                      {goal.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <DialogFooter />
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Goal Progress */}
      {progress && (
        <motion.section variants={fadeInUp} transition={{ duration: 0.3 }} className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--accent-teal)]" />
            <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
              {progress.goalProfile.name} Requirements
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {progress.requirements.map((req) => (
              <div key={req.field} className="card-elevated p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{req.label}</span>
                  <span
                    className={`font-mono text-sm font-semibold ${req.percentage >= 100 ? 'text-[var(--status-current)]' : 'text-[var(--text-primary)]'}`}
                  >
                    {Math.round(req.percentage)}%
                  </span>
                </div>
                <div className="mb-1 h-2 w-full rounded-full bg-[var(--bg-primary)]">
                  <div
                    className={`animate-progress-fill h-2 rounded-full transition-all duration-700 ease-out ${req.percentage >= 100 ? 'bg-gradient-to-r from-[var(--status-current)] to-[var(--accent-teal-hover)]' : 'bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-teal-hover)]'}`}
                    style={{
                      width: `${Math.min(100, req.percentage)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span className="font-mono">
                    {req.current.toFixed(1)} / {req.required.toFixed(1)} hrs
                  </span>
                  {req.remaining > 0 && (
                    <span className="font-mono">{req.remaining.toFixed(1)} remaining</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Experience Totals */}
      <motion.section variants={fadeInUp} transition={{ duration: 0.3 }} className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">Experience Totals</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {totalsConfig.map(({ key, label }) => {
            const value = totals?.[key] ?? 0
            return (
              <div key={key} className="card-elevated p-4">
                <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                <p className="font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                  {value.toFixed(1)}
                </p>
              </div>
            )
          })}
        </div>
        {totals && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="card-elevated p-4">
              <p className="text-sm text-[var(--text-secondary)]">Total Flights</p>
              <p className="font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                {totals.totalFlights}
              </p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-sm text-[var(--text-secondary)]">Day Landings</p>
              <p className="font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                {totals.dayLandings}
              </p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-sm text-[var(--text-secondary)]">Night Landings</p>
              <p className="font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                {totals.nightLandings}
              </p>
            </div>
          </div>
        )}
      </motion.section>

      {/* Empty state when no flights */}
      {totals && totals.totalFlights === 0 && (
        <div className="card-elevated flex flex-col items-center justify-center py-12 text-center">
          <Target className="mb-4 h-12 w-12 text-[var(--text-secondary)]/40" />
          <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            No flights logged yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
            Record your first flight to begin measuring progress toward
            certification requirements.
          </p>
        </div>
      )}
    </motion.div>
  )
}
