# UAT Case — Authentication / Sign in / Missing challenge

Status: `pass`

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-in.missing-challenge` |
| Case kind | `failure/recovery — OTP URL without matching session challenge` |
| User goal | Refresh/deep-link safely, return to sign-in details, and complete a fresh sign-in |
| Entry | Guest opens `/vi/authentication?authState=sign-in-otp` without matching case-local challenge metadata |
| Success condition | UI normalizes to details without creating an authenticated session; fresh details + OTP proof reach `/vi/dashboard`; refresh remains on Dashboard with the exact identity |
| In scope | Client challenge hydration mismatch, URL normalization, copy/state rendering, fresh challenge, OTP proof, session persistence |
| Out of scope | Server-side expiry after a valid hydrate, invalid proof, transport, throttle, Dashboard quality beyond destination/identity proof |

## Source provenance

| Field | Value |
|---|---|
| Reviewed at | `2026-08-28T15:22:32.1399343+07:00` |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Relevant dirty files | FE `src/hooks/auth/useAuthPanel.ts`, `src/hooks/auth/useAuthPanel.spec.ts`, `src/components/leaves/TextLink/index.tsx`, `src/components/leaves/TextLink/index.spec.tsx`, `src/modules/api/env.ts`, `src/modules/api/env.spec.ts`, and this journal; changes outside this journal are root-owned shared repairs |
| Runtime | FE `http://missing-challenge.lvh.me:3000`; BE `http://missing-challenge.lvh.me:3001`; loopback-only hostname isolation; local Keycloak/PostgreSQL/jobs ledger |
| Selected Grammar | `@starci/grammar/common` + `@starci/grammar/core` |
| Viewport | `1280 × 720` desktop runtime receipt |
| Automated repair proof | Root-owned targeted auth/env/TextLink suite: `104` tests PASS before terminal rerun |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account | `uat-auth-sign-in-missing-challenge@starci.local` | Canonical exact-case provision returned `ready`; Keycloak `is_uat=true`, `uat_case` exact; one `UserEntity` row with `is_uat=true` |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Random UAT password; plaintext resolves only from trusted runtime `.key` and stays memory-only |
| Agent | `/root/case_missing_challenge_sol` | Owned and wrote only this case journal |
| Browser session | `auth.sign-in.missing-challenge.isolated-1` | Codex in-app browser on cookie-isolated `missing-challenge.lvh.me`; final proof used one fresh exact-case tab and never read/cleared `127.0.0.1` cookies |
| Rejected contaminated receipt | Initial IAB tab inherited another case's `127.0.0.1` cookie | Receipt was rejected, tab closed, root notified; no logout/clear or cross-account action was performed |
| Browser-family recovery | Chrome and Edge bindings were unavailable | Loopback hostname isolation supplied a distinct cookie host while retaining the mandated in-app Browser |
| Secret handling | Rotated local UAT key + exact-email `jobs.payload` OTP adapter | Password/OTP existed only in runtime memory, were passed directly to controls, then holders were zeroed; no value was logged or persisted |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Registry/account | Exactly one active reservation for this case | `.uat/accounts.json`; canonical `--case authentication.sign-in.missing-challenge` provision receipt |
| User marker | Application user is UAT-only | PostgreSQL receipt: count `1`, email match `true`, `is_uat=true` |
| Identity marker | Keycloak identity maps to this case | Exact identity count `1`, `is_uat=true`, `uat_case` match `true` |
| Browser isolation | No other case cookie on selected origin | Distinct `missing-challenge.lvh.me` cookie host; `127.0.0.1` session was not used or mutated |
| Orphan baseline | Exact account has no active session before proof | Keycloak baseline and post-orphan checkpoint both returned `activeSessionCount=0` |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Open isolated `/vi/authentication?authState=sign-in-otp` with no challenge | URL normalizes to `authState=sign-in`; no authenticated session is created | User is not stranded on an impossible OTP question | Details heading, description and complete sign-in form replace OTP state |
| 2 | Submit valid details | One fresh challenge is created; URL moves to `authState=sign-in-otp` | Submit is disabled while pending, retains `Đăng nhập`, and exposes a visible spinner | State-specific `Nhập OTP` hierarchy and six-slot OTP control render |
| 3 | Submit exact-email OTP | Challenge proof establishes exactly one Keycloak session and routes directly to Dashboard | Verify is duplicate-safe/pending and recovery reaches its real destination without an interstitial | Destination itself is final feedback; no redundant success screen |
| 4 | Refresh Dashboard | Authenticated session remains valid and exact identity remains visible | Refresh does not lose progress or return to auth | Dashboard identity and `Tiếp tục học` remain rendered |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E1 | Canonical exact-case provision: `ready authentication.sign-in.missing-challenge` | Fixture was reconciled for only this case | Browser behavior |
| E2 | Initial isolated runtime failure: orphan URL remained on `sign-in-otp`; OTP copy rendered; `Dùng email khác` was a no-op | Two concrete FE findings existed before repair | Final behavior after repair |
| E3 | Root repair receipt: hydration guard, loopback host alignment and TextLink repair; `104` targeted tests PASS | Source-level regressions are guarded | Browser runtime by itself |
| E4 | Fresh terminal rerun changed orphan URL to `?authState=sign-in`; DOM exposed `Đăng nhập`, `Đăng nhập để tiếp tục`, Email, Mật khẩu and recovery/actions; no OTP control | Safe fallback, correct copy and complete recovery entry | Authenticated completion |
| E5 | Keycloak checkpoint before challenge: exact identity count `1`, active sessions `0`; earlier post-orphan checkpoint also sessions `0` | Orphan navigation did not create an authenticated session | Future valid proof |
| E6 | Details submit pending receipt: button label remained `Đăng nhập`, `disabled=true`, spinner nodes present | Local loading ownership and duplicate prevention | OTP acceptance |
| E7 | Fresh challenge URL became `?authState=sign-in-otp`; DOM/screenshot showed `Nhập OTP`, stable description, exact recipient status, six-slot OTP, `Gửi lại mã`, `Dùng email khác` | Challenge creation, task-specific copy and OTP rendering | Valid OTP result |
| E8 | Exact-email jobs ledger returned one latest `sendMail` row; OTP shape validated as six digits in memory; payload/value was never emitted; ledger delivery status was not used as proof | OTP was bound to the exact case email without logs or secret persistence | UI completion |
| E9 | OTP submit pending receipt retained `Đăng nhập`, set `disabled=true`, exposed spinner nodes, and cleared all sensitive holders | Verify pending/duplicate-safety and secret hygiene | Destination persistence |
| E10 | Direct post-proof URL `http://missing-challenge.lvh.me:3000/vi/dashboard`; `Tiếp tục học` visible; exact case identity visible | Immediate Dashboard success with the correct account | Refresh persistence |
| E11 | Browser reload remained `/vi/dashboard`; heading and exact identity remained visible | Session survives refresh | Long-duration expiry |
| E12 | Post-login server receipt: Keycloak exact identity `1`, markers match, active session count `1`; PostgreSQL exact user `1`, email match, `UserEntity.is_uat=true` | Session belongs to the UAT fixture and internal marker is real | Unrelated account behavior |
| E13 | Terminal browser residuals: console errors `0`, non-empty alerts `0` | No remaining runtime error surfaced in the exact case | Unrelated surfaces |

