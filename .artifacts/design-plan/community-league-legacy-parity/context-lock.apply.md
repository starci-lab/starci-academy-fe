# Context lock — apply

Status: **`confirmed`**.

| Field | Inherited (preview) | Detected now | Drift |
|---|---|---|---|
| Trust root | `…backend\.claude` | `26b9980` | none |
| Target | `starci-academy-fe` `main` | `main` `7aa4ba0` | HEAD advanced by the restore commit this phase asked for; branch and worktree unchanged |
| Parity baseline | `starci-academy` `mtp` `9a1934231` | same | none |
| Case / revision | `case-community-league` / `1.5` | same | none |
| Seal | — | `d99b27f275074e671fb207b6e4d1c428d8233c3e49e2db9da8eb812fc38bce9e`, verifier `ok: true` | none |

## Gates

| Gate | Result |
|---|---|
| `verify_design_record.mjs` | **PASS** — `ok: true` |
| `audit-fe-lint-adoption.mjs` | **PASS** — `ok: true`, `missing: []`, `nonError: []`, `refusesInlineConfig: true` |
| candidate lint / typecheck / build | **0 / 0 / 0** |

The adoption gate was the block that stopped the previous attempt. It is now green because the rule
set was moved to one authored source and mirrored into `plugins/eslint-canon/`; this phase did not
weaken it to pass.

## Confirmed write boundary

Repository `D:\Repositories\starci-academy-fe`, branch `main`, worktree `D:\Repositories\starci-academy-fe`:

- `src/components/contracts/index.ts`
- `src/components/leaves/RankDeltaCaret/index.tsx` *(new)*
- `src/components/composites/Podium/index.tsx` *(new)*
- `src/components/composites/StandingHeroCard/index.tsx` *(new)*
- `src/components/composites/RankedUserRow/index.tsx`
- `src/components/composites/LeaderboardStandingRow/index.tsx`
- `src/components/branches/SurfaceListCard/index.tsx`
- `src/components/blocks/dashboard/LeagueCard/{index,component}.tsx`
- `src/components/blocks/dashboard/TopLearners/{index,component}.tsx`
- `src/components/pages/LeaguePage/{index,component}.tsx` *(new)*
- `src/app/league/page.tsx` *(new)*
- `src/messages/vi.json`, `src/messages/en.json`
- co-located `*.test.tsx` for each touched owner

Read-only throughout: `starci-academy`, `starci-academy-backend`, the trust tree.

## Confirmation evidence

Restated: *"Duyệt revision 1.5 và write boundary để em ghi 16 file vào starci-academy-fe (main, 7aa4ba0)?"*
Answered: **"Đồng ý, seal 1.5 và ghi"**.

## Recovery

`7aa4ba0` is a restore point created earlier in this phase specifically so the previous, never-committed
leaderboard work could survive this materialization. The target carries other uncommitted changes from
other sessions; nothing outside the boundary above is touched.

## Carried forward as unresolved, by the user's decision

The follow control still renders as a filled primary button with no glyph, where production draws a
quiet outlined control with a person-plus glyph. It is recorded in the sealed record's `unknowns`
as an open parity delta, not as parity.
