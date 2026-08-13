# Preview status — courses catalog page

Case: `case-courses-catalog`
Direction: `direction-enrollment-split` (B · Owned-then-discover)
Revision: **1.7**
Status: **awaiting approval of 1.7.** The record is written and validates against everything except
approval: `verify_design_record.mjs` stops at `Explicit approval evidence is required`, which is the
gate refusing to seal a revision nobody has approved.

Revision 1.6 received the words "ok 1.6". The candidate then changed again — the closed class union
and the collision guard were restored and the dead `proposed.ts` was deleted — so that approval no
longer covers this code, and 1.7 has to be named back before it can be sealed.

## Revision 1.7 — the two regressions closed

| Was | Now |
| --- | --- |
| `LayoutClassName = string`, under a header claiming every class is a member of the locked union | The union is imported from the locked registry, so the compiler holds the claim. The build passing is now the proof |
| No collision guard | Restored: the registry throws at import if a proposed key has landed upstream, or if the one restated locked key has vanished |
| `contracts/proposed.ts` alive but unimported | Deleted. A second copy of the vocabulary is the thing that drifts |

## Revision 1.6 — the registry refactor, and what the check found

The candidate was refactored after approval: `ProposedTree` was replaced by a candidate-local `Tree`
bound to a candidate-local contract registry, every card and page node became a registry key, and
the comments were rewritten to ASCII. That is a better shape than 1.5 — `ProposedTree` took
`children`, which is a hole belonging only to shells — but it invalidates the seal, and the check
found the migration was incomplete.

| Finding | State |
| --- | --- |
| `next build` | **Was failing.** `CourseCatalogCard` still imported the deleted `ProposedTree` |
| Registry keys | **Two missing.** Components referenced `catalog-card` and `enrolled-course-card`; the registry declared neither |
| `ProposedTree` | Gone from every rendered tree; only prose mentions remain |
| `contracts/proposed.ts` | **Dead file.** No module imports it; the registry now lives in `contracts/index.ts` |

Completed here: the two missing entries were added, following the class shape the locked registry
already uses for `profile-achievement-card` and `resume-item-card` — the precedent the card's own
comment names — and `CourseCatalogCard` was converted to `Tree` / `defineContract` like its two
siblings.

Verified after: build exits 0, and the rendered page draws **twelve** distinct registry nodes, every
one carrying `data-why`, with zero `ProposedTree` left and both view tabs single-line with one glyph
each.

## Two things the refactor gave up, recorded rather than smoothed over

1. **The closed class union is gone in the candidate.** `LayoutClassName` is now `string`, where the
   locked registry declares a closed union. The earlier guarantee that every proposed class is
   already a member of that union is no longer enforced by the candidate's own types; it was true
   when checked by hand, and nothing now keeps it true.
2. **The collision guard is gone.** The old `proposed.ts` threw if a proposed key had since been
   added to the locked registry. `contracts/index.ts` carries no equivalent, so a key that lands
   upstream would leave the candidate silently rendering its own copy.

## The seal

`design-record.json` still names revision 1.5 and hashes that no longer match:
`verify_design_record.mjs` fails with `Candidate hash drift: candidate/src/components/leaves/CoverImage/index.tsx`.

The record's file map is also stale: it maps `contracts/proposed.ts` to
`src/components/contracts/index.ts` and lists `branches/ProposedTree` as scaffolding, neither of
which describes the candidate any more.

Nothing has been re-sealed. Re-sealing requires the record to be rewritten for 1.6 and a fresh
approval, because an approval of 1.5 cannot cover code that changed after it was given.

## The previously approved revision, for the record

Approval kind `confirmed-restated`: revision 1.5 was named back first, and the user answered
"duyệt". The restatement and the user's own word are stored in separate fields, because a bare
confirmation approves a specific thing only if that thing was stated first.

Seal: `manifestSha256 = c3e6f8f8df9c5e414ab2ad8be4c102c2fcb5edced555ab22788a8ca3cd1d3014`, verified
a second time without `--seal` so the record holds its own shape rather than only the shape it was
written with. Any change to a candidate file, fixture, screenshot or the record's own semantics
breaks this and requires a new revision plus a new approval.

Revision 1.1 was approved. Revisions 1.2 and 1.3 were made after that approval because looking at
the rendered pixels found two more defects, so **the approval no longer covers the current
revision** and must be given again.

## Revision history

