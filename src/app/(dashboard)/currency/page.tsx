'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import {
  AlertTriangle,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import type { CurrencyResult } from '@/lib/services/currency-evaluator'
import { getCurrencyStatus, refreshCurrency } from './actions'

function StatusBadge({ status }: { status: CurrencyResult['status'] }) {
  switch (status) {
    case 'current':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <ShieldCheck className="h-3 w-3" />
          Current
        </span>
      )
    case 'expiring':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Shield className="h-3 w-3" />
          Expiring Soon
        </span>
      )
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <ShieldAlert className="h-3 w-3" />
          Expired
        </span>
      )
  }
}

function CurrencyCard({ item }: { item: CurrencyResult }) {
  const isInstrument = item.rule.code === 'instrument'

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{item.rule.name}</CardTitle>
            <CardDescription>{item.rule.regulation}</CardDescription>
          </div>
          <StatusBadge status={item.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm">{item.rule.description}</p>

        <div className="space-y-1.5">
          <p className="text-sm">{item.details}</p>

          {item.expiresAt && (
            <p className="text-sm">
              <span className="text-muted-foreground">Expires:</span>{' '}
              <span className="font-medium">
                {new Date(item.expiresAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </p>
          )}

          {item.needed && (
            <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {item.needed}
            </div>
          )}
        </div>

        {isInstrument && (
          <p className="text-muted-foreground text-xs italic">
            Instrument currency per &sect; 61.57(c) also requires intercepting
            and tracking courses through navigational electronic systems.
            CrossCheck assumes this is accomplished when instrument approaches
            are logged. If you have performed approaches without
            intercepting/tracking (e.g., visual approaches only), your
            instrument currency may not be valid.
          </p>
        )}

        <p className="text-muted-foreground text-xs">
          Last evaluated:{' '}
          {new Date(item.evaluatedAt).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </CardContent>
    </Card>
  )
}

export default function CurrencyPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const currencyQuery = useQuery({
    queryKey: ['currency-status'],
    queryFn: () => getCurrencyStatus(),
    staleTime: 5 * 60 * 1000,
  })

  const refreshMutation = useMutation({
    mutationFn: () => refreshCurrency(),
    onSuccess: (data) => {
      queryClient.setQueryData(['currency-status'], data)
      toast({
        title: 'Currency refreshed',
        description: 'All currency rules recalculated from flight data.',
      })
    },
    onError: (error) => {
      Sentry.captureException(error)
      toast({
        title: 'Error',
        description: 'Could not refresh currency.',
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          CrossCheck currency status is advisory only, based on the flight data
          you have entered. The pilot in command is solely responsible for
          verifying their own currency and compliance with all applicable
          regulations before acting as PIC.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Currency</h1>
          <p className="text-muted-foreground mt-1">
            FAR 61 currency status and compliance tracking.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {currencyQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : currencyQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">
            Could not load currency status.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => currencyQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : currencyQuery.data && currencyQuery.data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {currencyQuery.data.map((item, idx) => (
            <CurrencyCard key={`${item.rule.id}-${idx}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <p className="text-muted-foreground text-lg font-medium">
            No currency rules found
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Currency rules need to be seeded in the database.
          </p>
        </div>
      )}
    </div>
  )
}
