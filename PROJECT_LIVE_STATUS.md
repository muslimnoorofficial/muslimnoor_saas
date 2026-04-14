# 🕌 Muslim Noor SaaS — Project Live Status

**Last Updated:** April 14, 2026 | **Branch:** master

---

## 🟢 Services

| Service | Port | Status |
|---------|------|--------|
| Next.js Admin | 3000 | ✅ Running |
| NestJS API | 3001 | ✅ Running (PORT env set) |
| Supabase Studio | 54323 | ✅ Running |
| PostgreSQL | 54322 | ✅ Running |
| Supabase Auth | 54321 | ✅ Running |
| Inbucket (email) | 54324 | ✅ Running |

---

## 🔐 Test Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@muslimnoor.local` | `SuperAdmin123!@#` | super_admin |
| `admin.chicago@muslimnoor.local` | `MosqueAdmin123!@#` | mosque_admin (ICC Chicago) |
| `admin.dallas@muslimnoor.local` | `MosqueAdmin123!@#` | mosque_admin (Dallas) |
| `member@muslimnoor.local` | `Member123!@#` | member |
| `donor@muslimnoor.local` | `Donor123!@#` | donor |

---

## 🗃️ Seed Data (after `npx supabase db reset`)

| Table | Count | Notes |
|-------|-------|-------|
| `mosques` | 3 | Chicago, Dallas, Bay Area |
| `auth.users` | 5 | All email-confirmed |
| `public.users` | 5 | With global_role |
| `mosque_members` | 4 | Admin + member mappings |
| `prayer_times` | 8 | Today + 3 days per mosque |
| `donations` | 5 | Mix of one_time + monthly |
| `events` | 3 | Ramadan Iftar, Eid Prayer, Youth Halaqa |
| `announcements` | 3 | Published announcements |

---

## 📋 Phase 1–6 Roadmap (Original 30 Tasks)

| # | Task | Phase | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Turborepo monorepo scaffold | 1 · Foundation | ✅ Done | pnpm workspaces |
| 2 | NestJS API bootstrap + ConfigModule | 1 · Foundation | ✅ Done | PORT=3001 in .env |
| 3 | Next.js admin app scaffold + theme system | 1 · Foundation | ✅ Done | App Router |
| 4 | Supabase local setup + migrations | 1 · Foundation | ✅ Done | 3 migrations applied |
| 5 | Seed script (mosques, users, events, donations) | 1 · Foundation | ✅ Done | Full auth seed in seed.sql |
| 6 | SupabaseService — real createClient impl | 1 · Foundation | ✅ Done | anon + admin clients |
| 7 | Dashboard overview tab + KPI stat cards | 1 · Foundation | ✅ Done | 6 stat cards |
| 8 | Dark/light theme toggle | 1 · Foundation | ✅ Done | THEMES object |
| 9 | Auth — POST /api/auth/login + register + logout | 2 · Auth | ✅ Done | Supabase signInWithPassword |
| 10 | Auth — GET /api/auth/me + refresh token | 2 · Auth | ✅ Done | getUser + refreshSession |
| 11 | Admin login page (UI + form) | 2 · Auth | ✅ Done | /login route |
| 12 | Dashboard layout auth guard (JWT check) | 2 · Auth | ✅ Done | localStorage mn_token |
| 13 | Sign-out flow + token cleanup | 2 · Auth | ✅ Done | localStorage cleanup |
| 14 | Email verification on register | 2 · Auth | ✅ Done | enable_confirmations + Resend SMTP |
| 15 | Resend verification + forgot password endpoints | 2 · Auth | ✅ Done | /resend-verification + /forgot-password |
| 16 | Events module — full CRUD frontend | 3 · Frontend | ✅ Done | EventsManager.tsx |
| 17 | Events — View modal + Edit modal | 3 · Frontend | ✅ Done | Inline modals |
| 18 | Members module — full CRUD frontend | 3 · Frontend | ✅ Done | MembersManager.tsx |
| 19 | Donations module — 3 sub-tabs frontend | 3 · Frontend | ✅ Done | Records + Manual Charge + Stripe Live |
| 20 | Mosques tab — list + Stripe Connect UI | 3 · Frontend | ✅ Done | MosquesManager.tsx |
| 21 | Pagination (5/page) across all managers | 3 · Frontend | ✅ Done | All tables paginated |
| 22 | Search + filter across all managers | 3 · Frontend | ✅ Done | Client-side search |
| 23 | Events API — GET /api/events + POST /api/events | 4 · API | ✅ Done | events.controller.ts |
| 24 | Announcements API — GET/POST /api/announcements | 4 · API | ✅ Done | In events.controller.ts |
| 25 | Stripe Connect — OAuth onboarding + manual keys | 4 · API | ✅ Done | stripe-connect.service.ts |
| 26 | Stripe — test transactions (visa/monthly/declined) | 4 · API | ✅ Done | runTestTransactions() |
| 27 | Stripe — manual charge endpoint | 4 · API | ✅ Done | POST .../manual-charge |
| 28 | Stripe — monthly transactions fetch | 4 · API | ✅ Done | GET .../monthly-transactions |
| 29 | Stripe webhook handler | 4 · API | ✅ Done | stripe-webhook.service.ts |
| 30 | RLS policies — fix infinite recursion bug | 4 · API | ✅ Done | 003_fix_rls_policies.sql |

