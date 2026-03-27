'use client'

import { useQuery } from '@tanstack/react-query'
import { getAnalyticsData } from './actions'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-totals'],
    queryFn: () => getAnalyticsData(),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Flight time trends and insights
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                <div className="bg-muted mt-2 h-8 w-16 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totals = data?.data

  if (error || data?.error || !totals) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Flight time trends and insights
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">
              No flight data available yet. Log your first flight to see analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = [
    { label: 'Total Time', value: totals.totalTime },
    { label: 'PIC', value: totals.pic },
    { label: 'SIC', value: totals.sic },
    { label: 'Cross-Country', value: totals.crossCountry },
    { label: 'Night', value: totals.night },
    { label: 'Actual Instrument', value: totals.actualInstrument },
    { label: 'Simulated Instrument', value: totals.simulatedInstrument },
    { label: 'Dual Received', value: totals.dualReceived },
    { label: 'Dual Given', value: totals.dualGiven },
    { label: 'Solo', value: totals.solo },
    { label: 'Multi-Engine', value: totals.multiEngine },
    { label: 'Turbine', value: totals.turbine },
    { label: 'Day Landings', value: totals.dayLandings },
    { label: 'Night Landings', value: totals.nightLandings },
    { label: 'Holds', value: totals.holds },
    { label: 'Total Flights', value: totals.totalFlights },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Flight time trends and insights
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">
                {Number.isInteger(stat.value)
                  ? stat.value
                  : stat.value.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
