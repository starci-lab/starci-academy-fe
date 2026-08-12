# Apply report — public profile cluster

Applied: 2026-08-12  
Approved case: `case-parity-a`  
Target: `D:\Repositories\starci-academy-fe`

## Delivered

- Persistent public-profile layout, canonical `/profile` redirect, contextual identity CTA, share,
  route-derived and visibility-gated tabs.
- Overview, Projects, Challenges, Skills, Activity and public-CV routes.
- Capstone roadmap, challenge-course/submission proof and coding-solution detail routes.
- Public-profile GraphQL documents, typed payloads and independently cached SWR evidence owners.
- English and Vietnamese profile catalogues, narrow-screen icon tabs and honest loading, empty,
  failed, locked and not-found branches.

## Verification

- Focused ESLint over the complete profile route/component/data boundary: pass.
- Focused profile evidence tests: 4/4 pass.
- Next.js production build: pass; all 14 public profile routes compiled.
- Browser: settled not-found verified at desktop and 390 × 844; tabs/body suppressed, no horizontal
  overflow, no console error. Loading retained geometry and did not flash not-found.

## Repository baseline outside this batch

- Standalone `tsc --noEmit` reports existing contract-typing failures across Dashboard/Auth and
  their type tests; no diagnostic remains under a profile path.
- Full Vitest reports 18 failures in Dashboard/Auth/hooks, including an existing missing
  `ResizeObserver` test shim and changed dashboard row/barrel expectations. The focused profile
  suite passes.
- ESLint rule tests pass 50/51; the remaining failure is the rule fixture for
  `no-literal-structural-class`, outside profile production source.

## Residual parity risk

No known ready public username was available in the local backend during apply. Source-defined
ready/owner/locked branches and the approved review lab bind those shapes; an authenticated seeded
profile remains the final pixel-comparison input, not a reason to invent frontend fixture data.

## Ready-profile parity correction

The seeded ready profile exposed an ownership drift that the original not-found-only browser pass
could not reveal: profile tabs had been attached to `ShellNav` and the approved
`profile-tabs-over-body` contract had been removed. The correction restores the frozen owner tree,
keeps `ProfileHero` frameless per the explicit visual review, leaves global navbar state unchanged,
uses the legacy 80rem/24px measure, and adds a layout test that locks route chrome above identity
and evidence while suppressing it for locked visitors.

## Multi-agent parity completion

The cluster was re-applied in three bounded lanes (Overview, Projects/Challenges, and
Skills/Activity/CV), then integrated by one coordinator owning shared contracts, layout and gates.
The generic `ProfileEvidencePage`, `ProfileEvidenceSection`, and `ProfileDetailEvidence`
abstractions were removed because they collapsed distinct legacy anatomies into one row list.
`ProfileHero` is frameless per the explicit visual correction. The coding-proof lab sample was not
copied because executable legacy and the backend expose statement, tags and accepted-submission
evidence but no source code.

Final gates: focused ESLint pass; full TypeScript pass; 19/19 profile tests; 51/51 architecture
rules; production build pass with all 14 public-profile routes. Browser checks verified Overview,
Projects, Challenges, Skills, Activity and CV states against the local seeded profile.
