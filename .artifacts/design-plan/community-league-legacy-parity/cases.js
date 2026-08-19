/* Direction lab manifest — Plan phase. Directional HTML only; never an Apply baseline. */

const CASE_CSS = `
.sc { --bg:#0a0a0a; --surface:#151515; --surface2:#1d1d1d; --sep:#282828; --fg:#ededed;
      --muted:#8b8b8b; --accent:#ff2d8f; --success:#22c55e; --danger:#ef4444; --warn:#f5b544;
      background:var(--bg); color:var(--fg); padding:20px; border-radius:14px;
      font-family:ui-sans-serif,system-ui,"Segoe UI",sans-serif; font-size:14px; line-height:1.45; }
.sc *{box-sizing:border-box}
.sc-col{display:flex;flex-direction:column;gap:24px;max-width:680px;margin:0 auto}
.sc-sec{display:flex;flex-direction:column;gap:12px}
.sc-labelrow{display:flex;align-items:center;justify-content:space-between;gap:12px}
.sc-labelrow h4{margin:0;font-size:15px;font-weight:600}
.sc-seemore{color:var(--accent);font-size:13px;text-decoration:none;white-space:nowrap}
.sc-card{background:var(--surface);border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:12px}
.sc-standing{display:flex;align-items:center;gap:14px}
.sc-tile{width:44px;height:44px;border-radius:14px;background:var(--surface2);display:flex;
         align-items:center;justify-content:center;font-size:22px;flex:0 0 auto}
.sc-standing-body{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.sc-standing-body strong{font-size:15px;font-weight:600}
.sc-sub{color:var(--muted);font-size:12px}
.sc-chip{background:rgba(245,181,68,.15);color:var(--warn);border-radius:999px;padding:3px 10px;
         font-size:11px;font-weight:600;white-space:nowrap}
.sc-list{background:var(--surface2);border:1px solid var(--sep);border-radius:14px;overflow:hidden}
.sc-row{display:flex;align-items:center;gap:12px;padding:11px 14px;border-top:1px solid var(--sep)}
.sc-row:first-child{border-top:0}
.sc-rank{width:22px;text-align:right;color:var(--muted);font-size:12px;flex:0 0 auto;
         font-variant-numeric:tabular-nums}
.sc-medal{width:22px;text-align:center;font-size:15px;flex:0 0 auto}
.sc-av{width:30px;height:30px;border-radius:999px;flex:0 0 auto;
       background:linear-gradient(135deg,#3aa8c1,#2b7f95)}
.sc-av.b{background:linear-gradient(135deg,#f0913c,#d2691e)}
.sc-av.c{background:linear-gradient(135deg,#8b5cf6,#6d4bd6)}
.sc-av.d{background:linear-gradient(135deg,#37b6a0,#2a8d7c)}
.sc-av.ring{box-shadow:0 0 0 2px var(--accent)}
.sc-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}
.sc-name.me{color:var(--accent);font-weight:600}
.sc-xp{color:var(--muted);font-size:12px;flex:0 0 auto;font-variant-numeric:tabular-nums}
.sc-xp.me{color:var(--accent);font-weight:600}
.sc-caret{width:34px;text-align:right;font-size:12px;flex:0 0 auto;font-weight:600}
.sc-caret.up{color:var(--success)} .sc-caret.down{color:var(--danger)} .sc-caret.flat{color:var(--muted)}
.sc-follow{border:1px solid var(--sep);background:transparent;color:var(--fg);border-radius:999px;
           padding:5px 12px;font-size:12px;display:flex;align-items:center;gap:5px;flex:0 0 auto;cursor:pointer}
.sc-ellipsis{padding:7px 14px;text-align:center;color:var(--muted);font-size:12px;
             background:rgba(255,255,255,.02);border-top:1px solid var(--sep)}
.sc-verdict{box-shadow:inset 2px 0 0 0 var(--success)}
.sc-verdict.dn{box-shadow:inset 2px 0 0 0 var(--danger)}
.sc-crumb{color:var(--muted);font-size:12px}
.sc-h1{margin:0;font-size:22px;font-weight:700}
.sc-tabs{display:flex;background:var(--surface2);border-radius:999px;padding:4px;gap:4px}
.sc-tabs button{flex:1;border:0;background:transparent;color:var(--muted);border-radius:999px;
                padding:9px 12px;font-size:13px;font-weight:600;cursor:pointer}
.sc-tabs button[aria-pressed=true]{background:#333;color:var(--fg)}
.sc-hero{background:var(--surface);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:14px}
.sc-meter{height:7px;border-radius:999px;background:var(--surface2);overflow:hidden}
.sc-meter i{display:block;height:100%;background:linear-gradient(90deg,#ff2d8f,#ff7ab8)}
.sc-cta{align-self:flex-start;background:var(--accent);color:#fff;border:0;border-radius:999px;
        padding:11px 20px;font-size:14px;font-weight:600;cursor:pointer}
.sc-podium{display:flex;align-items:flex-end;justify-content:center;gap:14px;padding:8px 0 0}
.sc-pod{display:flex;flex-direction:column;align-items:center;gap:6px;width:98px}
.sc-pod .sc-av{width:52px;height:52px}
.sc-pod.win .sc-av{width:64px;height:64px}
.sc-pname{font-size:12px;max-width:96px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sc-pxp{font-size:11px;color:var(--muted)}
.sc-step{width:82px;background:var(--surface2);border-radius:12px 12px 0 0;display:flex;
         align-items:center;justify-content:center;font-weight:700;font-size:16px}
.sc-step.s1{height:66px;border:1px solid var(--accent)}
.sc-step.s2{height:44px} .sc-step.s3{height:34px}
.sc-strip{background:var(--surface);border-radius:18px;padding:14px;display:flex;align-items:center;gap:14px}
.sc-strip .sc-cta{padding:8px 14px;font-size:13px;align-self:auto}
.sc-note{color:var(--muted);font-size:11px;font-style:italic;margin:2px 0 0}
.sc-scope{display:flex;gap:6px;background:var(--surface2);border-radius:999px;padding:3px}
.sc-scope button{border:0;background:transparent;color:var(--muted);border-radius:999px;
                 padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer}
.sc-scope button[aria-pressed=true]{background:#333;color:var(--fg)}
`;

