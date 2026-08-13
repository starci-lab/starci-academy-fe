# Context lock — plan — course-detail-page

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `plan` | Invoked `starci-fe-design-plan` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | Root `CLAUDE.md` router |
| Skill | `starci-fe-design-plan` — `…\.claude\skills\starci-fe-design-plan\SKILL.md` | Skill discovery |
| Primary target | `starci-academy-fe` — design target — `D:\Repositories\starci-academy-fe` | Request names the production course page against the new frontend |
| Reference | `starci-academy` — parity baseline — `D:\Repositories\starci-academy` | `CourseDetailPage` is what `academy.starci.org/vi/courses/fullstack-mastery` renders |
| Reference | `starci-academy-backend` — business truth — `D:\Repositories\starci-academy-backend` | `course` query, pricing phases, value propositions, prerequisites |
| Git identity | target `main` / `8af51ee` / `starci-lab/starci-academy-fe`; baseline `mtp` / `9a1934231`; backend `mtp` / `06d06496` | `git rev-parse`, `git branch --show-current`, `git remote` |
| Artifact root | `D:\Repositories\starci-academy-fe\.artifacts\design-plan\course-detail-page` | Repository artifact convention |
| Write boundary | The artifact root only | CONTEXT-LOCK-5 — Plan is artifact-only |
| Read-only boundary | `starci-academy-fe\src`, `starci-academy`, `starci-academy-backend`, the trust tree | Plan policy |
| Runtime | Direction lab on the first free port from `8080`; `8080`–`8085` and `8089` were listening under other owners | `Get-NetTCPConnection` scan |
| Context record | This file and `context-lock.plan.json`; inherits nothing | New case |

## Why this is a Plan and not a Fidelity Fix

The target has no `/courses/[slug]` route, no single-course GraphQL query and no course-detail
component of any tier. There is nothing to repair, so there is no bounded defect to route to Fidelity
Fix. Every question this page asks — where the buy decision sits, whether the curriculum discloses,
which side the rail takes — is still open in the target.

## Relationship to the sibling run

`.artifacts\design-plan\courses-catalog-page` planned the catalog page that links here. Its Plan is
complete and gate-verified; its Preview stopped after proving the candidate build harness. The two
runs share a parity baseline and a proposed `CoverImage` leaf, and neither may write production
source.