## Behavior decision

Decision: `PASS`

| Rule / effect | Expected | Observed | Evidence | Owning source |
|---|---|---|---|---|
| Missing challenge safety | Orphan OTP URL cannot verify or authenticate | Fresh URL normalized to details; active sessions remained `0` before a valid challenge/proof | E4, E5 | FE hydration/state owner |
| Fresh challenge | Valid details create a new exact-case challenge | URL changed to `sign-in-otp`; exact-email ledger row existed | E6–E8 | FE + BE |
| Valid proof | OTP consumes the fresh challenge and establishes a session | Direct Dashboard; Keycloak active sessions became `1` | E9, E10, E12 | FE + BE/Keycloak |
| Persistence | Refresh preserves authenticated identity | Reload stayed Dashboard with the exact identity | E11 | FE + BE |
| UAT data marker | Account remains internally classifiable | Keycloak markers and `UserEntity.is_uat=true` passed | E12 | BE fixture/data owner |

## UX decision

Decision: `PASS`

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton | `N/A` | Client-local orphan normalization should be immediate; no remote content skeleton is useful | Details state replaced the impossible OTP state without an initial data wait | E4 |
| Loading | `PASS` | Details and OTP actions preserve context, expose pending and prevent duplicates | Both buttons retained their labels, disabled while pending and exposed spinner nodes | E6, E9 |
| Render completeness | `PASS` | Safe details state, fresh OTP state, recovery links and final destination all render | Correct details and OTP copy/control trees; no blank/dead region; Dashboard identity visible | E4, E7, E10 |
| Journey completion | `PASS` | Orphan → details → fresh challenge → proof → Dashboard → refresh | Entire failure/recovery loop completed and remained authenticated after reload | E4–E12 |

## UI decision

Decision: `PASS`

Authority: `fe.ui` + `fe.grammar-common-overview` + `fe.grammar-common-states-accessibility` + `fe.grammar-core-overview` + Core `SurfaceCard`, `fields`, and `actions`. Selected Grammar: Core. `SUSPENSE=0`.

### Region and render map

