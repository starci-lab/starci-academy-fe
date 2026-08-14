# Preview status — `case-coding-practice` / `direction-path-first`

Phase `preview`. Lock relocked to `starci-academy-fe` `main` @ `f06071e`.
Current revision: **1.1** — awaiting explicit approval. Nothing is sealed.

## Proofs

| Proof | Command | Exit |
|---|---|---|
| Types | `tsc --noEmit` | **0** |
| Canon | `eslint candidate/src/**/*.{ts,tsx}` | **0** |
| Build | `next build` | **0** |

Logs: [`candidate/lint.log`](candidate/lint.log), [`candidate/build.log`](candidate/build.log).
Review lab: `index.html` at the artifact root, loading the exported candidate through an iframe.
There is no second CSS implementation and no `state.html`.

## Revision ledger

### 1.0 — the direction, built

Three pages, six owners, twenty-two scenarios. Typecheck, canon lint and build all clean on the
first full pass.

### 1.1 — the measure the layout asked for and did not get

| Element | Change | Reason |
|---|---|---|
| `problem-reading-column` | `md:shrink-0` added | **Measured, not noticed.** The entry asked for `md:w-2/5` and the running page gave it **273px inside a 934px viewport** — 29%, where two fifths is 373. The work column's `grow` was squeezing it, because a proportional width is a REQUEST until shrinking is refused. After the fix: **368 / 919 = 40%**, exactly as declared. |

Retained: everything else. No other region was touched.

## What the inventory pass changed — four proposals shrank or died

Plan named six new owners. Reading the shipped source before writing killed two of them and
converted a third into a slot widening.

| Plan proposed | Built | Why |
|---|---|---|
| `leaf-verdict-chip` | **withdrawn** | `StatusDot` already carries four tones and `Badge` five. Plan's argument was "ten call sites would pick ten tones for `wrongAnswer`" — there are two, and a closed map inside `JudgeStatusStrip` is smaller than a new leaf. |
| `leaf-markdown-prose` | **withdrawn** | `leaves/Article` already renders authored Markdown. Its own comment records that canon refused `react-markdown` in that file **twice** — every replacement takes `children`, and heading replacements wrote raw tags that split the outline from the visible size. A second owner would have repeated both refusals and pulled in a dependency to do it. This also made the owner's shiki choice unnecessary: **no markdown dependency was installed.** |
| a new problem-list entry | **EXTEND** `marked-row-list` | A second joined-list entry would have carried an identical class list, which is exactly what `no-duplicate-entry-shape` refuses. The slot was widened to admit the row contract beside the composite. |
| `stacked-peer-controls` for the two actions | **REUSE** `catalog-card-action-row` | The first reach was wrong: `stacked-peer-controls` is `flex-col`, so it would have stacked Run above Submit at full width inside a toolbar. |
| `leaf-code-editor` | built, on CodeMirror 6 | Installed at the owner's instruction. Six packages; the three npm audit warnings are pre-existing in `next`, `postcss` and `sharp`. |
| `SolutionEditor` drawing the verdict strip | **split** | Wrong ownership: the verdict is driven by a socket and the editor by a keyboard. The page composes both. |

## The relationship sheet

| Seam | Separates | Level |
|---|---|---|
| `coding-practice-page` `gap-6` | resume · topic field · ranking | page regions |
| `domain-mastery-grid` `gap-4` | one topic from the next | peer cards in a scanned field |
| `domain-mastery-card` `gap-2` | name · count · meter | one unit's parts |
| `marked-row-list` `divide-y` | one problem from the next | peers of a joined list, no gap |
| `coding-problem-page` seam | reading from writing | the screen's two halves; a rule, not a gap |
| `judge-status-strip` `border-b` | the verdict from the work | a fixed announcement above a changing surface |

| Text | Rank |
|---|---|
| page title | `Heading` level 1 |
| topic name on a card | `text` sm semibold |
| solved-of-total | `text` xs muted |
| problem title in a row | `text` default |
| difficulty and points | `text` xs muted |
| verdict name | `text` sm semibold |
| verdict detail | `text` xs muted |

