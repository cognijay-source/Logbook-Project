'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, desc, or, ilike, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'
import { createAuditEvent } from '@/lib/services/audit'
import { flightCreateSchema, flightUpdateSchema } from '@/lib/validators/flight'
import { aircraftCreateSchema } from '@/lib/validators/aircraft'
import { flightLegSchema } from '@/lib/validators/flight-leg'
import { flightApproachSchema } from '@/lib/validators/flight-approach'
import { flightCrewSchema } from '@/lib/validators/flight-crew'
import { z } from 'zod'
import { milestoneRecomputeTask } from '@/jobs/milestone-recompute'
import { goalProgressRefreshTask } from '@/jobs/goal-progress-refresh'
import { currencyRefreshTask } from '@/jobs/currency-refresh'

// ---------- Types ----------

export type FlightRow = typeof schema.flights.$inferSelect & {
  aircraft: { id: string; tailNumber: string; model: string | null } | null
}

export type FlightDetail = FlightRow & {
  legs: (typeof schema.flightLegs.$inferSelect)[]
  approaches: (typeof schema.flightApproaches.$inferSelect)[]
  crew: (typeof schema.flightCrew.$inferSelect)[]
}

export type AircraftOption = {
  id: string
  tailNumber: string
  model: string | null
}

// ---------- Read ----------

export async function getFlights(params?: {
  search?: string
  aircraftId?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<{
  data: FlightRow[]
  total: number
  page: number
  pageSize: number
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 50

    const conditions = [eq(schema.flights.profileId, profile.id)]

    if (params?.status && params.status !== 'all') {
      conditions.push(eq(schema.flights.status, params.status))
    }

    if (params?.aircraftId && params.aircraftId !== 'all') {
      conditions.push(eq(schema.flights.aircraftId, params.aircraftId))
    }

    if (params?.search) {
      const term = `%${params.search}%`
      conditions.push(
        or(
          ilike(schema.flights.departureAirport, term),
          ilike(schema.flights.arrivalAirport, term),
          ilike(schema.flights.route, term),
          ilike(schema.flights.remarks, term),
        )!,
      )
    }

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(schema.flights)
        .where(and(...conditions))
        .orderBy(
          desc(schema.flights.flightDate),
          desc(schema.flights.createdAt),
        )
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.flights)
        .where(and(...conditions)),
    ])

    const total = Number(countResult[0]?.count) || 0

    // Collect unique aircraft IDs for a single lookup
    const aircraftIds = [
      ...new Set(rows.map((r) => r.aircraftId).filter(Boolean)),
    ] as string[]

    let aircraftMap = new Map<
      string,
      { id: string; tailNumber: string; model: string | null }
    >()

    if (aircraftIds.length > 0) {
      const aircraftRows = await db
        .select({
          id: schema.aircraft.id,
          tailNumber: schema.aircraft.tailNumber,
          model: schema.aircraft.model,
        })
        .from(schema.aircraft)
        .where(sql`${schema.aircraft.id} IN ${aircraftIds}`)

      aircraftMap = new Map(aircraftRows.map((a) => [a.id, a]))
    }

    const data: FlightRow[] = rows.map((row) => ({
      ...row,
      aircraft: row.aircraftId
        ? (aircraftMap.get(row.aircraftId) ?? null)
        : null,
    }))

    return { data, total, page, pageSize, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 50,
      error: 'Failed to load flights',
    }
  }
}

