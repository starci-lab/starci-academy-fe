# Context Lock — coding-practice — plan

| Field | Locked value |
|---|---|
| Phase | `plan` |
| Skill | `starci-fe-design-plan` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` |
| Design target | `starci-academy-fe` · **`session/surface-branch-and-press-affordance`** · `a5d833a` |
| Parity baseline | `starci-academy` · `9a1934231` · `PracticeHubPage`, `PracticeProblemPage`, route `/[locale]/practice` |
| Business truth | `starci-academy-backend` · GraphQL domain `coding` — 8 queries, 2 mutations |
| Artifact root | `starci-academy-fe/.artifacts/design-plan/coding-practice` |
| Write boundary | the artifact root only |
| Read-only | target `src`, both reference repositories, the trust tree |
| Mode | `migration` — a legacy render exists, so a `parity-first` direction is mandatory |
| Runtime | direction lab · port 8081 (8080 occupied) · PID 44752 |
| Detected | 2026-08-14 |

## The branch, stated plainly

The target is **not** on `main`. It is on `session/surface-branch-and-press-affordance` at `a5d833a`,
a branch another session created and was actively editing during detection — `branches/PressableTree`
deleted, `branches/PressableSurface` added, `contracts/index.ts` rewritten to move surface classes
out of entries.

Plan writes no source, so this does not block. It is recorded because **Preview and Apply inherit
this lock**, and a candidate built against a session branch that later disappears is a candidate
built against nothing. The owner should confirm the branch before Preview runs.

## Scope, as the owner set it

One case, **two work items, one direction system**: the practice hub and the problem-solving page.
Chosen over a single-page scope.

Direction C additionally proposes a third page (a per-domain problem list). That is part of C's cost
and is stated as such rather than folded in quietly.

## The editor, as the owner set it

**CodeMirror 6**, over Monaco. The legacy app carries both plus Sandpack, Shiki and
react-syntax-highlighter; the new frontend carries **none of them**, and no socket client either.
