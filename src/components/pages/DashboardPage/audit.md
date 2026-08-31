# Visual audit — DashboardPage

## Owner

- Kind: page
- Source refs: src/components/pages/DashboardPage/component.tsx, src/components/pages/DashboardPage/index.tsx
- Entry context: Authenticated learner enters /[lang]/dashboard with a URL-selected Dashboard destination.

## Current snapshot

- Status: STALE
- Score: N/A
- Round: 9
- Reviewed at: 2026-09-01T05:40:00+07:00
- Reason why: The rail composition changed after the last complete review. Focused wide top/middle/end and constrained-height scroll-shadow checks passed, but they do not recertify the complete Dashboard owner group.
- Covered evidence: targeted rail lifecycle only; dashboard-rail-final-top.png, dashboard-rail-final-end.png, dashboard-quick-actions-scroll-top.png, dashboard-quick-actions-scroll-bottom.png
- Source fingerprint: N/A
- Evidence fingerprint: N/A
- Finding-batch fingerprint: N/A
- Remaining debt: unchanged from the immutable history until a fresh complete Dashboard review supersedes it.
- Remaining gaps: all Dashboard tabs and compact/wide whole-page states must be recaptured before a new typed verdict or numeric score.

- Evidence qualification: The packet and fingerprints are technical rendering/fit/function evidence only; they did not establish visual quality.

## Audit axes

- Business task closure: N/A
- UX flow and state clarity: N/A
- Visual hierarchy and composition: N/A
- Responsive interaction resilience: N/A
- Consistency and accessibility cues: N/A

## Immutable audit history

- Round 1 — FAIL — 4/10 — The compact support rail displaced the current learning task, wide composition underused available space, and Courses recommendations collapsed into a narrow unbounded strip. Source `sha256:f6c6482c5debe5968c2d3f133f0f3433e4e9783b9f52601b91cece6584419109`; evidence `sha256:cb2770db20eb6b70db1f3d0abb5413dca14457ad2eae483fa4730d3bd4ab1f7b`; findings `sha256:9df3ac6803b0cd599f40f9ec40d87d541b9990927798fa9e7dddaf9a3439b896`.
- Round 2 — FAIL — 4/10 (target 9) — Courses lacked visible resume/open and view/enrol closure, quest rows lacked a clear pathway, the compact terminal/support state was not proved, recommendation rows wasted space, the continue-learning empty answer was oversized, price/supporting copy was faint and cramped, and the English recommendation reason plural was wrong. Shared ShellNav, application frame, and AI launcher findings remained outside this owner. Source `sha256:806d258be0c583bc506d4591b69b9767f65c3fb5013aa7d4f58e7d95ca865937`; evidence `sha256:960970ea760bc5424c594ca71960c94e23d9e71cc24f43a1423228c112280173`; findings `sha256:26aea86e8c280d008bb15c867399147a14939a7c8751537599e3807e0051a781`.
- Round 3 — FAIL — 7.4/10 (target 9) — Task closure, compact terminal access, singular copy, and three-width reflow were visibly improved. Remaining direct findings were the empty lower-right cell in the two-column intermediate recommendation grid and low-emphasis recommendation/price microcopy. The apparent medium rail clipping, fixed AI collisions, and icon-only compact navigation were classified as shared regions and left immutable. Source `sha256:bb770dacfe441d839493277c26e36043cf2bbf1d1db4cb5eb56ae842350ad467`; evidence `sha256:1cfaea48306ed8a6eecb1d3bfb18b054e8ca2f6378e9daa8eddfba50821e0ed9`; findings `sha256:8f90ee991d4142e539682b2d2f21c0264dfb970dd6765eca1ceb67fae27990e0`.
- Round 4 — FAIL — 7.4/10 (target 9) — The intermediate odd item stopped leaving a lower-right empty cell, but its full-width surface moved the dead space inside the card and the wide three-column price row stayed cramped. The new DailyQuest Browse action also duplicated the already dominant Continue-learning recovery. Shared assistant and compact navigation findings remained outside this owner. Source `sha256:dbd4e95f8f0fdbf56d449b0576e0e66fcd5e2bbe0d866c8732217922a3e773f0`; evidence `sha256:0919bd4e556e07de14057e3f0a8b1ffd68f06577287c35b1a619036bc218d641`; findings `sha256:7a3293d100ee36f641287cab69d547756280eb5bd81f757a79443dcecf449313`.
- Round 5 — FAIL — 7.8/10 (target 9) — The centered peer-width recommendation and single dominant recovery action cleared the direct Dashboard repair batch. Additive evidence withdrew the apparent incomplete QuickActions and collapsed Streak findings as viewport-boundary artifacts. The sole retained finding is the shared StarCi AI launcher collision at narrower widths. Source `sha256:9fa77bfd68c3befbf053f7f5afc0f3ad50764c611044880f76e6821b8047b94a`; focused evidence `sha256:0b72c879da3197890c984df5ce989dcaeb62f969d4d22a7508d6488f77002109`; additive evidence `sha256:91302bb75713821a39a99f892f8ce509c304046fc3f803731ad8cdc2dbc5a8c2`; findings `sha256:ed452c4d3259ee5a9d32240a3e40c1c46e794dc375e68eb56171201d251b521e`.

