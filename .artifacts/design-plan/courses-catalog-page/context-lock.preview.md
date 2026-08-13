# Context lock — preview — courses-catalog-page

Inherits `context-lock.plan.json` and `plan-record.json` from the same artifact root.
Case `case-courses-catalog`, selected direction `direction-enrollment-split`.

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `preview` | Invoked `starci-fe-design-preview` with argument `B` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | Inherited, reconfirmed |
| Skill | `starci-fe-design-preview` — `…\.claude\skills\starci-fe-design-preview\SKILL.md` | Skill discovery |
| Primary target | `starci-academy-fe` — design target — `D:\Repositories\starci-academy-fe` | Inherited |
| Git identity | `main` / `8af51ee` / `starci-lab/starci-academy-fe` | `git rev-parse` at redetection |
| Reference | `starci-academy` `mtp` / `9a1934231` — parity baseline | Inherited |
| Reference | `starci-academy-backend` `mtp` / `06d06496` — business truth | Inherited |
| Artifact root | `D:\Repositories\starci-academy-fe\.artifacts\design-plan\courses-catalog-page` | Inherited |
| Candidate root | `…\courses-catalog-page\candidate` | Preview convention |
| Write boundary | The artifact root only | Preview writes no production or trust source |
| Read-only boundary | `starci-academy-fe\src`, `starci-academy`, `starci-academy-backend`, the trust tree | Preview policy |
| Runtime | Next 16.1.6 / React 19.2.3 / Tailwind v4 / HeroUI 3.2.1, resolved from the target's `node_modules` | `package.json` of the target |
| Context record | This file and `context-lock.preview.json`, inheriting `context-lock.plan.json` | Artifact convention |

## Drift

None. Trust root, skill lineage, every repository role, absolute root, branch, worktree, HEAD,
remote, artifact root and both boundaries match the Plan record exactly at redetection.

The Plan direction lab is still listening on `127.0.0.1:8083` under pid `47184`. That port belongs
to the Plan phase and is not reused here; the Preview lab takes its own free port.

## The one deliberate runtime difference

Production wraps its Next config in the next-intl plugin so `src/i18n/request.ts` resolves a locale
per request. The candidate has no request pipeline, so it pins the fixture locale `vi` and imports
the target's real `src/messages/vi.json`. Product copy is therefore the product's own; only the
locale negotiation is absent. Every rendered state declares `locale: vi` rather than claiming locale
coverage the candidate does not have.

The candidate also sets `output: "export"`, because the review lab is a static server that embeds
each state through a plain `candidateUrl`. Scenarios are driven by client state over fixtures, so
nothing in this direction needs a request pipeline to be judged.
