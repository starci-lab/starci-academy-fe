# UAT Case — Authentication / Sign in / Server unavailable

Status: `pass`

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-in.server-unavailable` |
| Case kind | `failure/recovery — sign-in init transport unavailable` |
| User goal | Understand that credentials were not judged, retry after service recovery, and complete sign-in |
| Entry | Dedicated guest at `http://server-unavailable.lvh.me:3000/vi/authentication?authState=sign-in` while the local BE is stopped in a bounded outage window |
| Success condition | Transport failure creates no false credential verdict, challenge or session; restored retry reaches OTP and the exact case session remains at `/vi/dashboard` after refresh |
| In scope | Init transport failure, localized retry guidance, restored service, OTP proof, direct Dashboard and session persistence |
| Out of scope | Reached 401 refusal, verify/resend lost-response ambiguity, throttle, OAuth and Dashboard composition quality |

## Source provenance

| Field | Value |
|---|---|
| Runtime reviewed at | `2026-08-28T15:43:34+07:00` |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` (dirty shared working tree) |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` (dirty shared working tree) |
| Relevant dirty files | FE AuthenticationPanel/ErrorMessage/Button/API-host changes from the shared authentication repair; this case changed only this journal |
| Runtime | FE `http://server-unavailable.lvh.me:3000`; BE `http://127.0.0.1:3001`; Next.js development mode; one root-owned bounded BE stop/start window |
| Selected Grammar | Core Grammar in the shared FE working tree |
| Viewport | Browser receipt `1280 × 720`, DPR `1.5` |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account | `uat-auth-sign-in-server-unavailable@starci.local` | Registry reservation; runtime exact UserEntity query returned one row with `is_uat=true` and non-empty `keycloak_id` |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Random UAT password; plaintext resolves only from trusted runtime `.key` and stays memory-only |
| Agent | `case_server_unavailable_runtime_sol` | Owned only this case runtime and journal |
| Browser session | `auth.sign-in.server-unavailable.isolated-1` | Fresh named session on the dedicated `server-unavailable.lvh.me` loopback host; not reused by sibling cases |
| OTP ledger | Exact-email local jobs row | OTP was read into agent memory only, entered once, then the browser runtime holding password/OTP bindings was reset |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Account | Dedicated present account with rotated UAT password | Valid retry opened OTP; E5 |
| Outage injection | BE port unavailable only during this case's bounded submit | Root granted the window; one TCP probe returned unavailable before E2 |
| Restoration | Same BE restarted before recovery | Root restoration signal followed by a successful init; E5 |
| Browser | Guest exact session and host | Complete Vietnamese sign-in form at the exact entry; E1 |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Open the dedicated guest form | No pre-existing case session | Details form is complete and actionable | Heading, controls and empty alert owner render |
| 2 | Submit valid case details exactly once during the bounded outage | No reached credential verdict, challenge or session | Submit owns pending; failure copy explains service unavailability and retry remains on the same form | Pending Spinner keeps `Đăng nhập`; danger ErrorMessage is the single failure owner |
| 3 | Restore BE, re-enter the cleared details and retry on the same form | One fresh init opens the OTP challenge | Recovery needs no navigation or reorientation | Prior error clears; current-state heading/control render |
| 4 | Enter the trusted local OTP proof and submit | Exact case session is established | Journey goes directly to Dashboard | No success interstitial |
| 5 | Refresh Dashboard | Session remains authenticated and exact identity is visible | Completion is stable | Destination remains the feedback; Dashboard visual quality is outside this case |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E1 | Fresh exact session rendered `Đăng nhập`, email/password, remember-me, recovery, OAuth and submit controls; submit was enabled and alert text empty | Guest render completeness and isolation entry | Failure or authenticated behavior |
| E2 | Immediately after the single outage submit, primary Button was disabled and pending while retaining label `Đăng nhập`; URL remained `authState=sign-in` | Local pending owner and no premature transition | Settled failure semantics |
| E3 | Settled state showed `Chúng tôi không kết nối được tới máy chủ. Kiểm tra đường truyền rồi thử lại.`; submit re-enabled; OTP and Dashboard content were absent | Honest transport classification, actionable recovery and no false challenge/session | Credential refusal behavior |
| E4 | The visible failure owner had `role=alert`, `slot=errorMessage`, `aria-live=assertive` and computed danger color `lab(57.7281 69.493 84.8294)` | HeroUI ErrorMessage semantics and danger treatment in the observed state | A persisted screenshot of the outage state; none was captured |
| E5 | After restoration, the same form accepted the exact case details, retained Button pending, cleared the failure and navigated to `authState=sign-in-otp` | Recovery without reorientation and a fresh reached-server verdict | Final session persistence |
| E6 | Trusted exact-email ledger yielded a six-digit proof in memory; OTP submit retained pending/action identity and routed directly to `/vi/dashboard` | Proof acceptance and no success interstitial | Refresh persistence |
| E7 | Browser refresh remained at `http://server-unavailable.lvh.me:3000/vi/dashboard`, `Tiếp tục học` remained visible, auth heading/alerts were absent, and exact case identity was visible | Stable authenticated completion and exact browser identity | Dashboard UI quality, explicitly out of scope |
| E8 | Exact UserEntity query returned `1 | true | non-empty keycloak_id` for this case identity | One internal UAT user with `is_uat=true` and identity binding | Keycloak attribute payload text |
| E9 | [Recovery Dashboard after refresh](./sign-in-server-unavailable/screenshots/recovery-dashboard-after-refresh.png) at `1280 × 720` shows the exact UAT fixture identity and authenticated shell; it contains no password, OTP, token or cookie | Destination and exact identity were visibly reached after refresh | Outage ErrorMessage layout or Dashboard fidelity |

