# Step 2 — Design Map

**Role:** UI engineer.
**Source:** Figma file `IXg1ROaZ3ZQcv2h85KsCTQ` (BCS Prototype Team 11), page `Screens` (`0:1`),
read through the Figma MCP server.

> **Caveat on interactions.** The Figma MCP server does not expose prototype reactions, so
> actual click wiring could not be verified. Every navigation below is read from the team's
> **layer-naming convention** (`Button / Donate today → D-01`), which is deliberate and
> unambiguous, but it is *naming*, not confirmed prototype links. Whether those arrows are
> also wired as real Figma interactions should be checked in Figma's Prototype tab.

## Screens

| Screen | Node | Purpose | Components | States shown |
|---|---|---|---|---|
| C-01 Home | `1:26` | Landing; hero, featured opportunities, upcoming events, donate/partner CTAs | Header, Footer, Button ×4, Badge ×3, image placeholders ×4 | `Badge / Full` on one card |
| C-02 Log In / Sign Up | `16:103` | Auth + the "Continue as" role shortcut | Header, Footer, Input ×2, Button ×5 | Default only |
| C-03 Profile & Notifications | `16:104` | Edit profile, notification toggles | Header, Footer, Input ×6, Button ×3 | Default; `Change photo` |
| S-01 Search Results | `16:105` | Cross-service results, 7 rows mixing opportunities and events | Header, Footer, Input ×1, Button ×1 | Populated only |
| C-04 Home (Mobile 390px) | `16:106` | Mobile home | Button ×2, bottom tab bar (Home/Volunteer/Events/Donate/Account) | Default; **no Header/Footer instance** — mobile nav is bespoke |
| V-01 Volunteer Opportunities | `16:108` | Browse/filter/paginate | Header, Footer, Input ×6 (filters), Button ×1, Filters, Pagination | Result count "48 active… from 31 partner organizations"; `Active filters:`; one card `Full · 0 of 15 spots left` |
| V-02 Opportunity Detail | `16:109` | Detail + shift picker + register | Header, Footer, Badge ×2, Button ×1 | `Badge / Full`; rule text "Pick exactly one shift. Full shifts cannot be selected." |
| V-03 My Activity | `16:110` | Member dashboard: upcoming, hours, donations | Header, Footer, Badge ×9, Button ×2, Hours by Week Chart | `Attended`, `Not attended`, `Not marked`, `Completed` |
| E-01 Events Calendar | `16:111` | Month grid with event pills | Header, Footer | `Gift Wrapping Night · Full`; helper text about Full events |
| E-02 Event Detail & RSVP | `16:112` | Event detail + RSVP | Header, Footer, Input ×1, Button ×3 | **Both states drawn side by side**: normal RSVP card, and `RSVP Card (Full State)` with `Full · 0 of 40 seats left` + disabled `Button / Event full` |
| E-02a RSVP Confirmed | `16:113` | Success overlay | Button ×2 | Success |
| D-01 Donate | `16:115` | Amount presets + donor details | Header, Footer, Input ×8, Button ×1 | `$50.00` preselected |
| D-02 Thank You & Receipt | `16:116` | Confirmation + receipt | Header, Footer, Button ×2 | Success; `Download receipt (PDF)` |
| D-03 Give Items | `16:117` | In-kind offer + drop-off slot | Header, Footer, Input ×7, Button ×1, Photo Upload | Slot picker: `Selected` and `Booked (cannot be selected)`; upload empty state "Drag photos here or browse (optional)" |
| P-01 Partner Application | `16:119` | Org application, EIN, determination letter | Header, Footer, Input ×10, Button ×1 | Default; note "Once approved, your partner console is unlocked" |
| P-02 Partner Dashboard | `16:120` | Partner listings + stats | **Sidebar/Partner**, Badge ×10, Button ×4 | `Published`, `Pending approval`, `Rejected` (+ `Fix & resubmit`), `Awaiting partner` |
| P-03 Create a Listing | `16:121` | Create/edit listing with shifts | Sidebar/Partner, Input ×15, Button ×2 | Default; `Save draft` / `Submit for approval`; Listing photo slot |
| A-01 Approval Queue | `16:123` | Unified staff moderation queue | **Sidebar/Admin**, Badge ×3, Button ×3, Input ×1 | `Pending review`, `New`; `Reason (required to reject)`; rule text "Nothing goes live until it is approved here." |
| A-02 Accounts & Partners | `16:124` | Account admin | Sidebar/Admin, Badge ×7, Button ×6, Input ×3 | `Active`, `Suspended`, `Revoked`, `Verified partner`, `EIN verified`; warning on revoke |
| A-03 Reports | `16:125` | Report generator | Sidebar/Admin, Input ×3, Button ×3 | Generated result; `Export CSV` |

## Shared components (12)

Logo `2:40`, Button/Primary `2:45`, Button/Secondary `3:49`, Input `3:54`, Badge/Green `3:57`,
Badge/Yellow `3:60`, Badge/Red `4:64`, Card `4:67`, Header `11:30`, Footer `11:64`,
Sidebar/Admin `16:20`, Sidebar/Partner `16:60`.

- **Header** (1440×70): Logo · nav *Volunteer, Events, Donate, Partners, About* · search pill
  "Search Opportunities and Events" · "Log In" · avatar "JD".
