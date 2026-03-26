'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

type AccountSectionProps = {
  changePasswordAction: (
    formData: FormData,
  ) => Promise<{ data: unknown; error: unknown }>
  deleteAccountAction: () => Promise<{ error: unknown }>
}

export function AccountSection({
  changePasswordAction,
  deleteAccountAction,
}: AccountSectionProps) {
  return (
    <div className="space-y-6">
      <ChangePasswordCard action={changePasswordAction} />
      <DeleteAccountCard action={deleteAccountAction} />
    </div>
  )
}

function ChangePasswordCard({
  action,
}: {
  action: (formData: FormData) => Promise<{ data: unknown; error: unknown }>
}) {
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
          formRef.current?.reset()
          toast({
            title: 'Password changed',
            description: 'Your password has been updated.',
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
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {errors._form && (
            <p className="text-destructive text-sm">{errors._form[0]}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              required
              minLength={8}
            />
            {errors.newPassword && (
              <p className="text-destructive text-sm">
                {errors.newPassword[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              required
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">
                {errors.confirmPassword[0]}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function DeleteAccountCard({
  action,
}: {
  action: () => Promise<{ error: unknown }>
}) {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    if (confirmation !== 'DELETE') return
    setError(null)

    startTransition(async () => {
      try {
        const result = await action()
        if (result.error) {
          setError(String(result.error))
        } else {
          router.push('/')
        }
      } catch (err) {
        Sentry.captureException(err)
        setError('Something went wrong. Try again.')
      }
    })
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Delete Account</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This will permanently delete your account and all your data,
                including flights, aircraft, financial entries, milestones,
                goals, documents, and imports. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="deleteConfirmation">
                Type <span className="font-mono font-bold">DELETE</span> to
                confirm
              </Label>
              <Input
                id="deleteConfirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="DELETE"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  setConfirmation('')
                  setError(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmation !== 'DELETE' || isPending}
              >
                {isPending ? 'Deleting...' : 'Delete My Account'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
