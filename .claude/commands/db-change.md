Workflow for making a database schema change:

1. **Update Drizzle schema** — Edit the relevant file in `src/lib/db/schema/`
2. **Generate migration** — Run `npm run db:generate` and review the generated SQL
3. **Review SQL** — Show me the generated migration file for approval
4. **Apply migration** — Run `npm run db:push` (dev) or `npm run db:migrate` (prod)
5. **Verify** — Confirm the schema change was applied correctly

Important reminders:

- Never modify existing migration files — always create new ones
- Always review the generated SQL before applying
- Update any affected Zod schemas in `src/lib/validators/`
- Update any affected TypeScript types in `src/types/`
