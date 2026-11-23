# Step 8 — Deploy Result

**Work package:** P17 (WBS 10.4.1 production deployment).
**Date of this check:** November 23, 2026.

## Live URL

**https://mikeyy2.github.io/bcs-prototype/**

| | |
|---|---|
| Status | **Live and verified** — 52 of 52 live checks passed |
| Repository | `mikeyy2/bcs-prototype`, public |
| Pages source | GitHub Actions (`build_type: workflow`) |
| Deployed commit | `eef746e` — matches `origin/main` and the local `HEAD` |
| Workflow | `.github/workflows/deploy.yml`, last run succeeded |

## Who deployed it

**The team deployed this manually through GitHub.** Michael created the public repository
and set Pages to deploy from GitHub Actions. Neither the repository nor the Pages
configuration was created or changed from this session, and nothing was pushed,
reconfigured or redeployed while running this check — it is read-only verification of what
is already published.

One earlier workflow run failed on three mobile-overflow checks (the Linux font fallback;
see FONT-2 in `05-build-log.md`). That was fixed before this check, and the deployment
serving the site now is from the current `main`.

## Method

A real Chromium browser driven by Playwright against the live HTTPS URL, not the dev
server or a local build. The script is committed at `qa/live-check.mjs`, so the run is
reproducible. Screenshots are in `docs/screenshots/`, named `live-<screen-id>.png`.

## Checks performed

### Serving and assets

| Check | Result |
|---|---|
| Index returns 200 over HTTPS | pass |
| Served from the `/bcs-prototype/` base path | pass |
| Page title set | pass |
| **Every image loads** — 18 images on C-01, all with a non-zero natural width | pass |
| Stylesheet applied (hero band renders `rgb(15, 82, 87)`) | pass |
| Design tokens present (`--bcs-primary` is `#0f5257`) | pass |

### Screens rendered live — all 18 routes

C-01, C-02, C-03, C-04, S-01, V-01, V-02, V-03, E-01, E-02, D-01, D-03, P-01, P-02, P-03,
A-01, A-02, A-03 — each loaded and screenshotted. D-02 and E-02a are reached through a
flow and are captured as `live-D-02.png` and `live-E-02a.png`.

### Inner pages survive a refresh

| Route | Result |
|---|---|
| `#/volunteer/opp-2` hard refresh | pass — same screen, URL preserved |
| `#/events/evt-1` hard refresh | pass |
| `#/admin/reports` hard refresh | pass |
| Unknown route `#/does-not-exist` | pass — falls back to home, no error page |

This is the check that would fail if `base` or the router were wrong on Pages.

### Role: Volunteer

| Check | Result |
|---|---|
| Signs in and lands on V-03 | pass |
| Catalogue search filters results | pass |
| Registers for a shift | pass — `live-journey-volunteer.png` |
| Confirmation and 24-hour reminder reach the mock outbox | pass |
| Booking appears in My Activity | pass |
| RSVPs to an event, confirmation overlay shown | pass — `live-E-02a.png` |

### Role: Donor

| Check | Result |
|---|---|
| Signs in as Donor | pass |
| Completes a mock donation; receipt shows donor, amount and processor reference | pass — `live-D-02.png` |
| Submits an in-kind offer and books a drop-off slot | pass — `live-journey-donor.png` |

### Role: Partner

| Check | Result |
|---|---|
| Signs in and lands on P-02 | pass |
| Sees its own listings | pass |
| Creates a listing that is pending approval | pass — `live-journey-partner.png` |
| The pending listing is not publicly visible | pass |

### Role: BCS Staff

| Check | Result |
|---|---|
| Signs in and lands on A-01 | pass |
| The partner's listing arrived in the approval queue | pass |
| Rejection without a reason is blocked | pass |
| The rejection reason is emailed to the mock outbox | pass — `live-journey-staff.png` |
| Account search works | pass |
| Suspending an account reports back | pass |
| CSV export downloads from the live site (`bcs-donations-report.csv`) | pass |

### Responsive and hygiene

| Check | Result |
|---|---|
| No horizontal overflow at 375px | pass — 0px |
| No horizontal overflow at 768px | pass — 0px |
| **No console errors** across the entire run | pass |
| **No failed requests** across the entire run | pass |

## Known limits of this deployment

1. **The whole platform is a mock.** Sign-in is a role switcher, payments take no card,
   email goes to an on-page outbox and all data is seeded fixtures in `localStorage`. Every
   simulated feature is labelled **Mock** on screen. Nothing on this site is real.
2. **State is per-browser.** `localStorage` is not shared, so two people visiting the live
   URL see independent data, and clearing site data resets everything. "Reset demo data" in
   the outbox panel does the same deliberately.
3. **Hash URLs.** Links look like `/#/volunteer`. HashRouter is what makes refresh work on
   Pages, which has no server-side rewrite.
4. **Public and unauthenticated.** GitHub Pages on a free account cannot be private, and
   the "BCS Staff" console is reachable by anyone who picks that role. Acceptable only
   because every record is invented demo content.
5. **C-04 is a responsive derivation,** not the drawn mobile layout. The live mobile home is
   C-01 reflowed; Figma's version has a teal hero card, an orange button, quick-action tiles
   and a bottom tab bar.
6. **Four SRS services are deferred** — Event Hosting, Equipment Rental, Shuttle & Rides and
   the Event Package — along with their ten screens.
7. **Chromium only.** This check did not run Firefox, Safari or Edge, and no screen reader
   was used against the live site.
8. **No uptime monitoring or backups.** If the repository is made private or Pages is turned
   off, the site disappears; there is nothing to back up because there is no server state.

Full gap list: `07-handoff.md`. Test evidence: `06-test-report.md`.

## Acceptance (WBS 10.4.2)

The site is live, publicly reachable and verified end to end for all four roles, so
acceptance sign-off against SRS §1.4 is now possible. It is the sponsor's and instructor's
to give, against the limits above.
