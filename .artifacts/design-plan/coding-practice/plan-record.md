# Plan record — `case-coding-practice`

Status `direction-selected` · mode `migration` · delivery `batch` ·
render status `directional-not-apply-baseline`.

Machine-readable twin: [`plan-record.json`](plan-record.json) — verified `ok: true`.

## Selected

**`direction-path-first`**. Posture `bold`. Selected explicitly by the owner: *"path first"*.

The twenty domains are a curriculum, not a filter. The hub opens on a grid of domains carrying the
learner's own mastery rather than a flat 120-row list; choosing a domain opens its problems; solving
keeps the thread, because the verdict offers the next problem **in that domain**.

This is not an invention. `CodingProblemEntity.domain` documents itself as the *"Primary interview
topic domain (used to group the problem list)"*. The direction takes the entity at its word.

The alternatives were `direction-parity-first` (the legacy two pages, mandatory in migration work)
and `direction-solve-first` (the editor as the product, a thin hub). Both are recorded in full and
remain reachable if Preview finds this direction too expensive.

## Three pages, and the third one is the cost

| Work item | Route | Note |
|---|---|---|
| `coding-practice-hub` | `/practice` | domain grid, resume card, leaderboard summary |
| `coding-domain-page` | `/practice/[domain]` | **exists only in this direction** |
| `coding-problem-page` | `/practice/problem/[slug]` | reading column, editor, verdict strip |

The third page is what grouping by domain costs. It is stated here rather than folded in quietly.

## What the backend already does — and the one thing it cannot

Nine of the eleven capabilities this feature needs already ship:

| Capability | Operation |
|---|---|
| List problems, paginated, with total | `codingProblems` |
| One problem with sample testcases | `codingProblem` |
| A problem's approach hint (Markdown, nullable) | `codingProblemHint` |
| Suggested problems | `codingProblemSuggestions` |
| The viewer's solved / attempted / revealed ids and points | `myCodingProgress` |
| The viewer's submissions for a problem | `myCodingSubmissions` |
| Global ranking by solved count | `codingLeaderboard` |
| Submit for judging | `submitCodingSolution` |
| Reveal the reference solution | `revealCodingSolution` |

**The selected direction is not servable today, and that is the headline finding of this run.**
`codingProblems` filters by `difficulty` and `tag` only — there is **no `domain` filter** — and
`myCodingProgress` returns bare id arrays with no domain attached. So neither *"the problems in
domain X"* nor *"solved 9 of 12 in domain X"* can currently be asked for.

Both halves of the data already exist and are already authorized for this viewer. What is missing is
only the join. That makes this an `additive-enabler` rather than backend design, and two proposals
are recorded in full:

| Id | Delta |
|---|---|
| `enabler-domain-filter` | `CodingProblemsRequest.filters` gains optional `domain?: CodingDomain` |
| `enabler-domain-progress` | New query `myCodingDomainProgress → [{ domain, total, solved, attempted }]` |

Neither is approved. Until they are, the fallback is documented rather than hidden: the client pages
the whole catalog — six requests at the default page size — and groups client-side. That works at
120 problems and degrades with every problem added.

The `tag` filter is **not** a substitute: tags are free text (`array`, `dp`, `graph`) and are not the
domain enum, so filtering by tag would silently return a different set.

## Four backend facts that constrain every direction

**Judging is asynchronous.** `submitCodingSolution` returns `{submissionId, jobId}`; the field
description says that job id is subscribed to over Socket.IO for the verdict. The verdict never
appears in the mutation response.

**Nine verdicts, plus a tenth situation nobody declares.** `pending · judging · accepted ·
wrongAnswer · timeLimitExceeded · memoryLimitExceeded · runtimeError · compileError · internalError`
— and the socket dropping while judging continues server-side. The state manifest carries all ten.

**Anti-cheat is part of the contract.** The submit input accepts `pasteCount`, `pasteSizeMax`,
`keystrokeCount`, `tabBlurCount` and elapsed time from opening the problem. This rules out a plain
`textarea` and puts telemetry ownership inside `SolutionEditor`, which is the only owner that can
see those events.

**Revealing the solution is a recorded act.** `revealCodingSolution` writes into the viewer's
`revealedProblemIds`. The control must state that consequence before it is pressed.

## Inventory before invention

The registry already expressed more of this than expected. Every reuse below was checked against the
relationship it owns, not against how it looks.

| Need | Verdict | Key |
|---|---|---|
| Trail over title | REUSE | `page-header-stack` |
| "Carry on where you were" | REUSE | `resume-item-card` |
| Solved tick + title + difficulty | REUSE | `task-mark-title-fact-row` |
| Ranking card and its rows | REUSE | `leaderboard-card`, `leaderboard-standing-row` |
| **A coding problem statement with tags** | **REUSE** | `profile-coding-statement` — the repository already renders one, read-only, as profile evidence |
| Description / Hint / Solution / Submissions | REUSE | `underlined-tab-strip` |
| Problem tags | REUSE | `profile-topic-chip-run` |
| Domain grid | NEW | `course-progress-row` is the closest shipped shape and is a ROW: the meter sits beside the name on one baseline, which cannot be scanned twenty at a time |
| Verdict strip | NEW | `status-dot-with-label` carries a state with no detail and no action |
| Editor over tray | NEW | no shipped entry describes a region whose height is what is left over |
| Per-testcase marks | NEW | the chip runs that exist carry labels; these carry a pass/fail state |

## Three dependencies, and the frontend has none of them

| Need | Status |
|---|---|
| Code editor | **CodeMirror 6**, chosen by the owner over Monaco |
| Socket client | `socket.io-client` — required by the verdict flow |
| Markdown renderer | **undecided** — statements and hints are both Markdown |

The legacy app carries Monaco, CodeMirror, Sandpack, Shiki and react-syntax-highlighter. The new one
carries none of them, and `CodeBlock` only displays.

## State manifest

Twenty-nine owner states, classified by the owner that can change — not as one flat page list. The
verdict strip alone owns eleven.

## Direction lab

`direction-lab/` · served at `http://127.0.0.1:8081/` (8080 occupied) · PID 44752.

Three directions, two scenes each — hub and problem page. Every canvas carries
`DIRECTIONAL — NOT AN APPLY BASELINE`. Preview must **rebuild** the selected direction as an
executable candidate rather than bless this mockup by copying it.

## Route onward

`$starci-fe-design-preview` with `caseId: case-coding-practice`,
`selectedDirectionId: direction-path-first`.

**Two things to settle before Preview runs.** The target is on
`session/surface-branch-and-press-affordance`, not `main` — Preview inherits that lock. And the two
backend enablers need a decision, because the hub's headline number depends on them; if they are
approved, they belong to `$starci-be-feature-preview` rather than to this phase.
