/**
 * Direction lab manifest — Plan phase, re-planned against the settled rule set.
 *
 * One case (`case-course-detail-v2`), three directions. Every scene is DIRECTIONAL HTML: it makes a
 * product decision visible and is never ported.
 *
 * Each region is labelled with the ELEMENT its registry entry would open. That label is the point
 * of this run: before `ContractHostTag` every node was a `div`, so the previous lab could only
 * differ in geometry. The tag is now a decision, and a reader has to be able to see it.
 */

const BASE_CSS = `
.sc { --bg:oklch(12% 0.0015 354.13); --surface:oklch(21.03% 0.003 354.13);
  --fg:oklch(99.11% 0.0015 354.13); --muted:oklch(70.5% 0.003 354.13);
  --accent:oklch(70.03% 0.2092 354.13); --sep:oklch(25% 0.0015 354.13);
  --success:oklch(73.29% 0.1941 162.85);
  background:var(--bg); color:var(--fg); padding:24px; border-radius:16px;
  font-family:ui-sans-serif,system-ui,"Segoe UI",sans-serif; }
.sc *,.sc *::before,.sc *::after { box-sizing:border-box; }
.tag { position:absolute; top:-9px; left:10px; font-size:9px; letter-spacing:.08em;
  text-transform:uppercase; background:var(--bg); color:var(--accent); padding:0 6px;
  border:1px solid var(--accent); border-radius:999px; }
.host { position:relative; border:1px dashed color-mix(in oklab, var(--accent) 45%, transparent);
  border-radius:12px; padding:16px 14px 14px; }
.sc-crumb { font-size:12px; color:var(--muted); margin:0 0 10px; }
.sc-crumb b { color:var(--fg); font-weight:600; }
.sc-h1 { font-size:28px; font-weight:800; margin:0 0 6px; letter-spacing:-.015em; }
.sc-tag { font-size:13px; color:var(--muted); margin:0 0 14px; }
.sc-chips { display:flex; flex-wrap:wrap; gap:8px; }
.sc-chip { display:flex; align-items:center; gap:6px; background:var(--surface);
  border:1px solid var(--sep); border-radius:999px; padding:5px 11px; font-size:11px; }
.sc-sect { font-size:15px; font-weight:700; margin:0 0 10px; }
.sc-list { list-style:none; margin:0; padding:0; border:1px solid var(--sep);
  border-radius:14px; overflow:hidden; background:var(--surface); }
.sc-list li { display:flex; gap:11px; padding:12px 15px; font-size:13px; line-height:1.5;
  align-items:flex-start; }
.sc-list li + li { border-top:1px solid var(--sep); }
.tick { color:var(--success); flex:none; }
.mod { display:flex; align-items:center; gap:11px; width:100%; }
.mod-ttl { flex:1; min-width:0; }
.badge { font-size:10px; color:var(--success);
  background:color-mix(in oklab, var(--success) 14%, transparent);
  border-radius:999px; padding:3px 9px; flex:none; }
.prev { font-size:11px; color:var(--muted); flex:none; }
.chev { color:var(--muted); flex:none; font-size:11px; }
.lesson { font-size:11px; color:var(--muted); padding:6px 0 0 26px; }
.cover { aspect-ratio:16/9; border-radius:11px; background:linear-gradient(135deg,#3b1d5e,#7a2b6b);
  display:grid; place-items:center; font-size:10px; font-weight:700; color:#fff;
  text-align:center; padding:6px; }
.now { font-size:24px; font-weight:800; letter-spacing:-.02em; }
.was { font-size:12px; color:var(--muted); text-decoration:line-through; }
.off { font-size:11px; font-weight:700; color:var(--success);
  background:color-mix(in oklab, var(--success) 14%, transparent); border-radius:6px; padding:2px 7px; }
.priceline { display:flex; align-items:baseline; gap:9px; flex-wrap:wrap; }
.save { font-size:11px; color:var(--muted); margin-top:3px; }
.rule { height:1px; background:var(--sep); margin:14px 0; }
.phase { display:flex; align-items:center; gap:9px; font-size:12px; padding:4px 0; }
.dot { width:12px; height:12px; border-radius:50%; border:1.5px solid var(--muted); flex:none; }
.phase[data-on="true"] .dot { border-color:var(--accent); background:var(--accent);
  box-shadow:inset 0 0 0 3px var(--surface); }
.phase[data-on="true"] .pname { color:var(--accent); font-weight:600; }
.pname { flex:1; }
.pval { color:var(--muted); font-size:11px; }
.cta { display:block; width:100%; background:var(--accent); color:#fff; border-radius:999px;
  padding:12px; text-align:center; font-weight:700; font-size:13px; margin-top:4px; }
.proof { text-align:center; font-size:10px; color:var(--muted); margin-top:8px; }
.card { background:var(--surface); border:1px solid var(--sep); border-radius:16px; padding:14px; }
.note { margin:16px 0 0; font-size:11px; color:var(--muted); }
.stack { display:flex; flex-direction:column; gap:22px; }
`;

