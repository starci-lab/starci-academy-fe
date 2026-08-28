# UAT Case — Authentication / Sign in / Invalid OTP

Status: `accepted`

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-in.invalid-otp` |
| Case kind | `failure/recovery — six-digit OTP mismatch` |
| User goal | Recognize a rejected OTP, enter a valid proof, and finish sign-in without losing the challenge |
| Entry | `/vi/authentication?authState=sign-in-otp` with this case's live challenge |
| Success condition | Mismatched OTP creates no session and keeps recovery available; valid proof then reaches `/vi/dashboard` |
| In scope | Server-reached mismatch, retained code step/challenge, retry, Dashboard identity |
| Out of scope | Malformed input, expired/missing challenge, resend delivery, transport, throttle |

## Source provenance

| Field | Value |
|---|---|
| Journal prepared at | `2026-08-28T14:41:50+07:00` |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Runtime | `http://127.0.0.1:3000`, Next dev FE + local BE/Keycloak/PostgreSQL/Redis, exact case-owned browser tab |
| Contract evidence | FE keeps the code step on refusal; BE returns `CHALLENGE_OTP_MISMATCH_EXCEPTION` for a known challenge |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account | `uat-auth-sign-in-invalid-otp@starci.local` | Reserved only for this case; `is_uat=true` |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Random UAT password; plaintext resolves only from trusted runtime `.key` and stays memory-only |
| Agent | `sol-auth-sign-in-invalid-otp` | This bounded task owns only this case |
| Browser session | `auth.sign-in.invalid-otp.isolated-1` | Fresh tab opened for only this case; terminal URL `/vi/dashboard` |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Challenge | Live, known, owned by this identity | Exact account reached URL-owned `authState=sign-in-otp` |
| Proofs | One known mismatch then a current valid OTP | Both remained secret and case-local; no value persisted |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Submit one wrong six-digit OTP | No session; challenge remains usable | Refusal explains retry and does not strand user | Error is semantic and OTP task remains primary |
| 2 | Replace it with the current valid OTP | Same challenge accepts valid proof once | Retry has visible pending feedback | Error clears without composition shift |
| 3 | Observe Dashboard | Exact case session is established | Recovery reaches completion | No success interstitial |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E0 | FE/BE source contract review | Invalid OTP differs from missing/expired challenge | Runtime copy or recovery |
| E1 | FE hook test: reached OTP refusal preserves server message/code, remains on `code`, clears pending, stores no session token | State machine keeps mismatch retryable and separate from transport | Current runtime, localized copy or visual semantics |
| E2 | FE component tests: refused code renders `role=alert` with `slot=errorMessage`; verify pending disables OTP/action, retains action identity and renders Spinner; hook blocks verify while pending/resending | Expected semantic/error/loading/duplicate contracts exist | Browser-computed danger treatment or request counts |
| E3 | BE handler test maps known-challenge mismatch to `ChallengeOtpMismatchException`; valid proof returns parked tokens | Server distinguishes mismatch from expired/missing challenge and accepts later valid proof by contract | GraphQL envelope copy in the running locale |
| E4 | Source risk: BE exception message is `Challenge OTP mismatch`; FE localizes credential refusal only and otherwise passes a server message through before falling back to Vietnamese `status.refused` | Exact localization gap to challenge at runtime | That English actually appears in the browser |
| E5 | Browser connection attempt: requested exact `iab`; selection returned unavailable and one permitted inventory check returned `[]` | Case browser/session cannot be claimed in this agent context | Product behavior or UI verdict |
| E6 | Fresh action-time `TEACHER feedback`: `chuẩn làm đi`; exact `iab` claim retried immediately afterward and again returned `Browser is not available: iab` | Secret entry into the exact local case was authorized, but the required browser context still cannot be claimed | Any product/runtime outcome |
| E7 | Sol main opened a fresh case-owned tab, submitted the exact account, and reached `?authState=sign-in-otp` with the six-slot OTP task and exact UAT email hint | Correct account/challenge and URL-owned OTP state were active | Mismatch and later recovery |
| E8 | A deliberately different six-digit proof stayed on `?authState=sign-in-otp` and rendered `role=alert`: `Mã OTP chưa đúng. Kiểm tra lại rồi thử tiếp.`; retry and both secondary controls remained present | No session on mismatch; localized, actionable recovery without losing the task | Acceptance of the valid proof |
| E9 | FE repaired stable OTP exception mapping in the connected auth block; targeted component suite passed `24/24` | English domain copy no longer leaks into the Vietnamese journey | Exact runtime navigation |
| E10 | The current valid proof in the same clean challenge navigated directly to `/vi/dashboard`; UserEntity audit returned exactly one row with non-empty `keycloak_id` and `is_uat=true` | Recovery completes without success interstitial and preserves account isolation | Other unhappy cases |
| E11 | Cross-check exposed a loopback cookie-host bug: FE page `127.0.0.1` called GraphQL on `localhost`, so Dashboard survived only in memory. FE now aligns only loopback API host spellings; `6` targeted suites / `124` tests pass. A fresh exact-case retest repeated mismatch → current proof → Dashboard, then browser reload remained on `/vi/dashboard` with nine Dashboard headings | The authenticated session now persists across reload without storing a bearer token in web storage | Production cross-domain configuration, which is deliberately not rewritten |

