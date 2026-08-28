# Dashboard / Landing and primary tabs

Status: `calibrating`

## Provenance

| Field | Value |
|---|---|
| Reviewed at | `2026-08-28T10:29:12.7878827+07:00` |
| Journal repo | `starci-academy-fe` |
| Journal branch / commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| FE branch / commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch / commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| UAT authority | Backend Source `.v63`, SHA-256 `2295bfbd613fc3ab055b35a1200722743172c44cae286df85d3e4099257d9312` |
| Comparison ref | FE `32871fb`, immediately before contract removal commit `1de6e43` |
| Runtime | FE `http://localhost:3000`; BE `http://localhost:3001`; development; Vietnamese locale |
| Relevant dirty files | FE `.uat/accounts.json`, `.uat/reviews/dashboard/landing-and-tabs.md`; BE `.v63`, `scripts/credentials.mjs`, `UserEntity.isUat` entity/migration files and portable UAT password ciphertext |
| Viewports | desktop `1440 x 900`; mobile `390 x 844` override (browser content viewport observed as 312 px wide) |
| Diagnostic fixture | Existing local account displayed as `test`; later replaced in the same browser context by `authentication.sign-in.happy` from another UAT task. Neither identity is accepted as the Dashboard formal fixture. |
| Supporting automated checks | `DashboardPage/component.spec.tsx`, `dashboard/pending-gate.spec.tsx`, and `dashboard/access.spec.tsx`: 22/22 passed; these confirm structure/behavior contracts but do not prove visual composition |

## Required UAT accounts and sessions

Each case owns one account and one fresh browser session. The two cases must never share a token, cookie, session or application user.

| Case | Account alias | Initial state | Required markers | Session alias |
|---|---|---|---|---|
| `dashboard.landing-and-tabs.happy` | `uat-dashboard-landing-happy@starci.local` | `present` | Keycloak `is_uat=true`, `uat_case=dashboard.landing-and-tabs.happy`; app user `UserEntity.isUat=true` | `dashboard.landing-and-tabs.happy.session` |
| `dashboard.landing-and-tabs.unhappy` | `uat-dashboard-landing-unhappy@starci.local` | `present` | Keycloak `is_uat=true`, `uat_case=dashboard.landing-and-tabs.unhappy`; app user `UserEntity.isUat=true` | `dashboard.landing-and-tabs.unhappy.session` |

No credential, token, cookie or session identifier is recorded in this review.

Provisioning note: both identities are registered and independently reverified in this run. PostgreSQL reports `users.is_uat=true` for both accounts; Keycloak reports `is_uat=true` and the exact matching `uat_case` attributes. Action-time approval to enter the local UAT credentials was received. Formal execution remains `BLOCKED`, however, because the only available in-app browser context is shared with another concurrent UAT task: the active identity changed from `test` to `authentication.sign-in.happy` without a Dashboard login action. Entering either Dashboard credential would therefore reuse/replace shared cookie and token state instead of creating the required isolated session.

## Evidence

| ID | Observation or artifact | Proves | Does not prove |
|---|---|---|---|
| E1 | FE listener PID resolves to `C:\Repositories\starci-academy-fe` at `main@6195812625ad5083b0b828eb6971e211d33fff47`; BE listener resolves to the Source checkout at `mtp@c10c3f7719ed102e85813ab9380231e995ba3b85`. Local Keycloak, PostgreSQL and supporting containers are running and healthy where health checks exist. | Runtime and source identity used by this review. | Production behavior or a clean build. |
| E2 | Read-only PostgreSQL and Keycloak queries returned both Dashboard fixture emails with `is_uat=true`; Keycloak `uat_case` matched each registered case exactly. No credential, token or cookie was emitted. | Fixture identity and marker readiness. | Browser-session isolation or journey completion. |
| E3 | On a fresh Dashboard navigation, shell navigation and tabs rendered while routed `<main>` was empty. No `[data-loading=true]` or `aria-busy=true` marker was present; populated Dashboard content appeared after settlement. | Page-level session restoration has a silent blank-body interval and no observable skeleton/loading state. | Exact duration on every device/network. |
| E4 | Desktop viewport screenshot and DOM showed the identity/quick-action rail as an uncomposed narrow raw-text stream at the far left while the initial viewport remained mostly blank; overview regions existed later in DOM below/after the rail. | Desktop composition regression and poor initial discoverability despite semantic content existing. | A deterministic approved-baseline comparison. |
| E5 | Mobile viewport showed the same raw vertical rail consuming the initial viewport; primary tab text collapsed to icons while Overview content remained far below. No horizontal overflow was detected. | Mobile transformation does not restore usable hierarchy or surface priority. | Every mobile browser/device. |
| E6 | Visible-control trace selected `Tổng quan`, `Khám phá`, `Khóa học` and `Cộng đồng`; published tabs updated `?tab=...`, selected ARIA state and panel content. `ArrowRight` moved focus/selection from Overview to Explore and updated the URL. | Diagnostic primary-tab navigation and keyboard operation under the non-formal session. | Formal Dashboard fixture isolation or all panel actions. |
| E7 | `/vi/dashboard?tab=not-published` rendered Overview with `aria-selected=true`, retained the invalid query in the address bar and exposed no explanatory alert. | Safe render fallback exists, but visible state and shareable URL disagree. | Backend failure/retry behavior. |
| E8 | Immediately before credential entry, the same browser context reported `authentication.sign-in.happy` although this task had only observed `test`; only one in-app browser context was available. | Cross-task session contamination prevents the one-case/one-session invariant. | A product defect; this is a UAT-environment blocker. |
| E9 | Runtime accessibility DOM contained a `<main>` landmark nested inside another `<main>`. | Landmark hierarchy is structurally invalid for the reviewed render. | The complete accessibility conformance of the site. |

