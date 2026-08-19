/**
 * Direction lab manifest — Plan phase.
 *
 * One case (`case-courses-catalog`) for the Courses catalog page, three selectable directions
 * inside it. Every scene below is DIRECTIONAL HTML: it exists to make a product decision
 * visible, never to be ported by Apply.
 *
 * Cover artwork is drawn as a labelled gradient placeholder on purpose. The real catalog reads
 * `CourseEntity.coverImageUrl`; inventing pixel-accurate production artwork in a directional
 * lab would claim a fidelity this phase has not earned.
 */

const BASE_CSS = `
.sc { --bg:oklch(12% 0.0015 354.13); --surface:oklch(21.03% 0.003 354.13);
  --surface2:oklch(25.7% 0.0023 354.13); --fg:oklch(99.11% 0.0015 354.13);
  --muted:oklch(70.5% 0.003 354.13); --accent:oklch(70.03% 0.2092 354.13);
  --sep:oklch(25% 0.0015 354.13); --success:oklch(73.29% 0.1941 162.85);
  background:var(--bg); color:var(--fg); padding:24px; border-radius:16px;
  font-family:ui-sans-serif,system-ui,"Segoe UI",sans-serif; }
.sc *,.sc *::before,.sc *::after { box-sizing:border-box; }
.sc-crumb { font-size:12px; color:var(--muted); margin:0 0 8px; }
.sc-crumb b { color:var(--fg); font-weight:600; }
.sc-h1 { font-size:26px; font-weight:800; margin:0 0 20px; letter-spacing:-.01em; }
.sc-toolbar { display:flex; align-items:center; gap:16px; margin-bottom:20px; flex-wrap:wrap; }
.sc-search { flex:1; min-width:220px; display:flex; align-items:center; gap:10px;
  background:var(--surface); border:1px solid var(--sep); border-radius:12px; padding:10px 14px; }
.sc-search span { color:var(--muted); font-size:14px; }
.sc-count { font-size:14px; color:var(--muted); white-space:nowrap; }
.sc-view { display:flex; background:var(--surface); border:1px solid var(--sep);
  border-radius:10px; overflow:hidden; }
.sc-view i { display:grid; place-items:center; width:38px; height:34px; font-style:normal;
  font-size:13px; color:var(--muted); }
.sc-view i[aria-pressed="true"] { background:var(--surface2); color:var(--fg); }
.sc-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.sc-card { background:var(--surface); border:1px solid var(--sep); border-radius:16px;
  padding:12px; display:flex; flex-direction:column; gap:10px; }
.sc-cover { aspect-ratio:16/9; border-radius:12px; display:grid; place-items:center;
  font-size:12px; font-weight:700; color:#fff; text-align:center; padding:6px; }
.sc-cover--a { background:linear-gradient(135deg,#3b1d5e,#7a2b6b); }
.sc-cover--b { background:linear-gradient(135deg,#4a1d5e,#8a2b5b); }
.sc-cover--c { background:linear-gradient(135deg,#5e1d4a,#a83b6b); }
.sc-cardhead { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
.sc-title { font-size:15px; font-weight:700; margin:0; }
.sc-enroll { font-size:11px; color:var(--muted); white-space:nowrap; display:flex;
  align-items:center; gap:4px; }
.sc-desc { font-size:12px; color:var(--muted); margin:0; line-height:1.5;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.sc-vp { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px; }
.sc-vp li { font-size:12px; color:var(--fg); display:flex; gap:6px; line-height:1.45; }
.sc-vp em { color:var(--success); font-style:normal; flex:none; }
.sc-price { display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; margin-top:auto; }
.sc-now { font-size:16px; font-weight:800; }
.sc-was { font-size:12px; color:var(--muted); text-decoration:line-through; }
.sc-off { font-size:11px; font-weight:700; color:var(--success); }
.sc-save { font-size:11px; color:var(--muted); }
.sc-actions { display:flex; gap:8px; }
.sc-btn { flex:1; border-radius:999px; padding:9px 12px; font-size:13px; font-weight:600;
  text-align:center; border:1px solid transparent; }
.sc-btn--primary { background:var(--accent); color:#fff; }
.sc-btn--ghost { background:transparent; border-color:var(--sep); color:var(--fg); }
.sc-btn--danger { background:transparent; border-color:oklch(59.4% 0.1973 36.67);
  color:oklch(59.4% 0.1973 36.67); }
.sc-note { margin:16px 0 0; font-size:11px; color:var(--muted); }
`;

