(() => {
  const tabs = [
    ["overview", "⌂", "Overview"],
    ["projects", "↗", "Projects"],
    ["challenges", "◇", "Challenges"],
    ["skills", "⌘", "Skills"],
    ["cv", "▤", "CV"],
    ["activity", "⌁", "Activity"],
  ];

  const tabStrip = (active) => `
    <nav class="profile-tabs" aria-label="Public profile sections">
      ${tabs.map(([id, icon, label]) => `<button class="profile-tab${id === active ? " is-active" : ""}" type="button"><span aria-hidden="true">${icon}</span><span class="tab-label">${label}</span></button>`).join("")}
    </nav>`;

  const hero = (mode = "visitor") => `
    <aside class="profile-hero">
      <div class="avatar" aria-label="Avatar of Linh Nguyen">LN</div>
      <div class="identity"><h2>Linh Nguyen</h2><p>@linhnguyen · Frontend Engineer</p></div>
      <p class="bio">Building accessible product interfaces and documenting the decisions behind them.</p>
      <div class="chips"><span>Ho Chi Minh City</span><span>Hybrid</span></div>
      <div class="social-proof"><strong>248</strong><span>followers</span><strong>Top 8%</strong><span>coding</span></div>
      <div class="hero-actions"><button class="primary" type="button">${mode === "owner" ? "Edit profile" : "Hire me"}</button><button class="icon-button" type="button" aria-label="Share profile">↗</button></div>
      <hr><ul class="meta"><li>GitHub · linhnguyen</li><li>LinkedIn · linh-nguyen</li><li>Joined March 2024</li></ul>
    </aside>`;

  const metric = (value, label) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`;
  const bar = (percent) => `<div class="bar" aria-label="${percent}% complete"><i style="width:${percent}%"></i></div>`;
  const row = (title, meta, trailing = "") => `<li class="proof-row"><div><strong>${title}</strong><span>${meta}</span></div>${trailing ? `<b>${trailing}</b>` : ""}</li>`;
  const section = (label, body, fact = "") => `<section class="profile-section"><header><h3>${label}</h3>${fact ? `<span>${fact}</span>` : ""}</header>${body}</section>`;

  const overview = () => `
    ${section("Job readiness", `<div class="surface"><div class="metrics">${metric("Top 8%", "coding foundation")}${metric("Strong", "Frontend track")}${metric("82", "CV score")}</div></div>`)}
    ${section("Joined courses", `<ul class="surface joined-list">${row("Frontend Engineering", "18 of 24 content items · 6 challenges", "75%")}${row("Product UI Systems", "11 of 16 content items · 3 challenges", "64%")}</ul>`, "View activity")}
    ${section("Contributions", `<div class="surface calendar"><div class="calendar-grid">${Array.from({length:70}, (_,i)=>`<i class="heat h${i%5}"></i>`).join("")}</div><p>21 day current streak · 46 day longest streak</p></div>`)}
    <div class="two-col">${section("Skills from challenges", `<div class="surface"><div class="metrics">${metric("17", "passed")}${metric("4", "languages")}</div>${bar(78)}<p class="muted">TypeScript · Python · Java · SQL</p></div>`, "See all")}${section("Skills from practice", `<div class="surface"><div class="metrics">${metric("42", "solved")}${metric("#126", "global rank")}</div>${bar(66)}<p class="muted">Arrays · Graphs · Dynamic programming</p></div>`, "See all")}</div>`;

  const projects = () => `
    ${section("Pinned projects", `<div class="project-grid"><article class="surface project"><span class="badge">Verified by StarCi</span><h4>Commerce operations dashboard</h4><p>Role-based analytics and order workflow.</p><div class="chips"><span>Next.js</span><span>NestJS</span><span>PostgreSQL</span></div></article><article class="surface project"><span class="badge neutral">External</span><h4>Open-source design tokens</h4><p>Token pipeline shared across product teams.</p><div class="chips"><span>TypeScript</span><span>Style Dictionary</span></div></article></div>`, "2 selected")}
    ${section("Verified capstone work", `<ul class="surface joined-list">${row("Frontend Engineering", "4 of 5 milestones · 18 of 22 tasks", "82%")}${row("Product UI Systems", "3 of 4 milestones · 12 of 16 tasks", "75%")}${row("API Engineering", "2 of 5 milestones · 8 of 21 tasks", "38%")}</ul>`)}`;

  const challenges = () => `
    ${section("Challenge strength", `<div class="surface"><div class="metrics">${metric("17", "passed")}${metric("Top 12%", "strength")}${metric("#214", "rank")}${metric("1,840", "XP")}</div>${bar(88)}</div>`)}
    ${section("Passed submissions", `<ul class="surface joined-list">${row("Build a resilient checkout", "Frontend Engineering · TypeScript · Jul 28", "94")}${row("Rate-limited notifications", "API Engineering · Python · Jul 18", "88")}${row("Accessible command palette", "Product UI Systems · TypeScript · Jul 04", "91")}</ul>`, "Search and filter")}`;

  const skills = () => `
    ${section("Coding metrics", `<div class="surface"><div class="metrics">${metric("42", "solved")}${metric("3,280", "coding XP")}${metric("Top 8%", "percentile")}${metric("#126", "rank")}</div></div>`)}
    ${section("Stats", `<div class="surface breakdown"><div><strong>By difficulty</strong>${bar(72)}<p>Easy 18 · Medium 19 · Hard 5</p></div><div><strong>By topic</strong><div class="chips"><span>Arrays 12</span><span>Graphs 9</span><span>DP 7</span><span>Trees 6</span></div></div><div><strong>By language</strong>${bar(84)}<p>TypeScript 20 · Python 13 · Java 9</p></div></div>`)}
    ${section("Solve history", `<div class="toolbar"><input aria-label="Search solve history" placeholder="Search solved problems"><button type="button">Filters · 2</button></div><ul class="surface joined-list">${row("Shortest path with constraints", "Aug 03 · Graphs", "Hard")}${row("Windowed event aggregation", "Jul 31 · Arrays", "Medium")}${row("Tree path sums", "Jul 26 · Trees", "Medium")}</ul>`, "42 results")}`;

  const activity = () => `
    ${section("Earned achievements", `<div class="achievement-grid"><article class="surface achievement"><span>◆</span><strong>Challenge Specialist</strong><small>Rare · 6.4%</small></article><article class="surface achievement"><span>✦</span><strong>30 Day Builder</strong><small>Epic · 2.1%</small></article><article class="surface achievement"><span>●</span><strong>Consistent Learner</strong><small>Uncommon · 14%</small></article></div>`)}
    ${section("Activity", `<div class="timeline"><h4>Today</h4><ul class="surface joined-list">${row("Passed Accessible command palette", "2 hours ago", "♡ 8")}${row("Completed milestone Design system foundations", "5 hours ago", "♡ 12")}</ul><h4>Yesterday</h4><ul class="surface joined-list">${row("Solved Tree path sums", "Yesterday at 20:14", "♡ 5")}${row("Earned 30 Day Builder", "Yesterday at 09:40", "♡ 21")}</ul></div>`)}`;

  const cv = () => `${section("Public CV", `<div class="cv-actions"><button type="button">Edit CV</button></div><article class="cv-paper"><h2>Linh Nguyen</h2><p>Frontend Engineer · Ho Chi Minh City</p><hr><h3>Experience</h3><p><strong>Product Engineer · StarCi Lab</strong><br>Built typed component contracts and accessible learning journeys.</p><h3>Selected work</h3><p>Commerce operations dashboard · Open-source design tokens</p><h3>Skills</h3><p>TypeScript · React · Next.js · Design systems</p></article>`)}`;

  const detail = (kind) => {
    if (kind === "project") return `<div class="detail-head"><button type="button">← Projects</button><h2>Frontend Engineering capstone</h2><p>4 of 5 milestones · 18 of 22 tasks · Verified by StarCi</p>${bar(82)}</div>${section("Roadmap", `<ol class="surface joined-list roadmap"><li><b>✓ Foundation</b><span>5 of 5 tasks passed</span></li><li><b>✓ Core workflows</b><span>6 of 6 tasks passed</span></li><li><b>✓ Quality and delivery</b><span>4 of 5 tasks passed</span></li><li><b>○ Production hardening</b><span>3 of 6 tasks passed</span></li></ol>`)}`;
    if (kind === "challenge-course") return `<div class="detail-head"><button type="button">← Challenges</button><h2>Frontend Engineering submissions</h2><p>Search and filter passed work in this course.</p></div><div class="toolbar"><input placeholder="Search submissions"><button type="button">Filters · 1</button></div>${section("3 passed submissions", `<ul class="surface joined-list">${row("Accessible command palette", "TypeScript · Jul 04", "91")}${row("Build a resilient checkout", "TypeScript · Jul 28", "94")}${row("Offline form recovery", "TypeScript · Jun 21", "87")}</ul>`)}`;
    if (kind === "challenge-proof") return `<div class="detail-head"><button type="button">← Frontend Engineering</button><h2>Build a resilient checkout</h2><p>Hard · TypeScript · score 94 · passed July 28</p></div>${section("Submitted proof", `<div class="surface"><a href="#">github.com/linhnguyen/resilient-checkout</a></div>`)}${section("Attempts", `<ul class="surface joined-list">${row("Attempt 3 · Passed", "Jul 28 · Clear rollback strategy", "94")}${row("Attempt 2", "Jul 25 · Missing idempotency guard", "76")}${row("Attempt 1", "Jul 22 · Retry model incomplete", "61")}</ul>`)}${section("Structured feedback", `<ul class="surface joined-list">${row("Reliability", "Handles duplicate submissions and network recovery", "Strong")}${row("Accessibility", "Focus returns to the failed control", "Strong")}${row("Testing", "Add one timeout boundary case", "Improve")}</ul>`)}`;
    return `<div class="detail-head"><button type="button">← Skills</button><h2>Shortest path with constraints</h2><p>Hard · Graphs · solved August 03</p></div>${section("Solution proof", `<div class="surface code"><pre><code>function shortestPath(graph, budget) {\n  // Dijkstra with remaining-budget state\n  return solve(graph, budget)\n}</code></pre></div>`)}${section("Evidence", `<ul class="surface joined-list">${row("Accepted", "TypeScript · 184 ms", "Passed")}${row("Concepts", "Dijkstra · State compression", "2 topics")}</ul>`)}`;
  };

  const shell = (active, content, options = {}) => {
    if (options.state === "loading") return `<div class="profile-app"><div class="skeleton tabs-skeleton"></div><div class="profile-shell"><aside class="profile-hero skeleton hero-skeleton"></aside><main class="profile-main">${Array.from({length:4},()=>`<div class="skeleton block-skeleton"></div>`).join("")}</main></div></div>`;
    if (options.state === "private") return `<div class="profile-app">${tabStrip("overview")}<div class="locked-shell">${hero()}<section class="surface empty"><b>Private profile</b><h2>This profile is set to private</h2><p>The owner has hidden public activity. You can still explore StarCi content.</p><button class="primary" type="button">Browse content</button></section></div></div>`;
    if (options.state === "not-found") return `<div class="profile-app"><section class="surface empty standalone"><b>Profile not found</b><h2>We could not find this person</h2><p>The profile may have moved, been removed, or the link is incorrect.</p><button class="primary" type="button">Go home</button></section></div>`;
    return `<div class="profile-app${options.mobile ? " is-mobile" : ""}">${tabStrip(active)}<div class="profile-shell">${hero(options.owner ? "owner" : "visitor")}<main class="profile-main">${content}</main></div></div>`;
  };

  const proposals = [
    {
      decision: "new", tier: "layout", name: "PublicProfileLayout", target: null,
      reasonForDecision: "The username profile chrome survives tab/detail navigation and owns profile visibility, canonicalization and contextual actions; no current layout owns that domain.",
      publicApi: { props: { body: "ContractComponent<'profile-main'>" }, on: {} }, apiDelta: null,
      affectedCallers: [], compatibility: "Adds a new route-stable owner; existing routes are unchanged.", tests: ["screen-state priority", "tab gating", "canonical username", "narrow stacking"]
    },
    {
      decision: "new", tier: "block", name: "ProfileHero", target: null,
      reasonForDecision: "The full identity, proof and contextual CTA sentence is not the compact ProfileRow navigation sentence.",
      publicApi: { props: { state: "pending | ready", user: "resolved profile facts", action: "resolved contextual action" }, on: { primary: "() => void", share: "() => void", openExternal: "(url) => void" } }, apiDelta: null,
      affectedCallers: [], compatibility: "No existing component changes.", tests: ["single CTA precedence", "optional fact omission", "loading geometry"]
    },
    {
      decision: "extend", tier: "leaf", name: "ExtendedTabs", target: "ExtendedTabs", targetPath: "src/components/leaves/ExtendedTabs/index.tsx",
      reasonForDecision: "Only if apply proves the current leaf cannot preserve the legacy icon-visible/label-hidden narrow state; the leaf already owns tab anatomy and the label slot.",
      publicApi: { props: { labelVisibility: "'always' | 'wide' | undefined" }, on: {} },
      apiDelta: { propsAdded: [{ name: "labelVisibility", type: "'always' | 'wide' | undefined", meaning: "when a tab label remains readable beside its persistent glyph", placement: "the existing label span", absenceOrDefault: "always; existing output unchanged", precedence: "does not affect icon visibility or selection" }], onAdded: [] },
      affectedCallers: ["DashboardPage"], compatibility: "Omission preserves every current caller.", tests: ["default labels unchanged", "wide mode hides labels only below profile breakpoint"]
    },
    {
      decision: "new", tier: "contract", name: "profile-tabs-over-body", target: null,
      reasonForDecision: "Dashboard's same-looking key has a Dashboard-specific name and child grammar; a truthful profile key owns tab chrome over the rail/main body without borrowing that domain.",
      publicApi: { props: { tabs: "underlined-tab-strip", body: "rail-then-main" }, on: {} }, apiDelta: null,
      affectedCallers: [], compatibility: "Adds one closed contract key.", tests: ["wrong tab/body identities fail typecheck", "body remains sibling of profile chrome"]
    }
  ];

  window.STARCI_REVIEW = {
    title: "Public profile cluster — legacy parity",
    scope: "batch · layout + pages + blocks",
    mode: "migration/parity",
    evidence: [
      { source: "D:/Repositories/starci-academy", claim: "Legacy routes and source bind hierarchy, behavior and responsive relationships." },
      { source: "D:/Repositories/starci-academy-backend", claim: "Profile, proof, activity and CV GraphQL capabilities are executable business evidence." },
      { source: "D:/Repositories/starci-academy-fe", claim: "Current contracts/components bind target architecture and reuse." }
    ],
    cases: [{
      id: "case-parity-a",
      title: "Proof rail parity",
      thesis: "Keep identity and the contextual action continuously visible while each proof family remains a shareable route.",
      distinction: "One binding migration case: tabs above a stable identity rail and independently landing evidence panel; no unrequested redesign alternatives.",
      states: [
        { id: "overview", label: "Overview", html: shell("overview", overview()) },
        { id: "projects", label: "Projects", html: shell("projects", projects(), { owner: true }) },
        { id: "project-detail", label: "Project detail", html: shell("projects", detail("project")) },
        { id: "challenges", label: "Challenges", html: shell("challenges", challenges()) },
        { id: "challenge-course", label: "Challenge course", html: shell("challenges", detail("challenge-course")) },
        { id: "challenge-proof", label: "Challenge proof", html: shell("challenges", detail("challenge-proof")) },
        { id: "skills", label: "Skills", html: shell("skills", skills()) },
        { id: "coding-proof", label: "Coding proof", html: shell("skills", detail("coding-proof")) },
        { id: "cv", label: "Public CV", html: shell("cv", cv(), { owner: true }) },
        { id: "activity", label: "Activity", html: shell("activity", activity()) },
        { id: "loading", label: "Loading", html: shell("overview", "", { state: "loading" }) },
        { id: "private", label: "Private", html: shell("overview", "", { state: "private" }) },
        { id: "not-found", label: "Not found", html: shell("overview", "", { state: "not-found" }) },
        { id: "mobile", label: "Mobile", html: shell("overview", overview(), { mobile: true }) },
      ],
      blockTree: "PublicProfileLayout (layout)\n├── ProfileTabs (block)\n└── profile-tabs-over-body (contract)\n    ├── ProfileHero (block)\n    └── Routed Profile*Page (page)\n        └── independently connected evidence blocks\n            ├── SurfaceCard / SurfaceListCard (branches)\n            ├── proof rows / calendars / metrics (composites)\n            └── Avatar / Text / Button / Badge / Progress (leaves)",
      contracts: [
        { key: "profile-tabs-over-body", why: "The route strip remains profile chrome above the identity/evidence body, so changing proof routes never remounts or duplicates identity." },
        { key: "rail-then-main", why: "The identity rail keeps a stable reading width beside flexible evidence, then stacks first on narrow screens." },
        { key: "stacked-sections", why: "Independent evidence families remain separate objects and may land without waiting for siblings." },
        { key: "label-row-over-card", why: "A profile evidence label names its bounded surface without introducing card-inside-card nesting." },
        { key: "activity-feed-list", why: "Chronological activity peers share one joined list while each row retains actor, sentence, time and reaction identity." }
      ],
      proposals,
      assumptions: ["The source-mounted PublicProfileLayout version is the binding legacy component.", "Owner-empty guidance retains current legacy copy intent pending runtime copy comparison."],
      unknowns: ["Exact authenticated legacy pixels at desktop/mobile/dark mode are not yet observed.", "The legacy Overview course 'See all' destination appears inconsistent and needs product confirmation before changing.", "Pinned-project management and private CV editing are separate design batches."],
      css: `
        .profile-app{max-width:1180px;margin:auto;color:#182033;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.profile-tabs{display:grid;grid-template-columns:repeat(6,1fr);border-bottom:1px solid #dfe4ec;background:#fff}.profile-tab{display:flex;justify-content:center;align-items:center;gap:.5rem;padding:.9rem .6rem;border:0;border-bottom:3px solid transparent;background:transparent;color:#647087;font-weight:650;cursor:pointer}.profile-tab.is-active{border-color:#6c4df7;color:#32256b}.profile-shell{display:grid;grid-template-columns:288px minmax(0,1fr);gap:24px;padding:24px;background:#f5f7fb}.profile-hero,.surface{border:1px solid #e1e5ed;border-radius:18px;background:#fff;box-shadow:0 10px 28px rgba(25,35,58,.06)}.profile-hero{align-self:start;padding:24px;display:grid;gap:16px}.avatar{width:84px;height:84px;border:4px solid #ece7ff;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#6c4df7,#29b7af);color:#fff;font-size:1.45rem;font-weight:800}.identity h2,.identity p,.bio,.meta,.surface p,.detail-head p{margin:0}.identity p,.bio,.meta,.muted,.proof-row span,.profile-section header span,.breakdown p,.timeline h4,.detail-head p{color:#68748a}.chips{display:flex;flex-wrap:wrap;gap:8px}.chips span,.badge{border-radius:999px;background:#f0edff;color:#4c35b3;padding:.32rem .62rem;font-size:.75rem;font-weight:700}.badge.neutral{background:#eef1f5;color:#586477}.social-proof{display:grid;grid-template-columns:auto 1fr auto 1fr;align-items:baseline;gap:4px 8px}.social-proof strong{font-size:1.15rem}.social-proof span{font-size:.75rem;color:#68748a}.hero-actions{display:grid;grid-template-columns:1fr auto;gap:10px}.primary,.icon-button,.toolbar button,.cv-actions button,.detail-head button{border:0;border-radius:12px;padding:.7rem .9rem;font-weight:750;cursor:pointer}.primary{background:#6c4df7;color:#fff}.icon-button,.toolbar button,.cv-actions button,.detail-head button{background:#eef0f5;color:#29344a}.meta{display:grid;gap:8px;padding:0;list-style:none;font-size:.82rem}.profile-main{min-width:0;display:grid;gap:24px}.profile-section{display:grid;gap:10px}.profile-section>header{display:flex;align-items:baseline;justify-content:space-between;gap:12px}.profile-section h3{margin:0;font-size:.95rem}.surface{padding:18px}.joined-list{padding:0;overflow:hidden;list-style:none;margin:0}.proof-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 18px}.proof-row+ .proof-row{border-top:1px solid #e7eaf0}.proof-row div{min-width:0;display:grid;gap:4px}.proof-row strong{font-size:.9rem}.proof-row span,.proof-row b{font-size:.76rem}.proof-row b{color:#5a42ca}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.metric{display:grid;gap:4px;padding:12px;border-radius:14px;background:#f6f7fa}.metric strong{font-size:1.12rem}.metric span{font-size:.72rem;color:#69758a}.bar{height:8px;border-radius:999px;background:#eceff4;overflow:hidden;margin-top:12px}.bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#6c4df7,#27b7ad)}.calendar-grid{display:grid;grid-template-columns:repeat(14,1fr);gap:5px}.heat{aspect-ratio:1;border-radius:3px;background:#edf0f4}.heat.h1{background:#ddd7ff}.heat.h2{background:#bdb1ff}.heat.h3{background:#8f7cff}.heat.h4{background:#6245e5}.calendar p{font-size:.78rem;margin-top:12px}.two-col,.project-grid,.achievement-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.project-grid,.achievement-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.project h4{margin:12px 0 6px}.project p{font-size:.82rem;margin-bottom:14px}.breakdown{display:grid;gap:18px}.achievement-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.achievement{display:grid;gap:6px}.achievement>span{font-size:1.5rem;color:#6c4df7}.achievement small{color:#68748a}.timeline{display:grid;gap:10px}.timeline h4{margin:6px 0 0;font-size:.78rem}.toolbar{display:grid;grid-template-columns:1fr auto;gap:10px}.toolbar input{min-width:0;border:1px solid #dce1e9;border-radius:12px;padding:.75rem;background:#fff}.cv-actions{display:flex;justify-content:flex-end;margin-bottom:10px}.cv-paper{min-height:560px;max-width:680px;margin:auto;padding:48px 54px;background:#fff;border:1px solid #dfe4ec;box-shadow:0 16px 40px rgba(25,35,58,.12)}.cv-paper h2{margin:0}.cv-paper h3{margin-top:28px}.detail-head{display:grid;gap:10px}.detail-head button{width:max-content}.detail-head h2{margin:0}.roadmap li{display:grid;gap:5px;padding:16px 18px}.roadmap li+li{border-top:1px solid #e7eaf0}.roadmap span{font-size:.78rem;color:#68748a}.code{background:#171b25;color:#f3f5fb;overflow:auto}.code pre{margin:0}.locked-shell{display:grid;grid-template-columns:288px 1fr;gap:24px;padding:24px;background:#f5f7fb}.empty{text-align:center;display:grid;justify-items:center;gap:10px;padding:48px}.standalone{max-width:620px;margin:80px auto}.skeleton{position:relative;overflow:hidden;border-radius:16px;background:#e8ebf1}.skeleton:after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.72),transparent);animation:shimmer 1.4s infinite}.tabs-skeleton{height:56px}.hero-skeleton{min-height:490px}.block-skeleton{height:150px}@keyframes shimmer{to{transform:translateX(100%)}}.profile-app.is-mobile{max-width:430px}.profile-app.is-mobile .profile-shell{grid-template-columns:1fr;padding:14px}.profile-app.is-mobile .tab-label{display:none}.profile-app.is-mobile .profile-tab{font-size:1.1rem}.profile-app.is-mobile .metrics,.profile-app.is-mobile .two-col,.profile-app.is-mobile .project-grid,.profile-app.is-mobile .achievement-grid{grid-template-columns:1fr 1fr}.profile-app.is-mobile .profile-hero{grid-template-columns:auto 1fr}.profile-app.is-mobile .bio,.profile-app.is-mobile .chips,.profile-app.is-mobile .social-proof,.profile-app.is-mobile .hero-actions,.profile-app.is-mobile hr,.profile-app.is-mobile .meta{grid-column:1/-1}@media(max-width:760px){.profile-shell,.locked-shell{grid-template-columns:1fr}.tab-label{display:none}.metrics{grid-template-columns:1fr 1fr}.two-col,.project-grid,.achievement-grid{grid-template-columns:1fr}.profile-hero{position:static}}
      `
    }]
  };
})();
