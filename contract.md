# The contract spine — design, settled

Status: **design agreed, not yet built here**
Built and proven in: the greenfield repo `starci-academy-fe`
Applies to: what replaces `principle` in this app

This file exists so the work can continue on another machine without the conversation that
produced it. It states the design, the reasoning, and — deliberately — every alternative that was
considered and rejected, because the rejections are the part a reader would otherwise re-propose.

It states rules, not measurements. Counts change; a document that carries them starts lying the
next day.

---

## 1. What is wrong with `principle`

`principle="content-row"` describes ONE node: a token resolves to a gap and stops there. It says
nothing about what goes inside. So two call sites of the same principle still produce two
different trees, and the author is still guessing — which frame, which token, which gap, whether a
wrapper is needed. Four guesses per node.

The deeper failure is the **escape hatch**. `principle` shipped alongside `className`, so whenever
the token could not express something, the author reached past it. That door is why this app now
carries eleven lint rules whose only job is to close it —

```
no-public-classname-prop      no-per-part-classname-prop    no-public-frame-css-props
no-css-door-type-laundering   no-classname-at-sentence-tier no-cn-above-vocabulary
no-contentpage-box-classname  no-modal-title-classname      no-hero-heading-class
no-arbitrary-token            no-fractional-spacing
```

— plus four separate migration campaigns under `prompts/cursor/` named after burning CSS doors
down. Roughly a third of the rule set is a patrol hired to guard one door.

**The rule that follows: the replacement has no escape hatch.** Not "a discouraged one", not "one
with a lint rule on it". None. A hatch is always the path of least resistance; every use looks
locally reasonable, and only the aggregate is fatal — by which time it is hundreds of files.

---

## 2. The contract

A contract is **two fields**.

```ts
contract "a": {
    classNames: ["flex", "flex-col", "gap-4"],
    children:   { body: { contract: "b" }, footer: { contract: "c" } },
}
```

`classNames` is an array of a **closed union**, never a free string. `gap-[13px]` is not
forbidden — it is **unrepresentable**, because it is not a member. That single change makes a
whole family of patrol rules unnecessary: there is nothing to patrol when the bad value cannot be
typed.

The precedent already exists in this repo: `src/components/atoms/_allowed-class-name.ts`, whose
own doc states the reason — *"The union is closed: no `${string}` template… A template branch
would let `tsc` accept any string… the enumeration is what makes the type checkable at all."*

**That existing union is for the CHILD** (how a leaf sits in someone else's box: `grow`,
`shrink-0`, `min-w-0`, `col-span-*`). It deliberately excludes `flex-col`, `gap-*` and padding.
A contract needs the excluded set — how a node lays out its OWN children. So the contract union
is a **sibling union, not a reuse**. Same discipline, different membership. Merging them breaks
the reason each exists.

### `children` — the second field

Each entry is a `ChildSpec`:

```ts
type ChildSpec = {
    contract: ContractKey                        // the child is itself a contract
    fit?:     ReadonlyArray<AllowedClassName>    // how this child sits in THIS parent
    isArray?: true | number                      // this position holds many
    empty?:   ContractKey                        // what a zero-length list shows
}
```

**The key of `children` IS the role.** There is no separate role vocabulary to maintain: declaring
a role and declaring a child were two statements of one fact.

**`contract`, not `ComponentType`.** A slot is filled by another contract, recursively, until a
terminal contract names an atom. That is what closes the last hole: with a free `ComponentType`,
someone can pass a component that draws its own markup and nothing in the system sees it. With a
contract at every position, **no node is unowned** — a list cannot hand-roll twenty-nine `<li>`s
that no rule can see, because the list is a contract too.

**`fit` replaces the parent reaching into its children with a selector.** Today a split writes
`md:[&>*:last-child]:w-72` — the parent talking about *the last child*, positionally. Under the
contract it says `aside: { contract: …, fit: ["shrink-0", "w-72"] }` — the parent talking about
*the aside*, by name. Insert a role in the middle and the positional version is silently wrong
while the named one is still right. The selector is not banned; it has no reason to exist.

---

## 3. Lists

`isArray` marks a position that holds many. The slot it produces is not an array of components:

```ts
type ListSlot<K extends ContractKey> = {
    shape: ContractType<K>                  // ONE contract, uncalled — the frame calls it
    items: ReadonlyArray<PropsOf<K>>        // data, inert — passed straight
}
```

```tsx
<DayTrack days={{ shape: DayCell, items: week }} />
```

The boundary is: **a component is passed uncalled because calling it renders it, and the frame
must own when that happens; data is passed directly because data is already inert.** Two fields of
one object, two different rules — that is correct, not an inconsistency to smooth over.

One `shape` rather than a list of components means every item in a list is the same contract **by
construction**, so no rule is needed to enforce homogeneity. The frame owns the `key` and can
render N resting shapes before any data exists.

`isArray: number` states an exact length — seven days is seven, and the same number tells the
frame how many resting cells to draw. `isArray: true` is an unknown length; the resting count is
then a frame constant, and it is a placeholder, not a prediction.

### `isArray` is what makes a fragment honest

This repo already bans a slot that returns `<>{…}</>` with siblings inside — `no-fragment-slot`:
*"fragments must not launder the typed items contract."* Correct: an undeclared fragment smuggles
n nodes through a position the parent believes holds one, so the parent's `gap` applies to the
wrong thing.

