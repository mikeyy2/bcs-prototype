# Best Community Services — functional prototype

A **functional prototype** of the BCS platform, built for Iowa State SE 3290 by Team 11
(Michael Proeschel, Noah Wons, Dylan Sinykin, Schon Huxley).

It is a course prototype, not a product. Every server-backed feature is simulated in the
browser and labelled **Mock** on screen.

## Purpose and scope

The prototype implements the **20 screens that exist in the Figma file**
[BCS Prototype Team 11](https://www.figma.com/design/IXg1ROaZ3ZQcv2h85KsCTQ/BCS-Prototype-Team-11):
the public site, the volunteer and donation journeys, the events calendar, the partner
console and the staff console.

**Deferred** (SRS TBD-8 — designed in neither Figma nor code): Event Hosting, Equipment
Rental, Shuttle & Ride Services and the Event Package. Their ten screens do not exist, so
the requirements behind them are not built. See
[`docs/agent-outputs/03-requirements-traceability.md`](docs/agent-outputs/03-requirements-traceability.md).

## Running it

```bash
npm install
npm run dev        # http://localhost:5173/bcs-prototype/
```

| Command | What it does | Verified |
|---|---|---|
| `npm run dev` | Dev server with hot reload | yes |
| `npm run build` | Production build into `dist/` | yes |
| `npm run preview` | Serves the production build | yes |
| `npm run lint` | oxlint | yes |
| `npm run typecheck` | `tsc -b --noEmit` | yes |
| `npm test` | Playwright, desktop + Pixel 7 | yes — 340 pass |

Playwright needs its browser once: `npx playwright install chromium`.

## Stack

Vite + React + TypeScript, React Router (**HashRouter**), CSS Modules over CSS custom
properties, Playwright with `@axe-core/playwright`. State lives in `localStorage`. No
backend, no database, no third-party services.

`vite.config.ts` sets `base: '/bcs-prototype/'`, which must match the repository name.

## How the mocking works

GitHub Pages serves static files only, so everything below is simulated:

| Real system | What the prototype does | Labelled |
|---|---|---|
| Database | `src/data/seed.ts` fixtures, merged with a `localStorage` overlay | — |
| Stripe checkout | A payment step that collects **no card details at all** | Mock payment |
| Transactional email | Every email is written to a **Mock outbox**, reachable from any screen | Mock email sent |
| Scheduled reminders | Written at booking time, dated 24 hours before the booking | Mock email |
| Login and sessions | The "Continue as" row on the sign-in screen picks a role | Mock sign-in |
| File uploads | File name and size are kept, the bytes are discarded | Mock upload |

Signing in: open **Log In** and choose Volunteer, Donor, Partner or BCS Staff. There is no
password. **Reset demo data** in the Mock outbox panel restores the seed exactly.

Seeded dates are stored as offsets from today, so the calendar and shift lists never go
stale.

## What is real

Browsing, keyword search, filtering, pagination, capacity and conflict checks, cancellation
windows, form validation, role-based route guards, CSV export, time-zone handling, the
responsive layouts and keyboard accessibility all genuinely work.

## Documentation

| File | Contents |
|---|---|
| `docs/` | The SRS, Project Scope, Risk Management register and the course process guide — originals, unmodified |
| `docs/figma-frame-links.md` | Every frame and component node ID |
| `docs/agent-outputs/01-read-check.md` | What was read, missing and unclear |
| `docs/agent-outputs/02-design-map.md` | Screens, components, tokens, journeys, gaps |
| `docs/agent-outputs/03-requirements-traceability.md` | Requirement → screen → real or mocked |
| `docs/agent-outputs/04-build-plan.md` | Work packages and definition of done |
| `docs/agent-outputs/05-build-log.md` | One row per package, and every approved deviation |
| `docs/agent-outputs/06-test-report.md` | The executed test run |
| `docs/agent-outputs/07-handoff.md` | Known gaps and what a real product would still need |
| `CLAUDE.md` | Ground rules for working in this repo |

## Deploying

Not yet deployed. The checklist is in
[`docs/agent-outputs/07-handoff.md`](docs/agent-outputs/07-handoff.md); it needs a public
repository and Pages switched to GitHub Actions, neither of which has been done.
