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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getDashboardData, type DashboardData } from './actions'

function formatHours(n: number): string {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)
}

function formatRoute(dep: string | null, arr: string | null): string {
  if (dep && arr) return `${dep} → ${arr}`
  if (dep) return dep
  if (arr) return arr
  return 'Local'
}

// ---------------------------------------------------------------------------
// Summary Cards
// ---------------------------------------------------------------------------

const summaryCards = [
  { key: 'totalTime', label: 'Total Time', icon: Clock },
  { key: 'pic', label: 'PIC', icon: Plane },
  { key: 'sic', label: 'SIC', icon: Users },
  { key: 'crossCountry', label: 'Cross-Country', icon: MapPin },
  { key: 'night', label: 'Night', icon: Moon },
  { key: 'instrument', label: 'Instrument', icon: Gauge },
  { key: 'multiEngine', label: 'Multi-Engine', icon: Cog },
] as const

function SummaryCards({ totals }: { totals: DashboardData['totals'] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {summaryCards.map((c) => {
        const value =
          c.key === 'instrument'
            ? totals.actualInstrument + totals.simulatedInstrument
            : totals[c.key]
        return (
          <Card key={c.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-xs font-medium">
                {c.label}
              </CardDescription>
              <c.icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatHours(value)}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i}>
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
        <CardTitle className="text-base">Recent Flights</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/flights">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {flights.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No flights logged yet. Ready for takeoff?
          </p>
        ) : (
          <div className="space-y-3">
            {flights.map((f) => (
              <Link
                key={f.id}
                href={`/flights/${f.id}`}
                className="hover:bg-accent/50 flex items-center justify-between rounded-md px-3 py-2 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {formatRoute(f.departureAirport, f.arrivalAirport)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {f.flightDate}
                    {f.aircraft &&
                      ` · ${f.aircraft.tailNumber}${f.aircraft.model ? ` (${f.aircraft.model})` : ''}`}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {f.totalTime ? `${formatHours(parseFloat(f.totalTime))}h` : '—'}
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
      color: 'bg-muted text-muted-foreground',
      label: 'Unknown',
      icon: HelpCircle,
    }
  }
  if (!result.isCurrent) {
    return {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      label: 'Expired',
      icon: XCircle,
    }
  }
  // Current — check if expiring within 30 days
  if (result.expiresAt) {
    const daysRemaining = Math.ceil(
      (new Date(result.expiresAt).getTime() - Date.now()) / 86400000,
    )
    if (daysRemaining <= 30) {
      return {
        color:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        label: `${daysRemaining}d left`,
        icon: AlertTriangle,
      }
    }
  }
  return {
    color:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
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
        <CardTitle className="text-base">Currency Status</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/currency">
            Details <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {currency.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No currency rules configured yet. Check back after adding flights.
          </p>
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
                    <span className="text-muted-foreground text-xs">
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
          {goalProgress ? goalProgress.goalProfile.name : 'Active Goal'}
        </CardTitle>
        {goalProgress?.goalProfile.description && (
          <CardDescription>
            {goalProgress.goalProfile.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!goalProgress ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Target className="text-muted-foreground h-8 w-8" />
            <p className="text-muted-foreground text-center text-sm">
              No goal assigned yet. Set one to track your progress.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/progress">Pick a goal</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {goalProgress.requirements.map((req) => (
              <div key={req.field} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{req.label}</span>
                  <span className="text-muted-foreground">
                    {formatHours(req.current)} / {formatHours(req.required)}
                  </span>
                </div>
                <div className="bg-secondary h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${Math.min(req.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  {req.percentage >= 100
                    ? 'Complete'
                    : `${req.percentage}% — ${formatHours(req.remaining)} remaining`}
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
    queryFn: () => getDashboardData(),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <DashboardSkeleton />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Failed to load dashboard data. Please try refreshing.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <SummaryCards totals={data.totals} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentFlights flights={data.recentFlights} />
        <CurrencyPanel currency={data.currency} />
        <GoalProgressPanel goalProgress={data.goalProgress} />
        <QuickActions />
      </div>
    </div>
  )
}