const CRUMB = `<p class="sc-crumb">Trang chủ &rsaquo; Khóa học &rsaquo; <b>Fullstack Mastery</b></p>`;

const HERO = `
<div class="host"><span class="tag">section &middot; course-hero</span>
  <h1 class="sc-h1">Fullstack Mastery</h1>
  <p class="sc-tag">Lộ trình học dạng module từ nền tảng đến triển khai thực tế.</p>
  <div class="host" style="margin-top:12px"><span class="tag">ul &middot; course-stat-chip-run</span>
    <div class="sc-chips">
      <span class="sc-chip">59 Học viên</span><span class="sc-chip">23 Module</span>
      <span class="sc-chip">95 Nội dung</span><span class="sc-chip">33 Giờ học</span>
      <span class="sc-chip">348 Bài thực hành</span>
    </div>
  </div>
</div>`;

const PROMISES = [
    "Lộ trình học dạng module từ nền tảng đến triển khai thực tế.",
    "Bài giảng chất lượng cao, giải thích trực tiếp, không lan man.",
    "Bài tập thực hành giúp nâng cao tư duy và kỹ năng engineering.",
    "Review CV 1:1 và hỗ trợ phân phối CV đến network tuyển dụng.",
];

const MODULES = [
    ["Nền tảng backend: Framework, vòng đời request, cấu hình và logging", "5 bài xem trước", ["Vòng đời một request", "Cấu hình theo môi trường"]],
    ["Tích hợp Database & Caching", "6 bài xem trước", ["Chỉ mục và kế hoạch truy vấn"]],
    ["REST API: Thiết kế & Tài liệu", "4 bài xem trước", []],
    ["Xác thực & Phân quyền", "9 bài xem trước", ["Phiên đăng nhập và token"]],
    ["Server State với TanStack Query", "4 bài xem trước", []],
];

const promiseBlock = () => `
<div class="host"><span class="tag">section &middot; course-section</span>
  <h2 class="sc-sect">Bạn sẽ học được gì</h2>
  <div class="host"><span class="tag">ul &middot; course-promise-list</span>
    <ul class="sc-list">${PROMISES.map((line) => `<li><span class="tick">&check;</span><span>${line}</span></li>`).join("")}</ul>
  </div>
</div>`;

const curriculumDisclosing = () => `
<div class="host"><span class="tag">section &middot; course-section</span>
  <h2 class="sc-sect">Nội dung khóa học</h2>
  <div class="host"><span class="tag">ol &middot; course-module-list &rarr; leaf opens &lt;details&gt;</span>
    <ol class="sc-list">${MODULES.map(([title, prev, lessons], index) => `
      <li><div style="width:100%">
        <div class="mod">
          ${lessons.length ? `<span class="chev">&#9662;</span>` : `<span class="chev" style="opacity:.25">&#9662;</span>`}
          <span class="mod-ttl">${title}</span>
          <span class="badge">Nền tảng</span><span class="prev">${prev}</span>
        </div>
        ${index === 0 && lessons.length ? lessons.map((l) => `<div class="lesson">${l}</div>`).join("") : ""}
      </div></li>`).join("")}</ol>
  </div>
</div>`;

const curriculumFlat = () => `
<div class="host"><span class="tag">ol &middot; course-module-list &middot; no disclosure, no new leaf</span>
  <h2 class="sc-sect">Nội dung khóa học</h2>
  <ol class="sc-list">${MODULES.map(([title, prev]) => `
    <li><div class="mod">
      <span class="mod-ttl">${title}</span>
      <span class="badge">Nền tảng</span><span class="prev">${prev}</span>
    </div></li>`).join("")}</ol>
</div>`;

