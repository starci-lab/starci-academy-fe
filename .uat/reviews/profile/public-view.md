# Profile / Public view

Status: `calibrating`

## Provenance

| Field | Value |
|---|---|
| Reviewed at | `2026-08-28T10:34:46+07:00` |
| Journal repo | `starci-academy-fe` |
| Journal branch / commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| FE branch / commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch / commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Comparison ref | `N/A` |
| Relevant dirty files | Journal/FE: `.uat/**`; Source/BE authority and runtime fixture support: `.v63`, `.uat/**` from other audit tasks, `scripts/credentials.mjs`, `src/modules/databases/postgresql/primary/entities/user.entity.ts`, migration `1787900000000-AddIsUatToUsers*`, portable UAT password ciphertext |
| Runtime | FE `http://localhost:3000`; BE GraphQL `http://localhost:3001/graphql`; Keycloak `http://localhost:8080`; PostgreSQL local stack; development; Vietnamese locale |
| Role / fixture | Reader of one public UAT profile and one private UAT profile; no password, token, cookie or raw session identifier is recorded |
| Viewports | Observed CSS viewports: public desktop `1152 x 720`, private desktop `1024 x 576`, mobile `312 x 675` |

The UAT journal and evidence are owned by the routed StarCi Academy FE checkout. The backend Source supplies `.v63`, runtime and fixture authority only. Both repository origins and branches matched their `be` and `fe` route declarations. Source readiness reported the runtime, bootstrap and worktree modules ready; its only global blocker was the unrelated portable route `.workspaces/projects/tedo/fe.json`, which was not changed in this audit.

## Scenario

- User goal: inspect a learner's public identity and evidence through the Profile tabs, while a private profile refuses the evidence body clearly and offers a safe way out.
- Entry: `/vi/profile/uat-profile-public-happy-20260828` and `/vi/profile/uat-profile-private-unhappy-20260828`.
- Success condition: the public identity and every published Profile destination render meaningful settled or empty content; the private profile exposes no evidence tabs/body and the recovery action reaches Courses.
- States exercised: cold skeleton, public overview, empty evidence, Projects, Challenges, Skills, Activity, private/locked, transport error, retry, desktop, mobile and keyboard tab navigation.
- States not exercised: a formally isolated clean guest/browser session, populated project/challenge/skill/activity evidence, owner/self mode, follow/share mutations and a deterministic injected backend outage.

## Fixture receipt

| Case | App fixture | Required markers | Runtime state |
|---|---|---|---|
| `profile.public-view.happy` | `uat-profile-public-happy-20260828` | PostgreSQL `is_uat=true`; Keycloak `is_uat=true`, `uat_case=profile.public-view.happy` | `profile_locked=false`; populated identity with empty evidence families |
| `profile.public-view.unhappy` | `uat-profile-private-unhappy-20260828` | PostgreSQL `is_uat=true`; Keycloak `is_uat=true`, `uat_case=profile.public-view.unhappy` | `profile_locked=true` |

The existing local Keycloak user-profile schema initially discarded both required attributes. The local realm schema was extended with only `is_uat` and `uat_case`, then the existing provisioner was rerun and both identities were re-read from the individual Keycloak user endpoint. The provisioner also used email as the app username; the Profile route retained `%40` and returned not-found while direct GraphQL with the decoded username returned the profile. The two UAT app usernames were therefore changed to route-safe aliases for this runtime-only fixture. No source repair was made and no credential was recorded.

Formal browser execution remains blocked by isolation: the only available in-app Browser context visibly carried the existing `authentication.sign-up.happy` UAT session. Diagnostic observations below are retained because they are direct runtime evidence, but they do not upgrade H1/H2/U1 to formal PASS.

## Evidence

