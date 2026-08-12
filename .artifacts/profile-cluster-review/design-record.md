# Design record — public profile cluster

Approved: 2026-08-12 by explicit user instruction `ok làm hết đi /starci-fe-design-apply`  
Delivery: batch  
Mode: migration/parity  
Approved case: `case-parity-a`

## Frozen brief

The public profile keeps identity and one contextual CTA continuously visible while each proof
family remains a shareable route. The persistent layout owns canonical username, visibility,
identity, tabs and contextual exits. Pages order independently connected product blocks.

## Frozen scope

- `/profile` canonical redirect.
- `/profile/[username]` Overview.
- Projects plus capstone detail.
- Challenges plus course and submission detail.
- Skills plus coding-problem detail.
- Activity and public CV.
- Loading, locked, not-found, owner/visitor, signed-out and narrow states.

Out of scope: settings, Edit Profile destination, private CV gallery/editor and pinned-project
management overlay. The public-profile exits remain, but those destination experiences are not
implemented in this batch.

## Shared decisions

- Legacy `D:\Repositories\starci-academy` binds route hierarchy, block order, state intent and
  responsive relationships.
- Use target FE contracts, connected/pure split, SWR/Apollo, HeroUI leaves and internal
  `router.push` boundary.
- Contextual CTA precedence is Edit profile → Hire me → Follow/Following; share stays secondary.
- Identity rail stacks before evidence on narrow screens; profile tab glyphs remain visible.
- The identity rail is frameless in the target parity render; do not add a card surface around
  `ProfileHero`. This explicit review correction overrides the earlier illustrative lab surface.
- Each query-owning block lands independently; no page-level aggregate loading flag.
- Visible copy says content, never lesson.

## Approved owner tree

```text
PublicProfileLayout
├── ProfileTabs
└── profile-tabs-over-body
    ├── ProfileHero
    └── Routed Profile*Page
        └── independently connected evidence blocks
            ├── SurfaceCard / SurfaceListCard
            ├── proof composites
            └── leaves
```

## Approved vocabulary

- Reuse `nav-over-body-page`, `rail-then-main`, `stacked-sections`, `label-row-over-card`, surface
  branches, contribution calendar, activity row and existing leaves.
- Add `PublicProfileLayout`, `ProfileHero`, profile evidence blocks and truthful profile/proof
  contracts required by the approved case.
- Extend `ExtendedTabs` only if current source cannot express icon-visible/label-hidden narrow tabs;
  omission must preserve Dashboard callers.

## State matrix

Loading never flashes not-found. Settled not-found and locked states suppress tabs/body. Owner and
visitor tab visibility differs by backend visibility fields. Each block owns pending, failed, empty
and ready. Detail missing keeps layout and offers a back path. CV distinguishes no public CV from
not compiled. Signed-out public profiles remain readable; follow routes through sign-in. Narrow
screens stack rail first and preserve route order.

## Rejected directions

- One long portfolio story: breaks route shareability and is an unrequested redesign.
- Metric-first dashboard: demotes identity and invents an aggregate profile score.

## Remaining verification risk

Exact authenticated legacy pixels at desktop, narrow and dark mode were not available during plan;
apply must compare source-defined hierarchy and the approved review lab, then record any residual
pixel drift without changing product intent.