## Behavior decision

Decision: `PASS`

| Rule / effect | Expected | Observed | Evidence | Owning source |
|---|---|---|---|---|
| Transport failure semantics | No reached credential verdict, challenge or session | Same details state; localized transport error; no OTP/Dashboard | E2–E4 | `FE + BE runtime` |
| Retry after restoration | Fresh init opens one live challenge | Restored retry reached exact OTP URL | E5 | `FE + BE` |
| Proof and session | Valid proof establishes exact case session | Direct Dashboard, refresh persistence, exact identity/UserEntity | E6–E8 | `FE + BE` |

## UX decision

Decision: `PASS`

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton | `N/A` | Static Authentication entry has no page-data skeleton requirement | Form rendered immediately | E1 |
| Loading | `PASS` | Each wait is owned by the initiating action and suppresses duplicate submit | Both outage and restored submits retained label, Spinner/pending and disabled state | E2, E5–E6 |
| Render completeness | `PASS` | Transport guidance, retry form, OTP task and final destination all render when relevant | Every state rendered its current task; transport message did not masquerade as refusal | E1, E3–E7 |
| Journey completion | `PASS` | Outage → same-form correction/retry → OTP → Dashboard → refresh | Completed under the dedicated account/session; no dead end or interstitial | E3–E8 |

The browser cleared at least one credential field after the transport failure, so the restored retry required re-entry. This did not reorient or dead-end the user: the same form and actionable transport guidance remained visible, and the recovery completed.

## UI decision

Decision: `PASS`

Authority: `fe.ui` + Grammar Common + Core Grammar.

- `SUSPENSE: 0`; the authority already defines pending ownership, ErrorMessage semantics and direct destination feedback.
- The observed outage state used one pending owner in the primary Button and one visible danger ErrorMessage owner with alert/assertive semantics.
- The error screenshot was not captured before service restoration. Therefore this verdict does not claim unrecorded pixel-level dimensions for the outage card; it relies on the captured live visibility plus computed semantic/color receipt E4 and the already-rendered exact form structure E1.
- The persisted recovery screenshot after completion proves only direct destination/exact identity at the recorded viewport. It is not used to pass Dashboard composition.

### SUSPENSE register

| ID | Exact render question authority cannot answer | Proposed authority owner | Thầy feedback | Resolution evidence |
|---|---|---|---|---|
| None | None | N/A | Existing authority was sufficient | E1–E7 |

## Findings and repair loop

| Finding | Decision axis | Severity | FE/BE owner | Fix applied | Automated proof | Runtime retest | State |
|---|---|---|---|---|---|---|---|
| No open case finding | N/A | N/A | N/A | Shared Authentication repair was already present before this isolated run | Shared targeted tests owned by root | Full outage/recovery rerun E1–E8 | `pass` |

## TEACHER feedback

`TEACHER feedback`: server unavailable is independent from wrong password and must recover after restoration to Dashboard.

The case kept transport copy independent from credential refusal and proved the complete recovery to a refresh-stable exact-identity Dashboard session.

## Retest receipt

- Bounded outage and restoration were coordinated by root so sibling cases did not submit during the unavailable window.
- Exactly one init was submitted while unavailable; no retry occurred until the explicit restoration signal.
- After restoration the same case session completed details → OTP → Dashboard → refresh.
- Password, OTP, token and cookie were never printed, persisted or written to this journal; the agent browser runtime holding memory-only secret bindings was reset after completion.

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior decision | `PASS` | `PASS` |
| UX decision | `PASS` | `PASS` |
| UI decision | `PASS` | `PASS` |
| Open UI SUSPENSE | `0` | `0` |
| Open findings | `0` | `0` |
| Account/session isolation | `PASS` | `PASS` |

Final case result: `PASS`.
