# Settled

What is written here is agreed and closed. It supersedes `principles.md` wherever the two
disagree — that file is a draft and this one is the record.

Everything still open is listed at the end, so a reader can tell a decision from a guess.

---

## 1. Two layers, three tiers

```
BUSINESS
block     — reads a request, owns one state. A state is a SITUATION, and it picks a tree.

DESIGN — collectively, the ELEMENTS layer. It is handed a tree and draws it.
branch    — assembles contract nodes. Tree draws one; SurfaceCard assembles several.
leaf      — fixed interior, only elements inside. Owns its own layout.

contract  — NOT a component. Data: a node's classes, and why those children sit that way.
```

**The layers hold different slots, and that is what keeps them from contradicting.**

```
block     state        the situation  →  WHICH TREE
elements  isLoading    a flag         →  HOW IT IS DRAWN
both      props                       →  WHAT IT SAYS
```

A block has no `isLoading`; an element has no `state`. `{ state: "empty", isLoading: true }` is not
forbidden — it is **unwritable**, because the two words never appear on the same component. That
combination was nonsense (`empty` has settled, `isLoading` has not), and the layer split makes it
unsayable rather than merely wrong.

### Two axes, kept apart

`leaf / branch` answers **what a node is in the tree**. `block` answers **whether it touches the
world**. The old ladder — `atom / frame / composite / block / page / layout / overlay` — mixed
them, which is why it never sat still.

`composite` was never a shape; it was the domain axis — does this thing know what the data means?
That changes nothing mechanical. It decides which folder a file lives in and whether it is
reusable. Filing, not a tier.

`frame` is gone: a tier with one member is not a tier. `Tree` is the smallest branch.

---

## 2. A contract is two fields

```ts
interface ContractSpec {
    readonly classes: ReadonlyArray<LayoutClassName>
    readonly why: string
}
```

That is all. No `children`, no roles, no `count`, no `fit`, no `open`. A contract describes ONE
node's own layout and states why the things inside it sit that way. Everything about WHAT goes
inside is the assembling branch's business.

### The name must determine the children

> **`card` is not a contract name. `list-item-rows` is.**

`card` says nothing about what goes inside, so anything can, and the entry stops constraining
anything. `list-item-rows` says what it holds, so a reader knows before opening it and a wrong
child is visible on sight.

This is not "the name should sound businessy". It is narrower and harder: **the name has to fix the
children.**

It is also what keeps `why` from decaying. A key drawing twenty regions cannot say why any one of
them is there — true of `card`, false of `list-item-rows`, because the reason a row of list items
is laid out that way is the SAME reason at all twenty. A vague name dilutes its own explanation; a
name that fixes its children cannot.

### Positioning a specific child is a positional selector, and that is accepted

```ts
"list-item-rows": {
    classes: ["flex", "flex-row", "items-center", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
    why: "The glyph identifies the row faster than its name does, so it leads the line and the figure trails it - and the name between them takes the slack, because a long one must clip rather than push the figure off the end.",
},
```

`fit` — naming the child instead of counting to it — was the better mechanism and it died with
`children`. The objection to selectors stands: insert something in the middle and the positional
version is silently wrong while a named one would still be right.

It is accepted anyway, for a reason that did not hold when the objection was first written. Then,
children arrived from arbitrary call sites, so a selector was coupled to code nobody could see.
Now children come from **one branch**, and whoever inserts one is looking at the contract beside
it. The coupling is two files, read together.

---

## 3. Branch — the tier that assembles

`Tree` renders one contract node. Anything needing more than one node is a named branch:

```tsx
<SurfaceCard contract="streak-card" props={…}>{…}</SurfaceCard>

// expands to
<Card contract="streak-card">     // the OUTER key is a parameter — which node this is
    <CardBody>                    // the inner assembly is fixed; the branch knows it
        {…}
    </CardBody>
</Card>
```

**The outer contract is a parameter, the inner assembly is not.** One `SurfaceCard` serves every
card after it — same assembly, different node.

