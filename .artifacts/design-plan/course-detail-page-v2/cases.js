/**
 * Review lab manifest - PREVIEW phase, revision 1.5.
 *
 * The chrome renders the EXPORTED candidate through `candidateUrl` and refuses to embed it unless
 * the proof it fetches matches `runtimeProof`. There is deliberately no `html` and no `css` here:
 * those belong to Plan's directional comparison, and a second implementation maintained beside the
 * candidate is the thing this phase exists to stop. The Plan manifest is kept, unchanged, as
 * `cases.plan.js`.
 *
 * Regenerate the digests with `node scripts/runtime-proof.mjs` after ANY candidate or fixture edit.
 * A stale digest is not a nuisance - it is the lab correctly refusing to show a render the record no
 * longer describes.
 */
window.STARCI_REVIEW = {
    title: "Course detail page - executable candidate, revision 1.5",
    phase: "preview",
    deliveryMode: "single",
    mode: "migration",
    caseId: "case-course-detail-v2",
    workItems: [{
        id: "page-course-detail",
        scope: "page",
        target: "D:\\Repositories\\starci-academy-fe - new route /courses/[displayId]",
    }],
    evidence: [
        { source: "plan-record.json", claim: "direction-parity-semantic was selected explicitly after the three directions were rendered; the user answered \"A\"." },
        { source: "candidate build", claim: "npx next build --webpack exits 0 and emits a static export with one route per rendered state. Command, exit code and hashed log are in the design record." },
        { source: "candidate lint", claim: "npx eslint over the candidate exits 0 under the target's own canon rules, which reach .artifacts/**/candidate/**." },
        { source: "candidate typecheck", claim: "npx tsc --noEmit exits 0 against the candidate tsconfig, which resolves @/ to the target's real src." },
        { source: "out/.well-known/starci-preview-semantics.json", claim: "The elements below are read out of the EXPORTED HTML by a stack-walking scan, not asserted. Zero ul/ol nodes have a non-li direct child across all six states." },
        { source: "src/components/contracts/index.ts (locked)", claim: "Exactly one locked entry declares a host today - routed-page-main. Every other host in this candidate is proposed here first, so nothing was inherited unchecked." },
        { source: "starci-academy/.../CoursePricingRail/index.tsx", claim: "The rail is the only buy box and the hero carries no price, which is the hierarchy this candidate reproduces." },
        { source: "starci-academy-backend .../queries/courses/course/graphql-types/request.ts", claim: "CourseRequest accepts id or displayId, so the production slug resolves with no new backend field." },
    ],
    cases: [
        {
            id: "direction-parity-semantic",
            title: "Course detail - parity anatomy, regions that name themselves",
            thesis: "The reading order and the anatomy are the named production render's, unchanged. What this direction adds is that every region SAYS what it is - the trail is a nav, the narrative and its two regions are sections, the buy box is an aside, the promises are a ul of li, the curriculum is an ol of li - and it says so in the registry entry rather than at the call site.",
            distinction: "Revision 1.2. Built in 1.0 as executable StarCi source against the current registry, carrying over nothing from the superseded run except the CoverImage proposal and the fixture; 1.1 repairs one parity divergence the 375px screenshot exposed - the curriculum title now truncates to one line and its level badge and preview count share a wrapping meta group, as the named baseline does.",
            states: [
                {
                    id: "ready",
                    label: "Ready · desktop · vi",
                    stateId: "ready",
                    covers: ["page-course-detail:ready"],
                    candidateUrl: "candidate/out/state/ready.html",
                    proofUrl: "candidate/out/.well-known/starci-preview-ready.json",
                    runtimeProof: {
                        candidateDigest: "bcc52c4b3be528ad4a74ce149fd6cad814cc4f16dead7ac1bfcd6288eaf0fdcd",
                        stateId: "ready",
                        fixtureSha256: "8fb0b2965e8af31abd5db23d045e96f751e49cd34a9980798f68b57869116fd6",
                        runtimeFingerprint: "5c39412c5d83408bfddfc9368f024cacb5eee840577e856d28a9e77cd4ece45e",
                    },
                },
                {
                    // The SAME exported document at 375px, which is why it shares ready's
                    // fingerprint. The pinned bar exists only below the rail's breakpoint, so it is
                    // a state that was genuinely observed - but it is not a second render.
                    id: "ready-mobile",
                    label: "Ready · mobile 375 · vi",
                    stateId: "ready-mobile",
                    covers: ["page-course-detail:ready-narrow"],
                    candidateUrl: "candidate/out/state/ready.html",
                    proofUrl: "candidate/out/.well-known/starci-preview-ready-mobile.json",
                    runtimeProof: {
                        candidateDigest: "bcc52c4b3be528ad4a74ce149fd6cad814cc4f16dead7ac1bfcd6288eaf0fdcd",
                        stateId: "ready-mobile",
                        fixtureSha256: "8fb0b2965e8af31abd5db23d045e96f751e49cd34a9980798f68b57869116fd6",
                        runtimeFingerprint: "5c39412c5d83408bfddfc9368f024cacb5eee840577e856d28a9e77cd4ece45e",
                    },
                },
                {
                    id: "price-pending",
                    label: "Price pending · desktop · vi",
                    stateId: "price-pending",
                    covers: ["page-course-detail:price-pending"],
                    candidateUrl: "candidate/out/state/price-pending.html",
                    proofUrl: "candidate/out/.well-known/starci-preview-price-pending.json",
                    runtimeProof: {
                        candidateDigest: "bcc52c4b3be528ad4a74ce149fd6cad814cc4f16dead7ac1bfcd6288eaf0fdcd",
                        stateId: "price-pending",
                        fixtureSha256: "8fb0b2965e8af31abd5db23d045e96f751e49cd34a9980798f68b57869116fd6",
                        runtimeFingerprint: "5febad47a7912e0cfecf4d6e9d7427ac80904b0c4601ce2f007e7f06eb071436",
                    },
                },
                {
                    id: "no-ladder",
                    label: "No phase ladder · desktop · vi",
                    stateId: "no-ladder",
                    covers: ["page-course-detail:no-ladder"],
                    candidateUrl: "candidate/out/state/no-ladder.html",
                    proofUrl: "candidate/out/.well-known/starci-preview-no-ladder.json",
                    runtimeProof: {
                        candidateDigest: "bcc52c4b3be528ad4a74ce149fd6cad814cc4f16dead7ac1bfcd6288eaf0fdcd",
                        stateId: "no-ladder",
                        fixtureSha256: "8fb0b2965e8af31abd5db23d045e96f751e49cd34a9980798f68b57869116fd6",
                        runtimeFingerprint: "914f7f1ab459e68fad01566997b82f40885f5442f795e86cf85aa2e1aff27c1b",
                    },
                },
                {
                    id: "pending",
                    label: "Pending · desktop · vi",
                    stateId: "pending",
                    covers: ["page-course-detail:pending"],
                    candidateUrl: "candidate/out/state/pending.html",
                    proofUrl: "candidate/out/.well-known/starci-preview-pending.json",
                    runtimeProof: {
                        candidateDigest: "bcc52c4b3be528ad4a74ce149fd6cad814cc4f16dead7ac1bfcd6288eaf0fdcd",
                        stateId: "pending",
                        fixtureSha256: "8fb0b2965e8af31abd5db23d045e96f751e49cd34a9980798f68b57869116fd6",
                        runtimeFingerprint: "9e2075abe1e37945cfd9341112877310ea50266ee445b74f3b33007123405053",
                    },
                },
                {
                    id: "not-found",
                    label: "Not found · desktop · vi",
                    stateId: "not-found",
                    covers: ["page-course-detail:not-found"],
                    candidateUrl: "candidate/out/state/not-found.html",
                    proofUrl: "candidate/out/.well-known/starci-preview-not-found.json",
                    runtimeProof: {
                        candidateDigest: "bcc52c4b3be528ad4a74ce149fd6cad814cc4f16dead7ac1bfcd6288eaf0fdcd",
                        stateId: "not-found",
                        fixtureSha256: "8fb0b2965e8af31abd5db23d045e96f751e49cd34a9980798f68b57869116fd6",
                        runtimeFingerprint: "54862ab1c93af0d0d520e3c306898729c202a4b38ffa68aaf98c04d90cca17a3",
                    },
                },
                {
                    id: "failed",
                    label: "Failed · desktop · vi",
                    stateId: "failed",
                    covers: ["page-course-detail:failed"],
                    candidateUrl: "candidate/out/state/failed.html",
                    proofUrl: "candidate/out/.well-known/starci-preview-failed.json",
                    runtimeProof: {
                        candidateDigest: "bcc52c4b3be528ad4a74ce149fd6cad814cc4f16dead7ac1bfcd6288eaf0fdcd",
                        stateId: "failed",
                        fixtureSha256: "8fb0b2965e8af31abd5db23d045e96f751e49cd34a9980798f68b57869116fd6",
                        runtimeFingerprint: "37a5a68388c8230b7f2929528f8c47ab7fd8794afceac7bfc1bbd22f44411914",
                    },
                },
            ],
            blockTree: [
                "Tree routed-page-main                              �  <main>   (locked)",
                "����� CourseDetailPageBase (page)",
                "    ����� Tree course-detail-page                    �  <div>    � � proposed",
                "        �S���� Tree course-breadcrumb-row             �  <nav>    � � proposed",
                "        �S���� Tree main-then-rail                    �  <div>    � � proposed",
                "        �   �S���� Tree course-hero                   �  <section>� � proposed",
                "        �   �   �S���� Tree course-hero-heading       �  <div>    � � proposed",
                "        �   �   �S���� Tree course-stat-chip-run      �  <ul>     � � proposed",
                "        �   �   �   ����� Tree course-stat-chip      �  <li>     � � proposed",
                "        �   �   �S���� Tree course-section            �  <section>� � proposed",
                "        �   �   �   ����� course-promise-list <ul> > course-promise-row <li>",
                "        �   �   ����� Tree course-section            �  <section>",
                "        �   �       ����� course-module-list <ol> > course-module-row <li>",
                "        �   �           ����� CurriculumModuleRow (leaf, <details>) � � proposed",
                "        �   ����� CoursePricingRailBase (block)         � � proposed",
                "        �       ����� Tree course-pricing-rail       �  <aside>  � � proposed",
                "        �           �S���� CoverImage (leaf)          � � proposed, shared with the catalog run",
                "        �           �S���� course-price-block > price-discount-line (locked)",
                "        �           �S���� pricing-phase-ladder <ol> > pricing-phase-row <li>",
                "        �           �S���� Button (locked leaf)",
                "        �           ����� Text (locked leaf)",
                "        ����� CourseMobileEnrollBarBase (block)         � � proposed",
                "            ����� Tree course-mobile-action-bar      �  <div>    � � proposed",
            ].join("\n"),
            contracts: [
                { key: "routed-page-main", why: "LOCKED, reused verbatim. The only entry in the repository that declares a host today. Every state opens exactly one." },
                { key: "price-discount-line", why: "LOCKED, reused verbatim by both the rail and the pinned bar, so the two can never disagree about what the course costs." },
                { key: "course-detail-page", why: "PROPOSED. Carries NO horizontal inset - the pinned bar beneath it must reach both edges of a phone. The measure sits on the two children that want it." },
                { key: "course-breadcrumb-row", why: "PROPOSED, host nav. The trail back is a set of destinations rather than prose." },
                { key: "main-then-rail", why: "PROPOSED. Mirrors the locked rail-then-main on the opposite child rather than replacing it; a left rail and a right rail are the same mechanics and neither should be expressed by reordering content." },
                { key: "course-hero", why: "PROPOSED, host section. What the course is, promises and contains is one continuous argument addressed to one reader." },
                { key: "course-stat-chip-run", why: "PROPOSED, host ul. Deliberately not profile-topic-chip-run: identical mechanics, different domain." },
                { key: "course-stat-chip", why: "PROPOSED, host li. Exists ONLY to be the list item. Added during revision 1.5 after the exported HTML showed the ul holding spans - the run had been claiming a length nothing could count." },
                { key: "course-module-list", why: "PROPOSED, host ol. Modules are ORDERED: module three follows module two and cannot be read first." },
                { key: "course-module-row", why: "PROPOSED, host li. Added for the same reason as course-stat-chip: a details element cannot be an ol's child and leave the sequence intact." },
                { key: "course-pricing-rail", why: "PROPOSED, host aside. Complementary to the narrative, which is what an aside means and what assistive technology announces." },
                { key: "pricing-phase-ladder", why: "PROPOSED, host ol. The open phase is the price and the ones after it are the cost of waiting, so the sequence IS the meaning." },
                { key: "course-mobile-action-bar", why: "PROPOSED, deliberately NO host. The rail already claims the complementary region for this page's commerce; announcing a second one on the single viewport where only the pinned copy is reachable would be worse than announcing none." },
            ],
            proposals: [
                "LayoutClassName gains twelve members, measured rather than estimated: the entries use 51 distinct classes and twelve are not in the 117-member union. Five sticky last-child members for the right-hand rail (the union holds all five for first-child, because the dashboard rail is on the left), two last-child grow members for the promise row, bottom-0 / border-t / md:hidden for the pinned bar (the union holds top-0, border-b and hidden - the same three for the opposite edge), and pt-6 / pb-6 (the union holds py-6, which is both at once, and both at once is what a page with a bottom-pinned bar cannot use). Every one mirrors a member already there; nothing in this repository has had a right-hand rail or a bottom-pinned bar before.",
                "Two new leaves: CoverImage (shared with the catalog run, unchanged) and CurriculumModuleRow. The latter is a leaf and not a contract because ContractHost does not admit `details` and should not: a disclosure is an intrinsic CONTROL with its own open state, not a shape that holds other shapes. HeroUI 3.2.4 ships no Accordion, Collapsible or Disclosure, and the repository has no accordion branch - both checked, not assumed.",
                "Two new blocks: CoursePricingRail and CourseMobileEnrollBar, under a new src/components/blocks/courses/ folder.",
                "Tree gains role=\"list\" when the entry's host is ul or ol. Tailwind preflight sets list-style: none on every list, and Safari answers that by dropping the element from the accessibility tree - so the list the entry just claimed is announced to VoiceOver as loose text. The role restores exactly what the entry already says. Written once in the frame rather than as a field on sixteen entries, because it is not a decision an entry gets to make.",
            ],
            differences: [
                "The candidate pins the fixture locale `vi` and imports the target's real vi catalogue directly; production resolves the locale per request through the next-intl plugin. Every rendered state therefore declares locale: vi rather than claiming locale coverage it does not have.",
                "The candidate page takes ONE settled situation. In production the regions settle independently - the rail owns the price preview, the curriculum owns the module tree, neither waits on the other - and the single `state` here stands in for those connected halves.",
                "The candidate has no route. Apply creates /courses/[displayId] and the single-course GraphQL document, neither of which exists in the target yet.",
            ],
        },
    ],
}
