'use server'

import * as Sentry from '@sentry/nextjs'
import { eq, and, sql, desc, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { getOrCreateProfile } from '@/lib/services/profile'

export type MonthlyHours = { month: string; hours: number }
export type CategoryHours = { category: string; hours: number }
export type AircraftHours = { aircraftType: string; hours: number }
export type AirportVisit = { airport: string; count: number }
export type DayOfWeekFlights = { day: string; count: number }

export type AnalyticsData = {
  monthlyHours: MonthlyHours[]
  categoryHours: CategoryHours[]
  aircraftHours: AircraftHours[]
  uniqueAirports: number
  topAirports: AirportVisit[]
  dayOfWeekFlights: DayOfWeekFlights[]
}

export async function getAnalyticsData(): Promise<{
  data: AnalyticsData | null
  error: string | null
}> {
  try {
    const profile = await getOrCreateProfile()
    const profileId = profile.id

    // Last 12 months date boundary
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    const cutoffDate = twelveMonthsAgo.toISOString().split('T')[0]

    const baseWhere = and(
      eq(schema.flights.profileId, profileId),
      eq(schema.flights.status, 'final'),
    )

    const [
      monthlyRaw,
      categoryRaw,
      aircraftRaw,
      airportRaw,
      dayOfWeekRaw,
    ] = await Promise.all([
      // Monthly hours (last 12 months)
      db
        .select({
          month: sql<string>`to_char(${schema.flights.flightDate}::date, 'YYYY-MM')`,
          hours: sql<number>`coalesce(sum(${schema.flights.totalTime}::numeric), 0)`,
        })
        .from(schema.flights)
        .where(and(baseWhere, gte(schema.flights.flightDate, cutoffDate)))
        .groupBy(sql`to_char(${schema.flights.flightDate}::date, 'YYYY-MM')`)
        .orderBy(sql`to_char(${schema.flights.flightDate}::date, 'YYYY-MM')`),

      // Category hours (all time)
      db
        .select({
          pic: sql<number>`coalesce(sum(${schema.flights.pic}::numeric), 0)`,
          sic: sql<number>`coalesce(sum(${schema.flights.sic}::numeric), 0)`,
          crossCountry: sql<number>`coalesce(sum(${schema.flights.crossCountry}::numeric), 0)`,
          night: sql<number>`coalesce(sum(${schema.flights.night}::numeric), 0)`,
          actualInstrument: sql<number>`coalesce(sum(${schema.flights.actualInstrument}::numeric), 0)`,
          multiEngine: sql<number>`coalesce(sum(${schema.flights.multiEngine}::numeric), 0)`,
          dualReceived: sql<number>`coalesce(sum(${schema.flights.dualReceived}::numeric), 0)`,
          solo: sql<number>`coalesce(sum(${schema.flights.solo}::numeric), 0)`,
        })
        .from(schema.flights)
        .where(baseWhere),

      // Aircraft hours
      db
        .select({
          aircraftType: sql<string>`coalesce(${schema.aircraft.model}, 'Unknown')`,
          hours: sql<number>`coalesce(sum(${schema.flights.totalTime}::numeric), 0)`,
        })
        .from(schema.flights)
        .leftJoin(schema.aircraft, eq(schema.flights.aircraftId, schema.aircraft.id))
        .where(baseWhere)
        .groupBy(sql`coalesce(${schema.aircraft.model}, 'Unknown')`)
        .orderBy(desc(sql`coalesce(sum(${schema.flights.totalTime}::numeric), 0)`)),

      // Unique airports + top 10
      db
        .select({
          airport: sql<string>`airport`,
          count: sql<number>`count(*)`,
        })
        .from(
          sql`(
            SELECT departure_airport AS airport FROM flights WHERE profile_id = ${profileId} AND status = 'final' AND departure_airport IS NOT NULL
            UNION ALL
            SELECT arrival_airport AS airport FROM flights WHERE profile_id = ${profileId} AND status = 'final' AND arrival_airport IS NOT NULL
          ) AS airports`
        )
        .groupBy(sql`airport`)
        .orderBy(desc(sql`count(*)`))
        .limit(10),

      // Day-of-week flights
      db
        .select({
          day: sql<string>`to_char(${schema.flights.flightDate}::date, 'Dy')`,
          dayNum: sql<number>`extract(dow from ${schema.flights.flightDate}::date)`,
          count: sql<number>`count(*)`,
        })
        .from(schema.flights)
        .where(baseWhere)
        .groupBy(
          sql`to_char(${schema.flights.flightDate}::date, 'Dy')`,
          sql`extract(dow from ${schema.flights.flightDate}::date)`,
        )
        .orderBy(sql`extract(dow from ${schema.flights.flightDate}::date)`),
    ])

    // Format monthly hours with month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyHours: MonthlyHours[] = monthlyRaw.map((r) => {
      const [, monthStr] = r.month.split('-')
      const monthIdx = parseInt(monthStr, 10) - 1
      return {
        month: monthNames[monthIdx] ?? r.month,
        hours: Number(r.hours),
      }
    })

    // Format category hours
    const cat = categoryRaw[0]
    const categoryHours: CategoryHours[] = cat
      ? [
          { category: 'PIC', hours: Number(cat.pic) },
          { category: 'SIC', hours: Number(cat.sic) },
          { category: 'Cross-Country', hours: Number(cat.crossCountry) },
          { category: 'Night', hours: Number(cat.night) },
          { category: 'Instrument', hours: Number(cat.actualInstrument) },
          { category: 'Multi-Engine', hours: Number(cat.multiEngine) },
          { category: 'Dual Received', hours: Number(cat.dualReceived) },
          { category: 'Solo', hours: Number(cat.solo) },
        ].filter((c) => c.hours > 0)
      : []

    const aircraftHours: AircraftHours[] = aircraftRaw.map((r) => ({
      aircraftType: r.aircraftType,
      hours: Number(r.hours),
    }))

    // Unique airports count
    const allAirports = new Set(airportRaw.map((a) => a.airport))
    const uniqueAirports = allAirports.size

    const topAirports: AirportVisit[] = airportRaw.map((a) => ({
      airport: a.airport,
      count: Number(a.count),
    }))

    const dayOfWeekFlights: DayOfWeekFlights[] = dayOfWeekRaw.map((r) => ({
      day: r.day,
      count: Number(r.count),
    }))

    return {
      data: {
        monthlyHours,
        categoryHours,
        aircraftHours,
        uniqueAirports,
        topAirports,
        dayOfWeekFlights,
      },
      error: null,
    }
  } catch (error) {
    Sentry.captureException(error)
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load analytics data',
    }
  }
}
