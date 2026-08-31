# Visual audit — Dashboard route family

## Owner

- Kind: page
- Source refs: src/app/[lang]/dashboard/page.tsx, src/app/[lang]/dashboard/layout.tsx
- Entry context: Localized authenticated Dashboard route mounted beneath ShellNav and its single route-owned main landmark.

## Current snapshot

- Status: STALE
- Score: N/A
- Round: 11
- Reviewed at: 2026-09-01T05:40:00+07:00
- Reason why: The nested Dashboard layout and rail source changed after Round 11. Targeted rail geometry and scroll lifecycle are green, but the prior whole-route 9.3 evidence is no longer current-source proof.
- Covered evidence: targeted rail lifecycle only; dashboard-rail-final-top.png, dashboard-rail-final-end.png, dashboard-quick-actions-scroll-top.png, dashboard-quick-actions-scroll-bottom.png
- Source fingerprint: N/A
- Evidence fingerprint: N/A
- Finding-batch fingerprint: N/A
- Current shared-owner aggregate: sha256:0221bced928cc01f930a4067f7dcc09403dbafadf6c299eafbd42803009edf3b
- Remaining debt: minor intentional long-name truncation and occasional dense small text; neither blocks task completion or responsive use.
- Remaining gaps: fresh whole-route coverage for all tabs and required compact/wide states before any new PASS or 9+ claim.

- Evidence qualification: Fresh normalized CSS-pixel rasters establish visual quality; focused tests, shared-consumer tests, typecheck, and lint establish implementation fitness.

## Audit axes

- Business task closure: N/A
- UX flow and state clarity: N/A
- Visual hierarchy and composition: N/A
- Responsive interaction resilience: N/A
- Consistency and accessibility cues: N/A

## Immutable audit history

- Round 1 — FAIL — 4/10 — The route's Dashboard surface exposed direct composition failures while shared ShellNav active-state and compact-label findings remained outside this owner ceiling. Source `sha256:f6c6482c5debe5968c2d3f133f0f3433e4e9783b9f52601b91cece6584419109`; evidence `sha256:cb2770db20eb6b70db1f3d0abb5413dca14457ad2eae483fa4730d3bd4ab1f7b`; findings `sha256:9df3ac6803b0cd599f40f9ec40d87d541b9990927798fa9e7dddaf9a3439b896`.
- Round 2 — FAIL — 4/10 (target 9) — The direct Dashboard route lacked visible learning/course task closure, compact terminal/support proof, dense recommendation composition, and strong price/supporting hierarchy; shared two-tier navigation, page-frame width, compact nav labels, and AI launcher overlap remain outside the route owner ceiling. Source `sha256:806d258be0c583bc506d4591b69b9767f65c3fb5013aa7d4f58e7d95ca865937`; evidence `sha256:960970ea760bc5424c594ca71960c94e23d9e71cc24f43a1423228c112280173`; findings `sha256:26aea86e8c280d008bb15c867399147a14939a7c8751537599e3807e0051a781`.
- Round 3 — FAIL — 7.4/10 (target 9) — The route demonstrated visible Dashboard task closure, one terminal compact rail after primary, correct singular copy, and stable three-width reflow. The direct remaining batch was the intermediate odd-grid hole plus recommendation microcopy emphasis; shared ShellNav and fixed assistant collisions remain outside the route owner ceiling. Source `sha256:bb770dacfe441d839493277c26e36043cf2bbf1d1db4cb5eb56ae842350ad467`; evidence `sha256:1cfaea48306ed8a6eecb1d3bfb18b054e8ca2f6378e9daa8eddfba50821e0ed9`; findings `sha256:8f90ee991d4142e539682b2d2f21c0264dfb970dd6765eca1ceb67fae27990e0`.
- Round 4 — FAIL — 7.4/10 (target 9) — The route's odd recommendation no longer left an empty grid cell but still carried full-row internal dead space, its wide price row stayed cramped, and the quest duplicated the Continue-learning recovery CTA. Shared fixed assistant and icon-only compact navigation remained immutable. Source `sha256:dbd4e95f8f0fdbf56d449b0576e0e66fcd5e2bbe0d866c8732217922a3e773f0`; evidence `sha256:0919bd4e556e07de14057e3f0a8b1ffd68f06577287c35b1a619036bc218d641`; findings `sha256:7a3293d100ee36f641287cab69d547756280eb5bd81f757a79443dcecf449313`.
- Round 5 — FAIL — 7.8/10 (target 9) — The route-owned Dashboard repair batch is clear after centering the final recommendation at peer width and removing the duplicate quest recovery action. Additive evidence withdrew incomplete QuickActions and collapsed Streak findings as capture artifacts. The sole retained finding is the shared StarCi AI launcher collision at narrower widths. Source `sha256:9fa77bfd68c3befbf053f7f5afc0f3ad50764c611044880f76e6821b8047b94a`; focused evidence `sha256:0b72c879da3197890c984df5ce989dcaeb62f969d4d22a7508d6488f77002109`; additive evidence `sha256:91302bb75713821a39a99f892f8ce509c304046fc3f803731ad8cdc2dbc5a8c2`; findings `sha256:ed452c4d3259ee5a9d32240a3e40c1c46e794dc375e68eb56171201d251b521e`.

