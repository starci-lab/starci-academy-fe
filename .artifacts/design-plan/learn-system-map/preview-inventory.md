# learn-content-page — inventory before invention

Revision `1.0` is not written until every row below carries a verdict. The rule this serves: an
entry whose class list and child identities repeat an existing entry is the same concept under a
second name, and a row assembled inline from a leaf plus a glyph is that failure where no lint can
see it.

Legacy pieces are read from `starci-academy@9a19342`, `pages/ContentPage`. Target owners are read
from `starci-academy-fe@a5d833a`.

| Legacy piece | Nearest existing target owner | Verdict | Reason |
|---|---|---|---|
| `ContentHeader` — lesson title, module trail, meta | `page-header-stack` (trail over title) + `title-with-baseline-fact` | **REUSE** | The relationship is where-you-are over what-this-is, which `page-header-stack` already owns and the catalog and leaderboard both reach for. |
| `ContentTabBar` — six possible tabs, each shown only when the lesson HAS that thing | `ExtendedTabs` leaf; `ChoiceTabs` for the pill form | **REUSE + EXTEND?** | Which of the two, and whether an absent tab is hidden or disabled, is an open question below - not a new leaf. |
| Article body (markdown/prose) | **nothing** | **NEW** | No target owner renders long-form lesson prose. This is the one genuinely new surface, and it is a leaf question (one vendor renderer) rather than an entry question. |
| `PremiumPaywall` replacing the body | `EmptyNotice` composite; `empty-notice-card` entry | **EXTEND or NEW** | A paywall is not an empty state: it states a price and asks for money, and `EmptyNotice` owns a message plus one recovery action. Decide against `CoursePricingRail`, which already states a price. |
| `SelectionHintCallout` — selecting text offers the AI | **nothing** | **NEW, deferred** | Belongs to the AI lane; the reader can be judged without it, and inventing it here would settle a lane this case never surveyed. |
| `ContentReactionBar` | `ReactionPicker` leaf | **REUSE** | Same vendor primitive and the same relationship: a fixed set of reactions over one subject. |
| `UpNextCard` | `SurfaceCard` + `catalog-card-line` body shape | **REUSE** | One course-object row on its own ground; the catalog line already spells it. |
| `RelatedContentList` | `marked-row-list` (joined rows) or `course-module-list` | **REUSE** | A joined list of destinations. Which of the two is a measure question, not a vocabulary one. |
| `ContentDiscussion` — thread + composer | **nothing** | **NEW, deferred** | A comment thread is its own case with its own states; the reader is judged without it in `1.0`, and the manifest records it as `covered-by` a later case. |
| `LessonPager` | `Pagination` leaf | **EXTEND?** | The leaf pages a NUMBERED set; a lesson pager names the previous and next lesson. Two different relationships - settle by the three tests before writing either. |
| `AdBanner` inline | **nothing** | **deferred** | Marketing surface, outside this case. |
| Contents map rail (shell) | `course-module-list` + `SurfaceListCard` | **REUSE** | The module list already exists on the course detail page and is the same tree. |
| On-this-page outline (shell) | `marked-row-list` | **REUSE?** | Headings of the current body; the joined row list expresses it if the rows carry no mark. |
| Spine (shell) | `marked-row-list` + `label-row-over-card` | **open** | Recorded in the plan record as the direction's own proposal; settled with the shell, not here. |

## What revision 1.0 will contain

The reader inside the spine, at one route, with the pieces marked REUSE plus the two NEW ones the
reader cannot be judged without: the article body and the paywall boundary.

Deferred with a reason, and recorded in the state manifest rather than silently dropped: the AI
selection hint, the discussion, the advertisement.

## State manifest for `page-learn-content`

| State | Coverage | Evidence |
|---|---|---|
| loading | rendered | resting header, resting body |
| lesson body, unlocked | rendered | the ordinary case |
| lesson body, no headings | rendered | the outline rail must disappear rather than stand empty |
| locked premium lesson | rendered | body replaced by the paywall boundary |
| first lesson | rendered | pager has no previous |
| last lesson | rendered | pager has no next |
| failed | rendered | the request failed rather than returned nothing |
| tab absent (no sandbox, no AI lab) | rendered | the tab bar shows what the lesson has |
| discussion, AI hint, advertisement | covered-by | later cases, named above |

