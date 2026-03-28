'use server'

import * as Sentry from '@sentry/nextjs'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { z } from 'zod'

// ---------- Validation ----------

const reportTypeEnum = z.enum([
  'flight-summary',
  '8710-time',
  'insurance',
  'custom-range',
])

const reportParamsSchema = z.object({
  type: reportTypeEnum,
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)'),
})

// ---------- Types ----------

export type ReportType = z.infer<typeof reportTypeEnum>

export interface FlightSummaryData {
  type: 'flight-summary'
  startDate: string
  endDate: string
  totals: {
    totalTime: number
    pic: number
    sic: number
    dualReceived: number
    crossCountry: number
    night: number
    actualInstrument: number
    simulatedInstrument: number
    multiEngine: number
    singleEngine: number
  }
  flightCount: number
  aircraftFlown: { tailNumber: string; hours: number }[]
  airportsVisited: string[]
}

export interface EightSevenTenData {
  type: '8710-time'
  startDate: string
  endDate: string
  asel: CategoryTotals
  amel: CategoryTotals
  allAircraft: CategoryTotals
}

interface CategoryTotals {
  totalTime: number
  pic: number
  sic: number
  crossCountry: number
  night: number
  actualInstrument: number
  simulatedInstrument: number
  dayLandings: number
  nightLandings: number
}

export interface InsuranceData {
  type: 'insurance'
  byMakeModel: { makeModel: string; hours: number }[]
  periods: {
    label: string
    totalTime: number
    nightTime: number
    instrumentTime: number
    landings: number
  }[]
}

export interface CustomRangeData {
  type: 'custom-range'
  startDate: string
  endDate: string
  flights: {
    date: string
    departure: string
    arrival: string
    aircraft: string
    totalTime: number
    pic: number
    remarks: string
  }[]
  totalTime: number
}

export type ReportData =
  | FlightSummaryData
  | EightSevenTenData
  | InsuranceData
  | CustomRangeData

// ---------- Helpers ----------

function num(v: string | null | undefined): number {
  if (!v) return 0
  const n = parseFloat(v)
  return isNaN(n) ? 0 : n
}

function fmt(n: number): string {
  return n.toFixed(1)
}

// ---------- Data fetchers ----------

async function fetchFlightsInRange(
  profileId: string,
  startDate: string,
  endDate: string,
) {
  return db
    .select({
      id: schema.flights.id,
      flightDate: schema.flights.flightDate,
      departureAirport: schema.flights.departureAirport,
      arrivalAirport: schema.flights.arrivalAirport,
      totalTime: schema.flights.totalTime,
      pic: schema.flights.pic,
      sic: schema.flights.sic,
      dualReceived: schema.flights.dualReceived,
      crossCountry: schema.flights.crossCountry,
      night: schema.flights.night,
      actualInstrument: schema.flights.actualInstrument,
      simulatedInstrument: schema.flights.simulatedInstrument,
      multiEngine: schema.flights.multiEngine,
      dayLandings: schema.flights.dayLandings,
      nightLandings: schema.flights.nightLandings,
      remarks: schema.flights.remarks,
      aircraftId: schema.flights.aircraftId,
      tailNumber: schema.aircraft.tailNumber,
      manufacturer: schema.aircraft.manufacturer,
      model: schema.aircraft.model,
      isMultiEngine: schema.aircraft.isMultiEngine,
    })
    .from(schema.flights)
    .leftJoin(
      schema.aircraft,
      eq(schema.flights.aircraftId, schema.aircraft.id),
    )
    .where(
      and(
        eq(schema.flights.profileId, profileId),
        eq(schema.flights.status, 'final'),
        gte(schema.flights.flightDate, startDate),
        lte(schema.flights.flightDate, endDate),
      ),
    )
    .orderBy(schema.flights.flightDate)
}

type FlightRow = Awaited<ReturnType<typeof fetchFlightsInRange>>[number]

function buildCategoryTotals(rows: FlightRow[]): CategoryTotals {
  return rows.reduce<CategoryTotals>(
    (acc, r) => ({
      totalTime: acc.totalTime + num(r.totalTime),
      pic: acc.pic + num(r.pic),
      sic: acc.sic + num(r.sic),
      crossCountry: acc.crossCountry + num(r.crossCountry),
      night: acc.night + num(r.night),
      actualInstrument: acc.actualInstrument + num(r.actualInstrument),
      simulatedInstrument: acc.simulatedInstrument + num(r.simulatedInstrument),
      dayLandings: acc.dayLandings + (r.dayLandings ?? 0),
      nightLandings: acc.nightLandings + (r.nightLandings ?? 0),
    }),
    {
      totalTime: 0,
      pic: 0,
      sic: 0,
      crossCountry: 0,
      night: 0,
      actualInstrument: 0,
      simulatedInstrument: 0,
      dayLandings: 0,
      nightLandings: 0,
    },
  )
}

