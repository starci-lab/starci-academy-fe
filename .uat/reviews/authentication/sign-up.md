# Authentication / Sign up

Status: `needs-work`

## Provenance

| Field | Value |
|---|---|
| Reviewed at | `2026-08-28T10:35:00+07:00` |
| FE branch / commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch / commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Runtime | FE `http://localhost:3000`; BE `http://localhost:3001`; development |
| Mail fixture | Disposable local Mailpit inbox; no external delivery |
| Viewport | Desktop in-app browser |

## Accounts and sessions

| Case | Dedicated account reservation | Dedicated session |
|---|---|---|
| H1 | `uat-auth-sign-up-happy@starci.local`; absent before, `is_uat=true` after completion | Fresh browser page; not reused |
| U1 | `uat-auth-sign-up-unhappy@starci.local`; absent before and after | Fresh browser page; not reused |

No password, OTP, token or cookie is recorded here.

## Happy cases

| Case | Entry / action | Expected success | Verdict | Evidence |
|---|---|---|---|---|
| H1 | Fill a new identity, matching passwords and consent; submit correct emailed OTP | Account is created once and reaches an authenticated destination | PASS | Submit was disabled before consent; correct OTP redirected to `/vi/dashboard`; Keycloak and app DB were finalized with `is_uat=true` |

## Unhappy cases

| Case | Trigger | Expected recovery / refusal | Verdict | Evidence |
|---|---|---|---|---|
| U1 | Enter mismatching password confirmation | Field-specific feedback; no account is created | PASS | Visible alert said `Hai mật khẩu phải trùng khớp`; reserved identity remained absent in Keycloak and app DB |

## Behavior decision

Decision: `PASS` for the two formal cases.

| Requirement | Decision | Evidence | Finding / blocker |
|---|---|---|---|
| Valid registration creates exactly the intended identity | PASS | H1 created the Keycloak/app user and finalized `is_uat=true` | None in exercised scope |
| Password mismatch creates no identity | PASS | U1 remained absent in both Keycloak and app DB | None in exercised scope |
| OTP mismatch semantics | PASS | Diagnostic wrong OTP was refused | The raw English copy remains a UX/UI failure |

## UX decision

Overall verdict: `FAIL`

| Runtime gate | Verdict | Evidence | Finding / blocker |
|---|---|---|---|
| Skeleton | N/A | Initial registration controls have no remote page-data dependency | No placeholder surface is required for this scope |
| Loading | BLOCKED | The case sessions completed without a stable pending frame being captured | Must be observed directly on retest |
| Render completeness | FAIL | Details, consent, OTP, success and mismatch states rendered | Diagnostic wrong-OTP run exposed raw `Challenge OTP mismatch` rather than localized recovery copy |
| Journey completion | PASS | H1 reaches Dashboard; U1 blocks locally and preserves correction | Both formal case goals were met with isolated identities |

| Severity | Finding | Evidence | Secondary axes |
|---|---|---|---|
| High | OTP failure copy is implementation-facing English | Separate diagnostic run; not evidence for formal U1 | Behavior |
| Medium | Pending feedback is not yet proven in the formal case sessions | Loading gate | UI |

## UI decision

Verdict: `FAIL`

Authority: `fe.ui` + `fe.grammar-common-overview` + `fe.grammar-core-overview` + Core Fields/Actions/Feedback rules. Open SUSPENSE: none for the recorded findings.

| Severity | Finding | Evidence | Secondary axes |
|---|---|---|---|
| High | Shared authentication wrapper regression also breaks sign-up grouping and vertical rhythm | Runtime rendering and current bare wrappers | UX |
| Medium | Technical OTP error copy does not match the otherwise Vietnamese surface | Diagnostic wrong-OTP state | UX |

## User review — thầy

| Axis | Thầy verdict | Correction / disagreement |
|---|---|---|
| Behavior decision | TBD |  |
| UX decision | TBD |  |
| UI decision | TBD |  |

## Decision and retest

- Final status: `needs-work`
- Required fixes: localized OTP errors; current-architecture layout composition
- Retest scope: pending states and OTP error recovery
