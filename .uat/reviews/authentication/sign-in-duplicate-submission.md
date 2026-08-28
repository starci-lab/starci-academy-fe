# UAT Case — Authentication / Sign in / Duplicate submission

Status: `PASS — NO SUSPENSE`

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-in.duplicate-submission` |
| Case kind | `failure-prevention/recovery — repeated action while request pending` |
| User goal | Avoid creating multiple challenges/resends/verifications when an action is repeated, then finish sign-in once |
| Entry | Guest sign-in details with deterministic delayed auth responses |
| Success condition | Repeated details/resend/verify gestures dispatch one request per pending phase and the single journey reaches `/vi/dashboard` |
| In scope | Duplicate details, resend and verify suppression; state continuity; one final session |
| Out of scope | Server idempotency outside pending window, rate limit, transport loss, credential/OTP refusal |

## Source provenance

| Field | Value |
|---|---|
| Journal prepared at | `2026-08-28T14:41:50+07:00` |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Runtime | `http://duplicate-submit.lvh.me:3000/vi/authentication?authState=sign-in`, local dev, completed `2026-08-28T15:26:46+07:00` |
| Contract evidence | FE state machine explicitly ignores duplicate details and blocks verify/resend while either request is pending |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account | `uat-auth-sign-in-duplicate-submit@starci.local` | Reserved only for this case; `is_uat=true` |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Random UAT password; plaintext resolves only from trusted runtime `.key` and stays memory-only |
| Agent | `/root/case_duplicate_submission_sol` | Dedicated case owner; claimed only this account/journal |
| Browser session | `auth.sign-in.duplicate-submission.isolated-1` | One case tab on the dedicated `duplicate-submit.lvh.me` cookie host; no `127.0.0.1` or other case cookies inspected/cleared |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Latency fixture | Delay long enough to repeat visible gestures and observe pending state | `PASS`; details and verify exposed observable pending frames; resend stayed pending until the low-level action returned |
| Request observation | Sanitized count/effect per operation, no payload/secrets | `PASS`; exact-email `jobs.payload` ledger baselines were compared in memory; only counts/actions/statuses were output |
| Account provisioning | Exact canonical `.uat/scripts/provision-accounts.mjs --case authentication.sign-in.duplicate-submission` | `PASS`; provisioner returned `ready authentication.sign-in.duplicate-submission`; no credential echoed |
| Browser isolation | One agent/account/tab with cookie isolation | `PASS`; dedicated lvh host isolated this case from parallel IAB tabs without touching their sessions |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Double-activate valid details submit during delay | Exactly one init request/challenge | Pending action prevents ambiguity | Spinner and retained action label stay visible |
| 2 | Double-activate resend during delay | Exactly one resend; one replacement challenge/code state | Secondary action exposes busy state | No duplicate status owner |
| 3 | Double-activate verify during delay | Exactly one verify and one session | User remains oriented until navigation | OTP state is stable while pending |
| 4 | Observe Dashboard | Exact case identity and one session completion | Journey completes once | Destination is final feedback |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E0 | FE hook specs/source | Duplicate suppression is a deliberate contract | Browser gesture behavior or request counts |
| E1 | Canonical exact-case provisioner returned `ready authentication.sign-in.duplicate-submission` | The registry-owned identity was provisioned and marked through the canonical UAT path | Details/resend/verify duplicate suppression |
| E2 | Authoritative details double-activation: pending frame had `data-action-pending=true`, `data-disabled=true`, `aria-disabled=true`, native disabled, retained `Đăng nhập`, visible spinner; exact-email ledger delta was `1 sendMail` effect | Duplicate details gesture is suppressed while the pending owner remains complete | Resend/verify behavior |
| E3 | Authoritative resend duplicate trials: two low-level activations per trial, exact-email ledger delta `1 sendMail` effect each time; OTP state remained singular and usable | Resend duplicate gestures create one replacement-code effect per pending phase | A transient resend frame: Browser low-level APIs returned only after the TextLink action settled |
| E4 | Resend post-settle state: `data-action-pending=false`, label present, no disabled/spinner residue; targeted TextLink/auth regressions passed `70/70` tests across 3 files | Resend recovers to an actionable secondary control and the pending leaf contract is guarded | A screenshot of the transient frame |
| E5 | Authoritative verify used two concurrent clicks; pending frame had `data-action-pending=true`, `data-disabled=true`, `aria-disabled=true`, native disabled, retained `Đăng nhập`, visible spinner; destination changed directly to `/vi/dashboard` | Duplicate verify is suppressed, pending owner stays complete, and there is no success interstitial | Persistent session count |
| E6 | Exact Keycloak identity had `1` active session after verify and still `1` after reload; Dashboard exact identity was visible before/after reload | Verify creates one session effect and session continuity survives refresh | UI composition outside this journey |
| E7 | PostgreSQL exact-email query returned one `users` row with `is_uat=true`; Keycloak exact identity had `is_uat=true` and matching `uat_case` | The completed identity is a traceable UAT fixture on both owners | Public exposure of the internal marker |

