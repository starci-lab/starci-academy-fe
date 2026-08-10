# Authoring principles — one composer, two props

Status: **agreed in outline; two rules below cannot be enforced until §7 lands**
Supersedes: the authoring half of `starci-fe.md` §1 and §6. It does not replace `contract.md`,
which records the contract's own design and the alternatives that were refused.

This file states rules, not measurements. Counts of files, keys or call sites change hourly and
belong to the tools that count them, never to a document that would then be lying by tomorrow.

Where a rule cannot be obeyed with what exists today, it says so on the rule rather than in a
footnote. A principle nobody can follow is not a strict principle; it is a dead one, and a reader
who finds three of those stops believing the other twelve.

---

## 1. One composer

**`Tree` is the only component that accepts children.** Nothing else takes a slot, a
`ComponentType`, a `ReactNode`, or a render prop.

Every other component receives DATA and draws its own subtree.

The reason is not tidiness. A component that accepts a child is a place where structure is
decided, and a system with two places where structure is decided has no place where structure is
decided. The registry replaced "pick a frame, pick a token, pick a gap, decide whether a wrapper
is needed" with one key. A composite that takes `body`, `action` and `footer` reinstates exactly
that choice under a different name: pick a composite, pass three children. It is a second
registry with no keys, no ceiling and no reasons — which is the thing the registry's own rules
already refuse everywhere else.

The test is mechanical. If a component's props contain a component, it is composing. Only the
frame may compose.

---

## 2. Two props

**Every component below the frame takes exactly `state` and `props`.**

```tsx
<_StreakStrip state="ready" props={{ heading, days, readout }} />
```

`state` is a token from a closed set: what the surface has settled into.
`props` is the data it draws in that state.

Nothing else. No `className`, no `variant`, no `size`, no `isLoading`, no fourth prop that
seemed harmless at the time.

**What this buys is not type safety on any single value. It is the loss of the author's power to
declare a surface at all.** A component whose interface it owns can always grow a fourteenth
prop, and every one of those grows for a locally good reason. A component whose interface is two
fixed props cannot: a new fact has to become part of the contract's data before it can be
rendered, which is to say it has to pass through the place that has rules.

Grouping by role INSIDE `props` — `heading`, `days`, `readout` rather than `label`, `record`,
`week`, `figure` — is right and is not the same rule. It says which part of the surface a fact
belongs to. It does not, on its own, stop a fourth prop appearing beside it, and a doc comment
claiming it does is a convention wearing a rule's clothes.

---

## 3. The fence between data and structure

`props` carries data. Data is:

```ts
type DataValue =
    | string | number | boolean | null | undefined
    | ReadonlyArray<DataValue>
    | { readonly [k: string]: DataValue }
```

A component is a function; a function does not satisfy `DataValue`. So structure cannot be
smuggled into `props`, and §1 cannot be worked around by renaming a slot.

**The object wrapper is syntax; this type is the fence.** Without it, `props` is an open bag and
`children` merely moves house.

---

## 4. State

**A surface's states are a closed set, declared as a value.**

`resting` — there is nothing to show YET: the first load, no data in hand. It does NOT mean a
request is in flight. A revalidation has data on screen already, and treating it as resting makes
the page flash skeletons every time a tab regains focus.

`empty` — a request SETTLED with nothing. That is an answer, and it renders words. A surface that
shimmers at an answer tells the reader to wait for something that already arrived, and a
signed-out visitor meeting that is not an edge case; it is the most common first view a product
has.

`failed` — settled by failing. It says so in its OWN words. Borrowing the empty state's sentence
means an unreachable server tells a reader there is no streak yet: a claim about their learning
manufactured out of a network error, and one they have no reason to disbelieve.

`ready` — data in hand.

**Declared as a VALUE, not as a union of props types.** This repo enforces by walking values: the
registry is an object a rule reads, the ceiling is a constant a test counts. A discriminated union
is erased at compile time, so a state set expressed only as a union is invisible to every gate,
every story and every audit the repo already runs. The union is how the type is written; the
declaration is what makes it inspectable, and both are required.

