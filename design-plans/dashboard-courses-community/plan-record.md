# Design plan — Dashboard Courses and Community legacy parity

Status: `direction-selected`; ready for `$starci-fe-design-preview`  
Delivery: batch  
Mode: migration/parity  
Production edits: none

## Brief

This batch restores the two missing legacy Dashboard journeys in `starci-academy-fe`: Courses helps
the signed-in learner understand and enter their current or next learning commitment; Community
helps them understand weekly and platform standing and move to the full leaderboard. The named
legacy FE at `D:\Repositories\starci-academy` is binding.

Courses keeps the order **My courses → Courses for you → Upcoming live sessions**. Community keeps
**Weekly league → Top learners**. The shared identity/quick-action rail and persistent navigation
remain unchanged. Each product block fetches and settles independently.

Primary outcomes:

- Courses: opening the relevant course row is the core-loop action.
- Community: opening the full leaderboard is the primary section outcome; row-level follow is
  subordinate.

Anti-goals: no redesign, no fake rows or figures, no reuse of `WhoToFollow` or `WeeklyChallenge` as
substitutes, no page-wide loading state, and no production implementation in this phase.

## Intake and authority ledger

| Claim | Best source | Class | Confidence | Allowed use | Unknown |
| --- | --- | --- | --- | --- | --- |
| Plan Courses and Community in the new FE using legacy | Current user instruction | Product intent | High | Select batch migration and planning-only delivery | None |
| Courses populated desktop/dark geometry | Supplied screenshot | Legacy render | High | Bind visible order, density, grouping and copy | Does not show live, mobile, light or failures |
| Courses owns three independent blocks | Legacy `CoursesTab/index.tsx` | Legacy source | High | Bind block order and self-fetching | None |
| Community owns weekly league then top learners; changelog is excluded | Legacy `CommunityTab/index.tsx` | Legacy source | High | Bind scope and order | Authenticated render not observed |
| Full course-row data already exists | Backend `myCourses` response/resolver | Business truth | High | No backend change for course rows | None |
| Recommendation pricing and reason are checkout-consistent | Backend `RecommendedCoursesService` | Business truth | High | Render honest prices/reasons and max three | None |
| Upcoming sessions are concrete, sorted occurrences | Backend `MyUpcomingLivestreamsResolver` | Business truth | High | Render countdown/date and hide empty | None |
| Weekly and global rankings are real authenticated queries | League resolvers and e2e | Business truth | High | Port queries; preserve self-standing/pinned row | None |
| Global leaderboard lacks current follow state | Backend response type | Business gap | High | Propose one additive field | `isFollowing` absent |
| Current new FE only has simplified Courses and unavailable Community | New `DashboardPage/component.tsx` | Current implementation | High | Define exact orchestration gap | None |
| SurfaceCard/SurfaceListCard own the needed surface mechanics | New branches + contract `why` | UI grammar | High | Reuse branches, propose honest row contracts | None |

The supplied render is
[`codex-clipboard-81f8b14a-7810-4f4b-bb53-42f84b995229.png`](C:/Users/Hi/AppData/Local/Temp/codex-clipboard-81f8b14a-7810-4f4b-bb53-42f84b995229.png).
It proves three enrolled rows and two qualifying recommendations in dark desktop state. It does not
prove the hidden Upcoming Live state or Community geometry. A read-only browser attempt redirected
to login, and no connected authenticated Chrome session was available; Community runtime therefore
remains explicitly unverified.

## Work-item matrix and dependencies

| Work item | Primary owner | Owns | Depends on |
| --- | --- | --- | --- |
| `page-dashboard-tab-orchestration` | page | selected-tab branch and exact block order | all five blocks |
| `block-my-courses-progress` | block | `myCourses`, full progress rows, trial state, route resolution | none |
| `block-recommended-courses` | block | recommendations, localized price/reason, course navigation | course route convention |
| `block-upcoming-livestreams` | block | upcoming query, time formatting/order, course route resolution | none |
| `block-weekly-league` | block | weekly query, countdown, top five, self row, rank movement | none |
| `block-top-learners` | block | global query, top five, self row, follow state/action | optional follow-state enabler |

```text
DashboardPage
├─ existing dashboard rail
└─ selected main
   ├─ Courses
   │  ├─ MyCoursesProgress
   │  ├─ RecommendedCourses
   │  └─ UpcomingLivestreamCard (hidden when empty)
   └─ Community
      ├─ LeagueCard
      └─ TopLearners
```

The page owns no query or block internals. Blocks do not import one another.

## Capability matrix

| UI need | Capability | Classification | Plan |
| --- | --- | --- | --- |
| Full enrolled progress | `myCourses` | reuse | Add FE Query2 selecting existing fields; keep Query1 compatible |
| Personalized recommendations | `recommendedCourses` | reuse | Port types/document/hook |
| Upcoming live sessions | `myUpcomingLivestreams` | reuse | Port types/document/hook |
| Weekly league | `myLeague` | reuse | Port types/document/hook |
| Global leaders/self standing | `globalLeaderboard` | reuse | Port types/document/hook |
| Follow/unfollow | `setFollow` | reuse | Decode global id to raw id before mutation |
| Initial Follow/Following truth | stored `UserFollowEntity`, absent API field | additive-enabler | Add `isFollowing` to global leaderboard entries after approval |

No backend redesign is required.

## State inventory

The detailed machine-readable matrix is in `plan-record.json`. Preview must cover these integrated
scenarios without creating a Cartesian product:

1. Authenticated desktop dark, Courses populated: three progress rows, 1–3 recommendations, and a
   populated live section.