/* ---------- shared row fragments ---------- */

const weeklyRows = () => `
  <div class="sc-list">
    <div class="sc-row sc-verdict">
      <span class="sc-medal">🥇</span><span class="sc-av ring"></span>
      <span class="sc-name me">cuongnvtse160875 · Bạn</span>
      <span class="sc-xp me">0 XP</span><span class="sc-caret up">▴1</span>
    </div>
    <div class="sc-row">
      <span class="sc-medal">🥈</span><span class="sc-av b"></span>
      <span class="sc-name">lehoangan2003</span>
      <span class="sc-xp">0 XP</span><span class="sc-caret flat">—</span>
    </div>
    <div class="sc-row sc-verdict dn">
      <span class="sc-medal">🥉</span><span class="sc-av c"></span>
      <span class="sc-name">ngothimai98</span>
      <span class="sc-xp">0 XP</span><span class="sc-caret down">▾2</span>
    </div>
  </div>`;

const globalRows = (withFollow) => `
  <div class="sc-list">
    <div class="sc-row"><span class="sc-medal">🥇</span><span class="sc-av b"></span>
      <span class="sc-name">trannguyenndc2004</span><span class="sc-xp">480 XP</span>
      ${withFollow ? `<button class="sc-follow">＋ Theo dõi</button>` : ``}</div>
    <div class="sc-row"><span class="sc-medal">🥈</span><span class="sc-av"></span>
      <span class="sc-name">betuanminh22032003</span><span class="sc-xp">400 XP</span>
      ${withFollow ? `<button class="sc-follow">＋ Theo dõi</button>` : ``}</div>
    <div class="sc-row"><span class="sc-medal">🥉</span><span class="sc-av d"></span>
      <span class="sc-name">truongnghia297</span><span class="sc-xp">190 XP</span>
      ${withFollow ? `<button class="sc-follow">＋ Theo dõi</button>` : ``}</div>
    <div class="sc-row"><span class="sc-rank">4</span><span class="sc-av ring"></span>
      <span class="sc-name me">cuongnvtse160875 · Bạn</span><span class="sc-xp me">105 XP</span></div>
    <div class="sc-row"><span class="sc-rank">5</span><span class="sc-av c"></span>
      <span class="sc-name">phamthanhqb2005</span><span class="sc-xp">100 XP</span>
      ${withFollow ? `<button class="sc-follow">＋ Theo dõi</button>` : ``}</div>
  </div>`;