The declaration belongs beside the tier marker each component already carries:

```ts
export const meta = { tier: "block", name: "StreakStrip", states: STREAK_STRIP_STATES } as const
```

**And the props type is a union keyed on the state**, so the data of the state a surface is NOT
in cannot be passed, and the data of the state it IS in cannot be omitted:

```ts
export type StreakStripProps =
    | { state: "resting"; props: Frame }
    | { state: "empty";   props: Frame & { message: string } }
    | { state: "failed";  props: Frame & { message: string } }
    | { state: "ready";   props: Frame & { days: ReadonlyArray<Day>; readout: Readout } }
```

The alternative — one flat `props` shape with every field optional — is the `Partial<Props>` trap
by another route: every field optional everywhere means a loaded call site can omit real data and
still compile.

---

## 5. Two halves

A component that fetches, translates, or reads a store is the CONNECTED half. It resolves a
request into a state and copy into strings, and hands the presentational half `state` and `props`.

The presentational half — `_X` — renders. It can be mounted from a test with no request, no
provider and no locale, which is the whole reason the split exists.

**Copy is data.** A string a reader sees is resolved by the connected half against the message
catalogue and arrives in `props` already translated. A presentational component that reaches for
a translation hook has become a connected one.

---

## 6. What the contract owns, and what nobody else may decide

The registry key owns the node's classes, its host element, the roles of its children, the arity
of each of them, and the one sentence saying why the node exists.

**Arity belongs to the key.** A week is seven days whatever the payload returns, so `track` says
seven; a set of choices is however many there are, so `tab-strip` says `true` and the resting
count is the frame's placeholder — a placeholder, never a prediction. A caller who hands an array
to a singular role does not compile, and a block that draws its own run inside a fragment is
putting n children where the parent's seam expects one.

**Landmarks belong to the key.** An author reaching for `<nav>` by hand is deciding structure the
registry exists to decide.

---

## 7. The prerequisite — contracts must recurse

**§1 and §2 cannot be obeyed until a contract's child names another contract.**

Today a child is filled by a `ComponentType` handed in from outside, which is precisely the slot
§1 forbids. Remove the slot and nothing supplies the child. The only other answer is the one
`contract.md` §2 already specifies: a `ChildSpec` names a `ContractKey`, recursively, until a
terminal contract names an atom. Then the tree knows its own shape all the way down, the caller
supplies only data, and — in `contract.md`'s words — no node is unowned.

So the order is: recursion first, then "no children" is a rule the code can actually follow.
Shipping §1 before §7 writes a principle with no legal way to obey it.

The known obstacle is small and mechanical: `ContractKey` is derived from the registry in
`shapes.ts`, while `ChildSpec` is declared in `roles.ts`, so a child naming a key is a type cycle
across two files. Moving the spec types into `shapes.ts` resolves it; that is a decision about
file responsibilities, not about the design.

---

## 8. Rejected — do not re-propose without new evidence

**A composite that takes slots.** It is a second registry: the same "which shape, which child,
which gap" choice the key already answers, made again at a component with no ceiling and no
stated reasons. What survives is the NAME — a thin facade over one key, taking `state` and
`props`, so the tree keeps a readable name in a stack trace and in DevTools without owning any
structural decision.

**`props` as `Record<state, data>`.** Attractive for two real reasons: it makes the full state set
visible at one glance, and it turns a branch into a lookup, which is the move the registry itself
is built on. Refused as the props type because it is total — every call site must construct the
payload of every state it is not in — and because the data most surfaces carry does not vary by
state at all, so the surface's own name would be repeated once per state and drift. The two things
it was reaching for are kept and placed where they cost nothing: the visible state set becomes the
declaration in §4, and the branch-to-lookup becomes §9's open question.

**One flat `props` shape with optional fields.** See §4: it is `Partial<Props>`, and it lets a
loaded call site omit real data and still compile.

**A ceiling on the number of contracts, as the instrument against drift.** Tried, raised once
under pressure, and that is the evidence against it: a number that moves when it is inconvenient
is a speed bump. What is worth refusing is not the count but the DUPLICATE — two keys with the
same shape and no stated reason. Because classes are data, that duplication is countable.