| Revision | Change | Reason |
| --- | --- | --- |
| 1.0 | First executable candidate | Selected direction built against the locked target |
| 1.1 | Owned-course progress: `ratio` (`0..1`) became `percent` (`0..100`), plus a visible completion caption | The bar drew 0.46% instead of 46% and the figure appeared nowhere on screen |
| 1.2 | Theme driven through `next-themes` instead of a hand-toggled wrapper class | Light mode rendered white cards on a dark page with unreadable section headings |
| 1.3 | `catalog-search-count-view-row` gained `flex-wrap`; `catalog-card-heading-row` lets the course name shrink | At 390px the toolbar pushed the page wider than the viewport and the enrolment count was clipped by the card's own rounded overflow |
| 1.4 | The view toggle passes `variant: "primary"` | User review: the toggle drew a filter underline. `ChoiceTabs` defaults to `"secondary"`, and revision 1.3 took that default by omission. Legacy passes `variant="primary"` for this control because it switches the whole panel rather than filtering the list under it |

| 1.5 | Leading glyphs on the view toggle, and one-line tab labels | User feedback: these controls should carry a leading icon. Two new icon meanings and one optional `ChoiceTabs` slot were proposed rather than applied, since Preview writes no production source |

## Revision 1.5 — the parity gap closed, as proposals

The gap below was real: legacy uses icon labels, this candidate used words. It is now closed in the
candidate and written out as three rule changes in `proposed-canon-changes.md`, none of which have
been landed — two new icon meanings (`viewGrid`, `viewList`), one optional `icon` slot on
`ChoiceTabs`, and `whitespace-nowrap` on the tab.

The wrap turned out not to be a layout fault at all: the vendor gives every segment of a `primary`
tab group an equal fixed width of 99px with wrapping left on, so "Danh sách" broke onto two lines
while the row around it still had roughly a thousand pixels spare. After the change the tabs size to
content — 80px and 118px, both one line, no page overflow.

## The original gap, for the record

The legacy view toggle is `TabsCard variant="primary"` whose tab labels are **icons** —
`SquaresFourIcon` and `ListIcon` — with the words living only in `aria-label`. Revision 1.4 matches
the variant but still renders the words "Lưới" and "Danh sách" as visible text, which is why "Danh
sách" wraps onto two lines in a narrow control.

This is not something Preview should quietly change, because the target forbids it on purpose:
`ChoiceTabs` documents itself as "Text-only peer choices. Business categories do not gain decorative
glyphs." Reaching legacy parity therefore needs one of

1. an optional per-tab `icon` on `ChoiceTabs`, which is a change to that stated policy;
2. a separate icon-capable toggle leaf; or
3. keeping the text labels and accepting the divergence.

A related consequence: the wrap could also be stopped by giving the row's last child `shrink-0`, but
plain `[&>*:last-child]:shrink-0` is not a member of the closed `LayoutClassName` union — only the
`md:` variant is. Adding it is a vocabulary proposal, not a Preview edit.

- Preview lab: `http://127.0.0.1:8086/preview-lab/index.html`
- Candidate directly: `http://127.0.0.1:8086/candidate/out/index.html`
- Server pid `47892`, artifact root `D:\Repositories\starci-academy-fe\.artifacts\design-plan\courses-catalog-page`

## What the candidate is

A real Next 16.1.6 / React 19.2.3 application, statically exported, that imports the locked target's
own leaves, contracts and design tokens across the repository boundary. It is not an HTML facsimile:
the review lab embeds this build through `candidateUrl` and refuses to render it unless the runtime
proof matches.

| Integrity (revision 1.1) | Value |
| --- | --- |
| `candidateDigest` | `f069ade46dc51f19f859ff5e74cce40614add9bfad9050c0dc7a84ce4bcdc3e5` |
| `fixtureSha256` | `f7b8f6feef986e83cae91819622f1f0f31cffb7d180f4f84820698bf68b6dca1` |
| `buildLogSha256` | `930d978b25533d6a0b002cfe387a919a05bf6981e91d5fee762ddf087848ff6c` |
| `runtimeFingerprint` | `232f340768eb73fda7821a99a3142faa` |
| Candidate source files | 18 |

`candidate.build`: `npx next build`, exit code `0`, log at `candidate/build.log`.

## Verified in the browser

| Scenario | Observed |
| --- | --- |
| `populated` | Two titled groups, three catalog cards, two owned cards, pager present |
| `pending` | Three resting cards, three shimmering covers, **no** disclosure and **no** pager |
| `no-owned-courses` | One section group remains, titled Khám phá; the owned group collapses entirely |
| `no-discount` | `price-discount-line` renders one child, no badge, no savings line |
| `filtered-empty` | Filtered copy plus "Xóa bộ lọc"; the toolbar survives so the filter can be cleared |
| `failed` | `empty-notice-stack` with "Thử lại"; zero cards, zero pager |
| disclosure | Native `details`: closed by default, opens on press, three promise lines |
| covers | Five fallback surfaces, zero `img` tags — the fixture's covers are null by design |

React hydration is proven: pressing a scenario control changes `[data-candidate-root]` and the
rendered tree.

## The defect that only the render showed — revision 1.1

Every check up to this point was green and the owned-course progress bar was still wrong.

