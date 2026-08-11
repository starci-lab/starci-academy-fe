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
    | "flex" | "grid" | "flex-col" | "flex-row" | "flex-wrap" | "overflow-hidden"
    | "items-center" | "items-baseline" | "items-start"
    | "justify-between" | "justify-center" | "[&>*]:w-full"
    | "gap-1" | "gap-2" | "gap-3" | "gap-4" | "gap-6" | "gap-8"
    | "grid-cols-1" | "sm:grid-cols-2"
    | "md:flex" | "md:flex-row" | "md:items-start"
    | "mx-auto" | "min-h-screen" | "w-full" | "min-w-0" | "grow" | "flex-1" | "hidden" | "max-w-app-lg" | "max-w-6xl" | "max-w-sm"
    | "h-16" | "min-h-16" | "sticky" | "top-0" | "top-16" | "z-40" | "z-50"
    | "border-b" | "border-separator" | "divide-y" | "bg-background"
    | "px-3" | "px-4" | "px-6" | "py-3" | "py-6" | "p-4" | "p-6"
    | "rounded-xl" | "rounded-2xl" | "rounded-3xl"
    | "bg-surface" | "shadow-surface" | "text-center"
    | "[&>*:nth-child(2)]:min-w-0" | "[&>*:nth-child(2)]:grow"
    | "md:[&>*:first-child]:min-w-0" | "md:[&>*:first-child]:grow"
    | "md:[&>*:last-child]:w-72" | "md:[&>*:last-child]:shrink-0"
    | "md:[&>*:first-child]:w-72" | "md:[&>*:first-child]:shrink-0"
    | "md:[&>*:last-child]:min-w-0" | "md:[&>*:last-child]:grow"
    | "md:[&>*:first-child]:sticky" | "md:[&>*:first-child]:top-6"
    | "md:[&>*:first-child]:self-start" | "md:[&>*:first-child]:max-h-rail"
    | "md:[&>*:first-child]:overflow-y-auto"

/** Literal values a contract may require from a child component's data props. */
export type ContractPropValue = string | number | boolean | null

/** A child appears once unless it explicitly declares a repeated run and its resting count. */
export type ContractChildCardinality =
    | { readonly repeats?: false, readonly restingCount?: never }
    | { readonly repeats: true, readonly restingCount: number }

/** One named child slot: either a leaf identity or another closed contract identity. */
export type ContractChildSpec = ContractChildCardinality & {
    readonly leaf?: string | ReadonlyArray<string>
    readonly contract?: string | ReadonlyArray<string>
    readonly props?: Readonly<Record<string, ContractPropValue>>
    readonly optional?: boolean
}

type ChildProps<S> = S extends { readonly props?: infer P }
    ? P extends Readonly<Record<string, ContractPropValue>> ? P : Readonly<Record<never, never>>
    : Readonly<Record<never, never>>

type ContractChild<S> = S extends { readonly contract: infer K }
    ? (K extends ReadonlyArray<infer A> ? A : K) extends infer C extends ContractKey
        ? import("@/components/contracts/props").ContractComponent<C>
        : never
    : never

type LeafChild<S> = S extends { readonly leaf: infer N }
    ? (N extends ReadonlyArray<infer A> ? A : N) extends infer L extends string
        ? import("@/components/contracts/props").LeafComponent<L, ChildProps<S>>
        : never
    : never

type OneChild<S> = ContractChild<S> | LeafChild<S>

type ChildValue<S> = S extends { readonly repeats: true }
    ? ReadonlyArray<OneChild<S>>
    : OneChild<S>

type RequiredChildNames<K extends ContractKey> = {
    [S in keyof (typeof CONTRACTS)[K]["children"]]:
        (typeof CONTRACTS)[K]["children"][S] extends { readonly optional: true } ? never : S
}[keyof (typeof CONTRACTS)[K]["children"]]

type OptionalChildNames<K extends ContractKey> = Exclude<
    keyof (typeof CONTRACTS)[K]["children"],
    RequiredChildNames<K>
>