export async function getFlight(
  id: string,
): Promise<{ data: FlightDetail | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()

    const rows = await db
      .select()
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.id, id),
          eq(schema.flights.profileId, profile.id),
        ),
      )
      .limit(1)

    if (rows.length === 0) {
      return { data: null, error: 'Flight not found' }
    }

    const flight = rows[0]

    // Fetch aircraft info
    let aircraft: FlightRow['aircraft'] = null
    if (flight.aircraftId) {
      const acRows = await db
        .select({
          id: schema.aircraft.id,
          tailNumber: schema.aircraft.tailNumber,
          model: schema.aircraft.model,
        })
        .from(schema.aircraft)
        .where(eq(schema.aircraft.id, flight.aircraftId))
        .limit(1)
      aircraft = acRows[0] ?? null
    }

    const [legs, approaches, crew] = await Promise.all([
      db
        .select()
        .from(schema.flightLegs)
        .where(eq(schema.flightLegs.flightId, id))
        .orderBy(schema.flightLegs.legOrder),
      db
        .select()
        .from(schema.flightApproaches)
        .where(eq(schema.flightApproaches.flightId, id)),
      db
        .select()
        .from(schema.flightCrew)
        .where(eq(schema.flightCrew.flightId, id)),
    ])

    return {
      data: { ...flight, aircraft, legs, approaches, crew },
      error: null,
    }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to load flight' }
  }
}

export async function getAircraftList(): Promise<{
  data: AircraftOption[]
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()

    const rows = await db
      .select({
        id: schema.aircraft.id,
        tailNumber: schema.aircraft.tailNumber,
        model: schema.aircraft.model,
      })
      .from(schema.aircraft)
      .where(
        and(
          eq(schema.aircraft.profileId, profile.id),
          eq(schema.aircraft.isActive, true),
        ),
      )
      .orderBy(schema.aircraft.tailNumber)

    return { data: rows, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: [], error: 'Failed to load aircraft' }
  }
}

// ---------- Write ----------

const createPayloadSchema = z.object({
  flight: z.unknown(),
  legs: z.array(z.unknown()).optional().default([]),
  approaches: z.array(z.unknown()).optional().default([]),
  crew: z.array(z.unknown()).optional().default([]),
})

export async function createFlight(
  data: unknown,
): Promise<{ id: string | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()

    const payload = createPayloadSchema.parse(data)
    const flightData = flightCreateSchema.parse(payload.flight)
    const legsData = payload.legs.map((l) => flightLegSchema.parse(l))
    const approachesData = payload.approaches.map((a) =>
      flightApproachSchema.parse(a),
    )
    const crewData = payload.crew.map((c) => flightCrewSchema.parse(c))

    // Convert numeric fields to strings for Drizzle numeric columns
    const toStr = (v: number | undefined) =>
      v !== undefined ? String(v) : undefined

    const inserted = await db
      .insert(schema.flights)
      .values({
        profileId: profile.id,
        aircraftId: flightData.aircraftId || null,
        flightDate: flightData.flightDate,
        departureAirport: flightData.departureAirport,
        arrivalAirport: flightData.arrivalAirport,
        route: flightData.route,
        totalTime: toStr(flightData.totalTime),
        pic: toStr(flightData.pic),
        sic: toStr(flightData.sic),
        crossCountry: toStr(flightData.crossCountry),
        night: toStr(flightData.night),
        actualInstrument: toStr(flightData.actualInstrument),
        simulatedInstrument: toStr(flightData.simulatedInstrument),
        dualReceived: toStr(flightData.dualReceived),
        dualGiven: toStr(flightData.dualGiven),
        solo: toStr(flightData.solo),
        multiEngine: toStr(flightData.multiEngine),
        turbine: toStr(flightData.turbine),
        dayLandings: flightData.dayLandings ?? 0,
        nightLandings: flightData.nightLandings ?? 0,
        nightLandingsFullStop: flightData.nightLandingsFullStop ?? 0,
        holds: flightData.holds ?? 0,
        instructorName: flightData.instructorName,
        instructorCertNumber: flightData.instructorCertNumber,
        safetyPilotName: flightData.safetyPilotName,
        operationType: flightData.operationType,
        roleType: flightData.roleType,
        remarks: flightData.remarks,
        tags: flightData.tags || null,
        status: flightData.status,
        isSoloFlight: flightData.isSoloFlight,
        isCheckride: flightData.isCheckride,
        sourceType: 'manual',
      })
      .returning({ id: schema.flights.id })

    if (!inserted[0]) {
      return { id: null, error: 'Failed to create flight record' }
    }

    const flightId = inserted[0].id

    // Insert child records
    if (legsData.length > 0) {
      await db.insert(schema.flightLegs).values(
        legsData.map((leg) => ({
          flightId,
          legOrder: leg.legOrder,
          departureAirport: leg.departureAirport,
          arrivalAirport: leg.arrivalAirport,
          departureTime: leg.departureTime
            ? new Date(leg.departureTime)
            : undefined,
          arrivalTime: leg.arrivalTime ? new Date(leg.arrivalTime) : undefined,
          totalTime: toStr(leg.totalTime),
          remarks: leg.remarks,
        })),
      )
    }

    if (approachesData.length > 0) {
      await db.insert(schema.flightApproaches).values(
        approachesData.map((approach) => ({
          flightId,
          approachType: approach.approachType,
          runway: approach.runway,
          airport: approach.airport,
          isCircleToLand: approach.isCircleToLand,
          remarks: approach.remarks,
        })),
      )
    }

    if (crewData.length > 0) {
      await db.insert(schema.flightCrew).values(
        crewData.map((member) => ({
          flightId,
          crewRole: member.crewRole,
          name: member.name,
          certificateNumber: member.certificateNumber,
          remarks: member.remarks,
        })),
      )
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'flight',
      entityId: flightId,
      action: 'create',
      changes: flightData,
    })

    // Fire-and-forget background jobs
    milestoneRecomputeTask.trigger({ profileId: profile.id }).catch(() => {})
    goalProgressRefreshTask.trigger({ profileId: profile.id }).catch(() => {})
    currencyRefreshTask.trigger({ profileId: profile.id }).catch(() => {})

    return { id: flightId, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return {
        id: null,
        error: error.errors.map((e) => e.message).join(', '),
      }
    }
    return { id: null, error: 'Failed to create flight' }
  }
}

