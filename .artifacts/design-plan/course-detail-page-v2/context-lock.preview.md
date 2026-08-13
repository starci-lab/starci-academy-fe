# Context Lock — Preview · course-detail-page-v2

| Field | Value |
|---|---|
| Phase | `preview` (inherits `context-lock.plan.json`) |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` |
| Design target | `starci-academy-fe` @ `main` `7aa4ba0` — **write: artifact only** |
| Parity baseline | `starci-academy` @ `mtp` `9a1934231` — read-only |
| Business truth | `starci-academy-backend` @ `mtp` `06d06496` — read-only |
| Superseded run | `.artifacts/design-plan/course-detail-page` — read-only |
| Artifact root | `.artifacts/design-plan/course-detail-page-v2` |
| Case | `case-course-detail-v2` |
| Direction | `direction-parity-semantic` — selected explicitly ("A") |
| Revision | `1.0` — **not approved** |

## Drift since the Plan lock

Two entries in the Plan lock are no longer accurate. Neither invalidates the selection; both are
recorded here rather than fixed silently.

**`ContractHostTag` is now `ContractHost`, with eleven members, including `li`.** The Plan lock
recorded eight and the name the repository had grown locally. Writing these entries found that the
union admitted `ul` and `ol` but not `li` — so a list row could only be a `div`, which is invalid
HTML and silent: a `<ul>` whose children are not `<li>` stops being announced as a list and is read
as loose text. The two list hosts could not be used for the thing they are named after. That was
fixed at the canon template and then in the repository registry, before this candidate was written.
It enlarges what the direction can express; the direction was selected on the promise that regions
would name themselves, and this is that promise becoming available.

**The class proposal is twelve members, not five.** Measured with a bracket-aware scan of the
entries: 51 distinct classes, twelve of them not yet in `LayoutClassName` — the five sticky
`last-child` members for the right-hand rail, two `last-child` grow members for the promise row,
three for the pinned bar, and `pt-6` / `pb-6`. An earlier count said three because the regex stopped
at the `]` inside `md:[&>*:last-child]:sticky`; `pt-6` and `pb-6` were added during revision 1.0
after the rendered mobile state showed the pinned bar lifting 24px off the bottom edge at the end of
the scroll. Every one of the twelve mirrors a member already present for the opposite child or the
opposite edge.

## Boundary

Preview writes only inside the artifact root. `src/`, `plugins/eslint-canon`, the superseded run and
both reference repositories are read-only. The candidate imports locked target source; it does not
edit it.
