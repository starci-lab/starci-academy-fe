# Dashboard Explore — legacy-parity design plan

Status: implemented; static legacy parity audit complete; authenticated runtime review pending  
Scope: `/dashboard?tab=explore` only  
Mode: strict legacy parity; no visual or product invention

## 1. Source binding

The visual and behavioural source of truth is the legacy FE in
`D:\Repositories\starci-academy`. The new FE architecture and `.claude` rules decide ownership,
typing, contracts, loading, and vendor boundaries; they do not redesign the page.

| Concern | Authoritative legacy source | Behaviour to preserve |
| --- | --- | --- |
| Explore page order | `src/components/pages/DashboardPage/ExploreTab/index.tsx` | `FeedTabs`, then `WhoToFollow`, with a `gap-6` seam |
| Feed controller | `src/components/pages/DashboardPage/FeedTabs/index.tsx` | For You/Following, category filter, cursor pagination, reaction mutation, route resolution |
| Feed states/render | `src/components/pages/DashboardPage/FeedTabs/component.tsx` | independent skeleton, full error, filtered empty, platform empty, inline pagination retry |
| Trending | `src/components/pages/DashboardPage/TrendingContents/{index,component}.tsx` | six ranked contents; first three accented; empty/error disappears |
| Activity stream | `src/components/blocks/feed/ActivityFeed/{index,component}.tsx` | local-day groups, same-actor milestone roll-up, relative time, reaction affordance |
| Feed controls | `src/components/blocks/navigation/TabsCard/index.tsx` and `src/components/composites/navigation/DoubleTabsCard/index.tsx` | two controlled tab axes and the legacy responsive label/icon behaviour |
| Suggestions | `src/components/pages/DashboardPage/WhoToFollow/{index,component}.tsx` | four-row loading shape, per-row follow pending, open-to-work badge, settled empty hidden |

Known rule-driven translations, and only these translations:

- Legacy `lesson` copy becomes `content`, per the strict StarCi vocabulary rule.
- Internal navigation reports an action and uses `router.push`; no internal `href`.
- HeroUI icons replace legacy icon vendors, using only `size-5` or tiny semantic status marks.
- A standalone business section does not gain a decorative icon. List/tab icons remain where they
  help scanning and preserve the legacy information shape.

## 2. Capability audit

The backend already owns every required capability. Explore is blocked by missing new-FE
integration and rendering, not by backend product work.

| Capability | Backend operation | New FE status |
| --- | --- | --- |
| Personal/following feed | `myFeed` | missing query types, document, infinite SWR hook, block |
| Trending content | `trendingContents` | missing query types, document, SWR hook, block |
| Suggested people | `suggestedUsers` | missing query types, document, SWR hook, block |
| Follow/unfollow | `setFollow` | missing mutation types, document, mutation hook |
| React/unreact | `reactToActivity` | missing mutation types, document, mutation hook |
| Entity navigation | `resolveRoute` | already integrated; reuse `queryResolveRoute` |

Backend request/response facts that must remain visible in the FE types:

- `myFeed`: `tab = ForYou | Following`, `category = All | Courses | Achievements | People`,
  optional cursor, default limit 20, and `nextCursor`.
- Feed rows retain actor global id/name/avatar, activity type, optional target global id/label,
  timestamp, reaction count, current reaction, and `isMine`.
- Trending rows retain global id, title, and read count.
- Suggested users retain global id, username, optional display name/avatar, and `openToWork`.
- `resolveRoute` may return `path: null`; a missing route is not permission to invent a URL.

## 3. Page and ownership graph

```text
DashboardPage (page; selected tab and block order only)
└─ ExploreTab (page section; gap-6)
   ├─ FeedExplorer (connected block; gap-6)
   │  ├─ TrendingContents (connected block)
   │  │  └─ SurfaceListCard<trending-content-list>
   │  ├─ StackedChoiceTabs (pure composite; two controlled tab axes in one bordered surface)
   │  └─ ActivityFeed (pure product block fed by FeedExplorer)
   │     └─ N × SurfaceListCard<activity-row-list>, one per local day
   └─ WhoToFollow (connected block)
      └─ SurfaceListCard<suggested-user-list>
```

Ownership decisions:

- `DashboardPage` does not fetch Explore data. It mounts `ExploreTab` only when Explore is active,
  preserving the legacy lazy-mount behaviour.
