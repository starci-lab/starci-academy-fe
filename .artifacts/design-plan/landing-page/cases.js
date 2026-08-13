/* Direction lab manifest — Plan phase. Directional HTML only; never an Apply baseline. */

const CASE_CSS = `
.sc { --bg:#0a0a0a; --surface:#151515; --surface2:#1d1d1d; --sep:#282828; --fg:#ededed;
      --muted:#8b8b8b; --accent:#ff2d8f; --success:#22c55e; --danger:#ef4444;
      background:var(--bg); color:var(--fg); padding:22px; border-radius:14px;
      font-family:ui-sans-serif,system-ui,"Segoe UI",sans-serif; font-size:14px; line-height:1.5; }
.sc *{box-sizing:border-box}
.sc-col{display:flex;flex-direction:column;gap:40px;max-width:900px;margin:0 auto}
.sc-hero{display:grid;grid-template-columns:1fr 320px;gap:32px;align-items:center}
.sc-eyebrow{color:var(--accent);font-size:12px;font-weight:600;letter-spacing:.04em}
.sc-h1{margin:8px 0 0;font-size:30px;line-height:1.2;font-weight:700}
.sc-h1 em{color:var(--accent);font-style:normal}
.sc-sub{color:var(--muted);font-size:14px;margin:12px 0 0;white-space:pre-line}
.sc-ctas{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
.sc-btn{background:var(--accent);color:#fff;border:0;border-radius:999px;padding:11px 20px;
        font-size:14px;font-weight:600;cursor:pointer}
.sc-btn.ghost{background:transparent;color:var(--fg);border:1px solid var(--sep)}
.sc-keep{border:1px dashed var(--success);border-radius:16px;padding:10px;position:relative}
.sc-keep::after{content:"KEPT · MicroservicesScene";position:absolute;top:-9px;left:10px;
        background:var(--bg);color:var(--success);font-size:9px;font-weight:700;padding:0 6px;letter-spacing:.05em}
.sc-cap{color:var(--muted);font-size:11px;text-align:center;margin-top:8px}
.sc-sec{display:flex;flex-direction:column;gap:14px}
.sc-sech{display:flex;flex-direction:column;gap:4px}
.sc-sech .e{color:var(--accent);font-size:11px;font-weight:600}
.sc-sech h3{margin:0;font-size:19px;font-weight:600}
.sc-sech p{margin:0;color:var(--muted);font-size:13px}
.sc-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.sc-stat{background:var(--surface);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:4px}
.sc-stat b{font-size:22px;font-weight:700}
.sc-stat span{color:var(--muted);font-size:11px}
.sc-tracks{display:flex;flex-direction:column;gap:10px}
.sc-track{background:var(--surface);border-radius:14px;padding:14px;display:flex;align-items:center;gap:14px}
.sc-track .n{width:26px;text-align:center;color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums}
.sc-track .b{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.sc-track .b strong{font-size:14px;font-weight:600}
.sc-track .b span{color:var(--muted);font-size:12px}
.sc-tier{border:1px solid var(--sep);border-radius:999px;padding:3px 10px;font-size:11px;color:var(--muted)}
.sc-gap{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sc-card{background:var(--surface);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:8px}
.sc-card h4{margin:0;font-size:14px;font-weight:600}
.sc-card ul{margin:0;padding-left:18px;color:var(--muted);font-size:12.5px;display:flex;flex-direction:column;gap:5px}
.sc-card.now{border-left:2px solid var(--danger)}
.sc-card.next{border-left:2px solid var(--success)}
.sc-proof{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.sc-person{background:var(--surface);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.sc-av{width:38px;height:38px;border-radius:999px;background:linear-gradient(135deg,#3aa8c1,#2b7f95)}
.sc-av.b{background:linear-gradient(135deg,#f0913c,#d2691e)}
.sc-av.c{background:linear-gradient(135deg,#8b5cf6,#6d4bd6)}
.sc-person strong{font-size:13px}
.sc-person span{color:var(--muted);font-size:11.5px}
.sc-quote{color:var(--muted);font-size:12.5px;font-style:italic}
.sc-close{background:var(--surface);border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.sc-note{color:var(--muted);font-size:11px;font-style:italic;margin:6px 0 0}
.sc-cut{color:var(--danger);font-size:11px;margin:0}
`;

