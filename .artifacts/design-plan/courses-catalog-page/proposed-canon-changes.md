# Proposed rule changes — courses catalog page

Preview may not write production source or the trust tree, so these are written out exactly rather
than applied. Each names the file it belongs in. Nothing here has been landed.

## 1. Two new icon meanings

The icon map's selection procedure says a feature either reuses an existing meaning deliberately or
receives a unique row, and forbids picking a glyph because it resembles the nearest existing one.
Nothing in the table means "lay this collection out as a grid" or "as rows" — `course` and `explore`
name what is shown, not how it is arranged. So these are two new rows rather than a reuse.

They are reference-backed, which the same procedure requires for inline glyphs: the legacy catalog's
view toggle is icon-only, using Phosphor's `SquaresFourIcon` and `ListIcon` with the words in
`aria-label`. Phosphor is not admissible here — the lint rule allows only
`@heroicons/react/24/outline` and `@heroicons/react/16/solid` — so these are the Heroicons
equivalents. Neither glyph is already spoken for by another meaning, which the parity test requires.

**Add to the feature table in BOTH copies** — `src/components/leaves/Icon/icon.md` and its mirror
`.claude/fe/canon/patterns/icon.md`, which that file requires to change together:

```
| `viewGrid` | Lay a collection out as a card grid | `Squares2X2Icon` | Four equal panes name an arrangement rather than the content being arranged |
| `viewList` | Lay a collection out as compact rows | `ListBulletIcon` | A bulleted run of lines names row layout without borrowing the review clipboard |
```

**Add to `src/components/leaves/Icon/index.tsx`** — two members of `IconName` and two rows of
`GLYPHS`, in the leaf's existing outline/solid shape:

```ts
viewGrid: cuts(Squares2X2Icon, Squares2X2SolidIcon),
viewList: cuts(ListBulletIcon, ListBulletSolidIcon),
```

Candidate source: `candidate/src/components/leaves/Icon/proposed-additions.tsx`.

## 2. `ChoiceTabs` gains one optional leading glyph per tab

Target: `src/components/leaves/ChoiceTabs/index.tsx`.
Candidate source: `candidate/src/components/leaves/ChoiceTabs/index.tsx`.

The leaf currently states: *"Text-only peer choices. Business categories do not gain decorative
glyphs."* That sentence stays true and keeps its force. A business category — a course level, a
submission status — still gets no glyph, because there the glyph would decorate a word that already
says the thing.

A layout toggle is not a business category. "Grid" and "list" name a SHAPE, and the glyph draws that
shape, so the icon is the more direct label rather than an ornament beside one. This is why the
legacy control is icon-only.

Exact delta:

```ts
tabs[].icon?: IconName   // absent by default; text-only behaviour is unchanged
```

- **Precedence**: the glyph leads and the label always still renders, so the control is never
  glyph-only and never loses its accessible name.
- **Callers**: every existing caller omits `icon` and is unaffected.
- **Tests**: a tab without `icon` renders no glyph; the glyph precedes the label; the accessible
  name still comes from `label`.

Suggested wording for the leaf's own doc comment, replacing the single sentence above:

> Text-only peer choices, except where a glyph names the SHAPE being chosen rather than decorating a
> word. Business categories still gain no glyph.

## 3. `whitespace-nowrap` on the tab, in the same leaf

The vendor gives every segment of a `primary` tab group an equal fixed width and leaves wrapping on,
so a two-word label breaks onto a second line inside its own pill while the row around it still has
hundreds of pixels spare. "Danh sách" wrapped at 1280px wide. A label is one line, and the leaf owns
that recipe rather than its callers.

Measured after the change: tabs size to content at 80px and 118px, both 32px tall, no horizontal
page overflow.

## 4. Canon gains a bounded rank-artwork allowance

Target: `.claude/sources/fe/icon.mjs`. **Proposal only — canon has not been edited.**

### Why this is needed

Running the complete canon rule set over `starci-academy-fe` produces ten errors. Two of them are
not debt: `src/components/leaves/RankMark/index.tsx` imports `@iconify/react`, and that import is an
approved product decision from the earlier leaderboard work — ranks 1–3 draw Fluent Emoji Flat place
medals, rank 4+ a trophy, requested explicitly and bound in tests.

Canon currently has no way to express that, so adoption would force the exception to be withdrawn
silently. It should not be: the decision was made deliberately and the artwork is a closed set.

### Why an allowance fits canon rather than bending it

Canon already carves out bounded exemptions of exactly this shape, twice:

- `ICON_MODULE_RELATIVE` — one module may name glyphs from a library;
- `LABELLED_PROGRESS_ROW_RELATIVE` — one component is exempt from a glyph rule because its reference
  is text-led.

And it already admits Fluent Emoji Flat as artwork rather than a glyph vocabulary, for reactions:
*"Product reactions use the attributed Fluent Emoji Flat SVG subset checked into `public/reactions/`."*

Rank artwork is the same category of thing — attributed artwork naming a placement, not a glyph
naming a product meaning. The proposal extends the existing pattern instead of loosening the vendor
boundary for everyone.

The target's own local plugin already implements exactly this, under
`RANK_MARK_MODULE = "/src/components/leaves/RankMark/index.tsx"`. So this is not a new idea to
evaluate from scratch; it is canon catching up with an allowance the consuming repository has been
enforcing since the leaderboard work landed.

### Exact delta

```js
/** Rank artwork is attributed placement art, not a glyph vocabulary. One module owns it. */
const RANK_MARK_RELATIVE = "src/components/leaves/RankMark/index.tsx"

/** The closed set of rank artwork identities. Ranks 1-3 are places; every rank below is a trophy. */
export const RANK_ARTWORK_IDS = new Set([
  "fluent-emoji-flat:1st-place-medal",
  "fluent-emoji-flat:2nd-place-medal",
  "fluent-emoji-flat:3rd-place-medal",
  "fluent-emoji-flat:trophy",
])

/** True for the one leaf that owns rank artwork. */
const isRankMarkFile = (filename) => normalizePath(filename).endsWith(`/${RANK_MARK_RELATIVE}`)
```

Then `noVendorIconOutsideIconLeaf` and `heroiconsIsTheGlyphVendor` skip a file when
`isRankMarkFile(filename)` is true **and** the import source is exactly `@iconify/react`. Every other
file, and every other source in that file, keeps failing as before.

Add `"@iconify/"` to `GLYPH_PACKAGES` in the same edit. It is currently caught only by the loose
`GLYPH_PACKAGE_NAME` regex, which matches on the substring "icon" — an exact prefix is what every
other glyph package gets, and relying on the fallback is how a package slips through later.

### What this deliberately does NOT do

It does not admit `@iconify/react` generally, does not widen the two Heroicon families, and does not
let a caller choose a rank glyph — `RankMark` keeps the closed map and callers keep passing a rank.
A second module wanting Iconify would still fail.

### Bound to a test

The allowance is worth nothing without one: assert that `@iconify/react` inside `RankMark` passes,
that the same import in any other file still fails, and that an Iconify id outside `RANK_ARTWORK_IDS`
inside `RankMark` still fails.

## 5. Not proposed, but recorded

`[&>*:last-child]:shrink-0` is not a member of the closed `LayoutClassName` union — only the `md:`
variant is. It would have been another way to stop the wrap. It is deliberately NOT proposed here,
because fixing a vendor label recipe by widening the layout-class vocabulary treats the union as the
place to absorb someone else's problem.
