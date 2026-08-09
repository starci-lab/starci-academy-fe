# StarCi FE — the tier system and the registry spine

This file is the operative contract for `src/`. It says what each tier owns, the one question
that decides which tier a thing belongs to, and how the registry replaces what a pile of layout
frames used to do.

It states rules, not measurements. Counts of files, keys or call sites change hourly and belong
to the tools that count them, never to a document that would then be lying by tomorrow.

---

## 1. The tiers

```text
resources / modules / hooks
              |
              v
            atoms
              |
              v
            frames
              |
              v
         composites
              |
              v
            blocks
              |
              v
      pages / layouts / overlays
              |
              v
             app
```

**No lower tier imports a higher tier.** That single direction is what keeps a tier meaningful:
the moment `atoms` reaches for a block, "atom" stops describing anything.

Each tier is decided by ONE question. When a component is hard to place, the question is the
answer — not a vote on which folder feels right.

| Tier | Owns | The question that decides it |
|---|---|---|
| **atom** | one intrinsic visual or control behaviour; one vendor boundary; its own size, radius, focus and disabled behaviour; its own resting shape; finite appearance props | **Does it arrange anything?** An icon plus a label plus a hint is an arrangement — that is a composite. An atom is indivisible. |
| **frame** | structural grammar: direction, seam, measure, responsive visibility, landmark, pin/fill, shell topology | **Does it know what the content is?** If it does, it is the wrong tier. A frame moves boxes; it never reads them. |
| **composite** | a reusable semantic shape built from atoms and frames; finite semantic variants; typed slots | **Does it know the domain?** If it does, it is a block. A composite is a shape anyone can reuse. |
| **block** | a domain sentence: mapping data, state and actions into vocabulary; domain labels; finite branches | **Does it say how many pixels?** If it does, it is wrong. A block answers "what does this domain say", never "how far apart do these sit". |
| **page** | screen-level composition of blocks; screen-level state branches | **Does the folder hold exactly two files?** `component.tsx` and `index.tsx`. Anything reusable that appears there belongs to a lower tier. |
| **layout** | route-stable app topology — the bar, the body, the footer, and the pin/fill relationship between them | **Does it aggregate its children's APIs into its own?** If it does, it has become a funnel, and every child change now edits the layout. |
| **overlay** | interaction topology: modal, drawer, popover, command surface | **Does it accept an arbitrary `ReactNode` body?** If it does, it owns nothing. An overlay exposes typed slots and finite size contracts. |

### Non-UI

`resources/` holds copy, configuration and route metadata. `modules/` holds domain types, pure
functions and the request layer. `hooks/` holds fetching, state and orchestration. `app/` holds
framework and provider wiring.

None of them may return buildable JSX as data, make a visual chrome decision, or hide a reusable
helper inside a component folder.

---

## 2. The one-owner rule

> **One structural node has exactly one structural decision owner.**

Two owners on the same node is the defect this whole system exists to prevent: a gap set in one
place and a margin set in another produce a result neither author intended, and neither file
looks wrong on its own.

This is why an atom exposes no `className`, no `classNames` and no `style`. Not because CSS is
dangerous, but because a caller who can restyle a node has become its second owner.

---

## 3. The registry — what replaced the frames

A layout used to mean picking a frame, then a spacing token, then a gap, then deciding whether a
wrapper was needed. Four guesses per node, and two authors guessing differently produced two
different trees from the same intent.

The registry collapses all four into one decision: **the key**.

### Shapes

`src/components/contracts/shapes.ts` — the generic vocabulary. One key owns TWO things:

1. `classes` — the class string of the node itself
2. `roles` — the ordered contract for the children it accepts

A role says what a child DOES in the tree, never which component it is. That is the whole reason
one key can serve many unrelated screens: constrain a child by its concrete type and you need a
new key for every combination of children, until the vocabulary explodes and buys no consistency
at all.

A key may also declare its host `element`. A landmark such as `<nav>` is a structural fact about
the node, so the key owns it — an author who had to reach for the tag by hand would be deciding
structure the registry is meant to decide.

Shapes are **capped**. The ceiling is mechanical, held by both a test and a lint rule, and it
protects against the failure this registry exists to prevent: a key added because a caller wanted
a different gap, until nobody can hold the vocabulary in their head and the author is back to
guessing — at the KEY this time, which is worse, because a wrong key silently brings a wrong
child contract with it. Raise the ceiling only by writing out the keys first and justifying each
by a shape that genuinely repeats.

### Chains

`src/components/contracts/chains/` — named compositions. A chain pins WHICH component fills a
slot, as a discriminated union on `name`, so the wrong body is a compile error.

Chains are **uncapped by design**: one entry per composition that actually exists.

Strictness is **derived, not asserted**. A slot is `ComponentType<XxxProps>` with the props type
named after the shape, so the intended component is readable straight off the type. Branded
identity was considered and rejected: a brand has to be applied with an `as`, and an assertion
records who labelled a thing rather than what it is.

### Two rules keep the layers apart

- Inside the registry folder, only `import type` is allowed. A value import there would invert
  the tier order and build a real cycle while the type checker stayed green.
- The ceiling applies to shapes only. A reader who finds the two layers counted differently is
  looking at the rule, not at a discrepancy to tidy away.

### The frame tier is now one component

`Tree` takes the key as its `contract` prop and renders it. It owns no class of its own, adds no
wrapper around a slot, and threads the resting flag to every slot from one place.

That last point retires a whole family of patterns: a wrapper component whose job was to switch
between a loaded tree and a skeleton tree. One shape, one tree, a flag.

---

## 4. Resting, empty and failed

`isLoading` means **there is nothing to show yet** — the first load, no data in hand.

It does NOT mean a request is in flight. A revalidation on focus has data on screen already, and
treating that as loading makes the whole page flash skeletons every time a tab regains focus.

**Empty is not loading.** A request that settled with nothing is an answer, and it renders the
designed empty state. A skeleton that spins forever tells the reader "wait" when the honest
answer is "this could not load" — and a signed-out visitor seeing that is not an edge case, it is
the most common first view a product has.

A failed request settles the same way: into a designed state, never into shimmer.

---

## 5. What this system does NOT guarantee

Written down deliberately, because a rule set that hides its own gaps is worse than one with
fewer rules.

- **It enforces at the source, not at the render.** Every rule here reads imports, props and
  string literals. None of them looks at the DOM a reader actually receives. A tree can pass
  every gate and still be visually wrong, and that has happened.
- **A node with no class is as unowned as a node with a bad one.** The rules scan class strings;
  markup that carries no class at all is invisible to them.
- **A repeating role has no expression yet.** A list of N items falls outside the registry, so
  the nodes inside it are described by nobody.
- **The ceiling counts keys, not duplicates.** Two keys with identical classes and different
  roles pass the count and are exactly the drift the cap was meant to catch.

---

## 6. Working here

- Structure comes from a registry key rendered through `Tree`. Never a hand-written structural
  host.
- The vendor kit is imported at the atom tier and nowhere else.
- Headings come from the `Heading` atom with a `level`, so the document outline and the visual
  order cannot drift apart.
- Icons are sized by class and inherit their colour from the parent's text colour.
- Every source file has a twin test beside it.
- Do not build a surface that has no data behind it. A dead end or an invented number is worse
  than an honest gap — report it instead.
