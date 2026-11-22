# Step 5 — Build Log

One row per work package. WBS IDs follow SRS §6.4. Every intentional departure from the
Figma design is recorded in the Deviations section and carries an ID used in code comments.

## Milestone dates

The Scope document contains **no milestone schedule**. Its only dates are the submission date
on the cover (October 13, 2026) and constraint §1.7, "Target completion and deployment must
occur before the end of the semester." The SRS revision history adds October 13, October 29
and November 17, 2026 — all document dates, not build milestones.

M1–M5 therefore remain sequence-only, anchored to "before the end of the semester". Recorded
here rather than invented.

## Packages

| # | Package | WBS IDs | Screens | Build | Lint | Types | Tests | Commit |
|---|---|---|---|---|---|---|---|---|
| P0 | Repo scaffold & deploy skeleton | 10.4.1, 10.3.1 | — | pass | pass | pass | 20/20 | `a1efc1c` |
| P1 | Design tokens & primitives | 9.4.2 | — | pass | pass | pass | 20/20 | `a1efc1c` |
| P1a | Accessibility amendments | 9.4.2 | — | pass | pass | pass | 18/18 | `424ae6c` |
| P2 | App shell & role switcher | 9.4.1, 9.1.1, 9.1.3 | C-02 | pass | pass | pass | 50/50 | `cda93c0` |
| P3 | Mock data & services layer | 9.6.1, 9.3.1, 9.3.2 | — | pass | pass | pass | 58/58 | `1e2748d` |
| P4 | Home | 9.4.1 | C-01 | pass | pass | pass | 76/76 | `4c868eb` |
| P5 | Volunteer discovery | 1.1.1, 1.1.2 | V-01 | pass | pass | pass | 96/96 | `12aa7b6` |
| P6 | Opportunity detail & registration | 1.1.3, 1.2.1, 1.2.2, 1.2.3 | V-02 | pass | pass | pass | 112/112 | `f67e0f1` |
| P7 | My Activity | 1.3.2, 8.2.1, 2.3.1 | V-03 | pass | pass | pass | 128/128 | `c057119` |
| P8 | Events | 3.1.1, 3.1.2, 3.2.1, 3.2.2 | E-01, E-02, E-02a | pass | pass | pass | 160/160 | `dd16cd0` |
| P9 | Donations | 2.1.1, 2.1.2, 2.1.3, 9.5.1 | D-01, D-02 | pass | pass | pass | 182/182 | `6911f40` |
| P10 | Give Items | 2.2.1, 2.2.2 | D-03 | pass | pass | pass | 198/198 | `c63a857` |
| P11 | Search | 8.1.1 | S-01 | pass | pass | pass | 214/214 | `9da5e50` |
| P12 | Profile & notifications | 9.2.1, 9.2.2 | C-03 | pass | pass | pass | 232/232 | `bb89df8` |
| P13 | Partner console | 6.1.1, 6.2.1, 6.3.1, 1.3.1 | P-01, P-02, P-03 | pass | pass | pass | 256/256 | pending |

## Approved deviations

| ID | Change | From Figma | To | Why | Approved |
|---|---|---|---|---|---|
| A11Y-1 | Secondary text colour | `rgba(28,43,45,0.37)` → composites to `#A6AAA8`, 2.15:1 | `#5B6B6E`, 5.11:1 | NFR-USE-1 requires WCAG AA 4.5:1. Affects every form label on every screen. | Yes |
| A11Y-2 | Input placeholder colour | `rgba(91,107,110,0.4)` | `#5F6F72`, 5.25:1 on white | Same; placeholder text is subject to AA. | Yes |
| A11Y-3 | Badge green and yellow foregrounds | `#2E7D4F` (4.41:1), `#9A6700` (4.44:1) | `#2C774B` (4.78:1), `#926200` (4.83:1) | Both missed AA by under 0.1. Darkened 5%. Badge red passed as drawn and is unchanged. | Yes |
| A11Y-4 | Button height | 42px (12px padding, no min-height) | `min-height: 44px`, padding unchanged | NFR-USE-3 requires 44×44px touch targets. | Yes |
| TOOL-1 | Linter | Plan specified ESLint | oxlint | Ships with the current Vite React-TS template; a substitution, not an added package. | Yes |
| FONT-1 | Inter not bundled | Design assumes Inter | System fallback stack, Inter first | Keeps the build dependency-free; accepted visual drift on machines without Inter. | Yes |
| DATA-1 | Home impact figures | Fixed "86 partner organizations", "340 open volunteer shifts" | Computed from the seed | The page must agree with the catalogue it links to. The two historical totals stay as drawn. | Implied by P4 |
| PAGE-1 | Opportunities per page | Figma's pagination shows 4 cards per page | 20 per page | REQ-VOL-1 states 20; the requirement governs behaviour, the design governs look. | Implied by P5 |
| ACT-1 | Cancel actions on V-03 | Figma draws no cancel control | Cancel on every upcoming row, disabled inside the cancellation window | REQ-VOL-7, REQ-EVT-5 and REQ-DSH-1 all require cancellation. | Implied by P7 |
| EVT-1 | Event categories | Figma chips: Food & meals, Family, Drives, Workshops | The five REQ-EVT-1 categories | The SRS names the categories explicitly; the design predates it. | Implied by P8 |
| RESP-1 | Calendar on phones | No mobile calendar designed | Seven-column grid below 820px becomes a chronological list | A 7-column grid is unusable at 390px; REQ-COM-5 requires 360px upward. | Implied by P8 |
| PAY-1 | Payment step on D-01 | Figma draws a Stripe card form: number, expiry, CVC, ZIP | No card inputs at all; a labelled mock payment block | Static hosting has no processor, and REQ-DON-2 with NFR-SEC-2 require BCS never to receive card data. | Implied by P9 |
| DON-1 | Anonymous donation | Not in the design | "Give anonymously" checkbox on D-01 | REQ-DON-3 and REQ-DON-4 are new in SRS v1.0; approved as a mock. | Yes |
| RESP-2 | Console and activity tables on phones | Tables are designed at 1440px only | Rows stack below 820px instead of scrolling horizontally | Horizontal scrolling put row action buttons out of reach on a 412px screen. | Implied by P13 |
| LIST-1 | Shift editor on P-03 | Figma draws a repeatable shift row editor | One date and one capacity per listing | Enough to demonstrate the approval workflow end to end; the full editor is not built. | Flagged |
| NAV-1 | Header, footer and sidebar navigation | Unwired in Figma — menu items live inside component instances | Wired to routes in code | The prototype cannot navigate otherwise. | Implied by P2 |

## Screens still to build

P13 (P-01, P-02, P-03 partner console) and P14 (A-01, A-02, A-03 staff console) are the
remaining designed screens. P15–P17 (responsive and accessibility pass, test report,
deploy and handoff) follow them.

## Open items

- `/#/primitives` is a development reference page, not one of the 20 screens. **Remove before
  the final deploy** (decision carried from P1).
- About / Contact / FAQ have no Figma frames, so those header and footer links stay inert.
- Equipment Rental, Shuttle & Rides, Event Hosting and the Event Package remain deferred
  (SRS TBD-8); their 10 screens do not exist in Figma.
