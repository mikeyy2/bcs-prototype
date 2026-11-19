# Step 3 — Requirements Traceability

**Role:** Requirements analyst.
**Sources:** Project SRS v1.0, Project Scope v0.9 (WBS + dictionary), and the Step 2 design map.
WBS IDs use the SRS §6.4 ten-branch numbering, which supersedes the Scope's eight-branch
numbering. Screen/WBS traces are the SRS's own `[WBS · screen]` tags.

## Mock strategy for the static-hosting conflict

| Backend thing the Scope/SRS assumes | Static replacement | UI label |
|---|---|---|
| PostgreSQL system of record | `/data/*.json` seed fixtures loaded at boot | — |
| Writes, bookings, state | `localStorage` overlay merged over seed; "Reset demo data" control | — |
| Stripe hosted checkout | Fake checkout screen, no card entry, always succeeds | **Mock payment** |
| Transactional email | Toast + persistent "Mock outbox" listing every email that *would* have sent, with template and recipient | **Mock email sent** |
| Scheduled reminder jobs | Pre-seeded outbox entries dated 24h before each booking | **Mock email (scheduled)** |
| Login, sessions, password reset | Role switcher on C-02 ("Continue as"), role held in localStorage | **Mock sign-in** |
| File uploads (PDF/photos) | Filename + size captured and echoed; bytes discarded | **Mock upload** |
| S3 object storage | Gray placeholder blocks already in the design | — |

Everything else — browsing, filtering, search, capacity math, validation, cancellation
windows, CSV export, routing, responsive layout, keyboard access — runs for real in the browser.

## Volunteer Management

| ID | Screen | Expected behavior | Real/Mock | WBS | Acceptance check |
|---|---|---|---|---|---|
| REQ-VOL-1 | V-01 | List active opportunities, 20/page | **Real** | 1.1.1 | Seed has >20; page 2 reachable |
| REQ-VOL-2 | V-01 | Keyword search title/org/category <2s | **Real** | 1.1.1 | Query returns only matches |
| REQ-VOL-3 | V-01 | Filters category/city-ZIP/date/org, combinable | **Real** | 1.1.2 | Two filters + search narrow correctly |
| REQ-VOL-4 | V-02 | Detail: description, date/time, location, org, skills, slots/shift | **Real** | 1.1.3 | All fields render from seed |
| REQ-VOL-5 | V-02 | One shift per registration; slots −1; full not selectable | **Real** | 1.2.1, 1.2.2 | Register drops count; full shift disabled |
| REQ-VOL-6 | C-02 | Visitor registering is sent to sign-in, returns to same opportunity | **Mock** (role switcher) | 1.2.1 | Return path preserves opportunity ID |
| REQ-VOL-7 | V-03 | Cancel up to 24h before; slot released | **Real** | 1.2.1 | Cancel allowed >24h, blocked <24h |
| REQ-VOL-8 | V-03 | Confirmation email ≤1 min; reminder 24h prior | **Mock** | 1.2.3 | Two entries appear in Mock outbox |
| REQ-VOL-9 | P-02 | Partner/staff mark Attended / No-show → hours record | **Real** | 1.3.1 | Attended creates hours = shift length |
| REQ-VOL-10 | V-03 | Past/upcoming shifts, status, total hours | **Real** | 1.3.2 | Total = sum of attended |

## Donation Management

| ID | Screen | Expected behavior | Real/Mock | WBS | Acceptance check |
|---|---|---|---|---|---|
| REQ-DON-1 | D-01 | Presets $10/25/50/100 or custom ≥$1 | **Real** | 2.1.1 | Custom $0.50 rejected |
| REQ-DON-2 | D-01 → C-05 | Hosted checkout; store only reference/amount/date/status | **Mock payment** | 2.1.1, 9.5.1 | No card fields exist anywhere |
| REQ-DON-3 | D-01 | "Give anonymously"; name shows "Anonymous" everywhere incl. reports | **Real** — *not in the design* | 2.1.3 | A-03 report shows "Anonymous" |
| REQ-DON-4 | D-01 | Anonymous may supply email for receipt; else none stored | **Real** | 2.1.3 | No email → no outbox entry |
| REQ-DON-5 | D-02 | Receipt ≤5 min: name, amount, date, tax ID (TBD-6), reference | **Mock** | 2.1.2 | Outbox entry has all five fields |
| REQ-DON-6 | D-03 | Offer goods + optional photo → staff queue ≤1 min | **Real** (upload mocked) | 2.2.1 | Offer appears in A-01 |
| REQ-DON-7 | D-03 | Pick open drop-off slot; booked slot unavailable | **Real** | 2.2.2, 9.6.1 | Design already shows `Booked (cannot be selected)` |
| REQ-DON-8 | V-03 | Donation history + re-download receipt | **Real** / receipt **Mock** | 2.3.1 | History lists both gift types |

