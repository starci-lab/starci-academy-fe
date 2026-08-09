import type { TreeNodeSpec, TreeSlot } from "./roles"

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
 * wrong tree into a compile error - see {@link TreeSlots}.
 *
 * KEEP THIS SMALL. Twelve keys were the whole dashboard vocabulary, and the thirteenth -
 * `form` - was added for the one shape none of them could express: a submission whose
 * outcome line must sit BETWEEN its last control and its button. A fourteenth key is only
 * ever justified the same way, by a tree shape no existing key can hold - never by a caller
 * who wanted a different gap. The ceiling is mechanical, not advisory: the twin test and
 * `starci-fe/shapes-vocabulary-ceiling` both hold this file to at most sixteen keys.
 *
 * THIS FILE NAMES NO COMPONENT. It imports the role vocabulary beside it and nothing else,
 * which is what keeps it usable from every tier at once. A component type reached from here
 * would point the generic vocabulary at one screen.
 */

/**
 * The registry. Each key is a whole tree: its own classes plus the children it accepts.
 * `as const satisfies` keeps the literal key and role tuples (so the types below can be
 * derived from them) while still type-checking every entry against {@link TreeNodeSpec}.
 */
export const CLASS_NAMES = {
    "page-shell": {
        classes: "flex min-h-screen flex-col gap-6",
        roles: ["nav", "body"],
        explain: "The navigation must stay a sibling of the routed body rather than a parent of it, so a route change repaints the body without tearing down the nav.",
    },
    "shell-nav": {
        classes: "flex flex-row items-center gap-4",
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
        classes: "flex flex-col gap-6 lg:flex-row lg:items-start",
        roles: ["body", "aside"],
        explain: "The aside supports the body rather than competing with it, so it drops underneath at narrow widths instead of halving the reading measure of the body.",
    },
    "card": {
        classes: "flex flex-col gap-4 rounded-2xl border p-6",
        roles: ["heading", "body", "footer"],
        explain: "The border makes this a bounded surface, so its padding must be owned here - a child that paints its own edge inset would break the concentric radius of the corner.",
    },
    "card-header": {
        classes: "flex flex-row items-center gap-3",
        roles: ["media", "heading", "meta"],
        explain: "The thumbnail identifies the card faster than the title does, so it leads the line and the metadata trails it rather than wrapping to a second row.",
    },
    "list-row": {
        classes: "flex flex-row items-center gap-3 px-4 py-3",
        roles: ["media", "body", "action"],
        explain: "The row owns its own inset because the press target has to extend to the full width of the list, which it cannot do if the padding lives on the list instead.",
    },
    "stat": {
        classes: "flex flex-col gap-2",
        roles: ["meta", "body"],
        explain: "The label is read before the number and must never share its line, because a long label on a narrow tile would otherwise wrap between the number and its unit.",
    },
    "form-field": {
        classes: "flex flex-col gap-2",
        roles: ["heading", "field", "meta"],
        explain: "The hint sits under the control it explains so an error message can replace it in place, without the control moving down the page as the message appears.",
    },
    "form": {
        classes: "flex flex-col gap-6",
        roles: ["body", "meta", "action", "footer"],
        explain: "A submission is one unit, and the outcome line has to sit between the last control and the button: a rejected code must be read before the button can be pressed again, and the line holds a row of its own so the button never shifts under a pointer already resting on it.",
    },
    "empty-state": {
        classes: "flex flex-col items-center gap-4 p-8 text-center",
        roles: ["media", "heading", "action"],
        explain: "An empty region still has to offer a way out, so the recovery action is part of this node rather than something a caller remembers to add beside it.",
    },
} as const satisfies Record<string, TreeNodeSpec>

/**
 * Every key in the registry. An author types one of these and nothing else; a key that is
 * not in this union is a compile error at the call site.
 */
export type TreeKey = keyof typeof CLASS_NAMES

/**
 * The roles one key declares, as a union - derived from the registry, never written twice.
 */
export type TreeRolesOf<K extends TreeKey> = (typeof CLASS_NAMES)[K]["roles"][number]

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
export type TreeSlots<K extends TreeKey> = {
    readonly [R in TreeRolesOf<K>]: TreeSlot
}

/**
 * Read one entry widened to the shared {@link TreeNodeSpec} shape. Indexing the registry
 * with a generic key yields a union of entry types, and iterating a union of readonly
 * tuples is not something a caller should have to reason about - this resolves it once.
 *
 * @param name - The registry key to read.
 */
export const treeSpec = (name: TreeKey): TreeNodeSpec => CLASS_NAMES[name]

/**
 * The roles ONE key declares, kept at that key's own role type instead of the widened
 * `TreeRole` union.
 *
 * {@link treeSpec} widens on purpose, which is right for the classes and the reason but wrong
 * for the roles: a caller that walks the widened list can no longer index {@link TreeSlots} of
 * the same key with what it is holding, and the frame paid for that with a double cast. Read
 * through here, the role a caller has in hand is exactly a key the slots object declares, so
 * the lookup type-checks and nothing has to be asserted.
 *
 * @param name - The registry key to read.
 */
export const treeRoles = <K extends TreeKey>(name: K): ReadonlyArray<TreeRolesOf<K>> =>
    CLASS_NAMES[name].roles

/**
 * Every registry key, in declaration order. Exported so gates and tests can walk the whole
 * vocabulary instead of restating it.
 */
export const TREE_KEYS: ReadonlyArray<TreeKey> = Object.keys(CLASS_NAMES) as Array<TreeKey>

/**
 * The most keys this vocabulary may hold, stated once so the twin test and the lint rule
 * that both guard it cannot disagree about the number.
 *
 * It caps SHAPES ONLY. Chains are uncapped by design - one entry per composition that really
 * exists - so a reader who finds the two layers counted differently is looking at the rule,
 * not at a discrepancy to tidy away.
 */
export const TREE_KEY_CEILING = 16