const podium = () => `
  <div class="sc-podium">
    <div class="sc-pod"><span class="sc-av"></span><span class="sc-pname">betuanmi…</span>
      <span class="sc-pxp">400 XP</span><div class="sc-step s2">2</div></div>
    <div class="sc-pod win"><span class="sc-av b"></span><span class="sc-pname">trannguye…</span>
      <span class="sc-pxp">480 XP</span><div class="sc-step s1">1</div></div>
    <div class="sc-pod"><span class="sc-av d"></span><span class="sc-pname">truongng…</span>
      <span class="sc-pxp">190 XP</span><div class="sc-step s3">3</div></div>
  </div>`;

const globalHero = () => `
  <div class="sc-hero">
    <div class="sc-standing">
      <span class="sc-tile">🏆</span>
      <span class="sc-standing-body"><strong>Hạng #4 toàn nền tảng</strong>
        <span class="sc-sub">105 XP</span></span>
    </div>
    <div>
      <p class="sc-sub" style="margin:0 0 6px">Còn 86 XP nữa để lên hạng #3</p>
      <div class="sc-meter"><i style="width:55%"></i></div>
    </div>
    <button class="sc-cta">Vào khóa học kiếm XP →</button>
  </div>`;

const rank4Tail = () => `
  <div class="sc-list">
    <div class="sc-row"><span class="sc-rank">4</span><span class="sc-av c"></span>
      <span class="sc-name">phamthanhqb2005</span><span class="sc-xp">100 XP</span>
      <button class="sc-follow">＋ Theo dõi</button></div>
    <div class="sc-row"><span class="sc-rank">5</span><span class="sc-av"></span>
      <span class="sc-name">tnh.t1k30.ht</span><span class="sc-xp">85 XP</span>
      <button class="sc-follow">＋ Theo dõi</button></div>
    <div class="sc-ellipsis">⋯ còn 12 người</div>
    <div class="sc-row"><span class="sc-rank">18</span><span class="sc-av ring"></span>
      <span class="sc-name me">cuongnvtse160875 · Bạn</span><span class="sc-xp me">105 XP</span></div>
  </div>`;

/* ---------- direction A — legacy parity ---------- */

const A_COMMUNITY = `
<div class="sc"><div class="sc-col">
  <div class="sc-sec">
    <div class="sc-labelrow"><h4>League tuần</h4><a class="sc-seemore" href="#">Xem bảng xếp hạng ›</a></div>
    <div class="sc-card">
      <div class="sc-standing">
        <span class="sc-tile">🥇</span>
        <span class="sc-standing-body"><strong>Hạng #1 · top 100%</strong>
          <span class="sc-sub">0 XP · Reset sau 2 ngày 18 giờ</span></span>
      </div>
      ${weeklyRows()}
    </div>
  </div>
  <div class="sc-sec">
    <div class="sc-labelrow"><h4>Top học viên tuần</h4><a class="sc-seemore" href="#">Xem bảng xếp hạng ›</a></div>
    <div class="sc-card">
      <div class="sc-standing">
        <span class="sc-tile">🏆</span>
        <span class="sc-standing-body"><strong>Hạng #4 toàn nền tảng</strong>
          <span class="sc-sub">105 XP</span></span>
      </div>
      ${globalRows(true)}
    </div>
  </div>
  <p class="sc-note">Standing line carries rank + percentile; XP and reset countdown share ONE
    subtitle; trailing slot is a movement caret (weekly) or a quiet follow control (global).</p>
</div></div>`;

