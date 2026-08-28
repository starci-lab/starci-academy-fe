# UAT Case — Authentication / Sign in / Expired OTP

Status: `accepted`

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-in.expired-otp` |
| Case kind | `failure/recovery — challenge/OTP expired before verify` |
| User goal | Recover safely after the proof is no longer attached to a live challenge and still finish sign-in |
| Entry | `/vi/authentication?authState=sign-in-otp` with a challenge allowed to expire |
| Success condition | Expired proof creates no session; user returns to details, opens a fresh challenge, and reaches `/vi/dashboard` |
| In scope | Server not-found/expired semantics, safe restart, fresh challenge, Dashboard identity |
| Out of scope | Live-challenge mismatch, missing client storage, first-email non-delivery, transport, throttle |

## Source provenance

| Field | Value |
|---|---|
| Runtime reviewed at | `2026-08-28T15:20:12+07:00` |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Runtime | Local Next dev FE + local BE/Keycloak/PostgreSQL/Redis; terminal rerun at `http://expired-otp.lvh.me:3000` on the dedicated IAB alias |
| Contract evidence | BE maps absent/expired challenge to `CHALLENGE_OTP_NOT_FOUND_EXCEPTION`; FE offers change-email/details restart |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account | `uat-auth-sign-in-expired-otp@starci.local` | Reserved only for this case; `is_uat=true` |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Random UAT password; plaintext resolves only from trusted runtime `.key` and stays memory-only |
| Agent | `sol-auth-sign-in-expired-otp` | This bounded task owns only this case and journal |
| Browser session | `auth.sign-in.expired-otp.isolated-1` | Dedicated IAB alias; terminal fresh tab used only the exact case host and account |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Challenge | Case-owned challenge with deterministic expiry | Canonical exact-case provision succeeded; one exact-email Redis challenge was shortened from its live TTL and verified absent before submitting its original proof |
| Session | Fresh guest, then exact case identity only | Isolated host began at sign-in, rejected the expired proof, accepted only the fresh proof, and persisted this exact identity across Dashboard reload |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Wait past the server-owned expiry and submit the old OTP | No session; old challenge cannot be consumed | Expiry refusal distinguishes restart from simple typo retry | Error and recovery action are visible together |
| 2 | Choose another email/details and resubmit valid credentials | Fresh challenge replaces the dead one | User is not trapped in the old OTP state | URL and heading return to details then fresh OTP |
| 3 | Submit the fresh valid OTP | New challenge is consumed | Recovery continuity is clear | OTP composition remains stable |
| 4 | Observe Dashboard | Identity matches this case | Journey completes | No interstitial |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E0 | Contract review | Expiry/not-found differs from mismatch | Runtime expiry timing or copy |
| E1 | Canonical `.uat/scripts/provision-accounts.mjs --case authentication.sign-in.expired-otp` returned ready; read-only UserEntity audit returned one row, `is_uat=true`, non-empty Keycloak id | Exact fixture identity and marker | Browser session outcome |
| E2 | Fresh guest IAB tab at exact sign-in entry submitted the dedicated account; the primary action disabled credential/OAuth controls and exposed one pending status before URL-owned OTP state rendered | Details pending ownership, challenge creation and correct account | Expiry refusal or final session |
| E3 | Exact-email Redis inventory found one live challenge. A deterministic case-only TTL fixture reduced only that key to one second; the follow-up inventory proved the key absent before the original proof was submitted | The proof was no longer attached to a live server challenge | User-visible refusal semantics |
| E4 | Submitting the expired proof stayed on Authentication and rendered server refusal `Challenge not found`; OTP heading/control plus resend/change-email actions remained visible while the URL normalized from OTP state to bare Authentication | Server unknown/expired branch refused the proof | Localized/actionable copy, URL-state continuity or session absence under an uncontaminated cookie jar |
| E5 | Direct Dashboard probe on the shared `127.0.0.1` cookie jar exposed a foreign `invalid-otp` identity created by a parallel case; no logout/clear was performed | The original host could not provide isolated no-session or identity proof | Any session created by this expired proof |
| E6 | Root assigned `expired-otp.lvh.me` as a distinct loopback cookie host. It opened as guest sign-in, but the first submit before hydration fell through to native GET and placed credential fields in the URL. The value is redacted; the tab was immediately navigated to a safe URL and all credential use stopped pending rotation | A shared FE hydration/form safety defect and mandatory credential rotation blocker | The expired-OTP journey on the repaired revision |
| E7 | Root rotated the UAT credential, canonically reprovisioned active accounts, added the hydration/native-submit guard, enabled the isolated loopback origin and repaired expired-challenge copy/reset; `104` targeted tests passed before resume | Shared repair and credential-revocation prerequisites were complete | Browser behavior on the repaired revision |
| E8 | Repaired isolated rerun opened one live exact-email challenge, then the deterministic case-only TTL fixture proved that sole Redis key absent. Submitting its original proof reset the URL to `authState=sign-in`, changed the heading to `Đăng nhập`, removed the OTP control and rendered `role=alert`: `Mã OTP đã hết hạn. Đăng nhập lại để nhận mã mới.` | Expired proof is refused with localized, actionable safe restart and coherent URL/visible state | Final fresh proof/session |
| E9 | Direct navigation to the isolated-host Dashboard after E8 redirected to `?authState=sign-in`; no Dashboard identity rendered | Expired proof created no authenticated session | Later recovery completion |
| E10 | Details recovery used the rotated credential without credential query parameters, disabled the action while pending, opened a fresh OTP URL and produced a different six-digit proof. Its verify action disabled while pending and navigated directly to `/vi/dashboard` | Fresh challenge replaced the expired one and valid proof completed with no interstitial | Reload persistence |
| E11 | Dashboard rendered the exact case email and nine Dashboard headings; browser reload remained at `/vi/dashboard` with the same exact identity and Dashboard content | Stable cookie-backed exact-account session after recovery | Other accounts/cases |
| E12 | Read-only UserEntity audit after terminal navigation returned exactly one row with non-empty Keycloak id and `is_uat=true` | Mandatory UAT marker and database identity isolation | Public exposure of the internal marker, which is intentionally out of scope |

