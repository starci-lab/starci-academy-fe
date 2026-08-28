# UAT Case — Authentication / Sign in / Unhappy

Status: `awaiting-feedback`

> **Retired umbrella provenance.** `TEACHER feedback` yêu cầu mỗi failure journey có một account,
> agent owner và browser session riêng, nên file gộp này không còn được claim để chạy tiếp. Toàn bộ
> evidence, findings và verdict bên dưới được giữ nguyên như lịch sử; không case mới nào được thừa kế
> verdict của file này. Active replacements: `authentication.sign-in.password-failed`,
> `authentication.sign-in.not-receive-otp`, `authentication.sign-in.invalid-otp`,
> `authentication.sign-in.expired-otp`, `authentication.sign-in.missing-challenge`,
> `authentication.sign-in.server-unavailable`, `authentication.sign-in.rate-limited`, và
> `authentication.sign-in.duplicate-submission`.

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-in.unhappy` |
| Case kind | `unhappy` |
| User goal | Recover from sign-in failures and still reach Dashboard with the dedicated UAT identity |
| Entry | Guest opens `/vi/authentication?authState=sign-in` |
| Success condition | After each exercised failure, recovery reaches OTP and then `/vi/dashboard` |
| In scope | Invalid credentials, invalid/expired OTP recovery, resend, missing URL/challenge recovery, transport failure |
| Out of scope | Google/GitHub external identities (requires user-owned identity approval), sign-up, forgot-password |

## Source provenance

| Field | Value |
|---|---|
| Reviewed at | `2026-08-28T12:00:00+07:00` |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Relevant dirty files | FE pre-existing dirty auth/UAT files; no product source changed by this audit |
| Runtime | FE `http://127.0.0.1:3000`; BE `http://localhost:3001`; local development |
| Selected Grammar | `@starci/grammar/core`; `fe.ui` + Grammar Common/Core |
| Viewports | In-app browser default viewport; exact override not applied |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account | `uat-auth-sign-in-unhappy@starci.local` | Registry `is_uat=true`, exact `uat_case` |
| Agent | `current chat / sign-in-unhappy case-owner` | Owns only this case |
| Browser session | `auth.sign-in.unhappy.isolated-1` | Fresh tab created for this case; no shared tab reused |
| Mailbox / external identity | Local UAT mailbox not reached because sign-in init returned 401 | No secret recorded |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Account | Existing dedicated UAT account | Registry entry exists with `present`; account action used only this case identity |
| Credential | Existing encrypted-runtime UAT password | Read only from backend `.stacks/dev/runtime/files/uat-account-password.key`; never recorded |
| Guest session | No prior authentication | Fresh isolated browser tab opened at sign-in route |
| Mailbox | Disposable local mailbox | Not reached: correct-credential retry still returned HTTP 401 |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Open sign-in route | Guest starts unauthenticated | Form is immediately usable | Heading, OAuth stack, fields, options, primary action and prompt render completely |
| 2 | Submit wrong password for dedicated UAT email | No session is created; details remain editable | Failure is recoverable in-place, but message must be reader-facing | Error uses alert region but currently exposes transport wording |
| 3 | Replace wrong password with the existing UAT credential and submit | Expected: init opens OTP; observed: HTTP 401 again, no challenge | Recovery cannot proceed to OTP until auth/fixture 401 is repaired | Form remains stable and editable |
| 4 | Open `?authState=sign-in-otp` without a stored challenge | Safe fallback to details route | User is not stranded in an unusable OTP step | Details surface renders with `authState=sign-in` |
| 5 | OTP wrong/expired, resend and final correct OTP | Pending execution not reached because init never opened challenge | Must be rerun after init recovery; teacher requires failure checkpoint → resend/correct OTP → Dashboard | Must preserve OTP state and URL during recovery |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E1 | Fresh tab DOM at sign-in shows complete controls and empty alert | Entry render completeness and isolation | Skeleton or delayed-load behavior |
| E2 | Wrong-password submit leaves URL on authentication and shows alert `Request failed with status code 401`; fields and action remain available | No session was created; recovery surface remains usable; raw transport leakage is directly visible | Correct localized refusal |
| E3 | Retrying with the existing encrypted-runtime UAT password still leaves the same 401 and no OTP challenge | Sign-in init cannot reach OTP under current runtime/fixture; recovery is technically blocked | Whether OTP wrong/expired/resend branches work |
| E4 | Direct `authState=sign-in-otp` URL without challenge resolves to `authState=sign-in` and renders details | Missing challenge URL recovery safely falls back to details | Successful re-entry to Dashboard |
| E5 | Post-split sanitized runtime receipt using this retired identity/session: wrong password → localized Vietnamese refusal → corrected password → OTP → direct `/vi/dashboard`; no password/OTP retained | The historical umbrella fixture later recovered end to end after the earlier E2–E3 state | Any replacement case, because account and browser ownership do not match their new reservations |

