(() => {
  const html = `
    <div class="site-shell">
      <header class="global-nav" data-owner="existing-global-shell">
        <strong><span class="brand-mark">C.</span> StarCi <small>Academy</small></strong>
        <nav><b>Home</b><span>Courses</span><span>Contact</span></nav>
        <div class="global-actions"><span>Search &nbsp; Ctrl K</span><i>文</i><i>◐</i><i>🛒</i><i>♙</i></div>
      </header>
      <section class="profile-system">
        <input checked type="radio" name="profile-tab" id="tab-overview">
        <input type="radio" name="profile-tab" id="tab-projects">
        <input type="radio" name="profile-tab" id="tab-challenges">
        <input type="radio" name="profile-tab" id="tab-skills">
        <input type="radio" name="profile-tab" id="tab-cv">
        <input type="radio" name="profile-tab" id="tab-activity">
        <nav class="profile-tabs" aria-label="Public profile sections">
          <label for="tab-overview">⌂ <span>Overview</span></label>
          <label for="tab-projects">▱ <span>Projects</span></label>
          <label for="tab-challenges">▣ <span>Challenges</span></label>
          <label for="tab-skills">⌁ <span>Skills</span></label>
          <label for="tab-cv">▯ <span>CV</span></label>
          <label for="tab-activity">♧ <span>Activity</span></label>
        </nav>

        <div class="profile-body">
          <aside class="profile-hero" data-rule="frameless-identity-rail">
            <div class="avatar">C</div>
            <h2>cuongnvtse160875</h2>
            <p class="handle">@cuongnvtse160875</p>
            <p>Learning backend systems one small win at a time.</p>
            <p><strong>0</strong> followers&nbsp;&nbsp; <strong>5</strong> following</p>
            <div class="hero-actions"><button>Edit profile</button><button aria-label="Share profile">▷</button></div>
            <a>◉ &nbsp;GitHub</a>
            <small>Joined August 2026</small>
          </aside>

          <main class="profile-main">
            <section class="panel overview-panel">
              <div class="section"><h3>Job readiness</h3><div class="surface rows"><div><b>Fullstack track</b><span>Evidence updates from real course progress</span><em>In progress</em></div></div></div>
              <div class="section"><header><h3>Joined courses</h3><a>See more</a></header><div class="surface rows"><div><b>Fullstack Mastery</b><span>8 / 95 content · 3 passed challenges</span><em>8%</em></div></div></div>
              <div class="section"><h3>Contributions</h3><div class="surface contribution"><p>14 learning events across 8 days</p><div class="heat">${Array.from({length: 84}, (_, i) => `<i class="h${i > 70 ? (i % 4) + 1 : 0}"></i>`).join("")}</div><b>8-day activity window</b></div></div>
              <div class="two-up">
                <div class="section"><header><h3>Skills from challenges</h3><a>See more</a></header><div class="surface snapshot"><b>3 passed</b><div class="segments"><i style="flex:3"></i></div><span>TypeScript · 3</span></div></div>
                <div class="section"><header><h3>Skills from practice</h3><a>See more</a></header><div class="surface snapshot"><b>3 solved</b><div class="segments coding"><i style="flex:3"></i></div><span>Arrays · Sorting · Dynamic programming</span></div></div>
              </div>
            </section>

            <section class="panel projects-panel">
              <div class="section"><header><h3>Pinned projects</h3><a>Add / manage</a></header><div class="project-grid"><article class="project-card"><small>Verified by StarCi</small><b>Fullstack Mastery</b><p>StarCi Shop personal project</p><div class="chips"><span>NestJS</span><span>Next.js</span><span>PostgreSQL</span></div></article></div></div>
              <div class="section"><h3>Verified capstone work</h3><div class="surface rows"><div><b>Fullstack Mastery</b><span>0 / 20 milestones · 2 / 100 tasks</span><em>2%</em></div></div></div>
              <div class="detail-note"><b>Detail route preserves this shell</b><span>Back link → course summary/progress → milestone list → authored task rows. No new dashboard card.</span></div>
            </section>

            <section class="panel challenges-panel">
              <div class="section"><h3>Challenge strength</h3><div class="metrics surface"><div><b>3</b><span>passed</span></div><div><b>276</b><span>XP ledger</span></div></div></div>
              <div class="section"><h3>Stats</h3><div class="surface stats"><b>By difficulty</b><div class="segments"><i style="flex:3"></i></div><b>By language</b><div class="segments language"><i style="flex:3"></i></div></div></div>
              <div class="section"><h3>Passed submissions</h3><div class="surface course-group"><button><b>Fullstack Mastery</b><span>3 passed · TypeScript</span><em>⌄</em></button><div class="rows"><div><b>Wire the request-lifecycle pipeline and wrap a response envelope</b><span>TypeScript · score 96</span></div><div><b>Swap implementations via DI and configure at compose time</b><span>TypeScript · score 92</span></div><div><b>Reuse a service across two areas via Dependency Injection</b><span>TypeScript · score 88</span></div></div></div></div>
              <div class="detail-note"><b>Two proven detail tiers</b><span>Course route owns search/filter; submission route owns URL, attempts and structured feedback.</span></div>
            </section>

            <section class="panel skills-panel">
              <div class="section"><h3>Coding metrics</h3><div class="metrics surface"><div><b>3</b><span>solved</span></div><div><b>30</b><span>coding XP</span></div></div></div>
              <div class="section"><h3>Stats</h3><div class="surface stats"><b>By difficulty</b><div class="segments"><i style="flex:3"></i></div><span>Medium · 3</span><b>By topic</b><div class="chips"><span>Arrays 3</span><span>Sorting 2</span><span>Dynamic programming 1</span></div><b>By language</b><div class="segments language"><i style="flex:3"></i></div><span>TypeScript · 3</span></div></div>
              <div class="section"><header><h3>Solve history</h3><span>3 results</span></header><div class="toolbar"><input placeholder="Search solved problems"><button>Filters</button></div><div class="surface rows"><div><b>Maximum Subarray</b><span>Medium · arrays · TypeScript</span></div><div><b>Longest Consecutive Sequence</b><span>Medium · hashing · TypeScript</span></div><div><b>Insert Interval</b><span>Medium · greedy · TypeScript</span></div></div></div>
              <div class="detail-note"><b>Coding detail never shows source code</b><span>Legacy and API expose problem statement/tags plus accepted verdict, languages, testcase count and solved date only.</span></div>
            </section>

            <section class="panel cv-panel">
              <div class="section"><header><h3>Public CV</h3><button>Edit CV</button></header><div class="cv-paper"><h2>Public CV states stay distinct</h2><p>No public CV · public but not compiled · compiled PDF · request failed.</p><hr><p>The compiled branch is an A4-proportioned PDF iframe, not a generic profile card.</p></div></div>
            </section>

            <section class="panel activity-panel">
              <div class="section"><h3>Achievements</h3><div class="surface badge-wall"><div>◆<b>Baby Duckling</b><span>8 / threshold</span></div><div>◇<b>Bug Hunting Chameleon</b><span>3 accepted</span></div><div class="locked">○<b>Next badge</b><span>Locked · progress retained</span></div></div></div>
              <div class="section"><h3>Recent activity</h3><div class="timeline"><b>Today</b><div class="surface rows"><div><b>Read The document model and ODM</b><span>Content activity · today</span></div></div><b>Earlier</b><div class="surface rows"><div><b>Solved Maximum Subarray</b><span>Coding activity · 2 days ago</span></div><div><b>Passed Wire the request-lifecycle pipeline</b><span>Challenge activity · 3 days ago</span></div></div></div></div>
              <div class="detail-note"><b>Contributions ≠ Activity tab</b><span>Overview shows calendar density and streak; this tab shows earned badge wall then chronological feed.</span></div>
            </section>
          </main>
        </div>
      </section>
    </div>`;

  const selectTab = (source, tab) => source
    .replace(/ checked type="radio"/g, " type=\"radio\"")
    .replace(`type="radio" name="profile-tab" id="tab-${tab}"`, `checked type="radio" name="profile-tab" id="tab-${tab}"`);
  const visitor = html
    .replace("<button>Edit profile</button>", "<button>Follow</button>")
    .replace('<label for="tab-cv">▯ <span>CV</span></label>', "")
    .replace("<strong>5</strong> following", "<strong>5</strong> following · visitor view");
  const layoutLoading = `<div class="site-shell"><header class="global-nav"><strong><span class="brand-mark">C.</span> StarCi <small>Academy</small></strong></header><div class="loading-layout"><div class="skeleton tabs-skeleton"></div><div class="loading-body"><aside class="skeleton hero-skeleton"></aside><main><div class="skeleton section-skeleton"></div><div class="skeleton section-skeleton"></div><div class="skeleton section-skeleton short"></div></main></div></div></div>`;
  const notFound = `<div class="site-shell"><header class="global-nav"><strong><span class="brand-mark">C.</span> StarCi <small>Academy</small></strong></header><div class="situation"><span>Profile not found</span><h2>We couldn't find this profile.</h2><p>The profile may have moved, been removed, or the URL is incorrect.</p><button>Go home</button></div></div>`;
  const locked = `<div class="site-shell"><header class="global-nav"><strong><span class="brand-mark">C.</span> StarCi <small>Academy</small></strong></header><div class="locked-layout"><aside class="profile-hero"><div class="avatar">C</div><h2>cuongnvtse160875</h2><p class="handle">@cuongnvtse160875</p></aside><div class="situation"><span>Private profile</span><h2>This profile is private.</h2><p>The owner has hidden their public evidence.</p><button>Browse content</button></div></div></div>`;
  const partialError = html.replace('<div class="surface contribution"><p>14 learning events across 8 days</p>', '<div class="surface recoverable"><b>Contributions could not load</b><p>Joined courses and both skill snapshots remain available.</p><button>Try again</button>');
  const projectsEmpty = selectTab(html, "projects").replace('<div class="project-grid"><article class="project-card"><small>Verified by StarCi</small><b>Fullstack Mastery</b><p>StarCi Shop personal project</p><div class="chips"><span>NestJS</span><span>Next.js</span><span>PostgreSQL</span></div></article></div>', '<div class="surface empty-state"><b>No pinned projects yet</b><p>Pin a verified course project or an external project.</p><button>Add project</button></div>');
  const projectDetail = selectTab(html, "projects").replace(/<section class="panel projects-panel">[\s\S]*?<\/section>\s*<section class="panel challenges-panel">/, `<section class="panel projects-panel"><div class="detail-head"><button>← Projects</button><h2>Fullstack Mastery</h2><p>0 / 20 milestones · 2 / 100 authored tasks</p><div class="segments coding"><i style="flex:2"></i><span style="flex:98"></span></div></div><div class="section"><h3>Project roadmap</h3><div class="surface rows"><div><b>Project Foundation</b><span>2 / 5 tasks passed</span><em>40%</em></div><div><b>Frontend Setup</b><span>0 / 5 tasks passed</span><em>0%</em></div><div><b>Authentication and authorization</b><span>0 / 5 tasks passed</span><em>0%</em></div></div></div></section><section class="panel challenges-panel">`);
  const challengeCourse = selectTab(html, "challenges").replace(/<section class="panel challenges-panel">[\s\S]*?<\/section>\s*<section class="panel skills-panel">/, `<section class="panel challenges-panel"><div class="detail-head"><button>← Challenges</button><h2>Fullstack Mastery submissions</h2><p>3 passed submissions</p></div><div class="toolbar"><input placeholder="Search submissions"><button>Filters</button></div><div class="surface rows"><div><b>Wire the request-lifecycle pipeline</b><span>TypeScript · score 96</span></div><div><b>Swap implementations via DI</b><span>TypeScript · score 92</span></div><div><b>Reuse a service across two areas</b><span>TypeScript · score 88</span></div></div></section><section class="panel skills-panel">`);
  const challengeProof = selectTab(html, "challenges").replace(/<section class="panel challenges-panel">[\s\S]*?<\/section>\s*<section class="panel skills-panel">/, `<section class="panel challenges-panel"><div class="detail-head"><button>← Fullstack Mastery</button><h2>Wire the request-lifecycle pipeline and wrap a response envelope</h2><p>Passed · score 96 · TypeScript</p></div><div class="section"><h3>Submitted proof</h3><div class="surface proof-url">github.com/starci-lab/fullstack-mastery/tree/profile-proof-3</div></div><div class="section"><h3>Attempts</h3><div class="surface rows"><div><b>Attempt 1 · Passed</b><span>Passed against the authored challenge criteria.</span><em>96</em></div></div></div><div class="section"><h3>Structured feedback</h3><div class="surface rows"><div><b>Outcome</b><span>Response envelope and lifecycle pipeline satisfy the rubric.</span></div><div><b>Approach</b><span>Layer boundaries and dependency injection remain explicit.</span></div></div></div></section><section class="panel skills-panel">`);
  const codingProof = selectTab(html, "skills").replace(/<section class="panel skills-panel">[\s\S]*?<\/section>\s*<section class="panel cv-panel">/, `<section class="panel skills-panel"><div class="detail-head"><button>← Skills</button><h2>Maximum Subarray</h2><p>Medium · arrays · dynamic programming</p></div><div class="section"><h3>Problem statement</h3><div class="surface statement">Given an integer array, find the contiguous subarray with the largest sum.</div></div><div class="chips"><span>arrays</span><span>dynamicProgramming</span><span>kadane</span><span>prefixSum</span></div><div class="section"><h3>Accepted submission</h3><div class="surface rows"><div><b>Accepted</b><span>TypeScript · 12 / 12 testcases · solved 2 days ago</span><em>24 ms</em></div></div></div><div class="detail-note"><b>No source code</b><span>The public API intentionally does not return it.</span></div></section><section class="panel cv-panel">`);
  const cvUncompiled = selectTab(html, "cv").replace('<div class="cv-paper"><h2>Public CV states stay distinct</h2><p>No public CV · public but not compiled · compiled PDF · request failed.</p><hr><p>The compiled branch is an A4-proportioned PDF iframe, not a generic profile card.</p></div>', '<div class="cv-paper uncompiled"><h2>CV is public but not compiled yet</h2><p>Compile the CV before a PDF can be embedded here.</p></div>');
  const activityPaging = selectTab(html, "activity").replace('<div class="detail-note"><b>Contributions ≠ Activity tab</b>', '<button class="load-more" disabled>Loading more activity…</button><div class="detail-note"><b>Contributions ≠ Activity tab</b>');
  const pendingFollow = visitor.replace("<button>Follow</button>", '<button disabled aria-label="Follow profile">Following…</button>');
  const mobile = html.replace('<div class="site-shell">', '<div class="site-shell force-mobile">');

  window.STARCI_REVIEW = {
    title: "Whole public profile · strict legacy parity",
    deliveryMode: "batch",
    mode: "migration/parity",
    workItems: [
      { id: "layout-public-profile", scope: "layout", target: "/profile/[username]/**" },
      { id: "profile-route-cluster", scope: "page", target: "Overview, Projects, Challenges, Skills, CV, Activity and detail routes" }
    ],
    evidence: [
      { source: "D:/Repositories/starci-academy", claim: "Mounted legacy layout and Profile*Page source bind hierarchy, responsive relationships, state ownership and progressive disclosure." },
      { source: "D:/Repositories/starci-academy-backend", claim: "Fullstack Mastery provides 23 modules, 95 content items, 348 challenges, 20 milestones and 100 authored project tasks." },
      { source: "local database seed 2026-08-12", claim: "cuongnvtse160875 now has one real course pin, 8 reads, 3 passed challenges, 3 accepted coding problems, 2 passed project tasks and 14 activity events." },
      { source: "current localhost render", claim: "The target implementation crashes when a course pin has nullable techStack, proving current generic card assumptions are not legacy-safe." }
    ],
    cases: [{
      id: "strict-parity",
      title: "One profile system · strict parity",
      thesis: "Reuse the unchanged global shell; keep profile tabs above a frameless identity rail and route-owned evidence, with the exact legacy block order and no page-local redesign.",
      distinction: "This is the only direction. Use the tabs inside the rendered concept to inspect every top-level profile route in the same persistent layout.",
      states: [
        { id: "seeded-owner", label: "Owner · populated", covers: ["layout:ready-owner", "all-tabs:populated"], html },
        { id: "visitor", label: "Visitor · gated tabs", covers: ["layout:ready-visitor", "hero:follow-ready"], html: visitor },
        { id: "pending-follow", label: "Visitor · follow pending", covers: ["hero:pending-action", "hero:disabled-action"], html: pendingFollow },
        { id: "layout-loading", label: "Layout · loading", covers: ["layout:loading"], html: layoutLoading },
        { id: "not-found", label: "Layout · not found", covers: ["layout:not-found"], html: notFound },
        { id: "locked", label: "Layout · locked visitor", covers: ["layout:locked"], html: locked },
        { id: "mobile", label: "Layout · mobile", covers: ["layout:mobile", "tabs:collapsed"], html: mobile },
        { id: "partial-error", label: "Overview · partial error", covers: ["overview:partial", "contributions:recoverable-error"], html: partialError },
        { id: "projects-empty", label: "Projects · owner empty", covers: ["pinned:empty-owner"], html: projectsEmpty },
        { id: "project-detail", label: "Project · roadmap", covers: ["project-detail:ready"], html: projectDetail },
        { id: "challenge-course", label: "Challenges · course", covers: ["challenge-course:ready", "challenge-filter:ready"], html: challengeCourse },
        { id: "challenge-proof", label: "Challenges · proof", covers: ["challenge-proof:ready"], html: challengeProof },
        { id: "coding-proof", label: "Skills · coding proof", covers: ["coding-proof:solved"], html: codingProof },
        { id: "cv-uncompiled", label: "CV · not compiled", covers: ["cv:uncompiled"], html: cvUncompiled },
        { id: "activity-paging", label: "Activity · pagination", covers: ["activity:pending-action", "activity:disabled-action"], html: activityPaging }
      ],
      stateCoverage: [
        { ownerId: "layout-public-profile", state: "ready owner/visitor, loading, not-found, locked, mobile", coverage: "rendered", scenarioId: "seeded-owner/visitor/layout-loading/not-found/locked/mobile", evidence: "Legacy layout state priority and RailShell breakpoint." },
        { ownerId: "profile-hero", state: "ready and pending/disabled action", coverage: "rendered", scenarioId: "visitor/pending-follow", evidence: "Follow mutation owns pending state and duplicate-action lock." },
        { ownerId: "profile-tabs", state: "active, visitor-gated and mobile collapse", coverage: "rendered", scenarioId: "seeded-owner/visitor/mobile", evidence: "Legacy tab visibility and narrow label behavior." },
        { ownerId: "profile-overview", state: "populated and partial availability", coverage: "rendered", scenarioId: "seeded-owner/partial-error", evidence: "Independent legacy blocks must not collapse siblings." },
        { ownerId: "profile-projects", state: "populated, owner empty and roadmap ready", coverage: "rendered", scenarioId: "seeded-owner/projects-empty/project-detail", evidence: "Legacy owner-empty policy and detail route." },
        { ownerId: "profile-projects", state: "visitor empty", coverage: "covered-by", scenarioId: "visitor", evidence: "Legacy hides the pinned block for settled-empty visitors." },
        { ownerId: "profile-challenges", state: "list, course filter and proof detail", coverage: "rendered", scenarioId: "seeded-owner/challenge-course/challenge-proof", evidence: "Legacy three route tiers." },
        { ownerId: "profile-skills", state: "metrics/stats/history and solved proof", coverage: "rendered", scenarioId: "seeded-owner/coding-proof", evidence: "Legacy coding routes; proof excludes source code." },
        { ownerId: "profile-cv", state: "uncompiled", coverage: "rendered", scenarioId: "cv-uncompiled", evidence: "Seeded user has no compiled public PDF; explicit legacy branch." },
        { ownerId: "profile-cv", state: "compiled PDF", coverage: "not-applicable", scenarioId: null, evidence: "No compiled public CV exists for the locked seeded account; must use a separate authorized fixture before Apply." },
        { ownerId: "profile-activity", state: "populated and pagination pending", coverage: "rendered", scenarioId: "seeded-owner/activity-paging", evidence: "Legacy achievement block precedes infinite feed." },
        { ownerId: "route-detail-pages", state: "missing entity", coverage: "covered-by", scenarioId: "not-found", evidence: "Same route-local recovery anatomy and back-path obligation; exact copy is verified during Apply." },
        { ownerId: "all-query-blocks", state: "terminal/unavailable error", coverage: "covered-by", scenarioId: "partial-error", evidence: "Recoverable error anatomy shown; terminal errors have no additional authorized action." },
        { ownerId: "pinned-project-overlay", state: "closed/open/validation/submitting/success/backend-error/focus-return", coverage: "not-applicable", scenarioId: null, evidence: "Pinned-project management was explicitly excluded from this profile batch; only its owner exit remains." }
      ],
      blockTree: "ExistingGlobalShell (unchanged)\n└── PublicProfileLayout\n    ├── ProfileTabsBar\n    └── RailShell\n        ├── ProfileHero (frameless identity rail)\n        └── routed Profile*Page\n            └── legacy self-fetching blocks and detail tiers",
      contracts: [
        { key: "profile-tabs-over-body", why: "Profile route chrome stays above both identity and evidence; it must not be split into a page-local second navigation system." },
        { key: "rail-then-main", why: "Identity remains a frameless stable-width rail beside flexible route evidence and stacks before it on narrow screens." },
        { key: "stacked-sections", why: "Major evidence owners land independently and retain legacy block order." },
        { key: "label-row-over-card", why: "A section label stays outside its bounded surface; no red-box wrapper or extra outer card is added." },
        { key: "activity-feed-list", why: "Chronological activity uses grouped rows; the contribution calendar remains a different overview block." }
      ],
      proposals: [],
      backendEnablers: [],
      assumptions: [],
      unknowns: ["Compiled public-CV PDF requires a separate authorized fixture.", "Light theme is supported globally but legacy screenshots and current selected profile theme are dark; exact light-token parity remains an Apply verification."],
      css: `
        *{box-sizing:border-box}.site-shell{min-height:100%;background:#050505;color:#f5f5f5;font:14px Inter,ui-sans-serif,system-ui}.global-nav{height:76px;display:flex;align-items:center;gap:42px;padding:0 26px;border-bottom:1px solid #242424}.global-nav strong{display:flex;align-items:center;gap:8px}.global-nav small{display:block;font-size:9px;text-transform:uppercase}.brand-mark{font-size:31px;color:#f64da0}.global-nav nav{display:flex;gap:34px}.global-actions{margin-left:auto;display:flex;align-items:center;gap:12px}.global-actions>span{padding:10px 18px;border-radius:14px;background:#191919;color:#aaa}.global-actions i{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#202020;font-style:normal}.profile-system>input{display:none}.profile-tabs{display:flex;gap:28px;height:54px;align-items:end;padding:0 34px;border-bottom:1px solid #252525}.profile-tabs label{height:54px;display:flex;align-items:center;gap:8px;padding:0 8px;border-bottom:3px solid transparent;color:#aaa;cursor:pointer;font-size:15px}.profile-body{display:grid;grid-template-columns:300px minmax(0,1fr);gap:36px;max-width:1460px;margin:auto;padding:28px 48px}.profile-hero{align-self:start;padding:0 10px;display:grid;gap:14px}.profile-hero .avatar{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:#282828;font-size:24px}.profile-hero h2,.profile-hero p{margin:0}.profile-hero .handle,.profile-hero small{color:#909090}.hero-actions{display:grid;grid-template-columns:1fr auto;gap:10px}.hero-actions button,.section header button,.toolbar button,.situation button,.empty-state button,.detail-head button,.load-more{border:0;border-radius:999px;padding:11px 18px;background:#f64da0;color:#fff;font:inherit;font-weight:700}.hero-actions button+button{width:42px;padding:0;background:#232323}.profile-hero a{font-weight:700}.profile-main{min-width:0}.panel{display:none;gap:28px}.section{display:grid;gap:12px}.section>h3,.section header h3{margin:0;font-size:15px}.section header{display:flex;justify-content:space-between;align-items:center}.section header a{color:#f64da0}.surface,.project-card,.detail-note{background:#1b191a;border-radius:24px}.surface{overflow:hidden}.rows>div{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 18px;padding:20px 24px}.rows>div+div{border-top:1px solid #2c292a}.rows b{font-size:15px}.rows span{grid-column:1;color:#999}.rows em{grid-row:1/3;grid-column:2;align-self:center;font-style:normal}.two-up,.project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.snapshot,.stats,.contribution{padding:22px;display:grid;gap:16px}.segments{display:flex;height:8px;border-radius:999px;overflow:hidden;background:#292627}.segments i{background:#f1b84b}.segments.coding i{background:#f64da0}.segments.language i{background:#4899f2}.heat{display:grid;grid-template-columns:repeat(14,1fr);gap:5px}.heat i{aspect-ratio:1;border-radius:4px;background:#282627}.heat .h1{background:#4b2639}.heat .h2{background:#78304f}.heat .h3{background:#ac3e70}.heat .h4{background:#f64da0}.project-card{padding:22px;display:grid;gap:12px}.project-card small{width:max-content;border-radius:999px;padding:5px 10px;background:#193629;color:#55d99a}.project-card p{margin:0;color:#999}.chips{display:flex;flex-wrap:wrap;gap:8px}.chips span{padding:6px 10px;border-radius:999px;background:#292627;color:#bbb}.detail-note{padding:18px 22px;display:grid;gap:5px;border:1px dashed #3e393b}.detail-note span{color:#999}.metrics{display:flex;padding:22px}.metrics>div{flex:1;display:grid;gap:5px}.metrics b{font-size:22px}.metrics span,.stats>span{color:#999}.course-group>button{width:100%;display:grid;grid-template-columns:1fr auto;text-align:left;gap:5px 16px;padding:20px 24px;border:0;background:transparent;color:inherit;font:inherit}.course-group button span{grid-column:1;color:#999}.course-group button em{grid-column:2;grid-row:1/3;align-self:center}.toolbar{display:grid;grid-template-columns:1fr auto;gap:10px;margin-bottom:10px}.toolbar input{border:0;border-radius:16px;padding:14px;background:#1b191a;color:#fff}.toolbar button{background:#282627;color:#ddd}.cv-paper{min-height:520px;max-width:700px;margin:auto;padding:56px;background:#fff;color:#171717;box-shadow:0 18px 60px #000}.badge-wall{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#2c292a}.badge-wall>div{min-height:150px;padding:24px;background:#1b191a;display:grid;place-items:center;gap:8px;text-align:center}.badge-wall>div:first-child{font-size:28px}.badge-wall b,.badge-wall span{font-size:13px}.badge-wall span{color:#999}.badge-wall .locked{opacity:.45}.timeline{display:grid;gap:12px}.timeline>b{color:#999}.detail-head{display:grid;gap:10px}.detail-head button{width:max-content;background:#252223}.detail-head h2,.detail-head p{margin:0}.detail-head p,.statement{color:#aaa}.proof-url,.statement,.empty-state{padding:24px}.empty-state{display:grid;gap:10px}.empty-state p{margin:0;color:#999}.empty-state button{width:max-content}.recoverable{padding:24px;display:grid;gap:10px}.recoverable p{margin:0;color:#aaa}.recoverable button{width:max-content}.load-more{justify-self:center;background:#292627;color:#aaa}.situation{max-width:620px;margin:90px auto;padding:48px;text-align:center;display:grid;justify-items:center;gap:12px;background:#1b191a;border-radius:24px}.situation h2,.situation p{margin:0}.situation p{color:#999}.locked-layout{display:grid;grid-template-columns:300px 1fr;gap:36px;padding:48px}.loading-layout{padding:18px 40px}.loading-body{display:grid;grid-template-columns:300px 1fr;gap:36px;padding-top:28px}.loading-body main{display:grid;gap:24px}.skeleton{position:relative;overflow:hidden;background:#211f20;border-radius:20px}.skeleton:after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,#353132,transparent);animation:shimmer 1.4s infinite}.tabs-skeleton{height:50px}.hero-skeleton{height:430px}.section-skeleton{height:150px}.section-skeleton.short{height:100px}@keyframes shimmer{to{transform:translateX(100%)}}#tab-overview:checked~.profile-tabs label[for=tab-overview],#tab-projects:checked~.profile-tabs label[for=tab-projects],#tab-challenges:checked~.profile-tabs label[for=tab-challenges],#tab-skills:checked~.profile-tabs label[for=tab-skills],#tab-cv:checked~.profile-tabs label[for=tab-cv],#tab-activity:checked~.profile-tabs label[for=tab-activity]{color:#fff;border-color:#f64da0}#tab-overview:checked~.profile-body .overview-panel,#tab-projects:checked~.profile-body .projects-panel,#tab-challenges:checked~.profile-body .challenges-panel,#tab-skills:checked~.profile-body .skills-panel,#tab-cv:checked~.profile-body .cv-panel,#tab-activity:checked~.profile-body .activity-panel{display:grid}.force-mobile{max-width:430px;margin:auto}.force-mobile .global-nav nav,.force-mobile .global-actions>span{display:none}.force-mobile .profile-tabs{justify-content:space-between;gap:4px;padding:0 14px}.force-mobile .profile-tabs span{display:none}.force-mobile .profile-body{grid-template-columns:1fr;padding:20px}.force-mobile .profile-hero{padding:0}.force-mobile .two-up,.force-mobile .project-grid,.force-mobile .badge-wall{grid-template-columns:1fr}.force-mobile .metrics{display:grid;grid-template-columns:1fr 1fr}@media(max-width:850px){.global-nav nav,.global-actions>span{display:none}.profile-tabs{justify-content:space-between;gap:4px;padding:0 14px}.profile-tabs span{display:none}.profile-body,.locked-layout,.loading-body{grid-template-columns:1fr;padding:20px}.profile-hero{padding:0}.two-up,.project-grid,.badge-wall{grid-template-columns:1fr}.metrics{display:grid;grid-template-columns:1fr 1fr}.global-nav{padding:0 16px}}
      `
    }]
  };
})();