const CARDS = [
    {
        cover: "a",
        title: "Fullstack Mastery",
        enroll: "59 học viên",
        desc: "Xây dựng nền tảng vững chắc, kỹ năng thực chiến và tư duy engineering để đạt được công việc thực tập hoặc…",
        vp: [
            "Lộ trình học dạng module từ nền tảng đến triển khai thực tế.",
            "Bài giảng chất lượng cao, giải thích trực tiếp, không lan man.",
            "Bài tập thực hành giúp nâng cao tư duy và kỹ năng engineering.",
        ],
        now: "1.275.000₫", was: "1.500.000₫", off: "−15%", save: "Tiết kiệm 225.000₫",
        primary: "Tiếp tục học →", secondary: "Xem khóa học", owned: true,
    },
    {
        cover: "b",
        title: "System Design Mastery",
        enroll: "67 học viên",
        desc: "Khóa học dành cho developers muốn nâng cao kỹ năng thiết kế hệ thống, hiểu sâu về kiến trúc phân tán,…",
        vp: [
            "Chương trình tập trung vào tư duy và kỹ năng thiết kế hệ thống thực tế.",
            "Thực hành thiết kế các hệ thống phổ biến: social network, video streaming, e-commerce…",
            "Được hỗ trợ review design và nhận feedback từ mentor có kinh nghiệm.",
        ],
        now: "1.487.500₫", was: "2.000.000₫", off: "−26%", save: "Tiết kiệm 512.500₫",
        primary: "Tiếp tục học →", secondary: "Xem khóa học", owned: true,
    },
    {
        cover: "c",
        title: "DevOps Mastery",
        enroll: "22 học viên",
        desc: "Khóa DevOps thực chiến đi từ nền tảng Linux & Networking cho SRE, sang Terraform Infrastructure as…",
        vp: [
            "Terraform-first: mọi hạ tầng viết bằng IaC, grounded từng argument theo Terraform Registry thật.",
            "Thực chiến 4 cloud provider (AWS/GCP/Azure/DigitalOcean) với lab apply thật rồi destroy sạch.",
            "Phủ trọn DevOps stack: Linux, Terraform, Docker, Kubernetes, CI/CD, GitOps, Observability, SRE.",
        ],
        now: "1.487.500₫", was: "2.000.000₫", off: "−26%", save: "Tiết kiệm 512.500₫",
        primary: "Xem khóa học →", secondary: "Bỏ khỏi giỏ", owned: false, inCart: true,
    },
];

const toolbar = (viewPressed) => `
<div class="sc-toolbar">
  <div class="sc-search"><span>🔍</span><span>Tìm khóa học...</span></div>
  <div class="sc-count">5 khóa học</div>
  <div class="sc-view">
    <i aria-pressed="${viewPressed === "grid"}">▦</i><i aria-pressed="${viewPressed === "line"}">☰</i>
  </div>
</div>`;

const head = (title) => `
<p class="sc-crumb">Trang chủ &rsaquo; <b>Khóa học</b></p>
<h1 class="sc-h1">${title}</h1>`;

const card = (item) => `
<article class="sc-card">
  <div class="sc-cover sc-cover--${item.cover}">cover artwork placeholder<br>(coverImageUrl)</div>
  <div class="sc-cardhead">
    <h3 class="sc-title">${item.title}</h3>
    <span class="sc-enroll">👥 ${item.enroll}</span>
  </div>
  <p class="sc-desc">${item.desc}</p>
  <ul class="sc-vp">${item.vp.map((line) => `<li><em>✓</em><span>${line}</span></li>`).join("")}</ul>
  <div class="sc-price">
    <span class="sc-now">${item.now}</span><span class="sc-was">${item.was}</span>
    <span class="sc-off">${item.off}</span>
  </div>
  <div class="sc-save">${item.save}</div>
  <div class="sc-actions">
    <span class="sc-btn sc-btn--primary">${item.primary}</span>
    <span class="sc-btn ${item.inCart ? "sc-btn--danger" : "sc-btn--ghost"}">${item.secondary}</span>
  </div>
</article>`;

