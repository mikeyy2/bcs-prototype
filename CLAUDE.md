# BCS Prototype — Ground Rules

Iowa State SE 3290, Team 11 (Michael Proeschel, Noah Wons, Dylan Sinykin, Schon Huxley).
A **functional prototype** of the Best Community Services platform. We follow the course
process guide in `docs/opencode_figma_prototype_guide.md`, adapted to Claude Code.

## What this is

This is a course prototype, not a product. Call it a "functional prototype" in every
README, handoff note, commit message, and reply. Never describe it as
"production-ready," "production-grade," or "enterprise." Never mark unfinished work as
done — if a check was not run, say it was not run.

## Source of truth

- `docs/` holds the originals: the Project Scope, the SRS, the Risk Management register,
  and the course process guide. **Treat them as read-only.** Do not edit, rename, move,
  reformat, or delete anything already in `docs/`. New files may be added to `docs/`
  (plans, test reports, agent outputs, screenshots).
- **The scope decides what's in; Figma decides the look.** If a design shows something
  the scope excludes, the scope wins. If the scope describes something the design renders
  differently, match the design. When the two genuinely conflict, ask — don't pick one
  silently.
- Figma file: `IXg1ROaZ3ZQcv2h85KsCTQ` (BCS-Prototype-Team-11), page **Screens** (`0:1`).
  Frame and component node IDs are listed in `docs/figma-frame-links.md`. Build from the
  real Figma styles, components, and assets via MCP — not from screenshots.
- Requirement IDs (`REQ-*`, `NFR-*`), WBS numbers, and screen IDs (`C-01`, `V-02`, …) come
  from the SRS. Keep existing IDs; mark any new one "proposed."

## Mocking (GitHub Pages is static)

The deploy target is **GitHub Pages, which serves static files only**. There is no server,
no database, and no runtime secret store. Therefore:

- Every backend feature is mocked with fake data held in the client — auth, payments,
  email, search, booking, availability, reports, approvals, uploads.
- **Label every mocked feature "Mock" in the UI** so a reviewer can tell what is real.
  Keep the label visible, not hidden in a tooltip.
- Fake data is invented demo content. Never use real names, emails, addresses, phone
  numbers, EINs, or donation amounts belonging to actual people or organizations.
- No Stripe, SendGrid, or any third-party service is wired up — not even in test mode.
- Keep client-side routing Pages-compatible (inner pages must survive a refresh).

## Ask before

- Installing any package outside the approved build plan.
- Deleting or overwriting files.
- Pushing, adding a remote, or creating a repository.
- Deploying, creating accounts, or anything that costs money.

Adding a file or editing project code we already agreed on does not need a prompt.

## Never

- Commit secrets, API keys, tokens, or `.env` files.
- Put real personal data anywhere in the repo, including fixtures and screenshots.
- Claim to have read a document or run a check that was not actually read or run.

## Working agreement

After each work package, report: files changed, requirement/WBS IDs covered, check
results, and open issues.
