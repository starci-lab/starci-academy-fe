# Visual audit — CourseCommunityPostRoute

## Owner

- Kind: page
- Source refs: src/app/[lang]/courses/[displayId]/learn/community/posts/[postId]/page.tsx
- Entry context: /{lang}/courses/{displayId}/learn/community/posts/{postId} post-detail entry inside the course learning context

## Current snapshot

- Status: INSUFFICIENT_EVIDENCE
- Score: N/A
- Round: 0
- Reviewed at: 2026-08-31T06:00:20.000Z
- Reason why: API behavior passed, but Browser policy blocked latest-source post-detail capture before any raster review.
- Covered evidence: round-05 API contract PASS and Browser preflight rejection; no current-source detail raster exists
- Source fingerprint: sha256:62a13aa9e5c295b40f5bdd582dbbd5b92897fc9740fe5cde70c552f5c4b7fb16
- Evidence fingerprint: sha256:69a67fdd10ad00772da073aafa80e68f9938d319a5aafbdcb76742542ac56371
- Finding-batch fingerprint: sha256:c667b108699a0d02e80ffaf6bf8d70dc52104e39d189318cffcfe84cd5670a10
- Remaining gaps: detail loading/error/recovery, comment/reply, edit/react/delete, return/resume/exit, responsive, scroll/zoom/focus, and exact handoff-host evidence

## Audit axes

- Business task closure: N/A
- UX flow and state clarity: N/A
- Visual hierarchy and composition: N/A
- Responsive interaction resilience: N/A
- Consistency and accessibility cues: N/A

## Immutable audit history

No completed owner-specific review rounds yet. The pre-v7.2 branch ledger remains immutable at `D:/Repositories/starci-academy-backend/.worktrees/sessions/community-audit-20260831-095604-8bda1249/audit-score-history.json` and is not promoted into an owner verdict because its visual packet is incomplete for this owner.

## Owner feedback

- 2026-08-31 — “Audit toàn bộ nhánh Community: post/detail, bình luận/trả lời, tương tác và recovery có thật.” Affected owner/state: complete post-detail branch. Disposition: ADOPTED — these states and interactions are mandatory owner evidence.
- 2026-08-31 — “OK ARCHITECTURE community-scope-discriminator.” Affected owner/state: detail data scope. Disposition: ADOPTED — the route remains qualified by its parent course.