/** The exact named render record admitted by one contract key. */
export type ChildrenOf<K extends ContractKey> = {
    readonly [S in RequiredChildNames<K>]: ChildValue<(typeof CONTRACTS)[K]["children"][S]>
} & {
    readonly [S in OptionalChildNames<K>]?: ChildValue<(typeof CONTRACTS)[K]["children"][S]>
}

/** One registry entry: a node's own classes, and why what it holds sits that way. */
export interface ContractSpec {
    /** The class string of the node itself. Not a prop, not reachable by a caller. */
    readonly classes: ReadonlyArray<LayoutClassName>
    /** Named child grammar. No anonymous `children` hole exists in a contract. */
    readonly children: Readonly<Record<string, ContractChildSpec>>
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
        classes: ["flex", "min-h-screen", "w-full", "flex-col"],
        children: {
            navigation: { contract: "double-navbar" },
            body: { leaf: "page" },
        },
        why: "The navigation stays a sibling of the routed body rather than a parent of it, so a route change repaints the body without tearing the nav down - and the measure is set here because a reading column running the full width of a desktop screen cannot be scanned at all.",
    },
    "title-with-end-action": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4"],
        children: {
            title: { leaf: "heading" },
            end: { leaf: ["button", "see-more-link"], optional: true },
        },
        why: "The control sits at the far end of the title's line so the eye finds the name first and the action second, and it drops under the title rather than squeezing it when the line runs out.",
    },
    "title-with-baseline-fact": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "gap-2"],
        children: {
            title: { leaf: "heading" },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "The fact reads as part of the heading sentence, so it sits on the title's baseline and wraps under it instead of pushing the title narrow.",
    },
    "heading-over-body": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            heading: { contract: ["underlined-tab-strip", "title-with-end-action"] },
            body: { contract: ["title-with-end-action", "rail-then-main"] },
            continuation: { contract: "rail-then-main", optional: true },
        },
        why: "The seam here is the only thing telling a reader that the content below belongs to this heading and not to the one above it.",
    },
    "stacked-sections": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            section: { contract: "label-row-over-card", repeats: true, restingCount: 0 },
        },
        why: "Sections read as separate objects only while the space between them is larger than the space inside any of them.",
    },
    "dashboard-tabs-over-body": {
        classes: ["flex", "w-full", "flex-col"],
        children: {
            tabs: { contract: "underlined-tab-strip" },
            body: { contract: "dashboard-rail-then-main" },
        },
        why: "The section tabs sit flush beneath the global navigation while the dashboard body keeps its own centred measure, matching the product shell without making the page title a second navigation layer.",
    },
    "dashboard-rail-then-main": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-8", "px-6", "py-6", "md:flex-row", "md:items-start", "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0", "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow"],
        children: {
            rail: { contract: "dashboard-rail" },
            main: { contract: ["dashboard-main", "centred-empty-notice"] },
        },
        why: "The learner rail keeps the product's fixed 288px reading width beside a flexible main column, then stacks above it on a narrow screen without becoming a card or a sticky viewport of its own.",
    },
    "dashboard-rail": {
        classes: ["flex", "w-full", "flex-col", "gap-4"],
        children: {
            section: { contract: ["stacked-peer-controls", "label-row-over-card"], repeats: true, restingCount: 2 },
        },
        why: "Identity facts and quick destinations form one bare 288px rail, so their labels align without an enclosing surface that would make the rail compete with the content cards.",
    },
    "dashboard-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            section: { contract: "label-row-over-card", repeats: true, restingCount: 4 },
        },
        why: "Dashboard sections repeat at the product's 24px seam so each labelled surface reads as a separate part of the learner's overview rather than one long card.",
    },
    "body-with-fixed-aside": {
        classes: ["flex", "flex-col", "gap-8", "md:flex-row", "md:items-start", "md:[&>*:first-child]:min-w-0", "md:[&>*:first-child]:grow", "md:[&>*:last-child]:w-72", "md:[&>*:last-child]:shrink-0"],
        children: {
            body: { leaf: "streak-week-run" },
            aside: { leaf: "stat-row" },
        },
        why: "The aside drops underneath at a narrow width instead of halving the room the body needs, and it is pinned rather than proportional because a supporting column that shrinks with the window stops being readable before the body does.",
    },
    "label-row-over-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            label: { contract: ["title-with-end-action", "title-with-baseline-fact"] },
            body: { contract: "$content" },
        },
        why: "The label is held OUTSIDE the surface it names, so a section whose content is itself a set of cards never draws a card inside a card - and the seam is tighter than the seam between sections, because the label and the surface under it are one object.",
    },
    "empty-notice-card": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            notice: { leaf: "empty-notice" },
        },
        why: "The recovery notice needs one bounded ground beneath the section label so its message and way out read as the section's answer rather than as another section beside it.",
    },
    "resume-item-card": {
        classes: ["flex", "flex-col", "gap-4", "rounded-2xl", "bg-surface", "p-4", "shadow-surface"],
        children: {
            kind: { leaf: "text", props: { size: "sm", tone: "muted" } },
            title: { leaf: "text", props: { size: "sm", weight: "medium" } },
            resume: { leaf: "see-more-link", optional: true },
        },
        why: "The kind, title and way back into one lesson share a bounded ground because none identifies the resumable item without the other two.",
    },
    "daily-quest-card": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            tasks: { contract: "stacked-peer-controls" },
            outcome: { leaf: ["text", "button"] },
        },
        why: "The day's task run and its reward outcome share a bounded ground because the outcome only has meaning as the result of that run.",
    },
    "daily-quest-list": {
        classes: ["overflow-hidden", "divide-y"],
        children: {
            task: { leaf: "task-progress-row", repeats: true, restingCount: 5 },
        },
        why: "Today's tasks are peer rows of one joined list, so the surface is shared and a full-width rule - rather than card spacing - separates one target from the next.",
    },
    "weekly-goals-card": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            goals: { contract: "stacked-peer-controls" },
            reset: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "The week's goal rows and rollover sentence share a bounded ground because the date qualifies the whole run rather than any one goal.",
    },
    "course-progress-card": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            rows: { contract: "progress-row-stack" },
        },
        why: "The course progress rows share one bounded ground because they are peer measures of the same enrolled set rather than separate cards.",
    },
    "streak-summary-card": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            summary: { contract: "body-with-fixed-aside" },
        },
        why: "The seven-day run and its standing figure share one bounded ground because the figure is the result of the run beside it.",
    },
    "progress-row-stack": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            row: { leaf: "labelled-progress-row", repeats: true, restingCount: 3 },
        },
        why: "Progress rows repeat down one column so their labels and figures can be compared without each row pretending to be a separate section.",
    },
    "glyph-title-fact-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            glyph: { leaf: "icon", props: { size: "sm" } },
            title: { leaf: "text", props: { size: "md", tone: "default" } },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "The glyph identifies the row faster than its name does, so it leads the line and the fact trails it - and the name between them takes the slack, because a long one must clip rather than push the figure off the end of the row.",
    },
    "glyph-body-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "rounded-xl", "px-4", "py-3"],
        children: {
            glyph: { leaf: "icon", props: { size: "sm" } },
            body: { leaf: "text" },
            action: { leaf: ["button", "see-more-link"] },
        },
        why: "A row a reader can act on needs its own inset so the press target is the row and not the words inside it.",
    },
    "label-value-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-3"],
        children: {
            label: { leaf: "text", props: { size: "sm" } },
            value: { leaf: "text", props: { size: "sm" } },
        },
        why: "The label and its figure sit at opposite ends of one line so a column of them reads as a table without being one, and they share a baseline so the figure does not float against its own name.",
    },
    "label-over-figure-tile": {
        classes: ["flex", "flex-col", "gap-2", "rounded-2xl", "bg-surface", "p-4", "shadow-surface"],
        children: {
            label: { leaf: "text", props: { size: "sm", tone: "muted" } },
            figure: { leaf: "text" },
        },
        why: "The label reads first and small, the figure second and large, because a reader scanning a row of these is comparing figures and needs the names only to know which is which.",
    },
    "two-column-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2"],
        children: {
            card: { contract: "resume-item-card", repeats: true, restingCount: 3 },
        },
        why: "Two columns is the widest a set of peer objects can go before the eye stops reading them as a set, and one column below that width because a half-width card holds nothing.",
    },
    "label-field-hint": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            label: { leaf: "label" },
            field: { leaf: ["input", "field"] },
            hint: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "The hint belongs under the control it explains rather than beside the label, because a reader reaches the hint after failing at the control and not before trying it.",
    },
    "form-column": {
        classes: ["flex", "w-full", "max-w-sm", "flex-col", "gap-6"],
        children: {
            field: { contract: "label-field-hint", repeats: true, restingCount: 3 },
            submit: { leaf: "button" },
        },
        why: "A form is read one control at a time, so the measure is narrow on purpose and the seam between controls is wider than the seam inside any of them.",
    },
    "double-navbar": {
        classes: ["sticky", "top-0", "z-50", "w-full", "border-b", "border-separator", "bg-background"],
        children: {
            primary: { contract: "brand-links-then-tools-bar" },
            bottom: { contract: "underlined-tab-strip", optional: true },
        },
        why: "The active page's tab strip is the navbar's second layer, so both rows move as one sticky landmark and share one bottom border instead of drawing two unrelated bars.",
    },
    "brand-links-then-tools-bar": {
        classes: ["flex", "h-16", "min-h-16", "w-full", "flex-row", "items-center", "justify-between", "gap-3", "px-3"],
        children: {
            navigation: { contract: "inline-nav-links" },
            tools: { contract: "inline-tool-row" },
        },
        why: "The mark and the routes read left because that is where a reader looks to learn where they are; the tools read right because that is where they look to change something - and the bar wraps rather than letting either group fall off a narrow screen.",
    },
    "inline-nav-links": {
        classes: ["flex", "flex-row", "items-center", "gap-6"],
        children: {
            brand: { leaf: "link", props: { emphasis: "brand" } },
            routes: { contract: "inline-route-links" },
        },
        why: "The product mark and its destination group keep the legacy 24px seam, so the brand is distinct without becoming detached from the routes it anchors.",
    },
    "inline-route-links": {
        classes: ["hidden", "flex-1", "items-center", "justify-center", "gap-2", "md:flex"],
        children: {
            route: { leaf: "nav-link", props: { kind: "route" }, repeats: true, restingCount: 0 },
        },
        why: "Desktop route pills sit at the original 8px seam and disappear together below the navigation breakpoint, where the compact shell owns navigation instead.",
    },
    "inline-tool-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2"],
        children: {
            desktop: { contract: "desktop-navbar-tools" },
            tool: { leaf: "icon-button", repeats: true, restingCount: 3 },
        },
        why: "The desktop field controls and round action buttons share one centred row, so controls with different intrinsic heights still sit on the same navbar axis.",
    },
    "desktop-navbar-tools": {
        classes: ["hidden", "items-center", "gap-2", "md:flex"],
        children: {
            search: { leaf: "pressable-input-like" },
            locale: { leaf: "icon-button" },
            theme: { leaf: "theme-switch" },
        },
        why: "Search, language and appearance are the legacy desktop subgroup, whose own centred flex axis prevents the shorter native switch track from dropping against neighbouring buttons.",
    },
    "underlined-tab-strip": {
        classes: ["w-full"],
        children: {
            tabs: { leaf: "extended-tabs" },
        },
        why: "The original ExtendedTabs primitive owns the inset, compound tab anatomy and selected indicator as one typed run, so no caller can redraw one dashboard tab differently from its peers.",
    },
    "rail-then-main": {
        classes: ["flex", "flex-col", "gap-8", "md:flex-row", "md:items-start", "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0", "md:[&>*:first-child]:sticky", "md:[&>*:first-child]:top-6", "md:[&>*:first-child]:self-start", "md:[&>*:first-child]:max-h-rail", "md:[&>*:first-child]:overflow-y-auto", "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow"],
        children: {
            rail: { contract: "stacked-sections" },
            main: { contract: ["stacked-sections", "centred-empty-notice"] },
        },
        why: "The rail is pinned in width and STAYS while the column beside it scrolls, because it holds who the reader is and where they can go - facts that do not stop being true a screenful down - and a rail that shrank with the window would clip its own labels before the content beside it became hard to read. Below the breakpoint it moves above rather than halving the column, where sticking it would cost a phone most of its screen.",
    },
    "centred-page-column": {
        classes: ["mx-auto", "flex", "w-full", "max-w-sm", "flex-col", "gap-6", "py-6"],
        children: {
            header: { contract: "centred-title-pair" },
            body: {
                contract: ["stacked-peer-controls", "centred-title-pair", "spread-choice-row"],
                leaf: ["form", "divider"],
                repeats: true,
                restingCount: 0,
            },
            footer: { contract: ["spread-choice-row", "centred-prompt-row"], optional: true },
        },
        why: "A surface read one control at a time is centred and narrow on purpose: a form that runs the width of a desktop screen makes the eye travel between a label and the box it names.",
    },
    "centred-title-pair": {
        classes: ["flex", "flex-col", "gap-2", "items-center", "text-center"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm" } },
        },
        why: "The supporting line sits under the title rather than beside it, because it explains the title rather than qualifying it - and both are centred so the pair reads as the surface's own name rather than as the first row of its content.",
    },
    "stacked-peer-controls": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            control: {
                contract: "spread-choice-row",
                leaf: ["button", "field", "labelled-progress-row", "quick-action-row", "quick-actions-list", "stat-row", "text"],
                repeats: true,
                restingCount: 3,
            },
        },
        why: "Controls of the same kind repeat down one column, and the seam between them is tighter than the seam between groups, so a reader can tell a run of peers from two separate decisions.",
    },
    "spread-choice-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            choice: { leaf: ["checkbox", "text-link"] },
            exit: { leaf: "text-link" },
        },
        why: "A choice and the way out of it are pushed to opposite ends of one line, because they are peers that a reader picks BETWEEN rather than a label and the thing it names.",
    },
    "centred-prompt-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-center", "gap-2"],
        children: {
            prompt: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "text-link" },
        },
        why: "A question and its answer read as one sentence, so they share a line and are centred together - split across two lines they read as two separate offers.",
    },
    "centred-empty-notice": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "rounded-2xl", "bg-surface", "p-6", "text-center", "shadow-surface"],
        children: {
            notice: { leaf: "empty-notice" },
        },
        why: "An empty region still has to offer a way out, so the recovery action is part of this node rather than something a caller remembers to add beside it.",
    },
})