## Happy cases

| Case | Entry / action | Expected success | Verdict | Evidence |
|---|---|---|---|---|
| H1 | In the dedicated happy-case session, the signed-in learner opens `/vi/dashboard`, waits for settlement, then selects `Tổng quan` → `Khám phá` → `Khóa học` → `Cộng đồng` → `Tổng quan`. | Session restoration has visible pending feedback; the identity rail and selected panel render; each tab updates the URL and selected state without losing the session; returning to Overview restores its complete content. | BLOCKED | E2, E6 and E8. Diagnostic navigation reached all published tabs, but the sole browser context was contaminated by another task before the approved Dashboard credential could be entered. A formal isolated session was not created. |

## Unhappy cases

| Case | Trigger | Expected recovery / refusal | Verdict | Evidence |
|---|---|---|---|---|
| U1 | In the dedicated unhappy-case session, the learner opens `/vi/dashboard?tab=not-published`. | The route settles safely to a published panel, makes that fallback clear, and leaves the URL/share state consistent with the visible selection. | BLOCKED | E2, E7 and E8. Diagnostic runtime selected Overview without crashing but retained `?tab=not-published` and showed no explanation. The dedicated unhappy account could not receive a separate fresh browser session. |

## Behavior decision

Decision: `FAIL` from diagnostic route evidence; formal fixture execution remains `BLOCKED`.

| Requirement | Decision | Evidence | Finding / blocker |
|---|---|---|---|
| Published tabs keep URL, selected state and panel content consistent | PASS | E6 | Formal case-owned session was not available |
| Invalid tab input settles to one canonical published state | FAIL | E7 | UI selected Overview while the URL retained `tab=not-published` |
| Session/account isolation for formal cases | BLOCKED | E8 | Shared browser context was contaminated by another task |

## UX decision

Overall verdict: `FAIL`

| Gate | Verdict | Evidence / blocker |
|---|---|---|
| Skeleton | FAIL | E3. On cold Dashboard entry, the shell and tabs appeared around an empty routed body; no skeleton measure or layout-preserving placeholder was observable. |
| Loading | FAIL | E3. Session restoration was silent: no local progress, pending explanation, `data-loading` marker or `aria-busy` state appeared in the body. |
| Render completeness | BLOCKED | E4-E6. Diagnostic final Overview rendered the expected regions and all four primary panels produced content, but formal account/session coverage and explicit error/retry fixtures were not isolated. |
| Journey completion | BLOCKED | E6-E8. Diagnostic tab switching and keyboard navigation worked; the invalid-tab state remained inconsistent, and neither formal case received an isolated session. |

UX findings:

- High — A cold authenticated visit exposes a blank product body during session restoration. The user receives no signal whether Dashboard is loading, empty or broken.
- Medium — An invalid `tab` query silently falls back to Overview but leaves the invalid query in the address bar. Visible state and shareable URL disagree.
- Medium — Final content is present in the DOM, but the broken composition makes the primary Dashboard content effectively undiscoverable in the initial viewport; this is primarily a UI defect with a secondary UX impact.
- Blocker — The shared in-app browser context cannot satisfy one-case/one-account/one-session while another UAT task is active. This is an environment blocker, not a product failure.

## UI decision

Verdict: `FAIL`

Authority: `fe.ui` + `fe.grammar-common-overview` + `fe.grammar-core-overview` + Core Navigation/SurfaceCard/Collections rules. Open SUSPENSE: none for the recorded findings.

| Severity | Finding | Evidence |
|---|---|---|
| Critical | Dashboard lost the rail/main page composition. | Runtime viewport shows the identity rail as a narrow raw-text column at the far left while the rest of the viewport is blank; the overview content falls below the rail instead of sitting beside it. Current `DashboardPageBase` returns bare sibling `<aside>` and `<main>` elements with no layout classes. |
| High | Dashboard blocks lost their card, spacing and region surfaces. | Runtime shows icons, labels and values as an ungrouped vertical stream. Source comparison shows contract-era wrappers were removed without equivalent class-based composition; this comparison diagnoses the regression and is not a recommendation to restore the removed contract pattern. |
| High | Mobile transformation preserves the broken rail-first hierarchy and pushes the task content below the initial viewport. | E5 at `390 x 844`; absence of horizontal overflow does not make the composition usable. |
| High | The route creates nested `main` landmarks. | `dashboard/layout.tsx` wraps its children in `<main>`, while `DashboardPageBase` renders another `<main>` for the selected panel. Runtime DOM contains a `main` inside a `main`, weakening page landmarks for assistive navigation. |
| Pass evidence | Shell navigation and the four primary dashboard tabs retain selected state and keyboard operation. | E6. Runtime selected-state evidence matched the URL for all published tabs; this does not offset the page-body layout failures. |

## Calibration

- AI UX response: `FAIL`
- AI Behavior decision: `FAIL` (formal execution still `BLOCKED`)
- AI UI response: `FAIL`
- Formal case execution: `BLOCKED` because the sole browser context is shared and was demonstrably replaced by another UAT task; action-time credential approval and both correctly marked fixtures were available
- Thầy correction: `TBD`
- Decision: `retest-required`
