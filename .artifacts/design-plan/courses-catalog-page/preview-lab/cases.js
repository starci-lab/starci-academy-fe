/**
 * Preview review chrome — Courses catalog page, revision 1.10.
 *
 * `phase: "preview"`, so this manifest carries NO `state.html` and NO case CSS. Every state below
 * points at the executable candidate through `candidateUrl` and is gated by a runtime proof the
 * chrome fetches and compares before it will render the frame. There is no second implementation
 * of this UI anywhere in this file — that is the whole point of the phase.
 *
 * The candidate is a static export of a real Next 16 / React 19 app that imports the locked target
 * leaves, contracts and tokens from `D:\Repositories\starci-academy-fe\src`.
 */

const PROOF = {
    candidateDigest: "41799e1b62b9180847eb3fad6f85471e8b01e17ad3e1ae3b5e183de40ae03ecb",
    fixtureSha256: "f7b8f6feef986e83cae91819622f1f0f31cffb7d180f4f84820698bf68b6dca1",
    runtimeFingerprint: "232f340768eb73fda7821a99a3142faa",
};

/**
 * The candidate is ONE page driven by a scenario switcher, so every state shares a URL and is
 * selected inside the running app. The `stateId` is what the candidate stamps on
 * `[data-candidate-root]`, which is how a reviewer confirms the frame is showing what the row claims.
 */
const state = (id, label, covers) => ({
    id: `direction-enrollment-split-${id}`,
    label,
    covers,
    stateId: id,
    candidateUrl: "../candidate/out/index.html",
    proofUrl: `../candidate/out/.well-known/starci-preview-${id}.json`,
    runtimeProof: { ...PROOF, stateId: id },
})

