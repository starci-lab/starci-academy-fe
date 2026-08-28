# UAT Case — Authentication / Sign in / Password failed

Status: `passed`

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-in.password-failed` |
| Case kind | `failure/recovery — wrong password` |
| User goal | Understand that credentials were refused, correct only the password, and finish sign-in |
| Entry | Guest opens `/vi/authentication?authState=sign-in` |
| Success condition | Wrong password creates no session; corrected password opens OTP; valid proof reaches `/vi/dashboard` as this case identity |
| In scope | Reached credential refusal, editable recovery, OTP completion, Dashboard identity |
| Out of scope | Absent account, malformed fields, OTP-specific failures, transport, throttle, OAuth |

## Source provenance

| Field | Value |
|---|---|
| Journal prepared at | `2026-08-28T14:41:50+07:00` |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Runtime | Browser run at `2026-08-28T14:47+07:00` on `http://127.0.0.1:3000`; identity repair retest passed at `2026-08-28T14:52+07:00` |
| Contract evidence | FE localized credential refusal; BE does not issue a challenge when password verification fails |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account | `uat-auth-sign-in-password-failed@starci.local` | Reserved only for this case; `is_uat=true` |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Random UAT password; plaintext resolves only from trusted runtime `.key` and stays memory-only |
| Agent | `sol-auth-sign-in-password-failed` | Dedicated runtime owner for this case only |
| Browser session | `auth.sign-in.password-failed.isolated-1` | Fresh agent-created tab; no other case tab, account or session reused |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Account | Present with exact `uat_case` marker and `is_uat=true` | Exact email/keycloak id match; canonical reprovision repair followed by read-only retest proved `users.is_uat=true` |
| Session | Fresh guest session | Exact isolated browser session started at the sign-in URL and reached Dashboard only after this case OTP |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Submit the reserved email with a wrong password | No challenge or session is created | Refusal is reader-facing and fields remain editable | Error has one semantic danger owner |
| 2 | Correct the password and submit once | A new OTP challenge opens | Recovery preserves orientation and exposes pending feedback | Details-to-OTP transition uses approved auth composition |
| 3 | Enter the valid OTP | Session is created only after valid proof | Journey completes without a success interstitial | Destination is the completion feedback |
| 4 | Observe Dashboard | Identity matches this case reservation | Recovery reaches the promised destination | Dashboard audit remains out of scope |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E0 | Bounded source review at FE `6195812` and BE `c10c3f7` | FE maps the stable Keycloak refusal to localized recovery copy; BE verifies password before challenge creation | Any runtime verdict by itself |
| E1 | The retired `authentication.sign-in.unhappy` account/session receipt was excluded before this run | Isolation from the retired umbrella case | Current runtime behavior |
| E2 | FE targeted guard run: 5 files, 99 tests passed (`useAuthPanel`, connected/base AuthenticationPanel, authentication screen, sign-in init mutation) | Refusal mapping, pending/duplicate guards, OTP URL transition and direct Dashboard callback remain covered | Live UI/runtime outcome |
| E3 | BE targeted guard run: 2 suites, 19 tests passed (sign-in init handler and Keycloak token service) | Wrong password emits the stable refusal and creates no OTP challenge/email; accepted password may open the OTP challenge | Live fixture correctness |
| E4 | Fresh tab at exact entry URL under `auth.sign-in.password-failed.isolated-1` | Correct case entry and browser isolation | Credential outcome |
| E5 | Wrong-password submit: action kept label `Đăng nhập`, exposed one spinner, set pending/disabled on action and both fields; after refusal the URL stayed on `authState=sign-in`, all fields/actions re-enabled, and one assertive `slot=errorMessage` rendered `Email hoặc mật khẩu chưa đúng. Kiểm tra lại rồi thử tiếp.` | No usable session/challenge transition on refusal; localized actionable recovery; one semantic danger owner; duplicate UI submit unavailable while pending | Fixture marker correctness |
| E6 | Correct-password retry cleared the prior refusal, repeated the single pending owner, then changed URL to `authState=sign-in-otp` | Failure recovery preserves orientation and opens a fresh OTP challenge | Final proof/session |
| E7 | OTP state used heading `Nhập OTP`, the approved stable description, one digits-only `autocomplete=one-time-code` input, six slots, active slot tracking, resend/change-email recovery actions and the regular OTP surface | Approved OTP semantics and Grammar-owned control composition | OTP validity before submission |
| E8 | OTP submit disabled the OTP control/action, showed one pending spinner, and navigated directly to `/vi/dashboard`; no sign-in success/redirect interstitial appeared | Valid proof established a session and the destination was the completion feedback | Exact UAT marker |
| E9 | Read-only primary identity lookup after Dashboard: exact email row found, non-empty Keycloak id found, but `users.is_uat=false` | Runtime identity is the reserved account, and its mandatory UAT marker is wrong | Keycloak `uat_case` attribute (not queried with admin credentials) |
| E10 | Root repair receipt: canonical `.uat/scripts/provision-accounts.mjs --case authentication.sign-in.password-failed` updated the exact Keycloak attributes and UserEntity; independent primary read-only retest found exactly one matching row with exact email, non-empty Keycloak id and `users.is_uat=true` | F1 was repaired on the exact case identity without reusing another account or exposing secrets | Unrelated accounts or cases |

