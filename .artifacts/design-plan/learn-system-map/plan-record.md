# learn-system-map — plan record

`case-learn-system` · status `direction-selected` · selected **`direction-b-one-spine`**
Render status: `directional-not-apply-baseline`. Parity baseline: `starci-academy@9a19342`,
`/courses/[courseId]/learn/**`.

## What was selected, and under what condition

**B — one spine.** The eleven learn modes are carried by one persistent left rail, grouped by what
they are for, and the lesson's own contents drop to a second-level panel inside the reader.

The selection came with two conditions, and they are part of the direction rather than notes beside
it:

1. **Parity is at the level of CONCEPT, not only of pixels.** The legacy repository is the source of
   what each surface MEANS - what `/learn` opens onto, which surfaces a trial viewer may browse,
   what a live assessment does to the frame - and this case does not re-decide any of that.
2. **The content page is built first.** Everything else in the case hangs off the shell and the
   reader; the remaining nine modes are later cases whose only commitment here is where they hang.

## Work items

| Item | Scope | Depends on | What it settles |
|---|---|---|---|
| `learn-shell-layout` | layout | — | The spine, the course frame, and the rule that a live assessment takes the whole screen |
| `learn-content-page` | page | shell | **First.** Lesson body, contents panel, on-this-page outline, pager, paywall boundary |
| `learn-mode-surfaces` | page ×9 | shell, content | Where each remaining mode hangs; each interior is its own case |

## Evidence this rests on

Read at the reference HEAD, not assumed:

- `/learn` redirects to `/learn/content`, so the reader is the legacy home.
- `LearnShellLayout` decides rails per segment: content and modules get a **resizable** left content
  map plus a right on-this-page outline; the capstone gets a milestone rail; every other mode is
  full width.
- `isAssessmentLive` flags a live quiz or interview apart from its own mode.
- `ENROLL_REQUIRED_SURFACES` gates exactly one surface, the capstone. Trial viewers browse the rest.
- `LearnMobileTabBar` carries map / lesson / on-this-page on narrow screens.
- Eleven route segments, twenty-nine pages, one hundred and twenty-three learn blocks.

## What is still unknown, and must not be answered by inventing

- The four groups of the spine are this case's claim about what the modes are FOR. The legacy
  repository groups nothing; it lists segments. If the product has its own words for those groups,
  they win.
- Whether the contents panel keeps the legacy resizable behaviour or becomes a fixed measure.
- Whether a trial viewer sees the gated entry at all, or sees it marked.

## Inventory before invention

Two shapes this direction needs, each to be settled against what exists before any key is written:

| Needed | Nearest existing | Verdict to record in Preview |
|---|---|---|
| A spine entry: grouped rows of destinations | `marked-row-list` (joined rows), `label-row-over-card` (a named section over a surface) | REUSE / EXTEND / NEW — decided with evidence, not by eye |
| A rail-then-main page frame | the existing rail layouts, which already express `md:[&>*:first-child]:w-72` and its sticky twin | REUSE unless the measured behaviour differs |

## Handoff

Route to `$starci-fe-design-preview` with `caseId: case-learn-system` and
`selectedDirectionId: direction-b-one-spine`, scoped to `learn-content-page` first. Preview rebuilds
the direction as an executable candidate against locked fixtures; it does not bless this lab by
copying it.
