# Public profile cluster — legacy-parity design review

Status: review required; production implementation has not started  
Delivery mode: batch  
Mode: migration/parity  
Target: `D:\Repositories\starci-academy-fe`  
Binding legacy source: `D:\Repositories\starci-academy`

## 1. Intake ledger

| Kind | Statement | Consequence |
| --- | --- | --- |
| Explicit instruction | Continue `$starci-fe-design-plan` for the profile page cluster. | Stop at a reviewable design artifact; do not edit production source. |
| Explicit instruction | Modify `starci-academy-fe`; use `starci-academy` as legacy. | The new repository owns the future implementation; legacy owns parity evidence. |
| Observation | The target FE has Dashboard and Authentication only; it has no profile routes or profile product blocks. | Profile is a coordinated migration, not a local repair. |
| Observation | Legacy public profile has one persistent username layout, six tabs, and project/challenge/coding detail routes. | Use batch delivery with one coordinator-owned layout and route-derived active state. |
| Open question | No authenticated legacy browser render was available during this pass. | Source order, copy, responsive branches and behavior are binding; pixel parity remains a later browser gate. |

## 2. Scope and owner matrix

Settings, profile editing, the private CV gallery/editor, and pinned-project management are separate
authenticated journeys and are out of this batch. Owner-only exits to those journeys remain visible,
but their destination screens/overlays require separate design work.

| ID | Target | Primary owner | Depends on | Owner boundary | Proposed production boundary |
| --- | --- | --- | --- | --- | --- |
| `route-profile-redirect` | `/profile` | page | session/me | Redirect the signed-in viewer to their canonical username; no visible design. | `src/app/profile/page.tsx`, `src/components/pages/ProfileRedirectPage/{index,component}.tsx` |
| `layout-public-profile` | `/profile/[username]/**` | layout | user profile, public CV, follow mutation | Canonical username, screen state, hero, visible tabs, active route, follow/share/hire/edit exits. | `src/app/profile/[username]/layout.tsx`, `src/components/layouts/PublicProfileLayout/{index,component}.tsx` |
| `page-profile-overview` | bare username route | page | layout | Order five independently landing evidence blocks. | `src/components/pages/ProfileOverviewPage/{index,component}.tsx` |
| `page-profile-projects` | `/projects` | page | layout | Pinned proof before verified capstone proof. | `src/components/pages/ProfileProjectsPage/{index,component}.tsx` |
| `page-profile-project-detail` | `/projects/[courseId]` | page | projects data | One capstone roadmap, back path, progress summary, milestone/task order. | `src/components/pages/ProfileProjectRoadmapPage/{index,component}.tsx` |
| `page-profile-challenges` | `/challenges` | page | layout | Headline strength, language breadth, passed submission groups. | `src/components/pages/ProfileChallengesPage/{index,component}.tsx` |
| `page-profile-challenge-course` | `/challenges/[courseId]` | page | challenge list | Search/filter one course's submissions and route to proof. | `src/components/pages/ProfileChallengeManagePage/{index,component}.tsx` |
| `page-profile-challenge-proof` | `/challenges/[courseId]/[submissionId]` | page | challenge detail | Submission URL, attempts and structured feedback. | `src/components/pages/ProfileChallengeSubmissionPage/{index,component}.tsx` |
| `page-profile-skills` | `/skills` | page | layout | Coding metrics, breakdowns, searchable solve history. | `src/components/pages/ProfileSkillsPage/{index,component}.tsx` |
| `page-profile-coding-proof` | `/skills/[slug]` | page | coding detail | One solved problem, code/submission evidence and back path. | `src/components/pages/ProfileCodingProblemPage/{index,component}.tsx` |
| `page-profile-activity` | `/activity` | page | layout | Earned achievements before chronological activity. | `src/components/pages/ProfileActivityPage/{index,component}.tsx` |
| `page-profile-public-cv` | `/cv` | page | layout, public CV | Read-only PDF, honest empty/not-compiled/error states, owner edit exit. | `src/components/pages/ProfilePublicCvPage/{index,component}.tsx` |

Dependency graph:

```text
userProfile + publicUserCv + setFollow
└── PublicProfileLayout
    ├── ProfileOverviewPage ── readiness / courses / contributions / skill summaries
    ├── ProfileProjectsPage ── pinned projects / capstone progress
    │   └── ProfileProjectRoadmapPage
    ├── ProfileChallengesPage ── challenge strength / solved challenges
    │   └── ProfileChallengeManagePage
    │       └── ProfileChallengeSubmissionPage
    ├── ProfileSkillsPage ── coding progress / XP / standing / skills / history
    │   └── ProfileCodingProblemPage
    ├── ProfilePublicCvPage
    └── ProfileActivityPage ── achievements / feed
```

## 3. Parity baseline

Binding route and source inventory:

- `src/app/[locale]/profile/[username]/layout.tsx` and
  `src/components/layouts/PublicProfileLayout/{index,component}.tsx` own the persistent profile
  situation, identity rail and tabs.
