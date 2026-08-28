# UAT Case — <feature> / <flow> / <exact journey>

Status: `draft | running | repairing | awaiting-feedback | pass | blocked`

## Case contract

| Field | Value |
|---|---|
| Case ID | `<feature>.<flow>.<exact-journey>` |
| Case kind | `happy | <one exact failure/recovery journey>` |
| User goal | `<one observable outcome>` |
| Entry | `<route and starting state>` |
| Success condition | `<observable terminal state>` |
| In scope | `<states and actions this case owns>` |
| Out of scope | `<anything deferred to another case>` |

One file is one case. A generic `unhappy` umbrella is provenance only after its independent failures
have been split; it must not absorb password, OTP, challenge, transport, throttle or duplicate-action
journeys merely because they use the same page.

## Source provenance

| Field | Value |
|---|---|
| Reviewed at | `<ISO-8601 with timezone>` |
| Journal / FE branch + commit | `<branch>` / `<full SHA>` |
| BE branch + commit | `<branch>` / `<full SHA>` |
| Relevant dirty files | `<paths or none>` |
| Runtime | `<URLs and build mode>` |
| Selected Grammar | `<exact Grammar package/ref>` |
| Viewports | `<width × height>` |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account or absent reservation | `<sanitized identity>` | `is_uat=true`, exact `uat_case` |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Random UAT password; plaintext resolves only from the trusted runtime `.key` and stays memory-only |
| Agent | `current chat` or `<agent id>` | owns this case only |
| Browser session | `<fresh session alias>` | not reused by another case |
| Mailbox / external identity | `<fixture or approval marker>` | no secret recorded |

If account, agent or browser session is reused, the case is invalid rather than partially passed.

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
|  |  |  |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 |  |  |  |  |

Every wait must expose a checkpoint. Do not jump from submit directly to the final screenshot.

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E1 | [`<checkpoint>.png`](<case>/screenshots/<checkpoint>.png) |  |  |

Store only decision-bearing screenshots under `<case>/screenshots/`: refusal/error, material pending,
and recovery/destination. Reference every saved image relatively here. Never capture password, OTP,
token, cookie or credential. Browser/Playwright assertions alone do not earn `UI PASS`; pair the
screenshot with the relevant DOM/computed owner evidence. If no screenshot exists, state that boundary
instead of inferring pixels from source or tests.

## Behavior decision

Decision: `PASS | FAIL | BLOCKED | N/A`

| Rule / effect | Expected | Observed | Evidence | Owning source |
|---|---|---|---|---|
|  |  |  |  | `FE | BE | external` |

## UX decision

Decision: `PASS | FAIL | BLOCKED | N/A`

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton |  |  |  |  |
| Loading |  |  |  |  |
| Render completeness |  |  |  |  |
| Journey completion |  |  |  |  |

UX is decided by the calibrated reviewer. UI appearance cannot compensate for a failed journey.

## UI decision

Decision: `PASS | FAIL | SUSPENSE`

Authority: `fe.ui` + `fe.grammar-common-overview` + `<one selected Grammar>` + `<triggered object/case refs>`.

### Region and render map

| State / viewport | Region | Data or control rendered | Required UI treatment | Authority binding | Evidence |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

### SUSPENSE register

| ID | Exact render question authority cannot answer | Proposed authority owner | Thầy feedback | Resolution evidence |
|---|---|---|---|---|
| None |  |  |  |  |

Never guess a missing UI decision. Ask precisely, update `fe.ui` or the owning Grammar, then rerun this case. Goal: `NO SUSPENSE`.

## Findings and repair loop

| Finding | Decision axis | Severity | FE/BE owner | Fix applied | Automated proof | Runtime retest | State |
|---|---|---|---|---|---|---|---|
|  | `Behavior | UX | UI` |  |  |  |  |  | `open | repaired | pass` |

Seeing a bug authorizes repair in the owning FE/BE boundary for this case. A finding closes only after automated proof where applicable and runtime retest.

## Feedback calibration

Include the literal text `TEACHER feedback` even when the case has not been reviewed yet.

| Decision | AI conclusion | Thầy correction / approval | Authority learning |
|---|---|---|---|
| Behavior |  |  |  |
| UX |  |  |  |
| UI |  |  |  |

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior decision | `PASS` or justified `N/A` |  |
| UX decision | `PASS` or justified `N/A` |  |
| UI decision | `PASS` |  |
| Open UI SUSPENSE | `0` |  |
| Open findings | `0` |  |
| Account/session isolation | `PASS` |  |

Final case result: `PASS | NOT PASS`.
