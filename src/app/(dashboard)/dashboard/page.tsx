'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Plus,
  Wrench,
  Upload,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTransition } from '@/components/dashboard/page-transition'
import { AnimatedNumber } from '@/components/dashboard/animated-number'
import { Sparkline } from '@/components/dashboard/sparkline'
import { EmptyState } from '@/components/dashboard/empty-state'
import { getDashboardData, type DashboardData } from './actions'

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
  { key: 'totalTime', label: 'Total Time', emoji: '⏱️' },
  { key: 'pic', label: 'PIC', emoji: '✈️' },
  { key: 'sic', label: 'SIC', emoji: '👥' },
  { key: 'crossCountry', label: 'Cross-Country', emoji: '🗺️' },
  { key: 'night', label: 'Night', emoji: '🌙' },
  { key: 'instrument', label: 'Instrument', emoji: '🧭' },
  { key: 'multiEngine', label: 'Multi-Engine', emoji: '⚙️' },
] as const

function SummaryCards({ totals }: { totals: DashboardData['totals'] }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-7">
      {summaryCards.map((c) => {
        const value =
          c.key === 'instrument'
            ? totals.actualInstrument + totals.simulatedInstrument
            : totals[c.key]
        return (
          <Card
            key={c.key}
            className="min-w-[160px] flex-shrink-0 snap-start border-l-[3px] border-l-[#10B981] sm:min-w-0"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-[11px] font-medium uppercase tracking-wider">
                {c.label}
              </CardDescription>
              <span className="text-base">{c.emoji}</span>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-[28px] font-semibold leading-none text-[#1a1a2e]">
                <AnimatedNumber
                  value={value}
                  format={formatHours}
                />
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Sparkline />
                <span className="text-[11px] text-[#71717a]">&mdash;</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function SummaryCardsSkeleton() {
  return (
    <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i} className="min-w-[160px] flex-shrink-0 sm:min-w-0">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">📖 Recent Flights</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link href="/flights">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {flights.length === 0 ? (
          <EmptyState
            illustration="logbook"
            title="No flights recorded yet."
            subtitle="Record your first flight to begin building your logbook."
            actionLabel="+ Log Flight"
            actionHref="/flights/new"
          />
        ) : (
          <div className="space-y-1">
            {flights.map((f) => (
              <Link
                key={f.id}
                href={`/flights/${f.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-[#f0f0f5]"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {formatRoute(f.departureAirport, f.arrivalAirport)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {f.flightDate}
                    {f.aircraft &&
                      ` \u00b7 ${f.aircraft.tailNumber}${f.aircraft.model ? ` (${f.aircraft.model})` : ''}`}
                  </span>
                </div>
                <span className="font-mono text-sm font-medium tabular-nums">
                  {f.totalTime
                    ? `${formatHours(parseFloat(f.totalTime))}h`
                    : '\u2014'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Currency Status
// ---------------------------------------------------------------------------

function getCurrencyBadge(result: DashboardData['currency'][number]) {
  if (result.isCurrent === null) {
    return {
      color:
        'bg-muted text-muted-foreground',
      dotColor: 'bg-gray-400',
      label: 'Unknown',
      icon: HelpCircle,
    }
  }
  if (!result.isCurrent) {
    return {
      color: 'bg-red-50 text-red-700 border border-red-200',
      dotColor: 'bg-red-500',
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
        color: 'bg-amber-50 text-amber-700 border border-amber-200',
        dotColor: 'bg-amber-500',
        label: `${daysRemaining}d left`,
        icon: AlertTriangle,
      }
    }
  }
  return {
    color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dotColor: 'bg-emerald-500',
    label: 'Current',
    icon: ShieldCheck,
  }
}

function CurrencyPanel({
  currency,
}: {
  currency: DashboardData['currency']
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">🔄 Currency Status</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link href="/currency">
            Details <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {currency.length === 0 ? (
          <EmptyState
            illustration="currency"
            title="No currency rules configured yet."
            subtitle="Check back after adding flights."
          />
        ) : (
          <div className="space-y-3">
            {currency.map((c) => {
              const badge = getCurrencyBadge(c)
              return (
                <div
                  key={c.rule.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{c.rule.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.details}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${badge.color}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${badge.dotColor}`}
                    />
                    {badge.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          🎯 {goalProgress ? goalProgress.goalProfile.name : 'Active Goal'}
        </CardTitle>
        {goalProgress?.goalProfile.description && (
          <CardDescription>
            {goalProgress.goalProfile.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!goalProgress ? (
          <EmptyState
            illustration="ready"
            title="No goal assigned yet."
            subtitle="Set one to track your progress."
            actionLabel="Pick a goal"
            actionHref="/progress"
          />
        ) : (
          <div className="space-y-4">
            {goalProgress.requirements.map((req) => (
              <div key={req.field} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{req.label}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {formatHours(req.current)} / {formatHours(req.required)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="animate-progress-fill h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#059669]"
                    style={{ width: `${Math.min(req.percentage, 100)}%` }}
                  />
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  {req.percentage >= 100
                    ? 'Complete'
                    : `${req.percentage}% \u2014 ${formatHours(req.remaining)} remaining`}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Quick Actions
// ---------------------------------------------------------------------------

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/flights/new">
            <Plus className="mr-2 h-4 w-4" />
            Log a Flight
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/aircraft">
            <Wrench className="mr-2 h-4 w-4" />
            Add Aircraft
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/imports">
            <Upload className="mr-2 h-4 w-4" />
            Import Flights
          </Link>
        </Button>
      </CardContent>
    </Card>
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
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
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
    queryFn: async () => {
      const result = await getDashboardData()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <h1 className="font-heading text-2xl font-semibold sm:text-[32px]">
            🏠 Daily
          </h1>
          <DashboardSkeleton />
        </div>
      </PageTransition>
    )
  }

  if (error || !data) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <h1 className="font-heading text-2xl font-semibold sm:text-[32px]">
            🏠 Daily
          </h1>
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="py-10 text-center">
              <p className="text-red-600">
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
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-semibold sm:text-[32px]">
          🏠 Daily
        </h1>

        <SummaryCards totals={data.totals} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentFlights flights={data.recentFlights} />
          <CurrencyPanel currency={data.currency} />
          <GoalProgressPanel goalProgress={data.goalProgress} />
          <QuickActions />
        </div>
      </div>
    </PageTransition>
  )
}