## Events — attendance (designed) and hosting (not designed)

| ID | Screen | Expected behavior | Real/Mock | WBS | Acceptance check |
|---|---|---|---|---|---|
| REQ-EVT-1 | E-01 | Monthly calendar + list, category filter | **Real** | 3.1.1 | Filter shows only that category |
| REQ-EVT-2 | E-02 | Detail incl. capacity, accessibility info, shuttle flag | **Real** | 3.1.2 | All fields present |
| REQ-EVT-3 | E-02, E-02a | RSVP self + guests ≤ host limit; capacity drops; confirm + email | **Real** / email **Mock** | 3.2.1 | Capacity −(1+guests) |
| REQ-EVT-4 | E-02 | At capacity → RSVP disabled, marked Full | **Real** | 3.2.2 | Full state already designed |
| REQ-EVT-5 | V-03 | Cancel RSVP, release places | **Real** | 3.2.1 | Capacity restored |
| REQ-EVT-13 | E-01 | Confirmed public event on calendar ≤1 min | **Real** | 3.1.1 | Approved event appears |
| REQ-EVT-6 | **H-02 — missing** | Private events never listed/searchable; 404 to outsiders | **Deferred** | 3.2.3 | — |
| REQ-EVT-7 | **H-02 — missing** | Email invitations, unique link, yes/no | **Deferred** | 3.2.3 | — |
| REQ-EVT-8 | **H-01 — missing** | Host form: type, category, attendance, times, setup | **Deferred** | 3.3.1 | — |
| REQ-EVT-9 | **H-01 — missing** | Only free spaces ≥ expected attendance; no double-booking | **Deferred** | 3.3.2, 9.6.1 | — |
| REQ-EVT-10 | **H-01 — missing** | Show fee; 48h hold pending approval | **Deferred** | 3.3.2, 9.5.2 | — |
| REQ-EVT-11 | A-01 | Approve → payment link; confirm on pay; release unpaid after 72h; $0 confirms on approval | **Deferred** | 3.3.2, 7.2.1 | A-01 exists; no hosting item to approve |
| REQ-EVT-12 | **H-02 — missing** | Edit event, cancel, view guest list | **Deferred** | 3.3.3 | — |

## Equipment Rental · Shuttle & Rides · Event Package — all deferred

| ID range | Screen | Status | WBS |
|---|---|---|---|
| REQ-RNT-1…10 | R-01, R-02, A-04, C-05, V-03 | **Deferred** — only V-03 (cancel, RNT-10) has a design | 4.1.1–4.3.1, 9.5.3 |
| REQ-RDE-1…10 | B-01, B-02, B-03, A-04, V-03 | **Deferred** — only V-03 (cancel, RDE-9) has a design | 5.1.1–5.2.3 |
| REQ-PKG-1…3 | H-01, C-05 | **Deferred** — depends on hosting + rentals + rides | 8.3.1 |

## Partner, Admin, Composite, Common

