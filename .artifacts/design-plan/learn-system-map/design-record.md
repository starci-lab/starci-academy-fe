# Design record — `learn-content-page`

`case-learn-system` · direction `direction-b-one-spine` · **approved revision `1.5`** ·
manifest `be49b9639ecd024abc0660d14154d4372052f49c054ae9d09138341a4156dfca`

The machine-readable half is [`design-record.json`](design-record.json), and it is the sealed one.
This file exists so the decisions can be refused in words rather than only in pixels.

## What was approved

The content reader as three columns: the course map on one side, the reading in the middle, the
places inside the page on the other. Eight rendered states, one fixture, one route each.

Approval arrived as "ok" after the revision was presented as `1.4`, and is recorded as
`confirmed-restated` rather than `explicit` — the record says which of the two happened.

`1.5` changes no pixel. It exists because `1.4` sealed without declaring the one edit
materialization requires - the mirror specifier `~candidate/components/*` becoming
`@/components/*` - which would have left Apply choosing between an undeclared difference and a
stop. Declaring it in the record is the whole of the revision.

## What Apply will write

| Candidate file | Target |
|---|---|
| `pages/CourseLearnContentPage/component.tsx` | `src/components/pages/CourseLearnContentPage/component.tsx` |
| `blocks/learn/ContentTabRow/component.tsx` | `src/components/blocks/learn/ContentTabRow/component.tsx` |
| `leaves/ContentMapRow/index.tsx` | `src/components/leaves/ContentMapRow/index.tsx` |
| `leaves/NavLink/index.tsx` | `src/components/leaves/NavLink/index.tsx` |
| `contracts/index.ts` | `src/components/contracts/index.ts` |

Everything else under `candidate/src/components` is the locked target copied verbatim with its
specifiers repointed. It exists so `ContractKey` closes over entries that are still proposals, and
it is **not** a target write.

The page is pure. Its connected twin — the SWR reads, the tab state, the scroll spy that decides
which outline entry is current — is Apply's own work against the reference container, and no part
of it is settled here.

## The eleven entries this adds, in one sentence each

| Key | What it is for |
|---|---|
| `content-reader-frame` | Two rails around a flexible reading column |
| `content-map-panel` | Progress, filter, then the course tree |
| `content-map-module` | A module's name over the contents it discloses |
| `content-map-module-summary` | Name, count, and the control that opens it |
| `content-outline-rail` | The named list of places inside this content |
| `content-reading-column` | Reading and its chrome, at no seam |
| `content-reading-paper` | The card a content is read on |
| `content-reader-footer` | The run of blocks after a content |
| `content-reaction-card` | The question and its count, on their own ground |
| `content-next-list` / `content-next-row` | Where a content leads |
| `content-article-body` | The prose sections themselves |

## Two things the record says NO about, on purpose

**The fade over a locked preview.** Legacy masks the body behind `LockedContentMask`; this shows one
short section instead. A mask is a new owner nobody has approved, and inventing it during Preview
would settle a surface that was never surveyed.

**The spine.** The eleven learn modes hang off `learn-shell-layout`, the case's own work item. The
reader stops at its two rails.

## The vocabulary correction, recorded because it cost a revision

The entity is `content`, not `lesson`. The reference product says so in every name it exposes —
`ContentPage`, `ContentTabBar`, `ContentMap`, `contentId` — and revisions `1.0` through `1.2` used a
second word for one thing. Two names for one entity is how a codebase ends up with two owners for
it. The only `lesson` left in the candidate is `CurriculumModuleRow`'s own slot, which belongs to a
locked leaf.
