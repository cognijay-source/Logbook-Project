import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema/index.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: (process.env.DATABASE_URL_DIRECT || process.env.POSTGRES_URL_NON_POOLING)!,
  },
})
