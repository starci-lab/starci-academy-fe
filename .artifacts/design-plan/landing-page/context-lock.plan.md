# Context lock — plan (landing page)

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `plan` | Invoked skill `starci-fe-design-plan` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` (`26b9980`) | Root `CLAUDE.md` router |
| Skill | `…\.claude\skills\starci-fe-design-plan\SKILL.md` | Skill discovery |
| Primary target | `D:\Repositories\starci-academy-fe` — role `target`, branch `main`, HEAD `bc5a239` | Request + git |
| Reference | `D:\Repositories\starci-academy` — role `asset-and-anti-pattern`, branch `mtp`, HEAD `9a1934231` | Named by the user as the page to replace, and the source of the one visual to keep |
| Reference | `D:\Repositories\starci-academy-backend` — role `business-truth`, branch `mtp` | `platformStats` and the public course/profile reads |
| Artifact root | `D:\Repositories\starci-academy-fe\.artifacts\design-plan\landing-page` | Phase convention |
| Write boundary | The artifact root only | CONTEXT-LOCK-5 |
| Read-only boundary | All target and reference source, the trust tree | Plan may not write production |
| Runtime | Direction lab from the first free port at `8080` | Phase rule |

## Why the legacy page is a reference but NOT a parity baseline

The user's instruction is to keep one thing from it and replace the rest. So the legacy render is two
different kinds of evidence at once, and the lock records them separately:

- **Asset to keep.** The hero's right column is the block `MicroservicesScene` — an isometric
  "mini-infra" drawn in plain SVG (service → deployment of three pods → a single-node Postgres
  marked as the bottleneck). The 2026-06-26 handoff note in `LandingPage/HERO-CONTINUE.md` records
  that three.js and R3F were tried and removed on the user's own call, so what looks 3D is SVG and
  carries no WebGL dependency.
- **Composition to replace.** Everything below it: `#stats`, `#courses`, `#treasure`, `#founder`,
  `#faq`, plus `LearnLoopScroll`, `KnowledgeGraph` and `TalentMarketplace`. Eight surfaces, several
  arguing the same point.

`parityBaseline` is therefore null and no `parity-first` direction is offered. Offering one would
mean proposing the arrangement the user has already rejected.

## Ambiguity resolution

None outstanding. The target is unambiguous, the asset to keep is named in the legacy source by
file, and the boundary between kept and replaced is the user's own sentence.