window.STARCI_REVIEW = {
    title: "Courses catalog page — executable candidate — revision 1.10",
    phase: "preview",
    deliveryMode: "single",
    mode: "migration",
    caseId: "case-courses-catalog",
    workItems: [{
        id: "page-courses-catalog",
        scope: "page",
        target: "D:\\Repositories\\starci-academy-fe — new route /courses",
    }],
    evidence: [
        { source: "candidate/build.log", claim: "next build exits 0: compiled, type-checked and statically exported three routes." },
        { source: "browser", claim: "React hydrates in the export: pressing a scenario control changes [data-candidate-root] and the rendered tree." },
        { source: "candidate/app/globals.css", claim: "Tokens are imported from the target's own globals.css rather than copied, so a palette change there changes here." },
    ],
    cases: [{
        id: "direction-enrollment-split",
        title: "B · Owned-then-discover — revision 1.10",
        thesis: "Group by enrolment first, so section membership answers 'do I already own this' before any card is read, and each section keeps one action meaning.",
        distinction: "Selected in Plan over a parity-first reproduction and a dense reuse list.",
        states: [
            state("populated", "Populated · dark · desktop", ["page-courses-catalog:populated"]),
            state("pending", "Pending", ["page-courses-catalog:skeleton"]),
            state("no-owned-courses", "No owned courses", ["catalog-section-group:no-owned-courses"]),
            state("no-discount", "Course at full price", ["CourseCatalogCard:no-discount"]),
            state("filtered-empty", "Filtered empty", ["page-courses-catalog:filtered-empty"]),
            state("empty", "Empty", ["page-courses-catalog:empty"]),
            state("failed", "Failed", ["page-courses-catalog:failed"]),
            state("populated-light", "Populated · light", ["page-courses-catalog:light-theme"]),
        ],
        stateCoverage: [
            { ownerId: "page-courses-catalog", state: "populated", coverage: "rendered", scenarioId: "populated", evidence: "Two titled groups, three catalog cards, two owned cards, pager present." },
            { ownerId: "page-courses-catalog", state: "skeleton", coverage: "rendered", scenarioId: "pending", evidence: "Three resting cards with data-state=pending and shimmering covers; disclosure and pager omitted rather than faked." },
            { ownerId: "page-courses-catalog", state: "empty", coverage: "rendered", scenarioId: "empty", evidence: "empty-notice-stack with the funnel action." },
            { ownerId: "page-courses-catalog", state: "filtered-empty", coverage: "rendered", scenarioId: "filtered-empty", evidence: "Notice reads the filtered copy and keeps the toolbar so the filter can be cleared." },
            { ownerId: "page-courses-catalog", state: "failed", coverage: "rendered", scenarioId: "failed", evidence: "empty-notice-stack with the retry action; zero cards and zero pager." },
            { ownerId: "catalog-section-group", state: "no-owned-courses", coverage: "rendered", scenarioId: "no-owned-courses", evidence: "One section group remains, titled Khám phá; the owned group collapses entirely." },
            { ownerId: "CourseCatalogCard", state: "no-discount", coverage: "rendered", scenarioId: "no-discount", evidence: "price-discount-line renders one child and no badge; the savings line is absent." },
            { ownerId: "CourseCatalogCard", state: "price-pending", coverage: "covered-by", scenarioId: "pending", evidence: "The resting card is the same tree with isLoading threaded to every leaf." },
            { ownerId: "EnrolledCourseCard", state: "progress", coverage: "rendered", scenarioId: "populated", evidence: "Revision 1.1: fill width 46%, aria-valuenow 46, aria-valuetext 46%, visible caption '46% hoàn thành' and a distinct assistive name. Revision 1.0 passed a 0..1 ratio and drew a 0.46% bar." },
            { ownerId: "EnrolledCourseCard", state: "zero-progress", coverage: "not-applicable", evidence: "A course at 0% is the same tree with value 0; the leaf clamps nothing and no separate owner state exists." },
            { ownerId: "page-courses-catalog", state: "light-theme", coverage: "rendered", scenarioId: "populated-light", evidence: "Revision 1.2 drove the theme through next-themes instead of a wrapper class. Light background, readable section headings, white cards, accent preserved." },
            { ownerId: "page-courses-catalog", state: "mobile", coverage: "not-applicable", evidence: "Verified live at a real 390px viewport — scrollWidth equals clientWidth equals 390, enrolment count whole at x=322 — but NOT sealed as a rendered state: headless Chrome lays the page out at desktop width and crops, which the byte-identical before/after capture proved." },
            { ownerId: "page-courses-catalog", state: "keyboard-focus", coverage: "not-applicable", evidence: "Not exercised. Every interactive element is a locked leaf or a HeroUI primitive carrying its own focus ring; no candidate code overrides focus styling." },
            { ownerId: "contracts-registry", state: "collision-guard", coverage: "rendered", scenarioId: "populated", evidence: "Revision 1.7 restored the guard the refactor dropped: the candidate registry throws at import if a proposed key has landed upstream, or if the one restated locked key has vanished. It runs on every build." },
        ],
        blockTree: [
            "EVERY node below is a registry key drawn by Tree. Revision 1.6 removed the last",
            "hand-written host: no block opens a vendor Card and no page writes a layout class.",
            "",
            "courses-catalog-page                 (proposed)",
            "├── catalog-trail-over-title         (proposed)",
            "│   ├── Text - breadcrumb (locked leaf)",
            "│   └── Heading (locked leaf)",
            "├── catalog-search-count-view-row   (proposed)",
            "│   ├── SearchBox (locked leaf)",
            "│   ├── Text (locked leaf)",
            "│   └── ChoiceTabs (locked leaf)",
            "├── catalog-section-group           (proposed)  - owned group",
            "│   └── catalog-card-grid           (proposed)",
            "│       └── enrolled-course-card    (proposed)  <- EnrolledCourseCard",
            "│           ├── enrolled-course-row  (proposed)",
            "│           │   ├── CoverImage (leaf, proposed)",
            "│           │   └── enrolled-course-body (proposed)",
            "│           │       ├── Heading (locked leaf)",
            "│           │       ├── Progress (locked leaf)",
            "│           │       └── Text — completion caption (locked leaf)",
            "│           └── Button (locked leaf)",
            "├── catalog-section-group           (proposed)  - discover group",
            "│   └── catalog-card-grid           (proposed)",
            "│       └── catalog-card            (proposed)  <- CourseCatalogCard",
            "│           ├── CoverImage (leaf, proposed)",
            "│           ├── catalog-card-body (proposed)",
            "│           │   ├── catalog-card-heading-row (proposed)",
            "│           │   ├── price-discount-line (LOCKED contract, reused)",
            "│           │   ├── Text — savings (locked leaf)",
            "│           │   └── ValuePropositionDisclosure (leaf, proposed)",
            "│           └── Button (locked leaf)",
            "└── Pagination (leaf, proposed)",
        ].join("\n"),
        contracts: [
            { key: "price-discount-line", why: "LOCKED and reused unchanged: the payable price leads while original price and discount qualify that same commerce fact on one wrapping line." },
            { key: "catalog-search-count-view-row", why: "PROPOSED: query, result count and layout choice all narrow the same list, so they stay on one control row above it." },
            { key: "catalog-section-group", why: "PROPOSED: owned and purchasable courses answer different questions, so each keeps its own titled group and one action meaning." },
            { key: "catalog-card-grid", why: "PROPOSED: catalog courses are interchangeable peers compared side by side, so they share one responsive measure." },
            { key: "catalog-card-body", why: "PROPOSED: a purchasable course reads top to bottom as one decision at one rhythm." },
            { key: "catalog-card-heading-row", why: "PROPOSED: the course name leads while its enrolment count qualifies it from the end of the same line." },
            { key: "enrolled-course-row", why: "PROPOSED: artwork identifies the course while title and progress take the remaining width on one baseline." },
            { key: "enrolled-course-body", why: "PROPOSED: title over progress in one flexible column beside the artwork." },
        ],
        proposals: [
            { decision: "new", tier: "leaf", name: "CoverImage", targetPath: "src/components/leaves/CoverImage/index.tsx", note: "The target has no image owner at any tier. Nullable src renders a token surface, never an empty img." },
            { decision: "new", tier: "leaf", name: "Pagination", targetPath: "src/components/leaves/Pagination/index.tsx", note: "HeroUI 3 ships pagination parts with no page model, so the visible-window arithmetic belongs to this leaf. Counts from 1." },
            { decision: "new", tier: "leaf", name: "ValuePropositionDisclosure", targetPath: "src/components/leaves/ValuePropositionDisclosure/index.tsx", note: "PREVIEW CORRECTION: Plan proposed this as a contract. A contract entry draws one div and cannot produce details/summary, so ownership moved to the leaf tier. Product decision unchanged." },
            { decision: "new", tier: "block", name: "EnrolledCourseCard", targetPath: "src/components/blocks/courses/EnrolledCourseCard/component.tsx" },
            { decision: "new", tier: "block", name: "CourseCatalogCard", targetPath: "src/components/blocks/courses/CourseCatalogCard/component.tsx" },
            { decision: "new", tier: "page", name: "CoursesCatalogPage", targetPath: "src/components/pages/CoursesCatalogPage/component.tsx" },
            { decision: "withdrawn", tier: "contract", name: "price-discount-line savings slot", note: "PREVIEW CORRECTION: Plan proposed extending the shipped contract with an optional savings slot. Rendering savings as the next sibling line produces the same result with no change to a shipped contract and no migration for its existing caller, so the extension is withdrawn." },
        ],
        backendEnablers: [],
        candidateFiles: [
            { path: "candidate/src/components/contracts/proposed.ts", targetPath: "src/components/contracts/index.ts (merge the eight entries)" },
            { path: "candidate/src/components/branches/ProposedTree/index.tsx", targetPath: "NONE — scaffolding, delete on merge; every use becomes the locked Tree" },
            { path: "candidate/src/components/leaves/CoverImage/index.tsx", targetPath: "src/components/leaves/CoverImage/index.tsx" },
            { path: "candidate/src/components/leaves/Pagination/index.tsx", targetPath: "src/components/leaves/Pagination/index.tsx" },
            { path: "candidate/src/components/leaves/ValuePropositionDisclosure/index.tsx", targetPath: "src/components/leaves/ValuePropositionDisclosure/index.tsx" },
            { path: "candidate/src/components/blocks/EnrolledCourseCard/component.tsx", targetPath: "src/components/blocks/courses/EnrolledCourseCard/component.tsx" },
            { path: "candidate/src/components/blocks/CourseCatalogCard/component.tsx", targetPath: "src/components/blocks/courses/CourseCatalogCard/component.tsx" },
            { path: "candidate/src/components/pages/CoursesCatalogPage/component.tsx", targetPath: "src/components/pages/CoursesCatalogPage/component.tsx" },
            { path: "candidate/src/fixtures/catalog.json", targetPath: "NONE — fixture" },
        ],
        assumptions: [
            "Grouping by isEnrolled is more useful to a returning learner than the legacy curated COURSE_ORDER.",
            "The fixture's covers are null so the CoverImage fallback is the state under review; production reads CourseEntity.coverImageUrl.",
        ],
        unknowns: [
            "pageNumber base: the backend documents PaginationPageFilters.pageNumber as 1-based while the legacy hook passes 0-based. The leaf speaks 1-based and the connected file must convert once, after this is settled against a live query.",
            "The target has no cart data layer, so no cart action is rendered. The discover card's primary action is 'Xem khóa học' alone.",
            "This revision has NO connected file: the page is driven by a fixture, not by useQueryCoursesSwr, and the courses document still has to be extended with valuePropositions and price data.",
            "Light theme, mobile columns and keyboard focus are not visually confirmed — the browser pane was not displayed, so screenshots and layout measurement were unavailable.",
        ],
    }],
};
