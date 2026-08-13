# Context lock — preview

Inherited from `context-lock.plan.json`. Redetected at the start of the Preview run.

| Field | Inherited | Redetected | Drift |
|---|---|---|---|
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | same | none |
| Target | `starci-academy-fe`, `main`, `8af51ee` | same | none |
| Parity baseline | `starci-academy`, `mtp`, `9a19342` | same | none |
| Business truth | `starci-academy-backend`, `mtp`, `06d0649` | same | none |
| Artifact root | `.artifacts\design-plan\community-league-legacy-parity` | same | none |
| Case / direction | `case-community-league` / `direction-legacy-parity` | same | none |

No drift. Nothing was relocked.

## Boundaries

Write boundary is the artifact root only. Target source, both reference repositories and the trust
tree stayed read-only for the whole phase; the candidate imports locked target components through a
read-only `@` alias rather than copying or editing them.

## Runtime ownership

| Port | Process | Owner |
|---|---|---|
| 8084 | candidate (`pid 39276`) | this Preview run |
| 8082 | Plan direction lab (`pid 48888`) | preceding Plan run |
| 3000 | `starci-fe` dev server | current session, started before this phase |
| 3001 | backend `nest core` | current session, started before this phase |

The two application servers are not owned by this phase and were neither restarted nor reconfigured
by it.