- `src/components/blocks/profile/ProfileHero/index.tsx` owns avatar/rank, identity, bio, work facts,
  social proof, exactly one primary CTA, share and external links.
- `src/components/blocks/navigation/ProfileTabsBar/index.tsx` fixes the order Overview → Projects →
  Challenges → Skills → CV → Activity, route-derived selection, visitor gating and the owner-only
  hidden marker.
- The legacy `Profile*Page` folders named in the matrix fix block order, progressive disclosure,
  route exits and state intent for each tab/detail.

Deliberate rule translations only:

- Use the target FE's contract registry, connected/presentational split, HeroUI 3 leaves, Heroicons,
  SWR/Apollo boundary and internal `router.push` policy.
- Visible product copy says **content**, never **lesson**.
- Do not copy raw legacy `div`/class/frame debt; reproduce the same relationship through truthful
  contract keys.
- Preserve public external URLs as real links; preserve internal destinations as connected actions.

## 4. Business capability matrix

| Capability | Evidence | Status in target FE |
| --- | --- | --- |
| Public identity, lock, work state, counts, visibility and social links | backend `userProfile`; legacy `query-user-profile.ts`; publication e2e test | backend proven; integration missing |
| Follow/unfollow | backend `setFollow`; follow-network e2e test | query mutation already exists; layout integration missing |
| Public CV availability/PDF | backend `publicUserCv`; legacy query | backend proven; integration missing |
| Joined courses and completion dimensions | backend `userCourses`; legacy query | backend proven; integration missing |
| Contribution calendar and weekly streak | backend projections/queries; legacy OverviewContributions | backend proven; profile integration missing; current generic calendar reusable |
| Job readiness | backend `userJobReadiness`; legacy query | backend proven; profile integration missing |
| Pinned and verified projects | backend `userPinnedProjects`; profile-portfolio e2e test | backend proven; public read missing |
| Capstone roadmap | backend `userCapstoneProgress`; legacy query | backend proven; integration missing |
| Challenge strength and passed submissions | backend `userChallengeStrength`, `userSolvedChallenges` | backend proven; integration missing |
| Submission attempts and feedback | backend `userSolvedChallengeDetail`; legacy detail page | backend proven; integration missing |
| Coding metrics, standing, breakdowns and history | backend coding projections/queries | backend proven; integration missing |
| Coding solution detail | backend `userCodingProblemDetail`; legacy detail page | backend proven; integration missing |
| Achievements and activity | backend `userAchievements`, `userFeed` | backend proven; generic activity row partly reusable |
| Hire contact behavior | legacy opens GitHub only when `openToWork` and GitHub URL exist | proven current behavior; broader hiring workflow unknown and not invented |
| Profile edit, CV edit and pinned-project management destinations | legacy owner exits | exits proven; destination screens/overlay out of scope |

## 5. Reuse inventory

| Candidate in target FE | Verdict | Why |
| --- | --- | --- |
| `nav-over-body-page`, `ShellNav` | reuse as-is | Global chrome is already route-stable and independent from profile domain. |
| `underlined-tab-strip`, `ExtendedTabs` | reuse/extend only if label hiding cannot be expressed | Existing contract owns a full-width underlined route strip; profile supplies gated peers and active key. |
| `rail-then-main` | reuse as-is | Its `why` already fixes stable rail + flexible main and narrow-screen stacking without naming Dashboard. |
| `stacked-sections`, `label-row-over-card` | reuse as-is | These own the same major-block and label/surface seams used by legacy profile. |
| `SurfaceCard`, `SurfaceListCard` | reuse as-is | Profile sections use both bounded stories and joined peer lists. |
| `ContributionCalendar` | reuse as-is | Same calendar data, geometry, legend and year selection relationship. |
| `ActivityRow`, `activity-feed-list` | reuse with profile resolver | Row grammar matches; actor/target route and reaction eligibility remain block behavior. |
| `EmptyNotice`, `centred-empty-notice`, `empty-notice-card` | reuse as-is | Honest empty/locked/not-found recovery states already exist. |
| `Avatar`, `Badge`, `Button`, `IconButton`, `Heading`, `Text`, `TextLink`, `Progress` | reuse as-is | Required primitive vocabulary already exists. |
| `ProfileRow` | reject for profile hero | It is a compact navigation row; extending it would change its defining sentence into a full identity rail. |
| `dashboard-rail`, `dashboard-main`, `dashboard-tabs-over-body` | reject | Their names and child grammar describe Dashboard and would lie on public profile routes. |

Proposed vocabulary is intentionally narrow:

- new layout owner `PublicProfileLayout`;
- new blocks `ProfileHero`, `ProfileTabs`, and one connected block per independent query/state family;
- new contracts for the profile layout seam, identity card anatomy, proof metric ribbon, project proof
  grid, breakdown stack, roadmap list and public CV paper; do not create wrappers solely for spacing;
