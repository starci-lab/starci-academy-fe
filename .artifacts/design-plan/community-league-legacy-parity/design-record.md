# Approved executable design record — Community tab + Leaderboard page

Case: `case-community-league`
Direction: `direction-legacy-parity` (posture `parity-first`)
Approved revision: **`1.4`**
Seal: `sha256:b811a5a9a391aef3c6bce36194c490a161b13a428d581141ff783e0f9caf9977`
Approval: `confirmed-restated` — the revision was named back before the user's bare confirmation.

## What the candidate is

A Vite app under `candidate/` that imports the LOCKED target components read-only through an `@`
alias (2444 modules). It is not a facsimile: every leaf, composite, branch, contract and token in
the render comes from `starci-academy-fe/src`.

- typecheck `tsc --noEmit -p candidate/tsconfig.json` → exit 0
- build `vite build --config candidate/vite.config.mts` → exit 0
- console errors → none
- six states rendered and screenshotted headlessly at 1280×900, dark, `vi`, owner persona

## Revisions

| Rev | Change | Trigger |
|---|---|---|
| 1.0 | Parity build: percentile standing, one XP·reset subtitle, caret instead of Badge, podium, hero meter, ellipsis row | selected direction |
| 1.1 | Dropped `rounded-2xl` from both verdict rows | user: one shared border like the original source |
| 1.2 | `isVerdict` added to `SurfaceListCard`, derived from row data | user: add isVerdict to SurfaceListCard |
| 1.3 | Dais order moved onto the `podium` contract so places emit best-first | user approved the a11y fix |
| 1.4 | Dropped `justify-between` from `leaderboard-standing-row`; body owns spare width | the parity screenshot caught a defect 1.0 introduced |

Revision 1.4 exists because a screenshot was looked at. Removing the invented countdown badge left
two of three slots filled, and `justify-between` then threw the medal to one margin and the standing
sentence to the other. Reasoning about the change would not have found it.

## Open parity deltas — recorded, NOT resolved

1. **Follow control appearance.** Production draws a quiet outlined control with a person-plus
   glyph; the candidate draws the target's existing filled primary `Button`.
2. **Pending follow control is an empty pill.** HeroUI's `Button` swallows its label under
   `isPending` and ships no spinner of its own.

Both are pre-existing `RankedUserRow` behaviour that no revision here changed, and both sit inside
the approved Community scope. The user chose to ship 1.4 and handle them separately. They are
written here so nothing in this record claims a parity it does not have.

## Materialization boundary

`integrationEdits` names ten target paths Apply is permitted to differ on, including the split of
`surfaces.tsx` back into the two dashboard component files, the new `/league` route and connected
page, the contract registry merge, and both locale catalogues. An edit Apply needs that is not on
that list is a return to Preview, not a note in a commit message.

No backend enabler is required: `myLeague` and `globalLeaderboard` already carry every field.
