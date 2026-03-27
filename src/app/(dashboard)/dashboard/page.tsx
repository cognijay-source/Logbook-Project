'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Clock,
  Plane,
  Users,
  MapPin,
  Moon,
  Gauge,
  Cog,
  Plus,
  Wrench,
  Upload,
  ArrowRight,
  Target,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { getDashboardData, type DashboardData } from './actions'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

function formatHours(n: number): string {
  if (n === 0) return '\u2014'
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)
}

function formatRoute(dep: string | null, arr: string | null): string {
  if (dep && arr) return `${dep} \u2192 ${arr}`
  if (dep) return dep
  if (arr) return arr
  return 'Local'
}

// ---------------------------------------------------------------------------
// Summary Cards
// ---------------------------------------------------------------------------

const summaryCards = [
  { key: 'totalTime', label: 'Total Time', icon: Clock, emoji: '⏱️' },
  { key: 'pic', label: 'PIC', icon: Plane, emoji: '✈️' },
  { key: 'sic', label: 'SIC', icon: Users, emoji: '👥' },
  { key: 'crossCountry', label: 'Cross-Country', icon: MapPin, emoji: '🗺️' },
  { key: 'night', label: 'Night', icon: Moon, emoji: '🌙' },
  { key: 'instrument', label: 'Instrument', icon: Gauge, emoji: '🧭' },
  { key: 'multiEngine', label: 'Multi-Engine', icon: Cog, emoji: '⚙️' },
] as const