const A_LEAGUE = `
<div class="sc"><div class="sc-col">
  <p class="sc-crumb">Trang chủ › Bảng xếp hạng</p>
  <h1 class="sc-h1">Bảng xếp hạng</h1>
  <div class="sc-tabs"><button aria-pressed="false">Tuần này</button>
    <button aria-pressed="true">Toàn cầu</button></div>
  ${globalHero()}
  ${podium()}
  ${rank4Tail()}
  <p class="sc-note">Page-level segmented tabs swap the whole board. Hero owns the goal-gradient
    meter and the north-star CTA; podium owns top 3; rank 4+ is a followable list that ends with an
    ellipsis and the pinned self row.</p>
</div></div>`;

/* ---------- direction B — one competition surface ---------- */

const B_COMMUNITY = `
<div class="sc"><div class="sc-col">
  <div class="sc-sec">
    <div class="sc-labelrow"><h4>Bảng xếp hạng</h4><a class="sc-seemore" href="#">Xem bảng xếp hạng ›</a></div>
    <div class="sc-card">
      <div class="sc-scope"><button aria-pressed="true">Tuần này</button>
        <button aria-pressed="false">Toàn cầu</button></div>
      <div class="sc-standing">
        <span class="sc-tile">🥇</span>
        <span class="sc-standing-body"><strong>Hạng #1 · top 100%</strong>
          <span class="sc-sub">0 XP · Reset sau 2 ngày 18 giờ</span></span>
      </div>
      ${weeklyRows()}
    </div>
  </div>
  <p class="sc-note">ONE product bet: the two stacked cards collapse into one surface whose scope
    switch uses the same vocabulary as the page tabs. The dashboard column gets materially shorter
    and the learner learns one mental model instead of two. Divergence from legacy: the global board
    is now a switch away rather than always visible.</p>
</div></div>`;

const B_LEAGUE = `
<div class="sc"><div class="sc-col">
  <p class="sc-crumb">Trang chủ › Bảng xếp hạng</p>
  <h1 class="sc-h1">Bảng xếp hạng</h1>
  <div class="sc-tabs"><button aria-pressed="false">Tuần này</button>
    <button aria-pressed="true">Toàn cầu</button></div>
  ${globalHero()}
  ${podium()}
  ${rank4Tail()}
  <p class="sc-note">Page is identical to direction A — the bet is confined to the dashboard, so the
    page stays the legacy board and the two surfaces now share one scope vocabulary.</p>
</div></div>`;

/* ---------- direction C — page-first ---------- */

const C_COMMUNITY = `
<div class="sc"><div class="sc-col">
  <div class="sc-sec">
    <div class="sc-labelrow"><h4>Vị trí của bạn</h4><a class="sc-seemore" href="#">Xem bảng xếp hạng ›</a></div>
    <div class="sc-hero">
      <div class="sc-standing">
        <span class="sc-tile">🥇</span>
        <span class="sc-standing-body"><strong>Hạng #1 · top 100%</strong>
          <span class="sc-sub">0 XP · Reset sau 2 ngày 18 giờ</span></span>
        <span class="sc-chip">Tuần</span>
      </div>
      <div>
        <p class="sc-sub" style="margin:0 0 6px">Còn 86 XP nữa để lên hạng #3 toàn nền tảng</p>
        <div class="sc-meter"><i style="width:55%"></i></div>
      </div>
      <button class="sc-cta">Vào khóa học kiếm XP →</button>
    </div>
  </div>
  <p class="sc-note">Bold: the dashboard answers "where am I and what do I do next" and shows NO
    ranked identities at all; every comparison moves to the page. Divergence from legacy: the
    learner can no longer see who is around them without navigating.</p>
</div></div>`;

const C_LEAGUE = `
<div class="sc"><div class="sc-col">
  <p class="sc-crumb">Trang chủ › Bảng xếp hạng</p>
  <h1 class="sc-h1">Bảng xếp hạng</h1>
  <div class="sc-tabs"><button aria-pressed="true">Tuần này</button>
    <button aria-pressed="false">Toàn cầu</button></div>
  <div class="sc-hero">
    <div class="sc-standing">
      <span class="sc-tile">🥇</span>
      <span class="sc-standing-body"><strong>Hạng #1 · top 100%</strong>
        <span class="sc-sub">0 XP · Reset sau 2 ngày 18 giờ</span></span>
    </div>
    <div>
      <p class="sc-sub" style="margin:0 0 6px">Top 10 thăng hạng · 5 cuối rớt hạng</p>
      <div class="sc-meter"><i style="width:100%"></i></div>
    </div>
    <button class="sc-cta">Vào khóa học kiếm XP →</button>
  </div>
  ${podium()}
  ${weeklyRows()}
  <p class="sc-note">The page absorbs everything the dashboard gave up, so it must carry both scopes
    at full depth including the weekly promote/demote zone legend.</p>
</div></div>`;