/* The kept asset, sketched at lab fidelity. Preview rebuilds the real block. */
const SCENE = `
<div class="sc-keep">
  <svg viewBox="0 0 280 200" width="100%" height="180" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3a3a3a" stroke-width="1.4" fill="none">
      <path d="M40 58 L140 30 L240 58 L140 86 Z"/>
      <path d="M40 116 L140 88 L240 116 L140 144 Z"/>
      <path d="M90 170 L140 156 L190 170 L140 184 Z"/>
      <path d="M140 86 L140 88 M140 144 L140 156"/>
    </g>
    <g>
      <rect x="120" y="40" width="40" height="14" rx="3" fill="#2a2a2a" stroke="#4a4a4a"/>
      <rect x="72" y="98" width="30" height="12" rx="3" fill="#2a2a2a" stroke="#4a4a4a"/>
      <rect x="125" y="98" width="30" height="12" rx="3" fill="#ff2d8f" opacity=".85"/>
      <rect x="178" y="98" width="30" height="12" rx="3" fill="#2a2a2a" stroke="#4a4a4a"/>
      <rect x="122" y="162" width="36" height="14" rx="3" fill="#3a1a1a" stroke="#ef4444"/>
    </g>
    <text x="140" y="196" fill="#ef4444" font-size="9" text-anchor="middle">single DB · bottleneck</text>
  </svg>
</div>
<p class="sc-cap">Nhìn ra nơi dễ sập. Thiết kế hệ thống không thể bị sập.</p>`;

const HERO = (eyebrow, headline, sub, primary, secondary) => `
<div class="sc-hero">
  <div>
    <p class="sc-eyebrow">${eyebrow}</p>
    <h1 class="sc-h1">${headline}</h1>
    <p class="sc-sub">${sub}</p>
    <div class="sc-ctas">
      <button class="sc-btn">${primary}</button>
      <button class="sc-btn ghost">${secondary}</button>
    </div>
  </div>
  <div>${SCENE}</div>
</div>`;

const STATS = `
<div class="sc-sec">
  <div class="sc-sech"><span class="e">Số liệu thật</span><h3>StarCi Academy đang có</h3>
    <p>Bốn con số này đọc thẳng từ <code>platformStats</code> — không cần đăng nhập.</p></div>
  <div class="sc-stats">
    <div class="sc-stat"><b>1.240</b><span>Học viên</span></div>
    <div class="sc-stat"><b>386</b><span>Bài học</span></div>
    <div class="sc-stat"><b>12</b><span>Khoá học</span></div>
    <div class="sc-stat"><b>2.910</b><span>Huy hiệu đã trao</span></div>
  </div>
</div>`;

const TRACKS = (heading, intro) => `
<div class="sc-sec">
  <div class="sc-sech"><span class="e">Lộ trình</span><h3>${heading}</h3><p>${intro}</p></div>
  <div class="sc-tracks">
    <div class="sc-track"><span class="n">01</span><span class="b"><strong>Fullstack Mastery</strong>
      <span>Từ CRUD tới một hệ thống bạn tự bảo vệ được trong phỏng vấn.</span></span>
      <span class="sc-tier">Nền tảng</span></div>
    <div class="sc-track"><span class="n">02</span><span class="b"><strong>System Design</strong>
      <span>Đọc ra điểm sập trước khi nó sập — đúng cái hình bên trên đang nói.</span></span>
      <span class="sc-tier">Cốt lõi</span></div>
    <div class="sc-track"><span class="n">03</span><span class="b"><strong>DevOps Mastery</strong>
      <span>Đưa nó lên production và giữ cho nó sống.</span></span>
      <span class="sc-tier">Nâng cao</span></div>
  </div>
</div>`;

