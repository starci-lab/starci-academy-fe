/**
 * THE REGISTRY.
 *
 * One entry describes ONE node: the classes it wears, and why the things inside it sit that way.
 * Nothing else. What goes inside is the assembling branch's business, and a run of leaves is a
 * leaf that keeps its own count.
 *
 * A KEY'S NAME MUST FIX ITS CHILDREN. `card` is not a name here - it says nothing about what goes
 * inside, so anything can, and the entry stops constraining anything. `title-with-baseline-fact`
 * says what it holds, so a wrong child is visible on sight. It is also what keeps `why` honest: a
 * key drawing twenty regions cannot say why any one of them is there, but the reason a title and
 * a fact share a baseline is the SAME reason at all twenty.
 *
 * POSITIONAL SELECTORS ARE ACCEPTED HERE, and only here. Naming a child instead of counting to it
 * would be better, and it died with the children map. The objection stands - insert something in
 * the middle and `nth-child(2)` is silently wrong - but the children now come from ONE branch, so
 * whoever inserts one is looking at this file beside it.
 */

/**
 * The closed set of classes a node may lay its children out with.
 *
 * `gap-[13px]` is not forbidden - it is UNREPRESENTABLE, because it is not a member. That single
 * property is what makes a whole family of patrol rules unnecessary: there is nothing to police
 * when the bad value cannot be typed.
 */
export type LayoutClassName =
    | "flex" | "grid" | "flex-col" | "flex-row" | "flex-wrap"
    | "items-center" | "items-baseline" | "items-start"
    | "justify-between" | "justify-center" | "[&>*]:w-full"
    | "gap-2" | "gap-3" | "gap-4" | "gap-6" | "gap-8"
    | "grid-cols-1" | "sm:grid-cols-2"
    | "md:flex-row" | "md:items-start"
    | "mx-auto" | "min-h-screen" | "w-full" | "max-w-app-lg" | "max-w-sm"
    | "px-4" | "py-3" | "py-6" | "p-4" | "p-6"
    | "rounded-xl" | "rounded-2xl"
    | "bg-surface" | "shadow-surface" | "text-center"
    | "[&>*:nth-child(2)]:min-w-0" | "[&>*:nth-child(2)]:grow"
    | "md:[&>*:first-child]:min-w-0" | "md:[&>*:first-child]:grow"
    | "md:[&>*:last-child]:w-72" | "md:[&>*:last-child]:shrink-0"
    | "md:[&>*:first-child]:w-72" | "md:[&>*:first-child]:shrink-0"
    | "md:[&>*:last-child]:min-w-0" | "md:[&>*:last-child]:grow"
    | "md:[&>*:first-child]:sticky" | "md:[&>*:first-child]:top-6"
    | "md:[&>*:first-child]:self-start" | "md:[&>*:first-child]:max-h-rail"
    | "md:[&>*:first-child]:overflow-y-auto"

/** One registry entry: a node's own classes, and why what it holds sits that way. */
export interface ContractSpec {
    /** The class string of the node itself. Not a prop, not reachable by a caller. */
    readonly classes: ReadonlyArray<LayoutClassName>
    /**
     * Why the children of this node sit the way they do, in one sentence.
     *
     * A REASON, never a restatement of the key: "a row of chips" only says the key again; "the
     * tags wrap onto their own line before the title does" is the fact that made the node exist.
     */
    readonly why: string
}

/**
 * Build the registry.
 *
 * A function rather than a bare literal so the keys are checked in one place and stay literal
 * without an `as const` at the call site.
 */
const buildContracts = <const T extends { readonly [K in keyof T]: ContractSpec }>(contracts: T): T =>
    contracts

/**
 * The registry. Every node the design layer may draw, and the reason each one holds its children
 * the way it does.
 *
 * KEEP THE NAMES CHILD-FIXING. A key whose name does not say what belongs inside it stops
 * constraining anything, and its `why` decays into a label the moment a second screen uses it.
 */