---

## 9. What is still open

- **Does a state select DATA, or a TREE?** §4 assumes data: `props` supplies what a component
  draws while the component itself branches on the state. The stronger reading is that each state
  names a CONTRACT KEY and the frame draws it, at which point the component stops having a body
  and becomes a table — which is what the registry did to layout, applied to state. It would also
  dissolve §4's duplication worry, because four states reusing one heading reuse a CONTRACT rather
  than repeating a string. It is not settled, and it is the decision with the widest blast radius
  here: the frame would take the state rather than a resting flag, and every existing call site
  would move.

- **Where the named facade lives.** §8 keeps the name and drops the slots, but not whether the
  facade is written by hand per key, generated, or enforced by a lint rule that permits exactly one
  call to the interpreter inside it.

- **Enforcement still stops at the source.** Every rule here reads imports, props and literals.
  None of them looks at the DOM a reader actually receives. A tree can pass every gate and still be
  visually wrong, and that has happened twice with all gates green. Nothing in this document
  changes that, and no number of further source rules will.

---

## 10. One of each — the same screen, all the way down

Every example below is the SAME surface: the learning-streak strip. They are written as one
vertical slice on purpose. A set of examples drawn from six unrelated screens shows what each
tier looks like and hides the only thing worth showing, which is where one tier stops and the
next begins.

Two markers are used throughout:

- **`[today]`** — compiles against the tree as it stands.
- **`[needs §7]`** — the target shape, which requires a contract's child to name another contract.
  Written out anyway, because a principle whose example does not exist yet is a principle nobody
  can check.

---

### 10.1 The message catalogue — `src/messages/en.json`

```json
{
    "streak": {
        "heading": "Learning streak",
        "loading": "Loading",
        "empty": "No streak yet",
        "failed": "Could not load your streak",
        "currentLabel": "Current streak",
        "current": "{count, plural, one {# day} other {# days}}",
        "longest": "Longest {count, plural, one {# day} other {# days}}"
    }
}
```

**Notice.** `empty` and `failed` are different sentences. They were one boolean once, so an
unreachable server told the reader there was no streak yet.

`current` is a PLURAL, not a ternary on `=== 1` written in TypeScript. English has two forms and
Vietnamese has one; a ternary in a component forces every language through English's shape, and a
language with three forms would have nowhere to say so.

---

### 10.2 The contract — `src/components/contracts/shapes.ts`

```ts
"streak-strip": {
    classes: "flex flex-col gap-4 rounded-3xl bg-surface p-3 shadow-surface",
    children: {
        heading: { contract: "section-header" },   // [needs §7]
        body: { contract: "split" },               // [needs §7]
    },
    explain: "The record belongs on the title's baseline rather than beside the figure, because a reader comparing this week against their best is reading the heading, not the row.",
},

"track": {
    classes: "flex flex-row flex-wrap items-center gap-2",
    children: { body: { contract: "day-cell", isArray: 7 } },
    explain: "A fixed run of equal columns only reads as one span of time while the columns stay on one line, so the run wraps as a whole rather than letting a single day drop away from the six beside it.",
    element: "ul",
},
```

**Notice.** The key owns four things and the author types none of them: the classes, the host
element, the roles, and how many of each. `isArray: 7` is the count stated ONCE — the frame draws
seven resting columns from it, so the resting shape is the loaded one rather than a second shape
kept in step by hand.

`explain` is a REASON, never a restatement of the key. "Row of chips" only says the key again;
the sentence above is the fact that made the node exist.

The `children` map keys ARE the roles. There is no second list to keep in step, because declaring
a role and declaring its child were always one statement.

---

### 10.3 The chain — `src/components/contracts/chains/dashboard.ts`

```ts
export type DashboardSectionChain =
    | { name: "streak-strip"; body: ComponentType<StreakStripProps> }
    | { name: "identity-stats"; body: ComponentType<IdentityStatsProps> }
    | { name: "courses-progress"; body: ComponentType<MyCoursesProgressProps> }
```

