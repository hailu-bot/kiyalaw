# TODO - Prisma v6 / DB + Backend Wiring

## Goal
Standardize Matter screens to use Prisma v6 (no `prisma.config.*`) and ensure endpoints build cleanly.

## Steps
- [x] Create/verify API route for listing matters using Prisma (`lib/data/matters.prisma.ts`).
- [x] Update `app/(dashboard)/matters/page.tsx` to use Prisma for backend wiring (remove Supabase import usage).


- [x] Ensure all client/server components compile (fix any TS issues).
- [x] Run `npm run lint`.
- [x] Run `npm run build`.

