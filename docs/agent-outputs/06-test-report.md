# Step 6 — Test Report

**Role:** QA tester.
**Work package:** P16 (WBS 10.2.1 functional testing, 10.2.2 accessibility testing), plus a
browser-driven QA pass over the running app.

Only checks that were actually executed appear here. Anything not run is in **Not run**.

## Method key

| Method | What it means |
|---|---|
| **automated** | `npm run build` / `lint` / `typecheck`, or the committed Playwright suite (`npm test`) |
| **agent-browser** | I drove a real Chromium browser against `npm run dev` with Playwright scripts in `qa/`, walking the journey by hand and asserting on what the page actually showed. Screenshots in `docs/screenshots/` |
| **manual** | Visual comparison of a captured screenshot against the Figma frame, by eye |

The Figma reference is `docs/figma-frame-links.md` (the prompt called it `docs/figma-links.md`;
that filename does not exist).

## Totals

| Check | Method | Result |
|---|---|---|
| `npm run build` | automated | **pass** |
| `npm run lint` (oxlint) | automated | **pass**, 0 warnings |
| `npm run typecheck` | automated | **pass** |
| `npm test` (Playwright) | automated | **pass** — 346 passed, 0 failed, 40 skipped |
| Journey walkthrough ×3 widths | agent-browser | **pass** — 38 checks × 375 / 768 / 1440, 0 failures |
| Screen sweep ×3 widths | agent-browser | **pass** — 51 screenshots, 0 console errors, 0 failed requests, 0 broken images, 0 dead links |
| Secrets scan | automated | **pass** — no keys, tokens or `.env` tracked |

The 40 skips are `responsive.spec.ts` under the mobile project: it sets its own viewport per
case, so a second run at a fixed device size repeats identical widths.

## Journeys

Each walked end to end in the browser at **375, 768 and 1440**; all passed at all three.
Evidence filenames are `test-journey-<name>-<width>.png`.

| Journey | Req IDs | Method | Result | Evidence |
|---|---|---|---|---|
| Volunteer signs up for a shift | REQ-VOL-2, 3, 5, 6, 8 | agent-browser | pass | `test-journey-volunteer-signup-1440.png` |
| → capacity drops by one and survives reload | REQ-VOL-5 | agent-browser | pass | 8 → 7 on reload |
| → confirmation + 24h reminder queued | REQ-VOL-8, REQ-NTF-2 | agent-browser | pass | `test-journey-mock-outbox-1440.png` |
| → booking appears in My Activity | REQ-DSH-1 | agent-browser | pass | `test-journey-my-activity-1440.png` |
| Event RSVP with guests | REQ-EVT-1, 3 | agent-browser | pass | `test-journey-event-rsvp-1440.png`; 96 → 93 seats |
| → full event blocks RSVP | REQ-EVT-4 | agent-browser | pass | `test-E-02-1440.png` |
| Money donation and mock receipt | REQ-DON-1, 2, 5 | agent-browser | pass | `test-journey-donation-receipt-1440.png` |
| In-kind item offer and slot booking | REQ-DON-6, 7 | agent-browser | pass | `test-journey-in-kind-offer-1440.png`; booked 2 → 3 |
| Partner application | REQ-PRT-1, 2 | agent-browser | pass | `test-journey-partner-application-1440.png` |
| Partner creates a listing | REQ-PRT-4, 5 | agent-browser | pass | `test-journey-partner-listing-1440.png` |
| Admin approval with required reason | REQ-ADM-4 | agent-browser | pass | `test-journey-admin-approval-1440.png` |
| Admin revokes a partner | REQ-ADM-2 | agent-browser | pass | listings vanish from V-01 |
| Admin report and CSV export | REQ-ADM-7 | agent-browser | pass | `test-journey-admin-report-1440.png`; `bcs-donations-report.csv` |

## Forms, empty states and keyboard

