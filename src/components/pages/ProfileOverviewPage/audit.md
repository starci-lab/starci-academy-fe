# Visual audit — ProfileOverviewPage

## Owner

- Kind: page
- Source refs: src/components/pages/ProfileOverviewPage/index.tsx; src/components/pages/ProfileOverviewPage/component.tsx
- Entry context: Profile overview tab

## Current snapshot

- Status: INSUFFICIENT_EVIDENCE
- Score: N/A
- Round: 5
- Reviewed at: 2026-08-31
- Reason why: Fresh visual capture was blocked at DPR preflight for wide CSS1600x900 and compact CSS390x843, so no current raster can support a numeric or typed visual verdict.
- Covered evidence: final frozen source and gate receipt only; no rasters accepted; single Ctrl+0 retry also blocked and leases released
- Evidence packets: packet D:\Repositories\starci-academy-backend\.worktrees\sessions\central-uat-browser\leases\d5c38e3a-5386-4ec1-8a97-7cb2e1ee807f\evidence\profile-final-evidence-frozen-2026-08-31T14-23-48-492Z\packet.json sha256:f5dceb76f2d6403f193c21886939fcfc9ac73f17de53885f46b2625f3ee5d75a; no rasters accepted
- Source fingerprint: sha256:d187e50fd069d0eb4cf29eb834d5274a5352b1bceb74c3e5a6e67c32c9329f5a
- Evidence fingerprint: sha256:f5dceb76f2d6403f193c21886939fcfc9ac73f17de53885f46b2625f3ee5d75a
- Finding-batch fingerprint: N/A
- Remaining gaps: fresh wide CSS1600x900 and compact CSS390x843 rasters at DPR 0.800000011920929; preflight remains blocked

## Audit axes

- Business task closure: N/A
- UX flow and state clarity: N/A
- Visual hierarchy and composition: N/A
- Responsive interaction resilience: N/A
- Consistency and accessibility cues: N/A

## Immutable audit history

- 2026-08-31 · Round 1 · INSUFFICIENT_EVIDENCE · N/A · Compact evidence improved while wide evidence failed readiness; no numeric score issued.

### Round 3 — 2026-08-31

- Verdict: PASS
- Score: 9/10 (delta: not scored in Round 1)
- Source fingerprint: sha256:d64d633ebf2c7fc9988ce19fa6e59d8f5c72fa00f8141bdaadb5ed61d3dd5f28
- Evidence fingerprint: sha256:a2a2c58e4f22461e11b2d1a7f8f7015fd12dc98d61d6a8da56beb24d6ebed778
- Finding-batch fingerprint: sha256:e3831782b8b30c0b02c9dea225f5b516f366fe85933026fc030f729efb923ef7
- Coverage: wide 1440, compact 390, compact 312 rail; loading-to-ready, retry, tab navigation, share feedback, and continuation.
- Disposition: direct Profile overview visual contract passed; no remaining direct-owner finding.

### Round 4 — 2026-08-31

- Verdict: PASS
- Score: 9/10 (delta: 0)
- Source fingerprint: sha256:c3041e0cbf56f6c3d592a4cbfc3170d4c49f5f5798b1b6ef8539c2275acd44ef
- Evidence fingerprint: sha256:60b6554a8434cb060dccba489281a0ec728372c2558de0e8502b24ab72c4f607
- Finding-batch fingerprint: sha256:da58ad34d00eb7d1ccb953dd078d3d39a99bd1b0072d4396b6469e82a3e9d7d9
- Coverage: wide 1440, compact CSS390 qualifier wrap anchored by `Nội dung hoàn thành 0/153 · Thử thách hoàn thành 0/347`, and compact 312 rail; direct selected-tab clipping resolved.
- Axes: 2/2 business task closure; 2/2 UX flow and state clarity; 2/2 visual hierarchy and composition; 2/2 responsive interaction resilience; 1/2 consistency and accessibility cues.
- Disposition: direct Profile overview clipping finding resolved; shared AI overlay remains report-only debt.

### Round 5 — 2026-08-31

- Verdict: INSUFFICIENT_EVIDENCE
- Score: N/A
- Source fingerprint: sha256:d187e50fd069d0eb4cf29eb834d5274a5352b1bceb74c3e5a6e67c32c9329f5a
- Evidence fingerprint: sha256:f5dceb76f2d6403f193c21886939fcfc9ac73f17de53885f46b2625f3ee5d75a
- Finding-batch fingerprint: sha256:da58ad34d00eb7d1ccb953dd078d3d39a99bd1b0072d4396b6469e82a3e9d7d9
- Coverage: final frozen source; 6 suites/27 tests, targeted ESLint, and typecheck PASS; wide CSS1600x900 and compact CSS390x843 at DPR 0.800000011920929 failed preflight, no rasters accepted; one Ctrl+0 retry also blocked; leases released.
- Disposition: no fresh PASS/FAIL claimed; await valid DPR preflight and accepted wide/compact rasters.

## Owner feedback

No manual owner feedback recorded yet.