## Behavior decision

Decision: `FAIL`

| Rule / effect | Expected | Observed | Evidence | Owning source |
|---|---|---|---|---|
| Invalid password refusal | No session, localized refusal, editable form | No session and editable form; refusal is HTTP-level copy | E2 | FE error mapping + BE response boundary |
| Correct credential recovery | Init opens OTP, then OTP proof reaches Dashboard | Correct credential retry also returns 401; no challenge/mailbox evidence | E3 | BE/runtime fixture or Keycloak auth configuration |
| Missing challenge URL | Do not submit orphan OTP; recover to details | Falls back to details and normalizes URL | E4 | FE `useAuthPanel` URL hydration |
| Wrong/expired OTP + resend | Refusal remains recoverable, resend opens replacement, correct OTP reaches Dashboard | Not reached because init 401 blocks challenge | E3 | Pending retest after init repair |

## UX decision

Decision: `FAIL`

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton | `N/A` | No remote page-data skeleton required for entry form | Form renders immediately | E1 |
| Loading | `BLOCKED` | Init and resend expose observable pending feedback | Init settles to 401 before OTP; OTP/resend pending unavailable | E2–E3; FE/BE retest |
| Render completeness | `FAIL` | Error explains refusal and next recovery action | Raw `Request failed with status code 401` is implementation-level and does not guide recovery | E2; FE error presentation + BE envelope |
| Journey completion | `FAIL` | Every failure branch recovers to Dashboard where possible | Wrong-password branch is usable, but correct retry cannot reach OTP due repeated 401 | E3; BE/runtime fixture first, then FE retest |

## UI decision

Decision: `PASS`

Authority: `fe.ui` + `fe.grammar-common-overview` + Core Grammar. Open SUSPENSE: `0`.

| State / viewport | Region | Data or control rendered | Required UI treatment | Authority binding | Evidence |
|---|---|---|---|---|---|
| Sign-in details / default | Full auth panel | Heading, description, OAuth actions, email/password, remember/forgot, submit, sign-up prompt | Centred compact form composition; error in semantic alert | Core auth composition + ErrorMessage | E1 |
| Invalid credentials / default | Error region | Reader-facing refusal | Alert must not display raw HTTP implementation text | ErrorMessage semantic treatment | E2 (runtime finding) |
| Missing challenge URL / default | Details fallback | Normal sign-in controls | Safe details fallback, no orphan OTP | URL-state rule in auth flow | E4 |

## SUSPENSE register

| ID | Exact render question authority cannot answer | Proposed authority owner | Thầy feedback | Resolution evidence |
|---|---|---|---|---|
| None |  |  |  |  |

## Findings and repair loop

| Finding | Decision axis | Severity | FE/BE owner | Fix applied | Automated proof | Runtime retest | State |
|---|---|---|---|---|---|---|---|
| Sign-in init returns HTTP 401 even when using the existing case UAT password, so failure recovery cannot reach OTP/Dashboard | `Behavior | UX` | Blocker | BE/runtime fixture (Keycloak/UAT account) | None by audit | Existing backend auth tests do not prove current browser fixture | Required before OTP/resend recovery retest | `open` |
| Invalid-credential alert exposes `Request failed with status code 401` instead of a localized refusal and recovery hint | `UX | UI` | High | FE error presentation + BE envelope | None by audit | Existing component contract only proves alert semantics | Required after init error mapping is repaired | `open` |

## Feedback calibration

| Decision | AI conclusion | Thầy correction / approval | Authority learning |
|---|---|---|---|
| Behavior | `FAIL`: no challenge or Dashboard recovery because init returns 401 | `TEACHER feedback`: unhappy case must complete recovery to success condition whenever possible | A failure checkpoint alone is insufficient; every reachable branch needs a recovery checkpoint and final completion evidence |
| UX | `FAIL`: raw error and blocked completion | `TEACHER feedback`: error that looks acceptable but cannot recover is still UX FAIL | Error presentation and recovery continuity are one journey requirement |
| UI | `PASS` for observed rendered states; no authority gap | Pending teacher/runtime retest | Runtime defect is a finding, not SUSPENSE when render authority is clear |

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior decision | `PASS` or justified `N/A` | `FAIL` |
| UX decision | `PASS` or justified `N/A` | `FAIL` |
| UI decision | `PASS` | `PASS` for observed states |
| Open UI SUSPENSE | `0` | `0` |
| Open findings | `0` | `2` |
| Account/session isolation | `PASS` | `PASS` |

Final case result: `NOT PASS` — awaiting BE/runtime fixture repair, then full OTP/wrong-OTP/expired-OTP/resend recovery retest in this isolated session.