**Notice.** The shape says a `split` takes a body and an aside. It cannot say the body is a WEEK
— that is what this says, and the compiler holds it: `StreakStripProps` is the only props type in
the union taking a `days` list, so a block that does not model seven columns cannot fill this
region.

Shapes are capped because they are a VOCABULARY. Chains are uncapped because they are a list of
what exists. A reader who finds the two counted differently is looking at the rule.

---

### 10.4 The atom — `src/components/atoms/DayCell/index.tsx`

```tsx
/** Props for {@link DayCell}. */
export interface DayCellProps {
    /** The narrow weekday letter under the dot, already localized. */
    weekday: string
    /** The full date, read out by assistive technology. */
    label: string
    /** Whether the learner was active that day. */
    isActive?: boolean
    /** Nothing to show yet - the column rests at its real size. */
    isLoading?: boolean
}

export const DayCell = ({ weekday, label, isActive = false, isLoading = false }: DayCellProps) => (
    <li data-part="day" data-active={isActive ? "true" : "false"}>
        …
    </li>
)

export const meta = { tier: "atom", name: "DayCell" } as const
```

**Notice.** No `className`, no `classNames`, no `style` — not because CSS is dangerous, but
because a caller who can restyle a node has become its second owner, and one structural node has
exactly one structural decision owner.

The appearance props are FINITE and named after behaviour (`isActive`), never after appearance
(`variant="green"`). The element is `<li>` because the `track` key that lays the run out renders
the `<ul>` around it.

Atoms are the one tier exempt from §2's two props: an atom draws a leaf, it has no state set and
no data of its own, and forcing `state`/`props` on it would wrap one string in two objects.

---

### 10.5 The frame — the only thing that takes children

```tsx
<Tree
    contract="track"
    isLoading={resting}
    slots={{ body: { render: Day, data: week } }}
/>
```

**Notice.** This is the ONLY `slots=` in the codebase's vocabulary. A repeating role takes a
`{ render, data }` pair rather than a component: `render` is passed UNCALLED because calling it
renders it and the frame must own when that happens; `data` is passed straight through because
data is already inert. Two fields, two opposite rules, and that is correct rather than an
inconsistency to smooth over.

One `render` rather than a list of components makes every item the same shape BY CONSTRUCTION.
There is no homogeneity rule to write because a heterogeneous run cannot be expressed.

Under §9's second reading this disappears too, and the frame takes the state instead of the
resting flag.

---

### 10.6 The composite — a named facade, no slots  `[needs §7]`

```tsx
/** Props for {@link SurfaceCard}. */
export type SurfaceCardProps =
    | { state: "resting"; props: SurfaceCardFrame }
    | { state: "empty";   props: SurfaceCardFrame & { message: string } }
    | { state: "ready";   props: SurfaceCardFrame & { body: DataValue } }

export const SurfaceCard = ({ state, props }: SurfaceCardProps) => (
    <Tree contract="surface-card" state={state} data={props} />
)

export const meta = { tier: "composite", name: "SurfaceCard", states: SURFACE_STATES } as const
```

**Notice.** One call to the interpreter and nothing else — that is the whole permitted content of
a facade. It keeps the NAME, which is what a stack trace and a DevTools tree lose when every node
reads `Tree`, and it owns no structural decision, which is what stopped the old `SurfaceCard`
being a second registry.

What it must never regain is `body: ContractSlot`. The moment a composite accepts a component it
is composing, and §1 has been worked around rather than followed.

---

### 10.7 The block, presentational half — `_StreakStrip`  `[today]`

```tsx
/** What the strip carries in EVERY state - its name does not change while it loads. */
export interface StreakStripFrame {
    heading: { label: string; record: string }
}

export type StreakStripProps =
    | { state: "resting"; props: StreakStripFrame & { restingLabel: string } }
    | { state: "empty";   props: StreakStripFrame & { message: string } }
    | { state: "failed";  props: StreakStripFrame & { message: string } }
    | { state: "ready";   props: StreakStripFrame & {
          days: ReadonlyArray<StreakStripDay>
          readout: { label: string; value: string }
      } }

export const _StreakStrip = ({ state, props }: StreakStripProps) => { … }

export const meta = { tier: "block", name: "StreakStrip", states: STREAK_STRIP_STATES } as const
```