`Progress` takes `value` on a **0..100** scale and clamps nothing on purpose. Revision 1.0 passed a
`0..1` ratio, so a course at 46 percent drew a bar `0.46%` wide and announced
`aria-valuetext="0%"`. Nothing threw, nothing failed to compile, and the bar was a sliver that read
as "barely started" rather than as broken.

Two things came out of it:

1. The block's field is now `percent`, not `ratio`.
2. A visible completion caption was added. `Progress.label` is documented as an assistive name that
   is **never drawn**, so revision 1.0 had the figure nowhere on screen at all — the approved scene
   showed "46% hoàn thành" and the candidate showed no number. The bar now carries a distinct
   assistive name so a screen reader is not read the same sentence twice.

Confirmed after the fix: fill width `46%`, `aria-valuenow="46"`, `aria-valuetext="46%"`, visible
caption present.

## Two failures found and fixed while building

1. **`createContext is not a function`.** The providers were mounted directly in the server layout.
   The build compiled and then died collecting page data. Fixed by adding the `"use client"`
   boundary the target itself uses — the error is the reason that file exists.
2. **Silent unstyled render.** The first static export emitted absolute `/_next/...` asset URLs
   while the lab serves the candidate under `/candidate/out`. Every stylesheet and chunk returned
   404, and the page still rendered its server HTML — a green build showing unstyled text. Fixed
   with `basePath`/`assetPrefix`, then confirmed by re-reading the network log: all assets 200.

A third trap was pre-empted rather than hit: `.artifacts/` is gitignored, so Tailwind v4 would have
skipped the candidate's own sources. The `@source` directives in `candidate/app/globals.css` are
why `lg:grid-cols-3`, `aspect-video` and `object-cover` appear in the built CSS at all.

## Two corrections to the plan record, made deliberately

1. `value-proposition-disclosure` moved from **contract** to **leaf**. A contract entry draws one
   `div` with classes and cannot produce a `details`/`summary` pair, and no accordion branch exists
   in the target to project into. The product decision is unchanged; only the owning tier moved.
2. The proposed **savings slot** on `price-discount-line` is **withdrawn**. Rendering the savings
   sentence as the next sibling line is visually identical and changes no shipped contract, so it
   removes a migration for that contract's existing caller.

## The lab iframe is blocked in the in-app browser

The preview chrome fetches each state's proof, matches it, and creates the frame — the proof request
returns 200 and the manifest comparison passes. The frame's own document then fails with
`net::ERR_BLOCKED_BY_CLIENT`, so the canvas is blank inside this particular browser pane.

This is the review chrome's embedding being refused here, not a defect in the candidate: the same
build renders completely at its direct URL, which is where every observation in this file was made.
**Review the candidate directly**, or open the lab in an ordinary browser where the frame is not
blocked.

This was caught only because a screenshot was finally possible. Every text-level probe up to that
point reported the lab as healthy, because they were reading the candidate's own page rather than
the frame.

## Screenshots

Eight PNGs in `screenshots/`, all captured from the revision 1.3 build by headless Chrome at
1280 wide: `populated`, `pending`, `no-owned-courses`, `no-discount`, `filtered-empty`, `empty`,
`failed`, `populated-light`.

Each state has its own URL — `?state=<id>` and `?theme=light` — added in revision 1.2 so a headless
browser can reach a state it cannot click to, and so the sealed record can name a real `route` per
state.

## The mobile screenshot was deleted on purpose

Headless Chrome here lays the page out at a desktop width and then CROPS the image to the requested
window size. The proof is that the 390-wide capture was **byte-identical before and after** the
revision 1.3 responsive fix — 49951 bytes both times. It was never a mobile render; it was a narrow
slice of a wide one, and sealing it would have been sealing a picture that shows the opposite of
what it claims.

Mobile is therefore verified by live measurement only, in the browser at a real 390px viewport:

- `documentElement.scrollWidth` equals `clientWidth` equals `390`, with no element extending past
  the right edge;
- the enrolment count renders in full, ending at x=322 of 390, where before the fix it was clipped.

That is behavioural evidence, not visual evidence. **Mobile is not in the sealed state list** rather
than sealed on a misleading image.

## Still not verified

- **Keyboard focus** was not exercised.
- **The lab iframe** remains blocked in this browser pane, so the candidate must be reviewed at its
  direct URL here.

## Known gaps in revision 1.0

- **No connected file.** The page is driven by a fixture, not by `useQueryCoursesSwr`. The target's
  courses document still selects neither `valuePropositions` nor price-phase data, and its hook
  exposes no `search` parameter.
- **`pageNumber` base is still unresolved.** The backend documents 1-based; the legacy hook passes
  0-based. The leaf speaks 1-based and the connected file must convert once, after a live query
  settles which is correct.
- **No cart action.** The target has no cart data layer, so the discover card's primary action is
  "Xem khóa học" alone.