## Behavior decision

Decision: `PASS`

Reason: each duplicate details/resend phase produced one exact-email ledger effect, duplicate verify produced one active session, and the single completion navigated directly to Dashboard. `UserEntity.is_uat=true` and Keycloak UAT attributes match the exact case.

## UX decision

Decision: `PASS`

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton | `N/A` | Details state has no initial remote dependency in this case | Guest details rendered after the short native hydration guard; no initial remote-content skeleton is required | Static entry |
| Loading | `PASS` | Each pending phase blocks repeated dispatch and stays perceptible | Details/verify showed disabled action + retained label + visible spinner; resend produced one effect and recovered without stuck pending residue; leaf regression coverage is green | E2, E3, E4, E5 |
| Render completeness | `PASS` | Pending controls/status remain complete | OTP heading/description/input/resend/change-email controls stayed present; final Dashboard rendered the exact case identity | E2-E6 |
| Journey completion | `PASS` | Repeated gestures → one journey → Dashboard and refresh stays Dashboard | Direct `/vi/dashboard`, exact identity visible, refresh remained `/vi/dashboard`, active session count remained `1` | E5, E6 |

## UI decision

Decision: `PASS`

Authority: `fe.ui` + Grammar Common + Core Grammar. Details/verify pending used one action owner with retained label, visible spinner and disabled semantics. Resend retained its action identity and returned cleanly to actionable post-settle state; the transient TextLink frame could not be sampled because both browser low-level click APIs returned after the async action settled, so the green targeted pending-leaf regressions guard that exact frame. `SUSPENSE = 0`.

## Findings and repair loop

Open findings: `0`. The first `127.0.0.1` IAB preflight was discarded when cookie sharing was discovered. Root supplied the dedicated `duplicate-submit.lvh.me` host, rotated the exposed shared UAT password, reprovisioned active accounts and fixed pre-hydration native submit. The authoritative run used only the rotated key in memory. No password, OTP, token, cookie or raw job payload was written to terminal, journal or evidence.

## TEACHER feedback

`TEACHER feedback`: duplicate submission gets its own case because FE has an explicit one-request-per-pending-phase contract.

`TEACHER feedback`: `sao không cắm agent parrallel khác acc mà lo chi` — run Authentication cases in parallel only when each agent owns another account and a genuinely isolated browser profile/tab. A logical IAB alias is insufficient when cookies are shared.

## Retest receipt

Attempt 1 on `127.0.0.1` was discarded before verdict because IAB aliases shared cookies. Edge was unavailable, so root provided host-level cookie isolation on `duplicate-submit.lvh.me`. Credential use paused while the shared UAT password was rotated; the old in-memory binding was purged before resuming. The authoritative replay then passed duplicate details, resend and verify effect counts, pending-owner checks, direct Dashboard navigation, refresh continuity, one-session proof and UAT-marker proof. Targeted regressions: `3` files, `70/70` tests passed.

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior / UX / UI | Independent `PASS` decisions | `PASS / PASS / PASS` |
| Open UI SUSPENSE / findings | `0 / 0` | `0 / 0` |
| Isolation | `PASS` | `PASS`; exact account/agent/tab plus dedicated lvh cookie host |

Final case result: `PASS — NO SUSPENSE`.
