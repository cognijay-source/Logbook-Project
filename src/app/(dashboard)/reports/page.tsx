'use client'

import { useState } from 'react'
import { FileText, Download, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
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
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">📊 Reports</h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Generate professional PDF reports from your flight data
        </p>
      </div>

      {/* Controls */}
      <div className="card-elevated overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">Report Settings</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Choose a report type and date range to generate your report
          </p>
        </div>
        <div className="px-6 pb-6">
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
                className="flex h-10 w-full rounded-xl border border-[var(--text-primary)]/8 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[var(--accent-teal)]/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                className="rounded-xl focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal)]/20"
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
                className="rounded-xl focus:border-[var(--accent-teal)] focus:ring-[var(--accent-teal)]/20"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handlePreview} disabled={loading} className="rounded-xl bg-[var(--accent-teal)] text-white hover:bg-[var(--accent-teal-hover)]">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
                className="rounded-xl"
              >
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                PDF
              </Button>
            </div>
          </div>

          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            {reportTypes.find((rt) => rt.value === reportType)?.description}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card-elevated border-[var(--status-expired)]/20 bg-[var(--status-expired)]/5 p-6">
          <p className="text-sm text-[var(--status-expired)]">{error}</p>
        </div>
      )}

      {/* Preview */}
      {previewData && (
        <div className="card-elevated overflow-hidden">
          <div className="flex items-center gap-2 p-6 pb-4">
            <FileText className="h-5 w-5 text-[var(--accent-teal)]" />
            <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">Report Preview</h3>
          </div>
          <div className="px-6 pb-6">
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
          </div>
        </div>
      )}
    </motion.div>
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
      <div className="text-sm text-[var(--text-secondary)]">
        {data.startDate} to {data.endDate} &middot; {data.flightCount} flights
      </div>

      <div>
        <h3 className="font-heading mb-2 text-lg font-semibold text-[var(--text-primary)]">Time Totals</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--text-primary)]/6">
                <th className="py-2 text-left font-medium text-[var(--text-primary)]">Category</th>
                <th className="py-2 text-right font-medium text-[var(--text-primary)]">Hours</th>
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
                <tr key={label as string} className="border-b border-[var(--text-primary)]/6 transition-colors hover:bg-[var(--bg-primary)]">
                  <td className="py-2 text-[var(--text-primary)]">{label as string}</td>
                  <td className="py-2 text-right font-mono text-[var(--text-primary)]">{fmt(value as number)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.aircraftFlown.length > 0 && (
        <div>
          <h3 className="font-heading mb-2 text-lg font-semibold text-[var(--text-primary)]">Aircraft Flown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--text-primary)]/6">
                  <th className="py-2 text-left font-medium text-[var(--text-primary)]">Tail Number</th>
                  <th className="py-2 text-right font-medium text-[var(--text-primary)]">Hours</th>
                </tr>
              </thead>
              <tbody>
                {data.aircraftFlown.map((a) => (
                  <tr key={a.tailNumber} className="border-b border-[var(--text-primary)]/6 transition-colors hover:bg-[var(--bg-primary)]">
                    <td className="py-2 text-[var(--text-primary)]">{a.tailNumber}</td>
                    <td className="py-2 text-right font-mono text-[var(--text-primary)]">{fmt(a.hours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.airportsVisited.length > 0 && (
        <div>
          <h3 className="font-heading mb-2 text-lg font-semibold text-[var(--text-primary)]">Airports Visited</h3>
          <p className="text-sm text-[var(--text-secondary)]">
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
      <div className="text-sm text-[var(--text-secondary)]">
        {data.startDate} to {data.endDate}
      </div>

      {sections.map((section) => (
        <div key={section.label}>
          <h3 className="font-heading mb-2 text-lg font-semibold text-[var(--text-primary)]">{section.label}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--text-primary)]/6">
                  <th className="py-2 text-left font-medium text-[var(--text-primary)]">Category</th>
                  <th className="py-2 text-right font-medium text-[var(--text-primary)]">Hours / Count</th>
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
                  <tr key={label} className="border-b border-[var(--text-primary)]/6 transition-colors hover:bg-[var(--bg-primary)]">
                    <td className="py-2 text-[var(--text-primary)]">{label}</td>
                    <td className="py-2 text-right font-mono text-[var(--text-primary)]">{value}</td>
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
        <h3 className="font-heading mb-2 text-lg font-semibold text-[var(--text-primary)]">
          Total Time by Aircraft Make/Model
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--text-primary)]/6">
                <th className="py-2 text-left font-medium text-[var(--text-primary)]">Make/Model</th>
                <th className="py-2 text-right font-medium text-[var(--text-primary)]">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {data.byMakeModel.map((r) => (
                <tr key={r.makeModel} className="border-b border-[var(--text-primary)]/6 transition-colors hover:bg-[var(--bg-primary)]">
                  <td className="py-2 text-[var(--text-primary)]">{r.makeModel}</td>
                  <td className="py-2 text-right font-mono text-[var(--text-primary)]">{fmt(r.hours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-heading mb-2 text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--text-primary)]/6">
                <th className="py-2 text-left font-medium text-[var(--text-primary)]">Period</th>
                <th className="py-2 text-right font-medium text-[var(--text-primary)]">Total Hours</th>
                <th className="py-2 text-right font-medium text-[var(--text-primary)]">Night</th>
                <th className="py-2 text-right font-medium text-[var(--text-primary)]">Instrument</th>
                <th className="py-2 text-right font-medium text-[var(--text-primary)]">Landings</th>
              </tr>
            </thead>
            <tbody>
              {data.periods.map((p) => (
                <tr key={p.label} className="border-b border-[var(--text-primary)]/6 transition-colors hover:bg-[var(--bg-primary)]">
                  <td className="py-2 text-[var(--text-primary)]">{p.label}</td>
                  <td className="py-2 text-right font-mono text-[var(--text-primary)]">{fmt(p.totalTime)}</td>
                  <td className="py-2 text-right font-mono text-[var(--text-primary)]">{fmt(p.nightTime)}</td>
                  <td className="py-2 text-right font-mono text-[var(--text-primary)]">{fmt(p.instrumentTime)}</td>
                  <td className="py-2 text-right font-mono text-[var(--text-primary)]">{p.landings}</td>
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
      <div className="text-sm text-[var(--text-secondary)]">
        {data.startDate} to {data.endDate} &middot; {data.flights.length}{' '}
        flights &middot; {fmt(data.totalTime)} total hours
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--text-primary)]/6">
              <th className="py-2 text-left font-medium text-[var(--text-primary)]">Date</th>
              <th className="py-2 text-left font-medium text-[var(--text-primary)]">From</th>
              <th className="py-2 text-left font-medium text-[var(--text-primary)]">To</th>
              <th className="py-2 text-left font-medium text-[var(--text-primary)]">Aircraft</th>
              <th className="py-2 text-right font-medium text-[var(--text-primary)]">Total</th>
              <th className="py-2 text-right font-medium text-[var(--text-primary)]">PIC</th>
              <th className="py-2 text-left font-medium text-[var(--text-primary)]">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data.flights.map((f, i) => (
              <tr key={i} className="border-b border-[var(--text-primary)]/6 transition-colors hover:bg-[var(--bg-primary)]">
                <td className="py-2 text-[var(--text-primary)]">{f.date}</td>
                <td className="py-2 text-[var(--text-primary)]">{f.departure}</td>
                <td className="py-2 text-[var(--text-primary)]">{f.arrival}</td>
                <td className="py-2 text-[var(--text-primary)]">{f.aircraft}</td>
                <td className="py-2 text-right font-mono text-[var(--text-primary)]">{fmt(f.totalTime)}</td>
                <td className="py-2 text-right font-mono text-[var(--text-primary)]">{fmt(f.pic)}</td>
                <td className="max-w-[200px] truncate py-2 text-[var(--text-secondary)]">{f.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
