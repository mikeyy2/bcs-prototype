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
| P1a | Accessibility amendments | 9.4.2 | — | pass | pass | pass | 18/18 | `69265b2` |

## Approved deviations

| ID | Change | From Figma | To | Why | Approved |
|---|---|---|---|---|---|
| A11Y-1 | Secondary text colour | `rgba(28,43,45,0.37)` → composites to `#A6AAA8`, 2.15:1 | `#5B6B6E`, 5.11:1 | NFR-USE-1 requires WCAG AA 4.5:1. Affects every form label on every screen. | Yes |
| A11Y-2 | Input placeholder colour | `rgba(91,107,110,0.4)` | `#5F6F72`, 5.25:1 on white | Same; placeholder text is subject to AA. | Yes |
| A11Y-3 | Badge green and yellow foregrounds | `#2E7D4F` (4.41:1), `#9A6700` (4.44:1) | `#2C774B` (4.78:1), `#926200` (4.83:1) | Both missed AA by under 0.1. Darkened 5%. Badge red passed as drawn and is unchanged. | Yes |
| A11Y-4 | Button height | 42px (12px padding, no min-height) | `min-height: 44px`, padding unchanged | NFR-USE-3 requires 44×44px touch targets. | Yes |
| TOOL-1 | Linter | Plan specified ESLint | oxlint | Ships with the current Vite React-TS template; a substitution, not an added package. | Yes |
| FONT-1 | Inter not bundled | Design assumes Inter | System fallback stack, Inter first | Keeps the build dependency-free; accepted visual drift on machines without Inter. | Yes |
| NAV-1 | Header, footer and sidebar navigation | Unwired in Figma — menu items live inside component instances | Wired to routes in code | The prototype cannot navigate otherwise. | Implied by P2 |

## Open items

- `/#/primitives` is a development reference page, not one of the 20 screens. **Remove before
  the final deploy** (decision carried from P1).
- About / Contact / FAQ have no Figma frames, so those header and footer links stay inert.
- Equipment Rental, Shuttle & Rides, Event Hosting and the Event Package remain deferred
  (SRS TBD-8); their 10 screens do not exist in Figma.
