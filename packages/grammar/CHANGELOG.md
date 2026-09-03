# Changelog

## 0.4.5

Additive. Two numbers that consumers were restating, and one edge they were painting themselves,
move into the package.

### The sticky band publishes where it stops

- `NavigationFeatureNav` and `Subnav` now publish `--starci-core-band-offset` on the Grammar root
  when they are sticky, and a page pins to it with `top: var(--starci-core-band-offset)` and bounds
  itself with `max-height: calc(100dvh - var(--starci-core-band-offset))`. It is the sum of two
  parts, each published on its own: `--starci-core-band-height` is the navigation band -
  `calc(4rem + 1px)`, and `calc(4rem + 2rem + 1px)` once a feature layer is stacked on it - and
  `--starci-core-band-subnav-height` is a stacked sticky `Subnav`, `calc(3.25rem + 1px)`, which
  drops to `0rem` above 70rem where a compact one is not on screen.
- It is CSS ONLY. Presence and stacking are already spelled by the data attributes these
  compositions emit, so the sheet selects them with `:has()` on `.grammar-common-root` rather than
  measuring anything in JS; no hook, no new data attribute, and no rule reaching `:root`, which
  would put the package outside its own boundary.
- Nothing is defined when no sticky band is present, so `var(--starci-core-band-offset, X)` still
  resolves to a page's own `X` exactly as before this property existed.
- `Rail` in `mode="sticky"` consumes it: `--starci-core-rail-offset` is still the override a host
  sets, and unset it now reads the published band before falling back to the 5.5rem it always used.
  A `WorkspaceShell` rail region gets this through the `Rail` it hosts. `Subnav`'s own sticky `top`
  reads `--starci-core-band-height` the same way, so a subnav stacked under a two-layer band no
  longer needs `--starci-core-subnav-offset` set by hand.
- `STARCI_CORE_BAND_TOKEN_NAMES` publishes all five property names from `@starci/grammar/core`.
  They are deliberately NOT in `STARCI_CORE_TOKEN_NAMES`: a theme token has one default the family
  always defines, while each of these is derived from what is on the page or supplied by a host.

### A verdict collection paints its verdict

- `SurfaceListCard` with `isVerdict` already squared its collection's corners for these rows; it now
  ships the edge those corners were preparing for - 2px on the row's leading side, in `--success` or
  `--danger` - selected by `data-verdict` on the row.
- The row is where the value has to live, because the rows of this collection are the CALLER'S
  children and no prop of the card can reach them. `data-verdict="success" | "danger"` is therefore
  published as the card's slot contract: `StaticStateRow` gained a `verdict` prop that emits it, and
  an application-owned row spells the attribute and gets the identical shipped edge. The union is
  exported as `RowVerdict` and re-exported as `SurfaceListRowVerdict`.
- The edge is an INSET SHADOW, read from `--starci-core-verdict-edge`. A border would move a
  caller's row content by two pixels and a padding would fight the inset the row already owns; a
  shadow paints inside the box that is already there. The hover-invariant reset that clears row
  shadows reads the same property, so a verdict does not vanish under the pointer.
- It is drawn but NOT claimed. `data-contract` ids address the boundary catalog, whose six rows are
  seams, an outline and elevation; a one-sided semantic accent is none of them, so inventing an id
  would make the claim checker agree with a promise the catalog never made. The specs assert the
  shipped rule and the rendered attribute directly instead.
- `verdict` is not `state`. A `PresentationState` says how the row itself is doing; a verdict is the
  direction of what the row REPORTS, and it is drawn as the collection's edge rather than as the
  row's treatment.

### Intentional visual deltas

- `Subnav`'s toggle keeps its 2.75rem target with `!important`, and takes no new prop. The size was
  already in the sheet, but it lost to the vendor button's own sizing declared in a later layer -
  the same reason the four declarations beside it are important - so a consumer was re-forcing
  `size-11` from outside the package to get a 44px target back. A spec now asserts the rendered
  control carries the class the rule selects.
- A sticky `Rail` under a Grammar band moves from 5.5rem to the band's real bottom. That is the
  point of the offset, and the number was only ever right for a one-layer band plus a gap.

## 0.4.4

- The utility debt is PAID. Every object 0.4.3 recorded as still spelling its layout in Tailwind
  utilities - `MarkdownArticle`, `Rail`, `Subnav`, `SurfaceCard`, `SurfaceListCard`,
  `SurfaceAccordionCard`, the shared Core class names, `EmptyNotice`, `ChatWorkspace`,
  `NavigationFeatureNav`, `Divider`, `IconButton`, `IconTile`, `Icon`, `Input`, `Progress`, `Text`,
  `TextAction` and the shared action recipe - now owns its box in `src/common/styles.css`, selected
  by the data attributes each component already emits. `Label` joined them, because its type scale
  had the same problem. The recorded debt list is empty, and the package check that kept it honest
  now proves it stays empty.
- Corners come from the theme radius ramp (`--radius-lg` / `--radius-xl` / `--field-radius`),
  never from a HeroUI v2 radius name. `rounded-large`, `rounded-field` and friends emitted nothing
  anywhere, which is why several objects arrived square.
