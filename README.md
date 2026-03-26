# CrossCheck

The Pilot Operating System. See the system clearly. Build mastery deliberately.

## Features

- **CrossCheck Daily** — Dashboard with flight totals, currency status, recent activity, and goal progress
- **CrossCheck Logbook** — Full flight log with search, filtering, and detailed entry forms
- **CrossCheck Currency** — FAA currency tracking with automatic status evaluation
- **CrossCheck Mastery** — Milestone tracking, career progress, and evaluation history
- **CrossCheck Ready** — Goal setting and readiness progress bars
- **CrossCheck Costs** — Income and expense tracking with financial summaries
- **Aircraft** — Aircraft registry with type and tail number management
- **Training** — Training entries, certificates, and endorsement tracking
- **Documents** — Upload, preview, and manage supporting documents (Supabase Storage)
- **Imports** — CSV import with column mapping and AI-assisted photo parsing
- **Reports** — PDF report generation for flight records
- **Settings** — Pilot profile, preferences, and account management
- **Notifications** — In-app notification bell with unread count (coming soon)

## Getting Started

```bash
cp .env.local.example .env.local
# Fill in your environment variables
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Copy `.env.local.example` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `DATABASE_URL` — Postgres connection string (for Drizzle)
- `TRIGGER_SECRET_KEY` — Trigger.dev secret key
- `SENTRY_DSN` — Sentry DSN for error tracking
- `NEXT_PUBLIC_SENTRY_DSN` — Sentry DSN for client-side

### Supabase Storage Setup

Create a private bucket named `documents` in your Supabase project. This stores receipts, endorsements, exports, uploaded CSVs, and supporting docs.

## Stack

- **Next.js** — App shell, routing, auth-gated pages, server-rendered dashboards
- **Tailwind CSS + shadcn/ui** — Styling and UI components
- **Zod** — Validation for forms, imports, server actions
- **Supabase** — Auth, Postgres database, Storage, Edge Functions
- **Drizzle ORM** — Schema definitions, migrations, typed queries
- **TanStack Query** — Client data fetching, caching, mutations
- **Trigger.dev** — Background jobs, scheduled tasks, pipelines
- **Sentry** — Error tracking and performance monitoring

## Brand Voice

CrossCheck uses an operational, restrained tone throughout. No gamification (badges, streaks, XP), no startup fluff, no aviation clichés. Empty states are clear and functional. Feature names are branded with the "CrossCheck" prefix in marketing contexts.

### Pricing Tiers

- **CrossCheck Core** — Free. Start with a record you can trust.
- **CrossCheck Mastery** — Build mastery with clear progress and disciplined tracking.
- **CrossCheck Command** — Operate your flying career with precision.
