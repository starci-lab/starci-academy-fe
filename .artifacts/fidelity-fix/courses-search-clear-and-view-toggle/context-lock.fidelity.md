# Context lock — fidelity (courses toolbar: clear control + view toggle)

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `fidelity` | Invoked `starci-fe-fidelity-fix` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | Root `CLAUDE.md` |
| Primary target | `D:\Repositories\starci-academy-fe` — `main`, HEAD `8410a74` | Request (`localhost:3000/vi/courses`) + git |
| Reference | `D:\Repositories\starci-academy` — `mtp` — `pages/CourseCatalogPage`, `blocks/cards/CourseCard` | Named legacy render for the list layout |
| Artifact root | `…\.artifacts\fidelity-fix\courses-search-clear-and-view-toggle` | Phase convention |
| Write boundary | `src/app/globals.css`, `src/components/leaves/SearchBox/`, `src/components/contracts/index.ts`, `src/components/blocks/courses/CourseCatalogCard/component.tsx`, `src/components/pages/CoursesCatalogPage/`, `src/components/pages/ProfileSkillsPage/component.tsx`, `src/messages/{vi,en}.json` | Owner set of the two defects |
| Runtime | FE `:3000`, BE `:3001` — **owned by another session** | `Get-NetTCPConnection` |
| Restore point | `refs/snapshots/pre-fidelity-fix` → `80a7108` | `git stash create` (non-destructive) |

## The write-boundary hazard, recorded rather than hidden

The working tree carried **75 uncommitted files from another session**, including four of the files
this fix had to touch: `SearchBox/index.tsx`, `CoursesCatalogPage/{index,component}.tsx`,
`CourseCatalogCard/component.tsx` and `contracts/index.ts`. The hazard was raised twice and the user
instructed the fix to proceed anyway.

`git stash create` snapshotted the whole tree into a dangling commit **without altering it**, so the
other session's work is recoverable from `refs/snapshots/pre-fidelity-fix` if anything here
collided. `CourseCatalogCard/component.tsx` was in fact rewritten externally mid-run; the line
branch survived and was re-verified.

## Frozen comparison identity

Route `/vi/courses` · viewport 1280 · locale `vi` · theme light · signed-in persona (owns Fullstack
Mastery) · live backend on `:3001` · five catalog courses.

Both defects were measured in the DOM under that one identity rather than by screenshot, because
the Browser pane would not composite frames in this session.

## Binding expected result

| Defect | Binding source |
|---|---|
| Clear control | Explicit instruction: reset the user-agent glyph, draw our own; then "để cái icon hover opacity thôi, không để button" |
| View toggle | Named legacy render: `CourseCatalogPage/component.tsx:210` branches `Grid` ⇆ `StackV gap-3`, card takes `layout={view}`, choice persisted in `localStorage` |
