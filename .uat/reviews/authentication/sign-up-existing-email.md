# UAT Case — Authentication / sign-up / existing email

Status: `pass`

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-up.existing-email` |
| Case kind | `existing-email failure → sign-in recovery` |
| User goal | Understand that the email already owns an account, recover through a visible control, and reach Dashboard as that exact identity. |
| Entry | `http://expired-otp.lvh.me:3000/vi/authentication?authState=sign-up` |
| Success condition | Existing-email sign-up is refused without a new identity/session/challenge; visible Sign In recovery completes through exact-email OTP, routes directly to `/vi/dashboard`, and F5 retains the exact identity. |
| In scope | Vietnamese sign-up details, pending/refusal, sign-in switch, sign-in OTP, direct Dashboard, refresh persistence. |
| Out of scope | Creating a new account, OAuth, alternate identities, Dashboard feature/UI audit. |

## Source provenance

| Field | Value |
|---|---|
| Reviewed at | `2026-08-28T16:34:08+07:00` (`Asia/Bangkok`) |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Relevant dirty files | Task-owned: `src/components/blocks/auth/AuthenticationPanel/index.tsx`, `index.spec.tsx`, `src/messages/vi.json`, `src/messages/en.json`, this journal and its screenshots. Shared pre-existing Authentication/Grammar working tree remains dirty and was preserved. BE `.v63` is untracked authority notes; no BE product source was changed by this case. |
| Runtime | FE `http://expired-otp.lvh.me:3000`; BE `http://expired-otp.lvh.me:3001`; Next.js development build; local PostgreSQL/Keycloak/jobs runtime. |
| Selected Grammar | `core`; authority `fe.ui@c9863299` + `fe.grammar-common-overview@52b229f4` + `fe.grammar-core-overview@6fa885d5` + Authentication calibration in BE `.v63` (2026-08-28). |
| Viewports | `1440 × 900` desktop |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account | `uat-auth-sign-up-existing-email@starci.local` | Registry has `is_uat=true`, `initial_state=present`, exact `case_id`; final PostgreSQL audit returned exactly one matching user with `is_uat=true` and non-empty Keycloak id. |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Plaintext was read only from the approved decrypted runtime binding into browser-agent memory, entered only on this localhost UAT origin, then zeroed; no plaintext was logged, journaled, or screenshotted. |
| Agent | `/root/signup_existing_email_sol` | Owns only this case. |
| Browser session | `auth.sign-up.existing-email.isolated-1` | Fresh in-app-browser session; not reused by another case. |
| Mailbox / external identity | Exact-email `jobs.payload` ledger adapter | OTP shape was validated and consumed in memory only; no OTP, raw payload, token, cookie, or storage was inspected or recorded. |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Existing verified identity | One active UAT identity already exists | Registry reread plus final exact-email user query: `count=1`, `is_uat=true`, Keycloak id present (E1, E10). |
| Guest browser state | Fresh case-owned session enters sign-up | Initial URL/DOM showed `Đăng ký`; no prior authenticated surface (E2). |
| Runtime | FE 3000 and BE 3001 available on the isolated hostname | Safe port/HTTP readiness plus live browser journey (E2–E8). |
| Exact-email OTP adapter | Recovery proof can be obtained without logs/mailbox disclosure | One `sign-in-otp` job appeared only after sign-in recovery; six-digit shape validated in memory (E6). |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Open sign-up URL | Guest remains in `authState=sign-up` | Form hydrates from temporarily disabled controls to actionable controls | Centred scrollable auth card, sign-up task heading and standard controls render. |
| 2 | Enter exact existing email/password, accept terms, press `Tạo tài khoản` | Pending disables the action; refusal does not navigate, create an exact-email job, or create another user | Pending retains `Tạo tài khoản`; duplicate submit is unavailable | HeroUI Button exposes pending status in the action. |
| 3 | Read refusal | Exact BE code is mapped, not leaked | `Email này đã có tài khoản. Hãy đăng nhập để tiếp tục.` says what happened and next action | `ErrorMessage` owns `role=alert`, `aria-live=assertive`, `slot=errorMessage`, danger color; Sign In remains visible (E3–E4). |
| 4 | Press visible `Đăng nhập` | URL becomes `authState=sign-in` | Recovery stays in the same card and asks only for sign-in details | Heading, description, controls and prompt all belong to sign-in state (E5). |
| 5 | Submit the same identity, then enter exact-email OTP | One sign-in OTP challenge is used; completion routes directly to Dashboard | Both details and verify actions expose pending/disabled state; no success interstitial | OTP uses the calibrated state-specific heading/control; no secret screenshot was taken (E6–E7). |
| 6 | Refresh Dashboard (F5), then expose account identity | Session remains on `/vi/dashboard`; exact UAT identity is still rendered | Destination is the success feedback and remains stable after refresh | Final screenshot is destination evidence only; Dashboard visual quality is out of scope (E8). |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E1 | Exact registry entry: `case_id=authentication.sign-up.existing-email`, `is_uat=true`, `initial_state=present`, `status=active` | Case-owned fixture is declared and isolated | Runtime behavior |
| E2 | Initial and pending DOM: sign-up URL/heading; after submit the same action was disabled and contained a status node while keeping label `Tạo tài khoản` | Correct entry and loading/duplicate-submit guard | Refusal semantics |
| E3 | Before repair, live Vietnamese journey rendered raw English `User email is already verified`; after repair it rendered the approved localized sentence | The finding was real and the runtime retest exercised the exact BE refusal | Data-side no-op |
| E4 | [`existing-email-refusal.png`](sign-up-existing-email/screenshots/existing-email-refusal.png); DOM/computed receipt: alert `slot=errorMessage`, `aria-live=assertive`, `display=block`, 12 px danger text, full form width; visible `Đăng nhập` link | Localized actionable refusal and correct UI owner/treatment | Dashboard/session persistence |
| E5 | Visible `Đăng nhập` changed URL to `?authState=sign-in` and replaced the title/form with sign-in state | Recovery is visible, coherent and URL-owned | Successful authentication |
| E6 | Exact-email jobs ledger was `0` immediately after sign-up refusal; recovery created exactly one `sign-in-otp` job; proof matched six-digit shape in memory only | Sign-up created no mail/challenge side effect; OTP belonged to this exact recovery identity | Mail delivery success (`jobs.status=failed`) |
| E7 | OTP submit pending disabled the action and routed directly from `sign-in-otp` to `/vi/dashboard`, with no done/interstitial state | Recovery completes and destination is direct | Cold refresh persistence |
| E8 | [`recovery-dashboard-after-refresh.png`](sign-up-existing-email/screenshots/recovery-dashboard-after-refresh.png); post-F5 URL remained `/vi/dashboard`, and DOM rendered the exact UAT email in the account/sidebar | Session survives F5 as the exact identity | Dashboard visual quality or feature completeness |
| E9 | Targeted Vitest: `1` file / `27` tests PASS; targeted ESLint PASS; full FE `tsc --noEmit` PASS | Repair contract, localization mapping and types remain green | Browser behavior |
| E10 | Final exact-email user query returned `count=1`, `bool_and(is_uat)=true`, Keycloak id present; final mail templates were one `sign-in-otp` and one expected `new-device-signin`, with no sign-up template | No duplicate app identity and no wrong sign-up mail/challenge; successful sign-in notification is accounted for | Cookie/token contents, intentionally not inspected |
| E11 | Screenshot hygiene check retained exactly two PNGs. One interim image whose form still showed password bullets was immediately deleted and is not referenced. | Retained evidence contains no password, OTP, token or cookie | Secret values themselves |