const CLOSE = (line, cta) => `
<div class="sc-close">
  <h3 style="margin:0;font-size:18px">${line}</h3>
  <button class="sc-btn">${cta}</button>
</div>`;

/* ---------- A ---------- */
const A = `
<div class="sc"><div class="sc-col">
  ${HERO("Lộ trình thực chiến cho vòng interview",
    "Kiến thức &amp; tư duy để chinh phục mọi vòng <em>phỏng vấn</em>",
    "AI đã làm xong việc vặt. Thứ doanh nghiệp còn trả lương cao là tư duy hệ thống —\\nvà đó là thứ duy nhất trang này nói về.",
    "Xem lộ trình", "Đăng nhập")}
  ${STATS}
  ${TRACKS("Ba khoá, một đường đi", "Xếp theo thứ tự phải học, không phải theo thứ tự dễ bán.")}
  ${CLOSE("Bắt đầu từ khoá nào phù hợp với bạn.", "Xem lộ trình")}
  <p class="sc-cut">Bỏ khỏi legacy: #treasure, #founder, #faq, LearnLoopScroll, KnowledgeGraph, TalentMarketplace.</p>
  <p class="sc-note">Bốn bề mặt, xuống từ tám. Một lời hứa ở hero, một bằng chứng là bốn con số công khai,
    một đường đi, một lời mời. Không section nào nhắc lại việc của section khác.</p>
</div></div>`;

/* ---------- B ---------- */
const B = `
<div class="sc"><div class="sc-col">
  ${HERO("Từ Developer tới Solution Architect",
    "Bạn viết được API. Bạn có <em>đọc ra chỗ nó sẽ sập</em> không?",
    "Hình bên phải là một hệ thống chạy tốt cho tới lúc không.\\nNếu bạn nhìn ra ngay cái nút thắt màu đỏ, trang này không dành cho bạn.",
    "Đọc hình này đi", "Xem lộ trình")}
  <div class="sc-sec">
    <div class="sc-sech"><span class="e">Khoảng cách</span><h3>Cái AI đã lấy mất, và cái nó chưa</h3>
      <p>Không phải lời chê. Là mô tả thị trường tuyển dụng năm nay.</p></div>
    <div class="sc-gap">
      <div class="sc-card now"><h4>Việc AI làm trong vài giây</h4>
        <ul><li>Sinh CRUD, boilerplate, DTO</li><li>Sửa UI theo mô tả</li><li>Viết test cho code đã có</li></ul></div>
      <div class="sc-card next"><h4>Việc vẫn phải là bạn</h4>
        <ul><li>Chọn ranh giới service</li><li>Biết cái gì sập trước khi nó sập</li><li>Bảo vệ đánh đổi trước một Interviewer</li></ul></div>
    </div>
  </div>
  ${TRACKS("Ba khoá, đóng đúng khoảng cách đó", "Mỗi khoá gỡ một phần của cột phải.")}
  ${CLOSE("Bắt đầu từ chỗ bạn đang mắc.", "Xem lộ trình")}
  <p class="sc-cut">Bỏ khỏi legacy: #stats (chuyển xuống dưới CTA), #treasure, #founder, #faq, LearnLoopScroll, TalentMarketplace.</p>
  <p class="sc-note">Cược sản phẩm: hình isometric thôi làm minh hoạ, nó thành LUẬN ĐIỂM.
    Hero đặt một câu hỏi người đọc tự trả lời được, và câu trả lời là lý do đọc tiếp.
    Đánh đổi: người đã biết câu trả lời sẽ thấy bị coi thường.</p>
</div></div>`;

