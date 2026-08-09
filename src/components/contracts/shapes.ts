import type { ContractSpec, ContractSlot } from "./roles"

/**
 * THE NAMED REGISTRY - SHAPES (replaces the old `principle` token union).
 *
 * The retired `PrincipleToken` described ONE node: a token resolved to a gap step and
 * nothing else, so the author still decided what went inside the node, how many children
 * there were, and whether a wrapper was needed. Every one of those decisions was a guess.
 *
 * A registry entry here describes a DOM TREE instead. One key owns two things at once:
 *
 *   1. `classes` - the class string of the node itself, and
 *   2. `roles`   - the ordered CONTRACT for the children that node accepts.
 *
 * The owner's example reads directly: `content-row` is `flex flex-row items-center gap-2`
 * AND its children are exactly a `field` and an `action`, in that order.
 *
 * WHY ROLES AND NOT CONCRETE COMPONENT TYPES. Constraining a child by its concrete type
 * ("this key takes Button + Input") forces a new key for every children-combination -
 * `content-row`, `content-row-with-icon`, `content-row-two-actions` - and the vocabulary
 * explodes until the registry buys no consistency at all. A ROLE is the smallest thing a
 * layout actually needs to know about a child, so nine roles cover every key below.
 *
 * WHAT A SHAPE THEREFORE CANNOT SAY, AND WHO SAYS IT. A role constrains the SHAPE of a tree
 * and nothing else, so two call sites of `section` may put entirely unrelated components in
 * the same `body`. That is not a defect to be fixed by adding keys - it is the price of a
 * vocabulary that stays learnable. The complement lives in `./chains/`: a chain names ONE
 * real composition and pins its slot to `ComponentType<XxxProps>`, so the intended component
 * is readable straight off the type. Shapes stay capped; chains are uncapped by design,
 * because there is one chain entry per composition that actually exists.
 *
 * WHAT THE AUTHOR TYPES: the key. Nothing else. No class, no gap step, no decision about
 * whether a wrapper is needed, no guess about which children belong. TypeScript turns a
 * wrong tree into a compile error - see {@link ContractSlots}.
 *
 * KEEP THIS SMALL. Twelve keys were the whole dashboard vocabulary, and the thirteenth -
 * `form` - was added for the one shape none of them could express: a submission whose
 * outcome line must sit BETWEEN its last control and its button. The fifteenth, `track`, was
 * added for the second: a RUN of equal columns - the seven days of a streak - which is one
 * node with many children rather than a node with named roles, and which no key here could
 * hold without inventing a role per column. A sixteenth is only ever justified the same way,
 * by a tree shape no existing key can hold - never by a caller who wanted a different gap.
 * The ceiling is mechanical, not advisory: the twin test and
 * `starci-fe/shapes-vocabulary-ceiling` both hold this file to at most sixteen keys.
 *
 * THIS FILE NAMES NO COMPONENT. It imports the role vocabulary beside it and nothing else,
 * which is what keeps it usable from every tier at once. A component type reached from here
 * would point the generic vocabulary at one screen.
 */

/**
 * The registry. Each key is a whole tree: its own classes plus the children it accepts.
 * `as const satisfies` keeps the literal key and role tuples (so the types below can be
 * derived from them) while still type-checking every entry against {@link ContractSpec}.
 */
