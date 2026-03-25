# Logbook Project

Pilot logbook and aviation career tracker.

See @README.md for setup instructions and @package.json for available scripts.

## Stack

- **Next.js** — app shell, routing, auth-gated pages, server-rendered dashboards, settings, marketing site, API routes
- **Tailwind CSS + shadcn/ui** — all styling and UI components
- **Zod** — validate form input, import rows, AI-parsed flight drafts, server action payloads
- **Supabase Auth** — login, signup, sessions, passwordless flows
- **Supabase Postgres** — source of truth for all domain data (flights, aircraft, milestones, goals, finance, currency, imports, audit)
- **Supabase Storage** — receipts, endorsements, exports, uploaded CSVs, supporting docs
- **Supabase Edge Functions** — Stripe webhooks, email integrations, small secure service tasks
- **Drizzle ORM** — schema definitions, migrations, typed relational queries
- **TanStack Query** — client data fetching, caching, mutations, optimistic UX
- **Trigger.dev** — CSV import pipeline, milestone recompute, goal/readiness refresh, scheduled currency checks, PDF generation, AI parsing workflows
- **Sentry** — runtime error capture, slow route monitoring, workflow tracing

## Directory Map

```
src/
  app/
    (auth)/         — login, signup, callback
    (dashboard)/    — authenticated pages
    (marketing)/    — landing, pricing, etc.
    api/            — route handlers
  components/
    ui/             — shadcn/ui components
  lib/
    db/             — Drizzle client, schema, migrations
    supabase/       — Supabase client helpers (server, client, middleware)
    validators/     — Zod schemas
  hooks/            — custom React hooks (TanStack Query wrappers, etc.)
  jobs/             — Trigger.dev job definitions
  types/            — shared TypeScript types
```

## Dev Commands

```bash
npm run dev            # Start dev server (turbopack)
npm run build          # Production build
npm run lint           # ESLint
npm run format         # Prettier write
npm run format:check   # Prettier check
npm run db:generate    # Generate Drizzle migrations
npm run db:migrate     # Run Drizzle migrations
npm run db:push        # Push schema to database
npm run db:studio      # Open Drizzle Studio
npm run trigger:dev    # Start Trigger.dev dev server
```

## Conventions

- Server actions for mutations, TanStack Query for reads
- All user input validated with Zod before it hits any server action or API route
- Drizzle for all DB access — never raw SQL unless explicitly approved
- Supabase Auth for all auth — never roll custom JWT logic
- Supabase Storage for all file uploads — never write to local filesystem
- Trigger.dev for anything that takes >5 seconds or is scheduled
- Use `"use server"` and `"use client"` directives intentionally — default to server
- Prefer small, focused files — one component per file, one schema per domain
- Every catch block should capture to Sentry — never silently swallow errors

### Important

- **Never** modify migration files after they've been generated — create new migrations instead
- **Never** bypass Zod validation — if a schema doesn't exist yet, create one
- **Never** install packages outside the approved stack without asking first
- **Never** add a separate backend, microservices, MongoDB, Firebase, or Python
- **Never** allow direct AI-to-database writes

## Git Workflow

<!-- TODO: Ask about preferred branch naming and commit conventions -->
