# Authentication / Forgot password

Status: `needs-work`

## Provenance

| Field | Value |
|---|---|
| Reviewed at | `2026-08-28T10:35:00+07:00` |
| FE branch / commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch / commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Runtime | FE `http://localhost:3000`; BE `http://localhost:3001`; development; API delay `750 ms` for observable pending state |
| Mail fixture | Disposable local Mailpit inbox on loopback; no external delivery or personal data |
| Viewport | Desktop in-app browser |

## Accounts and sessions

| Case | Dedicated account | Dedicated session |
|---|---|---|
| H1 | `uat-auth-forgot-password-happy@starci.local` (`is_uat=true`) | Fresh browser page; not reused |
| U1 | `uat-auth-forgot-password-unhappy@starci.local` (`is_uat=true`) | Fresh browser page; not reused |

No password, OTP, token or cookie is recorded here.

## Happy cases

| Case | Entry / action | Expected success | Verdict | Evidence |
|---|---|---|---|---|
| H1 | Open reset, submit known email/new password, then correct mailbox OTP | Pending feedback is visible and recovered access reaches the authenticated destination | PASS | Request state disabled controls and announced “Đang kiểm tra thông tin của bạn”; verify state announced “Đang kiểm tra mã của bạn”; correct OTP redirected to `/vi/dashboard` under the dedicated identity |

## Unhappy cases

| Case | Trigger | Expected recovery / refusal | Verdict | Evidence |
|---|---|---|---|---|
| U1 | Submit an incorrect OTP for the dedicated account | Clear localized refusal, retained input and retry/resend paths | FAIL | Input, “Đổi mật khẩu”, “Gửi lại mã” and “Dùng email khác” remained available, but the alert was raw English: `Challenge OTP mismatch` |

## Behavior decision

Decision: `FAIL`.

| Requirement | Decision | Evidence | Finding / blocker |
|---|---|---|---|
| Valid reset changes credentials and establishes recovered access | PASS | H1 completed OTP verification and reached Dashboard; the fixture password was restored afterward | None in exercised happy scope |
| Wrong OTP must not change credentials | PASS | U1 was refused and remained retryable | None in refusal semantics |
| Unknown email must not disclose account existence | FAIL | Diagnostic response exposed `User not found` | Account-enumeration behavior must return a neutral response |

## UX decision

Overall verdict: `FAIL`

| Runtime gate | Verdict | Evidence | Finding / blocker |
|---|---|---|---|
| Skeleton | N/A | Reset details are useful first-render controls without remote page data | No placeholder surface is required for this scope |
| Loading | PASS | Both request and OTP verification expose local status and disable duplicate submission | Observed with a controlled `750 ms` API delay |
| Render completeness | FAIL | Details, pending, OTP, success and wrong-OTP surfaces rendered | Wrong OTP uses technical copy; reset details also render unrelated OAuth and remember-me controls |
| Journey completion | FAIL | H1 reaches Dashboard and U1 remains technically retryable | U1 fails the required understandable/localized refusal |

| Severity | Finding | Evidence | Secondary axes |
|---|---|---|---|
| High | Wrong OTP exposes internal challenge wording | Runtime U1 | Behavior, UI |
| High | Unknown-email diagnostic disclosed account existence as `User not found` | Separate diagnostic run; not evidence for formal U1 | Security, Behavior |
| Medium | Reset details include Google/GitHub login and “Ghi nhớ đăng nhập”, unrelated to password recovery | Runtime details state | UI |

## UI decision

Verdict: `FAIL`

Authority: `fe.ui` + `fe.grammar-common-overview` + `fe.grammar-core-overview` + Core Fields/Actions/Feedback rules. Open SUSPENSE: none for the recorded findings.

| Severity | Finding | Evidence | Secondary axes |
|---|---|---|---|
| High | Reset form inherits the shared authentication layout regression | Runtime rendering and current bare wrappers | UX |
| High | Technical English error interrupts the Vietnamese visual/content system | Runtime U1 alert | UX |
| Medium | OAuth buttons and remember-me dilute the reset hierarchy | Runtime details state | UX |

## User review — thầy

| Axis | Thầy verdict | Correction / disagreement |
|---|---|---|
| Behavior decision | TBD |  |
| UX decision | TBD |  |
| UI decision | TBD |  |

## Decision and retest

- Final status: `needs-work`
- Required fixes: neutral response for unknown email; localized wrong-OTP recovery; remove unrelated reset controls; restore current-architecture layout composition
- Retest scope: unknown email, wrong/expired OTP, resend, responsive layout
