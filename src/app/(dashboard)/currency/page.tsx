'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Sentry from '@sentry/nextjs'
import { RefreshCw, Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import type { CurrencyResult } from '@/lib/services/currency-evaluator'
import { getCurrencyStatus, refreshCurrency } from './actions'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

function StatusBadge({ status }: { status: CurrencyResult['status'] }) {
  switch (status) {
    case 'current':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--status-current)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--status-current)]">
          <ShieldCheck className="h-3 w-3" />
          Current
        </span>
      )
    case 'expiring':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--status-warning)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--status-warning)]">
          <Shield className="h-3 w-3" />
          Expiring Soon
        </span>
      )
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--status-expired)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--status-expired)]">
          <ShieldAlert className="h-3 w-3" />
          Expired
        </span>
      )
  }
}

function CurrencyCard({ item }: { item: CurrencyResult }) {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">{item.rule.name}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{item.rule.regulation}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-4 space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">{item.rule.description}</p>

        <div className="space-y-1.5">
          <p className="text-sm text-[var(--text-primary)]">{item.details}</p>

          {item.expiresAt && (
            <p className="text-sm">
              <span className="text-[var(--text-secondary)]">Expires:</span>{' '}
              <span className="font-medium text-[var(--text-primary)]">
                {new Date(item.expiresAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </p>
          )}

          {item.needed && (
            <div className="mt-2 rounded-xl border border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 px-3 py-2 text-sm text-[var(--status-expired)]">
              {item.needed}
            </div>
          )}
        </div>

        <p className="text-xs text-[var(--text-secondary)]">
          Last evaluated:{' '}
          {new Date(item.evaluatedAt).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </div>
    </div>
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
    <motion.div
      className="space-y-6"
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
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">🔄 Currency</h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            FAR 61 currency status and compliance tracking.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="rounded-xl"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </motion.div>

      {currencyQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      ) : currencyQuery.isError ? (
        <div className="card-elevated border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 p-6 text-center">
          <p className="text-sm text-[var(--status-expired)]">
            Could not load currency status.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-xl"
            onClick={() => currencyQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : currencyQuery.data && currencyQuery.data.length > 0 ? (
        <motion.div
          className="grid gap-4 md:grid-cols-2"
          variants={stagger}
        >
          {currencyQuery.data.map((item) => (
            <motion.div key={item.rule.id} variants={fadeInUp} transition={{ duration: 0.3 }}>
              <CurrencyCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--text-primary)]/10 py-16">
          <ShieldCheck className="mb-3 h-12 w-12 text-[var(--text-secondary)]/40" />
          <p className="text-lg font-medium text-[var(--text-secondary)]">
            No currency rules found
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Currency rules need to be seeded in the database.
          </p>
        </div>
      )}
    </motion.div>
  )
}
