# Context lock — plan

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `plan` | Invoked skill `starci-fe-design-plan` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` (`main`, `26b9980`) | Root `CLAUDE.md` router |
| Skill | `D:\Repositories\starci-academy-backend\.claude\skills\starci-fe-design-plan\SKILL.md` | Skill discovery |
| Primary target | `D:\Repositories\starci-academy-fe` — role `target`, branch `main`, HEAD `8af51ee6cd78ea4a4eed0c4af27e49d77abc28b6`, worktree = git root, remote `https://github.com/starci-lab/starci-academy-fe.git` | Request "new starci-fe" + git |
| Reference | `D:\Repositories\starci-academy` — role `parity-baseline`, branch `mtp`, HEAD `9a193423128efa1dc83f23ab0f79fb4ae66db847` | User screenshots of `academy.starci.org/vi/dashboard?tab=community` and `/vi/league` |
| Reference | `D:\Repositories\starci-academy-backend` — role `business-truth`, branch `mtp`, HEAD `06d06496e79efb5938f16faeb12ca49ecd15ad35` | `myLeague` / `globalLeaderboard` capability |
| Artifact root | `D:\Repositories\starci-academy-fe\.artifacts\design-plan\community-league-legacy-parity` | Phase convention + sibling task layout |
| Write boundary | The artifact root only | CONTEXT-LOCK-5 (Plan is artifact-only) |
| Read-only boundary | All target/reference source trees and the trust tree | Plan may not write production |
| Runtime | Direction lab served from first free port at `8080`. FE `:3000` and BE `:3001` are pre-existing session runtimes and are not owned by this phase. | Phase rule |
| Context record | This file plus `context-lock.plan.json`; no inherited record (new task) | Artifact convention |

## Ambiguity resolution

Five repositories could plausibly have been the frontend target. `starci-academy-fe` was locked
because the user named "new starci-fe", it carries the newest commit (2026-08-12) and it is the repo
the running dev server was started from. `starci-academy` is locked as a read-only parity baseline
rather than a target: it is the source of the production render the user asked to match.

No ambiguity remains; no value was guessed.