// ---------- Public actions ----------

export async function getReportData(
  type: ReportType,
  startDate: string,
  endDate: string,
): Promise<{ data: ReportData | null; error: string | null }> {
  try {
    const params = reportParamsSchema.safeParse({ type, startDate, endDate })
    if (!params.success) {
      return {
        data: null,
        error: params.error.errors.map((e) => e.message).join(', '),
      }
    }

    const profile = await getOrCreateProfile()

    if (type === 'flight-summary') {
      const rows = await fetchFlightsInRange(profile.id, startDate, endDate)

      const totals = {
        totalTime: 0,
        pic: 0,
        sic: 0,
        dualReceived: 0,
        crossCountry: 0,
        night: 0,
        actualInstrument: 0,
        simulatedInstrument: 0,
        multiEngine: 0,
        singleEngine: 0,
      }

      const aircraftMap = new Map<string, number>()
      const airports = new Set<string>()

      for (const r of rows) {
        totals.totalTime += num(r.totalTime)
        totals.pic += num(r.pic)
        totals.sic += num(r.sic)
        totals.dualReceived += num(r.dualReceived)
        totals.crossCountry += num(r.crossCountry)
        totals.night += num(r.night)
        totals.actualInstrument += num(r.actualInstrument)
        totals.simulatedInstrument += num(r.simulatedInstrument)
        totals.multiEngine += num(r.multiEngine)

        const tt = num(r.totalTime)
        const me = num(r.multiEngine)
        totals.singleEngine += tt - me

        const tail = r.tailNumber ?? 'Unknown'
        aircraftMap.set(tail, (aircraftMap.get(tail) ?? 0) + tt)

        if (r.departureAirport) airports.add(r.departureAirport.toUpperCase())
        if (r.arrivalAirport) airports.add(r.arrivalAirport.toUpperCase())
      }

      const data: FlightSummaryData = {
        type: 'flight-summary',
        startDate,
        endDate,
        totals,
        flightCount: rows.length,
        aircraftFlown: Array.from(aircraftMap.entries())
          .map(([tailNumber, hours]) => ({ tailNumber, hours }))
          .sort((a, b) => b.hours - a.hours),
        airportsVisited: Array.from(airports).sort(),
      }
      return { data, error: null }
    }

    if (type === '8710-time') {
      const rows = await fetchFlightsInRange(profile.id, startDate, endDate)

      const aselRows = rows.filter((r) => !r.isMultiEngine)
      const amelRows = rows.filter((r) => r.isMultiEngine)

      const data: EightSevenTenData = {
        type: '8710-time',
        startDate,
        endDate,
        asel: buildCategoryTotals(aselRows),
        amel: buildCategoryTotals(amelRows),
        allAircraft: buildCategoryTotals(rows),
      }
      return { data, error: null }
    }

    if (type === 'insurance') {
      // Fetch all flights (no date filter) grouped by make/model
      const allFlights = await db
        .select({
          totalTime: sql<string>`coalesce(sum(${schema.flights.totalTime}::numeric), 0)`,
          makeModel: sql<string>`coalesce(${schema.aircraft.manufacturer} || ' ' || ${schema.aircraft.model}, 'Unknown')`,
        })
        .from(schema.flights)
        .leftJoin(
          schema.aircraft,
          eq(schema.flights.aircraftId, schema.aircraft.id),
        )
        .where(
          and(
            eq(schema.flights.profileId, profile.id),
            eq(schema.flights.status, 'final'),
          ),
        )
        .groupBy(schema.aircraft.manufacturer, schema.aircraft.model)

      const byMakeModel = allFlights
        .map((r) => ({
          makeModel: r.makeModel,
          hours: num(r.totalTime),
        }))
        .sort((a, b) => b.hours - a.hours)

      // Period calculations
      const now = new Date()
      const periodsConfig = [
        { label: 'Last 30 Days', days: 30 },
        { label: 'Last 60 Days', days: 60 },
        { label: 'Last 90 Days', days: 90 },
        { label: 'Last 12 Months', days: 365 },
      ]

      const periods = await Promise.all(
        periodsConfig.map(async ({ label, days }) => {
          const cutoff = new Date(now)
          cutoff.setDate(cutoff.getDate() - days)
          const cutoffStr = cutoff.toISOString().split('T')[0]
          const todayStr = now.toISOString().split('T')[0]

          const periodRows = await fetchFlightsInRange(
            profile.id,
            cutoffStr,
            todayStr,
          )

          return {
            label,
            totalTime: periodRows.reduce((s, r) => s + num(r.totalTime), 0),
            nightTime: periodRows.reduce((s, r) => s + num(r.night), 0),
            instrumentTime: periodRows.reduce(
              (s, r) =>
                s + num(r.actualInstrument) + num(r.simulatedInstrument),
              0,
            ),
            landings: periodRows.reduce(
              (s, r) => s + (r.dayLandings ?? 0) + (r.nightLandings ?? 0),
              0,
            ),
          }
        }),
      )

      const data: InsuranceData = {
        type: 'insurance',
        byMakeModel,
        periods,
      }
      return { data, error: null }
    }

    if (type === 'custom-range') {
      const rows = await fetchFlightsInRange(profile.id, startDate, endDate)

      const flights = rows.map((r) => ({
        date: r.flightDate,
        departure: r.departureAirport ?? '',
        arrival: r.arrivalAirport ?? '',
        aircraft: r.tailNumber ?? 'Unknown',
        totalTime: num(r.totalTime),
        pic: num(r.pic),
        remarks: r.remarks ?? '',
      }))

      const data: CustomRangeData = {
        type: 'custom-range',
        startDate,
        endDate,
        flights,
        totalTime: flights.reduce((s, f) => s + f.totalTime, 0),
      }
      return { data, error: null }
    }

    return { data: null, error: 'Invalid report type' }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error ? error.message : 'Failed to fetch report data',
    }
  }
}

