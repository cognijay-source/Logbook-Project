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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Award,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

export default function JourneyPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['milestones'],
    queryFn: async () => {
      const result = await getMilestoneTimeline()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
  })

  const { data: evaluation } = useQuery({
    queryKey: ['milestone-evaluation'],
    queryFn: async () => {
      const result = await runMilestoneEvaluation()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
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
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mastery
        </h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">
            Could not load milestones.
          </p>
        </div>
      </div>
    )
  }

  const achievedCount = data?.achieved.length ?? 0
  const pendingCount = evaluation?.pending.length ?? 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Mastery
          </h1>
          <p className="text-muted-foreground">
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
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`}
            />
            Evaluate
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
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
                    <Input id="name" name="name" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="achievedAt">Date</Label>
                    <Input id="achievedAt" name="achievedAt" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" name="notes" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Achieved Milestones */}
      {achievedCount > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Achieved</h2>
          <div className="relative space-y-3">
            <div className="absolute top-6 bottom-6 left-[23px] w-px bg-green-200 dark:bg-green-900/50" />
            {data?.achieved.map((m) => (
              <Card key={m.id} className="relative">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="ring-card relative z-10 mt-0.5 rounded-full bg-green-100 p-2 ring-4 dark:bg-green-900/30">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{m.name}</p>
                        {m.description && (
                          <p className="text-muted-foreground text-sm">
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
                          <Trash2 className="text-muted-foreground h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    {m.achievedAt && (
                      <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {m.achievedAt}
                      </p>
                    )}
                    {m.notes && (
                      <p className="text-muted-foreground mt-1 text-xs italic">
                        {m.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Pending / Upcoming Milestones */}
      {evaluation && evaluation.pending.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Ahead</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {evaluation.pending.map((m) => (
              <Card key={m.definition.id} className="border-dashed">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="bg-muted mt-0.5 rounded-full p-2">
                    <Circle className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{m.definition.name}</p>
                    {m.definition.description && (
                      <p className="text-muted-foreground text-sm">
                        {m.definition.description}
                      </p>
                    )}
                    {m.progress !== undefined && m.progress !== null && (
                      <div className="mt-2">
                        <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                          <span>
                            {m.currentValue ?? 0} /{' '}
                            {m.definition.threshold ?? '?'}
                          </span>
                          <span>{Math.round(m.progress)}%</span>
                        </div>
                        <div className="bg-muted h-1.5 w-full rounded-full">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-700 ease-out"
                            style={{
                              width: `${Math.min(100, m.progress)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {achievedCount === 0 &&
        (!evaluation || evaluation.pending.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Award className="text-muted-foreground/50 mb-4 h-12 w-12" />
              <CardTitle className="mb-2 text-lg">No milestones yet</CardTitle>
              <CardDescription className="max-w-sm">
                Milestones appear here as you build flight time and reach career
                thresholds.
              </CardDescription>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
