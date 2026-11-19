# Step 4 — Build Plan

**Role:** Tech lead planning work for a four-person student team.
**Hosting:** GitHub Pages, deployed by a GitHub Actions workflow from a public repo.
**Scope decision:** build only the 20 screens that exist in Figma. Event Hosting, Equipment
Rental, Shuttle & Ride Services and the Event Package are formally deferred (SRS TBD-8).

## Work packages

| # | Package | WBS ID | Milestone | Deliverable | Acceptance check |
|---|---|---|---|---|---|
| P0 | Repo scaffold & deploy skeleton | 10.4.1, 10.3.1 | M1 | Vite+React+TS app, ESLint, Playwright, Actions workflow, `base` + HashRouter | Blank app builds locally and loads at the Pages URL; inner route survives refresh |
| P1 | Design tokens & primitives | 9.4.2 | M1 | CSS custom properties for the 6 Figma variables; Button (primary/secondary), Input, Badge (3 colors, 19 labels), Card, Logo | Each primitive renders all variants; visible focus ring on every interactive element |
| P2 | App shell & role switcher | 9.4.1, 9.1.1, 9.1.3 | M1 | Header, Footer, Sidebar/Admin, Sidebar/Partner, routing, "Continue as" role state | All four nav surfaces wired (fixes the Figma gap); volunteer role cannot reach `/admin/*` |
| P3 | Mock data & services layer | 9.6.1, 9.3.1, 9.3.2 | M2 | Seed JSON, localStorage overlay, availability/holds engine, Mock outbox, "Reset demo data" | Register → state persists across refresh; reset restores seed exactly |
| P4 | C-01 Home | 9.4.1 | M2 | Hero, featured opportunities, upcoming events, CTAs | Cards and rows link to V-02/E-02; matches Figma at 1440px |
| P5 | V-01 Volunteer discovery | 1.1.1, 1.1.2 | M2 | List, 20/page, keyword search, 4 filters, result count | REQ-VOL-1/2/3 checks pass; two filters + search combine |
| P6 | **V-02 detail & registration — main journey** | 1.1.3, 1.2.1, 1.2.2, 1.2.3 | M2 | Detail page, shift picker, register, mock confirmation email | Slots −1; full shift unselectable; outbox gains confirmation + 24h reminder |
| P7 | V-03 My Activity | 1.3.2, 8.2.1, 2.3.1 | M3 | Upcoming, history tabs, hours total, chart, cancel actions | Total hours = sum of attended; cancel blocked inside 24h |
| P8 | E-01 / E-02 / E-02a Events | 3.1.1, 3.1.2, 3.2.1, 3.2.2 | M3 | Calendar, detail, RSVP + guests, Full state, confirmation overlay | Capacity −(1+guests); at capacity RSVP disables and marks Full |
| P9 | D-01 / D-02 Donations | 2.1.1, 2.1.2, 2.1.3, 9.5.1 | M3 | Amounts, donor details, **Mock payment**, thank-you + receipt | Custom $0.50 rejected; no card field exists; receipt has all 5 fields |
| P10 | D-03 Give Items | 2.2.1, 2.2.2 | M3 | In-kind form, mock upload, drop-off slot picker | Booked slot unselectable; offer appears in A-01 |
| P11 | S-01 Search | 8.1.1 | M4 | Cross-service search, grouped results, type filter | Pending/unapproved listings never returned |
| P12 | C-03 Profile & notifications | 9.2.1, 9.2.2 | M4 | Profile edit, preferences, delete account | Disabling reminders suppresses that outbox entry |
| P13 | P-01 / P-02 / P-03 Partner console | 6.1.1, 6.2.1, 6.3.1, 1.3.1 | M4 | Application, dashboard, create listing, attendance marking | Submitted listing is pending and invisible on V-01 until approved |
| P14 | A-01 / A-02 / A-03 Admin console | 7.1.1–7.1.3, 7.2.1, 7.4.1–7.4.3 | M4 | Approval queue, accounts, reports + CSV | Reject without reason blocked; report total = sum of records; CSV downloads |
| P15 | Responsive & accessibility pass | 9.4.2 | M5 | Mobile (390) and tablet (768) layouts for all 20 screens; empty + error states throughout | Renders 360–1920px with no horizontal scroll; axe reports no critical issues; full keyboard traverse |
| P16 | Test suite & report | 10.2.1, 10.2.2 | M5 | Playwright specs for the 5 main journeys + a11y checks; `docs/test-report.md` | Suite green in CI; every High-priority requirement has ≥1 test |
| P17 | Deploy, README & handoff | 10.4.1, 10.4.2, 10.3.1 | M5 | Live Pages URL, README, handoff note, known-gaps list | Live site passes the P15/P16 checks; a teammate can clone and run from README alone |