## Behavior decision

Decision: `PASS`

The exact isolated challenge expired before verification, its original proof created no session, and
the repaired app reset to details with actionable localized copy. A new challenge accepted only its
fresh proof, navigated directly to the exact-account Dashboard, and remained authenticated after reload.

## UX decision

Decision: `PASS`

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton | `N/A` | Authentication entry/OTP state has no initial page-data skeleton requirement | Static state rendered immediately | E2 |
| Loading | `PASS` | Verify and restart requests expose pending feedback | Both repaired details submits and fresh-proof verify disabled their initiating action while pending without losing task identity | E2, E10 |
| Render completeness | `PASS` | Expiry and safe restart are both explained | Localized expiry ErrorMessage, details reset, fresh OTP task and Dashboard destination all rendered completely | E8–E11 |
| Journey completion | `PASS` | Expiry → fresh challenge → Dashboard → refresh Dashboard | Full isolated recovery completed; exact identity and Dashboard persisted after reload | E8–E11 |

## UI decision

Decision: `PASS`

Authority: `fe.ui` + Grammar Common + Core Grammar. The repaired refusal used the semantic alert owner,
localized the expiry fact, returned heading/control/URL ownership to the details task, then restored the
accepted six-slot OTP composition for the fresh challenge. Dashboard was the completion feedback; no
success interstitial rendered. Open `SUSPENSE`: `0`.

## Findings and repair loop

| Finding | Classification | Owner | Required closure | State |
|---|---|---|---|---|
| F1 — Expired/unknown challenge renders raw English `Challenge not found` and leaves visible OTP state on a non-OTP URL | `UX | UI` | FE connected error mapping + auth URL-state owner | Localized actionable expiry copy, safe details restart, exact isolated rerun | `closed` — E7–E8 |
| F2 — Parallel IAB tabs shared an authenticated cookie and invalidated exact-case session evidence | Runtime isolation | UAT browser/session routing | Use the dedicated loopback cookie host and prove only this case identity | `closed` — E7–E11 |
| F3 — Pre-hydration native form submit exposed credential fields in the URL | Security / Behavior | FE Authentication form owner | Prevent native GET submission before hydration, rotate the UAT password, then rerun without credential persistence | `closed` — E7, E10 |

## TEACHER feedback

`TEACHER feedback`: expired OTP must not share the invalid-OTP case; prove a fresh challenge and final Dashboard recovery.

Fresh `TEACHER feedback`: `sao không cắm agent parrallel khác acc mà lo chi`. This explicitly requires
parallel execution with a different account/session per case and authorized entering only this case's
UAT credential/OTP into the local app after action-time confirmation. The shared-cookie collision was
therefore disclosed and routed to a distinct case host rather than silently reusing another identity.

## Retest receipt

After the blocked credential was rotated, the exact account was reprovisioned and the connected FE
repairs passed `104` targeted tests. A fresh tab on the dedicated loopback host reran the entire case:
live challenge → deterministic server-key expiry → old proof refusal and safe details reset → direct
Dashboard probe redirected to sign-in → fresh challenge with a rotated proof → direct exact-account
Dashboard → reload remained Dashboard. UserEntity was unique and `is_uat=true`. Password, OTP,
token, cookie, challenge id and mailbox payload were not written to this journal.

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior / UX / UI | Independent `PASS` decisions | `PASS / PASS / PASS` |
| Open UI SUSPENSE / findings | `0 / 0` | `0 / 0` |
| Isolation | `PASS` | `PASS` — exact case account, alias, host, fresh tab, unique UserEntity and exact Dashboard identity |

Final case result: `PASS — NO SUSPENSE`.