/* ---------- manifest ---------- */

const SHARED_CONTRACTS = [
  { key: "dashboard-community-main", why: "Weekly league and global standing are separate competition stories with independent request lifetimes, kept in one legacy-ordered community column." },
  { key: "label-row-over-card", why: "Section label and its quiet end action stay outside the card the legacy render puts them above." },
  { key: "leaderboard-card", why: "Viewer standing explains the ranked identities beneath it, so both share one competition surface while the joined list keeps its own separators." },
  { key: "leaderboard-standing-row", why: "The rank artwork fixes the viewer's current place before the standing sentence while a short deadline or tier fact remains at the far edge." },
  { key: "ranked-user-list", why: "Ranked identities are comparable peers in one joined list, so rank, identity, points and row action align across the board." },
  { key: "ranked-user-row", why: "Rank artwork and avatar identify the learner, identity owns spare width, points stay comparable and one movement or follow outcome remains subordinate at the row end." }
];

const SHARED_EVIDENCE = [
  { source: "academy.starci.org/vi/dashboard?tab=community (user screenshot)", claim: "Standing line reads 'Hạng #1 · top 100%'; the subtitle carries '0 XP · Reset sau 2 ngày 18 giờ' as ONE line; row trailing is a caret." },
  { source: "academy.starci.org/vi/league (user screenshot)", claim: "Page has segmented Tuần này/Toàn cầu tabs, a standing hero with a goal meter and a climb CTA, a 2-1-3 podium, then rank 4+ rows." },
  { source: "starci-academy/src/components/pages/DashboardPage/LeagueCard/LeagueCardContent/index.tsx:76", claim: "Percentile is FE-computed: Math.max(1, Math.ceil(rank / entries.length * 100)) — no backend field." },
  { source: "starci-academy/src/components/pages/LeaguePage/GlobalBoard/index.tsx:97-135", claim: "pointsToNext = above.points - myPoints + 1 and ratio = myPoints / above.points, only when the rank above sits inside the fetched slice." },
  { source: "starci-academy/src/messages/vi.json dashboard.league", claim: "Legacy unit string is '{count} XP'; the FE ships '{count} điểm'." },
  { source: "starci-academy-fe/src/modules/api/graphql/queries/query-my-league.ts:6", claim: "The FE already requests tier, promoteCount, demoteCount and weekEndAt — and currently renders none of them." },
  { source: "starci-academy-fe/src/app (route tree)", claim: "No /league route exists, while LeagueCard and TopLearners both router.push('/league')." },
  { source: "starci-academy-backend/src/modules/bussiness/league/types.ts:140-167", claim: "globalLeaderboard returns entries, myRank and myPoints only — there is no total user count, so a global percentile is NOT derivable." }
];

const SHARED_UNKNOWNS = [
  "Whether the production percentile denominator is the cohort size (entries.length) or a server-side cohort capacity; legacy computes it from the loaded entries, which is only correct while the full cohort is returned.",
  "Avatar art: production shows distinct generated avatars, the FE render shows one repeated placeholder. Whether the generator is a legacy-only utility is not yet established.",
  "Whether /league should sit at /league or under a locale segment, since the FE has no locale routing today."
];

const STATE_COVERAGE = (prefix) => [
  { ownerId: prefix + ":weekly", state: "populated", coverage: "rendered", scenarioId: "community", evidence: "Legacy LeagueCardContent row mapping." },
  { ownerId: prefix + ":weekly", state: "loading | empty | failed", coverage: "deferred-to-preview", scenarioId: "community", evidence: "Existing LeagueCardBase already discriminates pending/empty/failed." },
  { ownerId: prefix + ":global", state: "populated", coverage: "rendered", scenarioId: "community", evidence: "Legacy GlobalBoard row mapping." },
  { ownerId: prefix + ":global", state: "following | pending | rollback", coverage: "deferred-to-preview", scenarioId: "community", evidence: "TopLearners optimistic override map." },
  { ownerId: prefix + ":page", state: "populated", coverage: "rendered", scenarioId: "league-page", evidence: "Legacy LeaguePage tab + board composition." },
  { ownerId: prefix + ":page", state: "loading | empty | self-below-slice", coverage: "deferred-to-preview", scenarioId: "league-page", evidence: "Legacy board skeletons and selfRow gate." }
];