/* ---------- C ---------- */
const C = `
<div class="sc"><div class="sc-col">
  ${HERO("Hồ sơ công khai, dựng từ bài đã làm",
    "Đây là những người đã đi qua. <em>Hồ sơ của họ mở</em>.",
    "Không testimonial, không ảnh chụp màn hình. Hồ sơ thật trên nền tảng này,\\nai cũng mở xem được, dựng từ bài họ đã nộp.",
    "Xem hồ sơ học viên", "Xem lộ trình")}
  <div class="sc-sec">
    <div class="sc-sech"><span class="e">Bằng chứng</span><h3>Ba hồ sơ, mở sẵn</h3>
      <p>Đọc từ <code>userProfile</code> và <code>profileEvidence</code> — hai query không cần đăng nhập.</p></div>
    <div class="sc-proof">
      <div class="sc-person"><span class="sc-av"></span><strong>trannguyenndc2004</strong>
        <span>7 challenge · 2 capstone</span><span class="sc-quote">Hồ sơ dựng từ bài đã nộp, không phải bản khai.</span></div>
      <div class="sc-person"><span class="sc-av b"></span><strong>betuanminh22032003</strong>
        <span>5 challenge · 1 capstone</span><span class="sc-quote">Mỗi mục dẫn tới bài nộp gốc.</span></div>
      <div class="sc-person"><span class="sc-av c"></span><strong>truongnghia297</strong>
        <span>4 challenge · 1 capstone</span><span class="sc-quote">Nhà tuyển dụng mở được mà không cần tài khoản.</span></div>
    </div>
  </div>
  ${TRACKS("Đường họ đã đi", "Cùng ba khoá, kể sau bằng chứng chứ không trước.")}
  ${STATS}
  <p class="sc-cut">Bỏ khỏi legacy: #treasure, #founder, #faq, LearnLoopScroll, KnowledgeGraph.</p>
  <p class="sc-note">Bạo nhất: mở bằng người thật thay vì lời hứa. Mạnh khi có hồ sơ đẹp, và
    RỖNG khi chưa có — trang này phụ thuộc vào dữ liệu mà hôm nay chưa ai kiểm đếm.</p>
</div></div>`;

const SHARED_CONTRACTS = [
  { key: "centred-page-column", why: "A landing page is one reading column, so its sections stack at one measure instead of each choosing its own." },
  { key: "label-row-over-card", why: "A section label and its quiet end action stay outside the surface they name." },
  { key: "evidence-title-over-subtitle", why: "A figure and the words that qualify it are one statement, so they stack rather than sit apart." },
];

const SHARED_EVIDENCE = [
  { source: "starci-academy/src/components/pages/LandingPage/HERO-CONTINUE.md:6-9", claim: "The hero right column is the block MicroservicesScene, isometric mini-infra in plain SVG; three.js and R3F were tried and removed on the user's own call, so nothing here needs WebGL." },
  { source: "starci-academy/src/components/pages/LandingPage/index.tsx", claim: "The legacy page carries anchors stats, courses, treasure, founder and faq plus LearnLoopScroll, KnowledgeGraph and TalentMarketplace - eight surfaces, several arguing the same point." },
  { source: "starci-academy-fe/src/modules/api/graphql/queries/query-platform-stats.ts:6-11", claim: "platformStats is anonymous and returns totalLearners, totalLessons, totalCourses and totalBadgesEarned - the only counters a signed-out page may read." },
  { source: "starci-academy-fe/src/modules/api/graphql/queries/query-user-profile.ts, query-profile-evidence.ts", claim: "Public profile and evidence reads carry withAuth: false, so real learner records can appear on a signed-out page." },
  { source: "starci-academy-fe/src/app/[lang]/page.tsx", claim: "There is no landing route today: the locale root redirects straight to /dashboard, so this is net-new rather than a repair." },
  { source: "starci-academy/src/messages/vi.json landing.hero", claim: "The legacy hero copy already exists and is reusable verbatim; only the composition beneath it was rejected." },
];

const SHARED_UNKNOWNS = [
  "Whether the landing page replaces the /dashboard redirect at the locale root or lives at its own path while the root keeps redirecting signed-in readers.",
  "Whether platformStats returns numbers large enough to be worth showing today; four small counters read as a young product rather than a proven one.",
  "Whether MicroservicesScene ports as-is: it is plain SVG with no dependency, but it was written against the legacy token names and frame components.",
];

