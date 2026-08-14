# Context Lock - preview

Inherited from `context-lock.plan.json`, redetected, and compared field by field.

| Field | Inherited (plan) | Detected now | Drift |
|---|---|---|---|
| Trust root | `D:\Repositories\starci-academy-backend\.claude` | same | none |
| Trust git | `session/surface-branch-and-press-affordance` · `3e75901` | same | none |
| Primary target | `D:\Repositories\starci-academy-fe` | same | none |
| Target git | `session/surface-branch-and-press-affordance` · `a5d833a` | same | none |
| Reference | `D:\Repositories\starci-academy` · `mtp` · `9a19342` | same | none |
| Artifact root | `...\.artifacts\design-plan\learn-system-map` | same | none |
| Case | `case-learn-system` | same | none |
| Selected direction | `direction-b-one-spine` (explicit) | same | none |

No drift. Preview writes only inside the artifact root; target `src/`, the legacy repository and the
trust tree stay read-only.

## Scope of this Preview run

`learn-content-page` — the reader — first, by the instruction recorded in the plan record. The shell
that carries it is part of the same case and appears in the candidate only as much as the reader
needs to be judged: the spine is present so the reader can be seen inside it, and its own interior
decisions stay with `learn-shell-layout`.

## The named reference, read at `9a19342`

The request names legacy and asks for parity of CONCEPT, so the source was read rather than the
picture. What the legacy reader is:

| Piece | Legacy owner |
|---|---|
| Route | `learn/content/modules/[moduleId]/contents/[contentId]/page.tsx` -> `pages/ContentPage` |
| Header | `blocks/learn/lesson/ContentHeader` (+ its own skeleton) |
| Tabs | `blocks/learn/lesson/ContentTabBar`, keyed by `ContentTab`: content, codeExplainings, challenges, sandbox, aiLab, e2e - each shown only when the lesson HAS that thing |
| Locked lesson | `blocks/learn/lesson/PremiumPaywall`, replacing the body |
| Selection-to-AI hint | `blocks/learn/ContentAiSelectionAsk/SelectionHintCallout`, only when unlocked |
| Reactions | `ContentReactionBar` inside a surface |
| What next | `UpNextCard`, then `RelatedContentList` |
| Discussion | `ContentDiscussion` |
| Pager | `LessonPager` |
| Inline advertisement | `blocks/marketing/AdBanner` |
| Rails around it | shell: resizable contents map left, on-this-page outline right |

Reading order, from the source: header, tabs, body (or paywall), reactions, up-next, related,
discussion, pager.

## What this run must NOT decide

Recorded in the plan record as unknowns, and unchanged: the four spine groups are this case's claim
rather than the legacy repository's; whether the contents panel keeps the legacy resizable rail; and
whether a trial viewer sees a gated entry marked or not at all.
