# Design record — cart · revision 1.0

`case-cart-system` · `direction-legacy-full-default` · **awaiting approval, not sealed**

Candidate: `.artifacts/design-plan/cart/candidate` · lab `http://127.0.0.1:8087/`
Gates: `tsc` 0 · `eslint` 0 · `next build --webpack` 0 (logs in `logs/`)

---

## 1. Relationship sheet

What a screenshot cannot be argued with. Each line can be refused in a line.

### Seams — what level of grouping each separates

| Node | Seam | Separates |
|---|---|---|
| `cart-page-column` | `gap-6` | Page regions: the header, the basket, the reckoning, the press. Four different kinds of thing. |
| `cart-line-list` | `divide-y` + `[&>*]:py-3` | Peers of one list. A rule, not a gap — the courses are comparable and already chosen, so they share one surface instead of each getting an edge. |
| `cart-line-row` | `gap-3` | Parts of one offer: artwork, identity, price, the way out. |
| `evidence-title-over-subtitle` | `gap-1` | A name and the line that qualifies it — the tightest seam, because the tier is not a peer fact. |
| `order-summary-stack` | `gap-2` between components, **rule + `pt-3` + `mt-1` above the total** | Components of a total from the total itself. The last line is a different KIND, not the last of a series. |
| `checkout-panel-column` | `gap-4` | Steps of one decision: how to pay, what it costs, when it falls due, what you agree to, who takes it, the press. |
| `ordered-step-ladder` | `gap-2` | Cycles of one schedule — closer than page regions because they are one statement read down. |
| `cart-drawer-column` | `gap-4` + own `p-4` | The same regions at a narrower measure; the inset is the interior's because the shell passes it through unarranged. |

### Rank — every text node

| Text | Rank | Why |
|---|---|---|
| Page title `Giỏ hàng` | `heading` level 1 | The document's one name. |
| Course title | `sm` semibold | The thing being identified; loudest inside its row but subordinate to the page. |
| Tier (`Cốt lõi`) | `xs` muted | Qualifies the title, never read on its own. |
| Charged price | `sm` semibold | What is owed for this line. |
| Original price | `xs` muted + struck | Superseded. Two live numbers on one line makes the reader work out which they owe. |
| Discount badge | `badge` success | A fact about the price, not a price. |
| Subtotal / savings / surcharge labels | `sm` semibold | Names of components. |
| Subtotal / savings / surcharge figures | `xs` muted | Components of a total rank below it. |
| Total label | `sm` semibold | Peer of the other labels. |
| **Total amount** | **`md` semibold** | The loudest thing on the surface — the figure actually being asked for. |
| Instalment hint | `sm` muted | An aside about a route not taken. |
| Cycle name | `sm` | One step, read as a sentence. |
| Cycle amount | `xs` | Subordinate to the total above; the schedule explains the total rather than restating it. |
| Terms warning | `xs` muted | Obligation, stated where the choice is made. |
| Gateways | `xs` muted | Provenance, not a choice on this surface. |

### Controls — variant and reason

| Control | Variant | Reason |
|---|---|---|
| `Thanh toán (3)` | `primary` | The one thing the page exists for. |
| `Xoá hết` | `secondary` | Destructive and whole-basket; it must be reachable and must not compete. |
| Line removal | `IconButton`, glyph only, trailing | The only destructive thing on the row. Its name repeated down a list would give the loudest reading to the action nobody came for; trailing edge is furthest from the artwork being scanned, so the press that undoes a purchase is hardest to hit by accident. |
| `Trả một lần / Trả góp 3 kỳ` | `ChoiceTabs` `primary` (segmented pill) | These switch the WHOLE panel rather than filtering a list under them — the same reason the catalogue and the league page pass `primary`. |
| Drawer `Thanh toán` | `primary` | Same act as the page's. |
| Drawer `Xem giỏ đầy đủ` | `secondary` | A way through, not a competing act. |
| Empty-state action | `EmptyNotice` action | The composite already owns "an empty region offers a way out". |
| Cycle mark | `StatusDot` on the due cycle only, resting line elsewhere | Its tones are all affirmative and it requires an accessible name; there is no honest dot for a cycle that is not due. The slot stays occupied so the names stay aligned. |

---

## 2. Open questions

Product decisions this candidate had to settle that no rule decides. Approval names them or waives
them; a decision found after implementation was never the reader's to make.

| # | Question | Default taken | What it costs |
|---|---|---|---|
| 1 | Is line removal words or a glyph? | Glyph (`IconButton`, accessible name `Bỏ khỏi giỏ`) | A glyph is one guess wider than a word. Three of them down a list is quieter; one on a single-line basket may be too quiet. |
| 2 | Does the cart page show a running total while the pricing request is still in flight? | No — the figures rest, the rows stay real | The reader sees prices per line and no total for a moment. The alternative, summing the lines client-side, is the exact failure the plan record names in the legacy drawer. |
| 3 | Does the instalment hint appear when pricing failed? | No | The reader loses the knowledge that instalments exist in a state where they might still want them. Shown, the page would quote a first payment its own summary cannot display. |
| 4 | Does removing one line disable the others? | No — only the row in flight | Two rapid removals are possible. Freezing the list would report a whole-basket operation for a single-row one. |
| 5 | Does the drawer carry its own heading? | No — the shell's header names it | If the drawer is ever mounted without `DrawerShell` it loses its name entirely. |
| 6 | What does `Xoá hết` do — confirm, or empty immediately? | **Answered by the reference, not chosen.** Inline two-step confirm: first press arms a label saying what a second press will do, the window closes itself after 3s. No modal. | The armed window can expire between the reader deciding and pressing. The legacy source carries this exact mechanic with the comment *"canon: destructive action needs confirmation"* — so this was read, not invented. The drawer does NOT get the control at all: the quick look should not hold the most destructive act. |
| 7 | Are the cycle shares printed at all? | Yes — `50%`, `27,5%` beside each cycle | It exposes an uneven schedule the reader did not ask about. Hiding it would make the first payment look arbitrary. |

