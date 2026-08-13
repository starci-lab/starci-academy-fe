# Design plan — Course detail page (re-planned)

Status: `direction-selected`
Case: `case-course-detail-v2`
Delivery: `single`
Mode: `migration`
Render status: `directional-not-apply-baseline`
Production edits: none
Backend enablers: none

Parity baseline: `starci-academy` `CourseDetailPage` at `mtp/9a1934231`, rendered in production at
`academy.starci.org/vi/courses/fullstack-mastery`.

Supersedes: `.artifacts/design-plan/course-detail-page/plan-record.json`.

## Why this run exists

The superseded run chose the same posture and produced a candidate that builds and lints clean. It
is not wrong; it is **out of date in a way a Preview revision cannot express**, because the rule set
it was mapped against changed underneath it:

1. `ContractHostTag` did not exist. Every structural node was a `div`, so the previous directions
   could differ only in geometry. A contract can now open `main`, `nav`, `section`, `aside`, `ul`,
   `ol` or `form`, which makes the page's SEMANTICS a product decision the old lab could not show.
2. `details` is deliberately **not** in that set. The prior run's open question — whether the
   curriculum discloses — therefore now carries a price: disclosure needs a new leaf, flat does not.
   That is the axis separating direction A from direction B.
3. The `Main` branch the prior Preview was built on has been deleted from the target. The landmark
   is named by the registry entry, and `routed-page-main` already carries `host: "main"`.

## What did not change, verified rather than assumed

- The sticky family in `LayoutClassName` is still `first-child` only, so a right-hand sticky rail
  still widens the union by five mirrored members.
- There is still no accordion branch.
- `src/resources` does not exist here; copy resolves through `src/messages/{en,vi}.json`, so
  `no-second-language-in-source` is satisfied by the repository's existing habit and constrains no
  direction.
- The target still has no `/courses/[displayId]` route and no single-course document.

## Directions offered

| Direction | Posture | Thesis | Governed types widened |
| --- | --- | --- | --- |
| `direction-parity-semantic` | `parity-first` | Production geometry, every region opens its true element, curriculum discloses | `LayoutClassName` ×8 |
| `direction-semantic-flat` | `balanced` | Same shape and semantics; curriculum stops at the module | `LayoutClassName` ×5 |
| `direction-locked-left-rail` | `conservative` | Locked `rail-then-main` unchanged, rail on the left | none |

## Selected direction — `direction-parity-semantic`

Selection kind: `explicit`. The user answered "A" after the three directions were rendered.

### Reading order

breadcrumb → title and tagline → trust chip strip → what you will learn → curriculum, with the
sticky buy rail alongside from the top.

### Deliberate divergence from the named render

None.

### What the semantic hosts are actually for

`ol` on the curriculum is not decoration: module three follows module two, and an `ol` says so to a
reader who cannot see the numbering. `aside` on the rail says the buy box is complementary to the
narrative rather than part of it, which is what a screen reader announces. `nav` on the breadcrumb
and `main` on the routed page complete the set a reader can skip between. None of this was
expressible when the prior run was planned.

### Implementation feasibility — `mapped`

Reused: `Tree`, `SurfaceCard`, `SurfaceListCard`, `Badge`, `Button`, `Text`, `Heading`, `Icon`,
`StatusDot`, `EmptyNotice`, and the `routed-page-main`, `price-discount-line` and
`stacked-sections` contracts.

Proposed: `CurriculumModuleRow` and `CoverImage` leaves, `CoursePricingRail` and
`CourseMobileEnrollBar` blocks, eight contracts carrying their host tags, and eight new
`LayoutClassName` members — five for the right-hand sticky rail, three for the pinned bar.

Nothing is unmapped. Every piece names its owner, its path and its API.

## Unknowns carried into Preview

1. The target has no single-course query. The document that feeds this page must carry the whole
   module tree, because the five trust chips are derived from it rather than read from a counter.
2. Cart and checkout are absent, so the CTA's destination beyond enrolment is unproven.
3. `pageNumber` base: the backend documents it as 1-based while the legacy hook passes 0-based. It
   does not affect this page and it does affect the catalog that links here.
4. Whether a buyer needs lesson-level detail before purchase. Direction A assumes yes because the
   named render discloses; direction B existed to make that assumption visible rather than silent.

## State manifest

Rendered in Plan: populated, dark, desktop only.

Deferred to Preview: skeleton, not-found, failed, mobile, light theme, keyboard focus,
`no-lessons`, `open`, `price-pending`, `guest-no-loyalty`, `no-phases`, `slots-scarcity`,
`no-challenges` and `narrow-viewport`.

## Direction lab

- Path: `D:\Repositories\starci-academy-fe\.artifacts\design-plan\course-detail-page-v2`
- URL: `http://127.0.0.1:8094/`
- Directions: `direction-parity-semantic`, `direction-semantic-flat`, `direction-locked-left-rail`

Plan HTML is directional and is not an Apply baseline. Cover artwork in every scene is a labelled
placeholder. This selection authorizes Preview only; it is not visual approval and does not
authorize Apply.

## What Preview must not carry forward

The superseded candidate at `.artifacts/design-plan/course-detail-page/candidate` builds and lints
clean, and it is built on shapes that no longer exist: a `Main` branch, a candidate-local `Tree`
standing in for keys with no `host`, and a page whose every node is a `div`. Preview rebuilds
against the current registry; it does not port that candidate forward.
