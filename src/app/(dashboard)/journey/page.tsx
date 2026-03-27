'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMilestoneTimeline,
  runMilestoneEvaluation,
  createManualMilestone,
  deleteUserMilestone,
} from './actions'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Award,
  Calendar,
  CheckCircle2,
  Plus,
  RefreshCw,
  RotateCw,
  Trash2,
} from 'lucide-react'
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

export default function JourneyPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['milestones'],
    queryFn: getMilestoneTimeline,
  })

  const { data: evaluation } = useQuery({
    queryKey: ['milestone-evaluation'],
    queryFn: runMilestoneEvaluation,
  })

  const refreshMutation = useMutation({
    mutationFn: runMilestoneEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
      queryClient.invalidateQueries({ queryKey: ['milestone-evaluation'] })
    },
  })

  const createMutation = useMutation({
    mutationFn: createManualMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
      setDialogOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUserMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
    },
  })

  function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMutation.mutate({
      name: (fd.get('name') as string) ?? '',
      description: (fd.get('description') as string) || undefined,
      achievedAt: (fd.get('achievedAt') as string) || undefined,
      notes: (fd.get('notes') as string) || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          🏆 Mastery
        </h1>
        <div className="card-elevated border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 p-6 text-center">
          <p className="text-sm text-[var(--status-expired)]">
            Could not load milestones.
          </p>
        </div>
      </div>
    )
  }

  const achievedCount = data?.achieved.length ?? 0
  const pendingCount = evaluation?.pending.length ?? 0

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
            🏆 Mastery
          </h1>
          <p className="text-[var(--text-secondary)]">
            {achievedCount} {achievedCount === 1 ? 'milestone' : 'milestones'}{' '}
            reached
            {pendingCount > 0 && ` \u00b7 ${pendingCount} ahead`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="rounded-xl"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`}
            />
            Evaluate
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl bg-[var(--accent-teal)] text-white hover:bg-[var(--accent-teal-hover)]">
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateSubmit}>
                <DialogHeader>
                  <DialogTitle>Record Milestone</DialogTitle>
                  <DialogDescription>
                    Add a milestone you have reached.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required className="rounded-xl focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal)]/20" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" className="rounded-xl focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal)]/20" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="achievedAt">Date</Label>
                    <Input id="achievedAt" name="achievedAt" type="date" className="rounded-xl focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal)]/20" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" name="notes" className="rounded-xl focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal)]/20" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} className="rounded-xl bg-[var(--accent-teal)] text-white hover:bg-[var(--accent-teal-hover)]">
                    {createMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Achieved Milestones */}
      {achievedCount > 0 && (
        <motion.section variants={fadeInUp} transition={{ duration: 0.3 }} className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">Achieved</h2>
          <div className="relative space-y-3">
            <div className="absolute top-6 bottom-6 left-[23px] w-px bg-[var(--accent-teal)]/30" />
            {data?.achieved.map((m) => (
              <div key={m.id} className="card-elevated relative p-4">
                <div className="flex items-start gap-4">
                  <div className="relative z-10 mt-0.5 rounded-full bg-[var(--accent-teal)]/10 p-2 ring-4 ring-white">
                    <CheckCircle2 className="h-4 w-4 text-[var(--accent-teal)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{m.name}</p>
                        {m.description && (
                          <p className="text-sm text-[var(--text-secondary)]">
                            {m.description}
                          </p>
                        )}
                      </div>
                      {m.isManual && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 shrink-0 p-0"
                          onClick={() => deleteMutation.mutate(m.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                        </Button>
                      )}
                    </div>
                    {m.achievedAt && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                        <Calendar className="h-3 w-3" />
                        {m.achievedAt}
                      </p>
                    )}
                    {m.notes && (
                      <p className="mt-1 text-xs italic text-[var(--text-secondary)]">
                        {m.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Pending / Upcoming Milestones */}
      {evaluation && evaluation.pending.length > 0 && (
        <motion.section variants={fadeInUp} transition={{ duration: 0.3 }} className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">Ahead</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {evaluation.pending.map((m) => (
              <div key={m.definition.id} className="card-elevated border-dashed p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 rounded-full bg-[var(--status-info)]/10 p-2">
                    <RotateCw className="h-4 w-4 text-[var(--status-info)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{m.definition.name}</p>
                    {m.definition.description && (
                      <p className="text-sm text-[var(--text-secondary)]">
                        {m.definition.description}
                      </p>
                    )}
                    {m.progress !== undefined && m.progress !== null && (
                      <div className="mt-2">
                        <div className="mb-1 flex justify-between text-xs text-[var(--text-secondary)]">
                          <span>
                            {m.currentValue ?? 0} /{' '}
                            {m.definition.threshold ?? '?'}
                          </span>
                          <span>{Math.round(m.progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[var(--bg-primary)]">
                          <div
                            className="animate-progress-fill h-1.5 rounded-full bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-teal-hover)]"
                            style={{
                              width: `${Math.min(100, m.progress)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Empty State */}
      {achievedCount === 0 &&
        (!evaluation || evaluation.pending.length === 0) && (
          <div className="card-elevated p-12 text-center">
            <Award className="mx-auto mb-4 h-12 w-12 text-[var(--text-secondary)]/40" />
            <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)]">No milestones yet</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Milestones appear here as you build flight time and reach career
              thresholds.
            </p>
          </div>
        )}
    </motion.div>
  )
}
