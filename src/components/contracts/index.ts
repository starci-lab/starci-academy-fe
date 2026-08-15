/**
 * THE REGISTRY.
 *
 * One entry describes ONE node: the classes it wears, and why the things inside it sit that way.
 * Nothing else. What goes inside is the assembling branch's business. A fixed run of independently
 * meaningful leaves is a composite; its count does not turn it back into a leaf.
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
    | "flex" | "grid" | "flex-col" | "flex-row" | "flex-wrap" | "overflow-hidden" | "relative"
    | "items-center" | "items-baseline" | "items-start" | "items-end"
    | "justify-between" | "justify-center" | "[&>*]:w-full"
    | "gap-1" | "gap-2" | "gap-3" | "gap-4" | "gap-6" | "gap-8"
    | "grid-cols-1" | "grid-cols-2" | "sm:grid-cols-2" | "sm:grid-cols-4" | "lg:grid-cols-3"
    | "sm:flex-row" | "sm:items-start" | "sm:justify-between"
    | "md:flex" | "md:flex-row" | "md:items-start" | "md:gap-8"
    // A PROPORTIONAL split, which the union could not previously express. Every existing two-column
    // token is a FIXED rail (`md:[&>*:first-child]:w-72`), and 288px is a sidebar measure: a problem
    // statement read at that width wraps every second word. `md:shrink-0` comes with it because a
    // proportional width is only a REQUEST until shrinking is refused - measured at 273px inside a
    // 934px viewport before it was added. The seam flips with the axis: a rule UNDER the reading
    // column while the two are stacked, and BESIDE it once they are side by side.
    | "md:w-2/5" | "md:shrink-0" | "md:border-b-0" | "md:border-r"
    | "@app-md:flex-row" | "@app-md:items-start" | "@app-md:gap-8" | "@app-md:w-72"
    | "mx-auto" | "min-h-screen" | "min-h-80" | "w-full" | "min-w-0" | "grow" | "flex-1" | "shrink-0" | "hidden" | "overflow-auto" | "max-w-app-sm" | "max-w-app-md" | "max-w-app-lg" | "max-w-app-xl" | "max-w-6xl" | "max-w-sm" | "max-w-md" | "@container"
    | "h-16" | "min-h-16" | "sticky" | "top-0" | "top-16" | "z-40" | "z-50"
    | "border" | "border-b" | "border-separator" | "divide-y" | "divide-separator" | "bg-background"
    | "px-3" | "px-4" | "px-6" | "py-2" | "py-3" | "py-6" | "p-0" | "p-2" | "p-4" | "p-6" | "-mt-px"
    | "px-2" | "pl-4" | "cursor-pointer" | "text-left" | "text-foreground" | "hover:opacity-80"
    | "group" | "active:opacity-70"
    | "rounded-xl" | "rounded-2xl" | "rounded-3xl"
    | "bg-surface" | "bg-accent-soft" | "bg-success-soft" | "bg-warning-soft"
    | "shadow-surface" | "text-center"
    | "inset-shadow-[2px_0_0_0_var(--success)]" | "inset-shadow-[2px_0_0_0_var(--danger)]"
    | "[&>*:nth-child(2)]:min-w-0" | "[&>*:nth-child(2)]:grow"
    | "[&>*:nth-child(3)]:min-w-0" | "[&>*:nth-child(3)]:grow"
    | "md:[&>*:first-child]:min-w-0" | "md:[&>*:first-child]:grow"
    | "[&>*:first-child]:min-w-0" | "[&>*:first-child]:grow"
    | "md:[&>*:last-child]:w-72" | "md:[&>*:last-child]:w-80" | "md:[&>*:last-child]:shrink-0"
    | "md:[&>[data-component=SelectionList][data-variant=scopes]]:w-72"
    | "md:[&>[data-component=SelectionList][data-variant=scopes]]:shrink-0"
    | "md:[&>[data-component=SelectionList][data-variant=results]]:min-w-0"
    | "md:[&>[data-component=SelectionList][data-variant=results]]:grow"
    | "md:[&>[data-node=empty-notice-stack]]:min-w-0"
    | "md:[&>[data-node=empty-notice-stack]]:grow"
    | "md:[&>[data-node=global-search-result-region]]:min-w-0"
    | "md:[&>[data-node=global-search-result-region]]:grow"
    | "md:[&>[data-node=global-search-context-card]]:w-72"
    | "md:[&>[data-node=global-search-context-card]]:shrink-0"
    | "md:[&>*:first-child]:w-72" | "md:[&>*:first-child]:shrink-0"
    | "md:[&>*:last-child]:min-w-0" | "md:[&>*:last-child]:grow"
    | "md:[&>*:first-child]:overflow-y-auto"
    | "md:[&>*:nth-child(2)]:min-w-0" | "md:[&>*:nth-child(2)]:grow"
    | "[&>*]:min-w-0" | "[&>*]:grow"
    | "md:[&>[data-node=learn-spine-column]]:w-72"
    | "md:[&>[data-node=learn-spine-column]]:grow-0"
    | "md:[&>[data-node=learn-spine-column]]:shrink-0"
    | "md:[&>[data-node=learn-spine-column]]:sticky"
    | "md:[&>[data-node=learn-spine-column]]:top-rail"
    | "md:[&>[data-node=learn-spine-column]]:self-start"
    | "md:[&>[data-node=learn-spine-column]]:max-h-rail"
    | "md:[&>[data-node=learn-spine-column]]:overflow-y-auto"
    | "md:[&>*:first-child]:sticky" | "md:[&>*:first-child]:top-rail"
    | "md:[&>*:first-child]:self-start" | "md:[&>*:first-child]:max-h-rail"
    | "md:[&>*:first-child]:overflow-y-auto"
    | "[&>*]:px-4" | "[&>*]:py-3" | "[&>*]:p-2" | "[&>*]:p-3" | "[&>*]:border-separator"
    | "[&>*:nth-child(odd)]:border-r" | "[&>*:nth-child(-n+4)]:border-b"
    | "[&>*:first-child]:w-5" | "[&>*:first-child]:shrink-0"
    // A catalog row reads left to right: what it looks like, what it is, what to do. The artwork
    // is FIXED rather than proportional, because a thumbnail that grew with the viewport would
    // make the title column narrower on a wider screen, and the trailing controls hold their own
    // measure so the row does not end in a ragged edge down the list.
    | "[&>*:first-child]:w-36" | "[&>*:last-child]:shrink-0"
    | "[&>[data-component=Badge]:first-child]:absolute"
    | "[&>[data-component=Badge]:first-child]:right-4"
    | "[&>[data-component=Badge]:first-child]:top-4"
    | "[&>[data-component=Badge]:first-child]:z-10"
    | "[&>*:first-child]:text-center" | "[&>*:first-child]:tabular-nums"
    | "[&>*:first-child]:pt-4" | "[&>*:last-child]:pb-4"
    // A total is not the last of the figures above it, it is what they resolve to. Every other
    // stack in this table separates peers, and peers are what its members are; here the last line
    // is a different KIND of line, so it takes a rule and a step of air rather than the even seam
    // that would make it read as one more subtotal.
    | "[&>*:last-child]:border-t" | "[&>*:last-child]:border-separator"
    | "[&>*:last-child]:pt-3" | "[&>*:last-child]:mt-1"
    // A fixed artwork track does not fit a phone. The reference hides the thumbnail on the
    // narrowest screens rather than shrinking it, because a course cover below a certain size
    // identifies nothing and the name it sits beside identifies everything.
    | "[&>*:first-child]:hidden" | "md:[&>*:first-child]:block"
    // The end rows carry the surface's own radius. A verdict band is an inset shadow, so it
    // follows whatever radius its row has - and on a square end row it is sliced flat where the
    // card curves away, instead of hooking around the corner the way the reference draws it.
    | "[&>*:first-child]:rounded-t-3xl" | "[&>*:last-child]:rounded-b-3xl"
    // The dais arranges its own places. Emitting them out of rank order would put the
    // champion in the middle of the DOM too, so anyone reading in sequence hears second
    // place first; the node re-orders what it draws and leaves the reading order alone.
    | "[&>*:nth-child(1)]:order-2" | "[&>*:nth-child(2)]:order-1" | "[&>*:nth-child(3)]:order-3"
    // A ranked row is five columns, not five things that happen to sit in a line. Wrapping made
    // the score land in a different place on every row - a follow control is wider than a caret,
    // and a viewer row has neither - so the one column a leaderboard exists to let you compare
    // stopped being comparable. The track is declared once here and every row obeys it.
    // The trailing tracks are FIXED, not `auto`. Each row is its own grid, so an `auto` track
    // sizes to that row's own content - and a row with no follow control simply has no fifth
    // column, which let `1fr` expand and pushed its score out of the column every other row keeps
    // it in. Fixed widths are what make the scores line up ACROSS rows rather than within one.
    | "grid-cols-[auto_auto_1fr_5rem_2.5rem]" | "[&>*]:grid-cols-[auto_auto_1fr_5rem_2.5rem_7rem]"
    | "[&>*:nth-child(4)]:text-right"

    // The course detail page is the first right-hand rail and the first bottom-pinned bar in this
    // repository, which is why these read as gaps rather than omissions: every one is the mirror of a
    // member already present for the opposite child or the opposite edge.
    | "[&>*:nth-child(2)]:shrink-0"
    | "[&>*:last-child]:min-w-0" | "[&>*:last-child]:grow" | "[&>*:last-child]:shrink-0"
    | "md:[&>*:last-child]:sticky" | "md:[&>*:last-child]:top-rail" | "md:[&>*:last-child]:top-course-rail"
    | "md:[&>*:last-child]:self-start" | "md:[&>*:last-child]:max-h-rail"
    | "md:[&>*:last-child]:overflow-y-auto"
    | "bottom-0" | "border-t" | "md:hidden"
    // py-6 is both at once, and both at once is exactly what a page with a bottom-pinned bar cannot
    // use: padding under the last child lifts the bar off the edge it is pinned to.
    | "pt-6" | "pb-6"

/** Literal values a contract may require from a child component's data props. */
export type ContractPropValue = string | number | boolean | null

/** A child appears once unless it explicitly declares a repeated run and its resting count. */
export type ContractChildCardinality =
    | { readonly repeats?: false, readonly restingCount?: never }
    | { readonly repeats: true, readonly restingCount: number }

/** One named child slot: a leaf, a fixed composite, or another closed contract identity. */
export type ContractChildSpec = ContractChildCardinality & {
    readonly leaf?: string | ReadonlyArray<string>
    readonly composite?: string | ReadonlyArray<string>
    readonly contract?: string | ReadonlyArray<string>
    readonly props?: Readonly<Record<string, ContractPropValue>>
    readonly optional?: boolean
}

type ChildProps<S> = S extends { readonly props?: infer P }
    ? P extends Readonly<Record<string, ContractPropValue>> ? P : Readonly<Record<never, never>>
    : Readonly<Record<never, never>>

/**
 * The one child an entry does NOT name: whatever its caller brought.
 *
 * A section fixes WHERE the content it holds sits and can never fix WHICH node that is - the same
 * section holds a list on one screen and a grid on the next - so a literal key in that slot would be
 * a lie in every use but one. The `$` says it is not a member of the vocabulary: nothing may be
 * named this, and `contractSpec` never resolves it.
 *
 * IT HAD TO BE TYPED, not merely written. Left unknown to the types the slot resolved to `never`,
 * which nothing can satisfy - so the only way to draw such a node was to copy its classes onto an
 * element the branch opened itself, which drops the entry's `host` and is exactly the silent failure
 * `only-the-frame-wears-a-node` reports. The rule and this type are the same fix: one refuses the
 * imitation, the other leaves a lawful way to render the real thing.
 */
type CallerContent = "$content"

/**
 * The identity a parent contract needs from one already-validated child contract.
 *
 * The child builder has already checked its own slots. Re-expanding those slots while validating
 * the parent recursively opens the complete registry at every edge and eventually collapses the
 * vocabulary to `never`; the parent only consumes the closed identity at runtime.
 */
type ContractChild<S> = S extends { readonly contract: infer K }
    ? [K extends ReadonlyArray<infer A> ? A : K] extends [CallerContent]
        ? import("@/components/contracts/props").ContractComponent<ContractKey>
        : (K extends ReadonlyArray<infer A> ? A : K) extends infer C extends ContractKey
            ? import("@/components/contracts/props").ContractComponent<C>
            : never
    : never

type LeafChild<S> = S extends { readonly leaf: infer N }
    ? (N extends ReadonlyArray<infer A> ? A : N) extends infer L extends string
        ? import("@/components/contracts/props").LeafComponent<L, ChildProps<S>>
        : never
    : never

type CompositeChild<S> = S extends { readonly composite: infer N }
    ? (N extends ReadonlyArray<infer A> ? A : N) extends infer C extends string
        ? import("@/components/contracts/props").CompositeComponent<C, ChildProps<S>>
        : never
    : never

type OneChild<S> = ContractChild<S> | LeafChild<S> | CompositeChild<S>

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

/**
 * Elements an entry may name as its own host.
 *
 * A `<main>` is not a `<div>` with a class - it is the document's one main landmark, and a screen
 * reader offers it as a destination. The same holds for `<nav>`, `<ul>` and `<form>`: each is a
 * MEANING, and meaning belongs beside the classes and the children rather than in a second frame
 * component per element. `Main` was exactly that second frame - it existed only to swap the tag, so
 * every rule taught about `Tree` had to be taught about `Main` separately, and the rule that was not
 * taught reported the landmark as a node with no key.
 *
 * `li` IS HERE BECAUSE `ul` AND `ol` WERE USELESS WITHOUT IT. The union admitted both containers and
 * not the item, so a list entry had to be a `div` - which is invalid HTML and, worse, silent: a
 * `<ul>` whose children are not `<li>` stops being announced as "list, 4 items" and is read as loose
 * text instead. The two list hosts could not be used for the thing they are named after, and nothing
 * failed, because a `div` is never wrong on its own.
 *
 * THE NAME AND THE MEMBERS BOTH COME FROM THE TRUST TREE. This union is SCAFFOLDING, which
 * `sources/fe/contracts.ts` states is identical in every repository; only the entry table below is
 * this repository's own. It had drifted on both counts - named `ContractHostTag` here and
 * `ContractHost` there, carrying `main` and `ol` that canon lacked while missing the `li`, `header`
 * and `footer` canon had. Neither list contained the other, so both were wrong and no import could
 * report it. The missing members were merged into canon first and this file now takes that name and
 * that list, because a renamed type is a divergence nothing checks.
 */
export type ContractHost =
    | "div" | "ul" | "ol" | "li" | "form" | "nav" | "main" | "section" | "header" | "footer" | "aside"

