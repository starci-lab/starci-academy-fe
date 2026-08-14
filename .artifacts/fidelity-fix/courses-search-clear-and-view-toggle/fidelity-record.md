# Fidelity record — courses toolbar

Two defects on `/[lang]/courses`, both fixed. Frozen identity in
[`context-lock.fidelity.md`](./context-lock.fidelity.md).

---

## 1. The clear "×" belonged to the browser

**Measured before.** Nothing in the repository drew that glyph. `type="search"`
(`SearchBox/index.tsx:71`) summons `::-webkit-search-cancel-button`, which Chromium paints from a
fixed mask. Ruled out: HeroUI `isClearable` (zero matches repo-wide; `InputGroup.Input` is a bare
react-aria `Input` rendering no children), the `Icon` leaf (`close` existed and was unused), and any
stylesheet — `globals.css` had no `::-webkit-` selector, and Tailwind's preflight resets only the
sibling `::-webkit-search-decoration`.

So the colour was never attributable to a repo token. **That was the defect**: a control the design
system could not reach — no token, outside the `Icon` leaf every other glyph comes from, and absent
entirely in Firefox.

**Correction.**

- `globals.css` — `input[type="search"]::-webkit-search-cancel-button { appearance: none }` inside
  `@layer base`.
- `SearchBox` draws the replacement in `InputGroup.Suffix`, the slot that already existed for the
  keyboard hint and stood empty on this page. First built with the `IconButton` leaf; the user
  refused the filled pill, so it is a bare glyph carrying its affordance by weight
  (`opacity-60 → hover/focus 100`).
- The field stays uncontrolled. Only a boolean `hasText` is tracked — not the query — so nothing
  above re-renders per keystroke; it flips twice per search.
- Clearing calls `search("")`, because a box emptied over a filtered list would otherwise leave the
  reader looking at results for a query no longer on screen.
- New label `searchClearLabel` in both locales; `ProfileSkillsPage`, the only other caller, updated.

**Measured after** (live DOM, `/vi/courses`):

| Check | Result |
|---|---|
| Control tag / child | `BUTTON` / `svg` (Heroicon via `Icon`) |
| Background | `rgba(0,0,0,0)` — no ground |
| Border radius | `0px` — no pill |
| Opacity | `0.6` |
| Accessible name | `Xoá từ khoá` |
| Absent when empty | yes — appears on first character, gone after clearing |
| Clearing empties the field | `input.value === ""` |

---

## 2. The view toggle wrote a value nobody read

**Measured before.** `view` round-tripped `index.tsx:58 → index.tsx:207 → component.tsx:186` and
terminated at the control that produced it. Repo-wide grep for `=== "line"` returned exactly one
hit: the handler itself. `catalog-card-grid` was hard-coded to
`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` and `CourseCatalogCard` took no layout prop. Pressing
"Danh sách" moved the pill and re-rendered the identical grid.

**Correction, ported from the named legacy render.**

Inventory before invention — no existing entry expressed "one purchasable course read across", so
three entries were added and one slot widened:

| Entry | Verdict | Why |
|---|---|---|
| `catalog-card-list` | NEW | one reading column of course rows |
| `catalog-card-line` | NEW | the row card — it does not hold the same things as the grid card |
| `catalog-card-line-body` | NEW | name over price at the tightest seam, no third part |
| `catalog-section-group.grid` | EXTEND | slot now admits either container |
| `catalog-card-action-row` | REUSE | both arrangements offer the same pair of ways in |
| `catalog-card-heading-row`, `catalog-price-group` | REUSE | unchanged in the row |

`LayoutClassName` widened by two tokens: `[&>*:first-child]:w-36`, `[&>*:last-child]:shrink-0`.

The row **drops the promises list** — that is why it is a second entry rather than the same card at
a different width. At one course per row the joined list would set every row's height by the
wordiest course in the catalog.

Persistence ported too: `starci.courses.view` in `localStorage`, hydrated in an effect after mount
rather than during the first render, because the server has no storage and a mismatched first tree
is discarded.

**Measured after** (live DOM, same identity):

| State | Container | Rows/cards | Card height | Promise lists in rows |
|---|---|---|---|---|
| Grid (default) | `grid … lg:grid-cols-3` present | 5 | 768–792 px | n/a |
| List | grid absent, `flex flex-col gap-3` with 5 children | 5 | **113 px** | **0** |
| Row internals | `flex-direction: row`, cover `144px` (= `w-36`) | — | — | — |
| Toggle back | grid restored, zero line rows remain | — | — | — |
| `localStorage` | `"line"` then `"grid"` | — | — | — |

---

## Command ledger

| Command | Result |
|---|---|
| `audit-fe-lint-adoption.mjs --probe SearchBox/index.tsx` | `ok: true`, no missing, inline config refused |
| `audit-fe-lint-adoption.mjs --probe CoursesCatalogPage/component.tsx` (after) | `ok: true` |
| `tsc --noEmit` | exit 0 |
| `eslint src` | exit 0 |
| `next build --webpack` | exit 0, all 18 routes compiled |

Two lint errors were raised and fixed rather than suppressed: a Vietnamese UI label quoted inside an
English comment (`no-second-language-in-source`), and a missing `key` when the card array was built
as raw elements — resolved by keeping the projection-factory shape rather than by adding keys.

## Untouched, and known

- This page still has **no co-located tests**; `CoursesCatalogPage`, `SearchBox` and `ChoiceTabs`
  were uncovered before this fix and remain so. The evidence above is live-DOM measurement, not a
  regression test.
- The row layout is not yet responsive the way legacy is: legacy hides the thumbnail below
  `@app-sm`, this row keeps it at every width. No `@app-sm:` token exists in `LayoutClassName`, and
  adding one was outside the measured defect.