const RAIL = `
<div class="card">
  <div class="cover">cover artwork placeholder<br>(coverImageUrl)</div>
  <div style="height:12px"></div>
  <div class="priceline"><span class="now">1.275.000₫</span><span class="was">1.500.000₫</span><span class="off">−15%</span></div>
  <div class="save">Tiết kiệm 225.000₫</div>
  <div class="rule"></div>
  <div class="phase" data-on="true"><span class="dot"></span><span class="pname">Tiêu chuẩn</span><span class="pval">Đang mở</span></div>
  <div class="phase"><span class="dot"></span><span class="pname">Tiên phong</span><span class="pval">1.000.000₫</span></div>
  <div class="phase"><span class="dot"></span><span class="pname">Sớm</span><span class="pval">1.250.000₫</span></div>
  <div class="rule"></div>
  <span class="cta">Tiếp tục học →</span>
  <div class="proof">59 người đã đăng ký</div>
</div>`;

const railHost = (label) => `<div class="host"><span class="tag">${label}</span>${RAIL}</div>`;

/* ── A — parity-first, semantic, disclosing ─────────────────────────────── */
const HTML_A = `
<div class="sc">
  <div class="host"><span class="tag">main &middot; routed-page-main</span>
    ${CRUMB}
    <div class="host"><span class="tag">div &middot; main-then-rail &middot; PROPOSED (+5 union members)</span>
      <div class="two">
        <div class="stack">${HERO}${promiseBlock()}${curriculumDisclosing()}</div>
        ${railHost("aside &middot; course-pricing-rail")}
      </div>
    </div>
  </div>
  <p class="note">Directional only. Cover artwork is a labelled placeholder.</p>
</div>`;

const CSS_A = BASE_CSS + `
.two { display:grid; grid-template-columns:1fr 320px; gap:22px; align-items:start; }
`;

/* ── B — same shape, flat curriculum ────────────────────────────────────── */
const HTML_B = `
<div class="sc">
  <div class="host"><span class="tag">main &middot; routed-page-main</span>
    ${CRUMB}
    <div class="host"><span class="tag">div &middot; main-then-rail &middot; PROPOSED (+5 union members)</span>
      <div class="two">
        <div class="stack">${HERO}${promiseBlock()}${curriculumFlat()}</div>
        ${railHost("aside &middot; course-pricing-rail")}
      </div>
    </div>
  </div>
  <p class="note">Directional only. The curriculum shows what a buyer decides on and stops there.</p>
</div>`;

const CSS_B = CSS_A;

/* ── C — locked rail-then-main, rail on the left ────────────────────────── */
const HTML_C = `
<div class="sc">
  <div class="host"><span class="tag">main &middot; routed-page-main</span>
    ${CRUMB}
    <div class="host"><span class="tag">div &middot; rail-then-main &middot; LOCKED, unchanged</span>
      <div class="two-left">
        ${railHost("aside &middot; course-pricing-rail")}
        <div class="stack">${HERO}${promiseBlock()}${curriculumFlat()}</div>
      </div>
    </div>
  </div>
  <p class="note">Directional only. No class member is added anywhere in this direction.</p>
</div>`;

const CSS_C = BASE_CSS + `
.two-left { display:flex; gap:22px; align-items:flex-start; }
.two-left > .host:first-child { width:300px; flex:none; }
.two-left > .stack { flex:1; min-width:0; }
`;

const SHARED_EVIDENCE = [
    { source: "src/components/contracts/index.ts", claim: "ContractHostTag admits div, main, nav, ul, ol, form, section and aside. `details` is absent, so a disclosure cannot be a contract host and must be a leaf." },
    { source: "src/components/contracts/index.ts", claim: "The sticky family in LayoutClassName exists only in its first-child form, so a right-hand sticky rail widens the union by five mirrored members." },
    { source: "src/components/branches", claim: "PressableTree, SurfaceCard, SurfaceFormCard, SurfaceListCard, SurfacePanel, Tree. There is still no accordion branch." },
    { source: "src/messages/{en,vi}.json", claim: "Copy resolves through next-intl; src/resources does not exist here, so no-second-language-in-source is satisfied by the repository's existing habit." },
    { source: "src/app", claim: "No /courses/[displayId] route exists, and no single-course GraphQL document exists in src/modules/api/graphql/queries." },
    { source: "starci-academy-backend .../courses/course/graphql-types/request.ts", claim: "CourseRequest accepts id OR displayId, so the production slug resolves with no new backend field." },
    { source: "starci-academy/src/hooks/useCourseTotals.ts", claim: "The five trust chips are derived client-side by walking modules to contents to challenges and minutesRead; no backend counter is involved." },
    { source: ".artifacts/design-plan/course-detail-page/plan-record.json", claim: "The superseded run selected direction-parity-first and mapped it before ContractHostTag existed, which is why its feasibility list names a Main branch that has since been deleted." },
];

