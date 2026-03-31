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
- `(auth)` — requires Supabase session, no profile needed (profile creation)
- `(needs-test)` — requires session + profile, test not yet completed
- `(protected)` — requires session + profile + completed test (home, reports)

### Core Business Logic (lib/)

- **`scorer.ts`** — Converts raw test answers → Big5, AAS, flexibility scores + Z-scores
- **`pncam-calculator.ts`** — PNCAM algorithm: takes two profiles' Z-scores → 4 indicators (ESB, CSP, PCI, STB) with A/B/C/D grades
- **`generate-report.ts`** / **`generate-parenting-profile.ts`** — Claude API calls that produce structured JSON reports
- **`report-prompt.ts`** / **`parenting-profile-prompt.ts`** — System prompts for AI generation
- **`populate-couple-scores.ts`** — Triggers couple score calculation when both partners complete tests

### Database (db/schema.ts)

Key tables: `befe_profiles`, `befe_answers`, `befeCouples`, `befeInvitations`, `befeReports`, `befePersonalityReports`, `befeOrders`, `befeCoupons`, `befeReportTemplates`. Shared read-only tables: `tests`, `questions`, `reportBig5`, `reportAas`, `reportFlexibility`.

- UUIDs as primary keys
- Soft delete via `deleted_at` on `befe_profiles` — queries must filter `deleted_at IS NULL`
- `befeReportTemplates` caches reports by grade combination to avoid redundant AI generation

### Invitation Flow

Documented in `docs/invite-flow.md`. Uses `invited_by` cookie (7-day TTL) set by `proxy.ts` middleware. Handles 7 cases (non-member, member without profile, member with incomplete test, etc.).

### Key Patterns

- Server Actions for mutations (accepting invitations, account deletion, coupon redemption)
- API routes (`app/api/`) for polling report generation status
- Report generation: status transitions `generating → completed/failed`
- Mobile-first layout: max-width 430px
- Path alias: `@/*` maps to project root
