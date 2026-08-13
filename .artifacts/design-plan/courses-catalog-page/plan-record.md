# Design plan — Courses catalog page

Status: `direction-selected`
Case: `case-courses-catalog`
Delivery: `single`
Mode: `migration`
Render status: `directional-not-apply-baseline`
Production edits: none
Backend enablers: none

Parity baseline: `starci-academy` `CourseCatalogPage` at `mtp/9a1934231`, rendered in production at
`academy.starci.org/vi/courses`.

## Brief

The target frontend has no `/courses` route at all. Its app router holds `authentication`,
`dashboard` and `profile` and nothing else, so this page is net-new rather than a repair — which is
why it went through Plan instead of Fidelity Fix.

The user's standing correction on this work is that the new frontend "chưa giống lắm và chế nhiều
quá": too far from the named production render, and too much invented. That correction sets the bar
for every direction below and is why a `parity-first` direction exists even though it was not the
one chosen.

## Business truth, and what it permits

No backend enabler is required. Everything the production card shows already exists server-side:

| Need | Source | Status |
| --- | --- | --- |
| Search over the catalog | `PaginationPageFilters.search` | Exists; the target's hook simply does not expose it |
| Cover artwork, price, enrolment count, viewer enrolment | `CourseEntity` | Exists and mostly selected |
| The three check bullets | `ValuePropositionEntity.text` + `orderIndex` | Exists; the target's document does not select it |
| Per-viewer discounted price | `coursePricePreview` | Exists; the target does not call it |
| Owned-course progress and thumbnail | `myCourses` — `completionPercent`, `thumbnailUrl`, content and challenge counters | Exists and is already wired in the target |
| Cart read and mutate | `myCart` server-side | **No client counterpart exists in the target at all** |

The work this page needs is therefore frontend work: extend the `courses` document, expose `search`
on the hook, and build the missing vocabulary — not new API surface.

## Directions offered

| Direction | Posture | Thesis |
| --- | --- | --- |
| `direction-parity-first` | `parity-first` | Reproduce production exactly: one toolbar over a three-column grid, card carries the whole sales pitch |
| `direction-enrollment-split` | `balanced` | Group by enrolment first, so section membership answers "do I own this" and each section keeps one CTA meaning |
| `direction-dense-list` | `conservative` | Ship inside today's vocabulary: a dense joined row list, no cover artwork |

## Selected direction — `direction-enrollment-split`

Selection kind: `explicit`.

Selection evidence: the user first excluded the parity direction with "Không — em muốn B hoặc C",
which left a genuine two-way choice. That was put as a binary between the two remaining directions
and the user selected "B · Owned-then-discover".

This is recorded as an explicit selection and not as a default. The Plan gate only permits a
`default-after-ambiguity` to fall to the `parity-first` direction where a parity baseline exists,
and that is precisely the direction the user had ruled out — so defaulting was not available here,
and asking the real remaining question was the only honest route to a recorded decision.

### Reading order

breadcrumb → page title → search / count / view toggle → **Đang học** group → **Khám phá** group →
pagination.

### Deliberate divergence from the named render

1. Production renders one ungrouped grid; this direction introduces two titled groups keyed on
   `isEnrolled`.
2. Owned courses drop the sales pitch and gain a progress meter and a single resume action.
3. Value propositions move behind a disclosure in the discover group instead of always showing.

These are divergences from the very reference the user asked to match. They are listed here rather
than smoothed over, because the selection was made with the parity option visible beside it.

### Implementation feasibility — `partial`

Reused as-is: `SearchBox`, `Progress`, `Badge`, `Button`, `Text`, `Heading`, `ChoiceTabs`,
`SurfaceCard`, `Tree`, `EmptyNotice`, and the `price-discount-line` and `label-row-over-card`
contracts.

Proposed owners: `CoverImage` leaf, `EnrolledCourseCard` block, `CourseCatalogCard` block,
`catalog-section-group`, `value-proposition-disclosure`, `catalog-search-count-view-row`,
`Pagination` leaf.

Unmapped: the discover card's cart action. The target has no cart data layer — no `myCart` query and
no add or remove mutation; cart exists there only as a `ShellNav` icon. Preview must either build
that layer or drop the secondary button and let "Xem khóa học" stand alone. The direction is
recorded as `partial`, not `mapped`, for exactly this reason.

## Unknowns carried into Preview

1. **`pageNumber` base.** The backend documents `PaginationPageFilters.pageNumber` as 1-based while
   the legacy hook passes a 0-based index. Preview must settle this against a live query rather than
   copying the legacy call, since one of the two is wrong.
2. **Cart layer absence**, as above.
3. Whether `valuePropositions` returns a reliable three rows per course or must be sliced.
4. Whether enrolment grouping should override the curated `COURSE_ORDER` the legacy page applies.

## State manifest

Rendered in Plan: populated, dark, desktop only.

Deferred to Preview: skeleton, empty, filtered-empty, failed, guest, no-owned-courses,
zero-progress, complete, price-pending, no-discount, mobile, light theme and keyboard focus.

## Direction lab

- Path: `D:\Repositories\starci-academy-fe\.artifacts\design-plan\courses-catalog-page`
- URL: `http://127.0.0.1:8083/`
- Directions: `direction-parity-first`, `direction-enrollment-split`, `direction-dense-list`

Plan HTML is directional and is not an Apply baseline. Cover artwork in every scene is a labelled
placeholder, never production imagery. This selection authorizes Preview only; it is not visual
approval and it does not authorize Apply.

## Out of scope, and left unfinished on purpose

The Community tab and `/league` leaderboard Plan run was stopped at the user's instruction ("làm
course thôi"). It reached evidence gathering only — no lab and no plan record. One finding from it
is worth carrying: the target's `LeagueCard` and `TopLearners` both call
`router.push("/league")`, and that route does not exist, so the "View leaderboard" action currently
navigates to a 404.
