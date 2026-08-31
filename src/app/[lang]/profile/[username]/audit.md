# Visual audit — Profile route and nested layout

## Owner

- Kind: page
- Source refs: src/app/[lang]/profile/[username]/page.tsx; src/app/[lang]/profile/[username]/layout.tsx
- Entry context: authenticated or public Profile overview under the username route

## Current snapshot

- Status: INSUFFICIENT_EVIDENCE
- Score: N/A
- Round: 5
- Reviewed at: 2026-08-31
- Reason why: Fresh direct-owner evidence keeps the Profile Overview below the 9/10 PASS threshold, so this route audit must not overclaim closure while the nested owner remains unresolved.
- Covered evidence: `overview-wide-final.png` sha256:0d71a3d8129d2a27e35aebe6c26be83cef45cda1d189b3ff73eabf6664777340; `overview-compact-final.png` sha256:fb056a1fe0df3b79b040a7fa02bc7be0dea78584e797ba15285fc2eb9bb4bb31
- Evidence packets: round3 sha256:972326be...; postrepair sha256:7945a9cc...; packet sha256:d1b5eb21...; raster sha256:6f086562...
- Source fingerprint: sha256:c3041e0cbf56f6c3d592a4cbfc3170d4c49f5f5798b1b6ef8539c2275acd44ef
- Evidence fingerprint: sha256:0d71a3d8129d2a27e35aebe6c26be83cef45cda1d189b3ff73eabf6664777340; sha256:fb056a1fe0df3b79b040a7fa02bc7be0dea78584e797ba15285fc2eb9bb4bb31
- Finding-batch fingerprint: sha256:da58ad34d00eb7d1ccb953dd078d3d39a99bd1b0072d4396b6469e82a3e9d7d9
- Remaining gaps: direct Profile Overview remains below the PASS threshold; route-level evidence cannot override that nested owner result

## Audit axes

- Business task closure: 2/2 — username route reaches the intended Profile destinations.
- UX flow and state clarity: 2/2 — lifecycle, retry, and tab outcomes are legible.
- Visual hierarchy and composition: 2/2 — identity and page content remain visually owned by Profile.
- Responsive interaction resilience: 2/2 — wide, 390px, and 312px rail states preserve safe bounds.
- Consistency and accessibility cues: 1/2 — accessible tab naming and selected state pass; global shell remains external.

## Immutable audit history

- 2026-08-31 · Round 1 · INSUFFICIENT_EVIDENCE · N/A · Wide and host captures were blank below global chrome; recapture requested without source mutation.

## Owner feedback

- 2026-08-31 · ADOPTED · Business/data/API are already correct; keep this mission UI/UX-only and optimize for fast direct-owner repair.

### Round 3 — 2026-08-31

- Verdict: PASS
- Score: 9/10 (delta: not scored in Round 1)
- Source fingerprint: sha256:d64d633ebf2c7fc9988ce19fa6e59d8f5c72fa00f8141bdaadb5ed61d3dd5f28
- Evidence fingerprint: sha256:a2a2c58e4f22461e11b2d1a7f8f7015fd12dc98d61d6a8da56beb24d6ebed778
- Finding-batch fingerprint: sha256:e3831782b8b30c0b02c9dea225f5b516f366fe85933026fc030f729efb923ef7
- Coverage: wide 1440, compact 390, compact 312 rail; route lifecycle, tabs, retry, share feedback, and handoff continuity.
- Disposition: direct Profile route page passed latest visual closure.

### Round 4 — 2026-08-31

- Verdict: PASS
- Score: 9/10 (delta: 0)
- Source fingerprint: sha256:c3041e0cbf56f6c3d592a4cbfc3170d4c49f5f5798b1b6ef8539c2275acd44ef
- Evidence fingerprint: sha256:60b6554a8434cb060dccba489281a0ec728372c2558de0e8502b24ab72c4f607
- Finding-batch fingerprint: sha256:da58ad34d00eb7d1ccb953dd078d3d39a99bd1b0072d4396b6469e82a3e9d7d9
- Coverage: wide 1440, compact CSS390 qualifier wrap anchored by `Nội dung hoàn thành 0/153 · Thử thách hoàn thành 0/347`, and compact 312 rail; direct selected-tab clipping resolved.
- Axes: 2/2 business task closure; 2/2 UX flow and state clarity; 2/2 visual hierarchy and composition; 2/2 responsive interaction resilience; 1/2 consistency and accessibility cues.
- Disposition: direct Profile route clipping finding resolved; shared AI overlay remains report-only debt.

### Round 5 — 2026-08-31

- Verdict: INSUFFICIENT_EVIDENCE
- Observed score: 8/10 (evidence-limited; not a closure verdict)
- Source fingerprint: sha256:c3041e0cbf56f6c3d592a4cbfc3170d4c49f5f5798b1b6ef8539c2275acd44ef
- Evidence fingerprint: sha256:0d71a3d8129d2a27e35aebe6c26be83cef45cda1d189b3ff73eabf6664777340 (overview-wide-final.png); sha256:fb056a1fe0df3b79b040a7fa02bc7be0dea78584e797ba15285fc2eb9bb4bb31 (overview-compact-final.png)
- Finding-batch fingerprint: sha256:da58ad34d00eb7d1ccb953dd078d3d39a99bd1b0072d4396b6469e82a3e9d7d9
- Coverage: fresh wide and compact Profile Overview rasters; wide direct score 8/10 and compact direct score 10/10 produce an overall below-threshold route result.
- Disposition: retained INSUFFICIENT_EVIDENCE; no PASS issued for the route while the direct nested Overview owner remains below 9/10.
