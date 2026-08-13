# Context lock — plan — courses-catalog-page

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `plan` | Invoked `starci-fe-design-plan` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | Root `CLAUDE.md` router |
| Skill | `starci-fe-design-plan` — `D:\Repositories\starci-academy-backend\.claude\skills\starci-fe-design-plan\SKILL.md` | Skill discovery |
| Primary target | `starci-academy-fe` — design target — `D:\Repositories\starci-academy-fe` | Request names "trang này" against the new FE |
| Reference | `starci-academy` — legacy parity baseline — `D:\Repositories\starci-academy` | `academy.starci.org/vi/courses` is built from `CourseCatalogPage` here |
| Reference | `starci-academy-backend` — business truth — `D:\Repositories\starci-academy-backend` | `CourseEntity` / `CoursesRequest` decide what may be shown |
| Git identity | target `main` / `8af51ee` / `starci-lab/starci-academy-fe`; baseline `mtp` / `9a1934231`; backend `mtp` / `06d06496` | `git rev-parse`, `git branch --show-current`, `git remote` |
| Artifact root | `D:\Repositories\starci-academy-fe\.artifacts\design-plan\courses-catalog-page` | Repository artifact convention |
| Write boundary | The artifact root only | CONTEXT-LOCK-5 — Plan is artifact-only |
| Read-only boundary | `starci-academy-fe\src`, `starci-academy`, `starci-academy-backend`, the trust tree | Plan policy |
| Runtime | Direction lab at `http://127.0.0.1:8083/` (pid `47184`); `8080`–`8082` were already listening under other owners, so the shared server took the first free port | `Get-NetTCPConnection` scan + server output |
| Context record | This file and `context-lock.plan.json`; inherits nothing | New case |

## Ambiguity resolved before locking

The workspace holds five plausible frontends. `starci-academy-fe` is the target because the user's
running instance is this repository's dev server and the request continues that session's work.
`starci-academy` is a reference and not a target: it is the legacy render the user pointed at as
"trang gốc", so it supplies parity evidence and receives no writes.

## What this lock forbids

No production source, no trust file and no backend file may be edited during this run. The lab is
hosted from the artifact root and owns no other port.