export const CONTRACTS = buildContracts({
    "nav-over-body-page": {
        classes: ["mx-auto", "flex", "min-h-screen", "w-full", "max-w-app-lg", "flex-col", "gap-6", "px-4", "py-6"],
        why: "The navigation stays a sibling of the routed body rather than a parent of it, so a route change repaints the body without tearing the nav down - and the measure is set here because a reading column running the full width of a desktop screen cannot be scanned at all.",
    },
    "title-with-end-action": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4"],
        why: "The control sits at the far end of the title's line so the eye finds the name first and the action second, and it drops under the title rather than squeezing it when the line runs out.",
    },
    "title-with-baseline-fact": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "gap-2"],
        why: "The fact reads as part of the heading sentence, so it sits on the title's baseline and wraps under it instead of pushing the title narrow.",
    },
    "heading-over-body": {
        classes: ["flex", "flex-col", "gap-4"],
        why: "The seam here is the only thing telling a reader that the content below belongs to this heading and not to the one above it.",
    },
    "stacked-sections": {
        classes: ["flex", "flex-col", "gap-4"],
        why: "Sections read as separate objects only while the space between them is larger than the space inside any of them.",
    },
    "body-with-fixed-aside": {
        classes: ["flex", "flex-col", "gap-8", "md:flex-row", "md:items-start", "md:[&>*:first-child]:min-w-0", "md:[&>*:first-child]:grow", "md:[&>*:last-child]:w-72", "md:[&>*:last-child]:shrink-0"],
        why: "The aside drops underneath at a narrow width instead of halving the room the body needs, and it is pinned rather than proportional because a supporting column that shrinks with the window stops being readable before the body does.",
    },
    "label-row-over-card": {
        classes: ["flex", "flex-col", "gap-3"],
        why: "The label is held OUTSIDE the surface it names, so a section whose content is itself a set of cards never draws a card inside a card - and the seam is tighter than the seam between sections, because the label and the surface under it are one object.",
    },
    "bounded-content-card": {
        classes: ["flex", "flex-col", "gap-4", "rounded-2xl", "bg-surface", "p-4", "shadow-surface"],
        why: "The inset and the raised ground are the whole of what makes a run of content read as one bounded object, now that the name of it sits above rather than within.",
    },
    "glyph-title-fact-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        why: "The glyph identifies the row faster than its name does, so it leads the line and the fact trails it - and the name between them takes the slack, because a long one must clip rather than push the figure off the end of the row.",
    },
    "glyph-body-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "rounded-xl", "px-4", "py-3"],
        why: "A row a reader can act on needs its own inset so the press target is the row and not the words inside it.",
    },
    "label-value-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-3"],
        why: "The label and its figure sit at opposite ends of one line so a column of them reads as a table without being one, and they share a baseline so the figure does not float against its own name.",
    },
    "label-over-figure-tile": {
        classes: ["flex", "flex-col", "gap-2", "rounded-2xl", "bg-surface", "p-4", "shadow-surface"],
        why: "The label reads first and small, the figure second and large, because a reader scanning a row of these is comparing figures and needs the names only to know which is which.",
    },
    "two-column-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2"],
        why: "Two columns is the widest a set of peer objects can go before the eye stops reading them as a set, and one column below that width because a half-width card holds nothing.",
    },
    "label-field-hint": {
        classes: ["flex", "flex-col", "gap-2"],
        why: "The hint belongs under the control it explains rather than beside the label, because a reader reaches the hint after failing at the control and not before trying it.",
    },
    "form-column": {
        classes: ["flex", "w-full", "max-w-sm", "flex-col", "gap-6"],
        why: "A form is read one control at a time, so the measure is narrow on purpose and the seam between controls is wider than the seam inside any of them.",
    },
    "brand-links-then-tools-bar": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4", "px-4", "py-3"],
        why: "The mark and the routes read left because that is where a reader looks to learn where they are; the tools read right because that is where they look to change something - and the bar wraps rather than letting either group fall off a narrow screen.",
    },
    "inline-nav-links": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-6"],
        why: "Route names sit further apart than words in a sentence, because each is a separate destination and a reader must be able to aim at one without hitting its neighbour.",
    },
    "inline-tool-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2"],
        why: "Icon controls sit tighter than named routes: they are a set of tools rather than a set of destinations, and the tight seam is what makes them read as one group.",
    },
    "underlined-tab-strip": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-6", "px-4"],
        why: "Tabs share the bar's inset so the selected one lines up under the route that led here, and they wrap as a whole rather than letting one choice drop away from the set it belongs to.",
    },
    "rail-then-main": {
        classes: ["flex", "flex-col", "gap-8", "md:flex-row", "md:items-start", "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0", "md:[&>*:first-child]:sticky", "md:[&>*:first-child]:top-6", "md:[&>*:first-child]:self-start", "md:[&>*:first-child]:max-h-rail", "md:[&>*:first-child]:overflow-y-auto", "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow"],
        why: "The rail is pinned in width and STAYS while the column beside it scrolls, because it holds who the reader is and where they can go - facts that do not stop being true a screenful down - and a rail that shrank with the window would clip its own labels before the content beside it became hard to read. Below the breakpoint it moves above rather than halving the column, where sticking it would cost a phone most of its screen.",
    },
    "centred-page-column": {
        classes: ["mx-auto", "flex", "w-full", "max-w-sm", "flex-col", "gap-6", "py-6"],
        why: "A surface read one control at a time is centred and narrow on purpose: a form that runs the width of a desktop screen makes the eye travel between a label and the box it names.",
    },
    "centred-title-pair": {
        classes: ["flex", "flex-col", "gap-2", "items-center", "text-center"],
        why: "The supporting line sits under the title rather than beside it, because it explains the title rather than qualifying it - and both are centred so the pair reads as the surface's own name rather than as the first row of its content.",
    },
    "stacked-peer-controls": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        why: "Controls of the same kind repeat down one column, and the seam between them is tighter than the seam between groups, so a reader can tell a run of peers from two separate decisions.",
    },
    "spread-choice-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        why: "A choice and the way out of it are pushed to opposite ends of one line, because they are peers that a reader picks BETWEEN rather than a label and the thing it names.",
    },
    "centred-prompt-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-center", "gap-2"],
        why: "A question and its answer read as one sentence, so they share a line and are centred together - split across two lines they read as two separate offers.",
    },
    "centred-empty-notice": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "rounded-2xl", "bg-surface", "p-6", "text-center", "shadow-surface"],
        why: "An empty region still has to offer a way out, so the recovery action is part of this node rather than something a caller remembers to add beside it.",
    },
})

/** Every key in the registry. A key not in this union is a compile error at the call site. */
export type ContractKey = keyof typeof CONTRACTS

/**
 * Read one entry, widened to the shared shape.
 *
 * @param name - The registry key to read.
 */
export const contractSpec = (name: ContractKey): ContractSpec => CONTRACTS[name]

/** Every registry key, in declaration order, so gates and tests can walk the vocabulary. */
export const CONTRACT_KEYS: ReadonlyArray<ContractKey> = Object.keys(CONTRACTS) as Array<ContractKey>
