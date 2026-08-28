# UAT Case — Authentication / Sign in / OTP not received

Status: `accepted`

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-in.not-receive-otp` |
| Case kind | `failure/recovery — first OTP not received` |
| User goal | Request a replacement when the first email does not arrive, then finish sign-in |
| Entry | Dedicated guest starts at `/vi/authentication?authState=sign-in`, submits valid details and receives a live OTP challenge |
| Success condition | Resend rotates the OTP, duplicate input creates exactly one replacement, the old proof is refused, and the replacement proof establishes the exact case session at `/vi/dashboard` across reload |
| In scope | Missing-delivery symptom, resend pending/duplicate guard, replacement proof, direct Dashboard, exact session identity |
| Out of scope | Expired/unknown challenge, mail transport root-cause diagnosis, rate limit |

## Source provenance

| Field | Value |
|---|---|
| Runtime reviewed at | `2026-08-28T16:02:55+07:00` |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` (dirty shared working tree; this case owns only this journal and its screenshots) |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` (dirty shared working tree; no BE mutation by this case) |
| Runtime | FE `http://not-receive-otp.lvh.me:3000`; local shared BE; dedicated IAB session alias below |
| Authority | `.v63` UAT rules, `fe.ui` + Grammar Common + Core Grammar; no UI authority ambiguity |
| Shared repair receipt | TextLink synchronous duplicate-gesture guard and current-disabled ownership; coordinator reported `3` targeted files / `74` tests PASS |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account | `uat-auth-sign-in-not-receive-otp@starci.local` | Registry reservation and terminal UserEntity audit: exactly one row, `is_uat=true`, non-empty `keycloak_id` |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Random UAT password; plaintext resolves only from trusted runtime `.key` and stays memory-only |
| Agent | `sol-auth-sign-in-not-receive-otp` | Owns only this granular case and journal |
| Browser session | `auth.sign-in.not-receive-otp.isolated-2` | Same case-owned IAB session from guest challenge through Dashboard reload |
| Mailbox adapter | Case-only exact-email jobs ledger | Mailpit was unavailable; approved exact-email `jobs.payload` adapter supplied counts and replacement proof in memory only |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Account/challenge | Present dedicated account; valid details open a live challenge | E1–E2 |
| Credential | Existing random UAT password from backend `.stacks` runtime file | Used in memory after action-time authorization; never written here |
| Browser | Dedicated guest session at exact sign-in URL | E1 |
| Non-delivery | First delivery is absent without fabricating a transport event | E3: Mailpit unavailable and exact-email mail job settled failed |
| Recovery ledger | Replacement proof can be read without logging mailbox body or OTP | E4–E5; only counts/timestamps/rotation booleans persisted |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Submit valid case email/password | One challenge opens; no session exists yet | Details action owns pending and moves to OTP state | OTP task heading/description/control are complete |
| 2 | Reader observes no first email, presses `Gửi lại mã`, and attempts a duplicate | Exactly one resend is accepted; proof rotates | Initiating action owns pending and duplicate suppression | Resend retains its label, exposes pending/disabled semantics and owns the spinner |
| 3 | Submit the old proof, clear the control, then submit the replacement proof | Old proof is refused; new proof is accepted | Recovery remains on the same challenge without restarting details | Conventional OTP control supports Backspace/re-entry and semantic ErrorMessage recovery |
| 4 | Observe Dashboard and reload | Exact case identity remains authenticated at `/vi/dashboard` | Completion is stable, not a transient redirect | No success interstitial; destination is the feedback |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E0 | Registry maps this case to the dedicated email with `is_uat=true` and `status=active` | Isolation reservation | Runtime identity/session |
| E1 | Exact dedicated host rendered the complete Vietnamese details form; valid credentials navigated to URL-owned `authState=sign-in-otp` | Correct entry, account and challenge | Replacement behavior |
| E2 | OTP DOM rendered `Nhập OTP`, task description, six-slot conventional input, exact account hint, expiry, resend and change-email actions | Render completeness and URL-owned state | Delivery or final session |
| E3 | Loopback Mailpit was unavailable; exact-email initial send-mail job existed and settled failed | Observable first non-delivery without inventing an email | Transport root cause, intentionally out of scope |
| E4 | Final clean duplicate run changed exact-email job count from `23` to `24` after one resend plus a forced duplicate attempt; proof comparison reported `rotated=true` | Exactly one replacement was accepted and the shared duplicate guard held | Replacement acceptance by itself |
| E5 | Independent resend evidence changed the ledger from `25` to `26`; the replacement row was created at `2026-08-28 09:01:45.47819+00` and differed from the old proof | Current challenge has one fresh replacement proof | Final session |
| E6 | Runtime pending receipt observed one Spinner/status node while the resend action retained `Gửi lại mã`; prior active-state receipt on the same owner recorded `aria-disabled=true` and `data-action-pending=true` | Pending fact belongs to the initiating control and duplicate input is suppressed | A pending screenshot: runtime settled faster than screenshot serialization, so none is claimed |
| E7 | Submitting the pre-resend proof stayed at `authState=sign-in-otp`, rendered assertive Vietnamese refusal, and kept all recovery actions; sanitized screenshot: [old proof refused](screenshots/02-old-proof-refused.png) | Old proof is invalidated without stranding the user | Replacement acceptance |
| E8 | The screenshot shows the current `Nhập OTP` heading/description, six blank slots, exact case hint, danger ErrorMessage, primary action and both recovery actions | Independent visual hierarchy, conventional control and recoverable refusal | Any OTP value; none is shown |
| E9 | Six user-like Backspaces followed by the replacement proof navigated directly to `/vi/dashboard`; no success or redirecting interstitial rendered | Same-challenge correction and replacement acceptance | Reload persistence |
| E10 | Dashboard reload stayed on the exact `/vi/dashboard`; DOM still contained `Tiếp tục học` and the exact dedicated UAT identity; screenshot: [recovery Dashboard](screenshots/03-recovery-dashboard.png) | Stable authenticated completion and exact browser identity | Other unhappy cases |
| E11 | UserEntity audit returned exactly one exact-email row with `is_uat=true` and non-empty `keycloak_id` | Persistent account isolation | Browser cookie contents, intentionally not inspected |
| E12 | Computed runtime layout: auth Card width `480px`, height `304px`, `max-height: 640px`, `overflow: hidden`, and vertical ScrollShadow with `overflow-y: auto` / `max-height: 640px` | Card/scroll composition is bounded and Grammar-owned | Other viewports outside this case |