- Round 6 — FAIL — 5/10 — Technical rendering/fit/function PASS only: 40 files/295 tests were green and wide 1440x1000 plus compact CSS390 settled captures had aria-busy=0, but the current human /vi/dashboard screenshot establishes visual FAIL/reconstruct-needed: wireframe-like composition; weak hierarchy; identical low-information Continue cards; oversized flat Daily Quest slab; imbalanced whitespace/density; weak visual rhythm/depth; mixed VI/EN copy. The evidence packet and fingerprints are technical evidence and did not establish visual quality. Source `sha256:bff6a214e62469f2866e2629b58bb977d33c4195d31f7fdc6ba0a5322e79b91e`; evidence `sha256:88c59aa0c1b8e30cce45923f66f56f053b9d212c055cbf73d0037c5f8746ec15`; findings `sha256:a13a18594c68d560711b90f4e60a2464cd0a56fc3e9c950424a033d1fa93ede2`.

- Round 7 — FAIL — 5/10 (Overview 5, Explore 6, Courses 6, Community 7) — Axes: Business task closure 1/2; UX flow and state clarity 1/2; Visual hierarchy and composition 1/2; Responsive interaction resilience 1/2; Consistency and accessibility cues 1/2. Blind raster review found Overview's Đã học/Streak card collapsing copy into one-word lines with a purple CTA overlapping content, tiny low-contrast microcopy and heatmap labels, uneven card widths/alignment, weak primary action in Continue empty/zero states, lower dead space, and mixed VI/EN. Explore's filter groups were visually ambiguous, feed actions and row affordance weak, main width underused, lower/right space dead, and English titles appeared inside Vietnamese chrome. Courses orphaned its third recommendation into a lower-right cell, left an empty lower-left cell, showed incomplete recommendation framing/dividers, dense price/discount lines, an overly prominent empty livestream surface without a useful action, and underused width. Community was the cleanest tab but remained sparse with weak row affordance, vulnerable long-name alignment, and large lower whitespace. Across compact tabs, primary content collapsed into a narrow left strip with excessive vertical length/right gutter, undersized type/actions, deferred identity/quick actions, an oversized vertical Explore filter block, dense Courses price lines, and Community long-name wrapping that disrupted XP alignment. The exact handoff Overview viewport cut a live goals card at the bottom; paired full-page evidence proves continuation and this is treated as capture framing, not necessarily a product defect. Shared immutable StarCi AI overlaps compact routed content and remains outside this owner boundary.
- Coverage: four wide states, four compact states, exact Overview wide handoff, price-overlay open/close, page and bounded scroll lifecycle.
- Source `sha256:38c478f1e17d2b4e23068af74fc1cf300410feb940e74dad457428c3b895b0bc`; evidence `sha256:18807ff1fb82f754579031b60ba1fc28b89de981c91932087753e0e1cfc08637`; findings `sha256:f078487a95242c18a5af1f24896c74fa2daa992586f7601d0e60673c0955d7cd`.

- Round 8 — FAIL — 5/10 — The learning-cockpit reconstruction established a dominant Continue surface, contextual rail, joined Courses list, explicit Explore axes, and compact rail flow. Fresh blind pixels still found raw Explore ranking/feed rows, compact Community name fracture, contribution-calendar label collision, text-heavy Courses rows, and repeated shared StarCi AI occlusion. Evidence `sha256:0495129aa85f7d92aeb3e4b6e1a6f4b8e3cc6f4eb46186d92d5e6e4265657195`; findings `sha256:29f775e192bad0049aa4650b889ea104df250002913c445e42aa0f53af203a0e`.
- Round 9 — FAIL — 4.4/10 — The direct repair batch added designed Explore rank rows, compact feed timestamps, stable Community identity/XP columns, a horizontal Daily Quest evidence band, bounded rail surfaces, and compact contribution scrolling. The isolated reviewer still found the wide host composition left-heavy, global Home and local Dashboard states visually competing, and the fixed shared assistant repeatedly occluding routed content; those dominant owners are explicitly excluded from this mutation ceiling. Source `sha256:860625b8c0bfb9c9a7ff19ace55f57ac59be34354598f29447fec9688e73f0b4`; evidence `sha256:53ed07234ec2396435d10805b87e31ccb18c499540a193356b59dc3adf1a6546`; findings `sha256:15e6180edf8c8d888bb6ba39b338833beff6663a65c6a855184dda99ba3f9567`.

## Owner feedback

2026-08-31T10:20:00Z — “Chạy lại đi, sao không được là dừng thế.” — Dashboard mission continuation — ADOPTED: resumed the same logical review with additive evidence and continued all authorized closure work.
