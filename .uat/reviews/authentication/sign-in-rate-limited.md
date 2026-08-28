# UAT Case — Authentication / Sign in / Rate limited

Status: `PASS`

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-in.rate-limited` |
| Case kind | `failure/recovery — strict auth throttle reached` |
| User goal | Understand that attempts are temporarily limited, wait safely, and still finish sign-in |
| Entry | Clean guest state on the case-local throttle origin |
| Success condition | The limited request creates no new challenge/session, guidance names the cooldown, and a later valid attempt completes OTP → `/vi/dashboard` → cold reload with the exact identity |
| In scope | Strict throttle response, localized recovery guidance, cooldown, OTP completion, session persistence |
| Out of scope | Shared-IP traffic, ordinary credential refusal, transport outage, Dashboard layout audit |

## Source provenance

| Field | Value |
|---|---|
| Journal finalized at | `2026-08-28T16:03:06+07:00` |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Runtime | `http://rate-limited.lvh.me:3000/vi/authentication?authState=sign-in` |
| Shared repair revision | Working-tree repair on the branches above; BE emits `RATE_LIMIT_EXCEEDED_EXCEPTION`, FE maps it to reader `RATE_LIMITED` |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account | `uat-auth-sign-in-rate-limited@starci.local` | Used only by this case; `UserEntity` count `1`, Keycloak link present, `is_uat=true` |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Random UAT password; plaintext resolves only from trusted runtime `.key` and stays memory-only |
| Agent | `sol-auth-sign-in-rate-limited` | Sole runtime owner |
| Browser session | `auth.sign-in.rate-limited.isolated-1` | One browser session and, for the terminal cycle, exactly one tab from clean sign-out through cold reload |
| Throttle key | `rate-limited.lvh.me` case origin | Non-production tracker isolates the exact `.lvh.me` hostname from sibling cases |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Account | Rotated credential can open the ordinary OTP challenge | Exact account reached OTP after the real cooldown |
| Guest state | No pre-existing session before the terminal cycle | UI sign-out completed; a pre-cycle check redirected Dashboard to sign-in with identity count `0`; that check was closed before the terminal cycle |
| Throttle fixture | Case-local strict budget, `10/min` | Attempts 1–10 reached ordinary refusal; attempt 11 reached the isolated strict limit |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Submit recoverable wrong details until the strict budget is exhausted | Attempts 1–10 refuse credentials; attempt 11 stays on `authState=sign-in`, opens no OTP, and establishes no new identity | Copy says the action is too fast and gives `60 giây` before retry | Localized danger `ErrorMessage` is visible in the form hierarchy |
| 2 | Stop submitting and wait the real cooldown | No reset shortcut and no duplicate request loop | Form remains usable; user knows exactly when retry is useful | Error remains stable without layout collapse |
| 3 | Retry with the exact valid UAT details | Ordinary OTP step opens at `authState=sign-in-otp` | Recovery reuses the same journey instead of dead-ending | Rate-limit error clears; OTP state renders normally |
| 4 | Submit the exact-email OTP | Exact identity goes directly to `/vi/dashboard` | No success/redirecting interstitial | Destination exposes the expected UAT identity |
| 5 | Cold reload the same Dashboard tab and wait seven seconds | Session restoration keeps the same identity and destination | The recovery is durable, not a momentary client-only success | Post-refresh identity remains visible; no sign-in flash settles as the final state |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E1 | Pre-repair attempt 11 returned GraphQL HTTP `200` with `INTERNAL_SERVER_ERROR` / nested `http.status=500` despite retry metadata; FE showed transport copy | The original failing boundary and the repair target were real | Final behavior |
| E2 | Shared repair tests: BE throttler/Apollo `8/8`; FE auth slice `100/100`; lint and typecheck pass | Stable boundary mapping and regression coverage | Browser presentation |
| E3 | Clean terminal cycle: attempts 1–10 localized credential refusal; attempt 11: `Bạn thao tác quá nhanh. Thử lại sau 60 giây.` | Correct strict-boundary behavior and localized recovery | Session restoration |
| E4 | Attempt 11 retained `?authState=sign-in`, submit was enabled after settlement, and OTP heading count remained `0` | No challenge transition and a usable recovery action | Password correctness |
| E5 | Computed refusal semantics: visible `role=alert`, `slot=errorMessage`, danger color, `12px` font, `16px` line-height, `416×16` box | Error semantics, hierarchy, and readable placement | Dashboard UI quality |
| E6 | [Final clean refusal](./sign-in-rate-limited/screenshots/final-clean-rate-limit-refusal.png) — email/password were cleared before capture and the image was visually inspected | Reader-visible localized refusal with no credential length/state leak | Network internals |
| E7 | After the real 60-second cooldown, valid details opened OTP; exact-email ledger OTP (memory-only) navigated directly to `/vi/dashboard` with exact identity count `1` | Full unhappy → happy recovery and no interstitial | Cold-reload durability |
| E8 | One-tab cold reload timeline at `0.7, 1.4, 2.1, 2.8, 3.5, 4.2, 4.9, 5.6, 6.3, 7.0s`: URL stayed `/vi/dashboard`, exact identity count stayed `1`, sign-in heading stayed `0` | Durable same-tab refresh restoration; the earlier probe/transient run is superseded | Dashboard feature correctness |
| E9 | [Dashboard after cold refresh](./sign-in-rate-limited/screenshots/final-recovery-dashboard-after-refresh.png) — exact UAT identity and Dashboard context visible | Final destination and post-refresh identity | A separate Dashboard UI audit |
| E10 | `UserEntity`: count `1`, exact email `true`, Keycloak linked `true`, `is_uat=true` | Correct account ownership and UAT marking | Visual quality |

