'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  type NotificationRow,
} from './actions'

function NotificationCard({
  notification,
  onMarkRead,
  onDismiss,
}: {
  notification: NotificationRow
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
}) {
  return (
    <Card
      className={notification.isRead ? 'opacity-60' : ''}
    >
      <CardContent className="flex items-start gap-3 py-4">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            notification.isRead
              ? 'bg-gray-100 dark:bg-zinc-800'
              : 'bg-[#10B981]/10'
          }`}
        >
          <Bell
            className={`h-4 w-4 ${
              notification.isRead
                ? 'text-gray-400'
                : 'text-[#10B981]'
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {notification.message}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {new Date(notification.createdAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onMarkRead(notification.id)}
              title="Mark as read"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDismiss(notification.id)}
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const result = await getNotifications()
      if (result.error) throw new Error(result.error)
      return result
    },
    staleTime: 30_000,
  })

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await markAsRead(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({ title: 'Error', description: 'Could not mark as read.', variant: 'destructive' })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const result = await markAllAsRead()
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
      toast({ title: 'All marked as read' })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({ title: 'Error', description: 'Could not mark all as read.', variant: 'destructive' })
    },
  })

  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await dismissNotification(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({ title: 'Error', description: 'Could not dismiss notification.', variant: 'destructive' })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated on currency, goals, and system events.
          </p>
        </div>
        {notificationsQuery.data && notificationsQuery.data.data.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notificationsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : notificationsQuery.isError ? (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="py-10 text-center">
            <p className="text-red-600">Failed to load notifications.</p>
          </CardContent>
        </Card>
      ) : notificationsQuery.data && notificationsQuery.data.data.length > 0 ? (
        <div className="space-y-3">
          {notificationsQuery.data.data.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onDismiss={(id) => dismissMutation.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <Bell className="h-10 w-10 text-[#10B981] opacity-30" />
          <p className="text-muted-foreground mt-4 text-lg font-medium">
            No notifications
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            You&apos;re all caught up.
          </p>
        </div>
      )}
    </div>
  )
}