- Round 6 — FAIL — 5/10 — Technical rendering/fit/function PASS only: 40 files/295 tests were green and wide 1440x1000 plus compact CSS390 settled captures had aria-busy=0, but the current human /vi/dashboard screenshot establishes visual FAIL/reconstruct-needed: wireframe-like composition; weak hierarchy; identical low-information Continue cards; oversized flat Daily Quest slab; imbalanced whitespace/density; weak visual rhythm/depth; mixed VI/EN copy. The evidence packet and fingerprints are technical evidence and did not establish visual quality. Source `sha256:bff6a214e62469f2866e2629b58bb977d33c4195d31f7fdc6ba0a5322e79b91e`; evidence `sha256:88c59aa0c1b8e30cce45923f66f56f053b9d212c055cbf73d0037c5f8746ec15`; findings `sha256:a13a18594c68d560711b90f4e60a2464cd0a56fc3e9c950424a033d1fa93ede2`.

- Round 7 — FAIL — 5/10 (Overview 5, Explore 6, Courses 6, Community 7) — Axes: Business task closure 1/2; UX flow and state clarity 1/2; Visual hierarchy and composition 1/2; Responsive interaction resilience 1/2; Consistency and accessibility cues 1/2. Blind raster review found Overview's Đã học/Streak card collapsing copy into one-word lines with a purple CTA overlapping content, tiny low-contrast microcopy and heatmap labels, uneven card widths/alignment, weak primary action in Continue empty/zero states, lower dead space, and mixed VI/EN. Explore's filter groups were visually ambiguous, feed actions and row affordance weak, main width underused, lower/right space dead, and English titles appeared inside Vietnamese chrome. Courses orphaned its third recommendation into a lower-right cell, left an empty lower-left cell, showed incomplete recommendation framing/dividers, dense price/discount lines, an overly prominent empty livestream surface without a useful action, and underused width. Community was the cleanest tab but remained sparse with weak row affordance, vulnerable long-name alignment, and large lower whitespace. Across compact tabs, primary content collapsed into a narrow left strip with excessive vertical length/right gutter, undersized type/actions, deferred identity/quick actions, an oversized vertical Explore filter block, dense Courses price lines, and Community long-name wrapping that disrupted XP alignment. The exact handoff Overview viewport cut a live goals card at the bottom; paired full-page evidence proves continuation and this is treated as capture framing, not necessarily a product defect. Shared immutable StarCi AI overlaps compact routed content and remains outside this owner boundary.
- Coverage: four wide states, four compact states, exact Overview wide handoff, price-overlay open/close, page and bounded scroll lifecycle.
- Source `sha256:38c478f1e17d2b4e23068af74fc1cf300410feb940e74dad457428c3b895b0bc`; evidence `sha256:18807ff1fb82f754579031b60ba1fc28b89de981c91932087753e0e1cfc08637`; findings `sha256:f078487a95242c18a5af1f24896c74fa2daa992586f7601d0e60673c0955d7cd`.

