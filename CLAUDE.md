# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BEFE (아이케미/Ichemy) — a couple's parenting care assessment platform. Users take psychological tests (Big5, AAS, flexibility), get matched as couples, and receive AI-generated parenting reports. Korean-language, mobile-first UI. Production domain: `https://www.ichemy.co.kr`.

## Commands

```bash
bun run dev          # Dev server (dev.whatsmysaju.app)
bun run build        # Production build
bun run start        # Production server
bun run lint         # ESLint
bun run db:generate  # Generate Drizzle migrations from schema changes
bun run db:migrate   # Run pending migrations (uses KIT_DATABASE_URL)
bun run db:push      # Push schema directly (no migration file)
bun run db:studio    # Open Drizzle Studio (DB browser)
```

No unit/e2e tests exist in this project.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Package Manager:** Bun
- **Database:** PostgreSQL via Supabase + Drizzle ORM (`db/schema.ts`, `db/index.ts`)
- **Auth:** Kakao OIDC → Supabase Auth (custom callback, not standard Supabase OAuth redirect)
- **AI:** Anthropic Claude API (sonnet-4-5-20250929) for report generation
- **Payments:** TossPayments SDK (report price: ₩3,900)
- **PDF:** @react-pdf/renderer for downloadable reports
- **Styling:** Tailwind CSS v4, shadcn/ui (only `button` + `drawer`/vaul), custom Tailwind for most UI
- **Fonts:** Pretendard (CDN), Jua (`next/font`, headings), Mogra (`next/font`, display), Geist (`next/font`, body)

## Environment Variables

No `.env.example` exists. Env file is `.env.local`. Required vars:

- `DATABASE_URL` — PostgreSQL connection string (runtime)
- `KIT_DATABASE_URL` — PostgreSQL connection string (Drizzle CLI migrations — separate from `DATABASE_URL`)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_KEY` — Supabase project
- `KAKAO_REST_API_KEY` / `KAKAO_CLIENT_SECRET` — Kakao app credentials
- `TOSS_SECRET_KEY` — TossPayments secret key
- `ANTHROPIC_API_KEY` — Implicitly required by Anthropic SDK

## Architecture

### Middleware (`proxy.ts`)

There is no `middleware.ts` — `proxy.ts` at the root acts as Next.js middleware (exports `config` matcher). It handles:
- **Auth gating:** Unauthenticated users → redirect to `/`. Public paths: `/`, `/auth/callback`, `/terms`, `/privacy`, `/marketing`, `/profile/create`, plus `/invite/*`, `/coupon/*`, `/og/*`.
- **`invited_by` cookie:** Set when visiting `/invite/[id]` (7-day TTL, httpOnly, sameSite: lax).
- **`coupon_code` cookie:** Set when visiting `/coupon/[code]` (same settings). Used during auth callback and profile creation to auto-redeem coupons.

Auth callback (`/app/auth/callback/route.ts`) is a custom Kakao OIDC handler: exchanges code → Kakao token endpoint → `signInWithIdToken`. Logout redirects to Kakao's logout endpoint.

### Route Groups (app/)

Three route groups enforce progressive auth gates via **layout Server Components** (not middleware):
- `(auth)` — requires Supabase session (profile creation)
- `(needs-test)` — requires session + profile + `test_completed === false`
- `(protected)` — requires session + profile + `test_completed === true`

Layout redirect logic: no profile → `/profile/create`; not completed → `/test/intro`; already completed → `/home`.

### Core Business Logic (lib/)

- **`scorer.ts`** — Converts raw test answers → Big5, AAS, flexibility scores + Z-scores
- **`pncam-calculator.ts`** — PNCAM algorithm: two profiles' Z-scores → 4 indicators (ESB, CSP, PCI, STB) with A/B/C/D grades
- **`populate-couple-scores.ts`** — Triggers couple score calculation when both partners complete tests. Idempotency guard: skips if `couple.pcq_score !== null`.
- **`generate-report.ts`** — Couple Care Report via Claude API (`max_tokens: 24000`)
- **`generate-parenting-profile.ts`** — Personal Parenting Profile via Claude API (`max_tokens: 12000`)
- **`report-prompt.ts`** / **`parenting-profile-prompt.ts`** — System prompts for AI generation
- **`lib/supabase/server.ts`** / **`client.ts`** — Supabase client helpers (all server access via `createClient()`)

### Database (db/schema.ts)

Key tables: `befe_profiles`, `befe_answers`, `befeCouples`, `befeInvitations`, `befeReports`, `befePersonalityReports`, `befeOrders`, `befeCoupons`, `befeReportTemplates`. Shared read-only tables: `tests`, `questions`, `reportBig5`, `reportAas`, `reportFlexibility`.

- UUIDs as primary keys (`nanoid` used only for order IDs: `order_${nanoid()}`)
- Soft delete via `deleted_at` on `befe_profiles` — queries must filter `deleted_at IS NULL` (note: layout auth queries do NOT currently filter this)
- Profiles have a `role` field (`"mom"` | `"dad"`)
- `couple.pcq_score !== null` is the canonical check for "PNCAM scores computed"

Drizzle config: migrations in `./db/migrations`, `schemaFilter: ["public"]`, `tablesFilter: ["befe_*"]` (shared tables are read-only, not migrated by this app).

### Two Distinct AI Report Types

1. **Couple Care Report** (`befeReports` + `befeReportTemplates`): Couple-level, based on 4 PNCAM grades + `has_children`. Paywalled. Has template caching keyed by `(esb_grade, csp_grade, pci_grade, stb_grade, has_children)` — cache hit skips AI call entirely.
2. **Personal Parenting Profile** (`befePersonalityReports`): Individual, based on all raw scores + Z-scores. No payment gate. No template caching. Unique constraint on `profile_id`.

Report generation uses Next.js `after()` API for background processing. Status transitions: `generating → completed/failed`.

### Invitation Flow

Documented in `docs/invite-flow.md`. Uses `invited_by` cookie set by `proxy.ts`. `befeInvitations` enables the home screen accept-invitation banner (`pending` status, queried when user has no couple).

### Home Page States

Three states passed to `HomeClient`:
- `"done_no_partner"` — test complete, no partner linked
- `"waiting_partner"` — partner linked but hasn't completed test
- `"both_complete"` — both partners done, can access reports

### Key Patterns

- Server Actions for mutations (accepting invitations, account deletion, coupon redemption)
- API routes (`app/api/`) for polling report generation status
- Mobile-first layout: max-width 430px
- Path alias: `@/*` maps to project root
- `/marketing` route is the third-party data sharing consent page (개인정보 제3자 제공 동의), not a marketing landing page
- OG image routes at `/og/default` and `/og/invite` (edge runtime, `/og/invite` takes `?name=` param)