---

## 📋 Phase 7–12 Roadmap (New 30 Tasks)

| # | Task | Phase | Status | Notes |
|---|------|-------|--------|-------|
| 31 | Fix TS compile errors in events.controller.ts | 7 · Hardening | ✅ Done | await + null guard |
| 32 | Members API — GET /api/members (with mosque filter) | 7 · Hardening | 🔶 Pending | Real DB, not mock |
| 33 | Members API — POST /api/members (invite) | 7 · Hardening | 🔶 Pending | Invite + email |
| 34 | Members API — PATCH /api/members/:id | 7 · Hardening | 🔶 Pending | Update role/status |
| 35 | Members API — DELETE /api/members/:id | 7 · Hardening | 🔶 Pending | Soft delete |
| 36 | Donations API — GET /api/donations (list + summary) | 7 · Hardening | 🔶 Pending | Real DB query |
| 37 | Prayer times API — GET /api/prayer-times | 7 · Hardening | 🔶 Pending | By mosque + date |
| 38 | Prayer times API — POST (bulk upsert for a month) | 7 · Hardening | 🔶 Pending | Admin upload |
| 39 | Role-based access guard (NestJS guard + decorator) | 7 · Hardening | 🔶 Pending | @Roles('mosque_admin') |
| 40 | Connect frontend EventsManager to real API | 8 · Wire-up | 🔶 Pending | Replace mock data |
| 41 | Connect frontend MembersManager to real API | 8 · Wire-up | 🔶 Pending | Replace mock data |
| 42 | Connect frontend DonationsManager to real API | 8 · Wire-up | 🔶 Pending | Replace mock data |
| 43 | Connect frontend AnnouncementsManager to real API | 8 · Wire-up | 🔶 Pending | Replace mock data |
| 44 | Dashboard stat cards — fetch live counts from API | 8 · Wire-up | 🔶 Pending | Replace hardcoded totals |
| 45 | Login page — wire to POST /api/auth/login | 8 · Wire-up | 🔶 Pending | Store JWT + user |
| 46 | Auth — user management tab (list, role edit) | 8 · Wire-up | 🔶 Pending | AuthManager.tsx → real API |
| 47 | Stripe Connect — wire Connect button to real API | 8 · Wire-up | 🔶 Pending | Remove mock URLs |
| 48 | Redis / BullMQ setup (Docker + npm install) | 9 · Jobs | 🔶 Pending | Needed for email queue |
| 49 | Email queue — donation receipt email on payment | 9 · Jobs | 🔶 Pending | BullMQ + Resend |
| 50 | Email queue — event reminder 1h before | 9 · Jobs | 🔶 Pending | BullMQ scheduled job |
| 51 | Email queue — new member welcome email | 9 · Jobs | 🔶 Pending | On mosque_members insert |
| 52 | Push notification — FCM setup + service | 9 · Jobs | 🔶 Pending | Firebase admin SDK |
| 53 | Expo / React Native app — scaffold | 10 · Mobile | 🔶 Pending | apps/mobile |
| 54 | Mobile — prayer times screen | 10 · Mobile | 🔶 Pending | By mosque |
| 55 | Mobile — donations screen (Stripe) | 10 · Mobile | 🔶 Pending | Stripe SDK for RN |
| 56 | Mobile — events screen + event detail | 10 · Mobile | 🔶 Pending | Public events |
| 57 | Mobile — push notification registration | 10 · Mobile | 🔶 Pending | FCM token → user_devices |
| 58 | Mobile — auth (login + register) | 10 · Mobile | 🔶 Pending | Supabase Auth |
| 59 | Admin — mosque onboarding wizard (multi-step form) | 11 · UX | 🔶 Pending | Create mosque + admin |
| 60 | Deploy — Supabase Cloud (prod DB + auth) | 12 · Deploy | 🔶 Pending | supabase link |
| 61 | Deploy — Railway (NestJS API, auto from GitHub) | 12 · Deploy | 🔶 Pending | Railway + env vars |
| 62 | Deploy — Vercel (Next.js admin, auto from GitHub) | 12 · Deploy | 🔶 Pending | NEXT_PUBLIC_API_URL |
| 63 | Deploy — GitHub Actions CI (lint + tsc + test) | 12 · Deploy | 🔶 Pending | .github/workflows |
| 64 | Deploy — Stripe webhook production endpoint | 12 · Deploy | 🔶 Pending | whsec_ prod secret |
| 65 | E2E test — Playwright auth + dashboard smoke test | 12 · Deploy | 🔶 Pending | apps/e2e |