2. Authenticated desktop dark, Community populated: viewer in top five for league, below top five
   globally, with followed and unfollowed stranger rows.
3. Partial landing: one block populated, one loading, one hidden-empty; no page spinner.
4. Empty: no enrolled courses; recommendation and livestream blocks self-hide; league placement
   hint; no global leaders.
5. Recoverable failures: each query fails independently while settled siblings remain.
6. Pending actions: one course-route row resolving; one profile row resolving; one follow mutation
   pending and rollback on failure.
7. Mobile/light counterparts for the two populated states, plus keyboard focus order and hit-target
   semantics.

Loading facts:

- My courses rests as two direct rows, pending preview confirmation against the current three-row
  new-FE contract.
- Recommendations and upcoming live rest as three rows each.
- Weekly league and top learners keep known titles and rest one standing row plus five list rows.
- Static labels, known row meanings and unrelated blocks never shimmer.

## One preliminary direction

`direction-parity` is the only direction because this is a named pure migration.

Because the legacy source and screenshot already establish the product hierarchy, preserve its
five independent blocks and exact reading order so returning learners can enter a course or inspect
competitive standing without relearning the dashboard.

Rule-driven translations only:

- internal destinations report actions and use `router.push`;
- opaque global ids use `resolveRoute` where available;
- Heroicon meanings replace direct Phosphor imports;
- explicit recoverable error states replace the legacy league/top-learners endless-loading failure
  ambiguity required by current BLOCK-8/loading canon;
- truthful initial following state is used only if the additive field is approved.

Critique verdict: **keep**. A simplified generic progress row fails visible parity; substituting
WhoToFollow changes Community from competition to discovery; a shared loading state violates request
ownership; and initializing all follow rows as false would display false business state.

## Contract and component graph

Reuse as-is:

- `dashboard-rail-then-main`, `dashboard-rail`, `label-row-over-card`, heading/fact/action contracts;
- `SurfaceCard`, `SurfaceListCard` including nested border/no-shadow mode;
- `EmptyNotice`, `Avatar`, `Badge`, `IconTile`, `Text`, `Button`, `SeeMoreLink`;
- existing `league` and `course` icon meanings.

Propose contracts:

- `dashboard-courses-main` and `dashboard-community-main`: truthful tab-specific child sets and
  reasons; current `dashboard-main` is overview-specific.
- `course-progress-list`, `course-progress-row`, `course-progress-heading`,
  `segmented-progress-track`, `progress-dimension-legend`.
- `recommended-course-list`, `recommended-course-row`, `price-discount-line`.
- `upcoming-livestream-card`, `upcoming-livestream-list`, `upcoming-livestream-row`.
- `leaderboard-card`, `leaderboard-standing-row`, `ranked-user-list`, `ranked-user-row`,
  `ranked-user-ellipsis-row`.

The leaderboard grammar is shared because weekly league and top learners have the same standing +
ranked-list relationship. Blocks retain different trailing meaning: rank movement versus follow.
Repeated rows remain direct children of their joined-list contract so full-width separators and
first/middle/last padding stay correct.

Public vocabulary/integration proposals:

- Add `QueryMyCourses.Query2` with the existing backend fields; leave Query1 unchanged.
- Port four query/type/hook families: recommendations, upcoming live, weekly league, global board.
- Port a tested `fromGlobalId` utility; never fall back to sending an opaque id to `setFollow`.
- Add `livestream` to the closed Icon meaning map with Heroicons `VideoCameraIcon`.
- Add a semantic `StatusDot` leaf for progress legends: typed tone, accessible label, no raw color
  or class API.

No generic price, course or leaderboard component should be extracted merely for one caller. Shared
arrangements only become components where two real consumers exist; otherwise contracts remain
inside their owning block.

## Backend enabler proposal

`backend-global-leaderboard-follow-state` — **additive-enabler**.

- UI need: TopLearners must know Follow versus Following before interaction.
- API delta: add non-null `isFollowing: Boolean!` to `GlobalLeaderboardEntryData`.
- Application path: batch the authenticated viewer's followed user ids for the returned board in
  `LeagueService`/resolver; avoid N+1 queries.
- Authorization: unchanged `KeycloakAuthGraphQLGuard`; expose only the viewer's relation to already
  visible leaderboard users.
- Compatibility: additive field; existing clients do not select it.
- Tests: followed/unfollowed entries, own row behavior, unauthenticated denial and query-count/N+1
  protection.
- Escalation: if this requires a new permission, lifecycle, durable projection or infrastructure,
  stop and reclassify as backend design.

Rejected alternatives: showing every row as not-following, issuing one status query per row, or
removing the legacy follow action.

## Open decisions before preview/apply

| Unknown | Impact | Resolution owner |
| --- | --- | --- |
| Authenticated Community desktop/mobile/light/dark render | Computed geometry remains unverified | design-preview with authenticated capture or user screenshot |
| New course detail route convention | Recommendation row destination cannot be frozen yet | FE routing owner before apply |
| My-courses resting count 2 vs current contract 3 | Changes first-load height | design-preview; parity currently favors 2 |
| Exact league/top-learners error copy | Canon needs a state absent from legacy source | product/i18n owner in preview |
| Deterministic review seed coverage | Runtime state matrix may be unreachable | backend seed owner before apply verification |

## Preview handoff

Send both records in this folder to `$starci-fe-design-preview` with only
`direction-parity`. Preview must not approve itself and must not omit Community merely because its
legacy runtime could not be authenticated during planning.