| Check | Req ID | Method | Result | Evidence |
|---|---|---|---|---|
| Donation rejects an amount under $1 | REQ-DON-1 | agent-browser | pass | inline field error |
| Donation requires a name unless anonymous | REQ-DON-3 | automated | pass | `donate.spec.ts` |
| In-kind blocks an empty description and a missing slot | REQ-DON-6 | agent-browser | pass | `role="alert"` |
| Partner application validates org name, EIN, document, confirmation | REQ-PRT-1 | agent-browser | pass | |
| Rejecting without a reason is blocked | REQ-ADM-4 | agent-browser | pass | |
| Staff account creation validates | REQ-ADM-3 | automated | pass | `admin.spec.ts` |
| Every form surfaces errors via `role="alert"` or `aria-invalid` | NFR-USE-1 | automated | pass | `responsive.spec.ts` |
| Catalogue, search, activity and report empty states | REQ-VOL-1, SRC-1, DSH-1, ADM-7 | agent-browser | pass | `test-journey-empty-state-1440.png` |
| First tab stop is the skip link | NFR-USE-1 | agent-browser | pass | |
| Register button reachable and operable by keyboard alone | NFR-USE-1 | agent-browser | pass | Enter produced the validation error, not a silent no-op |
| 44px touch targets | NFR-USE-3 | automated | pass | `responsive.spec.ts` |
| Donation within five steps of home | NFR-USE-2 | automated | pass | three steps |

## Responsive and accessibility

| Check | Req ID | Method | Result |
|---|---|---|---|
| All 20 screens, no horizontal overflow at 360 / 768 / 1440 / 1920 | REQ-COM-5 | automated | pass |
| All 20 screens, no critical or serious axe violations at 360 and 1440 | NFR-USE-1 | automated | pass |
| Exactly one `h1` per screen | NFR-USE-1 | automated | pass |
| Screens captured at 375 / 768 / 1440 | — | agent-browser | pass — 51 files in `docs/screenshots/` |

## Screenshots

`docs/screenshots/test-<screen-id>-<width>.png` for C-01, C-02, C-03, C-04, S-01, V-01,
V-02, V-03, E-01, E-02, D-01, D-03, P-01, P-02, P-03, A-01, A-02, A-03 at 375, 768 and 1440
(C-04 at 375 only — it is the mobile home), plus `test-journey-*.png` evidence shots.

E-02a is a modal over E-02 and is captured in `test-journey-event-rsvp-*.png`. D-02 is
captured in `test-journey-donation-receipt-*.png`.

## Figma comparison

Method: Figma frames pulled with `get_screenshot` at native size, then compared with the
captured app screenshot — by eye for C-01 and C-04, and by sampled-palette comparison for
C-01, V-02, D-01, A-01 and C-04.

| Frame | Method | Result | Notes |
|---|---|---|---|
| C-01 `1:26` | manual + palette | **pass after fix** | Four fidelity defects found and fixed — see QA-3. Palette now: app `#0F5257` 16.3% vs Figma 16.6%, `#E3F0EF` 12.8% vs 12.2%, `#E6F3EB` 1.7% vs 1.7%. Before the fix, primary was 0.6% |
| V-02 `16:109` | palette | pass | app `#F7F5F0` 50.9% / Figma 52.4%; `#0A3B3F` 18.9% / 16.3%; `#E3F0EF` 11.9% / 12.3% |
| D-01 `16:115` | palette | pass, with PAY-1 | app and Figma within 1.2% on every major surface. Figma's card-entry block is absent by design (PAY-1) |
| A-01 `16:123` | palette | pass | app `#F7F5F0` 41.3% / Figma 48.0%; `#0A3B3F` 17.2% / 17.9%. The gap is the queue being emptied as items are decided |
| C-04 `16:106` | manual | **fail — not implemented** | See gap 1 below |
| Other 15 frames | — | **not run** | Compared structurally during the build, not re-rendered side by side in this pass |

### Approved deviations confirmed present

