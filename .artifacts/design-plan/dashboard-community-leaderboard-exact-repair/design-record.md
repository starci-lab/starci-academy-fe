# Approved design record

- Task: `dashboard-community-leaderboard-exact-repair`
- Mode: `exact-repair`, batch
- Approved case: `direction-exact-legacy-parity`
- Preview: `http://127.0.0.1:8084/`
- Context: `D:\Repositories\starci-academy-fe\.artifacts\design-plan\dashboard-community-leaderboard-exact-repair\context-lock.preview.json`
- Approval: user said `cái màu xanh đâu phải border, nó là verdict mà nhỉ??? chốt thì dứt luôn apply` on 2026-08-12.

## Frozen decisions

The section heading and leaderboard action stay outside one competition surface. The standing hero
and nested separated user list remain one story. Rows restore avatar, rank artwork, identity, XP and
the mutually exclusive movement/follow outcome.

`RankMark` is the only approved `@iconify/react` boundary. Ranks 1/2/3 use the exact Fluent Emoji
Flat place medals; every rank 4+ uses the trophy. Callers pass a numeric rank, never an arbitrary
Iconify ID.

The green treatment is a data verdict, not decoration and not a border. Positive `rankDelta` maps to
`success`, negative maps to `danger`, and zero/null maps to no verdict. The row contract renders a
two-pixel inset left band that follows its corner radius. Being the viewer does not itself produce a
verdict.

## Work and file boundaries

Shared vocabulary and contracts may write only:

- `package.json`, `package-lock.json`
- `plugins/eslint/icon-dependency-parity.test.mjs`
- `plugins/eslint/icon-vocabulary.mjs`
- `plugins/eslint/icon-vocabulary.test.mjs`
- `src/components/contracts/index.ts`
- `src/components/branches/SurfaceListCard/index.tsx`
- `src/components/leaves/RankMark/index.tsx`
- `src/components/leaves/RankMark/index.test.tsx`
- `src/components/composites/LeaderboardStandingRow/index.tsx`
- `src/components/composites/LeaderboardStandingRow/index.test.tsx`
- `src/components/composites/RankedUserRow/index.tsx`
- `src/components/composites/RankedUserRow/index.test.tsx`

Weekly league may write only its `index.tsx`, `component.tsx`, and `component.test.tsx` under
`src/components/blocks/dashboard/LeagueCard/`. Top learners has the same three-file boundary under
`src/components/blocks/dashboard/TopLearners/`.

No backend file, translation file, route, persistent layout, trust file or legacy file is approved
for mutation.

## State coverage

The eight preview scenarios cover populated dark desktop, independent loading and recoverable
failure for each block, settled empty, follow pending/rollback/focus, light theme and mobile. The
viewer has no follow action. Weekly has no mutation states. Neither query exposes a distinct
terminal failure. Success verdict, no-verdict and all rank artwork are rendered; danger verdict uses
the same closed mapping and requires a focused production test.

## Evidence and remaining unknown

The binding baseline is the named legacy repository and supplied runtime screenshots. Legacy
`rankBadge.tsx` proves the rank-art mapping; `verdict-band.ts` proves that verdict is an inset
left-edge semantic signal. Final pixel tuning remains to be compared at the same effective legacy
viewport during Apply; no product or business decision remains open.