`isArray` is the declaration that makes the same fragment legitimate. The parent now knows the
position expands, and its seam applies across the siblings rather than around them.

---

## 4. The resting state, in the type

A frame renders `<Shape isLoading />` before any data exists, so a contract's component must be
renderable with **no data at all**. The naive fix — `Partial<Props>` — trades one hole for a
bigger one: every prop becomes optional everywhere, so a loaded call site can omit real data and
still compile.

Discriminate on the flag instead:

```ts
type ContractType<K extends ContractKey> = ComponentType<
    | ({ isLoading: true }   & Partial<PropsOf<K>>)   // resting: data may be absent
    | ({ isLoading?: false } & PropsOf<K>)            // loaded: data is required
>
```

**This makes a rule out of what was a habit: every contract must be able to draw its own shape
before its data arrives.** That is a condition of a contract being valid, not an implementation
detail.

`isLoading` means *there is nothing to show yet* — the first load. It does **not** mean a request
is in flight; a revalidation has data on screen already, and treating it as loading makes the page
flash skeletons every time a tab regains focus. **Empty is not loading**: a request that settled
with nothing is an answer, and it renders `empty`, never shimmer.

---

## 5. Composite tier and above: the component stops declaring its own props

```ts
type ContractProps<K extends ContractKey> = ContractSlots<K> & { data: DataOf<K> }

export const SurfaceCard = (props: ContractProps<"surface-card">) => …
```

The component **cannot add a prop**. Slots come from the contract's `children`; data comes from
`DataOf<K>`. Growing the surface means editing the contract — which is to say, passing through the
place that has rules.

Without the grouping, `data` is an open set of props the component author invents, and the
contract never learns that a fourteenth one appeared. That is what the grouping buys: not extra
type safety on any single value, but **the loss of the author's power to declare a surface at
all**.

Then make the split real rather than conventional:

```ts
type DataValue =
    | string | number | boolean | null | undefined
    | ReadonlyArray<DataValue>
    | { readonly [k: string]: DataValue }
```

A component is a function; a function does not satisfy `DataValue`. So structure cannot be
smuggled into `data`, and data cannot be smuggled into a slot typed `ContractType<K>`. **The
object wrapper is syntax; these two types are the fence.**

Slots stay flat props (`body={Body} footer={Footer}`) rather than being grouped: a slot is a
component reference, usually a module constant and therefore stable, and wrapping stable things in
a fresh object every render defeats memoisation for no gain. `data` changes anyway.

---

## 6. Rejected, and why — do not re-propose without new evidence

**`extends` between contracts.** Attractive because two contracts can share a class list. Refused
on three grounds: a chain of three puts three files in charge of one node's classes, which is the
CSS cascade the registry replaced; the elevation rule (*top-level surface takes shadow, a nested
one takes border and never a second fill*) means the same contract must render differently
depending on where it sits, which is contextual and not hereditary, so inheritance cannot express
it anyway; and two contracts that happen to share a gap step are not related — making them
share a base asserts a kinship that may not exist, and the day one needs a different step the
other breaks for no reason its author can see.

Two contracts with identical `classNames` simply say the same thing twice, and because
`classNames` is now data, that duplication is **countable** — a far better instrument than a cap
on how many contracts may exist.

**Branded identity** (`ItemShape<"icon-text">` carrying a `__shape` marker). Stricter about
identity, but a brand has to be applied with an `as`, so it records who labelled a thing rather
than what it is — a mislabelled component passes. A structural constraint is derived from the real
signature and cannot be mislabelled. Same reason every double cast was removed.

**A positional tuple** for the child spec (`["b", "grow", "min-w-0"]`). Rejected for exactly the
reason `nth-child(2)` was rejected: the reader has to know which position means what. Named fields
say it themselves, survive a new field being added, and produce type errors that name the field
instead of an index.

**A thunk for `items`** (`items: () => week`). It defers nothing worth deferring — `week` is
already computed — and written inline it is a fresh function every render, so it does not buy
referential stability either. Data goes straight through.

**A ceiling on the number of contracts.** Tried, raised once under pressure, and that is the
evidence against it: a number that moves when it is inconvenient is a speed bump. What is worth
refusing is not the count but the **duplicate** — two contracts with the same shape and no stated
reason.

---

## 7. What is still open

- **Where the frame ends up.** A single interpreter is the one place that cannot be bypassed and
  the only place that can count surface nesting depth. But a bare `<Tree contract="split">` at
  every call site loses the component name in DevTools and reads worse than `<Split>`. The likely
  answer is a thin named facade per contract whose only permitted content is one call to the
  interpreter — enforceable by lint — but this is not settled.
- **Landmarks.** A contract that must render `<nav>` either carries an `element` field (a third
  field, resisted) or is a component that writes its own tag. Unsettled.
- **Enforcement stops at the source.** Every rule here reads imports, props and literals. None
  looks at the DOM a reader actually receives. A tree can pass every gate and still be visually
  wrong — this happened twice while the design was being built, with all gates green. This app
  has a rendered-tree runner; the greenfield repo does not, and that gap is the reason its two
  screens shipped looking like wireframes while every check passed.
