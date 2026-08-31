# Visual audit — CourseMockInterviewSetupPage

## Owner

- Kind: page
- Source refs: `src/components/pages/CourseMockInterviewSetupPage/*`; `src/components/blocks/learn/CourseMockInterviewSetupBlock/*`
- Entry context: `/vi/courses/fullstack-mastery/learn/mock-interview`, authenticated enrolled learner, setup overview state

## Current snapshot

- Status: FAIL
- Score: 8/10
- Round: 7
- Reviewed at: 2026-08-31
- Reason why: Compact setup passed, but the wide composition remains top-heavy and leaves an excessive low-information field below the primary task.
- Covered evidence: `audit-round-7/setup-wide.png`; `audit-round-7/setup-compact.png`
- Source fingerprint: `411fdaaa8371c89d2f480b0071d892d25838a96644462298ace504e647dc6e5c`
- Evidence fingerprint: `setup-wide=87bc3f9b8ab8efb7d82fae0e324b64264caee1fc3b82e659ab772a9453e64fdf; setup-compact=dec1b25ccb381b9bf47d3209f9475667797bb9195eac14d3323bd4111399fa46`
- Finding-batch fingerprint: `round-7/setup-wide-top-heavy-and-lower-dead-field`
- Remaining gaps: Rebalance the wide fold and then capture fresh wide and compact rasters for an independent latest-source review.

## Audit axes

- Business task closure: 9/10
- UX flow and state clarity: 8/10
- Visual hierarchy and composition: 7/10
- Responsive interaction resilience: 8/10
- Consistency and accessibility cues: 8/10

## Immutable audit history

- Round 7 — FAIL — 8/10 — Setup compact passed; setup wide retained a top-heavy composition and excessive lower dead space.

## Owner feedback

The product owner asked for one coherent StarCi direction, using illustration only where it materially supports the page rather than forcing imagery into every state.
