# PurohitConnect

Book verified purohits for Vedic ceremonies — Griha Pravesh, Satyanarayan Puja, weddings and more — with transparent pricing, complete samagri and live booking tracking.

| Workspace | Routes | What it does |
| --- | --- | --- |
| Families | `/`, `/search`, `/purohit/[id]`, `/book/[id]`, `/bookings`, `/profile` | Discover purohits, book in four steps (with coupons), reschedule or cancel, pay by UPI/card/wallet/after the puja, download receipts and calendar invites, review completed ceremonies |
| Purohits | `/purohit-dashboard`, `/join` | Apply to join, accept or decline requests, run the day of the ceremony (on the way → started → completed), mark days off, pause bookings, track earnings |
| Admin | `/admin` | Live KPIs and charts, booking detail with cancel-and-refund, CSV export, approve or reject purohit applications, suspend purohits and users, reset demo data |
| Public | `/help`, `/terms`, `/privacy` | FAQs, terms and privacy policy |

## Demo accounts

Sign in at `/login`. Any 6-digit OTP works in demo mode.

| Role | Phone | Notes |
| --- | --- | --- |
| Family | `98765 43210` | Sample account with bookings, wallet and saved purohits. Any other valid number creates a new account. |
| Purohit | `90000 00001` | Pandit Ramesh Shastri — has pending requests and a ceremony today. |
| Admin | `90000 00000` | Full admin console. |

All three workspaces share one data store, so a booking made as a family appears in the purohit's requests and the admin console. Data is saved in the browser (`localStorage`) and survives reloads; "Reset demo data" in the admin console restores the sample data.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Unit tests (Vitest) for pricing, availability, booking rules, CSV, calendar and redirects |
| `npm run build` | Production build |
| `npm run test:e2e` | End-to-end tests (Playwright) against a production build on desktop and mobile, including axe accessibility scans. Run `npm run build` first; `npx playwright install chromium` once. |

CI (`.github/workflows/ci.yml`) runs all of the above on every pull request and push to `main`.

Set `NEXT_PUBLIC_SITE_URL` in production so canonical URLs, the sitemap and Open Graph tags use your domain.

## Architecture

```
src/
  app/                      Routes. Server layouts carry metadata; catalog profiles are pre-rendered.
  components/
    ui/                     Primitives on Base UI: button, input, select, dialog, sheet, toast, confirm-dialog…
    shared/                 Product components: purohit-card, status-badge, panel, stat-card, chart…
    booking/                Date/slot picker and reason dialog shared by booking, rescheduling and dashboards
    auth/require-role.tsx   Route guard: sign-in redirect with safe ?next=, role checks, suspended accounts
    layout/                 app-shell, site-header, notification-bell, bottom-nav, dashboard-shell
  lib/
    catalog.ts              Static reference data: services, categories, purohit profiles, time slots
    store/
      types.ts              Domain model: users, bookings, reviews, wallet, notifications, applications
      actions.ts            Every state change, as pure functions that enforce the business rules
      selectors.ts          Derived data: live ratings, bookable purohits, wallet balance, notifications
      availability.ts       Slot rules: overlaps, days off, same-day notice, conflicts
      pricing.ts            Platform fee and coupons
      seed.ts               Demo data, dated relative to "now"
      store.ts              Persistence (localStorage), cross-tab sync, React hooks
    format.ts, calendar.ts, csv.ts, navigation.ts
e2e/                        Playwright journeys and accessibility scans
```

**Moving to a real backend.** The action functions in `lib/store/actions.ts` are pure `(db, input) → db` transitions that already contain the business rules (authorisation, availability, refunds, notifications). Run them behind API routes with a database, then change `store.ts` so `api.*` calls those routes and `useDB` reads from the server. Pages don't need to change.

## Before launching for real

This build is production-grade on the frontend, but some pieces need your accounts and decisions:

- **Backend & database** — data currently lives in each visitor's browser. Add a database and API (see above).
- **OTP** — any code is accepted. Integrate an SMS provider (e.g. MSG91, Twilio) and verify codes server-side.
- **Payments** — UPI/card payments are simulated. Integrate a gateway (e.g. Razorpay) and issue refunds through it.
- **Contact details** — `1800-123-4567` and the `purohitconnect.in` email addresses are placeholders.
- **Legal & policy copy** — Terms, Privacy, the cancellation/refund policy and partner promises (weekly payouts, verification timelines) are templates; have them reviewed.
- **Next.js upgrade** — `next@14.2.35` is the last 14.x release; remaining `npm audit` advisories are fixed only in Next 15+.
- **Content Security Policy** — other security headers are set in `next.config.mjs`; add a CSP once third-party scripts (payments, analytics) are known.

## Design system

A single dark theme built around the gold-on-black brand mark. Colours are tokens in `src/app/globals.css`; components use semantic classes (`bg-card`, `text-muted-foreground`, `text-primary`…), never raw hex values. Text/background pairs meet WCAG AA, which the e2e axe scans enforce.

Conventions:

- **State changes** go through `api.*` from `useApp()`; each returns `{ ok, value }` or `{ ok: false, error }` — show the error with `toast.error`.
- **Signed-in pages** wrap their content in `<RequireRole role="user" | "purohit" | "admin">`.
- **Buttons on links:** `<Link className={buttonVariants({ … })}>`, never a `<button>` inside a link.
- **Destructive actions** use `<ConfirmDialog>`, or `<ReasonDialog>` when a reason is recorded.
- **Dates:** store local `yyyy-MM-dd` via `toISODate()`; never `toISOString()`, which shifts the day for IST users.
- **Private data** is empty during server rendering; gate on `hydrated` from `useApp()`.