| ID | Screen | Expected behavior | Real/Mock | WBS | Acceptance check |
|---|---|---|---|---|---|
| REQ-PRT-1 | P-01 | Application: name, EIN, status, website, contact, description, IRS PDF ≤10MB | **Real** / upload **Mock** | 6.1.1 | 11MB file rejected |
| REQ-PRT-2 | A-01 | Reaches queue ≤1 min; approve creates account; reject emails reason | **Real** / email **Mock** | 6.1.2 | Both paths change status |
| REQ-PRT-3 | P-02 | Public profile, partner-editable | **Real** | 6.2.1 | Edit reflects on profile |
| REQ-PRT-4 | P-03 | Partner CRUD on own opportunities/events | **Real** | 6.3.1 | Created listing appears pending |
| REQ-PRT-5 | A-01 | Partner content not public until approved | **Real** | 7.2.1 | Pending invisible on V-01 |
| REQ-ADM-1 | A-02 | Search/view/suspend/reactivate members; suspended can't sign in | **Real** / sign-in **Mock** | 7.1.1 | Suspended role blocked |
| REQ-ADM-2 | A-02 | Revoke partner → unpublish all its listings | **Real** | 7.1.2 | Listings vanish from V-01 |
| REQ-ADM-3 | A-02 | Create staff accounts, roles, FT/PT, deactivate | **Real** | 7.1.3 | Roles assignable |
| REQ-ADM-4 | A-01 | One queue, all five item types, reason required on reject | **Real** | 7.2.1 | Reject without reason blocked |
| REQ-ADM-5 | **A-04 — missing** | Daily ops: bookings, pickups/returns, rides, drop-offs | **Deferred** | 7.3.1 | — |
| REQ-ADM-6 | **A-04 — missing** | Block space/item/vehicle for a date range | **Deferred** | 7.3.1, 9.6.1 | — |
| REQ-ADM-7 | A-03 | Three reports, date range, totals match records, CSV | **Real** (CSV genuinely downloads) | 7.4.1–7.4.3 | Report total = sum of records |
| REQ-SRC-1 | S-01 | Search across opportunities, events, rentals, routes, grouped, <2s | **Partly real** | 8.1.1 | Only 2 of 4 types exist |
| REQ-SRC-2 | S-01 | Never return private/unapproved/retired | **Real** | 8.1.1 | Pending listing absent |
| REQ-SRC-3 | S-01 | Narrow to one type | **Real** | 8.1.1 | Type filter works |
| REQ-DSH-1 | V-03 | All upcoming bookings with view/cancel | **Partly real** | 8.2.1 | Only shifts, RSVPs, donations exist |
| REQ-DSH-2 | V-03 | History tabs: hours, donations, past bookings | **Real** | 8.2.1 | Tabs populate |
| REQ-AUTH-1 | C-02 | Register, 10-char password, email verification | **Mock** | 9.1.1 | Role switcher stands in |
| REQ-AUTH-2 | C-02 | Login; 5 failures → 15-min lock | **Mock** | 9.1.1 | Not demonstrable |
| REQ-AUTH-3 | C-02 | Password reset link, 1h expiry | **Mock** | 9.1.2 | Outbox entry only |
| REQ-AUTH-4 | — | 30-min inactivity expiry, logout | **Mock** | 9.1.2 | Logout clears role |
| REQ-AUTH-5 | — | Per-role access control | **Real** (client route guards) | 9.1.3 | Volunteer role can't open A-01 |
| REQ-PRF-1 | C-03 | Edit name/phone/address; volunteer skills; rider mobility | **Real** | 9.2.1 | Persists in localStorage |
| REQ-PRF-2 | C-03 | Toggle reminders/newsletters; confirmations always sent | **Real** | 9.2.2 | Toggle suppresses outbox entry |
| REQ-PRF-3 | C-03 | Delete account; donations kept as "Deleted user" | **Real** | 9.2.1 | Report still totals correctly |
| REQ-NTF-1 | Mock outbox (proposed) | All transactional emails ≤5 min, exactly once | **Mock** | 9.3.1 | One entry per trigger, no dupes |
| REQ-NTF-2 | Mock outbox (proposed) | 24h reminders, no duplicates | **Mock** | 9.3.2 | Seeded entries present |
| REQ-PAY-1 | **C-05 — missing** | Hosted checkout; store reference only | **Mock payment** | 9.5.1 | Folded into D-01 flow |
| REQ-PAY-2 | **C-05 — missing** | Itemized summary + emailed receipt | **Mock** | 9.5.1 | Folded into D-02 |
| REQ-PAY-3 | **A-05 — missing** | Admin sets per-service fees; $0 = free | **Deferred** | 9.5.2 | — |
| REQ-PAY-4 | — | Refunds per cancellation rule (TBD-5), recorded | **Mock** | 9.5.3 | — |
| REQ-BKG-1 | — (engine) | One availability service; atomic; no double-booking | **Partly real** | 9.6.1 | Single-browser only; no true concurrency |
| REQ-BKG-2 | — (engine) | Holds expire: 48h hosting, 15 min checkout | **Mock** | 9.6.1 | Simulated clock |
| REQ-BKG-3 | — (engine) | Store UTC, display America/Chicago | **Real** | 9.6.1 | DST date renders correctly |
| REQ-COM-1 | C-01 + all | Standard header/footer everywhere | **Real** | 9.4.1 | Present on all routes |
| REQ-COM-2 | C-01 | Home features opportunities, events, donate + host CTAs | **Partly real** | 9.4.1 | Host CTA has no target |
| REQ-COM-3 | **no frame** | About: mission, address, hours, spaces | **Deferred** | 9.4.1 | — |
| REQ-COM-4 | **no frame** | Contact form + Help/FAQ | **Deferred** | 9.4.1 | — |
| REQ-COM-5 | C-04 only | Works 360–1920px | **Real but underdesigned** | 9.4.2 | 19 of 20 screens lack mobile design |