**A branch writes no classes.** Every class on screen comes from a registry entry. Its body may
hold `Tree`, leaves and other branches, and nothing else — no markup, no class. That single
sentence is what keeps a branch from quietly becoming a second registry, and it is the guarantee
that replaced "no node is unowned" when the registry stopped recursing.

**A branch is also where a repeated child is mapped.** Nothing in the registry counts children:

```tsx
const Feed = ({ props }) => (
    <Tree contract="feed-column">
        {props.items.map((item) => <FeedCard key={item.id} contract={item.contract} props={item} />)}
    </Tree>
)
```

The contract supplies the seam; the branch supplies the count and the key.

### A section's name is held OUTSIDE the surface it names

`SurfaceCard` draws three nodes, not two: the column, the label line, then the surface. The label
sits above the surface rather than inside it.

```tsx
<Tree contract="label-row-over-card">
    <Tree contract="title-with-end-action">  // the name, and ONE thing at the far end
        <Heading level={3} />
        {seeMore ?? fact ?? null}
    </Tree>
    {isFrameless ? children : <Tree contract="bounded-content-card">{children}</Tree>}
</Tree>
```

**Why it decides the shape.** A section whose content is itself a set of cards — resume tiles,
course rows — would otherwise draw a card inside a card, and two nested insets read as a mistake
rather than as a hierarchy. With the label held above, `isFrameless` drops the inner surface and
the name stays. With the label inside, dropping the surface drops the name with it, and every such
section has to re-invent a header.

**One place at the end of the label line, and an action outranks a fact.** They compete for the
same place deliberately: a fact and a control that look alike, each sitting where the other would,
is how a reader clicks the count.

**Section labels are `level={3}` — `text-sm font-medium`.** The step down from a surface title is a
weight, not a size. A screenful of section labels set at title weight reads as a dozen competing
titles rather than as the names of the things beneath them; another size step down would just make
them harder to read.

---

## 4. Leaf — an atom, or a cluster of atoms

> **A leaf's interior is fixed, and holds only elements. It owns that interior, including its own
> structural classes.**

`Button`, `Icon`, `Text`, `Heading`, `Calendar`, `InputOtp` — one atom each, usually one vendor
primitive. `StatRow`, `CrossChecklistItem`, `StreakWeekRun` — a cluster: several atoms, and a seam
of its own.

```tsx
export const StreakWeekRun = ({ props, isLoading }: StreakWeekRunProps) => (
    <div className="flex flex-row flex-wrap items-center gap-2">
        {(isLoading ? RESTING_WEEK : props.days).map((day) => (
            <DayCell key={day.id} props={day} />
        ))}
    </div>
)

export const meta = { shape: "leaf", world: "pure" } as const
```

A run of leaves is itself a leaf: it keeps its own count, its own keys and its own loading shape.
Nothing above it needs to know there are seven.

**Why a cluster's seam is not registry business.** The registry exists for layout that VARIES or is
SHARED. A leaf's interior is neither: it is the same everywhere, forever, written once.

### The three slots

```tsx
export interface ButtonProps {
    props: ButtonData          // what it draws
    on?: ButtonActions         // what it does
    isLoading?: boolean        // handed down, never decided here
}
```

`children` is gone — text is data and travels in `props` as `label` or `content`. The original app
reached this on its own: `Typography` takes `text`, not children.

`className` / `classNames` is gone — a caller who can restyle a node has become its second owner.

**Handlers travel apart from data.** A function is not a `DataValue`, and that fence is the only
thing stopping a component being smuggled through `props`.

### Appearance is decided once, in the branch

There is no appearance/content split on a leaf's props any more — that existed so a contract could
hold the appearance half, and contracts hold nothing but classes now.

"Decided once" is not lost; it moved. `SurfaceCard` writes `<Heading props={{ level: 3 }} />` once,
and every card it draws has a level-3 title. The single place is the branch instead of the
registry.

### A leaf draws its own loading shape

