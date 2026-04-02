# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BEFE (아이케미/Ichemy) — a couple's parenting care assessment platform. Users take psychological tests (Big5, AAS, flexibility), get matched as couples, and receive AI-generated parenting reports. Korean-language, mobile-first UI.

## Commands

```bash
bun run dev          # Dev server (dev.whatsmysaju.app)
bun run build        # Production build
bun run lint         # ESLint
bun run db:generate  # Generate Drizzle migrations from schema changes
bun run db:migrate   # Run pending migrations
bun run db:push      # Push schema directly (no migration file)
bun run db:studio    # Open Drizzle Studio (DB browser)
```

No unit/e2e tests exist in this project.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Package Manager:** Bun
- **Database:** PostgreSQL via Supabase + Drizzle ORM (`db/schema.ts`, `db/index.ts`)
- **Auth:** Supabase Auth SSR with Kakao OAuth
- **AI:** Anthropic Claude API (sonnet-4-5-20250929) for report generation
- **Payments:** TossPayments SDK
- **PDF:** @react-pdf/renderer for downloadable reports
- **Styling:** Tailwind CSS v4, shadcn/ui (Radix), Korean fonts (Pretendard, Jua, Mogra)

## Architecture

### Route Groups (app/)

Three route groups enforce progressive auth gates via layouts:
- `(auth)` — requires Supabase session only (profile creation, onboarding)
- `(needs-test)` — requires session + profile, redirects to `/home` if test already completed
- `(protected)` — requires session + profile + completed test (home, reports, settings)

Additional top-level routes outside auth gates: `invite/[id]`, `coupon/[code]`, `payment/`, `marketing/`, `privacy/`, `terms/`.

### Supabase Client Pattern

Two client factories following Supabase SSR pattern:
- **`lib/supabase/server.ts`** — `createServerClient` with cookie adapter for Server Components, layouts, and Server Actions
- **`lib/supabase/client.ts`** — `createBrowserClient` for Client Components

### Server Actions

Actions are co-located with their pages (not centralized):
- `app/(auth)/profile/create/action.ts` — profile creation (handles `invited_by` cookie for automatic coupling)
- `app/(needs-test)/test/actions.ts` — saveAnswer, completeTest (triggers `tryPopulateCoupleScores`)
- `app/(protected)/home/actions.ts` — acceptInvitationFromHome
- `app/invite/[id]/action.ts` — couple creation + score population
- `app/coupon/[code]/action.ts` — coupon redemption
- `app/payment/actions.ts` — order creation

### API Routes (app/api/)

Three polling endpoints for client-side status checking:
- `GET /api/report/[id]/status` — couple report status + content
- `GET /api/personality-report/[id]/status` — individual personality report status + content
- `GET /api/couple/status` — coupling status (`coupled`, `hasScores`)

### Core Business Logic (lib/)

- **`scorer.ts`** — Converts raw test answers → Big5, AAS, flexibility scores + Z-scores
- **`pncam-calculator.ts`** — PNCAM algorithm: two profiles' Z-scores → 4 indicators (ESB, CSP, PCI, STB) with A/B/C/D grades
- **`generate-report.ts`** / **`generate-parenting-profile.ts`** — Claude API calls producing structured JSON reports
- **`report-prompt.ts`** / **`parenting-profile-prompt.ts`** — System prompts for AI generation
- **`populate-couple-scores.ts`** — Triggers couple score calculation when both partners complete tests

### Middleware (proxy.ts)

Sets cookies for deferred actions before auth check:
- `invited_by` cookie on `/invite/[id]` visits (7-day TTL) — consumed during profile creation or invitation acceptance
- `coupon_code` cookie on `/coupon/[code]` visits (7-day TTL) — consumed during coupon redemption
- Redirects unauthenticated users from protected paths to `/`

### Invitation & Coupon Flows

Documented in `docs/invite-flow.md`. Key mechanics:
- Cookies persist across logout/relogin so the action completes after authentication
- Couples created in two places: `createProfile` (new users) or `acceptInvite` (existing users)
- Scores populated in two places: `acceptInvite` (if both tests done) or `completeTest` (when second person finishes)

### Database (db/schema.ts)

Key tables: `befe_profiles`, `befe_answers`, `befeCouples`, `befeInvitations`, `befeReports`, `befePersonalityReports`, `befeOrders`, `befeCoupons`, `befeReportTemplates`. Shared read-only tables: `tests`, `questions`, `reportBig5`, `reportAas`, `reportFlexibility`.

- UUIDs as primary keys
- Soft delete via `deleted_at` on `befe_profiles` — queries must filter `deleted_at IS NULL`
- `befeReportTemplates` caches reports by grade combination to avoid redundant AI generation

### Key Patterns

- No client state management library — uses React 19 server/client component pattern exclusively
- Server Actions for all mutations
- Report generation: status transitions `generating → completed/failed`, clients poll via API routes
- Mobile-first layout: max-width 430px
- Path alias: `@/*` maps to project root
- Toast notifications via Sonner (top-center, coral theme `#D4735C`)
