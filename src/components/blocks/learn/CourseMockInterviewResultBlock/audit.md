# Visual audit — Mock interview transcript modal

## Owner

- Kind: modal
- Source refs: `src/components/blocks/learn/CourseMockInterviewResultBlock/component.tsx`; `src/components/blocks/learn/CourseMockInterviewResultBlock/classNames.ts`
- Entry context: Transcript action from a completed mock-interview result, including open, internal scroll, backdrop, close, and focus-return behavior

## Current snapshot

- Status: FAIL
- Score: 4/10
- Round: 8
- Reviewed at: 2026-08-31
- Reason why: Fresh compact captures reproduce a severe cover-modal defect: the backdrop ends before the viewport, the header and close control are offscreen, and reopened content begins mid-transcript.
- Covered evidence: `audit-round-8/transcript-compact-fit.png`; `audit-round-8/transcript-compact-reopen.png`; DOM evidence confirms heading, close control, and all seven questions exist but are not initially visible together with a valid viewport cover
- Source fingerprint: `b4e9a7e3e3e6e77dc889ee130b516295f917261ac9ffcca284af70325a508a79`
- Evidence fingerprint: `fit=942ff9029d77f8d76fb4290c4004bb5e474c8b10670ee608742517bcc8ea3de0; reopen=196513f54df40054c810b0cbd6161012cc81f46244594e8e75abaa72d445c38d`
- Finding-batch fingerprint: `round-8/shared-cover-backdrop-positioning-and-initial-scroll-failure`
- Remaining gaps: The shared ModalBranch cover owner must provide a fixed full-viewport backdrop, a visible header and close affordance, deterministic initial scroll position, Escape dismissal, focus trap, and focus return; then capture compact and wide modal top, middle, and end.

## Audit axes

- Business task closure: N/A
- UX flow and state clarity: N/A
- Visual hierarchy and composition: N/A
- Responsive interaction resilience: N/A
- Consistency and accessibility cues: N/A

## Immutable audit history

- Round 7 — FAIL — feature packet 7.2/10 — Modal header and close control were offscreen, the dialog was clipped, and the backdrop covered only the upper region.
- Round 8 — STALE — N/A — Cover-modal repair landed after the reviewed raster packet.
- Round 8 coordinated capture — FAIL — 4/10 — Viewport-fit tuning did not repair the shared cover backdrop or initial modal positioning; header and dismissal remain visually unavailable.

## Owner feedback

Treat the transcript as a dedicated modal owner within the result feature; keep its correction local to the result block and shared modal API already in use.