/* ── Direction A — parity-first ─────────────────────────────────────────── */
const HTML_A = `
<div class="sc">
  ${head("Khóa học tiêu biểu")}
  ${toolbar("grid")}
  <div class="sc-grid">${CARDS.map(card).join("")}</div>
  <p class="sc-note">Directional only. Cover artwork is a labelled placeholder, not production imagery.</p>
</div>`;

/* ── Direction B — enrollment split ─────────────────────────────────────── */
const HTML_B = `
<div class="sc">
  ${head("Khóa học tiêu biểu")}
  ${toolbar("grid")}
  <h2 class="sc-secttl">Đang học<span class="sc-sectcount">2 khóa</span></h2>
  <div class="sc-grid sc-grid--two">${CARDS.filter((item) => item.owned).map((item) => `
    <article class="sc-card sc-card--owned">
      <div class="sc-ownedrow">
        <div class="sc-cover sc-cover--${item.cover} sc-cover--mini">cover</div>
        <div class="sc-ownedbody">
          <h3 class="sc-title">${item.title}</h3>
          <div class="sc-bar"><i style="width:46%"></i></div>
          <span class="sc-enroll">46% hoàn thành · ${item.enroll}</span>
        </div>
      </div>
      <div class="sc-actions"><span class="sc-btn sc-btn--primary">Tiếp tục học →</span></div>
    </article>`).join("")}</div>
  <h2 class="sc-secttl">Khám phá<span class="sc-sectcount">3 khóa</span></h2>
  <div class="sc-grid">${CARDS.filter((item) => !item.owned).concat(CARDS.slice(0, 2)).slice(0, 3).map((item) => `
    <article class="sc-card">
      <div class="sc-cover sc-cover--${item.cover}">cover artwork placeholder</div>
      <div class="sc-cardhead"><h3 class="sc-title">${item.title}</h3>
        <span class="sc-enroll">👥 ${item.enroll}</span></div>
      <div class="sc-price"><span class="sc-now">${item.now}</span>
        <span class="sc-was">${item.was}</span><span class="sc-off">${item.off}</span></div>
      <div class="sc-save">${item.save}</div>
      <details class="sc-more"><summary>3 điểm nổi bật</summary>
        <ul class="sc-vp">${item.vp.map((line) => `<li><em>✓</em><span>${line}</span></li>`).join("")}</ul>
      </details>
      <div class="sc-actions"><span class="sc-btn sc-btn--primary">Xem khóa học →</span>
        <span class="sc-btn sc-btn--ghost">Thêm vào giỏ</span></div>
    </article>`).join("")}</div>
  <p class="sc-note">Directional only. Progress percentage is illustrative and needs a proven source before Preview.</p>
</div>`;

const CSS_B = BASE_CSS + `
.sc-secttl { font-size:14px; font-weight:700; margin:22px 0 12px; display:flex;
  align-items:baseline; gap:10px; }
.sc-sectcount { font-size:12px; font-weight:400; color:var(--muted); }
.sc-grid--two { grid-template-columns:repeat(2,1fr); }
.sc-ownedrow { display:flex; gap:12px; }
.sc-cover--mini { width:96px; flex:none; aspect-ratio:16/9; font-size:10px; }
.sc-ownedbody { display:flex; flex-direction:column; gap:6px; min-width:0; flex:1; }
.sc-bar { height:6px; border-radius:999px; background:var(--surface2); overflow:hidden; }
.sc-bar i { display:block; height:100%; background:var(--accent); }
.sc-more { border-top:1px solid var(--sep); padding-top:8px; }
.sc-more summary { font-size:12px; color:var(--muted); cursor:pointer; }
.sc-more .sc-vp { margin-top:8px; }
`;

