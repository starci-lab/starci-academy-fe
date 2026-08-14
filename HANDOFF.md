# StarCi Academy FE — handoff

Written 2026-08-13. Read this top to bottom before touching anything; the traps section is not
optional reading, it is where the last session lost the most time.

---

## 1. Where things are

| Repository | Path | Branch | HEAD | Note |
|---|---|---|---|---|
| Frontend (target) | `D:\Repositories\starci-academy-fe` | `main` | `bc5a239` | pushed to origin |
| Backend | `D:\Repositories\starci-academy-backend` | `mtp` | `06d0649` | GraphQL API on `:3001` |
| Legacy frontend (READ-ONLY) | `D:\Repositories\starci-academy` | `mtp` | `9a19342` | the product that is live today |
| Trust tree (rules) | `D:\Repositories\starci-academy-backend\.claude` | `main` | `26b9980` | its own git repo |

Restore points, newest last: `7aa4ba0` → `270fad8` → `bc5a239`.

**Local stack.** Backend: `npm run sync` → `npm run compose` → `npm run start:dev`. Postgres 5432,
Keycloak 8089, API 3001. Frontend: `npm run dev` on **`http://localhost:3000`**; the repository
scripts explicitly lock both hostname and port. Do not open the live app through `127.0.0.1`:
Keycloak's `academy-web` client whitelists `http://localhost:3000/authentication` and nothing else,
so a different hostname or port can produce CORS, cookie/storage or
`Invalid parameter: redirect_uri`. That whitelist lives only in the running Keycloak; it is not
seeded from the repo and is lost on reprovision.

---

## 2. What is done and verified

**Community leaderboard + `/league` page.** Rebuilt to match the production render at
`academy.starci.org`. New owners: `LeagueTile`, `PodiumStep`, `RankDeltaCaret`, `Breadcrumbs`,
`Podium`, `StandingHeroCard`, `LeaguePage`. New contracts: `podium`, `podium-place`,
`standing-hero-card`, `standing-goal-meter`, `ranked-user-ellipsis-row`, `page-header-stack`,
`scope-switch-row`, `league-page-column`, `league-board-stack`, `ranked-user-followable-list`.

**Locale routing.** Every route moved under `src/app/[lang]/`. `src/i18n/routing.ts` +
`navigation.ts` + `src/middleware.ts`. 34 files moved from `next/navigation` to
`@/i18n/navigation`. No static prerendering — see traps.

**Verified at `bc5a239`:** `next build` passes · `eslint src` clean · `tsc --noEmit` clean outside
the generated lint mirror · twelve tests fail and were **already failing** before any of this work
(eleven dashboard components, one courses query).

---

## 3. The immediate next action

A **landing page design plan is mid-flight and waiting on one decision**. Nothing is implemented.

- Artifacts: `.artifacts/design-plan/landing-page/`
- Three directions are built and rendered; the lab is served from that folder over plain HTTP.
- **The next step is the user choosing one direction id**, not writing code.

| id | posture | what follows the hero |
|---|---|---|
| `direction-one-promise` | conservative | four public counters → three courses → one CTA |
| `direction-the-gap` | balanced | "what AI took / what is still yours" → three courses → CTA |
| `direction-proof-first` | bold | three real public profiles → three courses → counters |

**Binding user constraint:** keep the hero's right-hand visual, replace everything below it. That
visual is the legacy block `MicroservicesScene` — isometric mini-infra in **plain SVG**. three.js
and R3F were tried and removed on the user's own call, so it ports with no WebGL dependency. It is
at `starci-academy/src/components/blocks/marketing/MicroservicesScene/index.tsx`, and the reasoning
is recorded in `starci-academy/src/components/pages/LandingPage/HERO-CONTINUE.md`.

**What a signed-out page may read, and nothing else:** `platformStats` (anonymous; four scalars),
the public `courses` catalogue, and `userProfile` / `profileEvidence` / `publicUserCv` which carry
`withAuth: false`. Every other query in this frontend is session-gated.

---

## 4. Rules this repository actually enforces

These are mechanical, not stylistic. `npm run lint` runs a canon gate first and then ~45
`starci-fe/*` rules at `error` with inline disables refused. Breaking one is a red build, not a
review comment.

- **Structure comes from the contract registry.** `src/components/contracts/index.ts` maps a key to
  its classes, its child grammar and a one-sentence `why`. A raw `<div>` with layout classes in a
  component is a lint error; name a key and render it through `<Tree contract="…" />`.
