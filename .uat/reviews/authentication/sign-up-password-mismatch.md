# UAT Case — Authentication / Sign up / Password mismatch

Status: `pass`

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-up.password-mismatch` |
| Case kind | `failure/recovery — confirm password differs from password` |
| User goal | Understand the mismatch, correct it without losing progress, and finish registration |
| Entry | `http://missing-challenge.lvh.me:3000/vi/authentication?authState=sign-up`; exact reservation absent |
| Success condition | Mismatch is refused client-side with a localized field owner and no request/challenge/account; after correction then consent, exact-email OTP completes directly at Dashboard; reload keeps the exact identity; exactly one `UserEntity` row has `is_uat=true` |
| In scope | Details mismatch refusal, request/account absence, correction-before-consent gating, sign-up pending, OTP transition/proof, direct Dashboard, reload persistence, exact UAT markers |
| Out of scope | Existing-email refusal, terms-required refusal, invalid/resend/expired OTP, external mail delivery, Dashboard visual quality beyond destination and identity proof |

## Source provenance

| Field | Value |
|---|---|
| Reviewed at | `2026-08-28T16:34:59.9599381+07:00` |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Relevant dirty files | Shared FE auth/Grammar calibration and `.uat` registry/validator changes were already present; this agent owns only this journal and its two screenshots. Shared BE UAT marker/migration changes were already present; this case made no product-source edit. |
| Runtime | FE `http://missing-challenge.lvh.me:3000`; BE `http://missing-challenge.lvh.me:3001`; local development; Keycloak/PostgreSQL/jobs ledger on loopback |
| Selected Grammar | `@starci/grammar/common` + `@starci/grammar/core` |
| Viewports | `1280 × 720`, DPR `1.5` |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account or absent reservation | `uat-auth-sign-up-password-mismatch@starci.local` | Registry exact case; initial Keycloak `0`, PostgreSQL `0`; journey-created final Keycloak `1`, `is_uat=true`, exact `uat_case`; `UserEntity` `1`, `is_uat=true` |
| Agent | `/root/signup_password_mismatch_sol` | Owns this case/account/journal only |
| Browser session | `auth.sign-up.password-mismatch.isolated-1` | Fresh Codex in-app browser session on the case-only `missing-challenge.lvh.me` origin; one controlled tab |
| Mailbox / external identity | Exact-email local `jobs.payload` ledger adapter | Baseline `0`; one `sign-up-otp` row at challenge time; exact one-element recipient matched; six-digit proof read and entered memory-only |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Ciphertext authority only; plaintext was loaded into trusted local runtime memory, never printed, persisted in this journal, or captured in an image |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Reservation | One active case with `initial_state=absent`, `expected_final_state=present`, `is_uat=true` | `.uat/accounts.json` exact entry |
| Initial identity | Exact email absent in Keycloak and application DB | E1: counts `0 / 0` |
| Initial challenge/mail | No exact-email job exists | E1: exact-email job count `0` |
| Runtime | FE and BE reachable on the isolated origin | FE rendered sign-up; BE TCP `3001` ready; no BE log polling used |
| Secret hygiene | Password and OTP remain memory-only; no token/cookie inspection | E6, E11 |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Open isolated sign-up details | No identity/challenge exists before interaction | Complete form becomes enabled after initialization | Centred auth surface renders task heading, three fields, consent and primary action |
| 2 | Enter exact email, password, a different confirmation, check consent, press `Tạo tài khoản` | Client refuses; URL stays `authState=sign-up`; Keycloak/app/jobs remain `0 / 0 / 0` | Input is preserved and the correction is local, immediate and actionable | `Hai mật khẩu phải trùng khớp` renders in Vietnamese at the confirm field owner with `role=alert` |
| 3 | Uncheck consent, correct confirmation, then check consent | Error clears; submit is disabled before consent and enabled after consent | Correction and required consent have an obvious order; no dead end | Invalid treatment clears without layout replacement |
| 4 | Press `Tạo tài khoản` with valid details | One challenge and exactly one `sign-up-otp` job are created; URL becomes `authState=sign-up-otp` | Button keeps label, becomes disabled/pending and exposes a status owner | Current state changes to `Nhập OTP` with stable description and conventional OTP control |
| 5 | Enter the exact-email proof and press `Hoàn tất đăng ký` | Proof is accepted once; authenticated navigation goes directly to `/vi/dashboard` | Verify action keeps label, is disabled/pending and has one status owner; no success interstitial | Dashboard itself is the completion feedback |
| 6 | Finalize the journey-created fixture marker, then reload Dashboard | Keycloak exact count `1`, attributes match; active session `1`; `UserEntity` exact count `1`, `is_uat=true` | Reload remains on Dashboard with the exact email identity | Destination identity remains visibly rendered after reload |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E1 | Sanitized baseline: Keycloak exact count `0`; PostgreSQL exact count `0`; exact-email jobs `0` | Intended absent fixture and no prior challenge | Future refusal or completion |
| E2 | [`mismatch-refusal.png`](sign-up-password-mismatch/screenshots/mismatch-refusal.png) | Visible localized mismatch treatment at the owning field; crop contains no email, password, OTP, token or cookie | Full auth composition or backend non-mutation by itself |
| E3 | Refusal DOM/computed receipt: `DIV[role=alert]`, text `Hai mật khẩu phải trùng khớp`, parent `.starci-core-form-field`, visible `12px/16px`; URL unchanged | Exact local error owner, semantics and rendered visibility | Pixel treatment outside the sanitized crop |
| E4 | Post-refusal exact-state receipt: Keycloak `0`, PostgreSQL `0`, exact-email jobs `0` | No request side effect created challenge/account/job | Browser pixels |
| E5 | Correction-before-consent receipt: mismatch alert count `0`; create enabled `false` before consent and `true` after consent | Recovery clears the error and keeps consent as a prerequisite | Server acceptance |
| E6 | Details pending: `disabled=true`, `aria-disabled=true`, `data-pending=true`, `data-action-pending=true`, label retained `Tạo tài khoản`; password holder never printed | Loading owner and duplicate-submit prevention | OTP acceptance |
| E7 | OTP URL/DOM: `authState=sign-up-otp`, heading `Nhập OTP`, stable description, recipient status, OTP control, resend/change-identity actions | Correct step transition and render completeness | Proof validity |
| E8 | Exact-email ledger: baseline `0` to one `sign-up-otp` row; recipient array matched the exact email; proof shape was six digits; value was never output | Challenge is bound to this case and proof source is deterministic | External email delivery |
| E9 | OTP pending: `disabled=true`, `aria-disabled=true`, `data-pending=true`, `data-action-pending=true`, one status owner, label retained `Hoàn tất đăng ký` | Verify loading feedback and duplicate prevention | Destination persistence |
| E10 | Direct post-proof URL `/vi/dashboard` and visible case identity | No success interstitial; exact account reached its destination | Reload persistence or Dashboard quality |
| E11 | [`dashboard-direct.png`](sign-up-password-mismatch/screenshots/dashboard-direct.png) | Post-finalization/reload Dashboard route and exact UAT email identity are visibly present | Dashboard composition/fidelity, which is out of scope |
| E12 | Reload receipt: URL remained `/vi/dashboard`; `Tiếp tục học` visible; exact email identity visible | Session and identity persist after reload | Long-duration expiry |
| E13 | Final server receipt: Keycloak exact `1`, `is_uat=true`, exact `uat_case`, active sessions `1`; `UserEntity` exact `1`, `is_uat=true` | Required final identity and internal UAT marker | Unrelated accounts |
| E14 | Automated proof: targeted auth suite `4` files / `97` tests PASS; targeted lint PASS; FE typecheck PASS | Current auth contracts compile and regressions are guarded | Runtime visual proof |