| ID | Observation or artifact | Proves | Does not prove |
|---|---|---|---|
| E1 | PostgreSQL and individual Keycloak user reads confirmed both exact case markers; direct GraphQL returned the public profile and the private profile with `profileLocked=true`. | Fixture existence, traceability and BE runtime semantics. | Browser/session isolation or UI rendering. |
| E2 | [`public-overview-desktop.jpg`](../../evidence/profile/public-overview-desktop.jpg), SHA-256 `b9320c87b9d5a17e7da83b2ada86198ad1bf4a2ae507aab7946326e39ed4a2fd`. | Settled public identity and all overview empty-state regions at desktop. | Formal isolated case execution or populated evidence. |
| E3 | Visible Profile tabs reached `/projects`, `/challenges`, `/skills`, `/activity` and returned to the bare profile; selected tab and meaningful empty content matched each URL. | Diagnostic end-to-end route and state transitions. | In-transition loading feedback or an isolated session PASS. |
| E4 | [`public-overview-mobile.jpg`](../../evidence/profile/public-overview-mobile.jpg), SHA-256 `0d4acc3b78f128dff56520ce51a05dd77da274c0af2b29c8c300b3a7c9a8c2f0`; the accessibility snapshot exposed five unnamed Profile tabs. | Responsive settled render, overlap and missing accessible names. | Other mobile widths or screen-reader product behavior beyond the observed tree. |
| E5 | [`transport-error-mobile.jpg`](../../evidence/profile/transport-error-mobile.jpg), SHA-256 `43ff2f8b23659214418999d257d191249ccf8616dbd8784ff717840603edfc2a`; `Thử lại` left the same error surface for more than 3.4 seconds with zero loading markers while direct GraphQL returned HTTP 200. | A runtime retry dead-end and missing action feedback in the observed context. | Root cause or behavior in a clean session. |
| E6 | [`private-state-desktop.jpg`](../../evidence/profile/private-state-desktop.jpg), SHA-256 `778bee66335713346db060bb843d0f92482b50b3151bac522d50d57ec7e7f130`, and [`private-state-mobile.jpg`](../../evidence/profile/private-state-mobile.jpg), SHA-256 `71a3ed0544b9fdc6e7833dfd7a276863887e20b314d1c415c1bfd4eba830e29c`. No Profile tablist/evidence body rendered; `Khám phá nội dung` reached `/vi/courses`. | Locked-state container and recovery behavior at desktop/mobile. | Whether identity-summary fields are permitted by the privacy business authority. |
| E7 | Browser DOM identified the active account as the UAT identity owned by `authentication.sign-up.happy`, not either Profile case. | Exact reason formal isolation is blocked. | Product failure. |

## Happy cases

| Case | Entry / action | Expected success | Verdict | Evidence |
|---|---|---|---|---|
| H1 | A fresh reader session opens the public Profile overview and waits for settlement. | Skeleton preserves the final measure; identity and every required empty/success region render without layout overflow. | BLOCKED | E2/E4 prove the diagnostic settled state. A clean case-owned browser session was unavailable (E7), and the cold mobile skeleton height was `1141px` versus `1238px` settled. |
| H2 | Use visible controls to select Projects, Challenges, Skills, Activity, then Overview. | URL, selected tab and meaningful content stay consistent through the complete loop. | BLOCKED | Diagnostic loop completed for all five destinations (E3), but it reused the contaminated Browser context. |
| H3 | On mobile, identify and navigate the same tab set with keyboard focus. | Every focused tab has a meaningful accessible name and the selected destination changes. | FAIL | `ArrowRight` changed Overview to Projects, so keyboard routing works; the focused and selected tab had no text or `aria-label`, and all five tabs were anonymous in the accessibility tree (E4). |

## Unhappy cases

| Case | Trigger | Expected recovery / refusal | Verdict | Evidence |
|---|---|---|---|---|
| U1 | A fresh reader session opens the private Profile fixture. | Identity-level privacy state is clear, evidence tabs/body stay unavailable, and the recovery action reaches Courses. | BLOCKED | The diagnostic state met those outcomes on desktop and mobile and `Khám phá nội dung` reached `/vi/courses` (E6), but the Browser session was not case-isolated (E7). |
| U2 | Profile fetch reaches the rendered transport-error state and the reader presses `Thử lại`. | The action exposes pending feedback and either recovers or returns a truthful retryable error. | FAIL | The error message was truthful, but retry produced no loading marker and remained on the same error beyond 3.4 seconds while the exact BE query returned HTTP 200 (E5). |

## Behavior decision

Decision: `FAIL` from diagnostic runtime evidence; formal account/session isolation remains `BLOCKED`.

| Requirement | Decision | Evidence | Finding / blocker |
|---|---|---|---|
| Public/private profile semantics match the fixture | PASS | E1, E2 and E6 | Formal browser isolation was unavailable |
| Private evidence stays unavailable and recovery reaches Courses | PASS | E6 | Business authority for which identity-summary fields remain public is still required |
| Rendered transport failure can retry the successful backend query | FAIL | E5 | Visible retry produced no recovery while direct GraphQL returned HTTP 200 |
| Route identity resolves the provisioned account safely | FAIL | Fixture receipt | Email username required a runtime-only route-safe alias; source repair is absent |

