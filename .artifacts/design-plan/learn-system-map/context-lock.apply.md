# Context Lock — apply

`learn-system-map` · `case-learn-system` · approved revision `1.4` · status **`awaiting-confirmation`**

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `apply` | `starci-fe-design-apply` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | `CLAUDE.md` router |
| Skill | `starci-fe-design-apply` · `D:\Repositories\starci-academy-backend\.claude\skills\starci-fe-design-apply\SKILL.md` | Skill discovery |
| Primary target | `starci-academy-fe` (primary) · `D:\Repositories\starci-academy-fe` | Request + workspace + git |
| Reference | `starci-academy` (read-only legacy) · `D:\Repositories\starci-academy` · `pages/ContentPage`, `LearnShellLayout` | Named parity baseline |
| Git identity — target | branch `main` · worktree `D:\Repositories\starci-academy-fe` · HEAD `f06071e` · remote `github.com/starci-lab/starci-academy-fe.git` | Git |
| Git identity — reference | branch `mtp` · HEAD `9a19342` | Git |
| Artifact root | `D:\Repositories\starci-academy-fe\.artifacts\design-plan\learn-system-map` | Phase convention |
| Write boundary | The five recorded targets, plus this artifact root | Design record `candidate.files` |
| Read-only boundary | Every other path under `starci-academy-fe\src`; all of `starci-academy`; all of `.claude` | Evidence role |
| Runtime | Candidate preview on `127.0.0.1:8083` (this session's process). The target app is NOT running. | Existing process |
| Context record | This file · inherits `context-lock.preview.json` | Artifact convention |

## Drift

| Field | Inherited (preview) | Detected now | Reading |
|---|---|---|---|
| branch | `session/surface-branch-and-press-affordance` | `main` | The session branch was merged and pushed earlier in this session; `git branch --contains a5d833a` lists `main`. |
| HEAD | `a5d833a` | `f06071e` | Three commits ahead, eight files under `src`. **None** is a file this candidate writes or mirrors. |

`git diff --name-only a5d833a..HEAD -- src` returns only catalog, dashboard and locale-path files.
`contracts/index.ts`, `contracts/props.ts`, `branches/Tree`, `branches/SurfaceCard`,
`branches/SurfaceListCard` and `leaves/NavLink` are byte-identical across the range, so the mirror
the candidate was written against still describes the target exactly.

Drift is real and stops the phase regardless of how benign it reads. It is the user's call whether
to relock on `main` at `f06071e` or return to Preview.

## Gates already green, both read-only

| Gate | Result |
|---|---|
| `verify_design_record.mjs design-record.json` | `ok: true`, manifest `32f504ac…` |
| `audit-fe-lint-adoption.mjs --target starci-academy-fe` | `ok: true`, no missing rule, none below `error`, inline config refused |

## What confirmation is being asked for

1. Target `D:\Repositories\starci-academy-fe`, branch `main`, worktree the repository itself,
   HEAD `f06071e` — relock on this, or stop.
2. Write boundary: exactly five files.

   | File | Kind |
   |---|---|
   | `src/components/pages/CourseLearnContentPage/component.tsx` | new |
   | `src/components/blocks/learn/ContentTabRow/component.tsx` | new |
   | `src/components/leaves/ContentMapRow/index.tsx` | new |
   | `src/components/leaves/NavLink/index.tsx` | edit — adds `kind: "section"` and `depth` |
   | `src/components/contracts/index.ts` | edit — eleven entries and three union members |

3. **The gap this record leaves open, stated before anything is written.** The sealed record
   contains the PURE page and nothing that mounts it: no connected `index.tsx`, no route, no
   messages. Materializing exactly what was approved therefore lands a page that renders correctly
   and is reachable from nowhere, verifiable only through a harness. Writing the connected twin and
   the route as well is more than the seal approves, and the honest route for that is a Preview
   minor revision rather than a decision taken here — Apply is the phase with the least standing to
   settle it, because it is the one holding the write boundary.