/* ── Direction C — dense reuse list ─────────────────────────────────────── */
const HTML_C = `
<div class="sc">
  ${head("Khóa học tiêu biểu")}
  ${toolbar("line")}
  <div class="sc-list">${CARDS.map((item) => `
    <div class="sc-row">
      <div class="sc-tile">📘</div>
      <div class="sc-rowbody">
        <div class="sc-cardhead"><h3 class="sc-title">${item.title}</h3>
          <span class="sc-enroll">👥 ${item.enroll}</span></div>
        <p class="sc-desc">${item.desc}</p>
        <ul class="sc-vp sc-vp--inline"><li><em>✓</em><span>${item.vp[0]}</span></li></ul>
      </div>
      <div class="sc-rowend">
        <div class="sc-price"><span class="sc-now">${item.now}</span>
          <span class="sc-off">${item.off}</span></div>
        <div class="sc-was">${item.was}</div>
        <span class="sc-btn sc-btn--primary">${item.owned ? "Tiếp tục học" : "Xem khóa học"}</span>
      </div>
    </div>`).join("")}</div>
  <p class="sc-note">Directional only. No cover-image owner is introduced by this direction.</p>
</div>`;

const CSS_C = BASE_CSS + `
.sc-list { border:1px solid var(--sep); border-radius:16px; overflow:hidden;
  background:var(--surface); }
.sc-row { display:flex; gap:14px; padding:14px 16px; align-items:flex-start; }
.sc-row + .sc-row { border-top:1px solid var(--sep); }
.sc-tile { width:40px; height:40px; flex:none; border-radius:12px; background:var(--surface2);
  display:grid; place-items:center; font-size:18px; }
.sc-rowbody { flex:1; min-width:0; display:flex; flex-direction:column; gap:6px; }
.sc-rowend { flex:none; width:170px; display:flex; flex-direction:column; gap:6px;
  align-items:flex-end; }
.sc-rowend .sc-btn { width:100%; }
.sc-vp--inline li { color:var(--muted); }
`;

