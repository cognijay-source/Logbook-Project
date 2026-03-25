# Logbook Project

Pilot logbook and aviation career tracker.

## Getting Started

```bash
cp .env.local.example .env.local
# Fill in your environment variables
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Stack

- **Next.js** — App shell, routing, auth-gated pages, server-rendered dashboards
- **Tailwind CSS + shadcn/ui** — Styling and UI components
- **Zod** — Validation for forms, imports, server actions
- **Supabase** — Auth, Postgres database, Storage, Edge Functions
- **Drizzle ORM** — Schema definitions, migrations, typed queries
- **TanStack Query** — Client data fetching, caching, mutations
- **Trigger.dev** — Background jobs, scheduled tasks, pipelines
- **Sentry** — Error tracking and performance monitoring
