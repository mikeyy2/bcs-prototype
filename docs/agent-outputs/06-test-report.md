# Step 6 — Test Report

**Role:** QA tester.
**Work package:** P16 (WBS 10.2.1 functional testing, 10.2.2 accessibility testing).
**Run:** full suite against the production build, served by `vite preview` on the GitHub
Pages base path `/bcs-prototype/`.

Only checks that were actually executed are recorded here. Anything not run is listed under
"Not run" with the reason.

## Summary

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` (oxlint) | **Pass**, 0 warnings |
| Typecheck | `npm run typecheck` (`tsc -b --noEmit`) | **Pass** |
| Build | `npm run build` | **Pass** |
| Browser tests | `npm test` (Playwright) | **340 passed, 0 failed, 40 skipped** |

The 40 skipped cases are `responsive.spec.ts` under the mobile project: that file sets its
own viewport per case, so running it a second time at a fixed device size would repeat the
same widths. It runs in full under the desktop project.

Two browser projects run every other file: **desktop** (Chromium, 1440×900) and **mobile**
(Pixel 7, 412×915).

## Coverage by file

| Spec | Cases | Covers |
|---|---|---|
| `foundation.spec.ts` | 26 | P0 scaffold, Pages base path, hash routing, refresh survival, design tokens, primitives through real screens |
| `shell.spec.ts` | 32 | P2 header/footer/sidebars, mock sign-in, role-based access |
| `data.spec.ts` | 8 | P3 mock outbox, demo reset, localStorage keys |
| `home.spec.ts` | 18 | P4 C-01 |
| `volunteer.spec.ts` | 20 | P5 V-01 search, filters, pagination, empty state |
| `opportunity.spec.ts` | 16 | P6 V-02 registration, the main journey |
| `activity.spec.ts` | 16 | P7 V-03 dashboard, cancellation, history tabs |
| `events.spec.ts` | 32 | P8 E-01, E-02, E-02a |
| `donate.spec.ts` | 22 | P9 D-01, D-02, anonymous giving, no card inputs |
| `giveitems.spec.ts` | 16 | P10 D-03 in-kind offers and slot booking |
| `search.spec.ts` | 16 | P11 S-01 |
| `profile.spec.ts` | 18 | P12 C-03 profile, preferences, deletion |
| `partner.spec.ts` | 24 | P13 P-01, P-02, P-03 |
| `admin.spec.ts` | 36 | P14 A-01, A-02, A-03 |
| `responsive.spec.ts` | 80 | P15 every screen at four widths, axe at two widths |
| **Total** | **380** | |

## Requirement verification

Every in-scope requirement with a Figma screen has at least one executed check.

| Requirement | Verified by |
|---|---|
| REQ-VOL-1, 2, 3 | `volunteer.spec.ts` — 20 per page, keyword over title/org/category, combined filters |
| REQ-VOL-4, 5 | `opportunity.spec.ts` — all detail fields; capacity drops by one and persists; full shifts unselectable |
| REQ-VOL-6 | `opportunity.spec.ts` — visitor redirected to C-02 and returned to the same opportunity |
| REQ-VOL-7 | `activity.spec.ts` — cancel releases the slot; disabled inside 24 hours |
| REQ-VOL-8 | `opportunity.spec.ts` — confirmation and 24-hour reminder in the outbox |
| REQ-VOL-9 | `partner.spec.ts` — marking attended creates the hours record |
| REQ-VOL-10 | `activity.spec.ts` — total equals the sum of attended shifts |
| REQ-DON-1 | `donate.spec.ts` — four presets; $0.50 rejected |
| REQ-DON-2 | `donate.spec.ts` — no card input exists (structural check on inputs, labels, autocomplete) |
| REQ-DON-3, 4 | `donate.spec.ts`, `admin.spec.ts` — "Anonymous" everywhere incl. staff reports; no email means no receipt |
| REQ-DON-5 | `donate.spec.ts` — receipt carries all five fields |
| REQ-DON-6, 7 | `giveitems.spec.ts` — offer reaches the queue; booked slots unselectable |
| REQ-DON-8 | `activity.spec.ts` — donation history |
| REQ-EVT-1, 13 | `events.spec.ts` — calendar, category filter, month paging |
| REQ-EVT-2, 3, 4 | `events.spec.ts` — detail fields; RSVP with guests; Full disables RSVP |
| REQ-EVT-5 | `activity.spec.ts` — RSVP cancellation |
| REQ-PRT-1, 2 | `partner.spec.ts` — application fields, EIN validation, reaches the queue |
| REQ-PRT-3, 4, 5 | `partner.spec.ts` — listing created pending and invisible publicly |
| REQ-ADM-1 | `admin.spec.ts` — search, suspend, reactivate |
| REQ-ADM-2 | `admin.spec.ts` — revoking unpublishes every listing |
| REQ-ADM-3 | `admin.spec.ts` — staff account with a role |
| REQ-ADM-4 | `admin.spec.ts` — one queue, rejection blocked without a reason, reason emailed |
| REQ-ADM-7 | `admin.spec.ts` — totals match records; CSV downloads |
| REQ-SRC-1, 2, 3 | `search.spec.ts` |
| REQ-DSH-1, 2 | `activity.spec.ts` |
| REQ-AUTH-1, 2, 3 | `shell.spec.ts` — mocked; the role switcher is the mechanism |
| REQ-AUTH-4, 5 | `shell.spec.ts`, `profile.spec.ts`, `partner.spec.ts` — logout clears the role; guards block each console |
| REQ-PRF-1, 2, 3 | `profile.spec.ts` — fields persist; reminders off stops reminders; deletion keeps donations |
| REQ-NTF-1, 2 | `opportunity.spec.ts`, `events.spec.ts`, `admin.spec.ts` — one entry per trigger, reminders dated 24h earlier |
| REQ-BKG-1, 3 | `opportunity.spec.ts`, `events.spec.ts` — shared capacity model; dates in BCS local time |
| REQ-COM-1, 2 | `shell.spec.ts`, `home.spec.ts` |
| REQ-COM-5 | `responsive.spec.ts` — 360, 768, 1440, 1920 with no horizontal overflow |
| NFR-USE-1 | `responsive.spec.ts` — axe WCAG 2.1 AA on all 20 screens at two widths; keyboard journey |
| NFR-USE-2 | `responsive.spec.ts` — donation completes in three steps from home |
| NFR-USE-3 | `responsive.spec.ts` — 44px touch target |
| NFR-MNT-2 | This suite — every High-priority in-scope requirement has a passing test |

## Defects found and fixed during testing

| # | Defect | Fix |
|---|---|---|
| 1 | Figma palette missed WCAG AA: muted text 2.15:1, green badge 4.41:1, yellow badge 4.44:1 | Solid colours and 5% darkening (A11Y-1…3), approved |
| 2 | Logo and avatar accessible names did not contain their visible text (`label-content-name-mismatch`) on every signed-in screen | Visual text hidden from the accessibility tree, screen-reader label added |
| 3 | Console and activity tables scrolled horizontally on phones, putting row actions out of physical reach | Rows stack below 820px (RESP-2) |
| 4 | The floating mock-outbox button covered page content on narrow screens | Page reserves 84px at the bottom below 820px |
| 5 | V-01, E-02, D-01 and P-01 overflowed a 360px screen by 22–30px | Grid children given `min-width: 0` so the track is not sized by min-content |
| 6 | Donation form errors were page-level only; the invalid field was not marked | Errors bound to their field, setting `aria-invalid` and `role="alert"` |

## Known gaps, accepted

- **Nineteen of twenty screens have no Figma mobile design.** Only C-01 has a 390px frame.
  Every other mobile and tablet layout is a derivation, verified for overflow and
  accessibility but not against a design.
- **Atomicity is simulated.** REQ-BKG-1 asks that two users never take the last unit. A single
  browser tab has no concurrency, so the conflict rule is exercised but true atomicity is not.
- **Timing windows are simulated.** REQ-VOL-8, REQ-DON-5 and REQ-NTF-1/2 specify real-world
  windows. The outbox records correctly computed timestamps; no clock is advanced.
- **No automated cross-browser run.** Chromium only.

## Not run

| Check | Why |
|---|---|
| Live-site verification | Not deployed. Needs the public repo and Pages enabled. |
| Firefox, Safari, Edge | Only Chromium is installed; the plan scoped one browser. |
| Load test for NFR-PERF-3 (200 concurrent users) | Meaningless for static files with no backend. |
| Screenshot diffing against Figma frames | Not set up; comparison against the design was done by eye. |
| Manual screen-reader pass | axe is automated-only; it cannot replace a VoiceOver or NVDA run. |
