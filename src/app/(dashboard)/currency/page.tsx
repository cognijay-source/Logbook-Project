'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import {
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
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
import type { MedicalInfo } from '@/lib/services/medical-calculator'
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

function MedicalCertificateCard({ medical }: { medical: MedicalInfo }) {
  const statusColor =
    medical.status === 'current'
      ? 'text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      : medical.status === 'expiring'
        ? 'text-yellow-800 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
        : medical.status === 'expired'
          ? 'text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
          : medical.status === 'basicmed'
            ? 'text-blue-800 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
            : 'text-gray-800 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400'

  const statusLabel =
    medical.status === 'current'
      ? 'Current'
      : medical.status === 'expiring'
        ? 'Expiring Soon'
        : medical.status === 'expired'
          ? 'Expired'
          : medical.status === 'basicmed'
            ? 'BasicMed'
            : 'None'

  const classLabel =
    medical.medicalClass === '1st'
      ? 'First Class'
      : medical.medicalClass === '2nd'
        ? 'Second Class'
        : medical.medicalClass === '3rd'
          ? 'Third Class'
          : medical.medicalClass === 'basicmed'
            ? 'BasicMed'
            : 'None'

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4" />
              Medical Certificate
            </CardTitle>
            <CardDescription>{classLabel}</CardDescription>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{medical.message}</p>
        {medical.issueDate && (
          <p className="text-muted-foreground text-sm">
            Issued: {medical.issueDate}
          </p>
        )}
        {medical.expiryDate && (
          <p className="text-sm">
            <span className="text-muted-foreground">Expires:</span>{' '}
            <span className="font-medium">{medical.expiryDate}</span>
          </p>
        )}
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

  const currencyItems = currencyQuery.data?.currency ?? []
  const medical = currencyQuery.data?.medical ?? null

  return (
    <div className="space-y-6">
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
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {medical &&
            medical.status !== 'none' && (
              <MedicalCertificateCard medical={medical} />
            )}
          {currencyItems.map((item) => (
            <CurrencyCard key={item.rule.id} item={item} />
          ))}
          {currencyItems.length === 0 && !medical && (
            <div className="col-span-2 flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
              <p className="text-muted-foreground text-lg font-medium">
                No currency rules found
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Currency rules need to be seeded in the database.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
