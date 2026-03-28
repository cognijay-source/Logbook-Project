import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getSunTimes } from '@/lib/services/sun-times'
import airports from '@/lib/data/airports.json'

const airportIndex = new Map<string, { lat: number; lon: number }>()
for (const airport of airports) {
  airportIndex.set(airport.icao.toUpperCase(), {
    lat: airport.lat,
    lon: airport.lon,
  })
  if (airport.iata) {
    airportIndex.set(airport.iata.toUpperCase(), {
      lat: airport.lat,
      lon: airport.lon,
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const airportCode = searchParams.get('airport')?.toUpperCase()
    const date = searchParams.get('date')

    if (!airportCode || !date) {
      return NextResponse.json(
        { error: 'Missing airport or date parameter' },
        { status: 400 },
      )
    }

    const coords = airportIndex.get(airportCode)
    if (!coords) {
      return NextResponse.json(
        { error: 'Airport not found in database' },
        { status: 404 },
      )
    }

    const sunTimes = await getSunTimes(coords.lat, coords.lon, date)
    if (!sunTimes) {
      return NextResponse.json(
        { error: 'Sun times unavailable' },
        { status: 503 },
      )
    }

    return NextResponse.json({ data: sunTimes })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
