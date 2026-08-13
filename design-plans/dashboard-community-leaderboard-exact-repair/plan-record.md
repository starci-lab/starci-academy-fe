# Design plan — Dashboard Community leaderboard exact repair

Status: `direction-selected`  
Delivery: `batch` (two sibling blocks)  
Mode: `exact-repair`  
Production edits: none

## Brief

Restore the Dashboard Community leaderboard to the named legacy render. The learner must first see
their own weekly/global standing, then compare it against the ranked people below, and finally use
the quiet section-level “View leaderboard” path. Row-level follow remains subordinate.

The current `starci-academy-fe` output is not parity: it flattens the inner list into the outer card,
omits avatars and first/second/third-place artwork, changes the self-row treatment, and changes the
standing hierarchy. This repair does not redesign those choices.

## Authority and conflict resolution

| Claim | Authority | Consequence |
| --- | --- | --- |
| Exact visible Community geometry | User-supplied legacy runtime screenshot | Binding for section/card/list hierarchy, density and visible content |
| Query behavior, top-five slicing, pinned self row and follow action | `starci-academy` source | Preserve behavior and state ownership |
| Current implementation drift | `starci-academy-fe` render/source | Evidence of what must change, never a parity baseline |
| Surface/list mechanics | Current FE canon and `SurfaceListCard` nested mode | Translate the legacy nested list without caller-authored border/shadow CSS |
| Rank artwork mapping | Current user instruction plus legacy `rankBadge.tsx` | Use `@iconify/react`; ranks 1–3 are place medals and every rank 4+ is a trophy |

The legacy source comment describes the two cards as identical, while the supplied runtime shows a
weekly standing aligned beside its medal and a global standing aligned to the opposite edge. The
newer user-provided runtime is binding for visible geometry; the shared behavior remains common.

## Work-item matrix

| Work item | Scope | Owns | Depends on |
| --- | --- | --- | --- |
| `block-weekly-league-exact-repair` | block | weekly standing, cohort rows, rank movement, pinned self row | shared rank/list vocabulary |
| `block-top-learners-exact-repair` | block | global standing, top learners, follow controls, pinned self row | shared rank/list vocabulary |

```text
CommunityTab (order unchanged)
├── LeagueCard
│   └── section label + View leaderboard
│       └── outer story surface
│           ├── weekly standing hero
│           └── nested bordered ranked list
└── TopLearners
    └── section label + View leaderboard
        └── outer story surface
            ├── global standing hero
            └── nested bordered ranked list
```

## Exact parity direction

`direction-exact-legacy-parity`

- Thesis: preserve the legacy competition hierarchy rather than reinterpret it.
- Primary CTA: the quiet “View leaderboard” link at the section heading.
- Success: at a glance, the learner can distinguish their standing from the cohort and recognize
  each ranked person by rank artwork and avatar.
- Reading order: section label/action → standing hero → nested ranked list → optional pinned self row.
- Deliberate divergence: none.

### Required visual invariants

1. Section title and “View leaderboard” remain outside and above the outer card.
2. Outer card remains one rounded story surface; it contains a standing hero plus a nested joined
   list with one token border and no second shadow.
3. Weekly hero: rank medal tile, rank/top-percent line, XP/reset line; content stays beside the tile.
4. Global hero: trophy tile at the leading edge; global rank/XP summary remains at the trailing edge.
5. Ranked row: fixed rank slot, first/second/third-place medal artwork or trophy artwork for rank
   4+, avatar, one-line
   username, right-aligned tabular XP, then rank delta or quiet follow control.
6. Viewer row uses accent name plus `· Bạn`, has no follow action, and may be pinned after the top
   slice when outside it.
7. Top-five density and separators match the legacy list; no oversized gaps and no handle subtitle.

## Reuse and vocabulary plan

- Reuse `SurfaceCard` for the named outer story surface.
- Reuse `SurfaceListCard` with `isNested: true` and `isLabelHidden: true` for the inner ranked list.
- Revise `leaderboard-card` so it owns a standing summary and one nested-list projection rather than
  a raw unbounded `ranked-user-list`.
- Split the current standing grammar into `weekly-leaderboard-standing` and
  `global-leaderboard-standing`; the screenshot proves different alignment.
- Revise `ranked-user-row` to restore avatar, one-line identity, fixed rank artwork/number, tabular
  XP and mutually exclusive `movement | follow | none` trailing semantics.
- Add `ranked-user-ellipsis-row` for a truthful pinned-self gap.
- Port the legacy rank artwork owner through a closed `RankMark` leaf backed by `@iconify/react`:
  ranks 1/2/3 map to `fluent-emoji-flat:1st-place-medal`, `2nd-place-medal` and
  `3rd-place-medal`; every rank 4+ maps to `fluent-emoji-flat:trophy`. The exact numeric rank remains
  in the accessible label. This is an explicit product-rank artwork exception requested by the
  user, not permission for callers to import arbitrary Iconify glyphs. Bind the closed map in tests.

No backend enabler is needed. Existing `myLeague`, `globalLeaderboard`, `isFollowing` and
`setFollow` capabilities cover the repair.

## State inventory

Both blocks require populated, loading, empty and recoverable-error states. Weekly requires rank
movement and pinned-self variants. Top learners requires following, not-following, pending action,
rollback and own-row-disabled variants. Preview must also render desktop/mobile, light/dark and
keyboard focus. Plan renders only the populated dark desktop state.

## Critique

Verdict: **keep**.

- Reject the current flat list: it erases the legacy nested membership boundary and removes visual
  identity needed to scan people.
- Reject a generic shared standing row: the supplied runtime proves different weekly/global
  alignment.
- Reject direct Iconify imports at call sites: `RankMark` is the one closed owner of the four
  approved `fluent-emoji-flat` artwork IDs.
- Reject any follow button on the viewer row and any primary-style row action: both contradict the
  legacy hierarchy.

## Direction lab

- Path: `D:\Repositories\starci-academy-fe\.artifacts\design-plan\dashboard-community-leaderboard-exact-repair`
- URL: `http://127.0.0.1:8084/`
- Case: `direction-exact-legacy-parity`

Selected direction: `direction-exact-legacy-parity`.

Selection evidence: user requested “rồi chạy skills preview đi” after refining the rank artwork to
Iconify Fluent Emoji medals for ranks 1–3 and trophy for rank 4+.

This selection authorizes Preview only; it is not visual approval and does not authorize Apply.
