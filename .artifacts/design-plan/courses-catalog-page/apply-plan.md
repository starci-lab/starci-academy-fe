# Apply plan — courses catalog page

Case `case-courses-catalog`, direction `direction-enrollment-split`, candidate revision **1.8**.
Target `D:\Repositories\starci-academy-fe`, `main`, HEAD `7aa4ba0`.

## Where this actually stands

The blocker that stopped Apply last time is gone. The FE no longer carries `plugins/eslint/`; it
carries the generated mirror `plugins/eslint-canon/`, and the adoption audit went from 23 rules
missing to one.

| Gate | Then | Now |
|---|---|---|
| `audit-fe-lint-adoption` | 23 missing, plugin was a renamed fork | **1 missing**, `refusesInlineConfig: true` |
| Candidate lint | could not run — the FE's own lint was broken | **exit 0** |
| Candidate build | exit 0 | exit 0 |
| `verify_design_record` | blocked on `candidate.lint` | blocked only on approval of 1.8 |

### The one rule still missing, and why it is not this case's problem

`starci-fe/no-second-language-in-path`. Canon added it to the naming law; the FE mirror predates it.
Only `naming.mjs` and `naming.test.mjs` differ between canon and the mirror — everything else is
byte-identical.

The fix is to re-run `.claude/scripts/sync-fe-lint.mjs`, never to hand-edit the mirror: the mirror is
generated, and `npm run lint` runs `gate:canon` first, so a hand edit exits 1.

That is a repository-infrastructure step, not a step of this case. It is listed here because Apply's
own gate calls the audit before the first production write, so **Apply cannot start until it passes**.

## Why revision 1.8 exists

The verifier now requires the candidate to pass the target's canon lint, not only its build. Running
it found exactly one error, and it is worth recording what it was: a comment in `CoverImage`
explaining that the line carries **no** lint suppression. `no-inline-lint-config` matches the token
in source text, so prose *about* a directive reads to it exactly like a directive. The comment was
reworded. Nothing rendered changed; only that file's hash did.

## Order of work

**0 — Unblock the audit (repository scope, outside this case's boundary).**
Re-run the FE lint sync so the mirror carries `no-second-language-in-path`, then re-run the audit
until `ok: true, missing: []`. Needs its own write boundary covering `plugins/eslint-canon/`.

**1 — Seal revision 1.8.** Blocked on one thing only: approval naming 1.8.
```
verify_design_record.mjs design-record.json --seal
verify_design_record.mjs design-record.json
```

**2 — Apply: lock and stop.** Redetect, print the lock, persist `context-lock.apply.md/json` at
`status: awaiting-confirmation`, then stop for explicit confirmation of repository, branch, worktree
and the exact writable files. No production write before that word.

**3 — Materialize, after confirmation.** Nine candidate files to nine target paths:

| Candidate | Target |
|---|---|
| `contracts/index.ts` | merge eleven proposed entries into `src/components/contracts/index.ts`; `price-discount-line` is restated and must not be written back |
| `leaves/CoverImage/index.tsx` | `src/components/leaves/CoverImage/index.tsx` |
| `leaves/Pagination/index.tsx` | `src/components/leaves/Pagination/index.tsx` |
| `leaves/ValuePropositionDisclosure/index.tsx` | `src/components/leaves/ValuePropositionDisclosure/index.tsx` |
| `leaves/ChoiceTabs/index.tsx` | `src/components/leaves/ChoiceTabs/index.tsx` — API extension, one optional `icon` slot |
| `leaves/Icon/index.tsx` | merge two `IconName` members and two `GLYPHS` rows |
| `blocks/EnrolledCourseCard/component.tsx` | `src/components/blocks/courses/EnrolledCourseCard/component.tsx` |
| `blocks/CourseCatalogCard/component.tsx` | `src/components/blocks/courses/CourseCatalogCard/component.tsx` |
| `pages/CoursesCatalogPage/component.tsx` | `src/components/pages/CoursesCatalogPage/component.tsx` |

`branches/Tree/index.tsx` is **not ported** — it is the locked `Tree` bound to the candidate
registry, and once the entries merge every call site becomes the real `Tree` with no other edit.
The fixture and `app/**` are not ported either.

Two documentation targets travel with the icon merge: the feature table in
`src/components/leaves/Icon/icon.md` and its canon mirror, which that file requires to change in the
same edit.

**4 — Verify.** Materialization verifier against the seal, then typecheck, strict lint, canon rule
tests, production build, and the audit again at handoff.

## What this plan does not carry

- **No connected file.** The page renders from a fixture. `useQueryCoursesSwr` exposes no `search`,
  and the courses document selects neither `valuePropositions` nor price-phase data. A route that
  reads real data is a separate piece of work.
- **`pageNumber` base is unresolved.** The backend documents 1-based; the legacy hook passes 0-based.
  The leaf speaks 1-based and the connected file must convert once, after that is settled.
- **No cart action.** The target has no cart data layer, so the discover card's action is
  "Xem khóa học" alone.
- **No route file.** Nothing here creates `src/app/courses/page.tsx`. The page component lands; the
  route that mounts it is the next step and belongs with the connected file.

## Hazard to carry into Apply

Nineteen files under `src/` are uncommitted in this working tree from other sessions. None is a
target of this case, but Apply shares the tree, so the diff at handoff will not be this case alone.