export async function generatePdf(
  type: ReportType,
  startDate: string,
  endDate: string,
): Promise<{ data: number[] | null; error: string | null }> {
  try {
    const params = reportParamsSchema.safeParse({ type, startDate, endDate })
    if (!params.success) {
      return {
        data: null,
        error: params.error.errors.map((e) => e.message).join(', '),
      }
    }

    const profile = await getOrCreateProfile()
    const result = await getReportData(type, startDate, endDate)
    if (result.error || !result.data) {
      return { data: null, error: result.error ?? 'No data' }
    }

    const reportData = result.data
    const userName = profile.displayName || profile.email || 'Pilot'

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // ---------- Header ----------
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('CrossCheck Flight Report', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const typeLabels: Record<ReportType, string> = {
      'flight-summary': 'Flight Summary',
      '8710-time': '8710 Time Summary',
      insurance: 'Insurance Report',
      'custom-range': 'Custom Date Range',
    }
    doc.text(typeLabels[type], pageWidth / 2, 28, { align: 'center' })

    doc.setFontSize(10)
    doc.text(`Pilot: ${userName}`, 14, 38)
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      14,
      44,
    )

    if ('startDate' in reportData && 'endDate' in reportData) {
      doc.text(
        `Date Range: ${reportData.startDate} to ${reportData.endDate}`,
        14,
        50,
      )
    }

    let cursorY = 58

    // ---------- Flight Summary ----------
    if (reportData.type === 'flight-summary') {
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('Time Totals', 14, cursorY)
      cursorY += 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Category', 'Hours']],
        body: [
          ['Total Time', fmt(reportData.totals.totalTime)],
          ['PIC', fmt(reportData.totals.pic)],
          ['SIC', fmt(reportData.totals.sic)],
          ['Dual Received', fmt(reportData.totals.dualReceived)],
          ['Cross-Country', fmt(reportData.totals.crossCountry)],
          ['Night', fmt(reportData.totals.night)],
          ['Instrument (Actual)', fmt(reportData.totals.actualInstrument)],
          [
            'Instrument (Simulated)',
            fmt(reportData.totals.simulatedInstrument),
          ],
          ['Multi-Engine', fmt(reportData.totals.multiEngine)],
          ['Single-Engine', fmt(reportData.totals.singleEngine)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 65, 122] },
        styles: { fontSize: 10 },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cursorY = (doc as any).lastAutoTable.finalY + 10

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Total Flights: ${reportData.flightCount}`, 14, cursorY)
      cursorY += 8

      if (reportData.aircraftFlown.length > 0) {
        doc.setFontSize(13)
        doc.text('Aircraft Flown', 14, cursorY)
        cursorY += 4

        autoTable(doc, {
          startY: cursorY,
          head: [['Tail Number', 'Hours']],
          body: reportData.aircraftFlown.map((a) => [
            a.tailNumber,
            fmt(a.hours),
          ]),
          theme: 'grid',
          headStyles: { fillColor: [41, 65, 122] },
          styles: { fontSize: 10 },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cursorY = (doc as any).lastAutoTable.finalY + 10
      }

      if (reportData.airportsVisited.length > 0) {
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text('Airports Visited', 14, cursorY)
        cursorY += 6
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(reportData.airportsVisited.join(', '), 14, cursorY, {
          maxWidth: pageWidth - 28,
        })
      }
    }

    // ---------- 8710 Time Summary ----------
    if (reportData.type === '8710-time') {
      const sections: { label: string; data: CategoryTotals }[] = [
        { label: 'Airplane Single-Engine Land (ASEL)', data: reportData.asel },
        { label: 'Airplane Multi-Engine Land (AMEL)', data: reportData.amel },
        { label: 'Total All Aircraft', data: reportData.allAircraft },
      ]

      for (const section of sections) {
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text(section.label, 14, cursorY)
        cursorY += 4

        autoTable(doc, {
          startY: cursorY,
          head: [['Category', 'Hours / Count']],
          body: [
            ['Total Time', fmt(section.data.totalTime)],
            ['PIC', fmt(section.data.pic)],
            ['SIC', fmt(section.data.sic)],
            ['Cross-Country', fmt(section.data.crossCountry)],
            ['Night', fmt(section.data.night)],
            ['Instrument (Actual)', fmt(section.data.actualInstrument)],
            ['Instrument (Simulated)', fmt(section.data.simulatedInstrument)],
            ['Day Landings', String(section.data.dayLandings)],
            ['Night Landings', String(section.data.nightLandings)],
          ],
          theme: 'grid',
          headStyles: { fillColor: [41, 65, 122] },
          styles: { fontSize: 10 },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cursorY = (doc as any).lastAutoTable.finalY + 10

        if (cursorY > 250) {
          doc.addPage()
          cursorY = 20
        }
      }
    }

    // ---------- Insurance Report ----------
    if (reportData.type === 'insurance') {
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('Total Time by Aircraft Make/Model', 14, cursorY)
      cursorY += 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Make/Model', 'Total Hours']],
        body: reportData.byMakeModel.map((r) => [r.makeModel, fmt(r.hours)]),
        theme: 'grid',
        headStyles: { fillColor: [41, 65, 122] },
        styles: { fontSize: 10 },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cursorY = (doc as any).lastAutoTable.finalY + 10

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('Recent Activity', 14, cursorY)
      cursorY += 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Period', 'Total Hours', 'Night', 'Instrument', 'Landings']],
        body: reportData.periods.map((p) => [
          p.label,
          fmt(p.totalTime),
          fmt(p.nightTime),
          fmt(p.instrumentTime),
          String(p.landings),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 65, 122] },
        styles: { fontSize: 10 },
      })
    }

    // ---------- Custom Date Range ----------
    if (reportData.type === 'custom-range') {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(
        `Total Flights: ${reportData.flights.length}  |  Total Time: ${fmt(reportData.totalTime)}`,
        14,
        cursorY,
      )
      cursorY += 8

      autoTable(doc, {
        startY: cursorY,
        head: [['Date', 'From', 'To', 'Aircraft', 'Total', 'PIC', 'Remarks']],
        body: reportData.flights.map((f) => [
          f.date,
          f.departure,
          f.arrival,
          f.aircraft,
          fmt(f.totalTime),
          fmt(f.pic),
          f.remarks.length > 40 ? f.remarks.slice(0, 40) + '...' : f.remarks,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 65, 122] },
        styles: { fontSize: 8 },
        columnStyles: {
          6: { cellWidth: 50 },
        },
      })
    }

    // ---------- Footer with page numbers and disclaimers ----------
    const pageCount = doc.getNumberOfPages()
    const pageHeight = doc.internal.pageSize.getHeight()

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(128, 128, 128)

      // Reference-only disclaimer on every page
      doc.text(
        'Generated by CrossCheck for personal reference. Not official FAA documentation.',
        pageWidth / 2,
        pageHeight - 16,
        { align: 'center' },
      )

      // 8710 reports get the additional specific disclaimer
      if (type === '8710-time') {
        doc.setFontSize(7)
        doc.text(
          'This document is NOT FAA Form 8710-1 and should not be submitted to the FAA. Verify all totals against your official logbook records.',
          pageWidth / 2,
          pageHeight - 12,
          { align: 'center' },
        )
      }

      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 7,
        { align: 'center' },
      )

      doc.setTextColor(0, 0, 0)
    }

    // Return as number array (serializable over server action boundary)
    const arrayBuffer = doc.output('arraybuffer')
    const data = Array.from(new Uint8Array(arrayBuffer))

    return { data, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to generate PDF',
    }
  }
}
