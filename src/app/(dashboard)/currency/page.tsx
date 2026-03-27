'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import { RefreshCw } from 'lucide-react'
import { PageTransition } from '@/components/dashboard/page-transition'
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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Current
        </span>
      )
    case 'expiring':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Expiring Soon
        </span>
      )
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Expired
        </span>
      )
  }
}

function CurrencyCard({ item }: { item: CurrencyResult }) {
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
    queryFn: async () => {
      const result = await getCurrencyStatus()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 5 * 60 * 1000,
  })

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const result = await refreshCurrency()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
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
    <PageTransition>
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-[32px]">🔄 Currency</h1>
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

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Part 141 note:</strong> Part 141 currency requirements are managed by your training provider.
        CrossCheck tracks Part 61 requirements. Part 141 curriculum tracking coming soon.
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
          {currencyQuery.data.map((item) => (
            <CurrencyCard key={item.rule.id} item={item} />
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
    </PageTransition>
  )
}
