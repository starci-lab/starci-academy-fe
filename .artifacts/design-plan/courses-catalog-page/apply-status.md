# Apply status — courses catalog page

- Status: **applied**
- Case `case-courses-catalog`, direction `direction-enrollment-split`, approved revision **1.10**
- Seal `481925323e50802571fcf874ad0947d2bfc4fc3ba20205c5a5fda93eb256fcaf`
- Target `D:\Repositories\starci-academy-fe`, `main`, HEAD `7aa4ba0`, confirmed by the user
- Commits: **none.** Nothing was committed or pushed.

## Candidate to target

| Candidate | Target | How |
| --- | --- | --- |
| `leaves/CoverImage/index.tsx` | `src/components/leaves/CoverImage/index.tsx` | byte copy |
| `leaves/Pagination/index.tsx` | `src/components/leaves/Pagination/index.tsx` | byte copy |
| `leaves/ValuePropositionDisclosure/index.tsx` | same path under `src` | byte copy |
| `contracts/index.ts` | `src/components/contracts/index.ts` | merge, 11 entries |
| `leaves/ChoiceTabs/index.tsx` | same path under `src` | merge, one optional `icon` slot + `whitespace-nowrap` |
| `leaves/Icon/index.tsx` | same path under `src` | merge, 2 `IconName` members + 2 `GLYPHS` rows + 4 glyph imports |
| `blocks/EnrolledCourseCard/component.tsx` | `blocks/courses/EnrolledCourseCard/component.tsx` | 3 specifiers rewritten |
| `blocks/CourseCatalogCard/component.tsx` | `blocks/courses/CourseCatalogCard/component.tsx` | 4 specifiers rewritten |
| `pages/CoursesCatalogPage/component.tsx` | same path under `src` | 6 specifiers rewritten |

Also merged: two rows into `src/components/leaves/Icon/icon.md`.

Not ported, as declared: the candidate's `contracts/props.ts` and `branches/Tree/index.tsx` — both
verbatim copies of locked files that production already has — plus the fixture and the harness.

## Gates

| Gate | Result |
| --- | --- |
| `verify_design_record.mjs` | **ok** — revision 1.10 |
| `audit-fe-lint-adoption.mjs` at handoff | **ok: true**, missing 0, `refusesInlineConfig: true` |
| `verify_apply_materialization.mjs` | **ok: true** — 3 materialized, 6 integrated, **0 missing, 0 substituted, 0 outOfBounds** |
| `eslint` over the nine targets | **exit 0** |
| `tsc --noEmit` over the nine targets | **clean** |
| `next build` | **exit 0** |

## What this Apply cost, and what it taught

The first attempt was reverted, and the second only worked because two claims in the record turned
out to be false:

1. The record said the candidate's `Tree` call sites become the real `Tree` "with no other edit".
   They could not: the candidate had invented a second builder taking an **ordered array** of nodes,
   while the shipped one takes **named slots**. The invented one compiled, rendered, and checked
   nothing — a wrong slot order, a missing slot or a leaf of the wrong kind all passed silently.
   `LeagueCard` and `TopLearners` had shown the correct idiom the whole time.
2. The declared specifier rewrite covered the alias prefix but not the `courses/` path segment the
   two blocks gain on landing.

Both were defects in the record this session wrote, not in the target. They were fixed by returning
to Preview for revision 1.10 rather than by editing during the write — which is what the earlier
reverted attempt got wrong.

The scaffolding now earns its place: `contracts/index.ts`, `contracts/props.ts` and `branches/Tree`
in the candidate are the locked files copied verbatim with imports repointed. They exist for one
reason only — `ContractKey` is closed over the table on disk and the eleven entries were not in it
yet — and they add no API of their own.

## Not verified, and why

**No same-state browser parity.** The page component landed; nothing mounts it. `src/app/courses/`
does not exist, and creating it was explicitly outside this case — the route belongs with the
connected file that has yet to be written. So the approved states were verified against the
candidate runtime, not against production, and this Apply cannot claim a production parity matrix.

## Still open

- **No connected file.** The page renders from a fixture. `useQueryCoursesSwr` exposes no `search`,
  and the courses document selects neither `valuePropositions` nor price-phase data.
- **`pageNumber` base unresolved.** The backend documents 1-based; the legacy hook passes 0-based.
  The leaf speaks 1-based and the connected file must convert once, after that is settled.
- **No cart action.** The target has no cart data layer.
- **The canon mirror of the icon table** at `.claude/fe/canon/patterns/icon.md` still needs the same
  two rows. The trust tree is read-only during Apply, so that half was not written here.

## Shared working tree

Other sessions were editing this repository throughout. `src/components/pages/LeaguePage/` is a new
untracked directory of theirs and was carrying four type errors at one point during this run; it is
not reachable from any route, so the production build is unaffected. None of this case's nine
targets was touched by them, and nothing of theirs was committed or reverted.