## Behavior decision

Decision: `PASS`

| Rule / effect | Expected | Observed | Evidence | Owning source |
|---|---|---|---|---|
| Mismatch refusal | Different confirmation is stopped before challenge/account creation | Local Vietnamese error; Keycloak/app/jobs stayed zero | E2–E4 | FE validation |
| Consent prerequisite | Correct details alone cannot submit until consent | Disabled before consent, enabled after | E5 | FE form state |
| Challenge creation | Correct confirmation plus consent creates one exact-email sign-up challenge | OTP URL and one exact `sign-up-otp` ledger row | E6–E8 | FE + BE |
| OTP completion | Exact proof creates/authenticates the intended identity once | Direct Dashboard; active session `1` | E9–E10, E13 | FE + BE/Keycloak |
| Persistence | Reload keeps the exact identity | Dashboard and full exact email remain visible | E11–E12 | FE + BE |
| UAT classification | Final identity is queryable and disposable | Keycloak marker/case match and one `UserEntity.is_uat=true` row | E13 | UAT fixture finalizer + BE data owner |

## UX decision

Decision: `PASS`

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton | `N/A` | Static sign-up entry has no remote page-data dependency | Form initialization disables controls briefly, then exposes the same form; no content skeleton is needed | Initial DOM transition |
| Loading | `PASS` | Both network actions retain identity, show pending and prevent repeats | Details and OTP buttons stayed labeled, disabled and exposed pending/status owners | E6, E9 |
| Render completeness | `PASS` | Details, local refusal, corrected state, OTP state, recovery actions and destination all render | No blank/dead state; localized owner and OTP hierarchy are complete | E2–E3, E5, E7, E10–E12 |
| Journey completion | `PASS` | Mismatch → correction → consent → OTP → Dashboard → reload | Full failure-to-recovery loop completed with exact identity and final marker | E2–E13 |

## UI decision

Decision: `PASS`

Authority: `fe.ui` + `fe.grammar-common-overview` + `fe.grammar-common-states-accessibility` + `fe.grammar-core-overview` + Core `fields`, `actions`, and calibrated Authentication surface rules. Selected Grammar: Core. `SUSPENSE=0`.