- **`LayoutClassName` is a closed union.** A class not in it is unrepresentable, not discouraged.
  Widening it is a deliberate one-line edit, not a workaround.
- **Leaves wrap the vendor.** HeroUI primitives are reached from `src/components/leaves/*` only.
  The last session hand-rolled a breadcrumb trail out of links before noticing HeroUI ships
  `Breadcrumbs`; do not repeat that — check the vendor first.
- **Glyphs are Heroicons, from the `Icon` leaf.** One named exception exists (ICON-11): the
  `RankMark` leaf may import `@iconify/react` for exactly four `fluent-emoji-flat` rank artworks.
  A fifth artwork or a second importing file is still an error.
- **Two halves per screen.** `index.tsx` fetches and resolves; `component.tsx` receives resolved
  props and can be rendered from a test with no locale, no request and no provider.
- **Comments say why, not what.** `require-export-jsdoc` is on. A comment restating the signature
  fails review even when lint passes.

The rules are authored in `…backend\.claude\sources\fe\` and mirrored into
`starci-academy-fe/plugins/eslint-canon/` by a sync script. **Do not hand-edit the mirror** — the
gate detects drift and the next sync overwrites it.

---

## 5. Traps already paid for

**The weekly league board reads a projection, not the tables you just wrote.** It reads
`league_cohort_points_projections`, kept fresh by CDC on `xp_histories` with a TTL fallback. There
is no CDC locally, so a seeded week stays invisible. `scripts/seed-league-cohort.mjs` (in the
backend) deletes the projection row so the next read rebuilds. Three things must be seeded together
or it fails silently: cohort membership in `user_leagues`, `xp_histories` dated inside the cohort
window, and `user_leagues.last_week_rank` — without the last one every row reports "no movement"
and the feature looks broken. `xp_histories.ref_id` is `varchar(64)`; two uuids do not fit.

**PowerShell corrupts UTF-8 and can blank a file.** It turned `·` into `Â·` in one source file, and
a failed `Get-Content -Raw` on a path containing `[` returned null which was then written over a
layout, emptying it. Use Node or an editing tool for any file with non-ASCII text or bracketed
paths.

**Each grid row is its own grid.** Making `ranked-user-row` a grid did not align columns across
rows: an `auto` track sizes to that row's own content, so a row without a follow button let `1fr`
expand and pushed its score out of the column. Fixed track widths are what align rows; the follow
track width lives on the LIST (`ranked-user-followable-list`) because whether a board is followable
is a property of the board.

**`SurfaceListCard` does not draw its contract node.** It takes the key for typing and leaves the
drawing to whatever it renders. Return a bare fragment and every separator and row inset silently
disappears. Wrap in `<Tree contract="…">`.

**Middleware is not hot-reloaded.** Next creates it at boot, so a newly added `src/middleware.ts`
does nothing until the dev server restarts — `/` will 404 until then.

**No static prerendering on `[lang]`.** `generateStaticParams` was removed on purpose: every screen
is session-gated and renders nothing without a token, so it pre-built blank pages and failed doing
it, on `useSearchParams` needing Suspense and on next-intl's `ENVIRONMENT_FALLBACK`. Re-adding it
without also adding `setRequestLocale` to every page will break the build.

---

## 6. Known-open, recorded rather than hidden

- The follow control renders as a filled primary button with no glyph; production draws a quiet
  outlined control with a person-plus glyph. The user chose to ship without it.
- `myLeague` carries no `isFollowing`, so the weekly board's follow control starts at
  "not following" for everyone. Fixing it is a backend field, not a frontend guess.
- `tsc` reports two errors inside the generated `plugins/eslint-canon/props.ts`. Generated file;
  not hand-fixable.
- Twelve pre-existing test failures, listed in section 2.
- `test@starci.local` sits alone in a stray league cohort created by a mis-run seed.

---

## 7. If you are an assistant without this repository's tooling

You will not have the trust tree, its skills, or its verification scripts. That does not make their
rules optional — it makes them invisible to you, which is worse. So:

- Read `src/components/contracts/index.ts` before adding any markup. It is the whole layout
  vocabulary and it is enforced.
- Read the nearest existing sibling component before writing a new one. Every convention in this
  repo is visible in the file next door.
- Run `npm run lint`, `npx tsc --noEmit` and `npm run build` before claiming anything works. The
  build is the gate that catches what lint cannot.
- **Do not design.** The landing page has an open decision recorded in section 3. Picking one
  yourself, or inventing a fourth, discards a deliberate stop.