- extend `ExtendedTabs` only with a semantic `labelVisibility: "always" | "wide"` input if source
  inspection during apply proves its current API cannot preserve the legacy icon-only narrow state.

## 6. Design thesis and CTA

This profile cluster helps a learner, peer or recruiter judge a person's verifiable StarCi work by
making identity and the strongest proof path continuously visible while every evidence family remains
shareable through its own route.

- Primary CTA is context-dependent but singular: **Edit profile** for self; **Hire me** for an
  open-to-work visitor with GitHub; otherwise **Follow/Following**.
- Share is secondary and remains adjacent to, but visually below, the primary outcome.
- Reading order is identity → route choice → strongest evidence in that route → supporting history.
- Success means a visitor can identify the person, choose one evidence family, inspect proof, and
  return without losing the profile context.
- Anti-goals: no social-feed redesign, no invented recruiter funnel, no aggregated profile score,
  no settings/private CV implementation, and no frontend sample data presented as live capability.

## 7. Unknowns and conflicts

| Unknown/conflict | Owner for resolution | Reversible decision now |
| --- | --- | --- |
| Exact pixel render at desktop/mobile/dark mode was not observed in a live authenticated legacy session. | browser parity pass during apply | Preserve source-defined order and responsive behavior; do not freeze pixel claims. |
| Legacy has both `src/components/blocks/navigation/ProfileTabsBar` and a newer profile block implementation. | legacy route/layout runtime | Treat the component mounted by `PublicProfileLayout` as binding. |
| Overview comments route “See all courses” to Activity although courses are not repeated there. | product owner | Preserve current executable route until explicitly corrected. |
| Visitor-empty policy differs by section: some hide, others show an empty message. | legacy source/backend result | Preserve each block's current settled branch; do not normalize globally. |
| Hiring beyond opening GitHub is unsupported. | product/backend | Keep GitHub exit only when its two proven gates pass. |

## 8. Review case

Pure migration does not invent three cosmetic alternatives. One source-bound case is supplied:

**`case-parity-a` — Proof rail parity.** The identity card remains in a fixed-width rail beside a
flexible route panel, tabs remain above both, and every route keeps the legacy evidence order and
progressive disclosure. Narrow screens stack identity above content and collapse tab labels while
retaining icons.

Critique verdict: **keep for review**.

- Product challenge: the singular context CTA and route-specific proof path preserve the legacy job.
- Architecture challenge: layout owns profile chrome; pages order blocks; blocks own their own remote
  state; contract keys own seams. No page becomes a data aggregator.
- Render challenge: long identity copy, independently loading blocks, visitor-empty sections, nested
  details and mobile tab density remain required browser gates.
- Rejected direction: a single long “portfolio story” without tabs would break shareable routes and is
  an unrequested redesign.
- Rejected direction: a metric-first dashboard would demote identity and misrepresent profile as an
  aggregate score.

## 9. State matrix

| Situation | Required result |
| --- | --- |
| Layout first load | Hero and route body settle as one profile-layout skeleton; do not flash not-found. |
| Not found | One centred recovery to Home; no tabs or empty body. |
| Locked visitor | Minimal identity plus private-profile explanation and Browse content exit. |
| Ready visitor | Gated tabs only; CV appears only when public; hidden sections are absent. |
| Ready owner | All tabs; visitor-hidden sections carry the owner-only hidden marker. |
| Follow pending | Keep geometry and lock only the follow control. |
| Tab block loading | Preserve each final block's geometry independently. |
| Tab block error | Keep successful sibling blocks; show retry only for failed block. |
| Visitor section empty | Hide only where legacy hides; otherwise render the route's honest empty answer. |
| Owner section empty | Preserve owner guidance and proven exits; do not invent management behavior. |
| Detail missing | Keep profile layout; show route-local not-found and back path. |
| CV no public file | Honest no-CV state; owner may exit to private CV gallery. |
| CV not compiled | Distinguish from no CV; do not draw an iframe. |
| Narrow viewport | Stack rail above main; tab glyphs remain; labels may hide; proof lists retain readable order. |
| Signed out | Public unlocked routes remain readable; follow invokes the existing sign-in boundary. |

## 10. Apply order after approval

1. Add public-profile GraphQL types/documents/hooks and port authenticated/public envelopes without
   changing backend field meaning.
2. Add shared profile contracts and prove their child identities/cardinality through existing gates.
3. Implement `PublicProfileLayout`, redirect behavior, profile situations, hero and route tabs.
4. Port Overview blocks one request/state owner at a time.
5. Port Projects and its roadmap detail.
6. Port Challenges and both detail tiers.
7. Port Skills and coding detail.
8. Port Activity and public CV.
9. Run source gates, typecheck, focused lint/tests, production build and authenticated side-by-side
   browser review at desktop, narrow and dark-mode states.

Production implementation must not start until the user approves the review case (or requests a
specific revision). The approved result is then frozen as `design-record.md` and
`design-record.json` for `$starci-fe-design-apply`.
