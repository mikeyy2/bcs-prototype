# Step 1 — Read Check

**Role:** Tech lead for a course prototype, not a production app.
**Date:** November 19, 2026
**Scope:** Read the planning documents and verify Figma MCP tool availability.

## Figma MCP — connected and working

Authenticated as `mikey` (mdp2@iastate.edu), student-tier team, Full seat, Code Layers enabled.

Verified by live call: `create_session`, `get_metadata`, `whoami`.
Schemas loaded, exercised in Step 2: `get_design_context`, `get_screenshot`, `get_variable_defs`, `download_assets`.
Also registered: `search_design_system`, `get_libraries`, `create_new_file`, `use_figma`, Code Connect tools.

Note: `get_design_context` requires loading the `figma-design-to-code` guidance before the first call.

## Read

- **T11_ProjectScope.pdf** — all 14 pages, as rendered images. Scope statement, boundaries,
  constraints, assumptions, the 8-branch WBS, and the complete WBS dictionary.
- **Project_SRS.pdf** — full text of all 31 pages via `pdftotext`. All of §1–6, ~90 `REQ-*`
  and `NFR-*` requirements, the updated 10-branch WBS, the redundant/shared work-package
  table, narrative traceability, glossary, the B.3 screen index, and all 8 TBDs.
- **opencode_figma_prototype_guide.md** — all 175 lines, the full 9-step process and every
  prompt template.
- **figma-frame-links.md** — complete.
- **Figma structure** — page `Screens` (`0:1`): 20 top-level frames and 12 component
  definitions, all node IDs confirmed against the link file. Structure only, via `get_metadata`.
- **BCS_Project_Risk_Management.pdf** — *partially.* Read the rating scale, the complete RBS
  (all 74 risk IDs and titles across 4 categories / 12 groups), and dictionary entries for
  R1–R20. **Not read:** dictionary descriptions and P/I ratings for **R21–R74**.

## Missing

- **The final due date.** Left as a placeholder; neither document supplies one. The Scope says
  only "before the end of the semester"; the SRS revision history gives Oct 13, Oct 29 and
  Nov 17, 2026 — all past. No dated milestone schedule exists, though WBS 8.1.3 / 10.1.3
  calls for one.
- **The project narrative** (SRS Reference 1). The guide names it as the one non-optional
  document; it is not in `docs/`. SRS §6.5 summarizes it, but the original is absent.
- **SRS Appendix B.1 and B.2** — system-context and data-entity diagrams are images with no
  extractable text. Headings only.
- **10 of the 30 screens in SRS Appendix B.3** are marked Planned and absent from Figma:
  C-05, H-01, H-02, R-01, R-02, B-01, B-02, B-03, A-04, A-05. This is TBD-8.
- **All 8 TBDs unresolved**, including fee amounts (TBD-1), bookable spaces (TBD-2), shuttle
  routes/service area (TBD-3), and cancellation rules (TBD-5).
- **No rubric or grading criteria** in `docs/`.
- No mobile layouts except C-04 (home, 390px).

## Unclear

1. **Which baseline governs the prototype — Scope v0.9 or SRS v1.0?** The SRS adds three core
   services (Event Hosting, Equipment Rental, Shuttle & Rides) plus Event Package and My BCS.
   Those map almost exactly onto the 10 missing Figma screens.
2. **Does "functional prototype" extend to the SRS's new services**, or is Figma the de facto
   scope? "Scope decides what's in, Figma decides the look" does not resolve it, because the
   SRS *is* the newer scope and Figma has not caught up.
3. **Static hosting vs. the SRS.** GitHub Pages serves static files only, so Stripe, email,
   PostgreSQL, the booking engine and RBAC all become client-side mocks, while the SRS
   specifies them as real with timing acceptance criteria.
4. **Repo visibility and creation.** No remote exists; CLAUDE.md requires asking before
   creating repositories.
5. **Authentication.** Use C-02's "Continue as" row as a mock role switcher instead of real
   login, making REQ-AUTH-1…5 mocked.
6. **Filename drift.** Files were copied from `Downloads` with the `(1)`/`(2)` duplicate
   markers stripped: `T11_ProjectScope.pdf`, `BCS_Project_Risk_Management.pdf`.

## Resolution

Question 1 was answered in Step 4: **build only the 20 screens that exist in Figma.** Event
Hosting, Equipment Rental, Shuttle & Ride Services and the Event Package are formally
deferred (SRS TBD-8).