## Behavior decision

Decision: `PASS`

- Valid details opened the exact dedicated challenge without creating an authenticated session.
- One resend plus a forced duplicate created exactly one replacement job and rotated the proof.
- The old proof was refused; the replacement proof completed the same challenge.
- Navigation went directly to Dashboard, reload remained there, and the exact case identity was visible and backed by one `is_uat=true` UserEntity row.

## UX decision

Decision: `PASS`

| Runtime gate | Decision | Expected | Observed | Evidence |
|---|---|---|---|---|
| Skeleton | `N/A` | Static Authentication entry has no remote page-data skeleton requirement | Details and OTP states render their complete static task immediately | E1–E2 |
| Loading | `PASS` | Resend retains identity, owns Spinner/disabled semantics and rejects duplicate input | Semantic/DOM receipt confirms the shared action owner; exact-email delta is one | E4, E6 |
| Render completeness | `PASS` | Current task, address, expiry, OTP, refusal and both recovery actions remain present | Complete localized refusal composition captured with blank OTP slots | E2, E7–E8 |
| Journey completion | `PASS` | No delivery → one resend → old refusal → correction → replacement → stable Dashboard | Completed in one case-owned session and persisted through reload | E9–E11 |

## UI decision

Decision: `PASS`

Authority: `fe.ui` + Grammar Common + Core Grammar.

- `SUSPENSE: 0`.
- The OTP step uses the common OTP control rather than a special-case textbox.
- Heading, description, blank slots, account/expiry hint, localized semantic ErrorMessage and actions form one clear task hierarchy.
- Pending remains owned by the resend action; a separate status can describe completion but does not replace the action state.
- The bounded Card/ScrollShadow composition follows the Grammar layout contract. UI PASS is based on the sanitized refusal and Dashboard screenshots, computed layout receipt, semantic DOM and interaction state; no pending screenshot is claimed.

## Findings and repair loop

| Finding | Decision axis | Owner | Closure evidence | State |
|---|---|---|---|---|
| Stale TextLink press could enqueue two resend jobs after the control became pending | `Behavior | UX | UI` | Shared action leaf / Grammar | Synchronous 300 ms duplicate-gesture guard; targeted `74` tests PASS; final forced-duplicate ledger delta `+1` | `closed` — E4, E6 |
| Earlier recovery reached Dashboard but did not prove reload identity | `Behavior | UX` | Session handoff/runtime | Full replacement recovery rerun; Dashboard reload stayed exact host and showed exact dedicated UAT identity; UserEntity unique and UAT | `closed` — E9–E11 |
| Misleading narrow pending crop did not show pending state | Evidence quality | This case journal | Crop removed; journal explicitly uses semantic/DOM receipt and does not claim a pending screenshot | `closed` — E6 |

Open findings: `0`.

## TEACHER feedback

`TEACHER feedback`: “không nhận OTP” is its own file/account/session and must recover through a replacement proof to Dashboard.

`TEACHER feedback`: each failure branch must recover to success; an error without a complete recovery is UX FAIL.

## Retest receipt

The dedicated Sol case owner reran the exact account on `not-receive-otp.lvh.me`. The shared leaf lock
was repaired before the terminal run. A fresh challenge proved non-delivery, one resend under a forced
duplicate, old-proof refusal, replacement-proof recovery, direct Dashboard navigation, reload
persistence and exact identity. A coordinator-authorized visible UI logout was used only to recapture
sanitized refusal evidence; cookies/storage were never cleared or inspected. Password, OTP, challenge
id, token, cookie and mailbox payload were not persisted.

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior / UX / UI | Independent `PASS` decisions | `PASS / PASS / PASS` |
| Open UI SUSPENSE / findings | `0 / 0` | `0 / 0` |
| Isolation | `PASS` | One case, one account, one agent/browser session; exact UserEntity `is_uat=true` |

Final case result: `PASS — NO SUSPENSE`.