Not the frame. The frame knows a contract's classes; it does not know that a `body` line box is
24px, a `body-sm` line box is 20px, and that the bar standing in for a line must be 14px with 5px
or 3px of margin to fill the box it replaces. Those are type metrics and they live in the leaf.

**Which fields survive while loading is per leaf, not a rule.** `Typography` may drop its `text` —
a text bar has a declared width of its own. `Button` may not drop its `label` — the loading control
keeps its real width, and its real width is the width of its label.

---

## 5. State: the situation that picks a tree

> **If it selects a different tree, it is a state. If it does not, it is props.**

```tsx
state="subscribed" | "unsubscribed"
state="enrolled" | "notEnrolled" | "trial"
state="details" | "code" | "done"
```

There is **no mandatory vocabulary**. Two blocks naming their states differently are not drifting —
they are describing different situations, and describing them differently is correct.

`sending`, `verifying`, `resending`, `disabled`, an error sentence, a retry count: none selects a
different tree, so none is a state. They are props.

### `loading` is NOT a state

It fails the test: the loading shape IS the loaded shape, drawn at rest — that is the whole reason
a skeleton keeps the layout it stands in for. Same tree, different drawing. So it is a flag, one
layer down, and "which of a block's states mean loading" stops being a question.

### A block's state set is derived, not declared

```tsx
const _StreakStrip = ({ state, props }: StreakStripProps) => {
    if (state === "notEnrolled") return <EnrolPrompt props={props} />
    if (state === "empty")       return <EmptyCard props={props} />
    if (state === "pending")     return <StreakCard props={props} isLoading />
    return <StreakCard props={props} />
}
```

The set of states IS the set of branches. Nothing to keep in sync, nothing to declare wrongly, and
the body reads as a switch over situations — which is what a generator writes and a reader checks.

**`isLoading` is written HERE, at the seam, and nowhere above it.** The block decides which tree a
situation deserves; when the situation is "not settled yet" it picks the tree it would have shown
and hands it the flag. That is the one line where a business situation becomes a drawing
instruction.

**The elements a situation picks are SHARED, not minted per block.** An empty state looks the same
wherever it appears, so `EmptyCard` is written once. A block minting its own is duplicating a
design, and it will differ from its neighbours by accident rather than by decision.

### `props` is discriminated by `state`

```ts
export type StreakStripProps =
    | { state: "notEnrolled"; props: { heading: HeadingData; invite: string } }
    | { state: "empty";       props: { heading: HeadingData; message: string } }
    | { state: "pending";     props: { heading: HeadingData } }
    | { state: "ready";       props: { heading: HeadingData; days: ReadonlyArray<Day> } }
```

`state="empty"` carrying a week does not compile; `state="ready"` without one does not either.

### Only a block sees `state`

Branch and leaf never receive it. `_X` is the single place a situation becomes a tree.

---

## 6. Block — one web component, one state, one settling unit

> **One block = one state = one thing that settles.**

A block reading three requests does not get three flags, and it does not get one shared flag. It
gets **split into three blocks**. The repo found this the hard way and wrote it down in
`IdentityStats`: three requests

> *settle at different times, and a shared flag would hold a finished row hostage to a slow one.*

**The test:** can the parts be shown independently? Yes → separate blocks. No → one block.

### The written shape

```
B   →  _B  by state          B resolves B's own request
C   →  _C  by state
_A  →  { B, C }              the presentational half mounts the CONNECTED halves
A   →  _A
```

`IdentityStats` therefore comes with three more blocks, and `_IdentityStats` keeps the one state
only it can settle. The three share ONE leaf, because they differ in domain, and domain does not
decide shape.

**The cost, stated:** two files become six, and the rows appear a few hundred milliseconds apart.
That is the deliberate trade — out of step beats held hostage. Wanting them together means joining
the three requests into one state at the rail, which makes the rail a block again and undoes the
split. There is no third option.

### Two things easy to read wrongly

**The underscore's promise is local, not transitive.** `_A` mounts `B` and `C`, and those fetch.