---

## 3. Consolidation verdicts

Every new owner against its nearest existing kin.

| New owner | Nearest kin | Verdict | Distinguishing fact |
|---|---|---|---|
| `DrawerShell` | `ModalShell`, `DropdownShell` | **keep-apart** | Different vendor primitive: HeroUI ships `Drawer` with its own `placement`, header, handle and edge transitions; `ModalShell` wraps `Modal` and hardcodes `placement="center"`. Canon SLOTS-4 already names all three separately. |
| `CartLine` | `catalog-card-line`, `recommended-course-row`, `avatar-identity-badge-action-row` | **keep-apart** | Different slot identity: it is the only row in the registry whose trailing slot is ONE destructive control. `catalog-card-line` ends in two equal buttons, `recommended-course-row` ends in nothing, `avatar-identity-badge-action-row` ends in a labelled button. |
| `OrderSummary` | `stacked-stat-rows` (already the money reckoning), `course-price-block` | **keep-apart** | Different slot identity: `stacked-stat-rows` holds `stat-row`, which REQUIRES an `icon`. A subtotal has no honest glyph, and adding one to fit the mould is invention. It also separates its last line by icon; this one separates by rule. |
| `order-total-row` | `label-with-muted-fact-row` | **keep-apart** | Different leaf prop constraints, and rank is the whole point: that entry pins its fact to `xs`/`muted`, correct for a component of a total and exactly wrong for the total. |
| `cart-line-list` | `catalog-card-list`, `recommended-course-list`, `marked-row-list` | **keep-apart** | Different child identity — it admits only `cart-line-row`. Shares the canonical joined-list run, which is the point: a basket reads like every other joined list in the product. |
| `cart-page-column` | `courses-catalog-page`, `league-page-column` | **keep-apart** | Different child set. Shares the measure and inset deliberately so the chrome does not shift between routes. |
| `cart-drawer-column` | `cart-page-column` | **keep-apart** | Different child set: no header, because the shell names the panel. |
| `checkout-panel-column` | `course-price-detail-stack` | **keep-apart** | Different child identity: it holds a choice control and an action, which that entry has neither of. |
| `InstallmentSchedule` (proposed by Plan) | `pricing-phase-ladder` / `pricing-phase-row` | **merge** | Same classes, same three slots, same mark mechanic. Merged by freeing the existing pair of its domain name → `ordered-step-ladder` / `ordered-step-row`. |
| `AddToCartButton` (proposed by Plan) | `CourseCatalogCard`'s existing cart control | **merge** | It shipped between the Plan lock and this one. Not rebuilt. |
| `ConfirmButton` | `Button` | **keep-apart** | Different behaviour contract: a press ARMS rather than acts, and a second press inside a closing window acts. Folding it into `Button` behind a flag would put a confirmation step one prop away from every control in the product, and the control that most needs to stay single-press is the one nobody would think to check. |

---

## 4. Declared integration edits

Differences Apply is permitted to introduce. Anything not on this list blocks handoff.

| Target path | Reason |
|---|---|
| `src/components/contracts/index.ts` | The candidate carries a full copy with the deltas; Apply merges the entries and the four union members into the live table rather than replacing the file. |
| `src/components/blocks/courses/CoursePricingRail/component.tsx` | Migrated to `ordered-step-ladder` / `ordered-step-row` by the rename. Not otherwise touched. |
| every candidate component | `~candidate/*` specifiers become `@/*`. |

---

## 5. What is NOT covered

Recorded rather than implied.

- **No connected halves.** Every owner here is the pure twin. `myCart` does not exist on the
  frontend yet, so the `index.tsx` that fetches is Apply's work against a query that must be written
  first — the record names the blocker rather than pretending the fetch is designed.
- **The narrow state is MEASURED, not photographed.** `cart-populated-narrow` was checked in a real
  browser at 375px: `scrollWidth === clientWidth === 375`, zero overflowing nodes, cover
  `display: none`, identity 102px / price 129px / removal 40px, total row intact. The screenshot
  pipeline could not reproduce it — headless Chrome lays out wider than the window and crops, in
  both the old and the new headless — so the PNG for that state is misleading and is not evidence.
  The measurement is.
- **The armed clear-control is UNVERIFIED.** A `cart-clear-armed` state was written and then
  removed: arming is client state reached by a press, so a static export rendered the resting
  control while the state claimed to show the armed one. Driving it needs a real pointer, because
  HeroUI's `Button` uses react-aria `onPress` and ignores a synthetic `.click()`; the browser pane
  is hidden in this session and pointer clicks time out. The mechanic is ported from a reference
  that ships it, and nobody in this run has watched it work.
- **No light theme render.** `cart-populated-light` is in the matrix and its screenshot was taken
  at desktop width, but the token inversion has not been read node by node.
- **No focus-return proof.** The drawer's dismissal and focus return are the vendor's, and no state
  exercises the keyboard.
- **The navbar cart button stays dead.** It exists at `ShellNav/component.tsx:103` with no handler.
  Wiring it is one line and it is not in this scope.