function SummaryCards({ totals }: { totals: DashboardData['totals'] }) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {summaryCards.map((c) => {
        const value =
          c.key === 'instrument'
            ? totals.actualInstrument + totals.simulatedInstrument
            : totals[c.key]
        return (
          <motion.div key={c.key} variants={fadeInUp} transition={{ duration: 0.3 }}>
            <div className="card-elevated group p-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  {c.label}
                </span>
                <span className="text-base">{c.emoji}</span>
              </div>
              <p className="font-mono text-[32px] font-bold leading-none tabular-nums text-[var(--text-primary)]">
                {formatHours(value)}
              </p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="card-elevated p-4">
          <Skeleton className="mb-2 h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Recent Flights
// ---------------------------------------------------------------------------

function RecentFlights({
  flights,
}: {
  flights: DashboardData['recentFlights']
}) {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">Recent Flights</h3>
        <Button variant="ghost" size="sm" asChild className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <Link href="/flights">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="px-6 pb-6">
        {flights.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Plane className="h-12 w-12 text-[var(--text-secondary)]/30" />
            <p className="text-center text-sm text-[var(--text-secondary)]">
              No flights recorded yet.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/flights/new">Log your first flight</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {flights.map((f) => (
              <Link
                key={f.id}
                href={`/flights/${f.id}`}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-[var(--accent-teal)]/5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">✈️</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {formatRoute(f.departureAirport, f.arrivalAirport)}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {f.flightDate}
                      {f.aircraft &&
                        ` \u00b7 ${f.aircraft.tailNumber}${f.aircraft.model ? ` (${f.aircraft.model})` : ''}`}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-sm font-medium tabular-nums text-[var(--text-primary)]">
                  {f.totalTime
                    ? `${formatHours(parseFloat(f.totalTime))}h`
                    : '\u2014'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Currency Status
// ---------------------------------------------------------------------------

function getCurrencyBadge(result: DashboardData['currency'][number]) {
  if (result.isCurrent === null) {
    return {
      color: 'bg-gray-100 text-gray-600',
      label: 'Unknown',
      icon: HelpCircle,
    }
  }
  if (!result.isCurrent) {
    return {
      color: 'bg-[var(--status-expired)]/10 text-[var(--status-expired)]',
      label: 'Expired',
      icon: XCircle,
    }
  }
  if (result.expiresAt) {
    const daysRemaining = Math.ceil(
      (new Date(result.expiresAt).getTime() - Date.now()) / 86400000,
    )
    if (daysRemaining <= 30) {
      return {
        color: 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]',
        label: `${daysRemaining}d left`,
        icon: AlertTriangle,
      }
    }
  }
  return {
    color: 'bg-[var(--status-current)]/10 text-[var(--status-current)]',
    label: 'Current',
    icon: ShieldCheck,
  }
}

function CurrencyPanel({ currency }: { currency: DashboardData['currency'] }) {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">Currency Status</h3>
        <Button variant="ghost" size="sm" asChild className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <Link href="/currency">
            Details <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="px-6 pb-6">
        {currency.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <ShieldCheck className="h-12 w-12 text-[var(--text-secondary)]/30" />
            <p className="text-center text-sm text-[var(--text-secondary)]">
              No currency rules configured yet. Check back after adding flights.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currency.map((c) => {
              const badge = getCurrencyBadge(c)
              return (
                <div
                  key={c.rule.id}
                  className="flex items-center justify-between rounded-xl bg-[var(--bg-primary)] px-3 py-2.5"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{c.rule.name}</span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {c.details}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}
                  >
                    <badge.icon className="h-3 w-3" />
                    {badge.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Goal Progress
// ---------------------------------------------------------------------------

function GoalProgressPanel({
  goalProgress,
}: {
  goalProgress: DashboardData['goalProgress']
}) {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
          {goalProgress ? goalProgress.goalProfile.name : 'Active Goal'}
        </h3>
        {goalProgress?.goalProfile.description && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {goalProgress.goalProfile.description}
          </p>
        )}
      </div>
      <div className="px-6 pb-6">
        {!goalProgress ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Target className="h-12 w-12 text-[var(--text-secondary)]/30" />
            <p className="text-center text-sm text-[var(--text-secondary)]">
              No goal assigned yet. Set one to track your progress.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/progress">Pick a goal</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goalProgress.requirements.map((req) => (
              <div key={req.field} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-primary)]">{req.label}</span>
                  <span className="font-mono tabular-nums text-[var(--text-secondary)]">
                    {formatHours(req.current)} / {formatHours(req.required)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-primary)]">
                  <div
                    className="animate-progress-fill h-full rounded-full bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-teal-hover)]"
                    style={{ width: `${Math.min(req.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {req.percentage >= 100
                    ? 'Complete'
                    : `${req.percentage}% \u2014 ${formatHours(req.remaining)} remaining`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quick Actions
// ---------------------------------------------------------------------------

function QuickActions() {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">Quick Actions</h3>
      </div>
      <div className="flex flex-wrap gap-3 px-6 pb-6">
        <Link
          href="/flights/new"
          className="btn-primary inline-flex items-center text-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Log a Flight
        </Link>
        <Link
          href="/aircraft"
          className="btn-outline inline-flex items-center text-sm"
        >
          <Wrench className="mr-2 h-4 w-4" />
          Add Aircraft
        </Link>
        <Link
          href="/imports"
          className="btn-outline inline-flex items-center text-sm"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Flights
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <SummaryCardsSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-elevated p-6">
            <Skeleton className="mb-4 h-5 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-semibold text-[var(--text-primary)]">
          Welcome back, Pilot ✈️
        </h1>
        <DashboardSkeleton />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-semibold text-[var(--text-primary)]">
          Welcome back, Pilot ✈️
        </h1>
        <div className="card-elevated border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5">
          <div className="py-10 text-center">
            <p className="text-[var(--status-expired)]">
              Failed to load dashboard data. Please try refreshing.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.h1
        variants={fadeInUp}
        transition={{ duration: 0.4 }}
        className="font-heading text-3xl font-semibold text-[var(--text-primary)]"
      >
        Welcome back, Pilot ✈️
      </motion.h1>

      <SummaryCards totals={data.totals} />

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeInUp} transition={{ duration: 0.3 }}>
          <RecentFlights flights={data.recentFlights} />
        </motion.div>
        <motion.div variants={fadeInUp} transition={{ duration: 0.3 }}>
          <CurrencyPanel currency={data.currency} />
        </motion.div>
        <motion.div variants={fadeInUp} transition={{ duration: 0.3 }}>
          <GoalProgressPanel goalProgress={data.goalProgress} />
        </motion.div>
        <motion.div variants={fadeInUp} transition={{ duration: 0.3 }}>
          <QuickActions />
        </motion.div>
      </div>
    </motion.div>
  )
}
