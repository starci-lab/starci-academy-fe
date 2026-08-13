# Design plan — Community tab + Leaderboard page, legacy parity

Status: `direction-selected`
Case: `case-community-league`
Delivery: `batch` (two dashboard blocks + one new page)
Mode: `migration`
Render status: `directional-not-apply-baseline`
Production edits: none

## Brief

The target's Community tab reinterprets a competition story that the named production render already
settles, and the leaderboard page it links to does not exist. This plan restores the legacy render
rather than redesigning it.

## Parity baseline

`D:\Repositories\starci-academy` (branch `mtp`, HEAD `9a19342`), rendered at
`academy.starci.org/vi/dashboard?tab=community` and `academy.starci.org/vi/league`.

## Measured drift

| Legacy | Target today | Source |
| --- | --- | --- |
| `{count} XP` | `{count} điểm` | `messages/vi.json` both repos |
| `Hạng #{rank} · top {percent}%` | `Hạng của bạn · #{rank}` | `LeagueCardContent/index.tsx:119` vs `LeagueCard/index.tsx:54` |
| `{XP} · Reset sau {d} ngày {h} giờ` as one subtitle | XP alone, countdown promoted to a warning badge, hours dropped | `LeagueCardContent/index.tsx:123` vs `LeagueCard/index.tsx:57` |
| `RankDeltaCaret` (▴1 / ▾2) | Badge sentence `Tăng 1 hạng`, or subtitle `Không đổi hạng` | `LeagueCardContent/index.tsx:105` vs `LeagueCard/index.tsx:39` |
| `Top học viên tuần` | `Top học viên` | i18n `top.heading` |
| `/league` page with tabs, hero, meter, CTA, podium, ellipsis, self row | route absent | `starci-academy-fe/src/app` tree |

`LeagueCard` and `TopLearners` both `router.push("/league")`, so the production "Xem bảng xếp hạng"
control is currently a dead link.

## Business truth

No backend enabler is required. `query-my-league.ts` already requests `tier`, `weekEndAt`,
`promoteCount` and `demoteCount`, and the target renders none of them. The percentile and the
"points to next rank" meter are legacy FE formulas over data already in hand:

- percentile — `Math.max(1, Math.ceil(rank / entries.length * 100))`
- points to next — `above.points - myPoints + 1`, shown only when the rank above is inside the
  fetched slice and the viewer is not rank 1

`globalLeaderboard` returns no total user count, so a global percentile is genuinely underivable and
the legacy render does not claim one.

## Selected direction

`direction-legacy-parity` — posture `parity-first`, zero deliberate divergence.

Reading order: section label and action → standing line with rank and percentile → combined XP and
reset subtitle → ranked list → optional pinned self row.

Two rejected alternatives stay recorded: `direction-one-surface` (`balanced`, collapses the two
dashboard cards behind a scope switch) and `direction-page-first` (`bold`, strips ranked identity
off the dashboard entirely). Both diverge from the baseline and neither is supported by the
evidence; they existed so the choice was visible, not because they were recommended.

## Vocabulary

New owners: `RankDeltaCaret` (leaf), `Podium` (composite), `StandingHeroCard` (composite),
`ranked-user-ellipsis-row` (contract), `LeaguePage` (page).
Reused unchanged: `SurfaceCard`, `SurfaceListCard`, `RankedUserRow`, `RankMark`, `ChoiceTabs`,
`Progress`, `Avatar`, `EmptyNotice`.
Caller-side only: `LeaderboardStandingRow` composes one subtitle instead of splitting the countdown
into the fact badge — no signature change.
i18n: the `community` namespace is restored to the legacy strings in both locales together.

## State manifest

Plan renders the populated dark desktop state for both surfaces. Preview owns loading, empty,
failed, movement up/down/none, pinned self row, follow/pending/rollback, own-row-without-follow,
viewer-in-podium / in-rows / below-slice, progress-absent-at-rank-1, and the desktop/mobile,
light/dark and keyboard-focus matrix.

## Direction lab

- Path: `D:\Repositories\starci-academy-fe\.artifacts\design-plan\community-league-legacy-parity`
- URL: `http://127.0.0.1:8082/`
- Directions: `direction-legacy-parity`, `direction-one-surface`, `direction-page-first`

Selection evidence: the user replied "ok preview", which named no direction, so the binary re-ask
required by the skill was issued and the user selected "A · Legacy parity". `selectionKind` is
`explicit`.

This selection authorizes Preview only. It is not visual approval and does not authorize Apply.