## Behavior decision

Decision: `PASS`

| Rule / effect | Expected | Observed | Evidence | Owning source |
|---|---|---|---|---|
| Existing verified email | Refuse sign-up without creating identity/challenge/session | Localized refusal stayed in sign-up; exact-email jobs remained zero; final user count remained one | E3, E6, E10 | `BE + FE` |
| Recovery | Visible Sign In path accepts the same existing account | Sign-up → sign-in → OTP → direct Dashboard completed | E5–E7 | `FE + BE` |
| Session identity | Only exact UAT identity persists | Dashboard and F5 both rendered the exact case email | E8, E10 | `FE + BE` |
| Secret boundary | Password/OTP remain memory-only | Secure runtime binding and exact-email ledger were consumed without value output; holders zeroed | Isolation receipt, E6, E11 | `external/runtime` |

## UX decision

Decision: `PASS`

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton | `N/A` | Static authentication entry has no initial remote content dependency; short pre-hydration disabling prevents premature input | Controls hydrated deterministically; no content-shaped remote load applies | E2 |
| Loading | `PASS` | Pending stays on the action and blocks duplicate submit | Sign-up, sign-in and OTP buttons retained labels, exposed status nodes and were disabled while pending | E2, E6, E7 |
| Render completeness | `PASS` | Failure says what happened and how to recover; applicable form/actions remain | Localized alert plus visible Sign In control; no raw Keycloak copy after repair | E3–E5; FE repair |
| Journey completion | `PASS` | Failure → visible recovery → proof → destination → refresh | Exact full loop completed and F5 retained identity | E5–E8 |

