# CrossCheck

The Pilot Operating System. See the system clearly. Build mastery deliberately.

See @README.md for setup instructions and @package.json for available scripts.

## Stack

- **Next.js** — app shell, routing, auth-gated pages, server-rendered dashboards, settings, marketing site, API routes
- **Tailwind CSS + shadcn/ui** — all styling and UI components
- **Zod** — validate form input, import rows, AI-parsed flight drafts, server action payloads
- **Supabase Auth** — login, signup, sessions, passwordless flows
- **Supabase Postgres** — source of truth for all domain data (flights, aircraft, milestones, goals, finance, currency, imports, audit)
- **Supabase Storage** — receipts, endorsements, exports, uploaded CSVs, supporting docs (bucket: `documents`, private)
- **Supabase Edge Functions** — Stripe webhooks, email integrations, small secure service tasks
- **Drizzle ORM** — schema definitions, migrations, typed relational queries
- **TanStack Query** — client data fetching, caching, mutations, optimistic UX
- **Trigger.dev** — CSV import pipeline, milestone recompute, goal/readiness refresh, scheduled currency checks, PDF generation, AI parsing workflows
- **Sentry** — runtime error capture, slow route monitoring, workflow tracing

## Feature Naming

All features use branded names throughout the UI and codebase:

| Brand Name          | Route        | Description                                    |
| ------------------- | ------------ | ---------------------------------------------- |
| CrossCheck Daily    | `/dashboard` | Summary cards, recent flights, currency, goals |
| CrossCheck Logbook  | `/flights`   | Flight log CRUD, search, filtering             |
| CrossCheck Currency | `/currency`  | FAA currency status tracking                   |
| CrossCheck Mastery  | `/journey`   | Milestones, evaluations, career progress       |
| CrossCheck Ready    | `/progress`  | Goal tracking and readiness bars               |
| CrossCheck Costs    | `/money`     | Income/expense tracking, financial summary     |

Additional pages: `/aircraft`, `/training`, `/documents`, `/imports`, `/reports`, `/settings`

## Pricing Tiers

- **CrossCheck Core** — free tier, basic logbook and currency
- **CrossCheck Mastery** — mid tier, adds mastery tracking, goals, training
- **CrossCheck Command** — top tier, full suite with AI, reports, priority support

## Directory Map

```
src/
  app/
    (auth)/             — login, signup, callback
    (dashboard)/        — all authenticated pages
      aircraft/         — aircraft CRUD
      currency/         — currency status
      dashboard/        — CrossCheck Daily
      documents/        — document management
      flights/          — logbook (list, new, [id])
      imports/          — CSV and AI import
      journey/          — mastery milestones
      money/            — costs tracking
      progress/         — goals and readiness
      reports/          — PDF report generation
      settings/         — profile and preferences
      training/         — training entries, certificates, endorsements
    (marketing)/        — landing, pricing, about
    api/                — route handlers
  components/
    aircraft/           — aircraft form, list
    dashboard/          — sidebar nav, header, notifications
    documents/          — upload, preview, entity docs
    flights/            — flight form, flight card
    imports/            — CSV upload, column mapping, AI import
    money/              — financial entry form
    settings/           — profile, preferences, account forms
    ui/                 — shadcn/ui primitives
  hooks/                — custom React hooks (toast)
  jobs/                 — Trigger.dev job definitions
  lib/
    db/                 — Drizzle client, schema, migrations, seed
    services/           — domain logic (currency, milestones, goals, totals, audit)
    supabase/           — Supabase client helpers (server, client, middleware)
    validators/         — Zod schemas per domain
  middleware.ts         — Supabase auth session refresh
  trigger.ts            — Trigger.dev project config
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
- Brand voice: operational, restrained, no gamification or aviation clichés
- Server actions return `{ data, error }` tuples. Never throw unhandled — always catch and return `{ error: message }`
- List queries support pagination with `page` and `pageSize` params. Default: page=1, pageSize=50. Return `{ data, total, page, pageSize }`
- All delete operations must include `profileId` in the WHERE clause alongside the record id. Never delete by id alone
- All security-sensitive actions (password change, account deletion) must call `createAuditEvent()`

### Important

- **Never** modify migration files after they've been generated — create new migrations instead
- **Never** bypass Zod validation — if a schema doesn't exist yet, create one
- **Never** install packages outside the approved stack without asking first
- **Never** add a separate backend, microservices, MongoDB, Firebase, or Python
- **Never** allow direct AI-to-database writes

## Git Workflow

- **Branch naming** — use Claude Code auto-generated branch names (no custom convention)
- **Commit messages** — Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`. Lowercase, imperative, no period. Body optional but encouraged for non-trivial changes
- **PRs** — always squash merge into main. PR title follows the same conventional commit format (it becomes the squash commit message)
- **Main branch** — keep deployable at all times. Never push directly to main