## Behavior decision

Decision: `PASS`

The terminal cycle started from a verified guest state, reached the strict limit only on its dedicated origin, created no OTP transition while limited, recovered after the real cooldown, completed exact-email OTP, entered Dashboard directly, and retained the exact identity through a seven-second cold-reload observation window.

## UX decision

Decision: `PASS`

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton | `PASS` | Stable local form while the failure settles | No blank page or collapsed card | E6 |
| Loading | `PASS` | One action settles before another; no dead/pending control | Each submitted action settled; submit remained usable for the instructed retry | E3–E5 |
| Render completeness | `PASS` | Explain the limit and when recovery is useful | Localized message names the 60-second wait | E3, E6 |
| Journey completion | `PASS` | Limit → cooldown → OTP → Dashboard → reload | Completed on one tab with exact identity | E7–E9 |

## UI decision

Decision: `PASS`

Authority: `fe.ui` + Grammar Common + Core Grammar. The failure uses the form-owned HeroUI-compatible `ErrorMessage` treatment, keeps the compact centered card and visible recovery action, and avoids raw server/transport copy. The final refusal and after-refresh destination were both visually inspected. Dashboard composition itself remains owned by its separate UAT case.

Open UI `SUSPENSE`: `0`.

## Findings and repair loop

1. **Found:** stock GraphQL throttling escaped as HTTP `200` plus `INTERNAL_SERVER_ERROR`, so FE could only render transport copy.
2. **Repaired by shared owner:** BE now emits a stable rate-limit application exception with retry seconds; Apollo exposes rate-limit semantics; FE maps the boundary to localized reader copy.
3. **Regression:** BE boundary tests `8/8`; FE auth slice `100/100`; lint/typecheck pass.
4. **Retest:** clean isolated runtime produced the localized 60-second message and completed the full recovery.
5. **Discarded exploratory evidence:** an earlier run mixed a later Dashboard probe with an existing refresh session and produced contradictory tab state. It is not used for any verdict. The authoritative terminal receipt is the clean, single-tab cycle in E3–E9.

Open findings: `0`.

## TEACHER feedback

`TEACHER feedback`: one unhappy case owns one account, one agent and one browser session; the failure is only complete when it can return to the happy destination.

`TEACHER feedback`: never expose raw transport/server copy; use the common error component with a reader-facing recovery action.

`TEACHER feedback`: direct success goes to Dashboard without a success/redirecting interstitial, and reload must preserve the journey/session state.

`TEACHER feedback`: screenshots are evidence only when they are personally inspected and contain no real password, masked password length, OTP or token.

## Retest receipt

| Receipt | Result |
|---|---|
| Dedicated strict origin | `PASS` — sibling origins untouched |
| Final refusal screenshot | `PASS` — visually inspected; credential fields empty |
| Computed/semantic refusal evidence | `PASS` — visible alert with danger treatment |
| Correct-detail retry after real cooldown | `PASS` — OTP opened |
| Exact-email OTP | `PASS` — memory-only, no secret output |
| Direct Dashboard destination | `PASS` — exact identity visible |
| Same-tab cold reload | `PASS` — exact identity remained for the full 7-second settle window |
| UserEntity invariant | `PASS` — exact, linked, `is_uat=true` |

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior / UX / UI | Independent `PASS` decisions | `PASS / PASS / PASS` |
| Open UI SUSPENSE / findings | `0 / 0` | `0 / 0` |
| Isolation | `PASS` | Exact account, agent, host and single-tab terminal cycle |

Final case result: `PASS`.