| ID | Expected | Observed |
|---|---|---|
| A11Y-1/2 | Secondary text solid `#5B6B6E`, not 37% opacity | Confirmed in the rendered palette |
| A11Y-3 | Badge green `#2C774B`, yellow `#926200` | Confirmed; Figma's `#2E7D4F` / `#9A6700` not present |
| A11Y-4 | Buttons ≥44px tall, Figma draws 42px | Confirmed, automated check |
| A11Y-5 | Hero CTA keeps `#E8833A`, label dark not white | Confirmed, regression test |
| PAY-1 | No card inputs on D-01 | Confirmed structurally; Figma's card block absent |
| DATA-1 | Impact figures derived; Figma shows 86 / 340 | Confirmed — app shows 12 organisations |
| RESP-1/2 | Calendar and tables restack below 820px | Confirmed |

## Defects found in this pass, and fixed

| ID | Defect | Req | Found by | Fix commit |
|---|---|---|---|---|
| QA-1 | Clearing the custom donation amount left the form on **$0.00** with no preset selected; the only recovery was retyping | REQ-DON-1 | agent-browser | `16b2fe4` |
| QA-2 | Rejecting or approving a listing the partner submitted **in this session** sent no email and left the partner's table on "Pending approval" — the decision only matched seeded queue entries | REQ-ADM-4, REQ-PRT-2 | agent-browser | `16b2fe4` |
| QA-3 | C-01 hero rendered white with a teal button; cards and CTAs untinted. Built from the Figma layer tree, which carries no fills | — ("Figma decides the look") | manual Figma comparison | `e37def1` |

All three have regression tests in `tests/regressions.spec.ts`.

Six earlier defects, found during the build, are listed in `05-build-log.md`.

## Known gaps — for you to accept

1. **C-04 is not implemented as designed.** The Figma mobile home is a distinct layout: a
   dark teal hero card, an **orange** primary button, three quick-action tiles
   (Volunteer / Events / Give items) and a **bottom tab bar**. What the app serves at 375px
   is C-01 reflowed — desktop header with a scrolling nav, no tiles, no tab bar. This
   corrects my earlier claim that all 20 screens were built: 19 are, and C-04 is a
   responsive derivation rather than the drawn design. Compare
   `docs/screenshots/test-C-04-375.png` with frame `16:106`.
2. **Fifteen of twenty frames were not compared side by side** in this pass. They were built
   against the design and pass structural and accessibility checks, but QA-3 shows the layer
   tree can hide fill-level differences, so the same class of defect could exist elsewhere.
3. **Nineteen screens have no Figma mobile or tablet design.** Those layouts are derivations.
4. **Atomicity is simulated** (REQ-BKG-1) — one browser tab has no concurrency.
5. **Timing windows are simulated** (REQ-VOL-8, REQ-DON-5, REQ-NTF-1/2). Timestamps compute
   correctly; no clock advances.
6. **About, Contact and FAQ do not exist** (REQ-COM-3, REQ-COM-4, both High) — no frames, so
   the links are inert by agreement.
7. **A-03's third report is missing** (part of REQ-ADM-7) — it covers deferred services.
8. **An approved partner listing does not become publicly visible.** The partner sees
   "Published" and staff see the decision, but the listing is not added to the public
   catalogue, because created listings live outside the seeded opportunity set.
9. **Eight SRS TBDs unresolved**; the receipt prints `TBD-6 — not yet supplied`.
10. **Chromium only**, and no manual screen-reader pass.

## Not run

| Check | Why |
|---|---|
| Live-site verification | Not deployed; no repo or Pages. You asked me not to deploy |
| Figma comparison for 15 of 20 frames | Scoped to five in this pass; see gap 2 |
| Firefox, Safari, Edge | Only Chromium is installed |
| Manual screen-reader pass (VoiceOver / NVDA) | axe is automated-only and cannot replace it |
| Load test for NFR-PERF-3 (200 concurrent users) | Meaningless for static files with no backend |
| Pixel-diff regression against Figma | Not set up; comparison was by eye and by sampled palette |