| Control | Variant | Reason |
|---|---|---|
| topic card | `PressableSurface` `isRaised`, `hover: "surface"` | nothing inside names the destination, so the surface answers |
| problem row | `PressableSurface`, not raised | a row in a joined list is not its own object |
| Run | `outline` sm | a rehearsal, not the commitment |
| Submit | `primary` sm, `isPending` while in flight | the one commitment on the screen |
| next-in-domain | `primary` sm with a trailing `next` glyph | it moves the reader onward, which is what the direction is for |

## Open questions — decisions taken, overturnable in a sentence

1. **The problem row's mark is binary.** The server splits solved from attempted, so three
   situations exist, and the icon vocabulary holds two glyphs that mean progress. Rather than press
   a third into service meaning something it does not, the tick says solved-or-not and the quiet
   fact carries "đã nộp 3 lần". Cost: an attempted problem looks untouched at a glance.
2. **`catalog-card-action-row` is reused for the two attempt actions, and its NAME still says
   `catalog`.** Renaming a shipped entry touches every call site and belongs to a consolidation run.
   Cost: one key now lies about where it is used.
3. **A topic with no problems still gets a card**, showing "Chưa có bài". The alternative was hiding
   it, and hiding it makes the field's size depend on the catalog rather than on the curriculum.
4. **The hub's ranking shows three rows**, not ten. It is a summary with a way through to the full
   board, because the hub's job is what to practise next.
5. **Vietnamese copy throughout**, matching the rest of the product. Nothing here is translated yet.

## Consolidation verdicts — every new owner against its nearest kin

| New owner | Nearest kin | Verdict | The fact that decides it |
|---|---|---|---|
| `CodeEditor` | `CodeBlock` | **keep-apart** | different vendor primitive: CodeMirror's `EditorView` against a static `<pre>`. One owns input, selection and key handling; the other owns none of them. |
| `domain-mastery-card` | `course-progress-row` | **keep-apart** | different arrangement axis and different slot identity: that is a ROW with a segmented track and a legend; this is a grid CELL with a single measure. Twenty of the former cannot be scanned. |
| `domain-mastery-grid` | `profile-project-card-grid` | **keep-apart** | different slot identity: those cards hold a title and a description, these hold a title and a MEASURE. |
| `judge-status-strip` | `status-dot-with-label` | **keep-apart** | different slot identity: that carries a state with no detail and no action; this carries both, and must exist before the first submission. |
| `editor-over-console` | `course-progress-body` | **keep-apart** | different sizing contract: this region's height is what the bar above and the tray below leave it. Nothing shipped describes a leftover-height region. |
| `testcase-chip-run` | `profile-topic-chip-run` | **keep-apart** | different child identity: those chips carry labels, these carry a pass/fail state that tones them. |
| `coding-practice-page`, `coding-domain-page`, `coding-problem-page` | the other page entries | **keep-apart** | one entry per route, as every page in the registry already is. |
| `CodingProblemList` row | `TaskProgressRow` composite | **keep-apart** | different press semantics: that composite renders its own `Tree` and cannot be pressed. A problem row must open the problem — focus, keyboard, pressed state. |
| `MarkdownProse` | `Article` | **merge** | done. The leaf was written and withdrawn. |
| `VerdictChip` | `StatusDot` + `Badge` | **merge** | done. Never written. |

## Owner-state coverage

Twenty-two scenarios, each with its own address (`?state=<id>`).

| Owner | States | Coverage |
|---|---|---|
| `page` × 3 | route entry, guest, populated | rendered |
| `DomainMasteryGrid` | pending, ready, guest, progress-failed | rendered |
| `CodingProblemList` | pending, ready, empty, all-solved | rendered |
| `ProblemReadingColumn` | pending, ready, hint tab | rendered |
| `JudgeStatusStrip` | **all nine verdicts** + idle + socket-lost | rendered |
| `SolutionEditor` | ready, submitting, judged | covered-by the verdict scenarios |

Screenshots for seven states in [`screenshots/`](screenshots/).

## Items — what this phase cannot decide

| Item | Kind | Status |
|---|---|---|
| CodeMirror 6 | RESOURCE | **done** — six packages installed at the owner's instruction |
| Markdown renderer | RESOURCE | **not needed** — `Article` already renders it |
| `socket.io-client` | RESOURCE | **still owed.** Every verdict state renders from a fixture; nothing subscribes yet. It is the connected half's dependency, so it blocks Apply rather than this revision. |
| The harness gives the page 485px | NOTE | a harness artifact, not a defect: `min-h-screen` fills the viewport on a real route |