## UI decision

Decision: `PASS`

Authority: `fe.ui` + `fe.grammar-common-overview` + `fe.grammar-core-overview` + Authentication ErrorMessage/pending/surface calibration in `.v63`.

### Region and render map

| State / viewport | Region | Data or control rendered | Required UI treatment | Authority binding | Evidence |
|---|---|---|---|---|---|
| Sign-up refusal / 1440×900 | Auth surface | Existing-email sentence, retry form, primary action, Sign In recovery | One compact centred Card; error uses the standard danger ErrorMessage owner; recovery remains a recognizable text link | `fe.ui`; Grammar Common state ownership; Core quiet hierarchy; `.v63` auth rules 2–8, 11–15 | E4 |
| Pending / 1440×900 | Primary action | Stable action label + spinner/status | One visual owner; button disabled; no duplicate status copy | `.v63` auth rules 4–5 | E2, E6, E7 |
| Dashboard after F5 / 1440×900 | Destination identity | Exact case email | Destination is success feedback; screenshot is identity/continuity evidence only | `.v63` auth rules 19, 21, 24 | E8 |

### SUSPENSE register

| ID | Exact render question authority cannot answer | Proposed authority owner | Thầy feedback | Resolution evidence |
|---|---|---|---|---|
| None | No unresolved render question | N/A | Existing Authentication calibration was sufficient | E4; `NO SUSPENSE` |

## Findings and repair loop

| Finding | Decision axis | Severity | FE/BE owner | Fix applied | Automated proof | Runtime retest | State |
|---|---|---|---|---|---|---|---|
| `USER_EMAIL_ALREADY_VERIFIED_EXCEPTION` leaked raw English in Vietnamese and did not explicitly guide recovery | `UX` (secondary `UI`) | medium | FE connected AuthenticationPanel + locale catalogue | Exact code maps to `status.accountExists`; VI `Email này đã có tài khoản. Hãy đăng nhập để tiếp tục.` and EN equivalent; visible Sign In prompt retained | 27 targeted tests, ESLint and typecheck PASS | Same case rerun rendered localized alert, switched through visible Sign In and completed Dashboard/F5 | `pass` |

Open findings: `0`.

## Feedback calibration

Literal marker: `TEACHER feedback`

| Decision | AI conclusion | Thầy correction / approval | Authority learning |
|---|---|---|---|
| Behavior | PASS after no-op refusal and exact-identity recovery proof | No case-specific correction received; coordinator approved the exact repair boundary | Refusal must be proved separately from recovery and must not be inferred from visual state alone. |
| UX | PASS after localized actionable failure → visible Sign In → completion | Coordinator supplied the exact actionable VI copy | An unhappy authentication case is terminal only after recovery reaches its destination. |
| UI | PASS; SUSPENSE 0 | No new UI correction required | Stable domain errors use localized ErrorMessage treatment; the existing prompt link is the recovery control. |

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior decision | `PASS` or justified `N/A` | `PASS` |
| UX decision | `PASS` or justified `N/A` | `PASS` |
| UI decision | `PASS` | `PASS` |
| Open UI SUSPENSE | `0` | `0` — `NO SUSPENSE` |
| Open findings | `0` | `0` |
| Account/session isolation | `PASS` | `PASS` |

Final case result: `PASS`.
