# Visual audit — ProfileProjectsPage

## Owner

- Kind: page
- Source refs: src/components/pages/ProfileProjectsPage/index.tsx; src/components/pages/ProfileProjectsPage/component.tsx
- Entry context: Profile projects page composition

## Current snapshot

- Status: STALE
- Score: N/A
- Round: 7
- Reviewed at: 2026-08-31
- Reason why: Owner-authorized structural reconstruction and the legacy null-techStack crash repair are present and focused gates pass, but the current source still lacks populated wide/compact scoring rasters; a numeric or typed visual verdict would be dishonest.
- Covered evidence: one rendered direction contract; secondary wide/compact current-source Projects recheck proving the error surface is gone; 7 focused/regression suites / 38 tests PASS; typecheck and targeted ESLint PASS
- Evidence packets: direction C:\Users\Hi\.codex\visualizations\2026\08\31\01a05852-5cc9-7762-a58b-25e33d52705d\profile-evidence-ledger.html sha256:53cd039970d69ad258331739fb4532d8c0d9fa321ee8d856ca0820bf81740d00; secondary recheck packet D:\Repositories\starci-academy-backend\.worktrees\sessions\central-uat-browser\leases\b08a3ee5-d9b2-4c8e-90bb-4a6408b27e9a\evidence\profile-projects-secondary-recheck-2026-08-31T16-11-48-014Z\packet.json sha256:2d78dc111a72094dd2852965c96b0b55c66853b2711d1f6ef23d5e97c53fee39
- Source fingerprint: sha256:013711de589abaef8c5dad3663309d83daa633579721f19f5c17bf9926da8199
- Evidence fingerprint: sha256:53cd039970d69ad258331739fb4532d8c0d9fa321ee8d856ca0820bf81740d00
- Finding-batch fingerprint: sha256:179ec811fc4f4d11e0175398f171caf97f34f2fa9f5fe24e265fe159a07cb4fc
- Remaining gaps: central runtime has no compatible populated account and existing seed capability cannot satisfy the required verified/external projects, differentiated capstones, and earned-achievement tiers; the later shared Hero/Tabs source refinement is also not represented by the secondary recheck

## Audit axes

- Business task closure: N/A
- UX flow and state clarity: N/A
- Visual hierarchy and composition: N/A
- Responsive interaction resilience: N/A
- Consistency and accessibility cues: N/A

## Immutable audit history

- 2026-08-31 · Round 1 · INSUFFICIENT_EVIDENCE · N/A · Empty-state repair is visible, but the complete page lifecycle has not been reviewed.

### Round 3 — 2026-08-31

- Verdict: PASS
- Score: 9/10 (delta: not scored in Round 1)
- Source fingerprint: sha256:d64d633ebf2c7fc9988ce19fa6e59d8f5c72fa00f8141bdaadb5ed61d3dd5f28
- Evidence fingerprint: sha256:a2a2c58e4f22461e11b2d1a7f8f7015fd12dc98d61d6a8da56beb24d6ebed778
- Finding-batch fingerprint: sha256:e3831782b8b30c0b02c9dea225f5b516f366fe85933026fc030f729efb923ef7
- Coverage: wide 1440, compact 390, compact 312 rail; empty/populated/loading/recovery and project activation.
- Disposition: direct Projects page passed latest visual closure.

### Round 5 — 2026-08-31

- Verdict: INSUFFICIENT_EVIDENCE
- Score: N/A
- Source fingerprint: sha256:d187e50fd069d0eb4cf29eb834d5274a5352b1bceb74c3e5a6e67c32c9329f5a
- Evidence fingerprint: sha256:f5dceb76f2d6403f193c21886939fcfc9ac73f17de53885f46b2625f3ee5d75a
- Finding-batch fingerprint: N/A
- Coverage: final frozen source; 6 suites/27 tests, targeted ESLint, and typecheck PASS; wide CSS1600x900 and compact CSS390x843 at DPR 0.800000011920929 failed preflight, no rasters accepted; one Ctrl+0 retry also blocked; leases released.
- Disposition: no fresh PASS/FAIL claimed; await valid DPR preflight and accepted wide/compact rasters.

### Round 6 — 2026-08-31

- Verdict: STALE
- Score: N/A
- Source fingerprint: sha256:5f86e0b8dd591aa8b2eb13a0026584fb1700475198c498e188dd533674327598
- Evidence fingerprint: sha256:53cd039970d69ad258331739fb4532d8c0d9fa321ee8d856ca0820bf81740d00
- Finding-batch fingerprint: sha256:179ec811fc4f4d11e0175398f171caf97f34f2fa9f5fe24e265fe159a07cb4fc
- Coverage: owner-authorized Profile Evidence Ledger direction; direct source mutation; 7 focused/regression suites / 37 projects/activity/hero/tabs/layout tests, typecheck, and targeted ESLint PASS; no current-source browser rasters accepted.
- Disposition: structural findings were constructed in source; visual closure and numeric scoring remain blocked by the runtime-owned populated-fixture capability gap.

### Round 7 — 2026-08-31

- Verdict: STALE
- Score: N/A
- Source fingerprint: sha256:013711de589abaef8c5dad3663309d83daa633579721f19f5c17bf9926da8199
- Evidence fingerprint: sha256:2d78dc111a72094dd2852965c96b0b55c66853b2711d1f6ef23d5e97c53fee39
- Finding-batch fingerprint: sha256:179ec811fc4f4d11e0175398f171caf97f34f2fa9f5fe24e265fe159a07cb4fc
- Coverage: score-ineligible wide/compact Projects recheck on the incomplete candidate; prior `techStack: null` error surface is gone with no console error; 7 focused/regression suites / 38 tests, typecheck, and targeted ESLint PASS.
- Disposition: valid secondary regression evidence only; happy-case project storytelling and final shared Hero/Tabs finish still require populated current-source capture.

## Owner feedback

### Owner counterevidence — 2026-08-31

- Disposition: REJECTED historical 9/10 as noncanonical; reconstruction/product mutation is not authorized until a new Profile round is explicitly approved.
- Evidence: the two supplied screenshots are visually duplicate captures of the same `/vi/profile/cuongnvtse160875/projects` route and cannot certify two pages or independent coverage.
- Visible findings: oversized low-information hero; weak focal hierarchy; large dead zones; empty Featured Projects slab; flat capstone rows; weak typography/material rhythm; sparse composition; no polished project identity.
- Human whole-interface estimate: approximately 5/10, structural FAIL / reconstruct-needed; canonical status remains INSUFFICIENT_EVIDENCE / N/A because frozen final DPR1 capture was blocked at preflight.

### Owner reconstruction directive — 2026-08-31

- Disposition: ADOPTED.
- Feedback: both page compositions and the shared Profile hero/card were explicitly rejected as ugly/crude; all prior 9/10 claims were invalidated; reconstruction, not spacing repair, was required.
- Affected owner/state: ProfileProjectsPage populated/empty/recovery, shared ProfileHero, and ProfileTabs across wide/intermediate/compact.
- Evidence-backed response: source now uses a compact identity mast, responsive route labels, project storytelling cards, and progress-bearing capstones; scoring remains N/A until the runtime owner supplies valid populated happy-case evidence.