**Notice.** Two props, and the type of the second is chosen by the first. `state="empty"` with a
`days` list does not compile; `state="ready"` without one does not compile either. That is what
"data rendered according to state" means when the compiler holds it rather than a comment.

`StreakStripFrame` is the data that does not vary. Repeating the heading once per state would
have been four copies of one sentence, and four copies drift.

No `isLoading`, no `isEmpty`. Two booleans can be written together, and the reader of that
combination has to invent an answer.

Under §9's second reading this body collapses to a single `<Tree contract="streak-strip"
state={state} data={props} />` and the block stops having a function body at all.

---

### 10.8 The block, connected half — `StreakStrip`  `[today]`

```tsx
"use client"

export const StreakStrip = () => {
    const t = useTranslations("streak")
    const weekly = useQueryMyWeeklyStatsSwr()
    const stats = weekly.data
    const heading = { label: t("heading"), record: t("longest", { count: stats?.longestStreak ?? 0 }) }

    // A FAILURE outranks a retry that reports itself as loading: SWR retries a rejected key on a
    // backoff and says `isLoading` on every attempt, so a strip reading the flag alone would
    // shimmer for as long as the backend was unreachable.
    if (weekly.error) {
        return <_StreakStrip state="failed" props={{ heading, message: t("failed") }} />
    }
    if (!stats && weekly.isLoading) {
        return <_StreakStrip state="resting" props={{ heading, restingLabel: t("loading") }} />
    }

    const days = (stats?.days ?? []).map(toStripDay)
    const streak = stats?.streak ?? 0
    if (!stats || (streak === 0 && !days.some((day) => day.active))) {
        return <_StreakStrip state="empty" props={{ heading, message: t("empty") }} />
    }

    return (
        <_StreakStrip
            state="ready"
            props={{ heading, days, readout: { label: t("currentLabel"), value: t("current", { count: streak }) } }}
        />
    )
}
```

**Notice.** This half decides the ONE thing nothing downstream can: which state the surface is in.
It reads the request, it reads the locale, and it hands the other half four strings and a list.

The four returns are the four states, in the order that resolves them — failure first, because a
reader looking at a refusal must not be told instead that data is on its way.

Date formatting lives here for the same reason the request does: both depend on who is looking,
and a component that renders already-resolved text can be mounted from a test without either.

---

### 10.9 The page

```tsx
export const _DashboardPage = ({ state, props }: DashboardPageProps) => { … }
```

**Notice.** A page composes blocks and owns screen-level state — here, whether there is a session
at all. It owns no request: every figure on screen belongs to a block that fetches it.

It answers the session question ONCE, before any request is made. Every query behind this screen
is auth-gated, and without a token they do not fail slowly, they fail forever — which is how a
signed-out dashboard ends up shimmering at a reader who is not waiting for anything.

The folder holds exactly two files. Anything reusable that appears there belongs to a lower tier.

---

### 10.10 The tests

```tsx
// Presentational half: no provider, no request, no locale. That is the point of the split.
render(<_StreakStrip state="empty" props={{ heading, message: "No streak yet" }} />)

// Connected half: the REAL catalogue above it.
renderWithIntl(<StreakStrip />)
```

**Notice.** The presentational half is rendered bare. If it needs a provider to render, the split
has failed and it is a connected component wearing an underscore.

The connected half is rendered against `src/messages/en.json` rather than a fixture. A fixture
keeps answering after a key is renamed, so the assertion stays green while the product renders the
raw key; reading the file the app reads makes that fail here, which is the only place it fails
cheaply.

Every source file has a twin test beside it — including the rule plugins, which are run by
`npm run test:rules`. A rule suite that no gate runs is a rule suite that can die silently, and
two registry rules did exactly that: `eslint .` stayed green while the parser they depend on had
stopped matching the registry it reads.
