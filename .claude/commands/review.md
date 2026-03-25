Review the changed files against this checklist:

1. **Type safety** — Are all types explicit? No `any` unless justified?
2. **Zod validation** — Does every server action and API route validate input with Zod?
3. **No raw SQL** — Is all DB access going through Drizzle ORM?
4. **Auth checks** — Are dashboard routes and server actions verifying the user session?
5. **Error boundaries** — Do pages/layouts have appropriate error boundaries?
6. **Loading/error states** — Are loading and error states handled in client components?
7. **Sentry captures** — Does every catch block call Sentry.captureException?
8. **Server-first** — Is "use client" only used when truly needed (browser APIs, state, event handlers)?
9. **No unapproved packages** — Are all imports from the approved stack?
10. **File organization** — One component per file, one schema per domain?

Report findings as a checklist with pass/fail for each item and specific file:line references for any issues.
