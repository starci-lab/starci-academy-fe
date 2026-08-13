# Context lock — apply — courses-catalog-page

Status: **`awaiting-confirmation`.** Production writes: **none.**

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `apply` | Invoked `starci-fe-design-apply` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | Router |
| Skill | `starci-fe-design-apply` — `…\.claude\skills\starci-fe-design-apply\SKILL.md` | Skill discovery |
| Primary target | `starci-academy-fe` — design target — `D:\Repositories\starci-academy-fe` | Preview record + git |
| Git identity | `main` / `7aa4ba0` / `starci-lab/starci-academy-fe` | `git rev-parse`, `git remote` |
| Reference | `starci-academy` `9a1934231` — legacy parity baseline | Inherited |
| Reference | `starci-academy-backend` `06d06496` — business truth | Inherited |
| Reference | `starci-trust` — canon, skills, generated rule set — **read-only here** | Trust root |
| Artifact root | `…\.artifacts\design-plan\courses-catalog-page` | Preview record |
| Write boundary | **proposed, not confirmed** — the ten files below | Design record target map |
| Read-only | every other path in the target, both references, the trust tree | Apply policy |
| Context record | This file and `context-lock.apply.json`, inheriting `context-lock.preview.json` | Artifact convention |

## Drift

None. `HEAD 7aa4ba0` is unchanged since the plan run and no reference head moved.

## Admission gates, run before any write

| Gate | Result |
|---|---|
| `verify_design_record.mjs` | **ok** — revision `1.8`, manifest `a67bedd8…` |
| `audit-fe-lint-adoption.mjs` | **ok: true**, `missing: []`, `refusesInlineConfig: true` |

The rule that was missing when the plan was written, `no-second-language-in-path`, now resolves —
the generated mirror was synced between the two runs. The gate that blocked Apply is genuinely open.

## Proposed write boundary — ten files

Six are absent and will be created:

- `src/components/leaves/CoverImage/index.tsx`
- `src/components/leaves/Pagination/index.tsx`
- `src/components/leaves/ValuePropositionDisclosure/index.tsx`
- `src/components/blocks/courses/EnrolledCourseCard/component.tsx`
- `src/components/blocks/courses/CourseCatalogCard/component.tsx`
- `src/components/pages/CoursesCatalogPage/component.tsx`

Four exist and are merged into, never overwritten:

- `src/components/contracts/index.ts` — eleven new keys
- `src/components/leaves/ChoiceTabs/index.tsx` — one optional `icon` slot plus `whitespace-nowrap`
- `src/components/leaves/Icon/index.tsx` — two `IconName` members, two `GLYPHS` rows
- `src/components/leaves/Icon/icon.md` — two feature-table rows

Checked at detection: **all eleven proposed contract keys are absent from the locked registry**, so
the merge adds and overwrites nothing.

## Three hazards this lock records rather than discovers later

1. **The merge target is already dirty.** `src/components/contracts/index.ts` carries 26 insertions
   and 2 deletions uncommitted from another session and is one of this case's targets. The merge
   only adds keys, but the file is being edited concurrently and the resulting diff will not be this
   case alone.
2. **The working tree is shared.** Nineteen files under `src/` are uncommitted from other sessions.
   None is a target here, and nothing may be committed on their behalf.
3. **Half of the icon edit cannot happen in this phase.** The feature table requires its canon
   mirror at `.claude/fe/canon/patterns/icon.md` to change in the same edit, and the trust tree is
   read-only during Apply. That half has to be raised, not skipped quietly.

## Awaiting explicit confirmation

- target: `D:\Repositories\starci-academy-fe`
- branch / worktree: `main` / `D:\Repositories\starci-academy-fe`
- write boundary: exactly the ten files above, and nothing else

No production edit, dependency change, generator run or commit happens before that confirmation.