export const CONTRACTS = {
    "page-shell": {
        classes: "mx-auto flex min-h-screen w-full max-w-app-lg flex-col gap-6 px-4 py-6",
        roles: ["nav", "body"],
        explain: "The navigation must stay a sibling of the routed body rather than a parent of it, so a route change repaints the body without tearing down the nav - and the measure is set here because a reading column that runs the full width of a desktop screen cannot be scanned at all.",
    },
    "shell-nav": {
        classes: "flex flex-row flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface px-4 py-3 shadow-surface",
        roles: ["action"],
        explain: "Route-level navigation is a landmark a screen reader jumps to, so it renders as <nav> rather than as a div that merely looks like one - and the key owns that, because an author who had to pick the tag by hand would be picking structure the registry is supposed to decide.",
        element: "nav",
    },
    "page-header": {
        classes: "flex flex-row flex-wrap items-center justify-between gap-4",
        roles: ["heading", "action"],
        explain: "The page action stays on the title line so it is reachable before any scrolling, and wraps to its own line rather than squeezing the title.",
    },
    "section": {
        classes: "flex flex-col gap-4",
        roles: ["heading", "body"],
        explain: "The seam here is the only thing telling a reader that the content below belongs to this heading and not to the section above it.",
    },
    "section-header": {
        classes: "flex flex-row flex-wrap items-baseline gap-2",
        roles: ["heading", "meta"],
        explain: "The count reads as part of the heading sentence, so it sits on the baseline of the title and wraps under it instead of pushing the title narrow.",
    },
    "content-row": {
        classes: "flex flex-row items-center gap-2",
        roles: ["field", "action"],
        explain: "The control acts on the input beside it, so the two must read as one unit - far enough apart to be separately pressable, close enough that nothing else can fall between them.",
    },
    "split": {
        classes: "flex flex-col gap-8 md:flex-row md:items-start md:[&>*:first-child]:min-w-0 md:[&>*:first-child]:grow md:[&>*:last-child]:w-72 md:[&>*:last-child]:shrink-0",
        roles: ["body", "aside"],
        explain: "The aside supports the body rather than competing with it, so it drops underneath at narrow widths instead of halving the reading measure of the body - and it takes a fixed width rather than an equal share, because a supporting rail that grows with the window is a rail competing again.",
    },
    "card": {
        classes: "flex flex-col gap-4 rounded-2xl bg-surface p-4 shadow-surface",
        roles: ["heading", "body", "footer"],
        explain: "The border makes this a bounded surface, so its padding must be owned here - a child that paints its own edge inset would break the concentric radius of the corner.",
    },
    "surface-card": {
        classes: "flex flex-col gap-4 rounded-2xl bg-surface p-4 shadow-surface",
        roles: ["heading", "body"],
        explain: "A bounded surface whose content ENDS with its body: the seam under the title and the inset around both are what make the region read as one object, and there is no closing row here for a footer to be the last thing a reader passes on the way out.",
    },
    "card-header": {
        classes: "flex flex-row items-center gap-3 [&>*:nth-child(2)]:min-w-0 [&>*:nth-child(2)]:grow",
        roles: ["media", "heading", "meta"],
        explain: "The glyph identifies the row faster than its name does, so it leads the line and the fact trails it - and the name in between takes the slack, because a long one has to clip rather than push the figure off the end of the row.",
    },
    "key-value-row": {
        classes: "flex flex-row flex-wrap items-baseline justify-between gap-3",
        roles: ["heading", "meta"],
        explain: "A named fact with no glyph to lead it: the two halves are pushed to opposite ends so a column of them lines its values up, and they share a baseline so a value that wraps drops under itself rather than under its own name.",
    },
    "stack": {
        classes: "flex flex-col gap-4",
        roles: ["body"],
        explain: "A run of peers with nothing naming it - controls, paragraphs, cards - held at one seam so the group reads as a group; without it a caller with no heading to give would have to reach for a key that demands one and pass it something empty.",
    },
    "list-row": {
        classes: "flex flex-row items-center gap-3 rounded-xl px-4 py-3",
        roles: ["media", "body", "action"],
        explain: "The row owns its own inset because the press target has to extend to the full width of the list, which it cannot do if the padding lives on the list instead.",
    },
    "stat": {
        classes: "flex flex-col gap-2 rounded-2xl bg-surface p-4 shadow-surface",
        roles: ["meta", "body"],
        explain: "The label is read before the number and must never share its line, because a long label on a narrow tile would otherwise wrap between the number and its unit - and the tile is bounded so that a figure and the label above it read as one fact rather than as two lines of a list.",
    },
    "track": {
        classes: "flex flex-row flex-wrap items-center gap-2",
        roles: ["body"],
        explain: "A fixed run of equal columns only reads as one span of time while the columns stay on one line, so the run wraps as a whole here rather than letting a single day drop away from the six beside it.",
        element: "ul",
    },
    "grid": {
        classes: "grid grid-cols-1 gap-4 sm:grid-cols-2",
        roles: ["body"],
        explain: "Cards of the same kind are compared against each other rather than read in order, so they sit side by side once there is room and fall to one column when a card would be narrower than the sentence inside it.",
    },
    "form-field": {
        classes: "flex flex-col gap-2",
        roles: ["heading", "field", "meta"],
        explain: "The hint sits under the control it explains so an error message can replace it in place, without the control moving down the page as the message appears.",
    },
    "form": {
        classes: "flex w-full max-w-sm flex-col gap-6",
        roles: ["body", "meta", "action", "footer"],
        explain: "A submission is one unit, and the outcome line has to sit between the last control and the button: a rejected code must be read before the button can be pressed again, and the line holds a row of its own so the button never shifts under a pointer already resting on it.",
    },
    "empty-state": {
        classes: "flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center shadow-surface",
        roles: ["media", "heading", "action"],
        explain: "An empty region still has to offer a way out, so the recovery action is part of this node rather than something a caller remembers to add beside it.",
    },
} as const satisfies Record<string, ContractSpec>

