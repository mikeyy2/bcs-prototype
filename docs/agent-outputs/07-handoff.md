# Step 7 — Handoff

**Work package:** P17 (WBS 10.3.1 documentation, 10.4.1 deployment, 10.4.2 acceptance).

This is a **functional prototype**, not a production system. Nothing below should be read
as production-ready.

## Status

| | |
|---|---|
| Screens built | **19 of 20** as drawn; C-04 is a responsive derivation of C-01, not the drawn mobile layout |
| Screens deferred | 10 — they exist in neither Figma nor the SRS prototype index as built |
| Tests | 367 passing, 0 failing, 57 skipped |
| Lint, typecheck, build | Clean |
| Deployed | **Yes** — https://mikeyy2.github.io/bcs-prototype/ |

## Deployment: live

**https://mikeyy2.github.io/bcs-prototype/** — deployed from `main` by
`.github/workflows/deploy.yml`. The repository owner created the public repo and enabled
Pages; the workflow has been green since run `45082816033`.

Verified on the live site in a browser: home loads with its styling and icons, a deep link
survives a refresh, the volunteer registration journey completes, the mock outbox fills,
no console errors, no failed requests, no mobile overflow at 360px. Evidence:
`docs/screenshots/live-home-1440.png`.

### The first run failed, and why

The first push failed CI on three P15 overflow checks that pass on macOS (C-03 9px,
V-01 15px, V-03 9px at 360px). Inter is not bundled (FONT-1), so the Linux runner falls
back to a wider font and two zero-slack layouts spilled over: the Input was a fixed 320px
inside a 320px content box, and the header's right-hand cluster could neither shrink nor
wrap. Both are fixed (FONT-2), and `responsive.spec.ts` now re-checks every route at 360px
with a deliberately wide font forced, so the same class of defect fails locally too.

### Checklist, for reference or a fresh deploy

1. **Create a public repository named exactly `bcs-prototype`.** The name must match
   `base` in `vite.config.ts`. A different name means every asset 404s; change `base` to
   match if you use another name.
2. `git remote add origin git@github.com:<owner>/bcs-prototype.git`
3. `git push -u origin main`
5. **Settings → Pages → Source → GitHub Actions.** Do not pick "Deploy from a branch".
5. The workflow at `.github/workflows/deploy.yml` runs on every push to `main`: install,
   lint, typecheck, build, Playwright, then `upload-pages-artifact` and `deploy-pages`.
6. The site lands at `https://<owner>.github.io/bcs-prototype/`.

| Item | Value |
|---|---|
| Build command | `npm run build` |
| Output folder | `dist` |
| Node version | 22 (pinned in the workflow) |
| Environment variables | **None.** There are no secrets, keys or external services |
| Cost | £0 — GitHub Pages is free for public repositories |
| Visibility | Public. Pages on free accounts cannot be private |

### Verify after the first deploy

- The home page loads at the Pages URL with styling and icons.
- Open `.../#/volunteer/opp-2` directly and refresh — it must stay on that screen. This is
  what HashRouter is for; if it breaks, `base` is wrong.
- Register for a shift, then open the Mock outbox and confirm two entries appear.
- No console errors, no missing images.

### Undoing it

Settings → Pages → set Source to "None". The site goes offline; the repository is
untouched. To roll back one release instead, revert the commit and push — the workflow
redeploys the previous build.

## Requirements and packages completed

All 17 work packages in the approved plan. Requirements closed: REQ-VOL-1…10,
REQ-DON-1…8, REQ-EVT-1…5 and 13, REQ-PRT-1…5, REQ-ADM-1…4 and 7, REQ-SRC-1…3,
REQ-DSH-1…2, REQ-AUTH-1…5, REQ-PRF-1…3, REQ-NTF-1…2, REQ-BKG-1…3, REQ-COM-1, 2, 5.

Full mapping: `03-requirements-traceability.md`. Test evidence: `06-test-report.md`.

## Mocked features

Payments, transactional email, scheduled reminders, authentication and sessions, file
uploads and object storage, and the database itself. Each is labelled **Mock** in the UI.
Details in the README.

## Known gaps

1. **C-04 is not built as drawn.** The Figma mobile home is a distinct layout — teal hero
   card, orange button, three quick-action tiles, bottom tab bar. The app serves C-01
   reflowed at phone width. See `06-test-report.md` gap 1.
2. **Nineteen screens have no Figma mobile or tablet design.** Only C-01 has a 390px frame.
   Those layouts are derivations — checked for overflow and accessibility, not against a design.
3. **Fifteen of twenty frames were not compared side by side with Figma.** QA-3 showed the
   layer tree hides fill-level differences, so the same class of defect may remain.
4. **Atomicity is simulated** (REQ-BKG-1). One browser tab has no concurrency.
5. **Timing windows are simulated** (REQ-VOL-8, REQ-DON-5, REQ-NTF-1/2). Timestamps compute
   correctly; no clock advances.
6. **About, Contact and FAQ do not exist** (REQ-COM-3, REQ-COM-4, both High priority). They
   have no Figma frames, so by agreement the header and footer links are inert.
7. **A-03's third report is missing** (part of REQ-ADM-7). Service usage and fee revenue
   cover deferred services. The screen says so.
8. **An approved partner listing does not reach the public catalogue.** The partner sees
   "Published" and staff see the decision, but created listings live outside the seeded
   opportunity set.
9. **P-03 has no shift editor.** One date and one capacity per listing, where Figma draws a
   repeatable shift row.
10. **Eight SRS TBDs are unresolved.** The receipt prints `TBD-6 — not yet supplied` rather
    than an invented tax ID.
11. **Inter is not bundled**; platforms fall back to different fonts. Layouts are now
    hardened against that (FONT-2) and guarded by a test, but glyphs still differ.
12. **No milestone dates exist.** The Scope contains none; M1–M5 are sequence-only.
13. **Chromium only.** No Firefox, Safari or Edge run, and no manual screen-reader pass.

## Deviations from Figma

Fourteen, each with an ID, a reason and its approval status, in
`05-build-log.md`. The largest is **PAY-1**: the donation screen renders no card inputs at
all, where Figma draws a full Stripe card form. There is no processor on static hosting, and
REQ-DON-2 with NFR-SEC-2 require that BCS never receives card data.

## What a real product would still need

- **A backend.** A real database, server-side authorisation (NFR-SEC-7 cannot be met in a
  browser), password hashing, and an audit log that a user cannot edit.
- **Real Stripe and a real email provider**, with webhook verification and idempotency.
- **Genuine atomic booking** — transactions or row locks, so two users cannot take the last
  seat.
- **The four deferred services** and their ten screens, which is roughly half the SRS.
- **The customer's eight TBDs**, especially the tax ID, the fee schedule and the
  cancellation rules.
- **Accessibility beyond automation**: a screen-reader pass and testing with the elderly and
  disabled users SRS §2.3 names.
- **Backups, monitoring and a restore test** (NFR-REL-2).
- **Mobile and tablet designs** for the nineteen screens that have none.

## Acceptance (WBS 10.4.2)

The site is live and publicly reachable, so sign-off against SRS §1.4 is now possible. It
is the sponsor's and instructor's to give, against the known gaps above — notably that
C-04 is a responsive derivation rather than the drawn mobile design, and that four SRS
services remain deferred.
