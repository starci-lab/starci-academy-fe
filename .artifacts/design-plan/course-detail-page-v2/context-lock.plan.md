# Context lock — plan — course-detail-page-v2

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `plan` (re-plan) | Invoked `starci-fe-design-plan` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | Root `CLAUDE.md` router |
| Primary target | `starci-academy-fe` — `D:\Repositories\starci-academy-fe` | Request names this repository |
| Git identity | `main` / `7aa4ba0` / `starci-lab/starci-academy-fe` | git |
| Reference | `starci-academy` `mtp`/`9a1934231` — parity baseline, read-only | production render |
| Reference | `starci-academy-backend` `mtp`/`06d06496` — business truth, read-only | `course` query |
| Reference | `.artifacts\design-plan\course-detail-page` — superseded run, read-only | its feasibility map predates `ContractHostTag` |
| Artifact root | `.artifacts\design-plan\course-detail-page-v2` | new root; the prior record stays intact as evidence |
| Write boundary | That artifact root only | CONTEXT-LOCK-5 |
| Runtime | Direction lab, first free port from `8080` (`8080`–`8093` occupied) | port scan |

## Why a re-plan rather than a Preview revision

The prior run selected `direction-parity-first` and built a candidate that builds and lints clean.
It is not wrong; it is **out of date in a way a revision cannot express**, because the rule set it
was mapped against has changed underneath it:

1. `ContractHostTag` did not exist. Every structural node was a `div`, and the prior directions
   could only differ in geometry. A contract can now open `main`, `nav`, `section`, `aside`, `ul`,
   `ol` or `form`, which makes the page's SEMANTICS a product decision the old lab could not show.
2. `details` is deliberately not in that set, so the prior run's open question — whether the
   curriculum discloses — now has a price attached: disclosure needs a new leaf, flat does not.
3. The prior Preview's `Main` branch was deleted from the target; the landmark is named by the
   registry entry. A candidate rebuilt on the old shape would be rebuilt on something gone.

## What did NOT change, verified rather than assumed

- The sticky family in `LayoutClassName` is still `first-child` only, so a right-hand sticky rail
  still widens the union by five mirrored members.
- There is still no accordion branch.
- `src/resources` does not exist here; copy resolves through `src/messages/{en,vi}.json`, so
  `no-second-language-in-source` is already satisfied by the repository's existing habit.
- The target still has no `/courses/[displayId]` route and no single-course document.
