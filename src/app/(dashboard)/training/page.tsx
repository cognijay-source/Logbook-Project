'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import {
  PlusCircle,
  Pencil,
  Trash2,
  GraduationCap,
  Award,
  FileCheck,
  BookOpen,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

import {
  getTrainingEntries,
  createTrainingEntry,
  updateTrainingEntry,
  deleteTrainingEntry,
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getEndorsements,
  createEndorsement,
  updateEndorsement,
  deleteEndorsement,
} from './actions'

// ---------- Types ----------

type TrainingEntry = {
  id: string
  entryType: string
  subject: string
  description: string | null
  instructor: string | null
  entryDate: string
  duration: string | null
  notes: string | null
}

type Certificate = {
  id: string
  certificateType: string
  name: string
  issuedDate: string | null
  expiryDate: string | null
  issuingAuthority: string | null
  notes: string | null
}

type Endorsement = {
  id: string
  endorsementType: string
  description: string
  endorsedDate: string | null
  instructorName: string | null
  instructorCertNumber: string | null
  notes: string | null
}

// ---------- Constants ----------

const ENTRY_TYPES = ['ground', 'simulator', 'flight'] as const

const CERTIFICATE_TYPES = [
  'Student',
  'Private',
  'Instrument',
  'Commercial',
  'ATP',
  'CFI',
  'CFII',
  'MEI',
  'Other',
] as const

const ENDORSEMENT_TYPES = [
  'Solo',
  'Cross-country',
  'Class/Type',
  'Checkride',
  'High performance',
  'Complex',
  'Tailwheel',
  'High altitude',
  'Other',
] as const

// ---------- Page ----------

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Training</h1>
        <p className="text-muted-foreground mt-1">
          Track training events, certificates, and endorsements
        </p>
      </div>

      <Tabs defaultValue="entries">
        <TabsList>
          <TabsTrigger value="entries" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Training Entries
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-2">
            <Award className="h-4 w-4" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="endorsements" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Endorsements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <TrainingEntriesTab />
        </TabsContent>
        <TabsContent value="certificates">
          <CertificatesTab />
        </TabsContent>
        <TabsContent value="endorsements">
          <EndorsementsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== Training Entries Tab ====================

function TrainingEntriesTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TrainingEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TrainingEntry | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['training-entries'],
    queryFn: async () => {
      const result = await getTrainingEntries()
      if (result.error) throw new Error(result.error)
      return result.data as TrainingEntry[]
    },
  })

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(entry: TrainingEntry) {
    setEditing(entry)
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      entryDate: fd.get('entryDate') as string,
      entryType: fd.get('entryType') as string,
      duration: fd.get('duration') ? Number(fd.get('duration')) : undefined,
      instructor: fd.get('instructor') as string,
      subject: fd.get('subject') as string,
      description: fd.get('description') as string,
      notes: fd.get('notes') as string,
    }

    try {
      if (editing) {
        const result = await updateTrainingEntry(editing.id, payload)
        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({ title: 'Training entry updated' })
          setDialogOpen(false)
          queryClient.invalidateQueries({ queryKey: ['training-entries'] })
        }
      } else {
        const result = await createTrainingEntry(payload)
        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({ title: 'Training entry created' })
          setDialogOpen(false)
          queryClient.invalidateQueries({ queryKey: ['training-entries'] })
        }
      }
    } catch (error) {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const result = await deleteTrainingEntry(deleteTarget.id)
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Training entry deleted' })
        queryClient.invalidateQueries({ queryKey: ['training-entries'] })
      }
    } catch (error) {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
      setDeleteTarget(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-destructive mt-4 rounded-lg border p-4">
        Could not load training entries.
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Entry
        </Button>
      </div>

      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <GraduationCap className="text-muted-foreground mb-4 h-12 w-12" />
          <h2 className="text-lg font-semibold">No training entries yet</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Log ground school, simulator sessions, and flight training.
          </p>
          <Button onClick={openCreate} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Entry
          </Button>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="rounded-lg border">
          <div className="text-muted-foreground grid grid-cols-[1fr_100px_1fr_1fr_80px_auto] gap-4 border-b px-4 py-2 text-sm font-medium">
            <span>Date</span>
            <span>Type</span>
            <span>Subject</span>
            <span>Instructor</span>
            <span>Duration</span>
            <span className="sr-only">Actions</span>
          </div>
          {data.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-[1fr_100px_1fr_1fr_80px_auto] items-center gap-4 border-b px-4 py-3 text-sm last:border-b-0"
            >
              <span>{entry.entryDate}</span>
              <span className="capitalize">{entry.entryType}</span>
              <span className="truncate">{entry.subject}</span>
              <span className="text-muted-foreground truncate">
                {entry.instructor || '—'}
              </span>
              <span>{entry.duration ? `${entry.duration}h` : '—'}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(entry)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-8 w-8"
                  onClick={() => setDeleteTarget(entry)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Training Entry' : 'New Training Entry'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the training entry details.'
                : 'Log a ground school, simulator, or flight training event.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="te-date">Date</Label>
                <Input
                  id="te-date"
                  name="entryDate"
                  type="date"
                  defaultValue={editing?.entryDate ?? ''}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="te-type">Type</Label>
                <select
                  id="te-type"
                  name="entryType"
                  defaultValue={editing?.entryType ?? ''}
                  required
                  className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  {ENTRY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="te-subject">Subject</Label>
              <Input
                id="te-subject"
                name="subject"
                defaultValue={editing?.subject ?? ''}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="te-duration">Duration (hours)</Label>
                <Input
                  id="te-duration"
                  name="duration"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={editing?.duration ?? ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="te-instructor">Instructor</Label>
                <Input
                  id="te-instructor"
                  name="instructor"
                  defaultValue={editing?.instructor ?? ''}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="te-description">Description</Label>
              <textarea
                id="te-description"
                name="description"
                rows={2}
                defaultValue={editing?.description ?? ''}
                className="border-input focus-visible:ring-ring flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="te-notes">Notes</Label>
              <textarea
                id="te-notes"
                name="notes"
                rows={2}
                defaultValue={editing?.notes ?? ''}
                className="border-input focus-visible:ring-ring flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Training Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.subject}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={submitting}
              onClick={handleDelete}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== Certificates Tab ====================

function CertificatesTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Certificate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const result = await getCertificates()
      if (result.error) throw new Error(result.error)
      return result.data as Certificate[]
    },
  })

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(cert: Certificate) {
    setEditing(cert)
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      certificateType: fd.get('certificateType') as string,
      name: fd.get('name') as string,
      issuedDate: fd.get('issuedDate') as string,
      expiryDate: fd.get('expiryDate') as string,
      issuingAuthority: fd.get('issuingAuthority') as string,
      notes: fd.get('notes') as string,
    }

    try {
      if (editing) {
        const result = await updateCertificate(editing.id, payload)
        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({ title: 'Certificate updated' })
          setDialogOpen(false)
          queryClient.invalidateQueries({ queryKey: ['certificates'] })
        }
      } else {
        const result = await createCertificate(payload)
        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({ title: 'Certificate created' })
          setDialogOpen(false)
          queryClient.invalidateQueries({ queryKey: ['certificates'] })
        }
      }
    } catch (error) {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const result = await deleteCertificate(deleteTarget.id)
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Certificate deleted' })
        queryClient.invalidateQueries({ queryKey: ['certificates'] })
      }
    } catch (error) {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
      setDeleteTarget(null)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-destructive mt-4 rounded-lg border p-4">
        Could not load certificates.
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Certificate
        </Button>
      </div>

      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <Award className="text-muted-foreground mb-4 h-12 w-12" />
          <h2 className="text-lg font-semibold">No certificates yet</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Track your pilot certificates and ratings.
          </p>
          <Button onClick={openCreate} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Certificate
          </Button>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((cert) => (
            <Card key={cert.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {cert.certificateType}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {cert.name}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(cert)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => setDeleteTarget(cert)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-1 text-sm">
                  {cert.issuedDate && (
                    <>
                      <dt className="text-muted-foreground">Issued</dt>
                      <dd>{cert.issuedDate}</dd>
                    </>
                  )}
                  {cert.expiryDate && (
                    <>
                      <dt className="text-muted-foreground">Expires</dt>
                      <dd>{cert.expiryDate}</dd>
                    </>
                  )}
                  {cert.issuingAuthority && (
                    <>
                      <dt className="text-muted-foreground">Authority</dt>
                      <dd>{cert.issuingAuthority}</dd>
                    </>
                  )}
                </dl>
                {cert.notes && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    {cert.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Certificate' : 'New Certificate'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the certificate details.'
                : 'Add a pilot certificate or rating.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cert-type">Type</Label>
              <select
                id="cert-type"
                name="certificateType"
                defaultValue={editing?.certificateType ?? ''}
                required
                className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              >
                <option value="" disabled>
                  Select type
                </option>
                {CERTIFICATE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cert-number">Certificate Number</Label>
              <Input
                id="cert-number"
                name="name"
                defaultValue={editing?.name ?? ''}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cert-issued">Issue Date</Label>
                <Input
                  id="cert-issued"
                  name="issuedDate"
                  type="date"
                  defaultValue={editing?.issuedDate ?? ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cert-expiry">Expiry Date</Label>
                <Input
                  id="cert-expiry"
                  name="expiryDate"
                  type="date"
                  defaultValue={editing?.expiryDate ?? ''}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cert-authority">Issuing Authority</Label>
              <Input
                id="cert-authority"
                name="issuingAuthority"
                defaultValue={editing?.issuingAuthority ?? ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cert-notes">Notes</Label>
              <textarea
                id="cert-notes"
                name="notes"
                rows={2}
                defaultValue={editing?.notes ?? ''}
                className="border-input focus-visible:ring-ring flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Certificate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the{' '}
              {deleteTarget?.certificateType} certificate? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={submitting}
              onClick={handleDelete}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== Endorsements Tab ====================

function EndorsementsTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Endorsement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Endorsement | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['endorsements'],
    queryFn: async () => {
      const result = await getEndorsements()
      if (result.error) throw new Error(result.error)
      return result.data as Endorsement[]
    },
  })

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(endorsement: Endorsement) {
    setEditing(endorsement)
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      endorsementType: fd.get('endorsementType') as string,
      description: fd.get('description') as string,
      endorsedDate: fd.get('endorsedDate') as string,
      instructorName: fd.get('instructorName') as string,
      instructorCertNumber: fd.get('instructorCertNumber') as string,
      notes: fd.get('notes') as string,
    }

    try {
      if (editing) {
        const result = await updateEndorsement(editing.id, payload)
        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({ title: 'Endorsement updated' })
          setDialogOpen(false)
          queryClient.invalidateQueries({ queryKey: ['endorsements'] })
        }
      } else {
        const result = await createEndorsement(payload)
        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({ title: 'Endorsement created' })
          setDialogOpen(false)
          queryClient.invalidateQueries({ queryKey: ['endorsements'] })
        }
      }
    } catch (error) {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const result = await deleteEndorsement(deleteTarget.id)
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Endorsement deleted' })
        queryClient.invalidateQueries({ queryKey: ['endorsements'] })
      }
    } catch (error) {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
      setDeleteTarget(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-destructive mt-4 rounded-lg border p-4">
        Could not load endorsements.
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Endorsement
        </Button>
      </div>

      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <FileCheck className="text-muted-foreground mb-4 h-12 w-12" />
          <h2 className="text-lg font-semibold">No endorsements yet</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Track your instructor endorsements.
          </p>
          <Button onClick={openCreate} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Endorsement
          </Button>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="rounded-lg border">
          <div className="text-muted-foreground grid grid-cols-[1fr_120px_1fr_1fr_1fr_auto] gap-4 border-b px-4 py-2 text-sm font-medium">
            <span>Date</span>
            <span>Type</span>
            <span>Description</span>
            <span>Instructor</span>
            <span>CFI #</span>
            <span className="sr-only">Actions</span>
          </div>
          {data.map((endorsement) => (
            <div
              key={endorsement.id}
              className="grid grid-cols-[1fr_120px_1fr_1fr_1fr_auto] items-center gap-4 border-b px-4 py-3 text-sm last:border-b-0"
            >
              <span>{endorsement.endorsedDate || '—'}</span>
              <span>{endorsement.endorsementType}</span>
              <span className="truncate">{endorsement.description}</span>
              <span className="text-muted-foreground truncate">
                {endorsement.instructorName || '—'}
              </span>
              <span className="text-muted-foreground truncate">
                {endorsement.instructorCertNumber || '—'}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(endorsement)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-8 w-8"
                  onClick={() => setDeleteTarget(endorsement)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Endorsement' : 'New Endorsement'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the endorsement details.'
                : 'Add an instructor endorsement.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="end-type">Type</Label>
                <select
                  id="end-type"
                  name="endorsementType"
                  defaultValue={editing?.endorsementType ?? ''}
                  required
                  className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  {ENDORSEMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date">Date</Label>
                <Input
                  id="end-date"
                  name="endorsedDate"
                  type="date"
                  defaultValue={editing?.endorsedDate ?? ''}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-description">Description</Label>
              <Input
                id="end-description"
                name="description"
                defaultValue={editing?.description ?? ''}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="end-instructor">Instructor Name</Label>
                <Input
                  id="end-instructor"
                  name="instructorName"
                  defaultValue={editing?.instructorName ?? ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-cfi">Instructor CFI #</Label>
                <Input
                  id="end-cfi"
                  name="instructorCertNumber"
                  defaultValue={editing?.instructorCertNumber ?? ''}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-notes">Notes</Label>
              <textarea
                id="end-notes"
                name="notes"
                rows={2}
                defaultValue={editing?.notes ?? ''}
                className="border-input focus-visible:ring-ring flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Endorsement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this{' '}
              {deleteTarget?.endorsementType} endorsement? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={submitting}
              onClick={handleDelete}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