/**
 * Every key in the registry. An author types one of these and nothing else; a key that is
 * not in this union is a compile error at the call site.
 */
export type ContractKey = keyof typeof CONTRACTS

/**
 * The roles one key declares, as a union - derived from the registry, never written twice.
 */
export type ContractRolesOf<K extends ContractKey> = (typeof CONTRACTS)[K]["roles"][number]

/**
 * The slots object a key demands: exactly one component per declared role.
 *
 * This is where a wrong tree becomes a COMPILE ERROR rather than a rendering surprise:
 * a MISSING role fails because the mapped type makes every declared role required; an
 * EXTRA or UNKNOWN role fails because the object literal carries a property the mapped
 * type does not declare. The author cannot invent a child the key never agreed to.
 *
 * What it does NOT decide is WHICH component fills a role - that is the chain's job, and
 * the two constraints are meant to be read together.
 */
export type ContractSlots<K extends ContractKey> = {
    readonly [R in ContractRolesOf<K>]: ContractSlot
}

/**
 * Read one entry widened to the shared {@link ContractSpec} shape. Indexing the registry
 * with a generic key yields a union of entry types, and iterating a union of readonly
 * tuples is not something a caller should have to reason about - this resolves it once.
 *
 * @param name - The registry key to read.
 */
export const contractSpec = (name: ContractKey): ContractSpec => CONTRACTS[name]

/**
 * The roles ONE key declares, kept at that key's own role type instead of the widened
 * `ContractRole` union.
 *
 * {@link contractSpec} widens on purpose, which is right for the classes and the reason but wrong
 * for the roles: a caller that walks the widened list can no longer index {@link ContractSlots} of
 * the same key with what it is holding, and the frame paid for that with a double cast. Read
 * through here, the role a caller has in hand is exactly a key the slots object declares, so
 * the lookup type-checks and nothing has to be asserted.
 *
 * @param name - The registry key to read.
 */
export const contractRoles = <K extends ContractKey>(name: K): ReadonlyArray<ContractRolesOf<K>> =>
    CONTRACTS[name].roles

/**
 * Every registry key, in declaration order. Exported so gates and tests can walk the whole
 * vocabulary instead of restating it.
 */
export const CONTRACT_KEYS: ReadonlyArray<ContractKey> = Object.keys(CONTRACTS) as Array<ContractKey>

/**
 * The most keys this vocabulary may hold, stated once so the twin test and the lint rule
 * that both guard it cannot disagree about the number.
 *
 * It caps SHAPES ONLY. Chains are uncapped by design - one entry per composition that really
 * exists - so a reader who finds the two layers counted differently is looking at the rule,
 * not at a discrepancy to tidy away.
 *
 * RAISED 16 -> 23, deliberately and once, to finish porting the dashboard from the original
 * app. The seven keys it buys are each a shape that genuinely REPEATS and that no existing key
 * expresses: stack, tab-strip, checklist-row, identity-card, card-body-flush, toolbar,
 * meter-row. Not one of them is a variant of another - "a caller wanted it to look slightly
 * different" would have been the wrong reason, and is the reason this ceiling exists to refuse.
 *
 * The number is a ceiling, not a target. Raise it again only the same way: write the list of
 * keys out first, justify each by the shape it holds, and change the number knowingly. A
 * vocabulary nobody can hold in their head sends an author back to guessing - at the KEY this
 * time instead of at the gap, which is worse, because a wrong key silently brings a wrong
 * child contract with it.
 */
export const CONTRACT_CEILING = 23
