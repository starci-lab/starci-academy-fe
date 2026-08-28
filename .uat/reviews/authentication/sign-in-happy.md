# UAT Case — Authentication / Sign in / Happy

Status: `pass`

## Case contract

| Field | Value |
|---|---|
| Case ID | `authentication.sign-in.happy` |
| Case kind | `happy` |
| User goal | Đăng nhập bằng tài khoản hợp lệ, hoàn tất OTP và vào thẳng Dashboard mà không dựng success-interstitial |
| Entry | Guest opens `/vi/authentication` in sign-in mode |
| Success condition | URL is `/vi/dashboard`, authenticated identity matches this case account, and Dashboard primary content renders |
| In scope | Sign-in details, OTP proof, both pending states, session completion and immediate authenticated Dashboard redirect; desktop viewport |
| Out of scope | Wrong password/OTP, Google/GitHub, sign-up, forgot password, Dashboard content audit |

One file is one case. No unhappy assertion may be added here.

## Source provenance

| Field | Value |
|---|---|
| Review started at | `2026-08-28T11:25:00+07:00` |
| Journal / FE branch + commit | `main` / `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE branch + commit | `mtp` / `c10c3f7719ed102e85813ab9380231e995ba3b85` |
| Relevant dirty files | FE `AuthenticationPanel/component.tsx`, `.uat/**`; BE UAT marker/migration and encrypted fixture support |
| Runtime | FE `http://127.0.0.1:3000`; BE `http://localhost:3001`; local Keycloak/PostgreSQL |
| Selected Grammar | `@starci/grammar/core`; `fe.grammar-common-overview` + Core Fields/Actions/Navigation |
| Viewports | Desktop `1024 × 576` post-fix details-state receipt |

## Isolation receipt

| Owner | Dedicated value | Proof |
|---|---|---|
| UAT account | `uat-auth-sign-in-happy@starci.local` | Registry `is_uat=true`; app DB marker previously verified; Keycloak `uat_case=authentication.sign-in.happy` |
| Password binding | `backend:.stacks/dev/runtime/files/uat-account-password.key.enc` | Random UAT password; plaintext resolves only from trusted runtime `.key` and stays memory-only |
| Agent | `current chat` | This run owns only `authentication.sign-in.happy` |
| Browser session | `auth.sign-in.happy.post-fix` | Fresh guest tab created after the layout fix; it entered only this case and ended authenticated as the dedicated account |
| Mailbox | Disposable loopback Mailpit | Fresh `starci-uat-mailpit` container on loopback ports `1025/8025`; OTP was consumed in-memory and never written to this file |

## Preconditions

| Requirement | Expected fixture/state | Verified evidence |
|---|---|---|
| Account | Present in Keycloak/app DB with exact UAT markers | Case-only provisioner returned `ready authentication.sign-in.happy`; runtime destination exposed the exact case identity |
| Credential | Random shared UAT password from backend `.stacks` ciphertext | Encrypted artifact exists; plaintext must be decrypted only for execution |
| Session | Guest and not shared with another case | Fresh guest tab opened at `/vi/authentication`; no other case ran in this browser receipt |
| Mail | Loopback-only disposable inbox | Fresh Mailpit container bound only to `127.0.0.1`; message addressed to the exact case account |

## Steps and checkpoints

| Step | Visible user action | Behavior checkpoint | UX checkpoint | UI checkpoint |
|---|---|---|---|---|
| 1 | Open `/vi/authentication` | No authenticated session exists | Complete useful sign-in form renders without a wait | Centred max-width panel; title pair, OAuth stack, form stack, remember/forgot row and prompt row are composed |
| 2 | Enter valid email/password and press `Đăng nhập` | One sign-in-init request verifies credentials and opens the OTP challenge | Submit exposes one inline spinner and prevents duplicate submission | Pending state stays inside the same action without layout shift |
| 3 | Enter the mailbox OTP and press the verify action | The challenge is consumed and the session is established | Verify exposes one inline spinner and prevents duplicate submission | OTP composition remains stable while pending |
| 4 | Observe navigation after verification | Session identity is the dedicated case account; no `done`/redirecting screen renders | Journey reaches Dashboard immediately after the final proof | Dashboard destination renders; Dashboard UI quality remains out of scope |

## Evidence

| ID | Observation or sanitized artifact | Proves | Does not prove |
|---|---|---|---|
| E0 | Pre-fix runtime reached `/vi/dashboard` with this dedicated identity after correct OTP | Baseline Behavior happy path worked before repair | Post-fix UI or loading behavior |
| E1 | Pre-fix screenshot/DOM showed bare block wrappers and stacked remember/forgot plus prompt/action controls | The layout defect existed | That the current repair passes runtime |
| E2 | Current source attaches explicit flex, width, gap, alignment and wrapping classes without restoring the removed contract renderer | Repair intent addresses the diagnosed owner | Actual computed layout after rebuild |
| E3 | Post-fix details state at `1024 × 576`: root `448px` centred flex column with `24px` gap; header flex column `12px`; form flex column `16px`; prompt row flex/centred `8px`; screenshot visibly restores remember/forgot peer row | Details-state layout repair works at the tested desktop viewport | OTP state, pending states or completed journey |
| E4 | Immediately after details submit, all credential/OAuth inputs were disabled and status announced `Đang kiểm tra thông tin của bạn` | Details pending feedback is visible and duplicate submission is blocked | OTP verification or destination |
| E5 | OTP screen named the exact case email and 10-minute expiry; computed panel/form were flex columns with `24px`/`16px` gaps; primary action and resend/change actions rendered in hierarchy | OTP render completeness and layout composition | Successful verification |
| E6 | Immediately after OTP submit, the code field and primary action were disabled and status announced `Đang kiểm tra mã của bạn` | OTP pending feedback is visible and duplicate verification is blocked | Authenticated destination |
| E7 | Runtime redirected to `/vi/dashboard`; account controls exposed `uat-auth-sign-in-happy@starci.local`; primary Dashboard content included `Tiếp tục học` | End-to-end success condition and exact session identity | Dashboard UX/UI quality, which is out of scope |
| E8 | TEACHER feedback with desktop and zoomed screenshots: the form composition is fixed, but the owning surface still spans the viewport; it lacks a small centred card, vertical breathing room, and a bounded scroll treatment that keeps the card shadow legible under zoom | The earlier UI PASS inspected too narrow an owner and is invalid | The page-surface repair, until retested |
| E9 | TEACHER feedback screenshot of details pending: the primary button became an empty pink bar while status text rendered elsewhere | Pending state loses the action identity even though a spinner node exists | Button leaf repair and runtime retest |
| E10 | TEACHER feedback screenshot of transport failure: server error rendered as ordinary black text; HeroUI specifies `ErrorMessage` as the low-level semantic/danger presentation for a non-field error | Error semantics and visual hierarchy are missing | ErrorMessage leaf repair and runtime retest |
| E11 | TEACHER feedback on the first bounded-card repair: the surface remained oversized and its `p-6 sm:p-8` inset was invented instead of following UI authority | Card sizing/spacing was not yet authority-bound | Use the prescribed `p-4`, reduce the card measure, then inspect the real browser again |
| E12 | TEACHER feedback with DevTools box-model screenshots: `p-4` was still implemented as a wrapper inside `Card.Content`; pending still showed no perceptible spinner | The repair used the right number but the wrong component owner, and the spinner used the default accent color against an accent button | Put `p-4` directly on HeroUI `Card.Content`; use HeroUI Button `isPending` plus Spinner `color="current"` |
| E13 | Earlier browser receipt at `1024 × 576`: card width `512px`, `40px` vertical margins and an internal scrollbar | The first bounded-card attempt rendered | Final approval: later TEACHER feedback E22/E24 invalidated its padding ownership and measure |
| E14 | Final pending/error receipts: HeroUI Spinner is `21.24px`, visible, `spinner--current`, computed white beside unchanged `Đăng nhập`; transport failure is HeroUI `.error-message`, `slot=errorMessage`, danger color, `role=alert`, `aria-live=assertive` | Pending action identity and surface-error semantic/visual treatments pass | Other feature-specific error copy |
| E15 | Final build repeated credentials → OTP → verify and redirected to `/vi/dashboard` under `uat-auth-sign-in-happy@starci.local`; Dashboard rendered `Tiếp tục học` | No repair regressed the complete happy journey or isolated identity | Dashboard UI quality |
| E16 | TEACHER feedback screenshot after spinner repair: `Đang kiểm tra thông tin của bạn` still rendered above the pending button | The same pending fact was expressed twice and added unnecessary vertical content | Spinner + retained action label are the complete visual pending treatment; suppress the non-error pending status line |
| E17 | Final no-duplicate browser receipt: details and OTP pending each show only the visible white HeroUI spinner beside `Đăng nhập`; neither `Đang kiểm tra thông tin của bạn` nor `Đang kiểm tra mã của bạn` is rendered; the journey still reaches `/vi/dashboard` under the exact case identity | TEACHER feedback E16 is resolved without regressing loading safety or journey completion | Other cases |
| E18 | TEACHER feedback: use the logo from `https://harness.starci.org/#top`, change the product accent from rose to purple, and do not close this case while thầy still has feedback | Brand identity and terminal approval were still incomplete after E17 | Visual approval of the revised runtime |
| E19 | Implementation receipt: exact Harness `starci-logo.png` added as a 48px auth-header mark; Harness accent `#7547ff` and focus `#7248ff` applied to light/dark theme tokens; 56 targeted tests and FE typecheck pass; SSR returns 200 and contains the new logo | Source, asset, automated behavior and render availability are ready for visual review | Browser appearance or thầy approval |
| E20 | TEACHER feedback corrected the logo owner: the Harness mark is the app identity, not content inside the login form; the form must begin directly with its login heading | E19 placed the right asset on the wrong owner | App-shell/favicon replacement and a clean login card without a leading logo |
| E21 | Post-correction receipt: auth SSR is 200 with no `/brand/starci-logo.png` in its body; app metadata exposes `/icon.png`; shell brand lockup uses the Harness asset; purple tokens remain `#7547ff`/`#7248ff`; 66 targeted tests and FE typecheck pass | E20 is implemented at the correct semantic owner without changing the auth form anatomy | Thầy visual approval and a fresh credential→OTP→dashboard browser run |
| E22 | TEACHER feedback with live DevTools: HeroUI Card still owns its global `p-4` while Card.Content also owns `p-4`, creating two nested insets; field label and input have no required `gap-2` | The prior test asserted only the intended content class, not the competing computed owner; Field had no composition class | Neutralize Card padding at the semantic form-surface boundary, retain one `p-4` on Card.Content, add `gap-2` at Field root, and regression-test both owners |
| E23 | TEACHER feedback: authentication render CSS must be owned by Core Grammar and imported by the app; app `globals.css` or local utility strings are not an acceptable second authority | E22's first repair still placed the exception and Field rhythm in FE-local CSS/classes | Move page, scroll viewport, form surface and Field anatomy to Grammar selectors/exports; app consumers only select semantic classes |
| E24 | TEACHER feedback with normal and zoom screenshots: the card is still wider than its content, its position/measure remain wrong, and the authentication composition must use the existing `ScrollViewport` branch rather than writing overflow directly on the page | `max-w-lg` duplicated sizing authority and page-local `overflow-y-auto` bypassed the branch | One `form-surface` ScrollViewport boundary must own bounded zoom scrolling; Grammar sets a `30rem` outer measure so the `28rem` panel plus the single `p-4` inset fit exactly |
| E25 | Current source/build receipt: Core Grammar exports four semantic form selectors and ships their CSS in `dist`; auth page composes `ScrollViewport boundary="form-surface"`; no auth size/overflow utility remains on the page; app `globals.css` has no form-surface exception; Grammar verify `17/17`, targeted FE tests `38/38`, typecheck PASS, targeted lint PASS on installed canon `3.0.2`; live SSR `200` contains the exact page → scroll branch → form surface → Card `p-0` → Card.Content `p-4` chain and the served CSS contains the zero-padding rule | Grammar/source/runtime bundle contain the requested authority and branch composition; the current lint architecture accepts the implementation without contract pattern | Computed browser geometry and thầy visual approval; Browser plugin policy rejects localhost inspection |
| E26 | TEACHER feedback with normal and 175% zoom screenshots: the `ScrollViewport` branch and bounded height exist, but the page owner still uses `align-items:flex-start`; therefore the intrinsic card is not vertically centred when the page is empty | Size/scroll alone do not satisfy placement; normal and overflow states need one responsive invariant | Grammar page centres the intrinsic viewport on both axes; `max-height` keeps the zoomed branch inside equal outer gaps while the branch, not the page/card, scrolls |
| E27 | Fresh localhost runtime after moving stale Next caches out of the repo: HTTP `200`; served CSS resolves `.starci-core-form-page` to `justify-content:center; align-items:center; min-height:100dvh; padding:1.5rem 1rem; overflow:hidden`; `.starci-core-form-scroll-viewport` resolves to `width:min(100%, 30rem); max-height:calc(100dvh - 3rem); overflow-y:auto`; full FE unit suite `2843` PASS / `35` skipped, full lint PASS, typecheck PASS and Grammar `17/17` PASS | The live localhost bundle—not only source/dist—implements intrinsic centring and bounded branch scrolling without a full-height card | Pixel geometry after thầy refresh at 100% and 175%; Browser plugin cannot inspect loopback by policy |
| E28 | Direct browser receipt through `127.0.0.1`: at 100% the 30rem surface was centred on both axes; at the 175%-equivalent viewport the branch retained equal 40px outer gaps and internal scrolling reached the last form control while `body.scrollHeight === innerHeight` | Loopback browser inspection is available through the routed host and the centring/bounded-overflow invariant works | Correct primitive/owner of the scrolling region; later TEACHER feedback E29 invalidated the native outer-scroll implementation |
| E29 | TEACHER feedback with the HeroUI ScrollShadow reference: the earlier branch was still a native overflow wrapper around the whole Card. The Card must remain the fixed frame; only its content scrolls, using HeroUI's `Vertical` ScrollShadow and its small styled scrollbar. The stray `N` is Next.js dev chrome, not product UI | Scroll primitive, composition owner and UAT screenshot cleanliness were still wrong despite correct geometry | Recompose Card → Card.Content → Vertical ScrollShadow → form, retain one `p-4`, and disable Next dev indicator |
| E30 | Superseded clean-cache receipt: Card.Content contained the ScrollShadow and a later width/margin extension pushed its scrollbar outside the Card edge | The attempted primitive was live but its DOM/geometry did not match HeroUI's direct-child example | Final surface structure; superseded by E31–E32 |
| E31 | TEACHER feedback with HeroUI's exact Orientation source and DevTools screenshot: use `Card className="p-0"` → direct `ScrollShadow className="... p-4" orientation="vertical"`; the previous scrollbar was displaced outside the card. Do not create `SurfaceFormCard` while `SurfaceCard` already exists; make scrolling an `isScrollable` capability reusable by surface families | Both the DOM owner and component abstraction were still wrong | Consolidate into `SurfaceCard`; remove `SurfaceFormCard`; prohibit width/margin offset hacks |
| E32 | Clean-cache `127.0.0.1` receipt after E31: exact DOM is `SurfaceCard` → HeroUI `Card.p-0` → direct HeroUI `.scroll-shadow.scroll-shadow--vertical.scroll-shadow--fade.p-4` → form; no `Card.Content`. At normal viewport Card and ScrollShadow share all four edges exactly (`top/right/bottom/left = 0`), Card width is `480px`, computed padding is `16px`, scrollbar is `thin` with HeroUI token colors. At `687 × 428`, Card keeps `40px` outer vertical gaps, body has no page overflow, ScrollShadow is `348px` high for `548px` content, `data-bottom-scroll=true` at top and `data-top-scroll=true` at bottom; all four edges remain `0` | Scrollbar is anchored to the inside edge by HeroUI's documented structure; internal scroll/fade works without moving the Card frame | Thầy terminal visual approval/no-more-feedback |
| E33 | TEACHER approval after E32: auth card/scroll treatment is satisfactory. Clarified behavior: OTP remains the journey's proof; after successful verification, do not render a “signed in”/redirecting interstitial—navigate straight to Dashboard. New Grammar calibration: heal pain in existing leaf/composite/branch with a prop before creating another component family | UI review loop has no remaining visual correction; the redundant terminal presentation, not OTP, is the behavior defect | Runtime OTP → immediate Dashboard receipt |
| E34 | FE state-machine regression: a routed sign-in stores the token and calls the destination callback while retaining the current pending step until unmount; it does not enter `step: "done"`. Sign-up/forgot-password and unowned surfaces retain an explicit terminal state only when they genuinely need one | The success-interstitial is removed without deleting the OTP proof or terminal states owned by other journeys | Live dedicated-account OTP → Dashboard receipt |
| E35 | TEACHER feedback on the live OTP screen: the step retained `Đăng nhập`/`Đăng nhập để tiếp tục`, then repeated stable guidance as a bold mid-form status and added a visible `Mã OTP` label. The current task must instead own title `Nhập OTP`; the stable sentence is its description; the six-slot HeroUI `InputOTP` keeps an accessible but visually hidden label | OTP hierarchy and primitive convention were wrong even though the code flow functioned | FE auth copy/state mapping + existing `Input(kind="code")`/`Field(labelVisibility="screenReader")`; browser retest and thầy approval |
| E36 | TEACHER feedback after a dev rebuild returned OTP to details: each auth state must be represented in the URL and survive F5. Generic OAuth `state` is already reserved, so the panel uses explicit `authState` values per mode/step and session-scoped safe challenge metadata; password, OTP and token are never persisted there | In-memory-only step state made refresh destroy a valid journey and invalidated browser calibration | Hook regression proves URL state, safe metadata and OTP hydration; live details URL is `?authState=sign-in`; live OTP F5 receipt remains |
| E37 | TEACHER approval of the corrected authentication state logic plus a scoped visual calibration: only sign-in details is slightly too wide. OTP must not inherit that reduction; its six fixed slots are special intrinsic-width content and require a HeroUI Horizontal ScrollShadow when the viewport cannot contain them | The first repair incorrectly changed the shared measure and therefore narrowed OTP too | URL-owned `authState` selects compact `28rem` only for `sign-in`; OTP retains regular `30rem`; Grammar adds a reusable horizontal intrinsic-content region around `InputOTP` instead of compressing slots |
| E38 | Clean `127.0.0.1` retest after E37: sign-in renders the compact class at exactly `448px`, remains centred and retains one `16px` inset. OTP F5 remains at `authState=sign-in-otp`, restores the UAT email/challenge, does not receive the compact class, and at a `216px` inline viewport its six slots keep `268px` intrinsic width inside HeroUI Horizontal ScrollShadow (`data-right-scroll=true`). Hydration/runtime issue badge is gone | State-specific measure and content-specific overflow now coexist without shrinking OTP, losing F5 state or polluting the UAT screenshot | Thầy visual review of the two final states; live OTP proof → Dashboard remains separate behavior evidence |
| E39 | TEACHER feedback on the implementation diff: moving only Horizontal ScrollShadow/CSS into Grammar while leaving HeroUI `InputOTP`, six-slot mapping and OTP semantics in the app `Input` leaf still splits the render decision across two owners | The runtime looked correct but the architectural owner remained wrong | Move the full OTP primitive tree into Core Grammar `OtpInput`; app `Input(kind="code")` becomes a thin data/action adapter, then rerun Grammar and browser evidence |
| E40 | TEACHER feedback on horizontal interaction: when input advances, the scroll region must follow the active target rather than leaving the focused slot outside the visible slice | Horizontal overflow existed, but target tracking was not yet an owned behavior | Core Grammar `OtpInput` owns the region ref and scrolls the active slot with inline-nearest after typing, paste or backspace; consumer remains DOM-agnostic |
| E41 | Narrow browser receipt after E40: typing across all six slots moved the horizontal region to its `52px` maximum and kept the sixth slot fully visible; the Grammar callback derives the active index from the next value for typing, paste and backspace. Grammar verify `4/4` package tests + `17/17` Core tests, targeted lint, FE typecheck and `git diff --check` pass | Horizontal overflow follows the interaction target and the implementation remains inside the Grammar owner | A real OTP submission, intentionally not performed for this interaction-only retest |
| E42 | `TEACHER APPROVE`: after reviewing the final sign-in measure, OTP hierarchy, horizontal/vertical ScrollShadow treatment and active-target correction, thầy explicitly closed the feedback loop | Final visual authority is satisfied; `SUSPENSE = 0`, open findings = 0 | Other Authentication cases, which require their own accounts/sessions/evidence |

## Behavior decision

Decision: `PASS`. Dedicated credentials → OTP → immediate Dashboard already passed in E15/E17; the redundant `done` state was removed by E34 and the corrected logic/state handling received explicit teacher approval in E37/E42.

| Rule / effect | Expected | Observed | Evidence | Owning source |
|---|---|---|---|---|
| Valid credentials open the existing OTP proof | Email challenge and code step remain | Existing runtime and backend contract retain the challenge | E5–E6, E15 | BE sign-in init/verify + FE auth hook |
| Final proof reaches the dedicated destination without a success screen | Dashboard replaces the auth route immediately after token storage | PASS — isolated runtime reaches Dashboard; corrected state machine stores session and routes without a `done` render | E15, E17, E33–E34, E42 | FE auth hook + AuthenticationPage route callback |
| Refresh inside OTP | Same mode, challenge and OTP step reconstruct without credentials being resubmitted | PASS — URL, challenge email and OTP step survive F5 without hydration mismatch | E36, E38 | FE auth hook URL/session hydration |

## UX decision

Decision: `PASS`. Skeleton is correctly N/A; loading, completeness, recovery, refresh continuity and immediate destination behavior pass.

| Runtime gate | Decision | Expected | Observed | Evidence / repair owner |
|---|---|---|---|---|
| Skeleton | N/A | Initial form has no remote page-data dependency | Form is first-render content | Static case boundary |
| Loading | PASS | Details and OTP submit each expose local pending feedback and prevent duplicates | Both states retain their action labels, show one visible HeroUI spinner, disable relevant controls, and render no duplicate status line | E14, E17; FE Button/auth panel/hook |
| Render completeness | PASS | Details, OTP and pending states render inside the revised Grammar-owned surface | Card/ScrollShadow runtime and TEACHER approval | E5–E6, E32–E33 |
| Journey completion | PASS | Final OTP proof reaches Dashboard without rendering success/redirecting UI | Dedicated runtime reaches Dashboard; final source removes the transient `done` state | E15, E17, E33–E34, E42 |

## UI decision

Decision: `PASS` — final runtime, DOM ownership and state-specific treatments are approved by thầy. No open UI SUSPENSE.

Authority: `fe.ui` + `fe.grammar-common-overview` + `fe.grammar-core-overview` + Core Fields/Actions/Navigation.

### Region and render map

| State / viewport | Region | Data or control rendered | Required UI treatment | Authority binding | Evidence |
|---|---|---|---|---|---|
| Details / desktop | Panel | Title, subtitle and auth controls | Centred bounded column with one vertical rhythm | `fe.ui` composition/spacing | PASS at `1024 × 576`, E3 |
| Details / desktop | Peer choice | Remember me + forgot password | One wrapping row with separated peer actions | `fe.ui` hierarchy + Core Actions | PASS at `1024 × 576`, E3 |
| Details / desktop | Prompt | Question + registration action | One centred wrapping prompt row | `fe.ui` hierarchy + Core Navigation | PASS at `1024 × 576`, E3 |
| OTP / desktop | Verification | Step title/description, segmented OTP control, destination hint, action, resend/change links | Current-step hierarchy; HeroUI `InputOTP`; no duplicated visible label or stable status; regular `30rem` surface | `fe.ui` state presentation + Core Fields/Actions | PASS, E35–E42 |
| OTP / narrow inline space | Verification control | Six fixed OTP slots | Preserve intrinsic slot width inside HeroUI Horizontal ScrollShadow; never compress the slots or narrow every state to solve one special control | Core intrinsic-content overflow + HeroUI ScrollShadow | Runtime PASS (`216px < 268px`, right fade active), E38 |
| Details pending / desktop | Feedback | Submit progress and guarded controls | Local status remains in the panel without composition loss | `fe.ui` state presentation + Core Actions | PASS, E4 |
| OTP pending / desktop | Feedback | Verify progress and guarded code control | Local status remains in the verification stack | `fe.ui` state presentation + Core Actions | PASS, E6 |
| Route surface / desktop + zoom | Authentication card | Entire authentication journey | Content-fit compact card; explicit top/bottom gap; Card frame/shadow remain fixed; direct HeroUI Vertical `ScrollShadow.p-4` scrolls when zoom makes content exceed the viewport | Core Grammar form selectors + `SurfaceCard(isScrollable)` + HeroUI ScrollShadow | PASS, E31–E33, E42 |
| Details pending / desktop + zoom | Primary action | Spinner plus unchanged `Đăng nhập` label | Preserve action identity, disable duplicate press, show HeroUI spinner inline with the label | `fe.ui` state continuity + Core Actions | PASS, E14–E15 |
| Transport failure / desktop + zoom | Surface error | Connection failure copy | HeroUI `ErrorMessage` semantic slot/danger treatment, assertive announcement, visually distinct from ordinary text | `fe.ui` error semantics + Core Feedback | PASS, E14 |

### SUSPENSE register

| ID | Exact render question authority cannot answer | Proposed authority owner | Thầy feedback | Resolution evidence |
|---|---|---|---|---|
| None | Current case has enough UI/Grammar authority to implement the requested brand treatment | N/A | No authority ambiguity; waiting for visual feedback is not SUSPENSE | E18–E19 |

Goal: `NO SUSPENSE`.

## Findings and repair loop

| Finding | Decision axis | Severity | FE/BE owner | Fix applied | Automated proof | Runtime retest | State |
|---|---|---|---|---|---|---|---|
| Authentication wrappers lost flex/width/gap/alignment after contract removal | UI | High | FE `AuthenticationPanelBase` | Added explicit current-architecture composition classes; did not restore contract pattern | Targeted component regression PASS; full auth regression recorded after final run | Details, both pending states, OTP and destination PASS | `closed` |
| Authentication route surface uses oversized duplicated measure and page-local overflow | UI | High | Core Grammar + FE `AuthenticationPage`/`SurfaceCard` | Grammar owns regular `30rem` and compact `28rem`; URL state selects compact only for sign-in details. `SurfaceCard(isScrollable)` retains the documented direct HeroUI Vertical ScrollShadow | Grammar/branch/screen regressions; typecheck + lint | Sign-in/OTP/tight browser receipt and teacher approval, E38–E42 | `closed` |
| Pending primary action hides its label and looks like an empty bar | UX + UI | High | FE `Button` leaf | Pass HeroUI `isPending`; render `Spinner size="sm" color="current"` beside the unchanged label | Targeted suite `87/87` PASS | Visible white spinner + label in details and OTP pending, E14–E15 | `closed` |
| Transport failure renders as ordinary black text | UX + UI | High | FE `ErrorMessage` leaf + auth panel | Route surface errors through HeroUI `ErrorMessage` with assertive semantics | Targeted suite `87/87` PASS | Danger semantic error receipt PASS, E14 | `closed` |
| Harness app logo and purple brand treatment are absent | UI | High | FE brand lockup/app icon + global theme | Removed the mark from the auth panel; replaced the app-shell mark and app icon with the exact Harness asset; changed accent/focus tokens to `#7547ff`/`#7248ff` | Targeted tests/typecheck rerun after E20 | TEACHER visual approval E33 | `closed` |
| Form card has two nested `p-4` owners | UI | High | Core Grammar `starci-core-form-surface` + FE `SurfaceCard` | HeroUI Card is `p-0`; direct HeroUI ScrollShadow is the single `p-4` owner; no Card.Content or extra wrapper exists | Grammar CSS + direct DOM owner/absence assertions PASS | Computed browser edges/padding PASS, E32 | `closed` |
| Field label and input have no vertical rhythm | UI | High | Core Grammar `starci-core-form-field` + FE `Field` | Grammar owns column anatomy and `0.5rem` (`gap-2`) rhythm; Field imports only the semantic class | Grammar CSS + Field regression PASS | Browser/TEACHER approval E32–E33 | `closed` |
| OTP reuses the previous step heading, duplicates stable guidance as status and renders a redundant visible label/plain input | UI + UX | High | FE auth state copy + Core Grammar `OtpInput` | OTP owns `Nhập OTP` + description; initial status is empty; Grammar renders HeroUI six-slot `InputOTP`; Field hides only the visual label while retaining its accessible name | Targeted auth/Field/Grammar tests PASS | Browser retest and teacher approval, E35–E42 | `closed` |
| Refresh loses the active authentication step | Behavior + UX | High | FE auth state machine | Added per-mode details/OTP `authState` URL values plus safe session-scoped challenge hydration; no password/OTP/token is persisted; mismatched/missing challenge falls back safely | Hook URL/hydration/security regressions PASS | OTP URL + challenge survives F5 with no hydration issue, E38 | `closed` |

## Feedback calibration

| Decision | AI conclusion | Thầy correction / approval | Authority learning |
|---|---|---|---|
| Behavior | Post-fix happy journey passes under the dedicated account | `TEACHER APPROVE` | Case effects are independently decidable from UI |
| UX | Skeleton N/A; loading, completeness and completion PASS independently | `TEACHER APPROVE` | Four explicit gates prevent a visual-only verdict |
| UI | The composition failure and every calibration correction are repaired and runtime-proven; no SUSPENSE | `TEACHER APPROVE` | `fe.ui` + Core Grammar own the decision |
| TEACHER feedback | Form-level flex is insufficient when the page owner still renders a full-bleed surface. The auth route must render a small centred card with vertical breathing room; `max-width`, visible shadow and zoom-safe scrolling are part of the same responsive UI verdict. | Explicit correction from thầy with normal and zoomed screenshots | Audit the complete ownership chain (page surface → card → panel), and include zoom/overflow evidence before UI PASS |
| TEACHER feedback | Pending does not replace or hide the action name: show a HeroUI spinner together with `Đăng nhập`. A server connection failure must use HeroUI `ErrorMessage`, not ordinary black body copy. | Explicit correction from thầy with pending and failure screenshots | Audit state-specific primitives, not only layout and ARIA presence; the visible semantic treatment is part of PASS |
| TEACHER feedback | Authentication card inset is `p-4`; the first `max-w-xl` surface is too large. Do not invent responsive padding from taste—apply UI authority, then verify the actual browser before a verdict. | Explicit correction from thầy with post-repair screenshot | UI decisions must cite an authority value; browser inspection validates the result but cannot justify a made-up token |
| TEACHER feedback | Do not create nested padding wrappers around HeroUI Card. The one `p-4` belongs to `Card.Content`. For pending, follow HeroUI's component API: Button owns `isPending`; Spinner must inherit the button foreground so it remains visible on the accent fill. | Explicit correction from thầy with DevTools screenshots and request to read HeroUI docs | Inspect both vendor API and computed browser output; presence of a spinner node is not a UI PASS when its color makes it imperceptible |
| TEACHER feedback | Do not print `Đang kiểm tra…` as a separate line while the action already spins. The spinner in the retained action is sufficient pending feedback. | Explicit correction from thầy with final pending screenshot | One state gets one visual owner; do not duplicate the same pending fact in body text and the action |
| TEACHER feedback | Use the logo shown on Harness and move the primary product accent to purple. The case is terminal only when thầy has no further feedback. | Explicit correction from thầy with Harness URL | Match exact supplied brand asset/tokens; AI/test PASS is provisional until the teacher-visible runtime receives no further correction |
| TEACHER feedback | The supplied logo belongs to the app identity; do not put it at the head of the login form. | Explicit correction after the first implementation | Audit the semantic owner of a visual request: “app logo” means the persistent product lockup/icon, while the auth card keeps only journey content |
| TEACHER feedback | Inspecting only Card.Content missed HeroUI Card's global `p-4`, so the browser still had two nested paddings. Labels and inputs require `gap-2`. | Explicit correction with live DevTools | A padding test must prove every competing owner, including global/vendor cascade; field rhythm belongs to the Field composite, not to each auth screen |
| TEACHER feedback | Authentication render CSS belongs inside Grammar. The app may import/select it but must not restate the rule in `globals.css` or local utilities. | Explicit correction after the first E22 repair | One visual decision has one durable CSS owner; regression proves both presence in Grammar and absence from app globals |
| TEACHER feedback | Card measure must follow content instead of leaving a wide empty frame. Authentication must compose the ScrollViewport branch for zoom containment; page-local overflow is not the approved grammar. | Explicit correction with normal and zoom screenshots | Measure, position and overflow are one composition decision: Grammar owns values, branch owns scrolling, page only composes them |
| TEACHER feedback | When the empty page has spare height, the auth card stays vertically centred. At high zoom it must not grow to full viewport height or overflow the page; retain outer gaps and let the selected ScrollViewport branch scroll its contents. | Explicit correction with normal and 175% zoom screenshots | `align-items:center` and bounded branch `max-height` are one invariant; `align-start` is not an acceptable normal-state fallback |
| TEACHER feedback | Scroll must be HeroUI `ScrollShadow` in its vertical form, and only Card content scrolls. The Card itself remains a fixed frame. Use HeroUI's thin/tokenized scrollbar treatment; do not leave native outer-scroll artefacts. The Next.js `N` is dev chrome and must not contaminate UAT screenshots. | Explicit correction with HeroUI Vertical ScrollShadow reference | Primitive choice, scroll owner and screenshot cleanliness are all part of the UI verdict; matching geometry with the wrong scroll implementation is still a failure |
| TEACHER feedback | Copy the official HeroUI structure exactly: `Card.p-0` contains direct `ScrollShadow.p-4`; its scrollbar shares the Card's top/right/bottom edge and must never be displaced with width expansion or negative margin. Do not keep `SurfaceFormCard` beside `SurfaceCard`; scrolling is an `isScrollable` capability of reusable surfaces. | Explicit correction with source snippet, screenshots and component-architecture challenge | Favor one surface API and a documented DOM contract. Reusability means callers choose a capability while the Grammar owns primitive, inset, max-height and edge geometry |
| TEACHER feedback | UI is satisfactory. Keep the OTP proof, but after successful verification navigate straight to Dashboard without rendering a “signed in”/redirecting screen. Grammar evolves by adding props/capabilities to existing leaves, composites and branches when that resolves the old pain; do not release a new component before proving the old one cannot carry the behavior. | Explicit approval plus behavior/architecture correction | Remove UI/state that adds no decision value. Prefer capability evolution over taxonomy growth, and require a concrete unresolved semantic conflict before adding a new family |
| TEACHER feedback | Tránh thừa không cần thiết: nguyên lý tiết kiệm. | Explicit design principle | Destination itself is sufficient completion feedback when no user choice remains; do not spend a state, component or sentence on a transient duplicate fact |
| TEACHER feedback | OTP is a new task state, so its title is `Nhập OTP`; the sentence about the emailed code is the description under that title, not a bold status in the form. A visible `Mã OTP` label is unnecessary when heading, description and six OTP slots already make the task clear, but the accessible name must remain. | Explicit correction with live OTP screenshots | Copy hierarchy follows the active state; stable guidance is description, status is event feedback, and economy removes only visual repetition—not accessibility semantics |
| TEACHER feedback | Mỗi authentication state phải có state trên URL để F5 không làm mất bước hiện tại. | Explicit correction after the OTP state disappeared on rebuild | URL is part of journey state, not decoration. Persist only reconstructible non-secret metadata; never leak credentials, OTP or token into the address bar |
| TEACHER feedback | Logic/state handling is approved. Reduce only the sign-in details card slightly; do not make OTP smaller. OTP's six fixed slots are special intrinsic-width content, so use a HeroUI Horizontal ScrollShadow only there when space runs out. | Explicit approval followed by scope correction after the first shared-measure repair | Measure follows the active state and content type. Compact ordinary vertical forms; preserve intrinsic controls and give only those controls a horizontal overflow branch rather than shrinking the whole journey |
| TEACHER feedback | Do not leave HeroUI `InputOTP` in the app after moving its scroll treatment into Grammar. Move the input implementation itself into Grammar. | Explicit correction from the code diff | Ownership is the complete render decision, not whichever fragment was easiest to reuse. Grammar must own vendor primitive, slots, semantics and overflow together; app maps data/action only |
| TEACHER feedback | Khi nhập vào nội dung scroll phải trỏ target qua luôn. | Explicit interaction correction after horizontal overflow was added | A scrollable control must keep its active/focused target visible. The Grammar owner—not the consumer—tracks the target and moves only as far as needed |
| TEACHER feedback | ỔN RỒI APPROVE. | Explicit terminal approval after the active-target correction | Approval closes only this isolated case after all corrections are repaired, retested and recorded; it does not automatically pass sibling cases |

## Terminal gate

| Gate | Required terminal value | Actual |
|---|---|---|
| Behavior decision | `PASS` | `PASS` |
| UX decision | `PASS` or justified `N/A` | `PASS` (`Skeleton` is justified `N/A`) |
| UI decision | `PASS` | `PASS` |
| Open UI SUSPENSE | `0` | `0` |
| Open findings | `0` | `0` |
| Account/session isolation | `PASS` | `PASS` |

Final case result: `PASS`. `authentication.sign-in.happy` is closed with three independent PASS decisions, isolated UAT evidence, `SUSPENSE = 0`, open findings = 0 and explicit `TEACHER APPROVE`.