- `FeedExplorer` owns feed tab/category state, infinite query, pagination, route resolution, and
  reaction mutation. `_FeedExplorer` receives one explicit render state.
- Activity roll-up and local-day grouping are product semantics, so they stay in the feed block
  resolver. They are not moved into a generic composite.
- `TrendingContents` and `WhoToFollow` remain independent connected blocks because each has its
  own request, failure policy, and loading lifetime.
- `StackedChoiceTabs` is a pure composite because it fixes a closed arrangement of two tab
  controls. It receives inert options, values, and callbacks. It owns no query or product state.
- Do not generalise the current `ExtendedTabs`: that leaf is the dashboard navigation contract,
  not a polymorphic feed-filter API.

## 4. Proposed production units

### Page and blocks

- `src/components/pages/DashboardPage/ExploreTab/index.tsx`
- `src/components/blocks/dashboard/FeedExplorer/index.tsx`
- `src/components/blocks/dashboard/FeedExplorer/component.tsx`
- `src/components/blocks/dashboard/TrendingContents/index.tsx`
- `src/components/blocks/dashboard/TrendingContents/component.tsx`
- `src/components/blocks/dashboard/WhoToFollow/index.tsx`
- `src/components/blocks/dashboard/WhoToFollow/component.tsx`
- `src/components/blocks/dashboard/ActivityFeed/component.tsx`

`index.tsx` is connected and resolves remote state. `component.tsx` is the pure `_X` half and
accepts named `XProps`; do not use inline intersections in component parameters.

### Reusable rendering units

- `src/components/composites/StackedChoiceTabs/index.tsx`
- `src/components/composites/TrendingContentRow/index.tsx`
- `src/components/composites/ActivityRow/index.tsx`
- `src/components/composites/SuggestedUserRow/index.tsx`
- `src/components/leaves/ReactionPicker/index.tsx`

These are fixed visual clusters. Product choices such as grouping, follow eligibility, reaction
eligibility, and route outcomes remain in blocks.

### GraphQL and hooks

- Queries: `query-my-feed`, `query-trending-contents`, `query-suggested-users` plus named response
  types under the existing query folders.
- Mutations: `mutation-set-follow`, `mutation-react-to-activity` plus named request/response types.
- Hooks: `useQueryMyFeedSwr`, `useQueryTrendingContentsSwr`, `useQuerySuggestedUsersSwr`,
  `useMutateSetFollowSwr`, and `useMutateReactToActivitySwr`.
- Reuse `queryResolveRoute`; do not add a second route resolver.

## 5. Contract graph

Add only contracts whose child identity or repetition must be enforced by type.

| Contract | Typed children/repetition | Resting loading count | Surface policy |
| --- | --- | --- | --- |
| `explore-main` | `feedExplorer`, `whoToFollow` | none | page seam `gap-6` |
| `feed-explorer` | `trending`, `filters`, `feed` | none | major sections `gap-6`; filter→feed `gap-3` |
| `trending-content-list` | repeated `TrendingContentRow` | 6 | `SurfaceListCard`, `p-0`, full-width dividers |
| `stacked-choice-tabs` | `primary`, `secondary` | none | one bordered surface, full-width divider, `p-2` per axis |
| `activity-feed-list` | repeated `ActivityRow` | 3 | one joined surface per local day, `p-0` |
| `suggested-user-list` | repeated `SuggestedUserRow` | 4 | `SurfaceListCard`, `p-0`, full-width dividers |

Do not add a contract merely to name an ordinary wrapper. The existing `SurfaceListCard` branch
owns label + joined list + optional description/action. Each list contract owns the admitted row
recipe and repeated inert item data.

Joined-list geometry follows the settled dashboard rule:

- label → surface: `gap-2`;
- surface itself: `p-0`;
- first row: `px-4 pt-4 pb-2`;
- middle rows: `px-4 py-2`;
- last row: `px-4 pt-2 pb-4`;
- divider touches the surface edges between rows;
- nested surface uses border and no shadow.

## 6. Explicit state matrix