/** One registry entry: a node's own classes, the element it opens, and why what it holds sits that way. */
export interface ContractSpec {
    /** The class string of the node itself. Not a prop, not reachable by a caller. */
    readonly classes: ReadonlyArray<LayoutClassName>
    /** The element this node opens. Absent means `div` - a node with no meaning of its own. */
    readonly host?: ContractHost
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
    "course-learn-today-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            subtitle: { leaf: "text", props: { size: "sm", tone: "muted" } },
            primary: { contract: "resume-item-card", optional: true },
            secondary: { contract: "resume-card-grid", optional: true },
            course: { contract: "resume-item-card", optional: true },
            progress: { contract: "label-fact-over-progress", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "Today gives the learner one deterministic next move before any alternatives. Course and progress are alternate mobile compositions of the same route, so each owns a named optional slot instead of mutating the URL or drawing a second page.",
    },
    "course-learn-content-home-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-4", "px-6", "py-6"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm" } },
            modulesTitle: { leaf: "heading", optional: true },
            module: { leaf: "curriculum-module-row", repeats: true, restingCount: 3, optional: true },
        },
        why: "The Modules landing page names the enrolled course, explains the collection, then keeps every authored module in one scannable run; loading and failure retain that same route landmark instead of replacing the page identity.",
    },
    "course-learn-module-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-4", "px-6", "py-6"],
        children: {
            title: { leaf: "heading" },
            module: { leaf: "curriculum-module-row" },
        },
        why: "A selected module keeps its title and authored contents together under one main landmark, so opening a module narrows the curriculum without inventing a second navigation shell.",
    },
    "learn-mobile-tab-bar": {
        host: "nav",
        classes: ["sticky", "bottom-0", "z-40", "flex", "w-full", "min-w-0", "flex-row", "items-center", "justify-between", "gap-2", "border-t", "border-separator", "bg-background", "px-4", "py-3", "md:hidden"],
        children: {
            tab: { leaf: "nav-link", props: { kind: "tab" }, repeats: true, restingCount: 3 },
        },
        why: "Below the rail's breakpoint the course is not reachable at all, so its ways in pin to the bottom edge where a thumb already is. It is a NAV of peers rather than the action bar it shares a shape with: those two differ in what sits inside them, which is exactly what a key is for - one holds a price and the thing that buys it, this holds destinations, and no reader should have to tell them apart by guessing.",
    },
    "learn-shell-frame": {
        classes: [
            "flex", "min-h-screen", "w-full", "min-w-0", "flex-col", "items-start",
            "[&>*]:min-w-0", "[&>*]:grow",
            "md:flex-row", "md:items-start",
            "md:[&>[data-node=learn-spine-column]]:w-72",
            "md:[&>[data-node=learn-spine-column]]:grow-0",
            "md:[&>[data-node=learn-spine-column]]:shrink-0",
            "md:[&>[data-node=learn-spine-column]]:sticky",
            "md:[&>[data-node=learn-spine-column]]:top-rail",
            "md:[&>[data-node=learn-spine-column]]:self-start",
            "md:[&>[data-node=learn-spine-column]]:max-h-rail",
            "md:[&>[data-node=learn-spine-column]]:overflow-y-auto",
        ],
        children: {
            spine: { contract: "learn-spine-column", optional: true },
            body: { leaf: "page" },
            bar: { contract: "learn-mobile-tab-bar", optional: true },
        },
        why: "The spine is furniture rather than content: it stays under the navbar, takes the height the navbar leaves, and scrolls on its own so a reader deep in a long lesson still sees where they are in the course. It sits BESIDE the routed main rather than around it, so changing surface repaints the body and leaves the spine standing - which is the whole reason a learner can move between eleven modes without the frame flickering.",
    },
    "learn-spine-column": {
        host: "nav",
        classes: ["hidden", "w-full", "min-w-0", "flex-col", "gap-4", "p-4", "md:flex"],
        children: {
            resume: { contract: "learn-resume-card", optional: true },
            group: { contract: "learn-nav-group", repeats: true, restingCount: 3 },
        },
        why: "Where the learner left off answers a different question from where they can go, so it stands above the groups rather than inside one - and the groups take the seam between two composed clusters, because each is already a label with a run of destinations under it.",
    },
    "learn-nav-group": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-1"],
        children: {
            label: { leaf: "text", props: { size: "xs", tone: "muted" } },
            row: { contract: "learn-nav-row", repeats: true, restingCount: 3 },
        },
        why: "A group name and the destinations under it are one identity, so they sit at the tightest seam: the name is read as what the run IS rather than as a peer of its first row. The group draws no surface, because a nav that boxes its own sections turns navigation into a page of cards.",
    },
    "learn-nav-row": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "items-center", "gap-2", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow", "[&>*:last-child]:shrink-0"],
        children: {
            link: { leaf: "nav-link", props: { kind: "route" } },
            fact: { leaf: ["text", "icon"], optional: true },
        },
        why: "The destination owns the width and one fact sits at the far end - a due count, a rank, or the lock that says this mode is not open yet. It is never an action: it reads as part of the row sentence, and a control there gets pressed by somebody who meant to read it.",
    },
    "learn-resume-card": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-1", "p-4"],
        children: {
            label: { leaf: "text", props: { size: "xs", tone: "muted" } },
            progress: { composite: "labelled-progress-row" },
        },
        why: "Continuing is one press, so the whole card is the target and its two lines are one identity: what this is, then how far in. It keeps a surface where the groups below have none, because it is the only thing in the rail that acts rather than navigates.",
    },
    "personal-project-workspace-frame": {
        classes: [
            "flex", "min-h-screen", "w-full", "min-w-0", "flex-col", "items-start",
            "md:flex-row", "md:items-start", "md:gap-8",
            "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0",
            "[&>*:last-child]:min-w-0", "[&>*:last-child]:grow",
        ],
        children: {
            milestone: { leaf: "nav-link", props: { kind: "section" }, repeats: true, restingCount: 4 },
            body: { leaf: "page" },
        },
        why: "The milestone run persists beside dashboard, task and result routes so progress and the next available task remain legible while only the routed workspace body changes.",
    },
    "course-personal-project-task-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-app-lg", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "centred-title-pair" },
            controls: { contract: "stacked-peer-controls" },
        },
        why: "A task brief is read before its score constraint and one submission action, so the controls remain one bounded vertical decision directly below the title rather than entering a generic page body run.",
    },
    "course-personal-project-result-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-app-lg", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "centred-title-pair" },
            attempts: { contract: "stacked-peer-controls" },
            feedback: { contract: "stacked-peer-controls", optional: true },
            action: { leaf: "button", optional: true },
        },
        why: "Attempt history is the result's primary evidence, feedback is its optional explanation, and retry closes the reading order as a page action instead of being repeated inside either evidence group.",
    },
    "course-personal-project-page": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-4", "px-6", "py-6"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            progress: { leaf: "progress" },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
            task: { leaf: "nav-link", props: { kind: "section" }, repeats: true, restingCount: 4 },
            notice: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            retry: { leaf: "button", optional: true },
        },
        why: "The capstone overview reads from identity through completion into its ordered tasks, with empty and failed notices occupying the same sentence rather than opening a second page shape.",
    },
    "course-foundations-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-lg", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            search: { leaf: "search-box" },
            category: { leaf: "nav-link", props: { kind: "section" }, repeats: true, restingCount: 4, optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The foundation catalog introduces why the prerequisite library exists before the query and its live category results, while empty and failed outcomes replace only the result run.",
    },
    "course-foundation-category-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-lg", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            search: { leaf: "search-box" },
            resource: { leaf: "nav-link", props: { kind: "section" }, repeats: true, restingCount: 6, optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "One category is a searchable reading list, so its title and query precede one ordered run of backend resources and the settled notice occupies that run when no resource can be shown.",
    },
    "course-foundation-resource-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            back: { leaf: "button" },
            header: { contract: "page-header-stack", optional: true },
            description: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            body: { leaf: "article", optional: true },
            practice: { leaf: "button", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "A prerequisite resource is read from its server title through its authored body before the related practice action, while back navigation remains available across ready and recovery states.",
    },
    "playground-session-frame": {
        classes: ["flex", "min-h-screen", "w-full", "min-w-0", "flex-col"],
        children: {
            surface: { leaf: "page", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The slug layout keeps one full-width frame mounted while setup and session surfaces change beneath the same pairing and socket owner, and only a load failure replaces that routed surface.",
    },
    "course-playground-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-lg", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            playground: { leaf: "nav-link", props: { kind: "section" }, repeats: true, restingCount: 4, optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The live lab catalog explains server verification once, then presents each backend playground as a peer destination; pending, empty and failed states keep the same page identity.",
    },
    "course-playground-setup-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            preparationTitle: { leaf: "heading", optional: true },
            preparationStep: { leaf: "text", props: { size: "sm" }, repeats: true, restingCount: 3, optional: true },
            pairingLabel: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            pairingCode: { leaf: "text", props: { size: "sm", weight: "semibold" }, optional: true },
            status: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            action: { leaf: "button", repeats: true, restingCount: 1, optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "Preparation is read before a session is created; once the server returns a pairing code, that identity and agent readiness replace the create action before entry becomes available.",
    },
    "course-playground-session-page": {
        host: "main",
        classes: ["flex", "min-h-screen", "w-full", "min-w-0", "flex-col", "gap-6", "bg-background", "px-6", "py-6"],
        children: {
            leave: { leaf: "button" },
            connection: { leaf: "text", props: { size: "xs", tone: "muted" } },
            title: { leaf: "heading" },
            step: { leaf: "nav-link", props: { kind: "section" }, repeats: true, restingCount: 4 },
            body: { leaf: "article", optional: true },
            command: { leaf: "code-block", optional: true },
            hint: { leaf: "text", props: { size: "sm" }, optional: true },
            submit: { leaf: "button", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The persistent live workspace keeps connection state and server-owned steps ahead of the selected instruction; verification is one action and completion or failure replaces the instruction without inventing client progress.",
    },
    "course-mind-map-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-lg", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            search: { leaf: "search-box" },
            graphFact: { leaf: "text", props: { size: "xs", tone: "muted" } },
            node: { leaf: "nav-link", props: { kind: "section" }, repeats: true, restingCount: 6, optional: true },
            selection: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            open: { leaf: "button", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The concept map keeps search and graph scale ahead of one selectable backend node field, then exposes an open action only for the selected node whose linked entity resolves to a real course route.",
    },
    "course-mock-interview-setup-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "centred-title-pair" },
            levelLabel: { leaf: "text", props: { size: "sm", tone: "muted" } },
            level: { leaf: "button", repeats: true, restingCount: 3 },
            modeLabel: { leaf: "text", props: { size: "sm", tone: "muted" } },
            mode: { leaf: "button", repeats: true, restingCount: 2 },
            status: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            action: { leaf: "button", repeats: true, restingCount: 2 },
        },
        why: "The green room asks for seniority before format, then reports the persisted session state before either starting or resuming, so each decision keeps a named place in one narrow reading column.",
    },
    "course-mock-interview-session-page": {
        host: "main",
        classes: ["flex", "min-h-screen", "w-full", "min-w-0", "flex-col", "gap-6", "bg-background", "px-6", "py-6"],
        children: {
            header: { contract: "centred-title-pair" },
            progress: { composite: "labelled-progress-row" },
            remaining: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            notice: { leaf: "text", props: { size: "sm" } },
            turn: { contract: "centred-title-pair", repeats: true, restingCount: 3 },
            streaming: { contract: "centred-title-pair", optional: true },
            answerLabel: { leaf: "text", props: { size: "sm", weight: "medium" } },
            answer: { leaf: "textarea" },
            action: { leaf: "button", repeats: true, restingCount: 3 },
            workspaceTitle: { leaf: "heading" },
            workspace: { leaf: ["code-block", "text"] },
        },
        why: "The live room reads from the current prompt and server clock through the persisted conversation into one answer decision, with the question workspace following as supporting evidence rather than becoming a second untyped page frame.",
    },
    "course-mock-interview-result-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-lg", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "centred-title-pair" },
            notice: { composite: "empty-notice", optional: true },
            grading: { leaf: "progress", optional: true },
            scoreLabel: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            score: { leaf: "heading", optional: true },
            verdict: { contract: "centred-title-pair", optional: true },
            phaseTitle: { leaf: "heading", optional: true },
            phase: { composite: "labelled-progress-row", repeats: true, restingCount: 3, optional: true },
            strengthsTitle: { leaf: "heading", optional: true },
            strength: { leaf: "text", props: { size: "sm" }, repeats: true, restingCount: 3, optional: true },
            gapsTitle: { leaf: "heading", optional: true },
            gap: { leaf: "text", props: { size: "sm" }, repeats: true, restingCount: 3, optional: true },
            reviewsTitle: { leaf: "heading", optional: true },
            review: { composite: "evidence-row", repeats: true, restingCount: 3, optional: true },
            action: { leaf: "button", repeats: true, restingCount: 2 },
        },
        why: "A persisted debrief moves from outcome to rubric, then from general strengths and gaps to question evidence, and closes with the next interview action so grading and recovery replace the evidence without changing the page owner.",
    },
    "course-learn-challenge-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "centred-title-pair" },
            body: { contract: "stacked-peer-controls" },
        },
        why: "A challenge reads from its authored brief into one ordered run of deliverables and submission controls, so pending, editing, submitting, passed and failed states keep the same dedicated route identity.",
    },
    "course-learn-challenge-result-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "centred-title-pair" },
            score: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            body: { contract: "stacked-peer-controls" },
        },
        why: "A persisted challenge result keeps its score, scorer findings and retry-or-continue decision under one result identity, while loading and recovery replace only the evidence body.",
    },
    "flashcard-mode-tabs": {
        host: "nav",
        classes: ["flex", "flex-row", "gap-2", "border-b", "border-separator"],
        children: {
            tab: { leaf: "nav-link", props: { kind: "tab" }, repeats: true, restingCount: 2 },
        },
        why: "Review and quiz are two peer modes over the same flashcard capability, so their route actions share one tab row and the current mode remains a fact carried by each typed navigation leaf.",
    },
    "flashcard-review-due-card": {
        classes: ["flex", "flex-col", "gap-3", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            fact: { leaf: "text", props: { size: "sm", weight: "medium" } },
            action: { leaf: "button", optional: true },
        },
        why: "The due queue is one resumable decision: its name and explanation establish the work, the count proves its size, and exactly one available start or resume action closes the card.",
    },
    "flashcard-review-deck-card": {
        classes: ["flex", "flex-col", "gap-3", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            facts: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: "button" },
        },
        why: "Every deck is a comparable study offer whose identity, explanation and card counts are read before its one start action, so the complete sentence repeats as one typed card rather than loose page markup.",
    },
    "course-flashcards-review-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "centred-title-pair" },
            modes: { contract: "flashcard-mode-tabs" },
            due: { contract: "flashcard-review-due-card", optional: true },
            stats: { contract: "centred-title-pair", optional: true },
            decksTitle: { leaf: "heading", optional: true },
            deck: { contract: "flashcard-review-deck-card", repeats: true, restingCount: 4, optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The review overview keeps its identity and mode switch stable while pending, recovery and ready states replace only the study evidence: due work first, progress second, then the peer deck run.",
    },
    "flashcard-quiz-configuration": {
        classes: ["flex", "flex-col", "gap-4", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            title: { leaf: "heading" },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
            resume: { leaf: "button", optional: true },
            modeLabel: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            mode: { leaf: "button", repeats: true, restingCount: 2 },
            levelLabel: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            level: { leaf: "button", repeats: true, restingCount: 5 },
            start: { leaf: "button" },
        },
        why: "Quiz setup is one ordered decision: session size and any resumable work precede mode and level choices, then one start action commits the selected configuration.",
    },
    "course-flashcards-quiz-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "centred-title-pair" },
            modes: { contract: "flashcard-mode-tabs" },
            configuration: { contract: "flashcard-quiz-configuration", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The quiz route keeps the shared flashcard identity and mode switch above one finite configuration surface, while empty or failed transport replaces only that setup decision.",
    },
    "flashcard-session-header": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4", "border-b", "border-separator", "py-3"],
        children: {
            deck: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            title: { leaf: "heading" },
            leave: { leaf: "button" },
        },
        why: "The current deck qualifies the session title while leave remains the one route action at the opposite edge, so orientation and escape persist through every lifecycle state.",
    },
    "flashcard-session-card": {
        classes: ["flex", "flex-1", "flex-col", "justify-center", "gap-6", "rounded-2xl", "border", "border-separator", "p-6"],
        children: {
            prompt: { leaf: "text", props: { size: "md", weight: "medium" } },
            answer: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "One card is the session's focused reading surface: the prompt owns the available height and the revealed answer follows as supporting evidence without opening a second structural owner.",
    },
    "course-flashcard-session-page": {
        host: "main",
        classes: ["mx-auto", "flex", "min-h-screen", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "flashcard-session-header" },
            progress: { contract: "label-with-muted-fact-row", optional: true },
            card: { contract: "flashcard-session-card", optional: true },
            status: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            action: { leaf: "button", repeats: true, restingCount: 4, optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The live session preserves orientation before progress and one focused card, then exposes only the actions admitted by the current reveal and transport state; recovery replaces the card, never the page owner.",
    },
    "flashcard-result-stat": {
        classes: ["flex", "flex-col", "gap-2", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            label: { leaf: "text", props: { size: "xs", tone: "muted" } },
            value: { leaf: "heading" },
        },
        why: "Each persisted result figure is one labelled measurement, so the quiet label precedes its stronger value and the same typed card repeats for score, reviewed cards, XP and duration.",
    },
    "flashcard-result-fact-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2", "rounded-xl", "p-4"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "medium" } },
            value: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "A breakdown grade or weak topic is read by comparing its name with one persisted value on the same baseline, so every result fact occupies the same two-part row.",
    },
    "course-flashcard-result-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            mode: { leaf: "text", props: { size: "sm", tone: "muted" } },
            header: { contract: "centred-title-pair" },
            stat: { contract: "flashcard-result-stat", repeats: true, restingCount: 4, optional: true },
            nextDue: { contract: "centred-title-pair", optional: true },
            breakdownTitle: { leaf: "heading", optional: true },
            grade: { contract: "flashcard-result-fact-row", repeats: true, restingCount: 4, optional: true },
            weakTopicsTitle: { leaf: "heading", optional: true },
            weakTopic: { contract: "flashcard-result-fact-row", repeats: true, restingCount: 3, optional: true },
            action: { leaf: "button", repeats: true, restingCount: 2, optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "A persisted flashcard result reads from route mode and outcome through comparable summary figures, optional due and diagnostic evidence, then closes with back and repeat actions; loading and failure keep the same identity.",
    },
    "nav-over-body-page": {
        classes: ["flex", "min-h-screen", "w-full", "flex-col"],
        children: {
            navigation: { contract: "double-navbar" },
            body: { contract: "routed-page-main" },
        },
        why: "The navigation stays a sibling of the routed body rather than a parent of it, so a route change repaints the body without tearing the nav down - and the measure is set here because a reading column running the full width of a desktop screen cannot be scanned at all.",
    },
    "routed-page-main": {
        // The document's one main landmark. The key's name has said so all along; now the entry
        // does, instead of a second frame component existing to swap the tag.
        host: "main",
        classes: ["flex", "min-w-0", "grow", "flex-col"],
        children: {
            page: { leaf: "page" },
        },
        why: "The routed page is the one region a reader came for, so it is the document's main landmark and can be skipped to past the navigation - and it takes the height the navbar leaves rather than deciding a measure of its own, because the page inside already owns that decision.",
    },
    "centred-authentication-page": {
        classes: ["flex", "min-h-screen", "w-full", "items-center", "justify-center", "p-6"],
        children: {
            surface: { contract: "authentication-panel-card" },
        },
        why: "Authentication is the route's only task, so its one bounded form sits at the visual centre instead of inheriting the dashboard's rail-and-main reading order.",
    },
    "authentication-panel-card": {
        classes: ["w-full", "max-w-md", "p-4"],
        children: {
            panel: { contract: "centred-page-column" },
        },
        why: "The authentication form is one meaningful control group, so one card bounds it while the panel inside retains ownership of its typed form rhythm.",
    },
    "title-with-end-action": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
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
    "profile-tabs-over-body": {
        classes: ["flex", "w-full", "flex-col"],
        children: {
            tabs: { contract: "underlined-tab-strip" },
            body: { contract: "profile-page-measure" },
        },
        why: "Profile route chrome belongs to the persistent public-profile layout above its measured identity-and-evidence body; it is not a second layer owned by the global navbar.",
    },
    "profile-page-measure": {
        classes: ["@container", "mx-auto", "w-full", "max-w-app-xl"],
        children: { inset: { contract: "profile-page-inset" } },
        why: "The public profile keeps the legacy eighty-rem content measure instead of inheriting the narrower dashboard cap.",
    },
    "profile-page-inset": {
        classes: ["p-6"],
        children: { shell: { contract: "profile-rail-container" } },
        why: "The legacy page inset sits inside the unpadded measure so its container breakpoint still observes the full measure.",
    },
    "profile-rail-container": {
        classes: ["@container", "w-full"],
        children: { split: { contract: "profile-rail-then-main" } },
        why: "The rail switch measures the public-profile region itself, matching the self-contained legacy RailShell.",
    },
    "profile-rail-then-main": {
        classes: ["flex", "w-full", "flex-col", "gap-6", "@app-md:flex-row", "@app-md:items-start", "@app-md:gap-8"],
        children: {
            rail: { contract: "profile-identity-rail" },
            main: { contract: ["profile-main", "centred-empty-notice"] },
        },
        why: "The person's identity stays at a stable reading width beside flexible evidence, then moves before that evidence on a narrow screen so context is never lost or squeezed into a second card column.",
    },
    "profile-identity-rail": {
        classes: ["flex", "w-full", "shrink-0", "flex-col", "@app-md:w-72"],
        children: {
            hero: { contract: "profile-hero-rail" },
        },
        why: "One identity story owns the profile rail; it stays a single object rather than becoming unrelated identity, social-proof and action cards.",
    },
    "profile-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            section: { contract: ["label-row-over-card", "profile-overview-skill-grid"], repeats: true, restingCount: 4 },
        },
        why: "Each profile evidence family remains an independently landing labelled section while all families retain the legacy twenty-four-pixel reading seam.",
    },
    "profile-overview-skill-grid": {
        classes: ["grid", "grid-cols-1", "gap-6", "sm:grid-cols-2"],
        children: {
            section: { contract: "label-row-over-card", repeats: true, restingCount: 2 },
        },
        why: "The two skill evidence families remain peer labelled sections: they stack for readable narrow cards and share one row only when both retain useful width.",
    },
    "profile-metric-ribbon": {
        classes: ["grid", "grid-cols-2", "gap-3", "p-4", "sm:grid-cols-4"],
        children: { metric: { composite: "profile-metric", repeats: true, restingCount: 4 } },
        why: "Four proof metrics scan as equal peers, using two readable columns when narrow and one complete ribbon once all four retain useful width.",
    },
    "profile-breakdown-stack": {
        classes: ["flex", "flex-col", "gap-4"],
        children: { breakdown: { contract: "profile-breakdown", repeats: true, restingCount: 3 } },
        why: "Difficulty, topic and language are independent evidence breakdowns whose shared vertical rhythm preserves their distinct labels and visuals.",
    },
    "profile-breakdown": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            visual: { contract: ["profile-segment-run", "profile-topic-chip-run"] },
            caption: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "A breakdown label names one compact visual and its optional explanation, keeping unlike evidence groups from collapsing into one anonymous chart.",
    },
    "profile-segment-run": {
        classes: ["flex", "flex-row", "overflow-hidden", "rounded-xl"],
        children: { segment: { composite: "profile-segment", repeats: true, restingCount: 3 } },
        why: "Distribution segments share one bounded run so their relative contribution reads as one whole rather than unrelated progress bars.",
    },
    "profile-segment-piece": {
        classes: ["flex-1", "p-2", "text-center"],
        children: { value: { leaf: "text", props: { size: "xs", tone: "muted" } } },
        why: "One distribution share retains its own count inside the shared run while remaining proportional to its peers.",
    },
    "profile-topic-chip-run": {
        classes: ["flex", "flex-row", "flex-wrap", "gap-2"],
        children: { topic: { leaf: "badge", repeats: true, restingCount: 4 } },
        why: "Topic counts are compact peer facts that wrap together before any label is squeezed or clipped.",
    },
    "profile-achievement-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2", "lg:grid-cols-3"],
        children: { achievement: { composite: "profile-achievement", repeats: true, restingCount: 3 } },
        why: "Achievements are equal proof cards that gain columns only as their name and rarity remain readable.",
    },
    "profile-achievement-card": {
        classes: ["flex", "flex-col", "gap-2", "p-4"],
        children: {
            mark: { leaf: "icon-tile" },
            name: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            rarity: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "One achievement mark, name and rarity form a single earned-proof object rather than three detached facts.",
    },
    "profile-toolbar-over-list": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: { toolbar: { contract: "profile-search-filter-row" }, list: { contract: "profile-evidence-list" } },
        why: "Search and filters modify the proof list directly below, so their toolbar remains attached to that list rather than to the whole route.",
    },
    "profile-search-filter-row": {
        classes: ["flex", "flex-row", "items-center", "justify-between", "gap-3"],
        children: { search: { leaf: "search-box" }, filter: { leaf: "button" } },
        why: "Search owns the flexible query lane while the short filter action stays visible at its end on the same control row.",
    },
    "profile-cv-page": {
        classes: ["flex", "flex-col", "gap-6"],
        children: { action: { leaf: "button", optional: true }, paper: { contract: "profile-cv-paper" } },
        why: "The owner-only action stays outside the read-only document surface so editing never appears to be part of the CV itself.",
    },
    "profile-cv-paper": {
        classes: ["mx-auto", "w-full", "max-w-app-lg", "overflow-hidden", "p-4"],
        children: { document: { leaf: "profile-cv-document" } },
        why: "The public CV has one bounded paper measure whose document remains readable without acquiring unrelated profile-card chrome.",
    },
    "profile-proof-header": {
        classes: ["flex", "flex-col", "gap-3"],
        children: { back: { leaf: "button" }, title: { leaf: "heading" }, meta: { leaf: "text", props: { size: "sm", tone: "muted" } } },
        why: "The back path, proof title and qualifier form one route-local orientation block before detailed evidence begins.",
    },
    "profile-coding-statement": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: { statement: { leaf: "text" }, tags: { contract: "profile-topic-chip-run", optional: true } },
        why: "The executable legacy exposes a problem statement and optional tags, not source code; these remain one honest coding-proof description before submission evidence.",
    },
    "profile-coding-detail-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            header: { contract: "profile-proof-header" },
            section: { contract: "label-row-over-card", repeats: true, restingCount: 2 },
        },
        why: "One route-local coding-proof header orients the reader before independently bounded statement and submission-evidence sections.",
    },
    "profile-proof-metrics": {
        classes: ["grid", "grid-cols-2", "gap-3", "p-4", "sm:grid-cols-4"],
        children: { metric: { contract: "profile-proof-metric", repeats: true, restingCount: 4 } },
        why: "Four standing metrics remain equal peers, using two readable columns when narrow and one complete proof ribbon once space permits.",
    },
    "profile-proof-metric": {
        classes: ["flex", "flex-col", "gap-1"],
        children: { figure: { leaf: "text" }, label: { leaf: "text", props: { size: "xs", tone: "muted" } } },
        why: "A proof figure and its short qualifier are one metric sentence and must not drift into separate rows.",
    },
    "profile-project-card-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2"],
        children: { card: { contract: "profile-project-card", repeats: true, restingCount: 2 } },
        why: "Pinned project proofs stack when narrow and become equal peer cards only when each retains readable title and description width.",
    },
    "profile-project-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            badge: { leaf: "badge" },
            title: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            description: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            tech: { contract: "profile-project-tech-run", optional: true },
        },
        why: "Verification, project identity, optional description and its technology run form one bounded portfolio proof.",
    },
    "profile-project-tech-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: { tech: { leaf: "badge", repeats: true, restingCount: 3 } },
        why: "Technology facts are compact peers that wrap within their project instead of widening or truncating the project card.",
    },
    "profile-proof-summary": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            back: { leaf: "button" },
            title: { leaf: "heading" },
            meta: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            progress: { leaf: "progress", optional: true },
        },
        why: "The route-local back path, proof identity, qualifier and optional completion measure orient the reader before detailed evidence.",
    },
    "profile-detail-toolbar": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            search: { leaf: "input" },
            filter: { leaf: "button", optional: true },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "Search, optional filtering and result context form one route-local control row that wraps before any control becomes unreadable.",
    },
    "profile-roadmap-list": {
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "p-0"],
        children: { milestone: { composite: "evidence-row", repeats: true, restingCount: 4 } },
        why: "Ordered capstone milestones share one joined proof list whose separators preserve sequence without turning every milestone into a card.",
    },
    "profile-hero-rail": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "profile-name-role-stack" },
            bio: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            facts: { contract: "profile-fact-run", optional: true },
            proof: { contract: "profile-proof-row" },
            actions: { contract: "profile-action-row" },
            meta: { contract: "profile-meta-list", optional: true },
        },
        why: "Avatar, identity, optional context, public proof, one contextual action and supporting links form the frameless identity rail; no surface boundary may be invented around them.",
    },
    "profile-name-role-stack": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            name: { leaf: "heading" },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
            role: { leaf: "text", props: { size: "sm" }, optional: true },
        },
        why: "The public handle and optional role qualify the person's display name, so they remain one tight identity sentence instead of competing headings.",
    },
    "profile-fact-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            fact: { leaf: "badge", repeats: true, restingCount: 2 },
        },
        why: "Location and work mode are short peer facts that wrap together before either forces the identity column wider.",
    },
    "profile-proof-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "gap-2"],
        children: {
            fact: { leaf: "text", props: { size: "sm", weight: "semibold" }, repeats: true, restingCount: 2 },
        },
        why: "Follower and standing facts are peer social proof; one baseline lets them scan as evidence without turning either into a second profile heading.",
    },
    "profile-action-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-2", "[&>*:first-child]:grow"],
        children: {
            primary: { leaf: "button" },
            share: { leaf: "icon-button" },
        },
        why: "The contextual outcome owns the available width while share stays a compact secondary action beside it rather than competing as another primary.",
    },
    "profile-meta-list": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            item: { leaf: ["link", "text"], repeats: true, restingCount: 3 },
        },
        why: "External identities and joined date are supporting peer rows after the action, so they scan together without acquiring another card or heading.",
    },
    "profile-evidence-list": {
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "p-0"],
        children: {
            evidence: { composite: "evidence-row", repeats: true, restingCount: 3 },
        },
        why: "Proof records are peers of one joined list; full-width separators keep the scan continuous while each row owns its title, qualifier and trailing fact.",
    },
    "evidence-title-subtitle-fact-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "justify-between", "gap-4", "p-4", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow"],
        children: {
            identity: { contract: "evidence-title-over-subtitle" },
            fact: { leaf: ["badge", "text"], optional: true },
            disclosure: { leaf: "icon", optional: true },
        },
        why: "The title and qualifier own the available width while a short proof fact and optional disclosure remain scannable at the end without pushing the title into an anonymous second line.",
    },
    "evidence-title-over-subtitle": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            subtitle: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "The smaller line qualifies one proof title and therefore stays attached beneath it instead of becoming a peer fact elsewhere in the row.",
    },
    "dashboard-rail-then-main": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "md:gap-8", "px-6", "py-6", "md:flex-row", "md:items-start", "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0", "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow"],
        children: {
            rail: { contract: "dashboard-rail" },
            main: { contract: ["dashboard-main", "dashboard-tab-main", "centred-empty-notice"] },
        },
        why: "The learner rail keeps the product's fixed 288px reading width beside a flexible main column, then stacks above it on a narrow screen without becoming a card or a sticky viewport of its own.",
    },
    "dashboard-rail": {
        classes: ["flex", "w-full", "flex-col", "gap-6"],
        children: {
            section: { contract: ["stacked-stat-rows", "label-row-over-card"], repeats: true, restingCount: 2 },
        },
        why: "Identity facts and quick destinations form one bare 288px rail, so their labels align without an enclosing surface that would make the rail compete with the content cards.",
    },
    "dashboard-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            section: { contract: ["label-row-over-card", "explore-main"], repeats: true, restingCount: 8 },
        },
        why: "The production overview has eight product sections in a fixed reading order. They repeat at the product's 24px seam so each labelled surface reads as a separate part of the learner's overview rather than one long card; a refactor may not invent another section from data the product does not display.",
    },
    "dashboard-tab-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            section: { contract: "label-row-over-card", repeats: true, restingCount: 3 },
        },
        why: "A selected tab fills the main column with labelled sections that keep their legacy reading order and settle independently, so the tab orchestrates the order without owning any child request. Which sections a tab names is the tab's own content and not a second column shape.",
    },
    "label-row-over-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            label: { contract: ["title-with-end-action", "title-with-baseline-fact"] },
            body: { contract: "$content" },
        },
        why: "The label is held OUTSIDE the surface it names, so a section whose content is itself a set of cards never draws a card inside a card; label and owned surface use the ordinary gap-3 seam while major sections remain farther apart.",
    },
    "empty-notice-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            notice: { composite: "empty-notice" },
        },
        why: "The recovery notice needs one bounded ground beneath the section label so its message and way out read as the section's answer rather than as another section beside it.",
    },
    "empty-notice-stack": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "text-center"],
        children: {
            mark: { leaf: "icon-tile", optional: true },
            message: { leaf: "text", props: { size: "sm", tone: "muted" } },
            description: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            action: { leaf: "button", optional: true },
        },
        why: "A mark appears only when the legacy product gives the absence a generic visual identity; the settled answer and optional recovery action keep one centred reading order either way.",
    },
    "resume-item-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "medium" } },
            kind: { leaf: "text", props: { size: "sm", tone: "muted" } },
            resume: { leaf: "see-more-link", optional: true },
        },
        why: "The kind, title and way back into one content item share a bounded ground because none identifies the resumable item without the other two.",
    },
    "weekly-challenge-card": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            title: { composite: "weekly-challenge-title" },
            status: { composite: "weekly-challenge-status" },
            passed: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            finishers: { contract: "weekly-challenge-finishers", optional: true },
        },
        why: "The challenge title, timing/status, pass count and recent finishers are one bounded challenge story; the finisher rows become a nested joined list only when the story has entries.",
    },
    "weekly-challenge-title": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "w-full"],
        children: {
            glyph: { leaf: "icon", optional: true },
            title: { leaf: "text" },
        },
        why: "The challenge identity is one title line: the generic practice glyph leads the title and disappears during loading without changing the line's contract.",
    },
    "weekly-challenge-status": {
        classes: ["flex", "flex-row", "items-center", "justify-between", "gap-3", "w-full"],
        children: {
            endsIn: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: ["button", "badge"] },
        },
        why: "The countdown and the viewer's one available outcome share a single action row, so the outcome never becomes a second challenge section.",
    },
    "weekly-challenge-finisher-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full"],
        children: {
            avatar: { leaf: "avatar" },
            name: { leaf: "text" },
            passedAt: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "A recent finisher is identified by avatar and username with relative time trailing on the same baseline; it is not a generic account stat row.",
    },
    "weekly-challenge-finishers": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            finisher: { composite: "weekly-challenge-finisher-row", repeats: true, restingCount: 3 },
        },
        why: "Recent finishers are peers of one nested joined list: the full-width separators belong between rows, while avatar, username and relative time stay on each row.",
    },
    "job-readiness-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            percentile: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            metrics: { contract: "job-readiness-list" },
            action: { leaf: "button", optional: true },
        },
        why: "The readiness list owns its summary label and trailing band, while supporting percentile and next action remain outcomes of the whole assessment; the inner joined list is outlined because the outer card already supplies elevation.",
    },
    "job-readiness-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            row: { composite: "labelled-progress-row", repeats: true, restingCount: 3 },
        },
        why: "The scored readiness pillars are peers of one nested joined list, so one outlined surface and full-width rules preserve their shared result without adding a second shadow.",
    },
    "marked-row-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            // EXTENDED. The slot admitted only the composite, and the composite renders its own
            // `Tree` - so a row that must be PRESSED could not use this list at all. Admitting the
            // row contract lets a caller wrap the same anatomy in `PressableSurface` instead. The
            // `why` below is unchanged and still true of both: what makes them peers is the mark.
            //
            // A second list entry was the alternative and was refused: its class list would have
            // been identical to this one, which is what `no-duplicate-entry-shape` exists to catch.
            row: { composite: "task-progress-row", contract: "task-mark-title-fact-row", repeats: true, restingCount: 5 },
        },
        why: "Rows that each carry a completion mark are peers of one joined list, so a shared surface and a full-width rule - rather than card spacing - separate one row from the next, and the eye lands on the third row of two lists standing side by side at the same height. The mark is what makes them peers: something still to finish and something already true are one statement in two states, so the tick belongs to the row and is never re-drawn per list.",
    },
    "rank-title-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "w-full", "[&>*:first-child]:w-5", "[&>*:first-child]:shrink-0", "[&>*:first-child]:text-center", "[&>*:first-child]:tabular-nums", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            rank: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            title: { leaf: "text-link", props: { size: "sm" } },
        },
        why: "A ranked discovery result keeps its compact rank beside one actionable title; the title owns spare width while the fixed rank column remains comparable down the joined list.",
    },
    "avatar-identity-badge-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "name-over-handle" },
            badge: { leaf: "badge", optional: true },
            action: { leaf: "button" },
        },
        why: "A suggested identity is recognised first, qualified only when needed, and acted on last; the name stack therefore owns the flexible middle between avatar and follow action.",
    },
    "name-over-handle": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            name: { leaf: "text-link", props: { size: "sm" } },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The handle identifies the name without competing with it, so the two stay in one tight vertical identity stack.",
    },
    "activity-actor-body-time-row": {
        classes: ["flex", "flex-row", "items-start", "gap-3", "w-full", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            body: { contract: "activity-sentence-over-reaction" },
            time: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "An activity reads as actor, event and quiet timestamp on one row; the event owns the flexible middle while identity and recency stay visible at its edges.",
    },
    "activity-sentence-over-reaction": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            sentence: { contract: "activity-actor-action-target-sentence" },
            reaction: { leaf: "reaction-picker", optional: true },
        },
        why: "The optional reaction responds to the complete activity sentence, so it sits directly beneath that sentence rather than beside one fragment of it.",
    },
    "activity-actor-action-target-sentence": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            actor: { leaf: "text-link", props: { size: "sm" } },
            action: { leaf: "text", props: { size: "sm" } },
            target: { leaf: "text-link", props: { size: "sm" }, optional: true },
        },
        why: "Actor, action and optional target form one readable sentence, so they wrap together while preserving the two actionable names.",
    },
    "contribution-calendar-stack": {
        classes: ["flex", "flex-col", "gap-3", "w-full"],
        children: {
            heading: { contract: "contribution-calendar-heading-row" },
            grid: { leaf: "contribution-grid" },
            footer: { contract: "contribution-calendar-footer-row" },
        },
        why: "The year summary, one intrinsic contribution plot and its reading key form a single fixed visualization, so the composite closes those three regions without owning their DOM mechanics.",
    },
    "contribution-calendar-heading-row": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            total: { leaf: "text", props: { size: "xs", tone: "muted" } },
            years: { leaf: "choice-tabs" },
        },
        why: "The activity total identifies one contribution plot while the year is a compact parameter of that same plot, so its primary segmented choice sits at the trailing edge rather than becoming a ShellNav-style secondary navigation line.",
    },
    "contribution-calendar-footer-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            streak: { leaf: "text", props: { size: "sm" } },
            intensity: { leaf: "contribution-intensity-legend" },
        },
        why: "The streak result and the intensity key explain the same plot from opposite ends of one footer, while the plot itself remains an intrinsic leaf.",
    },
    "trending-content-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            item: { composite: "trending-content-row", repeats: true, restingCount: 6 },
        },
        why: "Trending content is one ranked joined list, so full-width rules preserve the scan from rank to title without turning every result into a card.",
    },
    "activity-feed-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            activity: { composite: "activity-row", repeats: true, restingCount: 3 },
        },
        why: "Activities on one day are peers in one joined list, so their actor, event and response remain rows separated by full-width rules.",
    },
    "suggested-user-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            user: { composite: "suggested-user-row", repeats: true, restingCount: 4 },
        },
        why: "Suggested people are one scan of comparable identities, so one joined surface and full-width rules keep profile and follow action together.",
    },
    "explore-main": {
        classes: ["flex", "flex-col", "gap-6", "w-full"],
        children: {
            feed: { contract: "feed-explorer" },
            suggestions: { contract: "suggested-user-list", optional: true },
        },
        why: "Discovery feed and follow suggestions are independent product blocks, so the page keeps one large seam between their separate request lifetimes.",
    },
    "feed-explorer": {
        classes: ["flex", "flex-col", "gap-6", "w-full"],
        children: {
            trending: { contract: "trending-content-list", optional: true },
            stream: { contract: "feed-stream" },
        },
        why: "Trending and the controlled activity stream are major discovery regions; each keeps its own state and a large page seam.",
    },
    "feed-stream": {
        classes: ["flex", "flex-col", "gap-3", "w-full"],
        children: {
            filters: { contract: "dual-tabs-toolbar" },
            feed: { contract: "activity-feed-result" },
            paginationError: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            pagination: { leaf: "button", optional: true },
        },
        why: "The filter toolbar and the governed result are separate operated units, so their seam is the ordinary gap-3; the quieter day-to-card chronology owns its own tighter seam below.",
    },
    "activity-feed-result": {
        classes: ["flex", "flex-col", "gap-2", "w-full"],
        children: {
            day: { contract: "activity-day-group", repeats: true, restingCount: 2, optional: true },
            notice: { contract: "empty-notice-card", optional: true },
        },
        why: "A feed settles into day-grouped joined lists or one explicit empty/error result; both occupy the same governed result region below its filters.",
    },
    "activity-day-group": {
        classes: ["flex", "flex-col", "gap-2", "w-full"],
        children: {
            subtitle: { leaf: "text", props: { size: "sm", tone: "muted" } },
            list: { contract: "activity-feed-list" },
        },
        why: "A local-day marker is supporting context for the joined activity rows below it, so the muted subtitle stays outside the shared list surface with one close seam.",
    },
    "dual-tabs-toolbar": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            leading: { leaf: "choice-tabs" },
            trailing: { leaf: "choice-tabs" },
        },
        why: "Two independent primary-tab axes govern one result set; they share a toolbar row but keep their own selection and accessible label without invented container chrome.",
    },
    "changelog-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            entry: { composite: "changelog-entry-row", repeats: true, restingCount: 4 },
        },
        why: "Changelog entries are dated peers of one joined history, so a full-width rule separates releases while one shared surface keeps their date, category, title and body in the same reading column.",
    },
    "changelog-entry-row": {
        classes: ["flex", "w-full", "flex-col", "gap-3"],
        children: {
            meta: { contract: "date-category-row" },
            title: { leaf: ["text", "text-link"], props: { size: "sm" } },
            body: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "A changelog entry reads as one closed dated statement: its date and category qualify the title, while the smaller muted body explains that same update beneath it.",
    },
    "date-category-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            date: { leaf: "text", props: { size: "xs", tone: "muted" } },
            category: { leaf: "badge", optional: true },
        },
        why: "The date and category are peer metadata for one update, so they share a compact line before the update title begins.",
    },
    "contribution-calendar-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            calendar: { composite: "contribution-calendar" },
        },
        why: "The year choice, activity grid, intensity key and streak caption explain one another, so they stay in one bounded calendar surface rather than becoming four dashboard sections.",
    },
    "weekly-goals-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            summary: { leaf: "text", props: { size: "sm", weight: "medium" } },
            goals: { contract: "bordered-goal-grid" },
        },
        why: "The week's summary and six comparable goals share one bounded ground; the summary qualifies the grid as a whole rather than pretending to be a seventh metric.",
    },
    "bordered-goal-grid": {
        classes: ["grid", "grid-cols-2", "overflow-hidden", "rounded-3xl", "border", "border-separator", "[&>*]:p-3", "[&>*:nth-child(odd)]:border-r", "[&>*:nth-child(-n+4)]:border-b", "[&>*]:border-separator"],
        children: {
            goal: { composite: "labelled-progress-row", repeats: true, restingCount: 6 },
        },
        why: "Weekly goals are compact peer measures read across two columns. A full outer border and shared row and column seams keep all six cells one grid instead of six cards.",
    },
    "course-progress-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            course: { composite: "course-progress-row", repeats: true, restingCount: 2 },
        },
        why: "Enrolled courses are peers of one joined list; full-width separators preserve the legacy scan while each row keeps one whole-course destination.",
    },
    "course-progress-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-4", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: "icon-tile" },
            body: { contract: "course-progress-body" },
        },
        why: "The course mark identifies the destination while title, status, segmented progress and legend stay one readable body inside the same press target. Hover is answered by the TITLE, which underlines like the link it stands for, so the row itself does not also dim - one gesture gets one answer, and the answer names what will open.",
    },
    "course-progress-body": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-3"],
        children: {
            heading: { contract: "course-progress-heading" },
            progress: { contract: "segmented-progress-track" },
            legend: { contract: "progress-dimension-legend" },
        },
        why: "The progress picture and its legend explain the course heading directly beneath it, so all three stay one compact row body.",
    },
    "course-progress-heading": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-2"],
        children: {
            title: { leaf: "text", props: { size: "md", weight: "semibold" } },
            trial: { leaf: "badge", optional: true },
            percent: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The title owns the first reading position while optional trial truth and the overall percentage remain short trailing qualifiers on the same line. It is the NAME of the destination the whole row opens, so it reads at the step a name takes rather than at the step of the figures beside it.",
    },
    "segmented-progress-track": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-1"],
        children: {
            segment: { leaf: "progress", repeats: true, restingCount: 3 },
        },
        why: "Content, challenge and milestone completion are distinct dimensions but one course outcome, so three adjacent bars make their contribution inspectable without inventing separate cards.",
    },
    "progress-dimension-legend": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-3"],
        children: {
            dimension: { contract: "status-dot-with-label", repeats: true, restingCount: 3 },
        },
        why: "The three semantic marks and resolved counts wrap as one explanatory legend directly under the segmented track.",
    },
    "status-dot-with-label": {
        classes: ["flex", "flex-row", "items-center", "gap-2"],
        children: {
            mark: { leaf: "status-dot" },
            label: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "A tiny semantic mark stays attached to the progress dimension it identifies, while the words carry the actual meaning and count.",
    },
    "recommended-course-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: { course: { composite: "recommended-course-row", repeats: true, restingCount: 3 } },
        why: "Recommendations are comparable course offers in one joined surface, so title, pricing and reason remain attached to each destination row.",
    },
    "recommended-course-row": {
        classes: ["flex", "w-full", "flex-row", "items-start", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: { mark: { leaf: "icon-tile" }, body: { contract: "recommended-course-body" } },
        why: "The course mark leads one whole-row destination while its commerce facts stay in one flexible reading column.",
    },
    "recommended-course-body": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-1"],
        children: { title: { leaf: "text", props: { size: "md", weight: "semibold" } }, price: { contract: "price-discount-line" }, note: { contract: "price-note-row", optional: true }, reason: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true } },
        why: "Title, price, what that price saves beside the way to see how it was reached, and why this course is being suggested at all: one offer sentence ordered from identity to decision evidence. It carries NO course description - a paragraph in a row a reader is scanning is the one thing they skip, and it pushed the price, the saving and the reason for both below the fold of the row.",
    },
    "price-discount-line": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: { price: { leaf: "text", props: { size: "sm", weight: "semibold" } }, original: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true }, discount: { leaf: "badge", optional: true } },
        why: "The payable price leads while original price and discount qualify that same commerce fact on one wrapping line.",
    },
    "upcoming-livestream-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: { session: { composite: "upcoming-livestream-row", repeats: true, restingCount: 3 } },
        why: "Upcoming sessions are time-ordered peers in one joined list, with separators preserving a fast scan to the next occurrence.",
    },
    "upcoming-livestream-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: { mark: { leaf: "icon-tile" }, body: { contract: "evidence-title-over-subtitle" }, time: { leaf: "text", props: { size: "xs", tone: "muted" } } },
        why: "The live mark identifies the event, title owns the flexible middle and concrete timing stays visible at the trailing edge of the same destination row.",
    },
    "leaderboard-card": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: { standing: { composite: "leaderboard-standing-row", optional: true }, list: { contract: "ranked-user-list" } },
        why: "Viewer standing explains the ranked identities beneath it, so both share one competition surface while the joined list keeps its own separators.",
    },
    "leaderboard-standing-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: { mark: { leaf: "league-tile" }, body: { contract: "evidence-title-over-subtitle" }, fact: { leaf: "badge", optional: true } },
        why: "The rank artwork fixes the viewer's current place and the standing sentence sits directly against it, because the two are one statement; the body owns the spare width so an optional tier fact still settles at the far edge without the sentence drifting there when no fact exists.",
    },
    "standing-hero-card": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: { standing: { composite: "leaderboard-standing-row" }, goal: { contract: "standing-goal-meter", optional: true }, action: { leaf: "button" } },
        why: "A standing that comes with a way to change it is one story: where the learner is, how far the next place is, and the single action that closes the gap.",
    },
    "standing-goal-meter": {
        classes: ["flex", "flex-col", "gap-2"],
        children: { label: { leaf: "text", props: { size: "xs", tone: "muted" } }, progress: { leaf: "progress" } },
        why: "The distance still to cover is stated in words directly above the bar that measures it, because a bar on its own tells a learner how full something is and never what it would take to fill it.",
    },
    "podium": {
        classes: ["flex", "flex-row", "items-end", "justify-center", "gap-4", "w-full", "[&>*:nth-child(1)]:order-2", "[&>*:nth-child(2)]:order-1", "[&>*:nth-child(3)]:order-3"],
        children: { place: { composite: "podium-place", repeats: true, restingCount: 3 } },
        why: "The top three are not comparable peers in a list — the champion is raised and centred because finishing first is the one fact this arrangement exists to state, and the dais order is the node's business so the places themselves stay in rank order for anyone reading them in sequence.",
    },
    "podium-place": {
        classes: ["flex", "flex-col", "items-center", "gap-2"],
        children: { mark: { leaf: "rank-mark", props: { placement: "row" } }, avatar: { leaf: "avatar" }, name: { leaf: "text" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, step: { leaf: "podium-step" } },
        why: "One finisher reads top-down as medal, face, name, score, then the step that fixes their place: the artwork names the award while the step height carries the ordering, so neither has to be read off the other.",
    },
    "league-page-column": {
        // The same measure and inset the dashboard uses. The leaderboard is reached from there and
        // returns there, so a second page width would make the chrome appear to shift on a
        // navigation that did not change anything about where the reader is.
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            scope: { contract: "scope-switch-row" },
            board: { contract: "league-board-stack" },
        },
        why: "The board is one reading column: where the reader is and what this page is, which competition is being read, then that competition — so switching scope changes the answer beneath the question rather than moving the question.",
    },
    "scope-switch-row": {
        // A row, so the switch takes the width of its two words. In the page column it was a
        // direct child of a `flex-col`, which stretches its children - and a segmented control
        // spanning the whole measure reads as a band the page is divided by rather than as one
        // control the reader can press.
        classes: ["flex", "flex-row"],
        children: { tabs: { leaf: "choice-tabs" } },
        why: "The scope switch is a control, not a divider: it is as wide as the choice it offers, so the page beneath it stays the thing being read rather than the thing being framed.",
    },
    "page-header-stack": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            trail: { leaf: "breadcrumbs", optional: true },
            title: { leaf: "heading" },
        },
        why: "Where the reader came from is a smaller fact than where they are, so the trail sits above the title at its own scale rather than competing with it on one line.",
    },
    "league-board-stack": {
        classes: ["flex", "flex-col", "gap-6"],
        children: {
            hero: { contract: "standing-hero-card" },
            podium: { contract: "podium", optional: true },
            list: { contract: "ranked-user-followable-list" },
        },
        why: "The viewer's own standing comes first because it is the only row they cannot find by scanning, then the three places that are not comparable to anything, then everyone who is.",
    },
    "ranked-user-followable-list": {
        /*
         * The same joined list, plus one track for the follow control.
         *
         * The width lives HERE rather than on the row because whether a board is followable is a
         * property of the BOARD: the dashboard preview has no follow control anywhere and must not
         * reserve a gutter for one, while every row of the leaderboard page needs the same reserved
         * width whether or not that particular row happens to carry a button - the viewer's own row
         * does not, and without the reserved track its score would sit further right than everyone
         * else's. One override on the list keeps both facts in one place instead of forking every
         * row contract in three.
         */
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4", "[&>*:first-child]:rounded-t-3xl", "[&>*:last-child]:rounded-b-3xl", "[&>*]:grid-cols-[auto_auto_1fr_5rem_2.5rem_7rem]"],
        children: { user: { composite: "ranked-user-row", repeats: true, restingCount: 5 } },
        why: "A board a reader can act on reserves the same room for that action on every row, so the scores stay in one column whether or not a given learner can be followed.",
    },
    "ranked-user-ellipsis-row": {
        classes: ["flex", "flex-row", "items-center", "justify-center", "gap-2", "py-2"],
        children: { label: { leaf: "text", props: { size: "xs", tone: "muted" } } },
        why: "A pinned self row far below the fetched slice must announce the gap, because placing it directly under the last row asserts an adjacency that is false.",
    },
    "ranked-user-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4", "[&>*:first-child]:rounded-t-3xl", "[&>*:last-child]:rounded-b-3xl"],
        children: { user: { composite: "ranked-user-row", repeats: true, restingCount: 5 } },
        why: "Ranked identities are comparable peers in one joined list, so rank, identity, points and row action align across the board.",
    },
    "ranked-user-row": {
        classes: ["grid", "w-full", "grid-cols-[auto_auto_1fr_5rem_2.5rem]", "items-center", "gap-3", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(4)]:text-right"],
        children: { rank: { leaf: "rank-mark", props: { placement: "row" } }, avatar: { leaf: "avatar" }, identity: { contract: "ranked-user-name-over-subtitle" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, movement: { leaf: ["rank-delta-caret", "badge", "text"] }, follow: { leaf: "button", optional: true } },
        why: "Rank artwork and avatar identify the learner, identity owns spare width, points stay comparable and one movement or follow outcome remains subordinate at the row end.",
    },
    "ranked-user-row-success-verdict": {
        classes: ["grid", "w-full", "grid-cols-[auto_auto_1fr_5rem_2.5rem]", "items-center", "gap-3", "pl-4", "inset-shadow-[2px_0_0_0_var(--success)]", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(4)]:text-right"],
        children: { rank: { leaf: "rank-mark", props: { placement: "row" } }, avatar: { leaf: "avatar" }, identity: { contract: "ranked-user-name-over-subtitle" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, movement: { leaf: ["rank-delta-caret", "badge", "text"] }, follow: { leaf: "button", optional: true } },
        why: "The same comparable row keeps a two-pixel success band inset on its left edge because positive movement belongs to this learner's data — and the band stays square, because the one border in this picture is the list's.",
    },
    "ranked-user-row-danger-verdict": {
        classes: ["grid", "w-full", "grid-cols-[auto_auto_1fr_5rem_2.5rem]", "items-center", "gap-3", "pl-4", "inset-shadow-[2px_0_0_0_var(--danger)]", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(4)]:text-right"],
        children: { rank: { leaf: "rank-mark", props: { placement: "row" } }, avatar: { leaf: "avatar" }, identity: { contract: "ranked-user-name-over-subtitle" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, movement: { leaf: ["rank-delta-caret", "badge", "text"] }, follow: { leaf: "button", optional: true } },
        why: "The same comparable row keeps a two-pixel danger band inset on its left edge because negative movement belongs to this learner's data — and the band stays square, because the one border in this picture is the list's.",
    },
    "ranked-user-name-over-subtitle": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: { name: { leaf: ["text", "text-link"] }, subtitle: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true } },
        why: "The optional movement or viewer qualifier stays directly beneath the learner name so both read as one identity while the row keeps its trailing comparison column.",
    },
    "streak-summary-card": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            summary: { contract: "streak-week-with-outcome" },
            nudge: { contract: "streak-daily-nudge", optional: true },
        },
        why: "The seven-day run and the next learning action share one bounded ground because the action explains how a quiet day becomes an active one.",
    },
    "streak-week-with-outcome": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4"],
        children: {
            week: { composite: "streak-week-run" },
            outcome: { contract: ["streak-empty-prompt", "streak-active-summary"] },
        },
        why: "The seven day marks stay together at the start while their meaning and next action stay together at the end, matching the production strip without reserving a false fixed-width aside.",
    },
    "streak-week-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            day: { leaf: "day-cell", repeats: true, restingCount: 7 },
        },
        why: "Seven day cells form one fixed week run, so they move as one compact sequence rather than each caller rebuilding the row and its resting count.",
    },
    "streak-empty-prompt": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-center", "gap-4"],
        children: {
            message: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "button", props: { size: "sm", variant: "primary" } },
        },
        why: "The explanation and the one action that resolves it are one prompt, so they remain adjacent instead of being split into a detached dashboard statistic.",
    },
    "streak-active-summary": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            current: { leaf: "text", props: { size: "sm", weight: "medium" } },
            record: { leaf: "badge" },
        },
        why: "The current run and record are one compact reading, so neither receives a separate column, an invented fixed width or a decorative business glyph.",
    },
    "streak-daily-nudge": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4"],
        children: {
            message: { leaf: "text", props: { size: "sm", weight: "medium" } },
            action: { leaf: "button", props: { size: "sm", variant: "primary" } },
        },
        why: "When an existing streak is still idle today, its reminder and preserving action form one decision row beneath the week rather than another dashboard section.",
    },
    "glyph-title-fact-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            glyph: { leaf: "icon", props: { size: "sm" } },
            title: { leaf: "text", props: { size: "md", tone: "default" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The glyph identifies the row faster than its name does, so it leads the line and the fact trails it - and the name between them takes the slack, because a long one must clip rather than push the figure off the end of the row.",
    },
    "glyph-peer-fact-row": {
        classes: ["flex", "flex-row", "items-center", "justify-between", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            glyph: { leaf: "icon", props: { size: "sm" } },
            title: { leaf: "text", props: { size: "sm", tone: "default" } },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "A compact identity statistic names one standing fact and prints its current value at the same reading rank, while tone still distinguishes the trailing value.",
    },
    "task-mark-title-fact-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: "icon" },
            title: { leaf: "text", props: { size: "sm" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The completion mark identifies task state, the title owns the flexible middle, and the quiet target remains aligned at the far edge of every joined row.",
    },
    "label-fact-over-progress": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            line: { contract: "label-with-muted-fact-row" },
            progress: { leaf: "progress" },
        },
        why: "The figure belongs to the label while the bar explains that pair, so the line stays directly above its measure.",
    },
    "label-with-muted-fact-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "A joined list may qualify its own rows with a semibold label and a smaller muted fact on one baseline; without peer identities outside the list there is no reason to add a leading glyph.",
    },
    "resume-card-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2", "lg:grid-cols-3"],
        children: {
            card: { contract: "resume-item-card", repeats: true, restingCount: 3 },
        },
        why: "Resume cards retain the legacy one/two/three-column run: one on a phone, two at the middle measure, and three beside the dashboard rail so the next choices remain comparable without shrinking their copy.",
    },
    "label-field-hint": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            label: { leaf: "label" },
            field: { leaf: ["input", "field"] },
            hint: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "The hint belongs under the control it explains rather than beside the label, because a reader reaches the hint after failing at the control and not before trying it.",
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
            tool: { leaf: ["icon-button", "account-menu"], repeats: true, restingCount: 3 },
        },
        why: "The desktop field controls and round action buttons share one centred row, so controls with different intrinsic heights still sit on the same navbar axis.",
    },
    "desktop-navbar-tools": {
        classes: ["hidden", "items-center", "gap-2", "md:flex"],
        children: {
            search: { leaf: "pressable-input-like" },
            locale: { leaf: "language-menu" },
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
    "centred-page-column": {
        classes: ["mx-auto", "flex", "w-full", "max-w-md", "flex-col", "gap-6"],
        children: {
            header: { contract: "centred-title-pair" },
            body: {
                contract: ["auth-entry-stack", "stacked-peer-controls", "centred-title-pair", "spread-choice-row"],
                leaf: ["form", "divider"],
                repeats: true,
                restingCount: 0,
            },
            footer: { contract: ["spread-choice-row", "centred-prompt-row"], optional: true },
        },
        why: "A surface read one control at a time is centred and narrow on purpose: a form that runs the width of a desktop screen makes the eye travel between a label and the box it names.",
    },
    "auth-entry-stack": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            shortcuts: { contract: "auth-shortcuts-over-divider" },
            credentials: { leaf: "form" },
        },
        why: "Authentication has exactly two entry blocks: OAuth closed by the OR divider above, and the credential form below. This node alone owns the seam between them, and it stays at gap-3 because the divider has already closed the shortcut choice: a boundary that is drawn does not also need to be spaced. The controls INSIDE the form take the wider seam, because those are small blocks of one function and nothing else marks where each of them ends.",
    },
    "centred-title-pair": {
        classes: ["flex", "flex-col", "gap-3", "items-center", "text-center"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm" } },
        },
        why: "The supporting line sits under the title rather than beside it, because it explains the title rather than qualifying it - and both are centred so the pair reads as the surface's own name rather than as the first row of its content.",
    },
    "auth-shortcuts-over-divider": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            shortcut: { leaf: "button", repeats: true, restingCount: 2 },
            divider: { leaf: "divider" },
        },
        why: "OAuth shortcuts and the OR divider are one alternative-entry cluster: the divider closes the shortcut choice before the credential form begins, so it keeps the cluster's gap rather than the larger seam between form groups.",
    },
    "stacked-peer-controls": {
        classes: ["flex", "flex-col", "gap-4", "[&>*]:w-full"],
        children: {
            control: {
                contract: "spread-choice-row",
                leaf: ["button", "confirm-button", "quick-action-row", "quick-actions-list", "text"],
                composite: ["field", "labelled-progress-row", "stat-row"],
                repeats: true,
                restingCount: 3,
            },
        },
        why: "Controls repeat down one column as independently readable field or action units, so the ordinary gap-3 keeps each decision legible while their shared width still makes the run read as one form.",
    },
    "stacked-stat-rows": {
        classes: ["flex", "flex-col", "p-0", "[&>*]:w-full", "[&>*]:p-2"],
        children: {
            stat: { composite: "stat-row", repeats: true, restingCount: 3 },
        },
        why: "Standing figures read like peer select rows: no parent inset and no gap interrupt the scan, while every row owns p-2 so its icon, label and value share the same select-like element geometry as the list below.",
    },
    "profile-over-stat-rows": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            profile: { composite: "profile-row" },
            stats: { contract: "stacked-stat-rows" },
        },
        why: "The person anchors the identity cluster before their three standing figures, and the profile-to-list seam is wider than the zero seam between rows because those are two groups.",
    },
    "profile-avatar-name-handle-disclosure-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "justify-between", "gap-3", "px-2", "py-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "profile-name-over-handle" },
            disclosure: { leaf: "icon", optional: true },
        },
        why: "The avatar identifies the profile, the name stack owns the available width, and the trailing disclosure makes the whole row's destination explicit.",
    },
    "profile-name-over-handle": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            name: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The handle qualifies the display name without competing with it, so both remain one tight identity stack.",
    },
    "spread-choice-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            choice: { leaf: ["checkbox", "text-link"] },
            exit: { leaf: "text-link", props: { size: "sm" }, optional: true },
        },
        why: "A choice and the way out of it are pushed to opposite ends of one line, because they are peers that a reader picks BETWEEN rather than a label and the thing it names.",
    },
    "centred-prompt-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-center", "gap-2"],
        children: {
            prompt: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "text-link", props: { size: "sm" } },
        },
        why: "A question and its answer read as one sentence, so they share a line and are centred together - split across two lines they read as two separate offers.",
    },
    "centred-empty-notice": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "p-4", "text-center"],
        children: {
            notice: { composite: "empty-notice" },
        },
        why: "An empty region still has to offer a way out, so the recovery action is part of this node rather than something a caller remembers to add beside it.",
    },
    /*
     * PROPOSED - learn-content-page. Target path on materialization: the locked table.
     *
     * The reader read top to bottom: where this content sits and what it is called, which of the
     * content's own faces is open, the face itself, then what the reader does next. Everything below
     * the body is evidence about the content rather than the content, which is why they are peers of
     * the body rather than parts of it.
     */
    /*
     * PROPOSED - the reader, rebuilt from `pages/ContentPage` at 9a19342 rather than from a
     * reading of it. The legacy page is three blocks at one seam - header, tab bar, and a
     * ZERO-gap column holding the reading region above its footer - and that last seam is the
     * detail a redrawing loses: reading region, footer and advertisement sit flush there, each
     * owning its own trailing space, because a gap between them would separate a content from the
     * chrome that belongs to it.
     */
    "content-reading-column": {
        classes: ["flex", "w-full", "min-w-0", "flex-col"],
        children: {
            reading: { contract: "content-reading-paper" },
            footer: { contract: "content-reader-footer", optional: true },
        },
        why: "The content and the chrome under it are one continuous reading, so nothing separates them: each block already closes with its own trailing space, and a seam here would read as the page changing subject between the article and the reactions to it.",
    },
    "content-reading-paper": {
        classes: ["mx-auto", "flex", "w-full", "min-w-0", "max-w-app-md", "flex-col", "gap-4", "p-4"],
        children: {
            hint: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            article: { leaf: "article" },
            paywall: { composite: "empty-notice", optional: true },
        },
        why: "The article is read on a raised page of its own - the paper - which is what separates a content from the chrome around it at a glance. A locked content keeps that paper and its faded article, and the paywall joins it INSIDE rather than replacing it: the reader is shown what they would be reading, which is the whole argument for paying.",
    },
    "content-reader-footer": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-6"],
        children: {
            reactions: { contract: "content-reaction-card", optional: true },
            discussion: { contract: "content-discussion-panel", optional: true },
            next: { contract: "content-next-list", optional: true },
            pager: { leaf: "pagination", optional: true },
        },
        why: "What follows a content is a run of major blocks rather than parts of one: reactions, discussion, where to go next, and the content's place in its module each stand alone, so they take the block seam rather than the group seam. The whole footer is absent on a locked content, because there is nothing to react to, discuss or page past yet.",
    },
    "content-discussion-panel": {
        host: "section",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-4", "p-4"],
        children: {
            title: { leaf: "heading" },
            composer: { leaf: "textarea", optional: true },
            submit: { leaf: "button", optional: true },
            notice: { composite: "empty-notice", optional: true },
            list: { contract: "content-discussion-list", optional: true },
        },
        why: "The lesson discussion keeps its heading, one top-level composer and the settled comment answer in one reading-width block, so submitting changes the action state without moving the thread away from the content it discusses.",
    },
    "content-discussion-list": {
        host: "ul",
        classes: ["flex", "w-full", "flex-col", "divide-y", "divide-separator"],
        children: {
            comment: { contract: "content-discussion-comment-row", repeats: true, restingCount: 3 },
        },
        why: "Top-level comments are peer responses to the same lesson, so they form one ordered list with a stable separator rather than unrelated cards competing with the article.",
    },
    "content-discussion-comment-row": {
        host: "li",
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-2", "py-3"],
        children: {
            author: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            meta: { leaf: "text", props: { size: "xs", tone: "muted" } },
            body: { leaf: "text", props: { size: "sm" } },
        },
        why: "A comment is read as author, time-and-reply context, then body; keeping that order inside one list row prevents metadata from being mistaken for part of the authored response.",
    },
    "content-reaction-card": {
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-row", "items-center", "gap-3", "p-4", "[&>*:first-child]:grow"],
        children: {
            prompt: { leaf: "text", props: { size: "sm", tone: "muted" } },
            reactions: { leaf: "reaction-picker" },
        },
        why: "The reaction stands on its own ground rather than loose under the article, which is what stops it reading as the last line of the content - and it keeps the reading measure so the control sits under the words it belongs to.",
    },

    /*
     * PROPOSED - the reader's frame, and the two rails the plan record puts INSIDE this work item
     * rather than in the shell: `learn-content-page` settles the content body, the contents panel,
     * the on-this-page outline, the pager and the paywall boundary.
     *
     * Revision 1.2 shipped the middle column alone and called the rails somebody else's job. They
     * are not: a reading measure is only a decision once you can see what stands beside it, and a
     * content read without the map it sits in is a different product - the reader loses both where
     * they are in the course and where they are in the page.
     *
     * The spine - the eleven learn modes - stays out, because that one IS the shell layout's item
     * and hangs every other mode off it.
     */
    "content-reader-frame": {
        classes: [
            "mx-auto", "flex", "w-full", "min-w-0", "max-w-app-xl", "flex-col", "items-start", "gap-6", "px-6", "py-6",
            "md:flex-row", "md:items-start", "md:gap-8",
            "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0",
            "md:[&>*:first-child]:sticky", "md:[&>*:first-child]:top-rail",
            "md:[&>*:first-child]:self-start", "md:[&>*:first-child]:max-h-rail",
            "md:[&>*:first-child]:overflow-y-auto",
            "md:[&>*:nth-child(2)]:min-w-0", "md:[&>*:nth-child(2)]:grow",
            "md:[&>*:last-child]:w-72", "md:[&>*:last-child]:shrink-0",
            "md:[&>*:last-child]:sticky", "md:[&>*:last-child]:top-rail",
            "md:[&>*:last-child]:self-start", "md:[&>*:last-child]:max-h-rail",
            "md:[&>*:last-child]:overflow-y-auto",
        ],
        children: {
            contents: { contract: "content-map-panel" },
            main: { contract: "learn-content-page" },
            outline: { contract: "content-outline-rail", optional: true },
        },
        why: "Where the reader is in the COURSE stands on one side and where they are in the PAGE on the other, so the content keeps the flexible middle and neither answer costs it a scroll. Both rails follow the reader down a long content and scroll on their own, because a map that leaves the screen is a map consulted by scrolling back. The outline is absent rather than empty when a body carries no headings - a tab of cards has nothing to outline, and an empty rail would take width from the reading for nothing.",
    },
    "content-map-panel": {
        host: "nav",
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-4"],
        children: {
            progress: { composite: "labelled-progress-row" },
            search: { leaf: "search-box" },
            module: { contract: "content-map-module", repeats: true, restingCount: 4 },
        },
        why: "The map answers three questions in the order they are asked: how far in am I, where is the thing I remember, and what else is in this course. Search sits above the tree rather than inside it because it filters the whole tree, and the modules are the same disclosing row the curriculum already uses - one content list, not a second one that drifts.",
    },
    "content-map-module-summary": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "items-center", "gap-3", "px-3", "py-2", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow", "[&>*:nth-child(2)]:shrink-0", "[&>*:last-child]:shrink-0"],
        children: {
            title: { leaf: "text", props: { size: "sm" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
            caret: { leaf: "icon", props: { role: "chip" } },
        },
        why: "A module names itself, says how much of it is done, and says whether it is open - three facts on one line, in the order a reader scanning a map needs them. The caret sits at the far end because it is the control, and a control between the name and its count would be pressed by somebody reaching for the count.",
    },
    "content-map-module": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-1"],
        children: {
            title: { contract: "content-map-module-summary" },
            row: { leaf: "content-map-row", repeats: true, restingCount: 0 },
        },
        why: "A module is its name and the contents under it, so the name and its count share one line and the contents sit at the tightest seam beneath - one identity, not a heading over an unrelated list. A module the reader has not opened carries no rows at all rather than an empty run, because the map is scanned by module first.",
    },
    "content-outline-rail": {
        host: "nav",
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm", tone: "muted" } },
            heading: { leaf: "nav-link", props: { kind: "section" }, repeats: true, restingCount: 5 },
        },
        why: "The outline is a named list of places in the current content, so it takes the owner-to-owned seam under its label and the tighter seam between the destinations themselves. They are links rather than lines of text because each one moves the reader.",
    },

    "learn-content-page": {
        // The reader IS this screen, so it opens the document's one main landmark itself rather
        // than being posted inside somebody else's - which is what let a review harness draw a
        // second one, and what a rule caught before any of it was seen.
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            faces: { contract: "dual-tabs-toolbar", optional: true },
            body: { contract: ["content-reading-column", "centred-empty-notice", "source-workspace-root"] },
        },
        why: "A content is read straight down one measure until its selected face replaces the body with the source workspace; locked and failed content still replace that same body slot rather than decorating it.",
    },
    /*
    /*
     * PROPOSED - content-next-list and content-next-row. Target path on materialization: the locked table.
     *
     * Legacy draws an up-next card and a related-content list beneath the content. Both answer one
     * question - where does the reader go from here - so they are one joined list of destinations
     * rather than two surfaces. The row carries no completion mark: a tick would promise something
     * to finish, and these are places to open.
     */
    "content-next-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            step: { contract: "content-next-row", repeats: true, restingCount: 2 },
        },
        why: "Where a content leads is a short run of peers read in order, so they share one surface and a full-width rule separates each from the next - the same joined list the dashboard reads, and the reason a reader can tell two destinations apart without two cards.",
    },
    "content-next-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-3", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow"],
        children: {
            label: { leaf: "text", props: { size: "md" } },
            disclosure: { leaf: "icon", optional: true },
        },
        why: "The destination owns the width and the glyph at the end says the row opens something; the pair reads as one line rather than as a label with an ornament, which is what a tick would have made it.",
    },
    "courses-catalog-page": {
        // The same measure and inset the dashboard and the leaderboard use. A catalog reached from
        // the navbar and returned to must not appear to shift the chrome, so the page width belongs
        // to the product rather than to this page. An earlier revision carried no measure at all:
        // the preview harness supplied padding the entry did not, so it looked correct until it
        // finally had a route and rendered flush against the viewport edge.
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            toolbar: { contract: "catalog-search-count-view-row" },
            owned: { contract: "course-progress-list", optional: true },
            discover: { contract: "catalog-section-group", optional: true },
            notice: { composite: "empty-notice", optional: true },
            pager: { leaf: "pagination", optional: true },
        },
        why: "One toolbar narrows both groups at once, so it is a peer of them rather than something either group owns, and every region on the route keeps the same seam instead of choosing its own spacing.",
    },
    "course-qa-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            composer: { contract: "catalog-search-count-view-row" },
            thread: { contract: "catalog-section-group", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "Course Q&A keeps search and the inline question composer together before the selected question-or-reply thread; settled empty and failed states replace that thread without turning the route into a course catalog.",
    },
    "course-headhuntings-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            search: { contract: "catalog-search-count-view-row" },
            directories: { contract: "catalog-section-group", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The headhunting directory reads from course identity through one company query into the company and consultant runs it narrows; empty and failed outcomes replace those directories in place.",
    },
    "course-headhunting-company-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            actions: { contract: "catalog-search-count-view-row" },
            profile: { contract: "catalog-section-group", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "One company profile keeps back and contact actions ahead of its description and consultant contacts; not-found and failed outcomes replace the profile while preserving the company route identity.",
    },
    "catalog-search-count-view-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4"],
        children: {
            search: { contract: "catalog-query-with-count" },
            view: { leaf: "choice-tabs" },
        },
        why: "Typing narrows the list and the layout choice reshapes what typing left, so the row has two ends: the question and its answer on one side, the shape that answer is drawn in on the other.",
    },
    "catalog-query-with-count": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "[&>*:last-child]:shrink-0"],
        children: {
            query: { leaf: "search-box" },
            count: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "How many results there are is a fact about what the query left, so it stands beside the field that produced it - parked at the far end of the row beside the layout toggle it reads as a caption for the control it is nearest, which is the wrong one. It is also what made the row reflow when the answer landed, moving a control that had already measured itself. The pair does NOT wrap: the field carries its own full-width fill, so a wrapping parent hands it the whole line and drops the count beneath it - which is the stacked pair this entry exists to prevent.",
    },
    "catalog-section-group": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            title: { leaf: "heading" },
            // The slot admits EITHER arrangement because the group's own statement does not
            // change with it: this is still a titled set of purchasable courses whether the
            // reader is comparing them side by side or scanning them down a column.
            grid: { contract: ["catalog-card-grid", "catalog-card-list"] },
        },
        why: "Owned and purchasable courses answer different questions, so each keeps its own titled group and one action meaning instead of forcing the reader to tell them apart card by card.",
    },
    "catalog-card-grid": {
        classes: ["grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "gap-2"],
        children: {
            course: { contract: "catalog-card", repeats: true, restingCount: 3 },
        },
        why: "Catalog courses are compact comparison peers in one responsive decision cluster, so the 8px grouped-card seam keeps columns associated without merging their individual surfaces. The slot names the one card kind it accepts rather than opening to any content: a course the learner already owns is not a card here at all, it is a row of the same joined list the dashboard already draws.",
    },
    "catalog-card-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            course: { contract: "catalog-card-line", repeats: true, restingCount: 3 },
        },
        why: "Scanning is the other question a catalog is asked: not which of these three, but which of these twenty. Twenty separate cards answer it badly - each edge is a stop, and the eye pays for twenty of them - so the rows share ONE surface and a full-width rule separates each from the next, which is the same joined list the dashboard reads. The inset is owned here, row by row, so every divider reaches both edges of the card.",
    },
    "catalog-card-line": {
        classes: [
            "flex", "flex-row", "items-center", "gap-4",
            "[&>*:first-child]:w-36", "[&>*:first-child]:shrink-0",
            "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow",
            "[&>*:last-child]:shrink-0",
        ],
        children: {
            cover: { leaf: "cover-image" },
            body: { contract: "catalog-card-line-body" },
            action: { contract: "catalog-card-action-row" },
        },
        why: "The same offer read across instead of down. It is a separate entry rather than the grid card under different classes because it does not hold the same things: at one course per row the promises list would set the row height by the longest course in the catalog, so the row states what it is and what it costs and leaves the claims to the card that has the depth for them.",
    },
    "catalog-card-line-body": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-1"],
        children: {
            heading: { contract: "title-with-baseline-fact" },
            price: { contract: "catalog-price-group" },
        },
        why: "In a row the name and the price are the whole statement, and they sit at the tightest seam because there is nothing between them to separate - the card's own rhythm is a rhythm between three parts, and holding it here would leave a gap the row has no third thing to fill.",
    },
    "catalog-card": {
        classes: ["flex", "grow", "flex-col", "gap-4", "p-4"],
        children: {
            cover: { leaf: "cover-image" },
            body: { contract: "catalog-card-body" },
            action: { contract: "catalog-card-action-row" },
        },
        why: "A purchasable course is one whole offer standing on its own ground, so the artwork that identifies it, the facts that price it and the two ways in share a single raised surface rather than floating on the grid. It fills its grid cell so that those ways in land on the same line across the row: a card that stops at its own content puts three buttons at three heights. It also FILLS the surface it now stands on: the branch draws the ground and this node lives inside it, so without growing it stops at its content and the row it belongs to stretches around it, and the reader reads that as three different kinds of offer rather than as one shorter list of promises.",
    },
    "course-price-detail-stack": {
        classes: ["flex", "flex-col", "gap-4", "p-6"],
        children: {
            title: { leaf: "heading" },
            reckoning: { contract: "stacked-stat-rows", optional: true },
            notice: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            reason: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            forward: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "A price the reader is asked to check reads downward as one argument - what it is, what it is made of, why it is lower, and what changes if they wait - and it carries its own inset because the shell it sits in passes the interior through without arranging or padding it.",
    },
    "price-note-row": {
        classes: ["flex", "flex-row", "flex-nowrap", "items-center", "gap-2", "[&>*]:whitespace-nowrap"],
        children: {
            fact: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            action: { leaf: "text-link", props: { size: "xs" } },
        },
        why: "What a price saves and the way to see how it was reached are one thought, so they share a line at the reserved caption step - both are supporting copy beneath the price itself, and a step larger the question outranked the answer it was asking about.",
    },
    "catalog-card-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "[&>*]:w-full"],
        children: {
            cart: { leaf: "button" },
            open: { leaf: "button" },
        },
        why: "Taking the course now and reading about it first are peers at the foot of one offer, so they share a line and an equal measure - stacked, the second reads as a lesser afterthought of the first, and sized to their own words they draw a ragged edge across a row of cards.",
    },
    "catalog-card-body": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-4"],
        children: {
            heading: { contract: "catalog-card-heading-row" },
            price: { contract: "catalog-price-group" },
            promises: { contract: "marked-row-list" },
        },
        why: "A purchasable course reads top to bottom as one decision - what it is, what it costs, what it promises, what to do - so its parts stack in that order at the card's own rhythm. What it costs is ONE part rather than two, which is why the price group below holds the tighter seam and this level does not.",
    },
    "catalog-price-group": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            price: { contract: "price-discount-line" },
            note: { contract: "price-note-row", optional: true },
        },
        why: "What the course costs and what that price saves are the same fact said twice, so they sit a step closer to each other than to the name above or the promises below - set at the card's rhythm they read as two separate answers.",
    },
    "catalog-card-heading-row": {
        classes: ["flex", "flex-row", "items-baseline", "justify-between", "gap-2", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow",
        ],
        children: {
            title: { leaf: "heading" },
            count: { leaf: "text", props: { size: "xs" } },
        },
        why: "The course name leads while its enrolment count qualifies it from the end of the same line, because the count is evidence about the name rather than a fact of its own. The name owns the spare width and yields it back as the card narrows, so the count stays whole instead of being clipped by the card's own rounded overflow.",
    },
    "course-detail-page": {
        classes: ["flex", "min-w-0", "flex-col", "gap-4"],
        children: {
            navigation: { contract: "course-section-navigation" },
            body: { contract: "main-then-rail" },
            action: { contract: "course-mobile-action-bar", optional: true },
        },
        why: "The page begins at the navbar seam with peer section navigation and carries no horizontal inset or bottom padding: the navigation reads as the primary navbar's second layer while the body owns its readable measure and the pinned phone action still reaches both viewport edges.",
    },
    "course-section-navigation": {
        host: "nav",
        classes: ["sticky", "top-16", "z-50", "-mt-px", "flex", "w-full", "border-b", "border-separator", "bg-background", "px-6"],
        children: { tabs: { leaf: "choice-tabs" } },
        why: "The four controls move within one course document, so they share one navigation landmark and one full-width baseline above the narrative. Their sticky layer stays directly under the primary navbar while scrolling, and its opaque surface overlaps the primary navbar's bottom stroke by exactly one pixel, leaving the same single divider below the complete two-row navbar as Dashboard; the breadcrumb inside the narrative separately preserves route ancestry.",
    },
    "main-then-rail": {
        classes: ["mx-auto", "w-full", "max-w-6xl", "px-6", "pb-6", "flex", "flex-col", "gap-6", "md:gap-8", "md:flex-row", "md:items-start", "md:[&>*:first-child]:min-w-0", "md:[&>*:first-child]:grow",
            "md:[&>*:last-child]:w-80", "md:[&>*:last-child]:shrink-0",
            "md:[&>*:last-child]:sticky", "md:[&>*:last-child]:top-course-rail",
            "md:[&>*:last-child]:self-start",
        ],
        children: {
            main: { contract: "course-hero" },
            rail: { contract: "course-pricing-rail" },
        },
        why: "The narrative owns the flexible measure while the purchase decision keeps a fixed column at the trailing edge and follows the reader down a long curriculum. It mirrors the locked rail-then-main rather than replacing it, because a left rail and a right rail are the same mechanics on opposite children and neither should be expressed by reordering content. It also closes the page's bottom space, which the frame cannot do without lifting the pinned bar off the edge it is pinned to.",
    },
    "course-hero": {
        host: "section",
        classes: ["flex", "min-w-0", "flex-col", "gap-6"],
        children: {
            trail: { leaf: "breadcrumbs" },
            heading: { contract: "course-hero-heading" },
            evidence: { contract: "course-signal-board" },
            section: { contract: ["marked-row-list", "course-prerequisite-list", "course-module-list", "course-section", "course-faq-list"], repeats: true, restingCount: 2 },
        },
        why: "The route trail first restores where the reader came from, then course identity leads the conversion narrative: a bounded signal board makes the proof scannable and each page-level joined list arrives as its own labelled SurfaceListCard projection. The review block keeps a named section because it is not a list-surface branch. Section tabs do not replace this ancestry.",
    },
    "course-hero-heading": {
        classes: ["flex", "min-w-0", "flex-col"],
        children: {
            identity: { contract: "course-hero-title-stack" },
        },
        why: "Course identity owns the full readable measure; population rating now belongs to the six-cell evidence ribbon with the other comparable course facts.",
    },
    "course-hero-title-stack": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-2"],
        children: {
            title: { leaf: "heading" },
            tagline: { leaf: "text", props: { size: "sm" } },
        },
        why: "The course name and its qualifying sentence are one identity statement and keep the flexible measure so a long technical description wraps before it squeezes the rating.",
    },
    "course-signal-board": {
        classes: [
            "grid", "grid-cols-2", "overflow-hidden",
            "[&>*]:p-3", "[&>*:nth-child(odd)]:border-r", "[&>*:nth-child(-n+4)]:border-b",
            "[&>*]:border-separator",
        ],
        children: {
            signal: { contract: "course-signal-card-neutral", repeats: true, restingCount: 6 },
        },
        why: "Six comparable course facts share the HeroUI Card owned by SurfaceCard and read across its ruled cells; this contract owns only the internal grid and separators, never a second border, radius or shadow.",
    },
    "course-signal-card-neutral": {
        classes: ["flex", "min-w-0", "flex-col", "gap-2"],
        children: { label: { leaf: "text", props: { size: "xs", tone: "muted" } }, value: { leaf: "text", props: { size: "sm", weight: "medium" } } },
        why: "All six comparable facts remain neutral peers inside one ruled card; no fact receives decorative color priority over another.",
    },
    "course-section": {
        host: "section",
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            title: { leaf: "heading" },
            body: { contract: "course-review-block" },
        },
        why: "The learner-review block is not a SurfaceListCard and therefore needs one section owner to keep its heading attached to the rating summary and review rows. Page-level joined lists bypass this wrapper because their SurfaceListCard already owns the exact label.",
    },
    "course-faq-list": {
        host: "ul",
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0", "[&>*]:px-4", "[&>*]:py-3"],
        children: {
            faq: { contract: "course-faq-row", repeats: true, restingCount: 3 },
        },
        why: "Questions are peer entry points rather than steps, so an unordered joined list keeps each authored answer bounded while full-width dividers preserve one continuous scan.",
    },
    "course-faq-row": {
        host: "li",
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            question: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            answer: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "The answer only makes sense under its question, so the pair stays in one row and long copy wraps within the same readable measure.",
    },
    "course-prerequisite-list": {
        host: "ol",
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0", "[&>*]:px-4", "[&>*]:py-3"],
        children: {
            prerequisite: { contract: "course-prerequisite-row", repeats: true, restingCount: 3 },
        },
        why: "Prerequisites are ORDERED - the backend stores them in sequence and a learner who lacks the first cannot judge the second - so an ol says that sequence to a reader who cannot see numbering. Deliberately not marked-row-list: those rows are peer completion statements, while these are sequential conditions the platform has not verified.",
    },
    "course-prerequisite-row": {
        host: "li",
        classes: ["flex", "flex-row", "items-start", "gap-3", "[&>*:last-child]:min-w-0", "[&>*:last-child]:grow"],
        children: {
            mark: { leaf: "text", props: { size: "sm", tone: "muted" } },
            requirement: { leaf: "text", props: { size: "sm" } },
        },
        why: "One requirement is one item of the ordered list. Its mark is muted rather than a tick, because a prerequisite is a condition the reader must satisfy themselves and a green check would claim the platform had verified it.",
    },
    "course-review-block": {
        host: "section",
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            summary: { contract: "course-review-summary" },
            list: { contract: "course-review-list" },
        },
        why: "A rating and the reviews behind it are two composed groups of one region, so the seam between them out-ranks the seams inside each. The summary answers whether the course is any good and the list answers why, and a reader who only wants the first must not have to read the second.",
    },
    "course-review-summary": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-3"],
        children: {
            score: { leaf: "heading" },
            scale: { leaf: "rating-stars" },
            count: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "The mean, the scale it is measured against and the count are one statement about the whole population, sharing a baseline so the figure does not float against its own qualifier. They are separate semantic groups on one row rather than one compact control.",
    },
    "course-review-list": {
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0"],
        children: {
            review: { contract: "course-review-row", repeats: true, restingCount: 3 },
        },
        why: "Reviews are unordered peers inside one joined list surface. Dividers preserve each learner's authorship boundary without repeating card chrome or elevation for every opinion.",
    },
    "course-review-row": {
        host: "section",
        classes: ["flex", "min-w-0", "flex-col", "gap-2", "p-4"],
        children: {
            author: { contract: "course-review-author-line" },
            body: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "Who said it, the score they gave and what they wrote are one bounded row of the joined review list. The body remains optional because a score alone is a complete review.",
    },
    "course-review-author-line": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            name: { leaf: "text", props: { size: "sm", weight: "medium" } },
            score: { leaf: "rating-stars" },
        },
        why: "A name and the score that person gave are one compact reading on one row - the score here is a fact about what THIS person thought rather than about the course - so they form one functional cluster.",
    },
    "course-module-list": {
        host: "ol",
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0", "[&>*]:px-4", "[&>*]:py-3"],
        children: {
            module: { contract: "course-module-row", repeats: true, restingCount: 5 },
        },
        why: "Modules are ORDERED - module three follows module two and cannot be read first - so an ol says the sequence to a reader who cannot see the numbering. Each row owns whether it discloses its lessons, so the list never has to know.",
    },
    "course-module-row": {
        host: "li",
        classes: ["flex", "min-w-0", "flex-col"],
        children: {
            module: { leaf: "curriculum-module-row" },
        },
        why: "One module is one item of the ordered list, and the leaf inside it is a disclosure rather than a list item - a details element cannot be an ol's child and stay valid, and the browser stops counting the sequence the moment it is. Separating them also puts the list's own padding on the item, so an open module's lessons sit inside the same inset as its title instead of escaping it.",
    },
    "course-pricing-rail": {
        host: "aside",
        classes: [
            "relative", "flex", "flex-col", "gap-4", "p-4",
            "[&>[data-component=Badge]:first-child]:absolute",
            "[&>[data-component=Badge]:first-child]:right-4",
            "[&>[data-component=Badge]:first-child]:top-4",
            "[&>[data-component=Badge]:first-child]:z-10",
        ],
        children: {
            phase: { leaf: "badge", optional: true },
            cover: { leaf: "cover-image" },
            price: { contract: "course-price-block" },
            selector: { leaf: "choice-tabs", optional: true },
            purchase: { contract: "course-pricing-purchase-intent", optional: true },
            exploration: { contract: "course-pricing-exploration-intent", optional: true },
            ladder: { leaf: "pricing-phase-disclosure", optional: true },
            proof: { leaf: "text", props: { size: "xs" }, optional: true },
        },
        why: "The rail is one complementary decision surface: artwork and price evidence remain visible while a bounded primary choice selects exactly one purchase or exploration intent, and phase comparison is disclosed only when requested.",
    },
    "course-pricing-purchase-intent": {
        classes: ["flex", "flex-col", "gap-2", "[&>*]:w-full"],
        children: {
            heading: { leaf: "text", props: { size: "sm", weight: "medium" }, optional: true },
            description: { leaf: "text", props: { size: "sm" }, optional: true },
            primary: { leaf: "button" },
            cart: { leaf: "button", optional: true },
        },
        why: "Purchase framing and the two ownership actions answer the selected buy intent. The persistent price stays above the selector; the primary enrol action leads and cart remains subordinate without becoming a separate card.",
    },
    "course-pricing-exploration-intent": {
        classes: ["flex", "flex-col", "gap-2", "[&>*]:w-full"],
        children: {
            heading: { leaf: "text", props: { size: "sm", weight: "medium" } },
            description: { leaf: "text", props: { size: "sm" }, optional: true },
            action: { leaf: "button" },
        },
        why: "Trial answers exploration rather than payment, so its heading, explanation and tertiary action form a separate semantic group inside the same outer surface.",
    },
    "course-price-primary-group": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            line: { contract: "price-discount-line" },
            note: { contract: "price-note-row", optional: true },
        },
        why: "The payable price and the line that explains its saving are one compact thought, so they stay at gap-1 before any separate availability signal.",
    },
    "course-price-block": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            primary: { contract: "course-price-primary-group" },
            scarcity: { leaf: "badge", optional: true },
        },
        why: "Scarcity affects timing rather than the price calculation itself, so it sits one spacing step away from the compact price-and-saving group.",
    },
    "cart-line-list": {
        classes: [
            "overflow-hidden", "divide-y", "divide-separator", "p-0",
            "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4",
        ],
        children: {
            line: { contract: "cart-line-row", repeats: true, restingCount: 3 },
        },
        why: "The courses in a basket are peers of one joined list, not a stack of separate offers: the reader is no longer choosing between them, they have already chosen, and separate surfaces would re-open a decision that is closed. One rule between each is what still lets a single line be found and removed.",
    },
    "cart-line-row": {
        classes: [
            "flex", "flex-row", "items-center", "gap-3", "w-full",
            // The artwork track is FIXED and it is the same track the catalog row uses, so one
            // course is the same width wherever it is listed. Without it the cover has no measure
            // at all and takes the whole row: the image is `w-full` inside its own leaf, so a
            // parent that states no track hands it everything and the name, the price and the
            // removal are pushed off the line. Nothing in the DOM says so - the row still reports
            // three children in a row - which is why this was caught by looking at it.
            //
            // And it is HIDDEN below the breakpoint rather than shrunk, which the narrow render
            // then forced: 144px of artwork plus a name, a price and a removal does not fit a
            // phone, and the overflow pushed the removal off the screen entirely. The reference
            // hides it too.
            "[&>*:first-child]:hidden", "md:[&>*:first-child]:block",
            "[&>*:first-child]:w-36", "[&>*:first-child]:shrink-0",
            "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow",
            // The price group must be allowed to SHRINK, or its own `flex-wrap` never engages: a
            // flex child defaults to `min-width: auto`, so the charged price, the struck original
            // and the discount badge held their full width, pushed the row past the viewport and
            // took the removal control off the screen with them. The narrow render is the only
            // thing that showed it.
            "[&>*:nth-child(3)]:min-w-0",
            "[&>*:last-child]:shrink-0",
        ],
        children: {
            cover: { leaf: "cover-image" },
            identity: { contract: "evidence-title-over-subtitle" },
            price: { contract: "price-discount-line" },
            remove: { leaf: "icon-button" },
        },
        why: "One course already in the basket, read across: what it looks like, what it is, what it costs, and the one way to change your mind. The removal is a glyph rather than words because it is the only destructive thing on the row and repeating its name down a list would give the loudest reading to the action nobody came for - and it sits at the trailing edge, furthest from the artwork somebody is scanning, so the press that undoes a purchase is the hardest one to make by accident.",
    },
    "order-summary-stack": {
        classes: [
            "flex", "flex-col", "gap-2",
            "[&>*:last-child]:border-t", "[&>*:last-child]:border-separator",
            "[&>*:last-child]:pt-3", "[&>*:last-child]:mt-1",
        ],
        children: {
            subtotal: { contract: "label-with-muted-fact-row" },
            savings: { contract: "label-with-muted-fact-row", optional: true },
            surcharge: { contract: "label-with-muted-fact-row", optional: true },
            total: { contract: "order-total-row" },
        },
        why: "What the order costs is an argument that RESOLVES rather than a set of peer figures: the lines above are what the total is made of, so the last one takes a rule and a step of air instead of the even seam that would make it read as one more subtotal. The savings and the instalment surcharge are optional because an order at list price has no saving to report and an order paid at once has no surcharge, and a line stating zero of either is a fact nobody asked for.",
    },
    "order-total-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            amount: { leaf: "text", props: { size: "md", weight: "semibold" } },
        },
        why: "The figure the reader is actually being asked for, and it is the loudest thing on the surface. It arranges like the muted fact rows above it because it belongs to the same column, and it is a separate entry because RANK is the whole difference: those rows constrain their fact to the caption step and a muted tone, which is the correct rank for a component of a total and the wrong one for the total itself.",
    },
    "checkout-panel-column": {
        classes: ["flex", "flex-col", "gap-4", "p-6"],
        children: {
            choice: { leaf: "choice-tabs" },
            summary: { contract: "order-summary-stack" },
            schedule: { contract: "ordered-step-ladder", optional: true },
            terms: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            gateways: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: "button" },
        },
        why: "The payment step reads downward as one decision - how to pay, what that costs, when each part falls due, what the reader is agreeing to, who will take the money, and the press. It carries its own inset because the shell it stands in passes the interior through without arranging or padding it. The schedule and the terms are optional TOGETHER with the choice above them: paying at once has no cycles to list and no lateness to warn about, and a schedule of one row saying 'now' would be a ladder pretending to be a ladder.",
    },
    "cart-page-column": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            lines: { contract: "cart-line-list", optional: true },
            summary: { contract: "order-summary-stack", optional: true },
            hint: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            actions: { contract: "stacked-peer-controls", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The same measure and inset the catalog and the leaderboard use, so a basket reached from the navbar and returned from does not appear to shift the chrome. Every region below the header is optional together: an empty basket has no lines, no total, no instalment hint and nothing to press, and drawing any of them emptied would promise an order that does not exist.",
    },
    "cart-drawer-column": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            lines: { contract: "cart-line-list", optional: true },
            summary: { contract: "order-summary-stack", optional: true },
            actions: { contract: "stacked-peer-controls", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The same basket at a narrower measure, and it carries its own inset because the shell it stands in passes the interior through without arranging or padding it. It holds no header: the drawer's own title bar already says what this is, and a second heading inside would title the thing the reader just opened by name.",
    },
    "ordered-step-ladder": {
        host: "ol",
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            step: { contract: "ordered-step-row", repeats: true, restingCount: 3 },
        },
        why: "Steps whose ORDER is the meaning: one of them is where the reader stands and the rest are what that position costs or owes, so a reordering would say something different and an ol carries the sequence. Named for the relationship rather than for the first screen that needed it - a pricing ladder whose open phase is the price and an instalment schedule whose paid cycles precede the due one are the same statement about sequence, and writing the second one again would have been the same shape under a second name.",
    },
    "ordered-step-row": {
        host: "li",
        classes: ["flex", "flex-row", "items-center", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: ["status-dot", "text"] },
            name: { leaf: "text", props: { size: "sm" } },
            value: { leaf: "text", props: { size: "xs" } },
        },
        why: "One step states where it stands and what it is worth on a single baseline, so the ladder can be scanned down its trailing edge. The mark keeps a fixed slot whether or not this is the step the reader is on, which is what keeps the names aligned: a dot only where the claim is affirmative, and a resting line everywhere else, because a mark that meant 'not this one' would be a mark this product has no honest tone for.",
    },
    "course-mobile-action-bar": {
        classes: ["sticky", "bottom-0", "z-40", "flex", "flex-row", "items-center", "justify-between", "gap-3", "border-t", "border-separator", "bg-background", "px-4", "py-3", "md:hidden"],
        children: {
            price: { contract: "price-discount-line" },
            action: { leaf: "button" },
        },
        why: "Below the rail's breakpoint the purchase decision would scroll away entirely, so the price and its one action pin to the bottom edge and step aside as soon as the rail can hold them again.",
    },
    "coding-practice-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            resume: { contract: "resume-item-card", optional: true },
            domains: { contract: "domain-mastery-grid" },
            standing: { contract: "leaderboard-card", optional: true },
        },
        why: "The learner is asked to continue before being asked to choose: the thing already half-done is the cheapest next move and it is the only region that can be absent. The domain field follows because it answers where to go NEXT, and the ranking comes last because it is the only region that says nothing about what to do.",
    },
    "domain-mastery-grid": {
        classes: ["grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "gap-4"],
        children: {
            domain: { contract: "domain-mastery-card", repeats: true, restingCount: 6 },
        },
        why: "Twenty topics are scanned for the weakest one rather than read in order, so they are a field the eye crosses in two directions instead of a column it walks down.",
    },
    "domain-mastery-card": {
        classes: ["flex", "grow", "flex-col", "items-start", "gap-2", "p-4"],
        children: {
            name: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            count: { leaf: "text", props: { size: "xs", tone: "muted" } },
            meter: { leaf: "progress" },
        },
        why: "The count and the bar are the same fact told twice on purpose - one to read and one to scan - because a learner comparing twenty topics needs the shape before the number, and the number once they have stopped on one.",
    },
    "coding-domain-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            standing: { contract: "label-fact-over-progress", optional: true },
            problems: { contract: "marked-row-list", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "One topic's page opens on how far through it the reader is, because that is the question the hub sent them here holding; the problems follow as the answer to it.",
    },
    "coding-problem-page": {
        classes: ["flex", "w-full", "min-h-screen", "flex-col", "md:flex-row"],
        children: {
            reading: { contract: "problem-reading-column" },
            work: { contract: "problem-work-column" },
        },
        why: "Reading and writing are side by side on a desktop because the statement is consulted WHILE the solution is written, and stacked below the breakpoint because two columns of forty characters are worse than one of eighty.",
    },
    "problem-reading-column": {
        // `md:shrink-0` is not decoration. Without it the work column's `grow` squeezes this one
        // well past the measure `md:w-2/5` asked for - measured at 273px inside a 934px viewport
        // where two fifths is 373 - and a problem statement at that width wraps every few words.
        // A proportional width is a REQUEST until shrinking is refused.
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-4", "border-b", "border-separator", "p-6", "md:w-2/5", "md:shrink-0", "md:border-b-0", "md:border-r"],
        children: {
            tabs: { leaf: "extended-tabs" },
            body: { contract: "problem-statement-stack" },
        },
        why: "The tabs stay put while what is under them changes, so a reader who moved to the hint and back does not lose the place they were reading from.",
    },
    "problem-statement-stack": {
        classes: ["flex", "min-w-0", "flex-col", "gap-3"],
        children: {
            heading: { contract: "title-with-baseline-fact" },
            // `article` REUSED, and a proposed `markdown-prose` leaf withdrawn. The repository
            // already renders authored Markdown - `leaves/Article` parses to mdast and decides what
            // each node becomes - and its own comment records that canon refused `react-markdown`
            // here twice: every replacement takes `children`, and heading replacements wrote raw
            // tags that split the outline from the visible size. A second markdown owner would have
            // walked into both refusals again, and pulled in a dependency to do it.
            prose: { leaf: "article" },
            tags: { contract: "profile-topic-chip-run", optional: true },
        },
        why: "The difficulty sits on the title's own baseline because it qualifies the title rather than the problem body, and the tags close the statement because they are what the reader scans when deciding to skip it.",
    },
    "problem-work-column": {
        classes: ["flex", "w-full", "min-w-0", "grow", "flex-col"],
        children: {
            // TWO BLOCKS, NOT ONE. The verdict strip and the editor are separate owners with
            // separate situations - one is driven by a socket, the other by a keyboard - so the
            // PAGE composes them here rather than the editor drawing a strip it cannot fill.
            verdict: { contract: "judge-status-strip" },
            work: { contract: "editor-over-console" },
        },
        why: "The verdict is pinned above the editor rather than inside the tray below it, because it is the thing a reader watches while waiting and the tray is the thing they open once the waiting is over. The editor takes whatever height the other three leave, which is what makes it the region that grows on a taller screen.",
    },
    "judge-status-strip": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full", "border-b", "border-separator", "px-4", "py-3", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(3)]:grow"],
        children: {
            mark: { leaf: "status-dot" },
            verdict: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            detail: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: "button", optional: true },
        },
        why: "Nine judging outcomes and a lost connection need ONE place that exists before the first submission and never moves, because a reader waiting on a verdict watches one spot and a strip that appears only on failure teaches them to watch nothing.",
    },
    "editor-over-console": {
        classes: ["flex", "min-w-0", "grow", "flex-col"],
        children: {
            toolbar: { contract: "editor-toolbar-row" },
            editor: { leaf: "code-editor" },
            console: { contract: "judge-console", optional: true },
        },
        why: "The writing surface takes whatever height the bar above and the tray below leave it, which is what makes the editor the region that grows on a taller screen. The tray is absent until a run has produced something to put in it - parked open before the first submission it would take height to show nothing.",
    },
    "editor-toolbar-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3", "w-full", "border-b", "border-separator", "px-4", "py-3"],
        children: {
            language: { leaf: "select" },
            // REUSED, not invented. `catalog-card-action-row` already owns "two peer actions share
            // one line and an equal measure", which is exactly running and submitting an attempt.
            // `stacked-peer-controls` was the first reach and was wrong: it is `flex-col`, so it
            // would have stacked Run above Submit at full width inside a toolbar.
            //
            // Its NAME still says `catalog`, which is now false for one of its two callers. That is
            // recorded as an open question rather than fixed here: renaming a shipped entry touches
            // every call site and belongs to a consolidation run, not to this candidate.
            actions: { contract: "catalog-card-action-row" },
        },
        why: "The language belongs to the code and the actions belong to the attempt, so they take opposite ends of one bar rather than queueing on the same side.",
    },
    "judge-console": {
        classes: ["flex", "flex-col", "gap-2", "w-full", "border-t", "border-separator", "px-4", "py-3"],
        children: {
            cases: { contract: "testcase-chip-run" },
            message: { leaf: "code-block", optional: true },
        },
        why: "The per-case marks are the summary and the compiler's own words are the detail, so the detail appears only for the one verdict that carries any.",
    },
    "global-ai-layout": {
        classes: ["relative", "w-full"],
        children: {
            surface: { leaf: "page" },
            selection: { contract: "selection-ai-actions", optional: true },
            trigger: { contract: "floating-ai-trigger", optional: true },
            drawer: { contract: "starci-ai-drawer-column", optional: true },
        },
        why: "The routed surface and its one persistent AI owner are siblings, so navigation can replace the lesson without replacing the active conversation.",
    },
    "floating-ai-trigger": {
        classes: ["flex", "items-center", "gap-2"],
        children: {
            mark: { leaf: "starci-ai-mark" },
            label: { leaf: "text" },
            badge: { leaf: "badge", optional: true },
        },
        why: "The global AI mark, its accessible name and optional unread fact form one press target.",
    },
    "selection-ai-actions": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            quote: { leaf: "code-block" },
            action: { leaf: "button", repeats: true, restingCount: 2 },
        },
        why: "The exact selected passage stays attached to the mutually exclusive active-chat and tangent actions.",
    },
    "starci-ai-drawer-column": {
        classes: ["flex", "w-full", "grow", "flex-col"],
        children: {
            mode: { contract: "starci-ai-mode-row" },
            context: { contract: "starci-ai-context-stack", optional: true },
            chat: { contract: "starci-ai-turn-list" },
        },
        why: "Without this column the mode and grounding can scroll away from the transcript they qualify and leave the composer without visible context.",
    },
    "starci-ai-mode-row": {
        classes: ["flex", "items-center", "gap-1"],
        children: {
            mode: { leaf: "button", repeats: true, restingCount: 3 },
        },
        why: "Without one finite row the three mutually exclusive drawer bodies can appear as unrelated actions and expose more than one owner at once.",
    },
    "starci-ai-context-stack": {
        classes: ["flex", "min-w-0", "items-center", "gap-1", "overflow-hidden"],
        children: {
            context: { leaf: "text" },
            clear: { leaf: "button", optional: true },
        },
        why: "Lesson, file and selected range remain one compact summary with an explicit way to release transient code grounding.",
    },
    "starci-ai-turn-list": {
        classes: ["flex", "grow", "flex-col", "gap-3", "overflow-hidden"],
        children: {
            turn: { leaf: ["article", "button"], repeats: true, restingCount: 4 },
        },
        why: "Saved history remains selectable while conversation turns and the streaming tail stay one ordered announced transcript.",
    },
    "starci-ai-composer": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            selection: { leaf: "code-block", optional: true },
            input: { leaf: "textarea" },
            sendOrStop: { leaf: "button" },
            quota: { leaf: "text", optional: true },
        },
        why: "Pinned code context, the draft, stream control and advisory credit display stay attached to the exact next ask.",
    },
    "source-workspace-root": {
        classes: ["flex", "min-w-0", "flex-col", "gap-2"],
        children: {
            toolbar: { contract: "source-workspace-toolbar" },
            workspace: { contract: "source-workspace-grid", optional: true },
        },
        why: "Snapshot identity and controls stay attached to the editor and preview they govern in every loading or failure state.",
    },
    "source-workspace-grid": {
        classes: ["grid", "min-w-0", "grid-cols-1", "lg:grid-cols-3"],
        children: {
            files: { contract: "source-file-navigation" },
            editor: { contract: "source-code-editor-frame" },
            preview: { leaf: "page" },
        },
        why: "Explorer, editable snapshot and local runtime are peers on desktop and collapse in a defined order on narrow screens.",
    },
    "source-code-editor-frame": {
        classes: ["min-h-80", "min-w-0", "overflow-auto"],
        children: {
            editor: { leaf: "code-editor" },
        },
        why: "The controlled source editor keeps a stable minimum work area while long files scroll inside their own column.",
    },
    "source-workspace-toolbar": {
        classes: ["flex", "flex-wrap", "items-center", "justify-between", "gap-2"],
        children: {
            identity: { leaf: "text" },
            action: { leaf: "button", repeats: true, restingCount: 2 },
            status: { leaf: "status-dot", optional: true },
        },
        why: "Without this toolbar snapshot identity, reset actions and local-change status separate from the editor whose current state they control.",
    },
    "source-file-navigation": {
        host: "nav",
        classes: ["flex", "min-w-0", "flex-col", "gap-2"],
        children: {
            label: { leaf: "text" },
            files: { contract: "source-file-list" },
        },
        why: "The explorer label names the file list before keyboard users traverse its disclosure and file controls.",
    },
    "source-file-list": {
        host: "ul",
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            file: { contract: "source-file-row", repeats: true, restingCount: 5 },
        },
        why: "Without this ordered explorer source paths lose their keyboard-readable sequence and active-file relationship before the editor.",
    },
    "source-file-row": {
        host: "li",
        classes: ["flex", "min-w-0", "items-center", "gap-2"],
        children: {
            disclosure: { leaf: "icon-button" },
            name: { leaf: "text" },
            status: { leaf: "status-dot", optional: true },
        },
        why: "Folder disclosure, path identity and edit status share one file-row press target.",
    },
    "testcase-chip-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            testcase: { leaf: "badge", repeats: true, restingCount: 5 },
        },
        why: "Testcases are equal peers read as a run rather than a ranking, and they wrap because their number is a property of the problem rather than of the layout.",
    },
    "global-search-workspace": {
        classes: ["flex", "min-w-0", "flex-col", "gap-4"],
        children: {
            query: { leaf: "search-command-field" },
            body: { contract: "global-search-body" },
        },
        why: "The command field governs one search workspace, so it stays above the scope, result and context regions that answer the same query.",
    },
    "global-search-body": {
        classes: ["flex", "min-w-0", "flex-col", "gap-4", "md:flex", "md:flex-row", "md:items-start", "md:gap-8", "md:[&>[data-component=SelectionList][data-variant=scopes]]:w-72", "md:[&>[data-component=SelectionList][data-variant=scopes]]:shrink-0", "md:[&>[data-node=global-search-result-region]]:min-w-0", "md:[&>[data-node=global-search-result-region]]:grow", "md:[&>[data-node=global-search-context-card]]:w-72", "md:[&>[data-node=global-search-context-card]]:shrink-0"],
        children: {
            scopes: { leaf: "selection-list" },
            results: { contract: "global-search-result-region" },
            context: { contract: "global-search-context-card", optional: true },
        },
        why: "The scope ListBox, result region and selected render stay visible together on desktop. The middle region renders the existing ListBox when populated and the existing EmptyNotice when settled empty, with no invented label or nested surface. Width follows stable region identity because React Aria inserts FocusScope siblings around ListBox.",
    },
    "global-search-result-region": {
        classes: ["min-w-0"],
        children: {
            list: { contract: "global-search-surface-list", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "The middle region has no label: populated results use the existing nested SurfaceListCard projection, while settled absence replaces the whole list surface with the shared EmptyNotice.",
    },
    "global-search-surface-list": {
        classes: ["min-w-0", "overflow-hidden", "divide-y", "divide-separator", "p-0"],
        children: {
            list: { leaf: "selection-list", repeats: true, restingCount: 1 },
        },
        why: "Global Search results share one label-less nested SurfaceListCard; the existing SelectionList keeps keyboard selection and row anatomy while this joined contract owns the bounded list surface.",
    },
    "global-search-context-card": {
        classes: ["hidden", "min-w-0", "flex-col", "gap-3", "p-4", "md:flex"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "medium" } },
            kind: { leaf: "text", props: { size: "xs", tone: "muted" } },
            snippet: { leaf: "text", props: { size: "sm" }, optional: true },
            status: { leaf: "badge", optional: true },
            action: { leaf: "button", optional: true },
        },
        why: "The selected hit's identity, evidence and one canonical way out share a bounded desktop context surface; mobile omits this redundant pane.",
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