## Milestones

No dates — the Scope and SRS contain none, and the deadline was never supplied.

- **M1** shell deploys
- **M2** volunteer journey end-to-end
- **M3** member services complete
- **M4** partner + admin consoles complete
- **M5** tested, responsive, handed off

Suggested ownership for four people: P1/P2 + P15 (shared UI), P3 + P5/P6/P7 (volunteer core),
P8/P9/P10 (events + donations), P13/P14 (consoles). P0, P16, P17 are shared.

## Stack

| Choice | Reason |
|---|---|
| **Vite + React + TypeScript** | Zero-config static build, instant HMR, outputs plain files Pages can serve |
| **React Router (HashRouter)** | Inner pages survive refresh on Pages with no server rewrite |
| **CSS Modules + CSS custom properties** | The six Figma variables map 1:1 to CSS vars; no extra build step |
| **ESLint + `tsc --noEmit`** | Lint and typecheck without adding a framework |
| **Playwright** | Real-browser journey tests plus `@axe-core/playwright` for WCAG |
| **localStorage** | The whole persistence layer; no database |

```
npm create vite@latest . -- --template react-ts
npm install react-router-dom
npm install -D eslint @playwright/test @axe-core/playwright
npx playwright install chromium
```

Figma's MCP emits Tailwind classes, so each screen needs mechanical conversion to CSS Modules.
Tailwind was **not** adopted: it would need explicit approval under the CLAUDE.md package rule,
and Figma's own guidance says not to install it unasked.

## Hosting

- **`vite.config.ts`** — `base: '/bcs-prototype/'` (must match the repo name exactly, leading
  and trailing slash).
- **Router** — `HashRouter`, giving `/#/volunteer`. Bulletproof on Pages, no 404 trick needed.
  The alternative is `BrowserRouter` plus copying `index.html` to `404.html` at build time;
  cleaner URLs but it flickers on deep-link refresh.
- **`.github/workflows/deploy.yml`** — on push to `main`: checkout → setup-node 20 →
  `npm ci` → `npm run lint` → `npm run build` → `upload-pages-artifact` (`./dist`) →
  `deploy-pages`. Needs `permissions: {contents: read, pages: write, id-token: write}` and
  `concurrency: {group: "pages"}`.
- **Manual steps, owner-only:** create the public repo, add the remote, then
  Settings → Pages → Source → **GitHub Actions**.

## Definition of done

**Per package** — build passes; ESLint and `tsc --noEmit` clean; Playwright specs for that
package green; screens match their Figma frame at 1440px; keyboard-reachable with visible
focus; empty and error states present; every mocked feature carries a visible **Mock** label;
report of files changed, requirement/WBS IDs covered, check results, open issues.

**Project** — all 20 Figma screens built; every High-priority in-scope requirement has a
passing test or a recorded manual check; renders 360–1920px; no critical axe violations on
core pages; no console errors, no broken links, no secrets, no real personal data; live on
Pages with inner routes surviving refresh; README + handoff list mocked features, deferred
services and known gaps; called a **functional prototype** throughout.

## Open items carried forward

1. **Mock outbox** is a new surface not in Figma. Scoped as a slide-over panel in the house
   style rather than a new page.
2. **About / Contact / FAQ** are out (no frames), so REQ-COM-3 and REQ-COM-4 go unmet and six
   footer links plus two header links stay inert.
3. **REQ-DON-3/4 anonymous donation** left out of P9 to honor "only build screens that exist
   in Figma"; can be added as a labeled deviation.
4. **Milestone dates** — M1–M5 are sequence-only until a deadline is supplied.
