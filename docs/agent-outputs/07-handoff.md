# Step 7 — Handoff

**Work package:** P17 (WBS 10.3.1 documentation, 10.4.1 deployment, 10.4.2 acceptance).

This is a **functional prototype**, not a production system. Nothing below should be read
as production-ready.

## Status

| | |
|---|---|
| Screens built | **20 of 20** that exist in Figma |
| Screens deferred | 10 — they exist in neither Figma nor the SRS prototype index as built |
| Tests | 340 passing, 0 failing, 40 skipped |
| Lint, typecheck, build | Clean |
| Deployed | **No** — see below |

## Deployment: not done, and why

The build is deploy-ready, but publishing needs actions only the repository owner can take.
Under `CLAUDE.md` I do not create repositories, add remotes, push or deploy without being
asked, so none of that has happened. There is no remote configured and nothing has left
this machine.

### Checklist for whoever deploys

1. **Create a public repository named exactly `bcs-prototype`.** The name must match
   `base` in `vite.config.ts`. A different name means every asset 404s; change `base` to
   match if you use another name.
2. `git remote add origin git@github.com:<owner>/bcs-prototype.git`
3. `git push -u origin main`
4. **Settings → Pages → Source → GitHub Actions.** Do not pick "Deploy from a branch".
5. The workflow at `.github/workflows/deploy.yml` runs on every push to `main`: install,
   lint, typecheck, build, Playwright, then `upload-pages-artifact` and `deploy-pages`.
6. The site lands at `https://<owner>.github.io/bcs-prototype/`.

| Item | Value |
|---|---|
| Build command | `npm run build` |
| Output folder | `dist` |
| Node version | 20 (pinned in the workflow) |
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

1. **Nineteen screens have no Figma mobile design.** Only C-01 has a 390px frame. The other
   mobile and tablet layouts are derivations — checked for overflow and accessibility, not
   against a design.
2. **Atomicity is simulated** (REQ-BKG-1). One browser tab has no concurrency.
3. **Timing windows are simulated** (REQ-VOL-8, REQ-DON-5, REQ-NTF-1/2). Timestamps are
   computed correctly; no clock advances.
4. **About, Contact and FAQ do not exist** (REQ-COM-3, REQ-COM-4, both High priority). They
   have no Figma frames, so by agreement the header and footer links are inert.
5. **The third report is missing** (part of REQ-ADM-7). Service usage and fee revenue cover
   deferred services, so there is nothing to report on. A-03 says so on screen.
6. **P-03 has no shift editor.** One date and one capacity per listing, where Figma draws a
   repeatable shift row.
7. **Eight SRS TBDs are unresolved.** The donation receipt prints `TBD-6 — not yet supplied`
   instead of a tax ID, rather than inventing one.
8. **Inter is not bundled**; machines without it fall back to a system font.
9. **No milestone dates exist.** The Scope contains none; M1–M5 are sequence-only.
10. **Chromium only.** No Firefox, Safari or Edge run, and no manual screen-reader pass.

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

Sign-off against SRS §1.4 cannot be completed yet: it requires a deployed, publicly
reachable site, and deployment is still outstanding.
