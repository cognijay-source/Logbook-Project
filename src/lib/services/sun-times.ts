import * as Sentry from '@sentry/nextjs'

export type SunTimes = {
  sunrise: string
  sunset: string
  civilTwilightBegin: string
  civilTwilightEnd: string
  nightLoggingBegin: string
  nightLoggingEnd: string
  nightCurrencyBegin: string
  nightCurrencyEnd: string
}

// In-memory cache keyed by "lat,lon,date"
const cache = new Map<string, SunTimes>()

export async function getSunTimes(
  lat: number,
  lon: number,
  date: string,
): Promise<SunTimes | null> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)},${date}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!response.ok) return null

    const json = await response.json()
    if (json.status !== 'OK') return null

    const r = json.results
    const sunrise = new Date(r.sunrise)
    const sunset = new Date(r.sunset)
    const civilTwilightBegin = new Date(r.civil_twilight_begin)
    const civilTwilightEnd = new Date(r.civil_twilight_end)

    // Night currency: 1 hour after sunset to 1 hour before sunrise
    const nightCurrencyBegin = new Date(sunset.getTime() + 60 * 60 * 1000)
    const nightCurrencyEnd = new Date(sunrise.getTime() - 60 * 60 * 1000)

    const result: SunTimes = {
      sunrise: sunrise.toISOString(),
      sunset: sunset.toISOString(),
      civilTwilightBegin: civilTwilightBegin.toISOString(),
      civilTwilightEnd: civilTwilightEnd.toISOString(),
      nightLoggingBegin: civilTwilightEnd.toISOString(),
      nightLoggingEnd: civilTwilightBegin.toISOString(),
      nightCurrencyBegin: nightCurrencyBegin.toISOString(),
      nightCurrencyEnd: nightCurrencyEnd.toISOString(),
    }

    cache.set(cacheKey, result)
    return result
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return null
    }
    Sentry.captureException(error)
    return null
  }
}
