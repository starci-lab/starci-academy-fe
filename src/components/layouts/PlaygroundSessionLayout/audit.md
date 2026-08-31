# Visual audit — PlaygroundSessionLayout

## Owner

- Kind: layout
- Source refs: src/components/layouts/PlaygroundSessionLayout/component.tsx, src/components/layouts/PlaygroundSessionLayout/index.tsx, src/app/[lang]/courses/[displayId]/learn/playground/[slug]/layout.tsx
- Entry context: nested layout for /[lang]/courses/[displayId]/learn/playground/[slug] and its session child

## Current snapshot

- Status: STALE
- Score: N/A
- Round: 1
- Reviewed at: 2026-08-31T03:39:26.5673250Z
- Reason why: Round 01 showed that nested pending and failed session ownership did not reliably preserve coherent setup/session recovery; the layout changed afterward and has not received a complete latest-source blind review.
- Covered evidence: round-01 pending, failed, setup, and deep-link recovery rasters in host context; round-02 capture exists but is not yet a completed visual review
- Source fingerprint: be87af21f5f2c9ae7bf2f67ad753afa618cc697bb2dfe5649aaf8a0cc55d8023
- Evidence fingerprint: 9976336953351ce3f1dc81d5ab62ab679c8b7a371d9719d2c446acbf50f99964
- Finding-batch fingerprint: bc7c4bd79940197957c3e8ccee23560874e43fe23fdbcd020ff57b3ce7a44477
- Remaining gaps: fresh latest-source blind review for layout pending, ready, failed/retry, setup-to-session transition, direct deep-link guard, compact/wide, keyboard focus, and exact handoff state

## Audit axes

- Business task closure: N/A
- UX flow and state clarity: N/A
- Visual hierarchy and composition: N/A
- Responsive interaction resilience: N/A
- Consistency and accessibility cues: N/A

## Immutable audit history

### Round 1 — 2026-08-31T03:39:26.5673250Z

- Typed verdict: FAIL (operator outcome: repair)
- Score: 3/10
- Delta: N/A
- Reason why: The nested layout did not provide a complete direct-entry recovery contract and allowed pending/failed lifecycle ownership to present ambiguous or incomplete next actions.
- Axis evidence: Business task closure 1/2; UX flow and state clarity 0/2; Visual hierarchy and composition 1/2; Responsive interaction resilience 0/2; Consistency and accessibility cues 1/2.
- Coverage: nested setup/session host context, pending and failed creation, direct invalid deep link, compact and wide; focus and transition-restoration phases were missing.
- Source fingerprint: be87af21f5f2c9ae7bf2f67ad753afa618cc697bb2dfe5649aaf8a0cc55d8023
- Evidence fingerprint: 9976336953351ce3f1dc81d5ab62ab679c8b7a371d9719d2c446acbf50f99964
- Finding-batch fingerprint: bc7c4bd79940197957c3e8ccee23560874e43fe23fdbcd020ff57b3ce7a44477
- Finding disposition: Preserve route-local ownership while rebuilding pending/failed/direct-entry recovery and re-reviewing fresh pixels.

## Owner feedback

- 2026-08-31T12:54:33.2351934+07:00 — Feedback: Page-local and route-nested Playground layouts are mutable; LearnShellLayout and all higher/global owners remain excluded. Affected owner/state: PlaygroundSessionLayout across setup and session children. Disposition: ADOPTED — this is the exact authorized nested-layout ceiling and does not widen into ancestor owners.