- `!important` is used only where a Grammar class lands on a HeroUI part - `Card`, `Accordion`,
  `Button`, `TextField`, `Input`, `Skeleton`, `ProgressBar` - whose own rules live in the vendor's
  `components` layer, declared after `starci-grammar-common` and therefore winning every normal
  declaration regardless of specificity. That is the same reason 0.4.3 documented for `Sidebar`.
- Added a shared claims-versus-CSS checker (`src/__test__/styleClaims.ts`, excluded from `dist`) and
  a spec that renders every converted object and fails if any `data-contract` id it emits is not
  backed by a declaration on a Grammar class that element actually carries.

### Intentional visual deltas

Each of these is a utility that emitted nothing, or a shipped rule a utility was overriding.

- `MarkdownArticle`, `FencedCodeBlock` and `MarkdownTableFrame` now carry their own Grammar classes.
  They never did: the components spelled `min-w-0 w-full` and the whole
  `.starci-core-markdown-article` block in the sheet - reading rhythm, heading scale, list, code,
  blockquote, table and rule treatment - was unreachable. Authored Markdown gains that rhythm.
- `Icon` and `IconTile` sizing is shipped. An app-owned SVG has no intrinsic box, so a glyph in a
  consumer that did not scan this package rendered at the SVG default size; it is now 1rem / 1.25rem
  / 1.5rem by `data-usage`, and the plate 2rem / 2.5rem by `data-size`.
- `Input`'s password field reserves 2.75rem of inline-end padding for its reveal toggle. The old
  `pr-9` is a utility no application in this repository writes, so it was generated nowhere and the
  toggle sat on top of the value at every width.
- The `Input` resting control takes the field corner from `--field-radius`; `rounded-field` is not a
  Tailwind v4 name and emitted nothing.
- `StaticStateRow` now draws the 0.75rem row gap and 1rem inset the sheet always specified, instead
  of the `gap-2 py-2` that overrode it. This makes its own `GAP-3 PADDING-4` claim true.
- `SurfaceAccordionCard`'s trigger draws the 1rem inset the sheet specifies rather than the
  `px-4 py-3` that overrode it, which makes its `PADDING-4` claim true. Its body's inset is
  unchanged but now claims the rows it actually paints; the old `PADDING-8` named a row the padding
  scale does not have. The body's inset also moved onto a Grammar-owned element inside the vendor
  `Accordion.Body`, because the vendor puts a `className` on an inner node and every other prop on
  the outer one, which would split the rule from the claim promising it.
- `SurfaceCard`'s composition inset claim (`PADDING-4`, or `GAP-0 PADDING-0` when joined) moved from
  the surface shell to the content region, which is the element whose shipped rule draws it.
- The compact `ChatWorkspace` rail trigger's corner is the published control radius (0.75rem)
  rather than `rounded-lg` (0.5rem), and its hover fill and shadow are now shipped.
- `Rail`'s body carries `flex: 1 1 0%` unconditionally, matching the `flex-1` it used to spell.

### Capabilities

- `Button` takes `width?: "content" | "fill"`. `fill` forwards the vendor's own full-width variant
  and adds what the vendor does not own: a label that WRAPS onto a second line instead of
  overflowing, with the control height released to follow it. Two products were reaching through the
  Grammar boundary with a descendant width utility to get this.
- `Text` takes `overflow?: "wrap" | "truncate" | "clamp-2"`, shipped by `data-overflow`. Three
  dashboard blocks were reaching in with descendant selectors on `[data-size]` to force wrapping or
  truncation.
- `NavigationFeatureNav` makes `navigation` optional through the same `WithNavigation |
  WithoutNavigation` union `WorkspaceShell` uses. With no destinations it renders NO `nav` element -
  an empty navigation landmark is announced and reached and names nothing - and the primary grid
  drops the track instead of keeping it empty.
- `PrimaryRailLayout` takes `collapsedOrder?: "primary-first" | "rail-first"`. Once the container
  collapses to one column, `rail-first` lifts the rail above the primary content, for a filter or
  summary a reader needs before the content itself.

## 0.4.3

- `Sidebar` now owns its geometry in the packaged stylesheet. Every Tailwind utility it used to
  spell in JSX (rail and drawer widths, the right separator, list/section/item/header/footer
  rhythm, item shape and states) moved to `.starci-core-sidebar*` in `src/common/styles.css`,
  driven by `data-presentation`, `data-collapsed` and the React Aria item states. A consumer no
  longer has to scan `node_modules/@starci/grammar` with Tailwind to get a sidebar, and the item
  corner comes from the theme radius ramp instead of `rounded-large`, which emitted no CSS.
- Added `PressableField`: a field-shaped press target with input anatomy - optional leading icon,
  placeholder-style copy, optional `kbd` shortcut hint - painted from the same `--field-*` tokens
  `Input` reads. It replaces the two app-local `PressableInputLike` clones that pushed field
  geometry into a Grammar `Button` through `className`. It is not a `Button` variant.
- Added a package check that no shipped component spells layout or geometry in Tailwind utilities,
  with the remaining offenders recorded as a list that may only shrink.