---

## 🐛 Known Issues Fixed This Session

| Issue | Fix |
|-------|-----|
| `mosque_members` RLS infinite recursion | `003_fix_rls_policies.sql` — security-definer helper function |
| `public.users` empty after seed | `supabase db reset` re-applied; auth.users seeded correctly |
| API TS errors (events.controller.ts) | Added `await` + null guards on extractUserIdFromToken |
| `sb_secret_*` key not bypassing PostgREST RLS | Confirmed: Kong gateway translates; direct JWT `eyJ...` works |
| `stripe-webhook.service.ts` using anon client | All writes changed to `this.supabase.admin` |

---

## 🗂️ Key Files

```
apps/api/src/
  app.module.ts                          — all modules registered
  modules/auth/auth.service.ts           — Supabase signIn/signUp/verify
  modules/auth/auth.controller.ts        — /api/auth/* endpoints
  modules/supabase/supabase.service.ts   — anon + admin Supabase clients
  modules/stripe/stripe-connect.service.ts — full Stripe Connect flow
  modules/stripe/stripe-connect.controller.ts — 7 Stripe routes
  modules/events/events.controller.ts    — events + announcements
  modules/donations/stripe-webhook.service.ts — webhook handler

apps/admin/app/
  login/page.tsx                         — login form
  dashboard/page.tsx                     — main dashboard
  dashboard/components/
    MosquesManager.tsx                   — Stripe Connect UI
    DonationsManager.tsx                 — 3-tab donations
    EventsManager.tsx                    — events CRUD
    MembersManager.tsx                   — members CRUD
    AnnouncementsManager.tsx             — announcements

supabase/
  migrations/001_initial_schema.sql      — full schema + RLS
  migrations/002_add_user_devices.sql    — FCM device tokens
  migrations/003_fix_rls_policies.sql    — RLS infinite recursion fix
  seed.sql                               — 5 auth users + all sample data
  config.toml                            — email confirm + Resend SMTP
```

---

**Legend:** ✅ Done · 🔶 Pending · 🔴 Blocked