## Revision 1.2 — the legacy page read rather than remembered

Revision 1.1 was built from a description of `pages/ContentPage`. Reading that file line by line
found five divergences at once, so this revision follows its composition instead of its summary.

| Legacy composition | 1.1 drew | 1.2 draws |
|---|---|---|
| The article sits on a card - the paper - and the chrome around it stays bare | prose straight on the page ground | `SurfaceCard` at the reading measure, holding hint, article and paywall |
| A locked lesson keeps its paper: the body is masked and the paywall JOINS it | the notice replaced the body | one preview section, then the paywall, in the same card |
| Locked or resting suppresses the whole footer | reactions and pager still stood | footer absent unless the lesson is actually readable |
| The reaction bar has its own surface | a bare `42` under the prose | its own card, a prompt at the start of the row and the count at the end |
| Up-next and related are separate blocks under a name | one unnamed run of rows | one named joined card (both answer the same question - recorded as a deliberate merge) |
| The tab bar is never skeletonised - faces come from the route | rested with the body | real at every state |
| Reading region, footer and advertisement sit at NO seam inside one column | one page-level stack at the block seam | `lesson-reading-column`, no gap class, blocks owning their own trailing space |

New entries this revision proposes: `lesson-reading-column`, `lesson-reading-paper`,
`lesson-reader-footer`, `lesson-reaction-card`. The page entry lost `reactions`, `next` and `pager`
as direct children - they belong to the footer, and a page holding them directly is what made the
locked state hard to suppress in one place.

Two token facts the rebuild had to respect, and both are refusals rather than preferences: legacy's
`StackV gap={1}` is a ZERO seam, which this scale does not name - the column simply declares no gap
class; and legacy's `gap={5}` (20px) is off this ladder, so the paper's interior takes `gap-4`.

### Still not drawn, and why

| Missing | Reason |
|---|---|
| The fade over a locked preview (`LockedContentMask`) | A new leaf nobody has approved. The preview is short instead of faded, which is honest but not legacy's picture. |
| The two desktop rails - contents map, on-this-page | They belong to the spine shell, not to the reader. |
| Discussion, advertisement | Deferred with a reason above. |

## Revision 1.3 — the two rails, and the entity's real name

Two corrections, both from the running product rather than from a reading of it.

**The reader is three columns, not one.** The plan record already put the contents panel and the
on-this-page outline INSIDE `learn-content-page`; 1.2 shipped the middle column alone and called the
rails somebody else's work. `LearnShellLayout` in the reference repository confirms the geometry:
a course-nav spine (the shell's own item, still out of scope here), then the content map at a
drag-resizable 320px, the reading column, and the outline rail at 256px - both rails sticky under
the navbar, viewport-tall, scrolling on their own.

New entries: `content-reader-frame`, `content-map-panel`, `content-outline-rail`. The frame borrows
the rail idiom `main-then-rail` already uses and adds the two members a middle column needs
(`md:[&>*:nth-child(2)]:min-w-0`, `:grow`).

**The entity is `content`, not `lesson`.** Renamed across the candidate: every contract key, type and
fixture field. The reference product says `ContentPage`, `ContentTabBar`, `ContentMap`, `contentId`;
a second word for one entity is how a codebase ends up with two owners for it. The only `lesson` left
is `CurriculumModuleRow`'s own `lessons` slot, which is a locked leaf's API and not this candidate's
to rename.

### Open questions this revision had to settle

| Decision | Taken as | Cost |
|---|---|---|
| The outline title names a nav, not a control | `text` at `sm`/`muted`, not `Label` | A `Label` requires `htmlFor`; the rail names a region. Neither is in the heading outline. |
| An in-page destination is not a route or a tab | `text-link` | `NavLink`'s `kind` admits `route` and `tab` only. A third kind is a real gap - recorded, not invented. |
| The current outline entry | `isSelected` | Draws as a filled pill, where the reference tints the words. Wrong affordance, and the next revision's first fix. |