- Round 8 — FAIL — 5/10 — The learning-cockpit reconstruction established a dominant Continue surface, contextual rail, joined Courses list, explicit Explore axes, and compact rail flow. Fresh blind pixels still found raw Explore ranking/feed rows, compact Community name fracture, contribution-calendar label collision, text-heavy Courses rows, and repeated shared StarCi AI occlusion. Evidence `sha256:0495129aa85f7d92aeb3e4b6e1a6f4b8e3cc6f4eb46186d92d5e6e4265657195`; findings `sha256:29f775e192bad0049aa4650b889ea104df250002913c445e42aa0f53af203a0e`.
- Round 9 — FAIL — 4.4/10 — The direct repair batch added designed Explore rank rows, compact feed timestamps, stable Community identity/XP columns, a horizontal Daily Quest evidence band, bounded rail surfaces, and compact contribution scrolling. The isolated reviewer still found the wide host composition left-heavy, global Home and local Dashboard states visually competing, and the fixed shared assistant repeatedly occluding routed content; those dominant owners are explicitly excluded from this mutation ceiling. Source `sha256:860625b8c0bfb9c9a7ff19ace55f57ac59be34354598f29447fec9688e73f0b4`; evidence `sha256:53ed07234ec2396435d10805b87e31ccb18c499540a193356b59dc3adf1a6546`; findings `sha256:15e6180edf8c8d888bb6ba39b338833beff6663a65c6a855184dda99ba3f9567`.
- Round 10 — PASS — 9.2/10 — Authorized shared-shell reconstruction removed the dual-active state, expanded the Dashboard canvas, placed StarCi AI in the header clearance, and made its compact drawer usable. The final repair made the contribution year fluid, preserved compact leaderboard identity/XP alignment, improved muted-copy contrast, and removed the Community-only shortcut rail. Fresh normalized wide/compact rasters plus lifecycle and drawer states showed clean reflow with no critical overlap or clipping. Source `sha256:d82a70fa2c4e48b05ee588074d3db3acb34831dc74c8b6327be58e2c766efb57`; evidence `sha256:a482cfb220e43bb5b37f4e952cbf3682ed1ce0cc1cb4c7b24311440288406fb2`; findings `sha256:ebbd23c4440e25a46d031d3866307a94efe298b5eabfa7442021b42cd534ccc0`.
- Shared checkpoint supersession — STALE BINDING, not a visual regression — Profile-only AI header clearance advanced `GlobalAiChatLayout` and `StarCiAiFab` to shared aggregate `sha256:835a0d782fb42564f6d9de0123e4eb6a8987d521434b2b97935cb8ca9051532a`. Dashboard selectors and rendered clearance remain unchanged; affected Dashboard/Profile consumers passed 48 files / 364 tests. The Round 10 pixels remain immutable historical PASS evidence but are not current-source evidence.
- Round 11 — PASS — 9.3/10 — The final shared source hides the floating AI trigger only on compact Profile routes while preserving Dashboard clearance and wide Profile access. Dashboard was recaptured after that source change: four wide tabs, four compact tabs, compact lifecycle, and AI drawer all passed a fresh isolated whole-interface review. Source `sha256:3c619efa52b0390715f1e6abf182ed3de43e9c3c224d32284d3015b2dd52ffef`; evidence `sha256:bb8c8e14e5bbb6b5b181deb5980e5d945801d82573a9cf3bf29c3753c24daa37`; findings `sha256:1ab4b3e7766553be62d86f3c15f1ffae80ca224eeb54a83848836e09355a62ef`.

## Owner feedback

2026-08-31T10:20:00Z — “Chạy lại đi, sao không được là dừng thế.” — Dashboard route mission continuation — ADOPTED: resumed the same logical review with additive evidence and continued all authorized closure work.