const STATE_COVERAGE = (p) => [
  { ownerId: p + ":hero", state: "populated", coverage: "rendered", scenarioId: "default", evidence: "Copy exists in the legacy catalogue." },
  { ownerId: p + ":stats", state: "populated", coverage: "rendered", scenarioId: "default", evidence: "platformStats four scalars." },
  { ownerId: p + ":stats", state: "loading | failed | zeroed", coverage: "deferred-to-preview", evidence: "An anonymous query can still fail; a counter at zero is a truth the page must be able to say." },
  { ownerId: p + ":tracks", state: "populated", coverage: "rendered", scenarioId: "default", evidence: "Public courses query." },
  { ownerId: p + ":tracks", state: "loading | empty | failed", coverage: "deferred-to-preview", evidence: "Catalogue read has the usual three." },
];

window.STARCI_REVIEW = {
  title: "Landing page — what replaces the legacy composition",
  phase: "plan",
  deliveryMode: "single",
  mode: "creative",
  workItems: [
    { id: "page-landing", scope: "page", target: "src/components/pages/LandingPage + a route under src/app/[lang]" },
    { id: "block-scene", scope: "block", target: "src/components/blocks/marketing/MicroservicesScene (ported, not redesigned)" },
  ],
  evidence: SHARED_EVIDENCE,
  cases: [
    {
      id: "direction-one-promise",
      title: "A · One promise, one proof (posture: conservative)",
      thesis: "A landing page has one job: say what changes about the reader, and show one piece of evidence that it is true. Four surfaces, down from eight.",
      distinction: "The page argues once and stops. Nothing below the hero repeats the hero.",
      css: CASE_CSS,
      states: [{ id: "default", label: "Full page", covers: ["page-landing:populated"], html: A }],
      stateCoverage: STATE_COVERAGE("A"),
      blockTree: [
        "LandingPage",
        "├── hero            copy + CTAs | MicroservicesScene (KEPT)",
        "├── platform-stats  four anonymous counters",
        "├── track-list      three courses in learning order",
        "└── closing-cta     one repeat of the single action",
      ].join("\n"),
      contracts: SHARED_CONTRACTS,
      proposals: [
        { decision: "port", tier: "block", name: "MicroservicesScene", target: "src/components/blocks/marketing/MicroservicesScene/index.tsx", why: "The one visual the user kept. Plain SVG, no WebGL, no dependency - it ports rather than gets rebuilt.", tests: "renders without a client boundary" },
        { decision: "new", tier: "block", name: "PlatformStatStrip", target: "src/components/blocks/marketing/PlatformStatStrip/index.tsx", api: "connected; reads platformStats", why: "Four counters are one statement about the platform, and the only one a signed-out reader may be shown.", tests: "loading, failed, and a counter at zero" },
        { decision: "new", tier: "block", name: "TrackList", target: "src/components/blocks/marketing/TrackList/index.tsx", api: "props: { tracks }", why: "Courses in the order they must be taken is a different claim from a catalogue grid.", tests: "ordering preserved, empty catalogue" },
      ],
      backendEnablers: [],
      assumptions: ["The legacy hero copy is reused verbatim; only the arrangement beneath it was rejected."],
      unknowns: SHARED_UNKNOWNS,
    },
    {
      id: "direction-the-gap",
      title: "B · The gap (posture: balanced)",
      thesis: "Lead with the reader's own problem and let the kept visual carry it: the hero asks a question the isometric scene answers, and everything below closes that gap.",
      distinction: "The scene stops being decoration and becomes the argument - the red single-database node is the thing the reader cannot yet reason about.",
      css: CASE_CSS,
      states: [{ id: "default", label: "Full page", covers: ["page-landing:populated"], html: B }],
      stateCoverage: STATE_COVERAGE("B"),
      blockTree: [
        "LandingPage",
        "├── hero            question + CTAs | MicroservicesScene (KEPT, load-bearing)",
        "├── gap-contrast    what AI took | what is still yours",
        "├── track-list      three courses, each named against the gap",
        "└── closing-cta     start where you are stuck",
      ].join("\n"),
      contracts: SHARED_CONTRACTS.concat([
        { key: "two-column-contrast", why: "Two lists only mean something against each other, so they sit side by side and share one baseline rather than stacking as two independent claims." },
      ]),
      proposals: [
        { decision: "port", tier: "block", name: "MicroservicesScene", target: "src/components/blocks/marketing/MicroservicesScene/index.tsx", why: "Same port as A, but the hero copy now refers to it, so its labels become product copy rather than decoration.", tests: "same" },
        { decision: "new", tier: "contract", name: "two-column-contrast", target: "src/components/contracts/index.ts", api: "children: { before: { contract: 'evidence-title-over-subtitle' }, after: { contract: 'evidence-title-over-subtitle' } }", why: "The comparison is the content; two stacked cards would let a reader take one without the other.", tests: "both columns required" },
        { decision: "new", tier: "block", name: "TrackList", target: "src/components/blocks/marketing/TrackList/index.tsx", api: "same as A", why: "Same owner, different copy.", tests: "same as A" },
      ],
      backendEnablers: [],
      assumptions: ["A reader who can already read the diagram is not this page's audience, and losing them is acceptable."],
      unknowns: SHARED_UNKNOWNS.concat(["Whether the question-led hero reads as confident or as condescending; that is a copy judgement no lab can settle."]),
    },
    {
      id: "direction-proof-first",
      title: "C · Proof first (posture: bold)",
      thesis: "Open with people rather than promises: the platform already publishes real learner profiles, so the page shows three of them before it says anything about itself.",
      distinction: "The pitch comes after the evidence, and the evidence is records the reader can open and check.",
      css: CASE_CSS,
      states: [{ id: "default", label: "Full page", covers: ["page-landing:populated"], html: C }],
      stateCoverage: STATE_COVERAGE("C"),
      blockTree: [
        "LandingPage",
        "├── hero            claim + CTAs | MicroservicesScene (KEPT)",
        "├── public-proof    three real public profiles",
        "├── track-list      the path those three took",
        "└── platform-stats  counters, now supporting rather than leading",
      ].join("\n"),
      contracts: SHARED_CONTRACTS,
      proposals: [
        { decision: "port", tier: "block", name: "MicroservicesScene", target: "src/components/blocks/marketing/MicroservicesScene/index.tsx", why: "Same port as A.", tests: "same" },
        { decision: "new", tier: "block", name: "PublicProofRow", target: "src/components/blocks/marketing/PublicProofRow/index.tsx", api: "connected; reads userProfile + profileEvidence for a curated set of usernames", why: "A testimonial is a claim; a public profile is a record, and this platform already publishes them unauthenticated.", tests: "a profile with no evidence, a username that no longer resolves" },
        { decision: "new", tier: "block", name: "TrackList", target: "src/components/blocks/marketing/TrackList/index.tsx", api: "same as A", why: "Same owner.", tests: "same as A" },
      ],
      backendEnablers: [
        { classification: "read-projection", operationKind: "query", id: "featuredPublicProfiles", uiNeed: "The page needs a small, curated, ordered set of public profiles. Today the only honest way is to hardcode usernames in the frontend, which makes a marketing decision a deploy.", evidence: "userProfile and profileEvidence already expose exactly this data unauthenticated; this would select which ones, nothing more.", authorization: "anonymous, same as the reads it wraps", escalationTrigger: "If it needs to rank, score or personalise, it stops being a projection and returns to design." },
      ],
      assumptions: ["There are at least three public profiles today whose evidence is worth showing to a stranger."],
      unknowns: SHARED_UNKNOWNS.concat(["Nobody has counted how many public profiles carry real capstone evidence. If the answer is fewer than three, this direction is not selectable today."]),
    },
  ],
};