window.STARCI_REVIEW = {
    title: "Course detail page — re-planned against the settled rule set",
    phase: "plan",
    deliveryMode: "single",
    mode: "migration",
    caseId: "case-course-detail-v2",
    workItems: [{ id: "page-course-detail", scope: "page", target: "starci-academy-fe — new route /courses/[displayId]" }],
    evidence: SHARED_EVIDENCE,
    cases: [
        {
            id: "direction-parity-semantic",
            title: "A · Parity, fully semantic, curriculum discloses",
            posture: "parity-first",
            thesis: "Reproduce the production landing and let every region open the element it actually is: the page a main, each narrative block a section, both lists a ul and an ol, the buy box an aside. The curriculum discloses its lessons, as the named render does.",
            distinction: "Highest fidelity and the highest vocabulary cost: it is the only direction that adds a disclosure leaf, and it widens the class union for the right-hand rail.",
            css: CSS_A,
            states: [{ id: "direction-parity-semantic-default", label: "Populated · dark · desktop", covers: ["page-course-detail:populated"], html: HTML_A }],
            blockTree: [
                "CourseDetailPage (page)",
                "└── routed-page-main            host: main   (LOCKED, already exists)",
                "    ├── course-breadcrumb-row   host: nav    ← proposed",
                "    └── main-then-rail          host: div    ← proposed (+5 union members)",
                "        ├── course-hero         host: section ← proposed",
                "        │   └── course-stat-chip-run  host: ul ← proposed",
                "        ├── course-section      host: section ← proposed",
                "        │   ├── course-promise-list   host: ul ← proposed",
                "        │   └── course-module-list    host: ol ← proposed",
                "        │       └── CurriculumModuleRow (leaf) ← proposed, opens <details>",
                "        └── course-pricing-rail host: aside  ← proposed",
                "            ├── CoverImage (leaf)             ← proposed",
                "            ├── price-discount-line (LOCKED)",
                "            └── pricing-phase-ladder          ← proposed",
            ].join("\n"),
            contracts: [
                { key: "routed-page-main", why: "LOCKED and already carries host: main. The routed page is the one region a reader came for, so it is the document's landmark." },
                { key: "price-discount-line", why: "LOCKED, reused verbatim. The payable price leads while original price and discount qualify that same commerce fact on one wrapping line." },
                { key: "main-then-rail", why: "PROPOSED. The narrative owns the flexible measure while the purchase decision keeps a fixed sticky column at the trailing edge. Mirrors the locked rail-then-main; a left rail and a right rail are the same mechanics on opposite children." },
                { key: "course-pricing-rail", why: "PROPOSED, host aside. Complementary to the narrative rather than part of it, which is what an aside means and what a screen reader announces." },
                { key: "course-module-list", why: "PROPOSED, host ol. Modules are ORDERED - module three follows module two - and an ol says so to a reader who cannot see the numbering." },
                { key: "course-promise-list", why: "PROPOSED, host ul. Unordered peers; deliberately not profile-evidence-list, whose identical mechanics are named for a different domain." },
                { key: "pricing-phase-ladder", why: "PROPOSED. The phases are one mutually exclusive ladder in which the open phase is the price and the others are the cost of waiting." },
            ],
            stateCoverage: [
                { ownerId: "page-course-detail", state: "populated", coverage: "rendered", scenarioId: "direction-parity-semantic-default", evidence: "The named render's content branch." },
                { ownerId: "CurriculumModuleRow", state: "no-lessons", coverage: "deferred-to-preview", evidence: "A module with an empty lesson run must not invite a press that opens onto nothing." },
                { ownerId: "page-course-detail", state: "skeleton", coverage: "deferred-to-preview", evidence: "Legacy mirrors hero, rail card and a three-item accordion in place." },
                { ownerId: "page-course-detail", state: "not-found", coverage: "deferred-to-preview", evidence: "Legacy renders the empty notice once loading settles." },
                { ownerId: "page-course-detail", state: "failed", coverage: "deferred-to-preview", evidence: "Error beats a stale loading flag." },
                { ownerId: "CoursePricingRail", state: "price-pending", coverage: "deferred-to-preview", evidence: "The headline rests rather than flashing the phase price." },
                { ownerId: "CoursePricingRail", state: "no-phases", coverage: "deferred-to-preview", evidence: "The ladder is omitted when the course has none." },
                { ownerId: "page-course-detail", state: "mobile", coverage: "deferred-to-preview", evidence: "The rail stacks and a pinned bar takes over below md." },
            ],
            proposals: [
                { decision: "new", tier: "leaf", name: "CurriculumModuleRow", path: "src/components/leaves/CurriculumModuleRow", api: "props { title, levelLabel?, previewLabel?, lessons?, isOpen? }", reason: "`details` is not a ContractHostTag and there is no accordion branch, so the disclosure belongs to the tier that already owns intrinsic controls." },
                { decision: "new", tier: "leaf", name: "CoverImage", path: "src/components/leaves/CoverImage", api: "props { src: string | null, alt: string, ratio }", reason: "No image owner exists at any tier; coverImageUrl has nowhere to render." },
                { decision: "new", tier: "block", name: "CoursePricingRail", path: "src/components/blocks/courses/CoursePricingRail" },
                { decision: "extend", tier: "type", name: "LayoutClassName", api: "add md:[&>*:last-child]:sticky, :top-6, :self-start, :max-h-rail, :overflow-y-auto", reason: "The union carries the sticky family only in its first-child form." },
            ],
            backendEnablers: [],
            assumptions: ["The production render is the binding definition of this page.", "A buyer wants lesson-level detail before purchase, which is why the curriculum discloses."],
            unknowns: [
                "The target has no single-course query; the document that feeds this page must carry the whole module tree, because the five chips are derived from it.",
                "Cart and checkout are absent, so the CTA's destination beyond enrolment is unproven.",
            ],
        },
        {
            id: "direction-semantic-flat",
            title: "B · Same shape, curriculum stops at the module",
            posture: "balanced",
            thesis: "Keep the production geometry and the same semantic hosts, and let the curriculum be exactly what a buyer decides on: module titles, their level and how many lessons are previewable. Lesson names arrive after enrolment, where the learner can actually open them.",
            distinction: "One product bet and one fewer owner. It is the only direction where the curriculum has no interactive state at all, so the page has nothing to disclose, collapse or remember.",
            css: CSS_B,
            states: [{ id: "direction-semantic-flat-default", label: "Populated · dark · desktop", covers: ["page-course-detail:populated"], html: HTML_B }],
            blockTree: [
                "CourseDetailPage (page)",
                "└── routed-page-main            host: main   (LOCKED)",
                "    ├── course-breadcrumb-row   host: nav    ← proposed",
                "    └── main-then-rail          host: div    ← proposed (+5 union members)",
                "        ├── course-hero         host: section ← proposed",
                "        ├── course-section      host: section ← proposed",
                "        │   ├── course-promise-list  host: ul ← proposed",
                "        │   └── course-module-list   host: ol ← proposed, rows are text only",
                "        └── course-pricing-rail host: aside  ← proposed",
            ].join("\n"),
            contracts: [
                { key: "routed-page-main", why: "LOCKED, host main." },
                { key: "price-discount-line", why: "LOCKED, reused verbatim." },
                { key: "main-then-rail", why: "PROPOSED, same as direction A." },
                { key: "course-module-list", why: "PROPOSED, host ol. Ordered modules, and each row is a title with two facts - no control, so no leaf." },
                { key: "course-pricing-rail", why: "PROPOSED, host aside." },
                { key: "pricing-phase-ladder", why: "PROPOSED, same as direction A." },
            ],
            stateCoverage: [
                { ownerId: "page-course-detail", state: "populated", coverage: "rendered", scenarioId: "direction-semantic-flat-default", evidence: "Same fields as A minus the lesson runs." },
                { ownerId: "page-course-detail", state: "skeleton", coverage: "deferred-to-preview", evidence: "A joined list already carries a resting count." },
                { ownerId: "page-course-detail", state: "not-found", coverage: "deferred-to-preview", evidence: "Shared with A." },
                { ownerId: "page-course-detail", state: "failed", coverage: "deferred-to-preview", evidence: "Shared with A." },
                { ownerId: "CoursePricingRail", state: "price-pending", coverage: "deferred-to-preview", evidence: "Shared with A." },
                { ownerId: "page-course-detail", state: "mobile", coverage: "deferred-to-preview", evidence: "Shared with A." },
            ],
            proposals: [
                { decision: "new", tier: "leaf", name: "CoverImage", path: "src/components/leaves/CoverImage" },
                { decision: "new", tier: "block", name: "CoursePricingRail", path: "src/components/blocks/courses/CoursePricingRail" },
                { decision: "extend", tier: "type", name: "LayoutClassName", api: "add the five last-child sticky members" },
            ],
            backendEnablers: [],
            assumptions: ["Module titles and preview counts are enough to decide a purchase; lesson names are post-enrolment detail."],
            unknowns: [
                "This drops information the named render shows. Whether that costs conversions is a product question this Plan cannot answer from source.",
                "Same missing single-course query and absent checkout as direction A.",
            ],
            legacyDivergence: ["The curriculum does not disclose lessons, which the production render does."],
        },
        {
            id: "direction-locked-left-rail",
            title: "C · Locked rail-then-main, rail on the left",
            posture: "conservative",
            thesis: "Reuse the locked rail-then-main exactly as it is, take the semantic hosts that cost nothing, and accept the rail on the left. No class member is added anywhere.",
            distinction: "The only direction that widens no governed type. It buys that by mirroring the page against the named render.",
            css: CSS_C,
            states: [{ id: "direction-locked-left-rail-default", label: "Populated · dark · desktop", covers: ["page-course-detail:populated"], html: HTML_C }],
            blockTree: [
                "CourseDetailPage (page)",
                "└── routed-page-main            host: main   (LOCKED)",
                "    └── rail-then-main          host: div    (LOCKED, unchanged - rail is the FIRST child)",
                "        ├── course-pricing-rail host: aside  ← proposed",
                "        └── course-narrative    host: section ← proposed",
                "            ├── course-promise-list  host: ul ← proposed",
                "            └── course-module-list   host: ol ← proposed, rows are text only",
            ].join("\n"),
            contracts: [
                { key: "rail-then-main", why: "LOCKED. A narrow persistent column beside the flexible main measure, already carrying sticky, top-6, max-h-rail and overflow-y-auto - on its FIRST child, which is why the rail lands on the left." },
                { key: "routed-page-main", why: "LOCKED, host main." },
                { key: "price-discount-line", why: "LOCKED, reused verbatim." },
                { key: "course-pricing-rail", why: "PROPOSED, host aside." },
                { key: "pricing-phase-ladder", why: "PROPOSED - the one contract this direction cannot avoid; no locked key expresses a mutually exclusive ladder." },
            ],
            stateCoverage: [
                { ownerId: "page-course-detail", state: "populated", coverage: "rendered", scenarioId: "direction-locked-left-rail-default", evidence: "Every layout class is already locked." },
                { ownerId: "page-course-detail", state: "mobile", coverage: "deferred-to-preview", evidence: "rail-then-main stacks rail-first below md, so the buy box appears BEFORE the course title. Preview must judge whether that is better or plainly wrong." },
                { ownerId: "page-course-detail", state: "skeleton", coverage: "deferred-to-preview", evidence: "Shared." },
                { ownerId: "page-course-detail", state: "not-found", coverage: "deferred-to-preview", evidence: "Shared." },
                { ownerId: "page-course-detail", state: "failed", coverage: "deferred-to-preview", evidence: "Shared." },
            ],
            proposals: [
                { decision: "new", tier: "block", name: "CoursePricingRail", path: "src/components/blocks/courses/CoursePricingRail" },
                { decision: "new", tier: "contract", name: "pricing-phase-ladder" },
            ],
            backendEnablers: [],
            assumptions: ["A mirrored page is acceptable in exchange for adding no governed vocabulary."],
            unknowns: [
                "This is openly not parity: the rail is on the wrong side and there is no cover artwork in the locked rail column. It is listed so the cost of parity is visible.",
                "Below md the locked contract stacks rail-first, so the buy box precedes the course title.",
            ],
            legacyDivergence: [
                "The rail sits on the left rather than the right.",
                "The curriculum does not disclose lessons.",
                "Below md the buy box appears before the title.",
            ],
        },
    ],
};