window.STARCI_REVIEW = {
  title: "Community tab + Leaderboard page — legacy parity",
  phase: "plan",
  deliveryMode: "batch",
  mode: "migration",
  workItems: [
    { id: "block-weekly-league", scope: "block", target: "src/components/blocks/dashboard/LeagueCard" },
    { id: "block-top-learners", scope: "block", target: "src/components/blocks/dashboard/TopLearners" },
    { id: "page-league", scope: "page", target: "src/app/league + src/components/pages/LeaguePage (new)" }
  ],
  evidence: SHARED_EVIDENCE,
  cases: [
    {
      id: "direction-legacy-parity",
      title: "A · Legacy parity (posture: parity-first)",
      thesis: "Reproduce the named production render exactly, and treat every current difference as drift to remove rather than a decision to defend.",
      distinction: "Two stacked dashboard cards AND a full /league page, with zero deliberate divergence from the legacy reference.",
      css: CASE_CSS,
      states: [
        { id: "community", label: "Community tab", covers: ["block-weekly-league:populated", "block-top-learners:populated"], html: A_COMMUNITY },
        { id: "league-page", label: "Leaderboard page", covers: ["page-league:populated"], html: A_LEAGUE }
      ],
      stateCoverage: STATE_COVERAGE("A"),
      blockTree: [
        "CommunityTab",
        "├── LeagueCard        → label-row-over-card → leaderboard-card",
        "│     ├── standing    rank + percentile · XP + reset countdown (ONE subtitle)",
        "│     └── ranked-user-list  medal | avatar | name | XP | RankDeltaCaret",
        "└── TopLearners       → label-row-over-card → leaderboard-card",
        "      ├── standing    global rank line · XP",
        "      └── ranked-user-list  medal | avatar | name | XP | FollowButton",
        "",
        "LeaguePage (NEW)",
        "├── page header + breadcrumb",
        "├── ChoiceTabs (primary, segmented)   Tuần này | Toàn cầu",
        "└── WeeklyBoard | GlobalBoard",
        "      ├── standing hero  badge · rank line · meta · goal meter · climb CTA",
        "      ├── Podium         2 · 1 · 3",
        "      └── ranked-user-list rank 4+ → ellipsis → pinned self row"
      ].join("\n"),
      contracts: SHARED_CONTRACTS,
      proposals: [
        { decision: "extend", tier: "composite", name: "LeaderboardStandingRow", target: "src/components/composites/LeaderboardStandingRow/index.tsx", delta: "props.subtitle already exists; the caller must compose 'XP · reset' into it instead of splitting reset into props.fact. No API change — remove the warning Badge usage at the call site.", absence: "fact stays optional and unused for weekly", callers: ["LeagueCard", "TopLearners"], tests: "standing subtitle renders one combined sentence and no warning badge" },
        { decision: "extend", tier: "leaf", name: "RankMark", target: "src/components/leaves/RankMark/index.tsx", delta: "no change; already owns rank 1-3 medals and rank 4+ trophy", absence: "n/a", callers: ["RankedUserRow", "LeaderboardStandingRow"], tests: "existing closed-map test" },
        { decision: "new", tier: "leaf", name: "RankDeltaCaret", target: "src/components/leaves/RankDeltaCaret/index.tsx", api: "props: { delta: number | null }", meaning: "Signed rank movement as a caret plus magnitude; null renders the neutral placeholder.", why: "The row trailing slot currently renders a full-sentence Badge ('Tăng 1 hạng'), which the legacy render does not have and which pushes the XP column around.", precedence: "replaces the movement Badge in ranked-user-row action slot", tests: "positive, negative, zero and null" },
        { decision: "new", tier: "composite", name: "Podium", target: "src/components/composites/Podium/index.tsx", api: "props: { entries: Array<{ rank, username, avatar, pointsLabel, isMe }>, meLabel: string }", meaning: "Top-three dais with the champion centred and raised.", why: "No existing owner expresses a non-list ranked arrangement; this is the one genuinely new anatomy the page needs.", precedence: "page-only; the dashboard cards never render it", tests: "ordering 2-1-3, viewer ring, fewer than three entries" },
        { decision: "new", tier: "composite", name: "StandingHeroCard", target: "src/components/composites/StandingHeroCard/index.tsx", api: "props: { badge, rankLabel, meta, progress?: { ratio, label }, ctaLabel }, on: { cta }", meaning: "Viewer standing plus goal meter plus the north-star CTA.", why: "leaderboard-standing-row has no meter or CTA slot and must not grow one — the dashboard card genuinely does not have those.", precedence: "page-only", tests: "progress omitted when rank 1 or no baseline" },
        { decision: "new", tier: "contract", name: "ranked-user-ellipsis-row", target: "src/components/contracts/index.ts", api: "children: { label: { leaf: 'text' } }", meaning: "Truthful gap marker between the fetched slice and the pinned self row.", why: "Concatenating a distant self row onto the slice without a gap marker asserts an adjacency that is false.", precedence: "only between slice and self row", tests: "renders only when hiddenBetween > 0" },
        { decision: "reuse", tier: "composite", name: "ChoiceTabs", target: "src/components/composites/ChoiceTabs", delta: "none — already owns a segmented two-option switch", callers: ["LeaguePage"], tests: "existing" }
      ],
      backendEnablers: [],
      assumptions: [
        "Percentile keeps the legacy client-side formula rather than becoming a backend field, because the legacy render is the binding reference and the denominator is already in hand.",
        "The unit string moves from 'điểm' to 'XP' across the community namespace, because the production render the user pointed at says XP everywhere."
      ],
      unknowns: SHARED_UNKNOWNS
    },
    {
      id: "direction-one-surface",
      title: "B · One competition surface (posture: balanced)",
      thesis: "Keep every legacy element, but stop telling the same competition story twice on the dashboard: one card whose scope switch matches the page tabs.",
      distinction: "The dashboard collapses two stacked cards into one scoped card; the page is unchanged from direction A.",
      css: CASE_CSS,
      states: [
        { id: "community", label: "Community tab", covers: ["block-weekly-league:populated", "block-top-learners:populated"], html: B_COMMUNITY },
        { id: "league-page", label: "Leaderboard page", covers: ["page-league:populated"], html: B_LEAGUE }
      ],
      stateCoverage: STATE_COVERAGE("B"),
      blockTree: [
        "CommunityTab",
        "└── LeaderboardSurface (scoped)   → label-row-over-card → leaderboard-card",
        "      ├── ChoiceTabs   Tuần này | Toàn cầu",
        "      ├── standing     scope-dependent standing line",
        "      └── ranked-user-list  scope-dependent trailing slot",
        "",
        "LeaguePage (NEW) — identical to direction A"
      ].join("\n"),
      contracts: SHARED_CONTRACTS.concat([
        { key: "scoped-leaderboard-card", why: "A scope switch that changes which competition the card is about belongs above the standing, because it re-labels every value beneath it." }
      ]),
      proposals: [
        { decision: "new", tier: "contract", name: "scoped-leaderboard-card", target: "src/components/contracts/index.ts", api: "children: { scope: { composite: 'choice-tabs' }, standing: { composite: 'leaderboard-standing-row', optional: true }, list: { contract: 'ranked-user-list' } }", meaning: "leaderboard-card with a leading scope switch.", why: "Two independent request lifetimes now share one surface, so the contract must state that the scope owns which query is visible.", precedence: "dashboard only", tests: "scope switch changes standing and rows together" },
        { decision: "new", tier: "leaf", name: "RankDeltaCaret", target: "src/components/leaves/RankDeltaCaret/index.tsx", api: "props: { delta: number | null }", meaning: "Signed rank movement.", why: "Same as direction A.", precedence: "weekly scope only", tests: "positive, negative, zero, null" },
        { decision: "new", tier: "composite", name: "Podium", target: "src/components/composites/Podium/index.tsx", api: "same as direction A", meaning: "Top-three dais.", why: "Page anatomy.", precedence: "page-only", tests: "same as direction A" },
        { decision: "new", tier: "composite", name: "StandingHeroCard", target: "src/components/composites/StandingHeroCard/index.tsx", api: "same as direction A", meaning: "Standing plus meter plus CTA.", why: "Page anatomy.", precedence: "page-only", tests: "same as direction A" },
        { decision: "new", tier: "contract", name: "ranked-user-ellipsis-row", target: "src/components/contracts/index.ts", api: "same as direction A", meaning: "Gap marker.", why: "Same as direction A.", precedence: "page-only", tests: "same as direction A" }
      ],
      backendEnablers: [],
      assumptions: [
        "A learner who switches scope on the dashboard expects the same two words the page uses, so the vocabulary is shared rather than invented twice."
      ],
      unknowns: SHARED_UNKNOWNS.concat([
        "Whether hiding the global board behind a switch measurably reduces follow actions, which today happen only on the always-visible Top learners card."
      ])
    },
    {
      id: "direction-page-first",
      title: "C · Page-first (posture: bold)",
      thesis: "The dashboard answers 'where am I and what do I do next'; every ranked identity moves to the page that exists to hold them.",
      distinction: "The dashboard shows no ranked rows at all — only a standing strip with the goal meter and the climb CTA.",
      css: CASE_CSS,
      states: [
        { id: "community", label: "Community tab", covers: ["block-weekly-league:populated", "block-top-learners:populated"], html: C_COMMUNITY },
        { id: "league-page", label: "Leaderboard page", covers: ["page-league:populated"], html: C_LEAGUE }
      ],
      stateCoverage: STATE_COVERAGE("C"),
      blockTree: [
        "CommunityTab",
        "└── StandingHeroCard   badge · rank line · goal meter · climb CTA",
        "",
        "LeaguePage (NEW)",
        "├── ChoiceTabs   Tuần này | Toàn cầu",
        "├── standing hero (+ promote/demote legend on the weekly scope)",
        "├── Podium",
        "└── ranked-user-list → ellipsis → pinned self row"
      ].join("\n"),
      contracts: SHARED_CONTRACTS.filter((entry) => entry.key !== "leaderboard-card"),
      proposals: [
        { decision: "new", tier: "composite", name: "StandingHeroCard", target: "src/components/composites/StandingHeroCard/index.tsx", api: "same as direction A, plus an optional legend line", meaning: "Standing plus meter plus CTA, now also the dashboard's only competition owner.", why: "This direction promotes the hero from page furniture to the dashboard's whole story.", precedence: "dashboard and page", tests: "with and without progress, with and without legend" },
        { decision: "new", tier: "composite", name: "Podium", target: "src/components/composites/Podium/index.tsx", api: "same as direction A", meaning: "Top-three dais.", why: "Page anatomy.", precedence: "page-only", tests: "same as direction A" },
        { decision: "new", tier: "leaf", name: "RankDeltaCaret", target: "src/components/leaves/RankDeltaCaret/index.tsx", api: "same as direction A", meaning: "Signed rank movement.", why: "Page rows still need it.", precedence: "page-only", tests: "same as direction A" },
        { decision: "new", tier: "contract", name: "ranked-user-ellipsis-row", target: "src/components/contracts/index.ts", api: "same as direction A", meaning: "Gap marker.", why: "Same as direction A.", precedence: "page-only", tests: "same as direction A" },
        { decision: "retire", tier: "block", name: "TopLearners on the dashboard", target: "src/components/blocks/dashboard/TopLearners", delta: "block stops mounting in CommunityTab; the follow action survives only on the page", callers: ["CommunityTab"], tests: "CommunityTab renders one competition owner" }
      ],
      backendEnablers: [],
      assumptions: [
        "Dashboard competition exists to motivate, not to browse people, so a meter plus a CTA outperforms five names."
      ],
      unknowns: SHARED_UNKNOWNS.concat([
        "This is the only direction that removes a legacy capability from a surface the user did not ask to change; it is offered because the request named a rebuild, not because evidence favours it."
      ])
    }
  ]
};