export async function updateFlight(
  id: string,
  data: unknown,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()

    // Verify ownership
    const existing = await db
      .select({ id: schema.flights.id })
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.id, id),
          eq(schema.flights.profileId, profile.id),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: 'Flight not found' }
    }

    const payload = createPayloadSchema.parse(data)
    const flightData = flightUpdateSchema.parse(payload.flight)
    const legsData = payload.legs.map((l) => flightLegSchema.parse(l))
    const approachesData = payload.approaches.map((a) =>
      flightApproachSchema.parse(a),
    )
    const crewData = payload.crew.map((c) => flightCrewSchema.parse(c))

    const toStr = (v: number | undefined) =>
      v !== undefined ? String(v) : undefined

    await db
      .update(schema.flights)
      .set({
        aircraftId: flightData.aircraftId === '' ? null : flightData.aircraftId,
        flightDate: flightData.flightDate,
        departureAirport: flightData.departureAirport,
        arrivalAirport: flightData.arrivalAirport,
        route: flightData.route,
        totalTime: toStr(flightData.totalTime),
        pic: toStr(flightData.pic),
        sic: toStr(flightData.sic),
        crossCountry: toStr(flightData.crossCountry),
        night: toStr(flightData.night),
        actualInstrument: toStr(flightData.actualInstrument),
        simulatedInstrument: toStr(flightData.simulatedInstrument),
        dualReceived: toStr(flightData.dualReceived),
        dualGiven: toStr(flightData.dualGiven),
        solo: toStr(flightData.solo),
        multiEngine: toStr(flightData.multiEngine),
        turbine: toStr(flightData.turbine),
        dayLandings: flightData.dayLandings,
        nightLandings: flightData.nightLandings,
        nightLandingsFullStop: flightData.nightLandingsFullStop,
        holds: flightData.holds,
        instructorName: flightData.instructorName,
        instructorCertNumber: flightData.instructorCertNumber,
        safetyPilotName: flightData.safetyPilotName,
        operationType: flightData.operationType,
        roleType: flightData.roleType,
        remarks: flightData.remarks,
        tags: flightData.tags || null,
        status: flightData.status,
        isSoloFlight: flightData.isSoloFlight,
        isCheckride: flightData.isCheckride,
        updatedAt: new Date(),
      })
      .where(eq(schema.flights.id, id))

    // Replace child records: delete then re-insert
    await Promise.all([
      db.delete(schema.flightLegs).where(eq(schema.flightLegs.flightId, id)),
      db
        .delete(schema.flightApproaches)
        .where(eq(schema.flightApproaches.flightId, id)),
      db.delete(schema.flightCrew).where(eq(schema.flightCrew.flightId, id)),
    ])

    if (legsData.length > 0) {
      await db.insert(schema.flightLegs).values(
        legsData.map((leg) => ({
          flightId: id,
          legOrder: leg.legOrder,
          departureAirport: leg.departureAirport,
          arrivalAirport: leg.arrivalAirport,
          departureTime: leg.departureTime
            ? new Date(leg.departureTime)
            : undefined,
          arrivalTime: leg.arrivalTime ? new Date(leg.arrivalTime) : undefined,
          totalTime: toStr(leg.totalTime),
          remarks: leg.remarks,
        })),
      )
    }

    if (approachesData.length > 0) {
      await db.insert(schema.flightApproaches).values(
        approachesData.map((approach) => ({
          flightId: id,
          approachType: approach.approachType,
          runway: approach.runway,
          airport: approach.airport,
          isCircleToLand: approach.isCircleToLand,
          remarks: approach.remarks,
        })),
      )
    }

    if (crewData.length > 0) {
      await db.insert(schema.flightCrew).values(
        crewData.map((member) => ({
          flightId: id,
          crewRole: member.crewRole,
          name: member.name,
          certificateNumber: member.certificateNumber,
          remarks: member.remarks,
        })),
      )
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'flight',
      entityId: id,
      action: 'update',
      changes: flightData,
    })

    // Fire-and-forget background jobs
    milestoneRecomputeTask.trigger({ profileId: profile.id }).catch(() => {})
    goalProgressRefreshTask.trigger({ profileId: profile.id }).catch(() => {})
    currencyRefreshTask.trigger({ profileId: profile.id }).catch(() => {})

    return { success: true, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      }
    }
    return { success: false, error: 'Failed to update flight' }
  }
}

