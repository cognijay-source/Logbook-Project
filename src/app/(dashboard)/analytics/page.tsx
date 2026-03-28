'use client'

import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getAnalyticsData } from './actions'

const TEAL = '#10B981'
const TEAL_PALETTE = [
  '#10B981',
  '#059669',
  '#047857',
  '#34D399',
  '#6EE7B7',
  '#A7F3D0',
  '#0D9488',
  '#14B8A6',
]

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const result = await getAnalyticsData()
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold">Analytics</h1>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold">Analytics</h1>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="py-10 text-center">
            <p className="text-red-600">Failed to load analytics data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Flight trends, hours breakdown, and training patterns.
        </p>
      </div>

      {/* Flight Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Flight Trends</CardTitle>
          <CardDescription>Total hours flown per month (last 12 months)</CardDescription>
        </CardHeader>
        <CardContent>
          {data.monthlyHours.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No flight data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke={TEAL}
                  strokeWidth={2}
                  dot={{ fill: TEAL, r: 4 }}
                  name="Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hours Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Hours Breakdown</CardTitle>
            <CardDescription>Cumulative hours by category</CardDescription>
          </CardHeader>
          <CardContent>
            {data.categoryHours.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No hours recorded.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.categoryHours} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="hours" fill={TEAL} radius={[0, 4, 4, 0]} name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Aircraft Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Aircraft Distribution</CardTitle>
            <CardDescription>Hours per aircraft type</CardDescription>
          </CardHeader>
          <CardContent>
            {data.aircraftHours.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No aircraft data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.aircraftHours}
                    dataKey="hours"
                    nameKey="aircraftType"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    label={({ name, value }: { name?: string; value?: number }) =>
                      `${name ?? ''}: ${(value ?? 0).toFixed(1)}h`
                    }
                  >
                    {data.aircraftHours.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={TEAL_PALETTE[index % TEAL_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Airports Visited */}
        <Card>
          <CardHeader>
            <CardTitle>Airports Visited</CardTitle>
            <CardDescription>
              {data.uniqueAirports} unique airports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.topAirports.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No airport data.</p>
            ) : (
              <div className="space-y-2">
                {data.topAirports.map((a) => (
                  <div
                    key={a.airport}
                    className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#f5f5f7]"
                  >
                    <span className="text-sm font-medium">{a.airport}</span>
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {a.count} {a.count === 1 ? 'flight' : 'flights'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flight Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Frequency</CardTitle>
            <CardDescription>Flights per day of week</CardDescription>
          </CardHeader>
          <CardContent>
            {data.dayOfWeekFlights.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No flight data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.dayOfWeekFlights}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill={TEAL} radius={[4, 4, 0, 0]} name="Flights" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