## Behavior decision

Decision: `PASS`

The wrong-password attempt created no usable transition, the correct retry opened one OTP challenge,
valid proof reached Dashboard directly, and the exact runtime identity now satisfies the mandatory
`users.is_uat=true` contract after canonical repair and independent retest.

## UX decision

Decision: `PASS`

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton | `N/A` | Entry has no remote page-data dependency | Static auth entry rendered immediately; no initial remote page-data wait exists | E4 |
| Loading | `PASS` | Refusal retry and OTP verification prevent duplicates | Each applicable action kept its label, showed one spinner, disabled its form controls and prevented a second UI submission; hook guard tests also reject a captured duplicate handler | E2, E5, E6, E8 |
| Render completeness | `PASS` | Refusal and recovery actions render completely | Localized refusal, editable fields, OTP heading/description/control, resend/change-email choices and Dashboard destination all rendered | E5-E8 |
| Journey completion | `PASS` | Failure → correction → OTP → Dashboard | Completed exactly once in the isolated session with no success interstitial | E5-E8 |

## UI decision

Decision: `PASS`

Authority: `fe.ui` + Grammar Common + Core Grammar.

Runtime evidence showed the compact centred details surface, one HeroUI pending Button owner, one
assertive HeroUI ErrorMessage owner, and the approved OTP hierarchy with a Grammar-owned six-slot
InputOTP. The refusal remained visually subordinate to the task while retaining danger treatment and
full recovery affordance. Open UI `SUSPENSE`: `0`.

## Findings and repair loop

### F1 — UAT marker was false on the exact runtime identity (`RESOLVED`)

- Decision owner: Behavior / backend UAT fixture provisioning.
- Evidence: E9.
- Expected: the reserved account row has `users.is_uat=true`, with the case identity traceable to
  `authentication.sign-in.password-failed`.
- Observed: exact email and Keycloak id matched, but `users.is_uat=false`.
- Repair: root ran the canonical exact-case provisioner, updating Keycloak attributes and the UserEntity
  without logging secrets.
- Retest: E10 independently proved one exact matching row with a non-empty Keycloak id and
  `users.is_uat=true`.
- State: `RESOLVED`.
- This is not UI `SUSPENSE` and not a browser/runtime blocker.

## TEACHER feedback

`TEACHER feedback`: split password refusal from the former umbrella and prove recovery through Dashboard in this exact case.

## Retest receipt

Runtime run 1 used only `uat-auth-sign-in-password-failed@starci.local` and
`auth.sign-in.password-failed.isolated-1`. It proved the complete failure/recovery journey and exposed
F1. The canonical exact-case repair was then followed by independent identity retest E10, which proved
the same reserved identity now carries `users.is_uat=true`. Behavior, UX and UI therefore have current
evidence in the same closed case boundary.

The earlier recovery receipt that used retired `uat-auth-sign-in-unhappy@starci.local` remains excluded.
Do not reuse retired session `auth.sign-in.unhappy.isolated-1` or its verdict.

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior / UX / UI | Independent `PASS` decisions | Behavior `PASS`; UX `PASS`; UI `PASS` |
| Open UI SUSPENSE | `0` after runtime review | `0` |
| Open findings | `0` | `0` (F1 resolved by E10) |
| Account / agent / browser isolation | `PASS` | `PASS`; exact account/session used and marker retest passed |

Final case result: `PASS — NO SUSPENSE`.