### Region and render map

| State / viewport | Region | Data or control rendered | Required UI treatment | Authority binding | Evidence |
|---|---|---|---|---|---|
| Mismatch / `1280×720` | Confirm-password field | Localized validation text | One local owner; text plus invalid contour, assertive semantics, preserved input; no summary duplication | Common negative/accessibility + Core fields error ownership | E2–E3 |
| Corrected before consent | Confirm field + primary action | Error removed; disabled `Tạo tài khoản` | Invalid treatment clears; prerequisite remains visibly enforced without inventing another state | `fe.ui` affordance + Core fields/actions | E5 |
| Details pending | Primary action | Label + pending/status owner | One pending visual owner, stable label/geometry, duplicate action disabled | Common pending/loading + Core actions | E6 |
| OTP state | Auth card | Current heading/description, OTP input and secondary recovery actions | State-specific hierarchy, conventional OTP control and one dominant completion action | `fe.ui` hierarchy/economy + Core fields/actions | E7 |
| OTP pending | Primary action | `Hoàn tất đăng ký` + status owner | Preserve action identity and prevent duplicates | Common pending/loading + Core actions | E9 |
| Success/reload | Destination identity | Dashboard and exact UAT email | Destination is feedback; no redundant success interstitial | Calibrated Authentication negative boundary | E10–E12 |

### SUSPENSE register

| ID | Exact render question authority cannot answer | Proposed authority owner | Thầy feedback | Resolution evidence |
|---|---|---|---|---|
| None | No unresolved render question | N/A | Existing Authentication calibration covers local field validation, pending ownership and destination-as-feedback | E2–E3, E5–E12 |

## Findings and repair loop

| Finding | Decision axis | Severity | FE/BE owner | Fix applied | Automated proof | Runtime retest | State |
|---|---|---|---|---|---|---|---|
| None | `Behavior / UX / UI` | N/A | N/A | No product repair required; the journey-created account was reconciled by the exact-case UAT finalizer, not by a product-source patch | E14 | E2–E13 | `pass` |

Open findings: `0`.

## Feedback calibration

Literal marker: `TEACHER feedback`.

| Decision | AI conclusion | Thầy correction / approval | Authority learning |
|---|---|---|---|
| Behavior | Client refusal is not enough without proving jobs/accounts remain absent and recovery reaches a persisted exact identity | Coordinator required full mismatch refusal → corrected confirm → consent → exact-email OTP → direct Dashboard → reload plus one `is_uat=true` row | Unhappy sign-up proof includes both no-side-effect refusal and complete successful recovery |
| UX | The correction sequence and both pending frames are part of the journey | Coordinator required correction before consent and no jump from submit to destination | Every wait/action exposes a checkpoint; validation cannot terminate the case before recovery |
| UI | Localized field-owned alert plus rendered/computed evidence satisfies the mismatch state; destination is final feedback | Screenshot evidence must be sanitized and paired with DOM/computed; no password/OTP/token/cookie may appear | Crop decision-bearing error pixels, bind them to the exact Grammar owner, and state what destination screenshots do not prove |
| Password binding | Plaintext must never be written even though the case needs a traceable password source | `TEACHER feedback`: record only `backend:.stacks/dev/runtime/files/uat-account-password.key.enc`; keep plaintext memory-only | Credential provenance and credential disclosure are separate; the former is required and the latter is forbidden |

## Retest receipt

- Fresh exact-case baseline proved the reservation absent in Keycloak/PostgreSQL and the exact-email jobs ledger empty.
- Mismatch attempt produced the localized field alert while all three side-effect counts remained zero.
- The tester then unchecked consent, corrected confirmation, and only then re-checked consent; the error cleared and gating changed from disabled to enabled.
- Valid details and exact-email OTP each exposed a pending owner and completed without a success interstitial.
- The journey-created identity was finalized through the exact-case UAT fixture path; final Keycloak and PostgreSQL markers passed.
- Dashboard reload stayed authenticated with the exact email identity.
- Browser screenshot capability was retried by rebinding the same controlled tab; no second browser surface/session was created.
- Password/OTP/token/cookie persisted or logged: `0`.

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior decision | `PASS` or justified `N/A` | `PASS` |
| UX decision | `PASS` or justified `N/A` | `PASS` |
| UI decision | `PASS` | `PASS` |
| Open UI SUSPENSE | `0` | `0` — `NO SUSPENSE` |
| Open findings | `0` | `0` |
| Account/session isolation | `PASS` | `PASS` — exact reservation/account + dedicated agent/browser alias/tab |
| Direct Dashboard + reload | `PASS` | `PASS` — exact email visible after reload |
| UAT marker | `PASS` | `PASS` — Keycloak attributes exact; one `UserEntity.is_uat=true` row |

Final case result: `PASS — NO SUSPENSE`.