- **Footer** (1440×238, `#0A3B3F`): three columns — *Get Involved* (Find Opportunities,
  Upcoming Events, Donate, Give Items), *Organizations* (Partner With Us, Partner Log in),
  *BCS* (About Us, Contact and FAQ, Staff console) — plus © 2026 and
  "Accessibility · Privacy · Terms".
- **Sidebar/Admin** (264×1024, `#0A3B3F`, orange logo): Dashboard, Approvals, Accounts,
  Reports / View public site, Log out.
- **Sidebar/Partner** (264×1024, `#0F5257`): Dashboard, New listing, Roster, Profile /
  View public site, Log out. Header reads "PARTNER CONSOLE · Ames Food Pantry".

## Colors (Figma variables, confirmed)

| Token | Value |
|---|---|
| Primary | `#0F5257` |
| primary dark | `#0A3B3F` |
| accent | `#E8833A` |
| text | `#1C2B2D` |
| background | `#F7F5F0` |
| border | `#E2DED6` |

Non-tokenized values also in use: `#E3F0EF` (avatar), `#CFE2E0` (muted-on-dark), white.

## Fonts

Inter only — Regular 400, Medium 500, Semi Bold 600, Bold 700, at 11/12/13/14/15/18px.
Exactly **one** named text style exists (`Heading M` = Inter SemiBold 18/100). Everything
else is loose.

## Assets

9 SVG icons (home, check, users, chart, plus, building, ext, logout, image). All photography
is gray placeholder blocks with descriptive captions ("Volunteers sorting food at a local
pantry") — no real image files.

## User journeys

1. **Volunteer sign-up** — C-01 → V-01 (filter) → V-02 → *Register for this shift* → V-03
2. **Search** — Header search → S-01 → V-02 or E-02
3. **Event RSVP** — C-01 → E-01 → E-02 → *RSVP* → E-02a → V-03
4. **Monetary donation** — C-01 → D-01 → *Donate $50.00* → D-02 → V-03
5. **In-kind donation** — C-01 → D-03 → *Submit offer* → V-03
6. **Partner onboarding** — C-01 → P-01 → *Submit application* → A-01 (staff approves)
7. **Partner publishes a listing** — C-02 (Partner) → P-02 → P-03 → *Submit for approval* → P-02
8. **Staff moderation** — C-02 (BCS Staff) → A-01 → *Run a report* → A-03
9. **Account administration** — A-02 → *View profile* → P-02
10. **Role switching** — C-02 "Continue as": Volunteer/Donor → V-03, Partner → P-02,
    BCS Staff → A-01
11. **Profile management** — C-03 → V-03, or *Log out* → C-02
12. **Mobile** — C-04 tabs → V-01 / E-01 / D-01 / C-03 (leaves the 390px layout immediately)

## Gaps

**Navigation dead ends and orphans**

- **A-03 Reports has no outgoing link.** Only the sidebar leaves it.
- **Sidebar nav is unwired by construction.** Both sidebars are component instances, so their
  menu items live *inside* the component and cannot point to different frames per screen.
  Every console-to-console hop (A-01↔A-02↔A-03, P-02↔P-03) is unreachable except via the few
  explicit buttons.
- **Header and Footer have the same problem** — nav items are inside the components, so
  "Volunteer / Events / Donate / Partners / About" don't navigate from any screen.

**Linked-to screens that don't exist**

- Header nav **Partners** and **About** → no frames.
- Footer → **About Us**, **Contact and FAQ**, **Partner Log in**, **Staff console**,
  **Accessibility**, **Privacy**, **Terms** → none exist. REQ-COM-3 and REQ-COM-4 require
  About, Contact and FAQ.
- The 10 SRS Appendix B.3 "Planned" screens: C-05, H-01, H-02, R-01, R-02, B-01, B-02, B-03,
  A-04, A-05.

**States not designed anywhere**

- **No loading or skeleton state** on any screen.
- **No form validation / error state.** Inputs have one styling only; `Reason (required to
  reject)` is a label, not an error. D-01 has no declined-payment state despite SRS §4.2.2 ¶3.
- **No empty states** — S-01 has no "no results", V-01 no "no opportunities match", V-03 no
  "nothing upcoming", A-01 no "queue is clear".
- **No 404 / not-found**, which REQ-EVT-6 explicitly needs for private events.
- **No hover/focus/active/disabled variants** on Button or Input. Only `Button / Event full`
  reads as disabled. This matters for NFR-USE-1 (WCAG AA keyboard focus).

**Responsive**

- **Only one mobile frame** (C-04, home). The other 19 screens have no mobile design —
  including the data-dense ones (V-01 filters, P-02 and A-02 tables, A-03 reports, E-01
  calendar grid).
- **No tablet layouts at all.** REQ-COM-5 requires 360–1920px; the design covers 390 and 1440.
- C-04's tabs all lead to 1440px desktop frames, so the mobile journey breaks after one tap.

**Design-system**

- Only one named text style; type is otherwise ad-hoc, so there is no scale to build tokens from.
- Badge has 3 color components but 19 distinct label variants — the semantic mapping (which
  status is green vs. yellow vs. red) is implied by usage, not defined.
- The Components page (`1:2`) is empty; components live on the Screens canvas and are not
  published as a library.

**Biggest build risk:** the header, footer and both sidebars are the primary navigation for the
entire prototype and none are wired. Trivial to fix in code, but it means the Figma prototype
cannot currently demonstrate most journeys, and the Step 6 "compare against Figma" check will
have nothing to compare for those paths.
