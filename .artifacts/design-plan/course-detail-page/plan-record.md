# Design plan — Course detail page

Status: `direction-selected`
Case: `case-course-detail`
Delivery: `single`
Mode: `migration`
Render status: `directional-not-apply-baseline`
Production edits: none
Backend enablers: none

Parity baseline: `starci-academy` `CourseDetailPage` at `mtp/9a1934231`, rendered in production at
`academy.starci.org/vi/courses/fullstack-mastery`.

## Brief

The target frontend has no `/courses/[slug]` route, no single-course query and no course-detail
component at any tier. This is net-new work, which is why it went through Plan rather than
Fidelity Fix.

The user's standing correction on this frontend is that it is "chưa giống lắm và chế nhiều quá" —
too far from the named production render, and too much invented. Direction A was selected and it
records no deliberate divergence at all.

## Business truth, and what it permits

No backend enabler is required.

| Need | Source | Status |
| --- | --- | --- |
| Course by URL slug | `CourseRequest` accepts `id` **or** `displayId` | Exists; `fullstack-mastery` resolves as-is |
| Price, discount, phases | `PricingPhaseEntity` + `coursePricePreview` | Exists server-side; the target calls neither |
| "Bạn sẽ học được gì" | `ValuePropositionEntity` | Exists |
| Prerequisites | `PrerequisiteEntity` | Exists |
| The five trust chips | Derived client-side from `modules → contents → challenges` and `minutesRead` | Exists as data; no counter field, but the page must fetch the whole module tree |
| Enrolment count and viewer flag | `CourseEntity` | Exists |
| Cart and checkout | `myCart` server-side only | **No client counterpart in the target** |

The work is frontend work: add the single-course document, call the price preview, and build the
missing vocabulary.

## Directions offered

| Direction | Posture | Thesis |
| --- | --- | --- |
| `direction-parity-first` | `parity-first` | Narrative left, one sticky buy rail right, hero carries no price |
| `direction-decision-band` | `balanced` | No rail; price, phases and CTA become one full-width band under the hero |
| `direction-locked-rail` | `conservative` | Reuse `rail-then-main` verbatim and accept the rail on the left |

## Selected direction — `direction-parity-first`

Selection kind: `explicit`. The user answered "A" after the three directions were rendered.

### Reading order

breadcrumb → title and tagline → trust chip strip → what you will learn → curriculum, with the
sticky buy rail alongside from the top.

### Deliberate divergence from the named render

None. This direction preserves the legacy hierarchy, including the decision that the hero carries no
price or CTA so the rail remains the only buy box.

### The one layout finding that shapes this work

`rail-then-main` already exists in the target and already carries the sticky mechanics —
`sticky`, `top-6`, `max-h-rail`, `overflow-y-auto`. It cannot be reused for parity because it sizes
and sticks its **first** child, which puts the rail on the left. Parity therefore needs the mirrored
`main-then-rail`.

That mirror is cheap and safe: `md:[&>*:last-child]:w-72`, `md:[&>*:last-child]:shrink-0`,
`md:[&>*:first-child]:min-w-0` and `md:[&>*:first-child]:grow` are **already members** of the locked
`LayoutClassName` union, so the proposal adds a key without widening the class vocabulary.

### Implementation feasibility — `partial`

Reused: `SurfaceCard`, `SurfaceListCard`, `SurfacePanel`, `Tree`, `Badge`, `Button`, `Text`,
`Heading`, `IconTile`, `Divider`, `EmptyNotice`, and the `price-discount-line`, `stacked-sections`
and `heading-over-body` contracts.

Proposed: `main-then-rail`, `pricing-phase-ladder`, `course-stat-chip-run`, the `CoverImage` leaf
(shared with the catalog run), the `CoursePricingRail` block, and one optional savings slot on
`price-discount-line`.

Unmapped, and recorded as such rather than smoothed over:

1. **Curriculum disclosure.** The legacy curriculum discloses through `ModuleAccordionItem`, and the
   target has no accordion branch of any kind. The Plan scene draws flat rows, so whether the
   curriculum discloses is still an open decision inside this direction.
2. **Mobile sticky enroll bar.** The legacy page has one; no owner exists in the target and this
   direction has not settled whether it should be a second owner or folded into the rail.

Both must be settled in Preview, or returned to Plan if they turn out to be product decisions rather
than vocabulary ones.

## Unknowns carried into Preview

1. The target must add a single-course query carrying the full module tree; this Plan does not size
   that document, and the trust chips cannot render without it.
2. Curriculum disclosure, as above.
3. Cart and checkout are absent, so the CTA's destination beyond enrolment is unproven.
4. Whether the mobile enroll bar is reproduced.

## State manifest

Rendered in Plan: populated, dark, desktop only.

Deferred to Preview: skeleton, not-found, failed, mobile, light theme, keyboard focus,
price-pending, guest-no-loyalty, no-phases, slots-scarcity, enrolled-viewer, no-challenges and
zero-enrolment.

## Direction lab

- Path: `D:\Repositories\starci-academy-fe\.artifacts\design-plan\course-detail-page`
- URL: `http://127.0.0.1:8085/`
- Directions: `direction-parity-first`, `direction-decision-band`, `direction-locked-rail`

Plan HTML is directional and is not an Apply baseline. Cover artwork in every scene is a labelled
placeholder, never production imagery. This selection authorizes Preview only; it is not visual
approval and does not authorize Apply.

## Shared proposal with the sibling run

`CoverImage` is proposed by both this run and `.artifacts\design-plan\courses-catalog-page`.
Whichever reaches Apply first owns the leaf; the second must reuse it rather than create a
second owner of the same shape.
