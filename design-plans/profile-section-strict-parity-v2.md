# Whole public profile — strict legacy parity v2

Status: `direction-selected`  
Delivery mode: batch  
Mode: migration/parity  
Selected direction: `strict-parity`  
Selection evidence: “nguyên trang thì 1 hướng thôi” and repeated instruction to respect `starci-academy` absolutely.

## Thesis

Reuse the global StarCi shell unchanged. Inside it, keep the profile tabs above a frameless identity
rail and route-owned evidence column. Port the legacy hierarchy, state priority, progressive
disclosure and responsive relationships; do not reinterpret profile as a dashboard and do not add
outer cards, page padding, navigation variants or invented metrics.

## Evidence ledger

| Claim | Source | Confidence | Allowed use |
| --- | --- | --- | --- |
| Legacy hierarchy and behavior bind the migration. | `D:/Repositories/starci-academy/src/components/{layouts,pages}/Profile*` | proven | exact parity baseline |
| Global navbar is outside profile ownership. | legacy `PublicProfileLayout` begins at tabs/body; current Dashboard owns global shell | proven | reuse unchanged |
| Layout state priority is loading → not-found → locked → ready. | legacy `PublicProfileLayout/component.tsx` | proven | layout branching |
| Ready layout is tabs above `RailShell(ProfileHero, routed body)`. | same source | proven | persistent anatomy |
| `ProfileHero` is a frameless rail. | legacy layout and profile block | proven | reject identity card |
| Overview order is readiness, courses, contributions, two skill snapshots. | legacy `ProfileOverviewPage/index.tsx` | proven | page order |
| Projects are pinned grid then verified capstone list. | legacy `ProfileProjectsPage` subtree | proven | page order and empty policy |
| Challenges group passed submissions by course. | legacy `ProfileChallenges/ProfileChallenges/index.tsx` | proven | reject flattened generic rows |
| Skills use conditional metric ribbon, one Stats card and filtered solve history. | legacy `ProfileSkillsPage/ProfileCoding/index.tsx` | proven | exact page anatomy |
| Coding proof never exposes source code. | legacy `ProfileCodingProblemPage/index.tsx` and API shape | proven | statement/tags + accepted summary only |
| Activity tab is achievement wall then chronological feed. | legacy `ProfileActivityPage` subtree | proven | distinct from contribution calendar |
| Fullstack curriculum is production-shaped. | local mounted DB | proven | 23 modules, 95 content, 348 challenges, 20 milestones, 100 tasks |
| Seeded user has evidence across routes. | `scripts/seed-profile-test-data.mjs` verification | proven | populated local review state |
| Current Projects implementation assumes nullable `techStack` is an array and crashes. | localhost runtime at `ProfileProjectsPage/component.tsx:33` | proven | apply must preserve nullable API behavior |

## Shared decisions

1. The global navbar, tokens and max-width remain the same component used by Dashboard; profile does
   not own or fork them.
2. Profile tabs are one full-width route strip above both columns, not a second card or a detached
   navigation region.
3. `ProfileHero` has no background surface or outer padding card. Only its authored controls own
   their own surfaces.
4. Pages reproduce legacy block order and visitor/owner empty policy. A generic Evidence page is not
   a parity substitute.
5. Contribution calendar and Activity tab remain separate semantics. Rename the overview label back
   to legacy “Contributions”; Activity owns achievements and feed.
6. Nullable API fields are normalized at the connected boundary (`techStack ?? []`); presentational
   components do not guess.
7. Details retain the persistent profile shell. Coding detail shows no source code.

## Work items and states

| Owner | Ready anatomy | Required additional states |
| --- | --- | --- |
| `PublicProfileLayout` | tabs → frameless identity rail + routed body | loading, not-found, locked visitor, ready visitor, owner, mobile |
| Overview | readiness → joined courses → contributions → two equal skill snapshots | per-block pending/error/empty/ready |
| Projects | pinned grid → verified capstone list | visitor hidden-empty, owner guided-empty, partial error, roadmap missing |
| Challenges | conditional metrics → Stats card → course-grouped passed submissions | empty/error, course search/filter, submission missing |
| Skills | conditional metrics → Stats card → solve toolbar/history | empty/error/filtered-empty, coding detail missing/unsolved/solved |
| CV | A4 paper/PDF with owner edit action | pending, absent, public-uncompiled, failed, ready |
| Activity | grouped badge wall → day-grouped feed | pending, empty, failed, paginating |

## Contract graph

```text
ExistingGlobalShell (unchanged)
└── PublicProfileLayout
    ├── ProfileTabsBar
    └── profile-tabs-over-body
        └── rail-then-main
            ├── ProfileHero (frameless)
            └── routed Profile*Page
                └── stacked-sections
                    ├── label-row-over-card
                    ├── SurfaceCard / SurfaceListCard
                    └── route-specific legacy composites
```

- `profile-tabs-over-body`: profile chrome remains above identity and evidence.
- `rail-then-main`: stable identity width, flexible evidence, rail-first mobile stacking.
- `stacked-sections`: independent remote-state owners keep major seams.
- `label-row-over-card`: label outside the one bounded surface; no card-inside-card.
- `activity-feed-list`: chronological peers stay joined and grouped by day.

No backend enabler is needed. Existing GraphQL behavior is sufficient; the task is parity and safe
nullable mapping.

## Current implementation rejection risks

- The current FE replaced most legacy subtrees with generic blocks (hundreds of legacy lines removed
  per page), so matching nouns is not evidence of matching anatomy.
- Added metric/card abstractions changed density and hierarchy before source parity was established.
- The seeded course pin currently crashes because `techStack` is nullable.
- Current overview copy “Learning activity” obscures the legacy distinction between Contributions
  and Activity.
- Any code sample on public coding proof invents data the API intentionally does not return.

## Handoff

The direction lab is one interactive system concept, not competing variants:
`D:/Repositories/starci-academy-fe/.artifacts/profile-section-strict-parity-v2/index.html`.
Preview must next render complete desktop/mobile and owner/visitor/error states side-by-side with the
legacy source before production apply resumes.