> `_X` reads no request, no locale and no store ITSELF. It does not promise that nothing beneath it
> does.

**A connected half exists only when there is something to resolve.** If `B` and `C` own their states
and `A` has none of its own, `A = () => <_A />` is a file that wraps and does nothing. Delete it,
and `_A` loses the underscore too — it was never a block.

---

## 7. Rejected — do not re-propose without new evidence

**A recursive registry** (a child naming another contract). It buys "no node is unowned" as an
absolute, and costs a type cycle across two files plus a self-referential builder. Assembly is a
branch's job, and the constrained branch body buys the same guarantee for less.

**`children` / `ChildSpec` on a contract**, and everything that grew on it: declared roles, `count`,
`restingCount`, a required `id`, fixed-length tuples, `DataOf` derived from children, `fit`, `open`.
A contract describes one node's own classes. What goes inside is the branch's business, and a run
of leaves is a leaf.

**An appearance/content split on every leaf.** It existed so a contract could hold the appearance
half. Contracts hold classes.

**A terminal contract per leaf** (`card-title`, `row-label`). All it would carry is appearance
constants, which the closed prop union already is.

**Splitting each leaf into `_Leaf` / `Leaf`.** The resolving half would be the same three lines in
every leaf.

**The registry read from inside a leaf.** A leaf that cannot render without the registry cannot be
mounted from a story or a test.

**`Box`** — any element plus any contract. A generic box is `Tree` under a second name, and one key
used at forty unrelated nodes turns its reason into a label. §2's naming rule is what refuses this
generally.

**`wrapper` as a third shape.** It was a branch with one property flipped.

**Deciding leaf-versus-branch by whether a vendor primitive exists.** It would make the tier depend
on a third party's roadmap.

**A ceiling on the number of contracts.** Tried once and raised under pressure, which is the
evidence against it. What is worth refusing is the DUPLICATE — two contracts with the same classes
and no stated reason — and because classes are data, that is countable.

---

## 8. Measured, not assumed

**Deep type recursion was never the risk it looked like.** A chain 40 deep with a literal nested 40
levels type-checks in 0.26s at 5,824 instantiations; an error injected 20 levels down reports in 138
bytes and names the field. The registry is flat now for a different reason — assembly belongs to a
branch — not because the compiler could not take it.

**Structural classes are already policed everywhere.** `no-literal-structural-class` runs on every
file under `src/` except the registry and tests, and `flex`, `gap-*`, `items-*` are all in its
prefix list. Twelve leaves exist in this repo today and eleven write no class at all; the twelfth
writes `sr-only`.

---

## 9. Still open

- **The leaf exemption is not built.** §4 lets a leaf write its own structural classes, and the rule
  above forbids exactly that. Until the rule exempts leaf files, this document and the gate
  contradict each other, and the gate wins.

- **That exemption will be a folder, so "leaf" becomes escapable by filing.** It is a policy
  boundary, not a type. The purpose here is AI generation, and a generator that reads the rules is
  governed by them — but a gate is what catches the generator drifting between sessions, and a human
  editing afterwards.

- **The rule's own doc will then be wrong.** After the exemption its real scope is "blocks and pages
  may not write layout", far narrower than its name.

- **The duplicate-counting gate does not exist**, and with the ceiling gone it is the only instrument
  left against drift.

- **Where handlers live above the leaf — ACCEPTED AS UNSOLVED.** `on` is settled for the leaf. A
  handler still has to travel from the block that owns the action down to the control that reports
  the press, and no rule says how. Knowingly left open rather than answered badly: a slot invented
  before the shape of the problem is known outlives its reason.

- **Positional selectors are back.** §2 accepts them because nothing else survives the cut. The
  original objection is still true — inserting a child in the middle silently breaks
  `nth-child(2)` — and the mitigation is only that the branch and the contract are read together.

- **Enforcement stops at the source.** Every rule here reads imports, props and literals. None looks
  at the DOM a reader receives. A tree can pass every gate and still be visually wrong, and that has
  happened twice with all gates green.