window.STARCI_REVIEW = {
    title: "Courses catalog page — direction lab",
    phase: "plan",
    deliveryMode: "single",
    mode: "migration",
    caseId: "case-courses-catalog",
    workItems: [{
        id: "page-courses-catalog",
        scope: "page",
        target: "D:\\Repositories\\starci-academy-fe — new route /courses (does not exist yet)",
    }],
    evidence: [
        { source: "starci-academy-fe/src/app", claim: "Route inventory is authentication, dashboard and profile only — there is no /courses route, so this page is net-new in the target." },
        { source: "starci-academy/src/components/pages/CourseCatalogPage/index.tsx", claim: "Legacy catalog owns debounced search (350ms), curated COURSE_ORDER re-sort, PAGE_SIZE 9, and a grid/line view persisted in localStorage under starci.course.catalogView." },
        { source: "starci-academy/src/components/pages/CourseCatalogPage/CatalogCourseCard/index.tsx", claim: "Each catalog card enriches a presentational CourseCard with a per-course coursePricePreview loyalty price and an AddToCartButton, with loyaltyPending guarding a price flash." },
        { source: "starci-academy-backend .../inputs/pagination-page.ts", claim: "PaginationPageFilters already exposes search, so catalog search needs no backend enabler." },
        { source: "starci-academy-backend .../entities/course.entity.ts", claim: "CourseEntity exposes coverImageUrl, originalPrice, enrollmentCount, isEnrolled, pricingPhases and valuePropositions." },
        { source: "starci-academy-backend .../entities/value-proposition.entity.ts", claim: "ValuePropositionEntity.text plus orderIndex is the truthful source of the three check bullets on the production card." },
        { source: "starci-academy-fe/src/modules/api/graphql/queries/query-courses.ts", claim: "The target's courses document selects nine fields and omits valuePropositions and any price-phase data, and its hook exposes no search parameter." },
        { source: "starci-academy-fe/src/components/contracts/index.ts", claim: "price-discount-line exists (price, optional original, optional discount badge); there is no catalog, cart, pagination or cover-image vocabulary." },
    ],
    cases: [
        {
            id: "direction-parity-first",
            title: "A · Parity-first catalog",
            posture: "parity-first",
            thesis: "Reproduce the named production catalog: one discovery toolbar above a three-column grid, and a card that carries the whole sales pitch — cover, enrolment, description, three value propositions, discounted price with savings, and a two-action row.",
            distinction: "The card is the unit of decision. Nothing is grouped, disclosed or reordered; the learner scans complete cards and the page invents no product opinion of its own.",
            css: BASE_CSS,
            states: [{ id: "direction-parity-first-default", label: "Populated · dark · desktop", covers: ["page-courses-catalog:populated"], html: HTML_A }],
            blockTree: [
                "CoursesCatalogPage (page)",
                "└── catalog-page-column",
                "    ├── page-heading-with-breadcrumb",
                "    ├── catalog-search-count-view-row   ← proposed",
                "    │   ├── search-box (leaf, exists)",
                "    │   ├── text (leaf, exists)",
                "    │   └── choice-tabs (leaf, exists)",
                "    ├── catalog-card-grid               ← proposed",
                "    │   └── CourseCatalogCard (block)   ← proposed",
                "    │       ├── cover-image (leaf)      ← proposed",
                "    │       ├── course-card-heading-row",
                "    │       ├── text (leaf, exists)",
                "    │       ├── value-proposition-list  ← proposed",
                "    │       ├── price-discount-line (exists, + savings slot)",
                "    │       └── card-action-row",
                "    └── pagination (leaf)               ← proposed",
            ].join("\n"),
            contracts: [
                { key: "price-discount-line", why: "The payable price leads while original price and discount qualify that same commerce fact on one wrapping line. Reused as-is; the savings sentence is proposed as one optional trailing slot." },
                { key: "label-row-over-card", why: "Existing section grammar for a titled body; reused for the page heading over the grid." },
                { key: "catalog-card-grid", why: "PROPOSED — catalog courses are interchangeable peers compared side by side, so they share one responsive measure rather than a reading column." },
                { key: "value-proposition-list", why: "PROPOSED — each course states a fixed set of promises that are read as a set, so the affirmative mark and its sentence repeat as one unit." },
                { key: "catalog-search-count-view-row", why: "PROPOSED — query, result count and layout choice all narrow the same list, so they stay on one control row above it." },
            ],
            stateCoverage: [
                { ownerId: "page-courses-catalog", state: "populated", coverage: "rendered", scenarioId: "direction-parity-first-default", evidence: "Legacy list branch of CourseCatalogPageBase." },
                { ownerId: "page-courses-catalog", state: "skeleton", coverage: "deferred-to-preview", evidence: "Legacy CatalogLineCardSkeleton and CourseCardSkeleton prove the shape; not rendered in Plan." },
                { ownerId: "page-courses-catalog", state: "empty", coverage: "deferred-to-preview", evidence: "Legacy splits plain-empty from filtered-empty with a clear-filter action." },
                { ownerId: "page-courses-catalog", state: "filtered-empty", coverage: "deferred-to-preview", evidence: "courses.emptyFiltered.* keys in the legacy connected file." },
                { ownerId: "page-courses-catalog", state: "failed", coverage: "deferred-to-preview", evidence: "Legacy passes swr.error only when nothing is cached." },
                { ownerId: "CourseCatalogCard", state: "price-pending", coverage: "deferred-to-preview", evidence: "loyaltyPending exists precisely to stop an N-card price flash." },
                { ownerId: "CourseCatalogCard", state: "guest", coverage: "deferred-to-preview", evidence: "coursePricePreview is disabled for guests, who see the phase price." },
            ],
            proposals: [
                { decision: "new", tier: "leaf", name: "CoverImage", path: "src/components/leaves/CoverImage", api: { props: { src: "string | null", alt: "string", ratio: "16/9" } }, reason: "The target has no image owner at any tier; the catalog card cannot show coverImageUrl without one.", tests: "Renders a token fallback when src is null." },
                { decision: "new", tier: "block", name: "CourseCatalogCard", path: "src/components/blocks/courses/CourseCatalogCard", reason: "No course card exists in the target; RecommendedCourseRow is a row, not a card, and owns a different relationship." },
                { decision: "extend", tier: "contract", name: "price-discount-line", api: { add: "savings: { leaf: 'text', props: { size: 'xs', tone: 'muted' }, optional: true }" }, precedence: "Absent by default; existing callers are unaffected.", callers: "RecommendedCourseRow keeps rendering without it.", reason: "The savings sentence qualifies the same commerce fact the contract already owns." },
                { decision: "new", tier: "leaf", name: "Pagination", path: "src/components/leaves/Pagination", reason: "PAGE_SIZE 9 means a real pager; the target has no pagination vocabulary." },
            ],
            backendEnablers: [],
            assumptions: [
                "The production render the user pointed at is the binding definition of this page.",
                "Curated COURSE_ORDER stays a client-side re-sort until the backend offers a curated order.",
            ],
            unknowns: [
                "pageNumber base: the backend documents PaginationPageFilters.pageNumber as 1-based while the legacy hook passes a 0-based index. This must be resolved against a live query before Preview, not copied.",
                "The target has no cart data layer at all (no myCart query, no add/remove mutation), so the production card's 'Bỏ khỏi giỏ' state cannot be rendered truthfully yet. The scene draws it to show the intended anatomy and it is NOT claimed as implementable in this run.",
                "Whether valuePropositions is reliably three rows per course, or must be sliced for card density.",
            ],
        },
        {
            id: "direction-enrollment-split",
            title: "B · Owned-then-discover",
            posture: "balanced",
            thesis: "The catalog mixes courses the learner already owns with courses they can buy, and the production page makes them read every card's button to tell which is which. Group by enrolment first, so section membership answers that question and each section keeps one CTA meaning.",
            distinction: "Reading order changes: enrolment state is decided by the section, not scanned per card. Owned courses shrink to a progress row, and the sales pitch is disclosed behind a summary so the discover grid stays scannable.",
            css: CSS_B,
            states: [{ id: "direction-enrollment-split-default", label: "Populated · dark · desktop", covers: ["page-courses-catalog:populated"], html: HTML_B }],
            blockTree: [
                "CoursesCatalogPage (page)",
                "└── catalog-page-column",
                "    ├── page-heading-with-breadcrumb",
                "    ├── catalog-search-count-view-row   ← proposed",
                "    ├── catalog-section-group           ← proposed",
                "    │   ├── EnrolledCourseCard (block)  ← proposed",
                "    │   │   ├── cover-image (leaf)      ← proposed",
                "    │   │   └── progress (leaf, exists)",
                "    │   └── CourseCatalogCard (block)   ← proposed",
                "    │       └── value-proposition-disclosure ← proposed",
                "    └── pagination (leaf)               ← proposed",
            ].join("\n"),
            contracts: [
                { key: "price-discount-line", why: "Reused unchanged in the discover section." },
                { key: "catalog-section-group", why: "PROPOSED — owned and purchasable courses answer different questions, so each keeps its own titled group and one CTA meaning." },
                { key: "value-proposition-disclosure", why: "PROPOSED — the promises stay available but stop competing with price for first read in a three-column grid." },
                { key: "catalog-search-count-view-row", why: "PROPOSED — same control row as direction A." },
            ],
            stateCoverage: [
                { ownerId: "page-courses-catalog", state: "populated", coverage: "rendered", scenarioId: "direction-enrollment-split-default", evidence: "isEnrolled is already selected by the target's courses document." },
                { ownerId: "catalog-section-group", state: "no-owned-courses", coverage: "deferred-to-preview", evidence: "A guest or new learner has an empty owned section; the group must collapse rather than render an empty title." },
                { ownerId: "page-courses-catalog", state: "skeleton", coverage: "deferred-to-preview", evidence: "Two grids shimmer independently." },
                { ownerId: "page-courses-catalog", state: "filtered-empty", coverage: "deferred-to-preview", evidence: "Search may empty one section but not the other." },
            ],
            proposals: [
                { decision: "new", tier: "leaf", name: "CoverImage", path: "src/components/leaves/CoverImage", reason: "Same missing image owner as direction A." },
                { decision: "new", tier: "block", name: "EnrolledCourseCard", path: "src/components/blocks/courses/EnrolledCourseCard", reason: "An owned course answers 'where was I', which is a different relationship from 'should I buy this'." },
                { decision: "new", tier: "block", name: "CourseCatalogCard", path: "src/components/blocks/courses/CourseCatalogCard", reason: "Same as direction A, with the value propositions behind a disclosure." },
            ],
            backendEnablers: [],
            assumptions: [
                "Grouping by isEnrolled is more useful to a returning learner than the curated learning-path order.",
            ],
            unknowns: [
                "RESOLVED after this scene was drawn: the completion figure does have a proven source. myCourses query1 selects completionPercent, and query2 selects thumbnailUrl plus contentCompleted/contentTotal and challengeCompleted/challengeTotal, so the owned card can show real progress and real artwork through useQueryMyCoursesSwr.",
                "Grouping fights the curated COURSE_ORDER the legacy page deliberately applies; which wins is a product decision this direction assumes rather than proves.",
                "The discover card's 'Thêm vào giỏ' has no data layer in the target and stays unmapped; Preview must either build the cart layer or drop that secondary button and keep 'Xem khóa học' alone.",
                "Same pageNumber base unknown as direction A.",
            ],
        },
        {
            id: "direction-dense-list",
            title: "C · Dense reuse list",
            posture: "conservative",
            thesis: "Ship the catalog with the vocabulary the target already has: a joined list of rows with an icon tile, the course identity, its leading promise and a trailing price and action — no cover artwork, no new image tier.",
            distinction: "This is the only direction that introduces no cover-image owner and no card grid, so it is the cheapest and the least faithful. It trades the production look for a page that can exist entirely inside today's contracts.",
            css: CSS_C,
            states: [{ id: "direction-dense-list-default", label: "Populated · dark · desktop", covers: ["page-courses-catalog:populated"], html: HTML_C }],
            blockTree: [
                "CoursesCatalogPage (page)",
                "└── catalog-page-column",
                "    ├── page-heading-with-breadcrumb",
                "    ├── catalog-search-count-view-row   ← proposed",
                "    ├── SurfaceListCard (branch, exists)",
                "    │   └── catalog-course-row          ← proposed, mirrors recommended-course-row",
                "    │       ├── icon-tile (leaf, exists)",
                "    │       ├── text (leaf, exists)",
                "    │       ├── price-discount-line (exists)",
                "    │       └── button (leaf, exists)",
                "    └── pagination (leaf)               ← proposed",
            ].join("\n"),
            contracts: [
                { key: "recommended-course-row", why: "The course mark leads one whole-row destination while its commerce facts stay in one flexible reading column — the exact relationship this direction reuses." },
                { key: "price-discount-line", why: "Reused unchanged." },
                { key: "catalog-course-row", why: "PROPOSED — a sibling of recommended-course-row that carries a trailing commerce action instead of being a whole-row destination." },
            ],
            stateCoverage: [
                { ownerId: "page-courses-catalog", state: "populated", coverage: "rendered", scenarioId: "direction-dense-list-default", evidence: "Every field drawn is already selected by the target's courses document except valuePropositions." },
                { ownerId: "page-courses-catalog", state: "skeleton", coverage: "deferred-to-preview", evidence: "SurfaceListCard already carries a resting count." },
                { ownerId: "page-courses-catalog", state: "empty", coverage: "deferred-to-preview", evidence: "EmptyNotice exists in the target." },
                { ownerId: "page-courses-catalog", state: "failed", coverage: "deferred-to-preview", evidence: "EmptyNotice already carries a retry action." },
            ],
            proposals: [
                { decision: "new", tier: "contract", name: "catalog-course-row", reason: "recommended-course-row is a whole-row destination and cannot host a trailing commerce action without changing its own meaning." },
                { decision: "new", tier: "leaf", name: "Pagination", path: "src/components/leaves/Pagination", reason: "Shared with the other directions." },
            ],
            backendEnablers: [],
            assumptions: [
                "The user accepts a visibly different catalog in exchange for shipping inside today's vocabulary.",
            ],
            unknowns: [
                "This direction openly diverges from the named production render, which is the opposite of the parity the user asked for; it is listed so the cost of parity is visible, not because it matches.",
                "Same pageNumber base and cart-layer unknowns as direction A.",
            ],
        },
    ],
};