## Non-functional

| ID | Verdict | Note |
|---|---|---|
| NFR-PERF-1…3 | **Real** | Trivially met — static files, no backend. 200-user concurrency untestable and meaningless here |
| NFR-PERF-4 | **Mock** | Outbox timestamps simulated |
| NFR-SAFE-1 | **Partly real** | Conflict logic real; true atomicity impossible single-client |
| NFR-SAFE-2…4 | **Deferred** | Depend on rides/rentals screens |
| NFR-SEC-1 | **Not applicable** | No passwords stored — no auth exists |
| NFR-SEC-2 | **Satisfied by construction** | No card entry anywhere; PCI scope is nil |
| NFR-SEC-3 | **Real** | Audit log appended to localStorage, viewable |
| NFR-SEC-4, 5 | **Real** | Visibility rules enforced client-side |
| NFR-SEC-6 | **Partly** | OWASP largely N/A with no server; upload type/size checks real |
| NFR-SEC-7 | **Not applicable** | "Enforced on the server" — there is no server |
| NFR-USE-1…3 | **Real** | WCAG AA, ≤5 steps, 16px/44px all genuinely verifiable |
| NFR-REL-1 | **Real** | GitHub Pages SLA |
| NFR-REL-2 | **Not applicable** | No database to back up |
| NFR-REL-3 | **Mock** | No providers to fail |
| NFR-MNT-1, 2 | **Real** | Module-per-feature, Git, README, tests |
| NFR-POR-1 | **Not applicable** | "Containers on Linux" contradicts static Pages |

## Conflicts

1. **Scope v0.9 vs SRS v1.0.** The SRS adds Event Hosting, Equipment Rental, Shuttle & Rides,
   Event Package; the Scope §1.6 does not contain them. 36 requirements hang on this.
   **Resolved in Step 4: build only the 20 designed screens.**
2. **SRS vs Figma — the design predates the SRS.** The prototype (Oct 29) covers the Scope's
   six services; the SRS (Nov 17) describes nine. "Scope decides what's in, Figma decides the
   look" cannot resolve this because the newer *scope* is the SRS.
3. **REQ-DON-3/4 anonymous donation has no design.** New in the SRS (WBS 2.1.3); D-01 lacks
   the checkbox. **Open.**
4. **REQ-COM-3/4 About/Contact/FAQ have no frames**, yet the footer links to all three.
   High-priority requirements with nothing to build from. **Open.**
5. **Static hosting vs SRS §6.1–6.2** — resolved by the mock table above.
6. **NFR-SEC-1, NFR-SEC-7, NFR-REL-2, NFR-POR-1 are unachievable on Pages.** Marked
   "Not applicable — static prototype" rather than failed.
7. **WBS renumbering.** Scope used 8 branches; SRS §6.4 uses 10 (Partner 4→6, Admin 5→7,
   Composite 6→8, Common 7→9, PM 8→10). SRS numbering used throughout.
8. **Navigation is unwired in Figma** (header, footer, both sidebars). Does not block code,
   but several journeys cannot be verified against the prototype at Step 6.

## Requirements with no screen

- **No design at all:** REQ-EVT-6, 7, 8, 9, 10, 12; REQ-RNT-1…9; REQ-RDE-1…8, 10;
  REQ-PKG-1, 2; REQ-ADM-5, 6; REQ-PAY-1, 2, 3; REQ-COM-3, 4. **(31 requirements)**
- **Engine-level, no screen by nature:** REQ-AUTH-4, 5; REQ-NTF-1, 2; REQ-PAY-4;
  REQ-BKG-1, 2, 3; REQ-PKG-3.
- **Proposed new surfaces:** **C-06 About / Contact / FAQ (proposed)**,
  **C-07 Mock outbox (proposed)**, **C-08 Demo reset & mock-state panel (proposed)**.

## Out of scope — confirmed, not to be built

Catering, volunteer-taught classes, home care (TBD-7 deferred); native mobile apps;
recurring/subscription donations; SMS; languages other than English; payroll/HR/accounting
integration; raw card data storage; real-time analytics; automated waitlist promotion.
