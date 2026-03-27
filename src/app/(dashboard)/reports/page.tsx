'use client'

import { useState } from 'react'
import { FileText, Download, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageTransition } from '@/components/dashboard/page-transition'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  getReportData,
  generatePdf,
  type ReportType,
  type ReportData,
} from './actions'

const reportTypes: { value: ReportType; label: string; description: string }[] =
  [
    {
      value: 'flight-summary',
      label: 'Flight Summary',
      description: 'Total hours by category for a date range',
    },
    {
      value: '8710-time',
      label: '8710 Time Summary',
      description: 'Formatted to match FAA Form 8710 time categories',
    },
    {
      value: 'insurance',
      label: 'Insurance Report',
      description: 'Hours by aircraft type with recent time totals',
    },
    {
      value: 'custom-range',
      label: 'Custom Date Range',
      description: 'All flights in a date range with details',
    },
  ]

function getDefaultDateRange() {
  const end = new Date()
  const start = new Date()
  start.setFullYear(start.getFullYear() - 1)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

function fmt(n: number): string {
  return n.toFixed(1)
}

export default function ReportsPage() {
  const defaults = getDefaultDateRange()
  const [reportType, setReportType] = useState<ReportType>('flight-summary')
  const [startDate, setStartDate] = useState(defaults.startDate)
  const [endDate, setEndDate] = useState(defaults.endDate)
  const [previewData, setPreviewData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePreview() {
    setLoading(true)
    setError(null)
    setPreviewData(null)
    try {
      const result = await getReportData(reportType, startDate, endDate)
      if (result.error) {
        setError(result.error)
      } else {
        setPreviewData(result.data)
      }
    } catch {
      setError('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    setDownloading(true)
    setError(null)
    try {
      const result = await generatePdf(reportType, startDate, endDate)
      if (result.error || !result.data) {
        setError(result.error ?? 'Failed to generate PDF')
        return
      }

      const bytes = new Uint8Array(result.data)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `crosscheck-${reportType}-${startDate}-to-${endDate}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setError('Failed to download PDF')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <PageTransition>
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-[32px]">📊 Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate professional PDF reports from your flight data
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
          <CardDescription>
            Choose a report type and date range to generate your report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <select
                id="report-type"
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value as ReportType)
                  setPreviewData(null)
                }}
                className="border-input bg-background focus:border-ring focus:ring-ring/20 flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reportTypes.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPreviewData(null)
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPreviewData(null)
                }}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handlePreview} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                Generate Preview
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground mt-3 text-sm">
            {reportTypes.find((rt) => rt.value === reportType)?.description}
          </p>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previewData.type === 'flight-summary' && (
              <FlightSummaryPreview data={previewData} />
            )}
            {previewData.type === '8710-time' && (
              <EightSevenTenPreview data={previewData} />
            )}
            {previewData.type === 'insurance' && (
              <InsurancePreview data={previewData} />
            )}
            {previewData.type === 'custom-range' && (
              <CustomRangePreview data={previewData} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </PageTransition>
  )
}

// ---------- Preview Components ----------

function FlightSummaryPreview({
  data,
}: {
  data: Extract<ReportData, { type: 'flight-summary' }>
}) {
  return (
    <div className="space-y-6">
      <div className="text-muted-foreground text-sm">
        {data.startDate} to {data.endDate} &middot; {data.flightCount} flights
      </div>

      <div>
        <h3 className="mb-2 text-lg font-semibold">Time Totals</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium">Category</th>
                <th className="py-2 text-right font-medium">Hours</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Total Time', data.totals.totalTime],
                ['PIC', data.totals.pic],
                ['SIC', data.totals.sic],
                ['Dual Received', data.totals.dualReceived],
                ['Cross-Country', data.totals.crossCountry],
                ['Night', data.totals.night],
                ['Instrument (Actual)', data.totals.actualInstrument],
                ['Instrument (Simulated)', data.totals.simulatedInstrument],
                ['Multi-Engine', data.totals.multiEngine],
                ['Single-Engine', data.totals.singleEngine],
              ].map(([label, value]) => (
                <tr key={label as string} className="border-b">
                  <td className="py-2">{label as string}</td>
                  <td className="py-2 text-right">{fmt(value as number)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.aircraftFlown.length > 0 && (
        <div>
          <h3 className="mb-2 text-lg font-semibold">Aircraft Flown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Tail Number</th>
                  <th className="py-2 text-right font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {data.aircraftFlown.map((a) => (
                  <tr key={a.tailNumber} className="border-b">
                    <td className="py-2">{a.tailNumber}</td>
                    <td className="py-2 text-right">{fmt(a.hours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.airportsVisited.length > 0 && (
        <div>
          <h3 className="mb-2 text-lg font-semibold">Airports Visited</h3>
          <p className="text-muted-foreground text-sm">
            {data.airportsVisited.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}

function EightSevenTenPreview({
  data,
}: {
  data: Extract<ReportData, { type: '8710-time' }>
}) {
  const sections = [
    { label: 'Airplane Single-Engine Land (ASEL)', totals: data.asel },
    { label: 'Airplane Multi-Engine Land (AMEL)', totals: data.amel },
    { label: 'Total All Aircraft', totals: data.allAircraft },
  ]

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground text-sm">
        {data.startDate} to {data.endDate}
      </div>

      {sections.map((section) => (
        <div key={section.label}>
          <h3 className="mb-2 text-lg font-semibold">{section.label}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Category</th>
                  <th className="py-2 text-right font-medium">Hours / Count</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Total Time', fmt(section.totals.totalTime)],
                  ['PIC', fmt(section.totals.pic)],
                  ['SIC', fmt(section.totals.sic)],
                  ['Cross-Country', fmt(section.totals.crossCountry)],
                  ['Night', fmt(section.totals.night)],
                  ['Instrument (Actual)', fmt(section.totals.actualInstrument)],
                  [
                    'Instrument (Simulated)',
                    fmt(section.totals.simulatedInstrument),
                  ],
                  ['Day Landings', String(section.totals.dayLandings)],
                  ['Night Landings', String(section.totals.nightLandings)],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b">
                    <td className="py-2">{label}</td>
                    <td className="py-2 text-right">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

function InsurancePreview({
  data,
}: {
  data: Extract<ReportData, { type: 'insurance' }>
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">
          Total Time by Aircraft Make/Model
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium">Make/Model</th>
                <th className="py-2 text-right font-medium">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {data.byMakeModel.map((r) => (
                <tr key={r.makeModel} className="border-b">
                  <td className="py-2">{r.makeModel}</td>
                  <td className="py-2 text-right">{fmt(r.hours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-semibold">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium">Period</th>
                <th className="py-2 text-right font-medium">Total Hours</th>
                <th className="py-2 text-right font-medium">Night</th>
                <th className="py-2 text-right font-medium">Instrument</th>
                <th className="py-2 text-right font-medium">Landings</th>
              </tr>
            </thead>
            <tbody>
              {data.periods.map((p) => (
                <tr key={p.label} className="border-b">
                  <td className="py-2">{p.label}</td>
                  <td className="py-2 text-right">{fmt(p.totalTime)}</td>
                  <td className="py-2 text-right">{fmt(p.nightTime)}</td>
                  <td className="py-2 text-right">{fmt(p.instrumentTime)}</td>
                  <td className="py-2 text-right">{p.landings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CustomRangePreview({
  data,
}: {
  data: Extract<ReportData, { type: 'custom-range' }>
}) {
  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">
        {data.startDate} to {data.endDate} &middot; {data.flights.length}{' '}
        flights &middot; {fmt(data.totalTime)} total hours
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left font-medium">Date</th>
              <th className="py-2 text-left font-medium">From</th>
              <th className="py-2 text-left font-medium">To</th>
              <th className="py-2 text-left font-medium">Aircraft</th>
              <th className="py-2 text-right font-medium">Total</th>
              <th className="py-2 text-right font-medium">PIC</th>
              <th className="py-2 text-left font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data.flights.map((f, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{f.date}</td>
                <td className="py-2">{f.departure}</td>
                <td className="py-2">{f.arrival}</td>
                <td className="py-2">{f.aircraft}</td>
                <td className="py-2 text-right">{fmt(f.totalTime)}</td>
                <td className="py-2 text-right">{fmt(f.pic)}</td>
                <td className="max-w-[200px] truncate py-2">{f.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