## UX decision

Overall verdict: `FAIL`

| Runtime gate | Verdict | Evidence | Finding / blocker |
|---|---|---|---|
| Skeleton | FAIL | Cold public mobile had 19 loading markers and `1141px` document height; the same fixture settled at `1238px`. | Skeleton exists, but it does not preserve the final measure and causes a material vertical shift. |
| Loading | FAIL | E5. | Retry has no control-local or page-level pending feedback and remains a dead-end in the observed runtime context. |
| Render completeness | BLOCKED | E2, E4 and E6. | Public identity and empty evidence states plus private/error states were observed, but populated evidence and a formal clean session were not available. |
| Journey completion | FAIL | E3, E4, E5 and E7. | Pointer/keyboard tab routing and private recovery work diagnostically; unnamed mobile tabs block an accessible journey, retry dead-ends, and formal isolation is unavailable. |

| Severity | Finding | Evidence | Secondary axes |
|---|---|---|---|
| High | A rendered transport error cannot be recovered with the visible `Thử lại` action. | E5. | Behavior |
| High | Mobile Profile destinations are keyboard-selectable but have no accessible names, so a reader cannot know which destination has focus. | E4 and H3. | UI, accessibility |
| Medium | The cold skeleton changes the document measure by `97px` before the same public fixture settles. | H1 and the cold/settled viewport measurements. | UI, performance |

## UI decision

Verdict: `FAIL`

Authority: `fe.ui` + `fe.grammar-common-overview` + `fe.grammar-core-overview` + Core Tabs/Navigation/SurfaceCard/Feedback rules. Open SUSPENSE: none for the recorded findings.

| Severity | Finding | Evidence | Secondary axes |
|---|---|---|---|
| Critical | The five mobile Profile tabs lose all accessible names when their visible labels are hidden. | E4 accessibility snapshot: one selected plus four unselected anonymous `tab` nodes. | UX, accessibility |
| High | Floating `StarCi AI` and the round launcher overlap the Course/Activity content region at the `312px` CSS viewport. | E4 screenshot. | UX |
| High | Profile overflows horizontally: the settled public page measured `1256px` at a `1152px` CSS viewport, and the cold private page measured `1256px` at `1024px`; the inner content main extends past the viewport. | E2/E6 screenshots and computed measurements. | UX, responsive composition |
| Medium | Public and locked Profile states render a `main` landmark inside the route's outer `main` (`mainCount=2`). | E2/E6 runtime DOM measurements. | Accessibility |
| Pass evidence | Identity rail, overview cards, empty-state copy and locked-state card retain a readable hierarchy; the private mobile recovery control measured `175 x 36px`. | E2, E4 and E6. | These strengths do not offset the failures above. |

## AI summary

- Strongest quality: the Profile information architecture is coherent across public overview, evidence destinations and the private-state escape route; empty content is generally explicit rather than blank.
- Most important gap: mobile navigation removes the semantic names of every primary Profile destination, while floating controls cover task content and the transport-error retry does not recover.
- Overall recommendation: `retest-required`; first repair accessible tab naming, mobile fixed-layer collision, desktop overflow and retry behavior, then rerun with two clean case-owned Browser sessions and at least one populated public-profile evidence fixture.

## User review — thầy

| Axis | Thầy verdict | Correction / disagreement |
|---|---|---|
| Behavior decision | TBD |  |
| UX decision | TBD |  |
| UI decision | TBD |  |

## Calibration record

- Verdict differences: `TBD`.
- What the AI missed or overweighted: `TBD`.
- Reusable learning approved by thầy: `TBD`.
- Page-specific note that must not become a global rule: Profile UAT fixture usernames need route-safe aliases until username encoding/authority is resolved.

## Decision and retest

- Final status: `retest-required`.
- Required fixes: mobile Profile tab accessible names; mobile floating-control collision; desktop horizontal overflow; nested landmarks; retry pending/recovery behavior; isolated Browser fixture setup.
- Retest scope: public overview plus all Profile tabs, private state and recovery, deterministic error/retry, desktop/mobile, keyboard/accessibility, two case-owned sessions and a populated evidence fixture.
- Next review ref: `TBD`.