## Behavior decision

Decision: `PASS`

The exact isolated account was refused on the mismatch, retained its challenge, then accepted the
current proof and navigated directly to Dashboard. A cold reload restored the cookie-backed session
and remained on Dashboard. No session was created before valid verification.

## UX decision

Decision: `PASS`

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton | `N/A` | OTP state has no initial remote page-data skeleton requirement | Static auth-state contract; runtime not needed to invent a skeleton | E1–E2 |
| Loading | `PASS` | Verify action stays named, shows perceptible Spinner and prevents duplicate submission | Shared action contract is covered by component/hook tests; runtime retained the same action and blocked no recovery | E2, E9 |
| Render completeness | `PASS` | Localized actionable mismatch, retry and secondary actions render | Vietnamese ErrorMessage, OTP task, resend and change-email controls all remained visible | E8–E9 |
| Journey completion | `PASS` | Wrong proof → valid proof → exact-account Dashboard, including reload persistence | Completed in the same clean challenge and case-owned tab; reload stayed on Dashboard | E7–E11 |

## UI decision

Decision: `PASS`

Authority: `fe.ui` + Grammar Common + Core Grammar. The accepted OTP composition stayed primary,
rendered a semantic ErrorMessage without layout replacement, and recovered directly. Open `SUSPENSE`: `0`.

## Findings and repair loop

| Finding | Decision axis | Severity | Owner | Current evidence | Required closure | State |
|---|---|---|---|---|---|---|
| Invalid-OTP exception leaked domain-boundary English risk in the Vietnamese journey | `UX | UI` | High | FE connected error mapping | E4 | Stable code/message now maps to localized actionable copy; exact browser retest | `closed` — E8–E9 |
| Exact IAB context was unavailable to the delegated agent | `Behavior | UX | UI` | Blocker | Runtime/browser context | E5–E6 | Sol main claimed a fresh exact-case tab and ran the full recovery | `closed` — E7–E10 |

## TEACHER feedback

`TEACHER feedback`: invalid OTP is independent from expired OTP and must prove correction through Dashboard.

Fresh action-time `TEACHER feedback`: `chuẩn làm đi`. This authorizes typing only this case's existing
UAT password and OTP into the local app, but does not authorize a substitute browser/session. E6 proves
the exact IAB remained unavailable before any secret was entered.

## Retest receipt

Sol main ran the requested exact receipt after the delegated browser blocker. One stale mailbox lookup was
discarded and a clean challenge was created in the same case tab. The clean mismatch produced the
localized ErrorMessage and stayed on the OTP URL; the current proof then navigated directly to
Dashboard. A cross-case reload exposed the `localhost`/`127.0.0.1` cookie-host split, so the case was
reopened, the shared loopback transport was repaired, and the full exact-account receipt ran again in
a fresh case tab. Dashboard remained after reload. The case was canonically provisioned so the exact
UserEntity row is unique and `is_uat=true`. Password, OTP, challenge id, token, cookie and mailbox body
were not persisted.

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior / UX / UI | Independent `PASS` decisions | `PASS / PASS / PASS` |
| Open UI SUSPENSE / findings | `0 / 0` | `0 / 0` |
| Isolation | `PASS` | One case, one account, one fresh browser tab; UserEntity `is_uat=true` |

Final case result: `PASS — NO SUSPENSE`.