/** Every key in the registry. A key not in this union is a compile error at the call site. */
export type ContractKey = keyof typeof CONTRACTS

/** Slot names whose contract entry declares a repeated run. */
type RepeatedSlotNames<K extends ContractKey> = {
    [S in keyof (typeof CONTRACTS)[K]["children"]]:
        (typeof CONTRACTS)[K]["children"][S] extends { readonly repeats: true } ? S : never
}[keyof (typeof CONTRACTS)[K]["children"]]

/**
 * Contracts a joined-list surface may host: a separated root made only from repeated slots.
 * The class and cardinality are both checked so a grid or a mixed header/list node cannot enter.
 */
export type JoinedListContractKey = {
    [K in ContractKey]:
        "divide-y" extends (typeof CONTRACTS)[K]["classes"][number]
            ? [RepeatedSlotNames<K>] extends [never]
                ? never
                : Exclude<keyof (typeof CONTRACTS)[K]["children"], RepeatedSlotNames<K>> extends never
                    ? K
                    : never
            : never
}[ContractKey]

/**
 * Read one entry, widened to the shared shape.
 *
 * @param name - The registry key to read.
 */
export const contractSpec = (name: ContractKey): ContractSpec => CONTRACTS[name]

/** Resolve one contract into the props its branch places on the real layout node. */
export const contractNodeProps = (name: ContractKey) => {
    const spec = contractSpec(name)
    return {
        "data-tier": "branch",
        "data-node": name,
        "data-why": spec.why,
        className: spec.classes.join(" "),
    }
}

/** Every registry key, in declaration order, so gates and tests can walk the vocabulary. */
export const CONTRACT_KEYS: ReadonlyArray<ContractKey> = Object.keys(CONTRACTS) as Array<ContractKey>
