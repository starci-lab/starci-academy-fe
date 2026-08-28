# Authentication / Sign in

Status: `needs-work`

## Provenance

| Field | Value |
|---|---|
| Reviewed at | `2026-08-28T10:35:00+07:00` |
| Journal branch / commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| FE branch / commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch / commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Comparison ref | FE `32871fb`, immediately before contract removal commit `1de6e43`; diagnostic only |
| Runtime | FE `http://localhost:3000`; BE `http://localhost:3001`; development |
| Viewport | Desktop in-app browser |

## Accounts and sessions

| Case | Dedicated account | Dedicated session |
|---|---|---|
| H1 | `uat-auth-sign-in-happy@starci.local` (`is_uat=true`) | Fresh browser page; not reused |
| U1 | `uat-auth-sign-in-unhappy@starci.local` (`is_uat=true`) | Fresh browser page; not reused |

No password, OTP, token or cookie is recorded here.

## Happy cases

| Case | Entry / action | Expected success | Verdict | Evidence |
|---|---|---|---|---|
| H1 | Submit valid UAT credentials, then the emailed OTP | Session is established and the destination page renders | PASS | OTP step identified the target email and expiry; correct OTP redirected to `/vi/dashboard`, where “Tiếp tục học” rendered |

## Unhappy cases

| Case | Trigger | Expected recovery / refusal | Verdict | Evidence |
|---|---|---|---|---|
| U1 | Submit the dedicated UAT account with a wrong password | Safe, localized refusal; no session; form remains usable | FAIL | No session was created and the form remained usable, but the visible error was raw transport copy: `Request failed with status code 401` |

External identity cases are intentionally blocked:

- `[need user approval: đăng nhập Google bằng tài khoản Google thử nghiệm do thầy chọn]`
- `[need user approval: đăng nhập GitHub bằng tài khoản GitHub thử nghiệm do thầy chọn]`

## Behavior decision

Decision: `PASS` for the exercised credential/OTP cases; external identity cases remain unexecuted approval scope.

| Requirement | Decision | Evidence | Finding / blocker |
|---|---|---|---|
| Valid credentials and OTP establish the intended session | PASS | H1 reached the authenticated Dashboard under the dedicated identity | None in exercised scope |
| Invalid password creates no session | PASS | U1 remained on Authentication with a usable form | Visible error copy is a UX/UI defect, not an authentication-semantics failure |
| Google/GitHub provider behavior | BLOCKED | Approval markers above | Requires user-owned external identities |

## UX decision

Overall verdict: `FAIL`

| Runtime gate | Verdict | Evidence | Finding / blocker |
|---|---|---|---|
| Skeleton | N/A | The sign-in form is useful on first render and has no remote page-data dependency | Dashboard skeleton belongs to the destination-page review |
| Loading | BLOCKED | Submit completed before a stable pending frame could be captured in this case session | Do not infer PASS from source or from another journey |
| Render completeness | FAIL | Details, OTP, success and error surfaces rendered | Invalid credentials expose a raw HTTP error rather than a user-facing explanation |
| Journey completion | FAIL | Happy path reaches Dashboard; unhappy path stays recoverable | The unhappy expectation includes a safe, understandable refusal, which was not met |

| Severity | Finding | Evidence | Secondary axes |
|---|---|---|---|
| High | Invalid credentials leak implementation-level HTTP wording | Runtime U1 | Behavior |
| Medium | Google and GitHub paths remain unverified pending user-owned credentials | Approval markers above | Behavior |

## UI decision

Verdict: `FAIL`

Authority: `fe.ui` + `fe.grammar-common-overview` + `fe.grammar-core-overview` + Core Fields/Actions/Navigation rules. Open SUSPENSE: none for the recorded findings.

| Severity | Finding | Evidence | Secondary axes |
|---|---|---|---|
| High | Remember-me and forgot-password lost their peer row | Runtime screenshot plus current wrapper using block flow | UX |
| High | “Chưa có tài khoản?” and “Đăng ký” lost their centred peer row | Runtime screenshot and source comparison | UX |
| Medium | Header and form-control stack lost explicit width, alignment and gap composition | Current wrappers are bare after contract removal | UX |

The comparison ref only diagnoses the regression. The removed contract pattern must not be restored; equivalent layout must be implemented in the current architecture.

## User review — thầy

| Axis | Thầy verdict | Correction / disagreement |
|---|---|---|
| Behavior decision | TBD |  |
| UX decision | TBD |  |
| UI decision | TBD |  |

## Decision and retest

- Final status: `needs-work`
- Required fixes: localized invalid-credential response; restore current-architecture layout composition
- Retest scope: U1, pending state, Google/GitHub only after the recorded approvals
