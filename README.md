# PurohitConnect

Book verified purohits for Vedic ceremonies — Griha Pravesh, Satyanarayan Puja, weddings and more — with transparent pricing, complete samagri and live booking tracking.

The app has three workspaces:

| Workspace | Route | What it does |
| --- | --- | --- |
| Families | `/`, `/search`, `/purohit/[id]`, `/book/[id]`, `/bookings`, `/profile` | Discover purohits, book in four steps, track and review ceremonies |
| Purohits | `/purohit-dashboard` | Accept/decline requests, view schedule and earnings, pause bookings |
| Admin | `/admin` | Platform KPIs, revenue and city charts, bookings/purohits/users tables |

> Data is mocked in `src/lib/mock-data.ts` and held in React state (`src/lib/booking-context.tsx`), so changes reset on reload. On the sign-in screen, any valid Indian mobile number and any 6-digit code will work.

## Getting started

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build + type check
npm run lint
```

Set `NEXT_PUBLIC_SITE_URL` in production so Open Graph URLs resolve correctly.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with CSS-variable design tokens
- **Base UI** primitives (dialog, select, menu, tabs, switch, toast, OTP field) wrapped as shadcn-style components in `src/components/ui`
- **Recharts** for dashboard charts, **date-fns** for dates, **lucide-react** icons

## Project structure

```
src/
  app/                      Routes (each has a small layout.tsx for page metadata)
  components/
    ui/                     Primitives: button, input, select, dialog, sheet, toast, confirm-dialog…
    shared/                 Product components: purohit-card, status-badge, panel, stat-card, chart…
    layout/                 app-shell, site-header, bottom-nav, site-footer, dashboard-shell
    home/                   Home page sections
  lib/
    mock-data.ts            Purohits, services, bookings + lookup helpers
    booking-context.tsx     App state: session, profile, wallet, favourites, bookings, reviews
    booking-status.ts       Single source of truth for booking status labels and colours
    availability.ts         Deterministic mock slot availability
    format.ts               INR, dates (timezone-safe), initials
```

## Design system

A single dark theme built around the gold-on-black brand mark. All colours are tokens in `src/app/globals.css`; components use semantic classes, never raw hex values.

| Token (class) | Use |
| --- | --- |
| `bg-background`, `bg-card`, `bg-surface`, `bg-surface-strong` | Page → card → inset → raised surfaces |
| `text-foreground`, `text-muted-foreground`, `text-subtle-foreground` | Primary, secondary and tertiary text (all ≥ 4.5:1 on cards) |
| `bg-primary`, `text-primary`, `gold-50…950` | Brand gold |
| `success`, `warning`, `info`, `violet`, `destructive` | Status only — always paired with a label or icon |
| `chart-1` | Chart marks (a deeper gold validated for the dark surface) |

Conventions:

- **Buttons on links:** use `<Link className={buttonVariants({ … })}>` rather than nesting a `<button>` inside a link.
- **Booking status:** render with `<StatusBadge status={…} />`; labels and tones live in `booking-status.ts`.
- **Destructive actions** (cancel, log out, decline) go through `<ConfirmDialog>`.
- **Feedback:** call `toast.success/error/info()` from `@/components/ui/toast`.
- **Dates:** store local `yyyy-MM-dd` via `toISODate()`; never `toISOString()`, which shifts the day for IST users.
- **Clock-dependent UI** (availability, "today") renders after mount via `useMounted()` to avoid hydration mismatches.
- **Mobile:** consumer pages get a bottom tab bar from `AppShell`; pages with their own sticky action bar pass `bottomNav={false}`.