| State / viewport | Region | Data or control rendered | Required UI treatment | Authority binding | Evidence |
|---|---|---|---|---|---|
| Safe details / `1280×720` | Auth page + card | Task heading, description, providers, fields, remember/recovery row, primary action, sign-up prompt | One centred compact card, one padding owner, clear reading/action order, no page overflow | `fe.ui` composition/spacing + Core SurfaceCard/fields/actions | E4; screenshot geometry: body and viewport both `1280×720`, page overflow hidden |
| Details pending | Primary action | `Đăng nhập` + spinner | One pending visual owner; preserve geometry/label; disable duplicate action | Common pending + Core actions | E6 |
| Fresh OTP / `1280×720` | Auth card + OTP control | `Nhập OTP`, stable description, six slots, recipient/expiry status, submit and recovery links | Heading/description belong to current task; intrinsic OTP control; one dominant action; subordinate links | `fe.ui` hierarchy + Core fields/actions | E7 |
| OTP pending | Primary action | `Đăng nhập` + spinner | Same action ownership and stable geometry | Common pending + Core actions | E9 |
| Success | Destination | Dashboard + exact identity | Destination is feedback; no redundant success/interstitial state | `fe.ui` economy/negative boundary from calibrated auth authority | E10, E11 |

### SUSPENSE register

| ID | Exact render question authority cannot answer | Proposed authority owner | Thầy feedback | Resolution evidence |
|---|---|---|---|---|
| None | No unresolved render question | N/A | Existing Authentication calibration applies | E4, E6, E7, E9–E11 |

## Findings and repair loop

| Finding | Decision axis | Severity | FE/BE owner | Fix applied | Automated proof | Runtime retest | State |
|---|---|---|---|---|---|---|---|
| F1 orphan OTP URL rendered an impossible OTP state instead of safe fallback | `Behavior / UX` | high | FE auth hydration/state | Root added live hydration guard and safe URL normalization | Root targeted suite included in `104` PASS | Fresh direct orphan URL normalized to details, E4–E5 | `pass` |
| F2 `Dùng email khác` TextLink was a no-op on the pre-repair OTP dead-end | `UX` | high | FE TextLink/navigation | Root repaired shared TextLink propagation/navigation | Root targeted suite included in `104` PASS | Safe fallback makes the dead-end unreachable in this case; recovery continued through details to Dashboard, E4–E11 | `pass` |
| F3 IAB `127.0.0.1` cookie was shared with another case | `Behavior / isolation` | high | Runtime test isolation | Rejected contaminated receipt; used case-specific `missing-challenge.lvh.me` cookie host; never cleared shared cookies | Root CORS/host-alignment receipt | Exact identity session proved on isolated host, E10–E12 | `pass` |
| F4 shared UAT password exposure was reported during the run | `Behavior / fixture security` | critical | Root fixture/runtime owner | Stopped all typing; root rotated key and reprovisioned active accounts; resumed only with new ciphertext | Root rotation/reprovision receipt | New key completed exact case; no secret output; holders zeroed, E6–E12 | `pass` |

Open findings: `0`.

## Feedback calibration

Literal marker: `TEACHER feedback`.

| Decision | AI conclusion | Thầy correction / approval | Authority learning |
|---|---|---|---|
| Behavior | Initial plan respected one case/account/session but the first IAB profile was contaminated | `sao không cắm agent parrallel khác acc mà lo chi` — run parallel with a different account/profile and do not serialize unrelated UAT cases | Parallelism is valid only with exact per-case account, cookie host/browser profile, agent and tab isolation; an alias alone does not isolate cookies |
| UX | Safe fallback must continue through valid proof, not stop at details | Missing challenge is a dedicated recovery case and must continue beyond safe fallback to Dashboard | Unhappy UAT ends at real recovery completion, including reload persistence |
| UI | Existing Authentication calibration supplied complete authority | No new render question remained after runtime repair | Correct state copy, conventional controls, one visual owner and destination-as-feedback yield `NO SUSPENSE` |

## Retest receipt

- Initial fresh-host runtime exposed F1/F2; evidence was sent to root before any shared source mutation by this agent.
- Root repaired shared owners and reported `104` targeted tests PASS.
- Password exposure stop was honored; no credential was entered until rotation/reprovision was confirmed.
- Fresh exact-case rerun then passed orphan normalization, session-zero checkpoint, details pending, new challenge, OTP pending, direct Dashboard, refresh persistence, exact identity, Keycloak markers/session and `UserEntity.is_uat=true`.
- Browser residuals: console errors `0`; non-empty alerts `0`.
- Secrets persisted/logged: `0`.

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior decision | `PASS` or justified `N/A` | `PASS` |
| UX decision | `PASS` or justified `N/A` | `PASS` |
| UI decision | `PASS` | `PASS` |
| Open UI SUSPENSE | `0` | `0` |
| Open findings | `0` | `0` |
| Account/session isolation | `PASS` | `PASS` — exact account + cookie-isolated hostname + dedicated agent/session/tab |
| Direct Dashboard + refresh | `PASS` | `PASS` — exact identity visible before and after reload |
| UAT marker | `PASS` | `PASS` — Keycloak markers + `UserEntity.is_uat=true` |

Final case result: `PASS — NO SUSPENSE`.
