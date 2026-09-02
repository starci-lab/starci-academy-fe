# Visual audit — Subscriptions route

## Owner

- Kind: page
- Source refs: `src/app/[lang]/subscriptions/page.tsx`, `src/components/pages/ProSubscriptionPage`, `src/components/blocks/commerce/ProSubscriptionBlock`
- Canonical entry: `/[lang]/subscriptions`

## Current snapshot

- Status: BLOCKED
- Reviewed at: 2026-09-02T02:43:00+07:00
- Latest-source browser evidence: canonical route renders at compact and 1280×800; benefit/accordion labels remain outside their bounded cards with visible Grammar-owned gaps; the illustration is full-width; accordion hover, keyboard `focus-visible`, and expanded states were exercised; the legacy typo route redirects to the canonical route.
- Mechanical evidence: focused app tests 15/15 PASS; Grammar tests 28/28 PASS; full FE typecheck PASS; focused ESLint PASS.
- Blocker: a fresh isolated blind reviewer and correlated Quality/UAT receipts were not produced in this task, so the route is not declared visual PASS.

## Immutable audit history

- 2026-09-02 — Interaction repair — Added canonical spelling, compatibility redirect, whole-action accordion feedback, persistent expanded state, visible keyboard focus, reduced-motion parity, and route-level responsive evidence. Closure remains BLOCKED pending the canonical blind-review chain.