| Block/state | Required render |
| --- | --- |
| Trending pending | six ranked row skeletons inside its own joined surface |
| Trending empty/error | render nothing; feed moves up exactly as legacy |
| Feed initial pending | two day groups, three inert activity-row skeletons per group |
| Feed content | local-day `SurfaceListCard`s in newest-first order |
| Feed full error with no rows | one retryable async error state |
| Feed next-page pending | preserve rows; pending load-more control only |
| Feed next-page error | preserve rows; inline retry at the list end |
| Filtered empty | legacy filtered-empty message plus clear/reset-to-All action |
| Platform empty | legacy platform-empty message plus Browse content action |
| Reaction pending | preserve row geometry; lock only that reaction control |
| Own activity | no reaction action, matching legacy |
| Suggestions pending | four user-row skeletons |
| Suggestions empty/error | render nothing |
| Follow pending | optimistic row state; lock only the affected user row |

Skeletons must preserve the final row geometry. Static labels and known counts do not become fake
text bars; only unresolved data uses loading treatment.

## 7. Visual and content parity checklist

- Preserve the legacy order: Trending → filter/feed → Who to follow.
- Preserve `gap-6` between large blocks, `gap-3` between peer groups, and `gap-2` inside a bonded
  label/surface or label/control group.
- Section labels are `text-sm` semibold. Supporting facts/timestamps are `text-xs` muted.
- A success state uses the success token family (`text-success-soft`, or the paired success
  foreground/background tokens); no hand-picked green.
- Icons are HeroUI only. Normal scan icons are `size-5`; tiny icons are reserved for generic status
  marks such as check/cross. No decorative tiny business icons.
- Rank 1–3 retain the legacy accent-soft treatment; lower ranks remain muted.
- Activity actor and target names are independently actionable when a route resolves.
- Same-actor consecutive milestone passes roll up before day grouping, exactly as legacy.
- Relative timestamps and Today/Yesterday labels use the current locale.
- Open-to-work remains a badge/chip, not plain body text.
- All legacy `lesson` labels shown in this page are translated to `content`.

## 8. Living seed requirement

Explore review is invalid against an empty database. Extend the backend development seed so the
signed-in review account sees, deterministically:

- at least 10 distinct users with stable usernames and DiceBear Lorelei fallback seeds;
- suggested users covering followed/unfollowed and open-to-work variants;
- trending contents with distinct read counts so ranks 1–6 are visible;
- feed events across Today, Yesterday, and an older date;
- at least one same-actor milestone sequence to prove roll-up;
- actor-only, actor+target, own-activity, and reacted/unreacted rows;
- enough rows for a second cursor page;
- one Following result and one category-specific empty case.

Seed scripts must be idempotent and development-scoped. The UI must never fabricate these rows as
component fallback data.

## 9. Port order

1. Add GraphQL types/documents and SWR hooks; manually verify authenticated envelopes and cursor
   progression.
2. Add the six Explore contracts and type builders; prove wrong row recipes fail typecheck.
3. Port `TrendingContents` with legacy ranks and independent hide-on-empty/error policy.
4. Port `StackedChoiceTabs`, then `FeedExplorer` state resolution and infinite pagination.
5. Port activity resolver/rendering: roll-up, day grouping, routing, and reactions.
6. Port `WhoToFollow` with optimistic per-user pending state.
7. Mount `ExploreTab` in `DashboardPage`; keep inactive tabs unmounted.
8. Add living backend seed data and review every state at desktop and narrow widths.

Per current project direction, keep existing tests but do not add new tests unless explicitly
requested. Verification for this pass is typecheck, lint, production build, GraphQL/manual state
checks, and side-by-side visual comparison against the legacy Explore render.

## 10. Acceptance boundary

Explore is implemented. It is complete only after authenticated runtime review confirms:

- no Explore request starts before its tab mounts;
- the three independent request lifetimes do not collapse into one page spinner;
- all state rows above are reachable and visually stable;
- legacy layout, list seams, responsive controls, copy intent, and interaction paths match;
- deviations are limited to the explicit StarCi rule translations in section 1.

Out of scope: Courses tab, Community tab, profile pages, notification/cart behaviour, and any
creative redesign of Explore.

## 11. Static parity audit record

- Trending rows render rank and title only. Backend read counts determine ordering but are not
  displayed, matching the legacy row.
- Feed empty states do not gain a decorative business icon when the legacy state has none.
- Loading suggestion rows use empty inert copy; pure components never fabricate English labels.
- Composite structural hosts are closed through typed contracts; raw `div`, `article`, `ul`, and
  `ol` are rejected by the structural-host gate inside `composites/`.
