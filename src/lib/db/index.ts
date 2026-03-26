import { drizzle } from 'drizzle-orm/neon-http'
import { neon, neonConfig } from '@neondatabase/serverless'
import * as schema from './schema'

const MAX_RETRIES = 3

async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fetch(input, init)
    } catch (error) {
      lastError = error
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 200),
        )
      }
    }
  }
  throw lastError
}

neonConfig.fetchFunction = fetchWithRetry

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!databaseUrl) {
  throw new Error(
    'Missing database connection string. Set DATABASE_URL or POSTGRES_URL.',
  )
}

const sql = neon(databaseUrl, {
  fetchOptions: {
    cache: 'no-store',
  },
})

export const db = drizzle(sql, { schema })
