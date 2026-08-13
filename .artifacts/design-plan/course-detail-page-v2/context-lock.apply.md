# Context Lock — Apply · course-detail-page-v2

**Status: `materialized-partial`.** Seven files landed and verified against the seal. What remains is
the connected half and its data, listed at the bottom.

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `apply` | `starci-fe-design-apply` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | `CLAUDE.md` router |
| Primary target | `starci-academy-fe` — `D:\Repositories\starci-academy-fe` | request + git |
| Reference | `starci-academy` @ `mtp` `9a1934231` — parity baseline, read-only | named baseline |
| Reference | `starci-academy-backend` @ `mtp` `06d06496` — business truth, read-only | evidence role |
| Git identity | branch `main`, worktree `D:\Repositories\starci-academy-fe`, HEAD `7aa4ba0` | git |
| Approved revision | `1.5` — manifest `46e4f9f01430f5a81e739371fd2af3cda2f5a2bd3435d1f01c1dd6183a18f019` | sealed record |
| Confirmation | "apply" → "ok" (1.2 then Apply) → "ok" (1.4, drop the shim) | user, in chat |
| Runtime | review lab `http://127.0.0.1:8096`, PID 40268 | started here |

## Gates

| Gate | Result |
|---|---|
| Design record validation | `ok: true`, revision 1.5 |
| Lint adoption audit | `ok: true` · `missing: []` · `nonError: []` · `refusesInlineConfig: true` |
| `tsc --noEmit` | exit 0 |
| `eslint src` | exit 0 |
| `next build --webpack` | exit 0 |
| Materialization vs seal | `ok: true` — 5 materialized, 0 substituted, 0 missing, 0 out of bounds |

## Landed

| File | Result |
|---|---|
| `src/components/contracts/index.ts` | 17 entries, 12 `LayoutClassName` members — declared integration edit |
| `src/components/branches/Tree/index.tsx` | `role="list"` for `ul`/`ol` hosts — declared integration edit |
| `src/components/leaves/CoverImage/index.tsx` | already identical — verified no-op |
| `src/components/leaves/CurriculumModuleRow/index.tsx` | byte-identical to seal |
| `src/components/blocks/courses/CoursePricingRail/component.tsx` | byte-identical to seal |
| `src/components/blocks/courses/CourseMobileEnrollBar/component.tsx` | byte-identical to seal |
| `src/components/pages/CourseDetailPage/component.tsx` | byte-identical to seal |

## Two findings this phase produced, both resolved

**The candidate was reviewed under weaker checking than production applies.** Its `Tree` shim took a
bare `ReactNode` in a slot, so it validated neither leaf identity nor a slot's declared props. The
first casualty was the locked `price-discount-line`: the approved revision drew the price at `md`
and the discount as accent text, where the entry declares `sm` and a **badge**. Revision 1.4 deleted
the shim — possible only once the entries were merged — so the candidate now compiles against the
production registry and every remaining mismatch surfaced at once. Visual consequences are listed in
the record under `revisionHistory[0].visualChanges`.

**Apply's own drift note was wrong, and a decision was taken on it.** It reported that this
repository "has no `[locale]` segment", read off the `src/app` folder listing but written as though
it described the URL. The URL has been localised all along: `src/middleware.ts` runs next-intl's
middleware over every non-`api`, non-asset path, and the production build lists every route under
`/[lang]/`. `src/app` is flat **by design**. Revision 1.5 corrects the route target to
`src/app/courses/[displayId]/page.tsx` and withdraws two claims that rested on the misreading —
that the baseline URL needed a new segment, and that a locale migration would break the Keycloak
redirect URI.

## Not landed

The connected half and the data behind it: `src/components/pages/CourseDetailPage/index.tsx`, the
route file, a single-course GraphQL document with its SWR hook (`query-courses.ts` is a list query;
no single-course document exists), and the `courses.detail` copy namespace in `src/messages`.