// ---------- Export ----------

export async function exportFlightsCsv(): Promise<{
  data: string | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()

    const rows = await db
      .select({
        flightDate: schema.flights.flightDate,
        tailNumber: schema.aircraft.tailNumber,
        manufacturer: schema.aircraft.manufacturer,
        model: schema.aircraft.model,
        departureAirport: schema.flights.departureAirport,
        arrivalAirport: schema.flights.arrivalAirport,
        route: schema.flights.route,
        totalTime: schema.flights.totalTime,
        pic: schema.flights.pic,
        sic: schema.flights.sic,
        dualReceived: schema.flights.dualReceived,
        dualGiven: schema.flights.dualGiven,
        solo: schema.flights.solo,
        crossCountry: schema.flights.crossCountry,
        night: schema.flights.night,
        actualInstrument: schema.flights.actualInstrument,
        simulatedInstrument: schema.flights.simulatedInstrument,
        multiEngine: schema.flights.multiEngine,
        dayLandings: schema.flights.dayLandings,
        nightLandings: schema.flights.nightLandings,
        holds: schema.flights.holds,
        instructorName: schema.flights.instructorName,
        instructorCertNumber: schema.flights.instructorCertNumber,
        safetyPilotName: schema.flights.safetyPilotName,
        operationType: schema.flights.operationType,
        roleType: schema.flights.roleType,
        remarks: schema.flights.remarks,
        tags: schema.flights.tags,
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
      .orderBy(desc(schema.flights.flightDate))

    const headers = [
      'Date',
      'AircraftID',
      'Make/Model',
      'Route From',
      'Route To',
      'Route',
      'TotalTime',
      'PIC',
      'SIC',
      'DualReceived',
      'DualGiven',
      'Solo',
      'CrossCountry',
      'Night',
      'ActualInstrument',
      'SimulatedInstrument',
      'MultiEngine',
      'DayLandings',
      'NightLandings',
      'Holds',
      'InstructorName',
      'InstructorCert',
      'SafetyPilot',
      'OperationType',
      'Role',
      'Remarks',
      'Tags',
    ]

    const escCsv = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return ''
      const s = String(val)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    const csvLines = [headers.join(',')]
    for (const r of rows) {
      const makeModel = [r.manufacturer, r.model].filter(Boolean).join(' ')
      csvLines.push(
        [
          escCsv(r.flightDate),
          escCsv(r.tailNumber),
          escCsv(makeModel),
          escCsv(r.departureAirport),
          escCsv(r.arrivalAirport),
          escCsv(r.route),
          escCsv(r.totalTime),
          escCsv(r.pic),
          escCsv(r.sic),
          escCsv(r.dualReceived),
          escCsv(r.dualGiven),
          escCsv(r.solo),
          escCsv(r.crossCountry),
          escCsv(r.night),
          escCsv(r.actualInstrument),
          escCsv(r.simulatedInstrument),
          escCsv(r.multiEngine),
          escCsv(r.dayLandings),
          escCsv(r.nightLandings),
          escCsv(r.holds),
          escCsv(r.instructorName),
          escCsv(r.instructorCertNumber),
          escCsv(r.safetyPilotName),
          escCsv(r.operationType),
          escCsv(r.roleType),
          escCsv(r.remarks),
          escCsv(r.tags),
        ].join(','),
      )
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'flight',
      entityId: profile.id,
      action: 'export',
      changes: { format: 'csv', count: rows.length },
    })

    return { data: csvLines.join('\n'), error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { data: null, error: 'Failed to export flights' }
  }
}

export async function deleteFlight(
  id: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()

    const deleted = await db
      .delete(schema.flights)
      .where(
        and(
          eq(schema.flights.id, id),
          eq(schema.flights.profileId, profile.id),
        ),
      )
      .returning({ id: schema.flights.id })

    if (deleted.length === 0) {
      return { success: false, error: 'Flight not found' }
    }

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'flight',
      entityId: id,
      action: 'delete',
    })

    // Fire-and-forget background jobs
    milestoneRecomputeTask.trigger({ profileId: profile.id }).catch(() => {})
    goalProgressRefreshTask.trigger({ profileId: profile.id }).catch(() => {})
    currencyRefreshTask.trigger({ profileId: profile.id }).catch(() => {})

    return { success: true, error: null }
  } catch (error) {
    Sentry.captureException(error)
    return { success: false, error: 'Failed to delete flight' }
  }
}

// ---------- Quick Create Aircraft (inline from flight form) ----------

export async function quickCreateAircraft(
  formData: FormData,
): Promise<{ data: AircraftOption | null; error: string | null }> {
  try {
    const profile = await getOrCreateProfile()

    const raw = {
      tailNumber: formData.get('tailNumber') as string,
      manufacturer: formData.get('manufacturer') as string,
      model: formData.get('model') as string,
    }

    const validated = aircraftCreateSchema.parse(raw)

    const [aircraft] = await db
      .insert(schema.aircraft)
      .values({
        ...validated,
        profileId: profile.id,
      })
      .returning({
        id: schema.aircraft.id,
        tailNumber: schema.aircraft.tailNumber,
        model: schema.aircraft.model,
      })

    await createAuditEvent({
      profileId: profile.id,
      entityType: 'aircraft',
      entityId: aircraft.id,
      action: 'create',
    })

    return { data: aircraft, error: null }
  } catch (error) {
    Sentry.captureException(error)
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors[0]?.message ?? 'Validation failed' }
    }
    return { data: null, error: 'Failed to create aircraft' }
  }
}
