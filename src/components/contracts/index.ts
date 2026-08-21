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
    | "flex" | "grid" | "flex-col" | "flex-row" | "flex-wrap" | "flex-nowrap" | "overflow-hidden" | "relative"
    | "min-h-0" | "overflow-y-auto" | "overscroll-contain" | "scrollbar"
    | "items-center" | "items-baseline" | "items-start" | "items-end" | "items-stretch"
    | "justify-between" | "justify-center" | "justify-end" | "[&>*]:w-full"
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
    | "mx-auto" | "min-h-screen" | "min-h-app-rail" | "min-h-80" | "w-full" | "min-w-0" | "grow" | "flex-1" | "shrink-0" | "hidden" | "overflow-auto" | "max-w-app-sm" | "max-w-app-md" | "max-w-app-lg" | "max-w-app-xl" | "max-w-6xl" | "max-w-sm" | "max-w-md" | "@container"
    | "h-16" | "h-full" | "min-h-16" | "h-app-rail" | "sticky" | "top-0" | "top-16" | "z-40" | "z-50"
    | "md:sticky" | "md:top-16" | "md:self-start" | "md:h-app-rail"
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
    | "md:[&>[data-node=learn-route-context-rail]]:w-80"
    | "md:[&>[data-node=learn-route-context-rail]]:shrink-0"
    | "md:[&>[data-node=learn-route-context-rail]]:sticky"
    | "md:[&>[data-node=learn-route-context-rail]]:top-rail"
    | "md:[&>[data-node=learn-route-context-rail]]:self-start"
    | "md:[&>[data-node=learn-route-context-rail]]:max-h-rail"
    | "md:[&>[data-node=learn-route-context-rail]]:overflow-y-auto"
    | "md:[&>[data-node=learn-content-page]]:min-w-0"
    | "md:[&>[data-node=learn-content-page]]:grow"
    | "md:[&>[data-node=learn-content-page]]:max-h-rail"
    | "md:[&>[data-node=learn-content-page]]:overflow-y-auto"
    | "md:[&>[data-node=content-outline-rail]]:w-64"
    | "md:[&>[data-node=content-outline-rail]]:shrink-0"
    | "md:[&>[data-node=content-outline-rail]]:sticky"
    | "md:[&>[data-node=content-outline-rail]]:top-rail"
    | "md:[&>[data-node=content-outline-rail]]:self-start"
    | "md:[&>[data-node=content-outline-rail]]:max-h-rail"
    | "md:[&>[data-node=content-outline-rail]]:overflow-y-auto"
    | "md:[&>*:first-child]:w-72" | "md:[&>*:first-child]:shrink-0"
    | "md:[&>*:last-child]:min-w-0" | "md:[&>*:last-child]:grow"
    | "md:[&>*:first-child]:overflow-y-auto"
    | "md:[&>*:nth-child(2)]:min-w-0" | "md:[&>*:nth-child(2)]:grow"
    | "[&>*]:min-w-0" | "[&>*]:grow" | "[&>*]:whitespace-nowrap"
    | "md:[&>[data-component=CollapsibleRail]]:w-64"
    | "md:[&>[data-component=CollapsibleRail]]:w-16"
    | "[&>[data-component=CollapsibleRail]]:hidden"
    | "[&>[data-component=CollapsibleRail]]:min-w-0"
    | "md:[&>[data-component=CollapsibleRail]]:block"
    | "md:[&>[data-component=CollapsibleRail]]:grow-0"
    | "md:[&>[data-component=CollapsibleRail]]:shrink-0"
    | "md:[&>[data-component=CollapsibleRail]]:sticky"
    | "md:[&>[data-component=CollapsibleRail]]:top-16"
    | "md:[&>[data-component=CollapsibleRail]]:self-start"
    | "md:[&>[data-component=CollapsibleRail]]:h-app-rail"
    | "md:[&>[data-component=CollapsibleRail]]:overflow-hidden"
    | "scroll-shadow" | "scroll-shadow--vertical" | "scroll-shadow--hide-scrollbar"
    | "md:[&>*:first-child]:w-80" | "md:[&>*:last-child]:w-64"
    | "md:[&>*:first-child]:sticky" | "md:[&>*:first-child]:top-rail" | "md:[&>*:first-child]:top-16"
    | "md:[&>*:first-child]:self-start" | "md:[&>*:first-child]:max-h-rail" | "md:[&>*:first-child]:h-app-rail"
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
            dashboard: { contract: "course-learning-dashboard-grid", optional: true },
            mobile: { contract: "course-learning-dashboard-mobile", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need today's one deterministic next move ahead of optional course and progress alternatives that remain alternate mobile compositions of the same route.",
    },
    "course-learning-dashboard-grid": {
        classes: ["hidden", "w-full", "min-w-0", "md:flex", "md:flex-row", "md:items-start", "md:gap-8", "md:[&>*:first-child]:min-w-0", "md:[&>*:first-child]:grow", "md:[&>*:last-child]:w-80", "md:[&>*:last-child]:shrink-0", "md:[&>*:last-child]:sticky", "md:[&>*:last-child]:top-rail", "md:[&>*:last-child]:self-start"],
        children: {
            primary: { contract: "course-learning-dashboard-primary-column" },
            signals: { contract: "course-learning-dashboard-signal-column" },
        },
        why: "if you need the course's primary progress and next actions to own the flexible column beside one sticky supporting-signal rail.",
    },
    "course-learning-dashboard-primary-column": {
        classes: ["flex", "min-w-0", "flex-col", "gap-6"],
        children: {
            progress: { contract: "course-progress-overview" },
            actions: { contract: "next-action-list" },
        },
        why: "if you need whole-course evidence kept directly above the ranked destinations it supports.",
    },
    "course-learning-dashboard-signal-column": {
        classes: ["flex", "min-w-0", "flex-col", "gap-6"],
        children: {
            signals: { contract: "course-learning-signal-list" },
            detail: { contract: "course-learning-signal-detail-stack" },
        },
        why: "if you need supporting course signals kept attached to the contextual detail of the selected signal.",
    },
    "course-learning-dashboard-mobile": {
        classes: ["flex", "min-w-0", "flex-col", "gap-6", "md:hidden"],
        children: {
            primary: { contract: "resume-item-card", optional: true },
            secondary: { contract: "resume-card-grid", optional: true },
            course: { contract: "resume-item-card", optional: true },
            progress: { contract: "label-fact-over-progress", optional: true },
        },
        why: "if you need the Today, course and progress mobile faces to share one route while the desktop dashboard remains continuously visible.",
    },
    "course-progress-overview": {
        classes: ["flex", "min-w-0", "flex-col", "gap-4", "p-4"],
        children: {
            completion: { contract: "label-fact-over-progress" },
            support: { contract: "course-progress-support-facts", optional: true },
        },
        why: "if you need course completion to lead continuity and standing as one coordinated whole-course summary.",
    },
    "course-progress-support-facts": {
        classes: ["grid", "grid-cols-2", "gap-4"],
        children: {
            continuity: { contract: "label-with-muted-fact-row" },
            standing: { contract: "label-with-muted-fact-row" },
        },
        why: "if you need continuity and standing compared as two supporting facts beneath the primary completion measure.",
    },
    "course-learning-signal-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            signal: { contract: "course-learning-signal-row", repeats: true, restingCount: 3 },
        },
        why: "if you need due review, study continuity and course standing aligned as one selectable supporting list.",
    },
    "course-learning-signal-row": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "items-center", "gap-3", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow", "[&>*:last-child]:shrink-0"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "medium" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: "button", optional: true },
        },
        why: "if you need one course-learning signal's name and quiet current fact aligned with its contextual selection action.",
    },
    "course-learning-signal-detail-stack": {
        classes: ["flex", "min-w-0", "flex-col", "gap-3", "p-4"],
        children: {
            title: { leaf: "heading" },
            fact: { leaf: "text", props: { size: "sm", weight: "medium" } },
            caption: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "see-more-link", optional: true },
        },
        why: "if you need one selected learning signal explained by its value, evidence caption and onward action.",
    },
    "course-content-home-frame": {
        classes: [
            "flex", "w-full", "min-w-0", "flex-col", "items-start",
            "md:flex-row", "md:items-start",
            "md:[&>*:first-child]:w-80", "md:[&>*:first-child]:shrink-0",
            "md:[&>*:first-child]:sticky", "md:[&>*:first-child]:top-16",
            "md:[&>*:first-child]:self-start", "md:[&>*:first-child]:h-app-rail",
            "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow",
        ],
        children: {
            map: { contract: "learn-route-context-rail" },
            divider: { leaf: "rail-divider" },
            overview: { contract: "course-content-home-overview-page" },
        },
        why: "if you need one sticky adjustable course map separated from a flexible content overview that becomes the next row in narrow viewports.",
    },
    "course-content-home-overview-page": {
        host: "main",
        classes: ["flex", "w-full", "max-w-app-lg", "flex-col", "gap-6", "p-6"],
        children: {
            identity: { contract: "course-content-identity-stack" },
            gates: { contract: "course-content-gate-run", optional: true },
            resume: { contract: "course-content-resume-progress" },
            nudges: { contract: "course-content-nudge-run", optional: true },
            module: { contract: "course-content-lesson-list", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need course identity to lead through optional catalogue and learner facts into one continuation decision and only the current authored module path.",
    },
    "status-metadata-line": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            status: { leaf: "badge", optional: true },
            facts: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if metadata may promote at most one semantic status chip while every remaining fact stays one plain-text run separated by middle dots.",
    },
    "course-content-gate-run": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3"],
        children: {
            gate: { leaf: "text", props: { size: "sm" }, repeats: true, restingCount: 2 },
        },
        why: "if you need learner eligibility notices to remain together before continuation evidence instead of replacing the page.",
    },
    "course-content-resume-progress": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3"],
        children: {
            decision: { contract: "course-content-resume-decision-row" },
            progress: { leaf: "progress" },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if you need the next learning decision kept above the honest completion meter and its supporting progress facts.",
    },
    "course-content-resume-decision-row": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "flex-wrap", "items-end", "justify-between", "gap-3"],
        children: {
            copy: { contract: "course-content-resume-copy" },
            action: { leaf: "button", optional: true },
        },
        why: "if you need the next target to keep the available continuation action on the opposite edge without detaching it on narrow widths.",
    },
    "course-content-resume-copy": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-1"],
        children: {
            eyebrow: { leaf: "text", props: { size: "xs", tone: "muted" } },
            target: { leaf: "heading" },
        },
        why: "if you need a quiet continuation eyebrow attached directly above the next authored target it qualifies.",
    },
    "course-content-nudge-run": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3"],
        children: {
            nudge: { leaf: "text", props: { size: "sm", tone: "muted" }, repeats: true, restingCount: 2 },
        },
        why: "if you need learner-specific aids kept between the continuation decision and the current module without becoming primary navigation.",
    },
    "course-content-lesson-list": {
        host: "ul",
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            lesson: { contract: "course-content-lesson-row", repeats: true, restingCount: 4 },
        },
        why: "if you need the current module's lesson destinations joined inside one bounded list while the complete curriculum remains in the adjacent rail.",
    },
    "course-content-lesson-row": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "items-center", "gap-3", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow", "[&>*:last-child]:shrink-0"],
        children: {
            lesson: { leaf: "nav-link", props: { kind: "section" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if you need one lesson destination aligned with optional completion, difficulty or premium evidence that never becomes a separate control.",
    },
    "course-learn-module-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-3", "px-6", "py-6"],
        children: {
            title: { leaf: "heading" },
            module: { composite: "curriculum-module-row" },
        },
        why: "if you need one selected module's title and authored contents together under a main landmark that narrows the curriculum without adding another navigation shell.",
    },
    "learn-mobile-tab-bar": {
        host: "nav",
        classes: ["sticky", "bottom-0", "z-40", "flex", "w-full", "min-w-0", "flex-row", "items-center", "justify-between", "gap-2", "border-t", "border-separator", "bg-background", "px-4", "py-3", "md:hidden"],
        children: {
            tab: { leaf: "nav-link", props: { kind: "tab" }, repeats: true, restingCount: 3 },
        },
        why: "if you need a nav of peer destinations pinned to the bottom edge for thumbs, shown only below the rail's breakpoint.",
    },
    "learn-shell-frame": {
        classes: [
            "flex", "min-h-app-rail", "w-full", "min-w-0", "flex-col", "items-start",
            "[&>*]:min-w-0", "[&>*]:grow",
            "md:flex-row", "md:items-start",
            "[&>[data-component=CollapsibleRail]]:hidden",
            "[&>[data-component=CollapsibleRail]]:min-w-0",
            "md:[&>[data-component=CollapsibleRail]]:block",
            "md:[&>[data-component=CollapsibleRail]]:w-64",
            "md:[&>[data-component=CollapsibleRail]]:grow-0",
            "md:[&>[data-component=CollapsibleRail]]:shrink-0",
            "md:[&>[data-component=CollapsibleRail]]:sticky",
            "md:[&>[data-component=CollapsibleRail]]:top-16",
            "md:[&>[data-component=CollapsibleRail]]:self-start",
            "md:[&>[data-component=CollapsibleRail]]:h-app-rail",
            "md:[&>[data-component=CollapsibleRail]]:overflow-hidden",
        ],
        children: {
            spine: { contract: "learn-course-navigation-rail", optional: true },
            body: { contract: "learn-routed-body" },
            bar: { contract: "learn-mobile-tab-bar", optional: true },
        },
        why: "if you need a persistent side rail sitting beside a routed main body that swaps surfaces without the frame itself re-rendering.",
    },
    "learn-shell-frame-collapsed": {
        classes: [
            "flex", "min-h-app-rail", "w-full", "min-w-0", "flex-col", "items-start",
            "[&>*]:min-w-0", "[&>*]:grow",
            "md:flex-row", "md:items-start",
            "[&>[data-component=CollapsibleRail]]:hidden",
            "[&>[data-component=CollapsibleRail]]:min-w-0",
            "md:[&>[data-component=CollapsibleRail]]:block",
            "md:[&>[data-component=CollapsibleRail]]:w-16",
            "md:[&>[data-component=CollapsibleRail]]:grow-0",
            "md:[&>[data-component=CollapsibleRail]]:shrink-0",
            "md:[&>[data-component=CollapsibleRail]]:sticky",
            "md:[&>[data-component=CollapsibleRail]]:top-16",
            "md:[&>[data-component=CollapsibleRail]]:self-start",
            "md:[&>[data-component=CollapsibleRail]]:h-app-rail",
            "md:[&>[data-component=CollapsibleRail]]:overflow-hidden",
        ],
        children: {
            spine: { contract: "learn-course-navigation-rail-collapsed", optional: true },
            body: { contract: "learn-routed-body" },
            bar: { contract: "learn-mobile-tab-bar", optional: true },
        },
        why: "if you need the course rail compacted to icon width while the routed body keeps the same flexible reading position.",
    },
    "learn-course-navigation-rail": {
        host: "nav",
        classes: ["hidden", "h-full", "w-full", "min-w-0", "flex-col", "gap-4", "overflow-hidden", "border-separator", "px-3", "py-6", "md:flex", "md:border-r"],
        children: {
            toggle: { contract: "learn-course-rail-collapse-toggle" },
            home: { contract: "learn-course-home-navigation-row" },
            resume: { contract: "learn-resume-card", optional: true },
            groups: { contract: "learn-course-navigation-groups-scroll" },
        },
        why: "if you need the compact course-mode navigation to keep grouped destinations and optional learner evidence in one persistent desktop rail.",
    },
    "learn-course-navigation-rail-collapsed": {
        host: "nav",
        classes: ["hidden", "h-full", "w-full", "min-w-0", "flex-col", "gap-4", "overflow-hidden", "border-separator", "px-3", "py-6", "md:flex", "md:border-r"],
        children: {
            toggle: { contract: "learn-course-rail-collapse-toggle-collapsed" },
            home: { contract: "learn-course-home-navigation-row" },
            groups: { contract: "learn-course-navigation-groups-scroll" },
        },
        why: "if you need every course destination retained as an accessible icon while visible labels and trailing evidence are compacted.",
    },
    "learn-course-home-navigation-row": {
        classes: ["flex", "w-full", "min-w-0", "items-center", "[&>*]:w-full"],
        children: {
            list: { leaf: "selection-list" },
        },
        why: "if the course-local Home destination must use the same full-width selection grammar as every other course destination while exact-matching only the bare learn route.",
    },
    "learn-course-rail-collapse-toggle": {
        classes: ["flex", "w-full", "justify-end"],
        children: {
            control: { leaf: "icon-button" },
        },
        why: "if a persistent course rail changes in place between its labelled and compact icon presentations.",
    },
    "learn-course-rail-collapse-toggle-collapsed": {
        classes: ["flex", "w-full", "justify-center"],
        children: {
            control: { leaf: "icon-button" },
        },
        why: "if the compact course rail keeps its collapse control on the same centreline as every icon-only destination below it.",
    },
    "learn-course-navigation-groups-scroll": {
        classes: ["scroll-shadow", "scroll-shadow--vertical", "scroll-shadow--hide-scrollbar", "flex", "min-h-0", "w-full", "min-w-0", "flex-1", "flex-col", "gap-4", "overscroll-contain"],
        children: {
            group: { contract: ["learn-nav-group", "learn-nav-group-collapsed"], repeats: true, restingCount: 3 },
        },
        why: "if navigation groups alone move inside the approved ScrollViewport branch with the vendor scrollbar hidden while collapse, overview and resume controls remain pinned.",
    },
    "learn-routed-body": {
        classes: ["w-full", "min-w-0", "flex-1"],
        children: {
            page: { leaf: "page" },
        },
        why: "if you need one addressed learning page to own the flexible body while the enclosing course navigation remains mounted.",
    },
    "learn-route-context-rail": {
        host: "aside",
        classes: ["flex", "w-full", "min-w-0", "min-h-0", "overflow-hidden", "md:sticky", "md:top-16", "md:self-start", "md:h-app-rail"],
        children: {
            panel: { contract: "content-map-panel" },
        },
        why: "if you need the active learning route to supply one auxiliary course map beside its routed body without moving that map into global navigation.",
    },
    "learn-nav-group": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-1"],
        children: {
            label: { leaf: "text", props: { size: "xs", tone: "muted" } },
            list: { leaf: "selection-list", props: { variant: "navigation" } },
        },
        why: "if you need a labelled ListBox of course destinations under one section name, drawing no second surface of its own.",
    },
    "learn-nav-group-collapsed": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-1", "items-center"],
        children: {
            list: { leaf: "selection-list", props: { variant: "navigation-collapsed" } },
        },
        why: "if you need one course destination ListBox to retain keyboard order while labels and trailing facts are compacted.",
    },
    "learn-resume-card": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-1", "p-4"],
        children: {
            label: { leaf: "text", props: { size: "xs", tone: "muted" } },
            progress: { composite: "labelled-progress-row" },
        },
        why: "if you need a single-press resume card pairing a quiet label with a progress row.",
    },
    "personal-project-workspace-frame": {
        classes: [
            "flex", "min-h-app-rail", "w-full", "min-w-0", "flex-col", "items-start",
            "md:flex-row", "md:items-start", "[&>*:last-child]:min-w-0", "[&>*:last-child]:grow",
        ],
        children: {
            rail: { contract: "personal-project-milestone-rail" },
            divider: { leaf: "rail-divider" },
            body: { contract: "learn-routed-body" },
        },
        why: "if you need one adjustable milestone rail and its shared-edge separator beside a routed workspace body without flattening its rows into flex siblings.",
    },
    "personal-project-milestone-rail": {
        host: "nav",
        classes: ["hidden", "w-full", "min-w-0", "min-h-0", "shrink-0", "flex-col", "gap-4", "overflow-hidden", "px-3", "py-6", "md:flex", "md:sticky", "md:top-16", "md:self-start", "md:h-app-rail"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "medium" } },
            progress: { leaf: "progress" },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
            search: { leaf: "search-box" },
            milestones: { contract: "personal-project-milestone-list-scroll" },
        },
        why: "if project completion, search and milestone destinations belong to one independently scrolling desktop rail.",
    },
    "personal-project-milestone-list-scroll": {
        classes: ["flex", "w-full", "min-w-0", "min-h-0", "flex-1", "flex-col", "overflow-y-auto", "overscroll-contain", "scroll-shadow", "scroll-shadow--vertical", "scroll-shadow--hide-scrollbar"],
        children: {
            milestone: { contract: "personal-project-milestone-row", repeats: true, restingCount: 4 },
        },
        why: "if milestone destinations alone move while project progress and search remain pinned above them.",
    },
    "personal-project-milestone-row": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "items-center", "gap-2", "border-b", "border-separator", "py-3", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow", "[&>*:last-child]:shrink-0"],
        children: {
            link: { leaf: "nav-link", props: { kind: "section" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if a milestone destination and its completed-task count must remain comparable down one roadmap.",
    },
    "course-personal-project-task-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "min-w-0", "flex-col", "gap-6", "px-4", "py-6"],
        children: {
            header: { contract: "personal-project-task-header" },
            workspace: { contract: "personal-project-task-workspace" },
            notice: { leaf: "text", optional: true },
        },
        why: "if one routed project task needs its authored brief and persistent evaluation decision composed as a complete readable page.",
    },
    "personal-project-task-header": {
        host: "header",
        classes: ["flex", "min-w-0", "flex-col", "gap-3"],
        children: {
            back: { leaf: "button" },
            title: { leaf: "heading" },
            description: { leaf: "text" },
            meta: { contract: "profile-fact-run" },
        },
        why: "if a project task needs route recovery, authored identity and score/difficulty facts before its workspace.",
    },
    "personal-project-task-workspace": {
        classes: [
            "flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-6",
            "md:flex-row", "md:items-start", "md:gap-8",
            "md:[&>*:first-child]:min-w-0", "md:[&>*:first-child]:grow",
            "md:[&>*:last-child]:w-80", "md:[&>*:last-child]:shrink-0",
            "md:[&>*:last-child]:sticky", "md:[&>*:last-child]:top-rail", "md:[&>*:last-child]:self-start",
        ],
        children: {
            brief: { contract: "personal-project-task-brief" },
            submission: { contract: "personal-project-submission-panel" },
        },
        why: "if a production-length task brief must remain readable beside one continuously reachable submission owner.",
    },
    "personal-project-task-brief": {
        host: "section",
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-6", "p-4"],
        children: {
            body: { leaf: "article" },
            criteriaTitle: { leaf: "text", props: { weight: "semibold" }, optional: true },
            criteriaToggle: { leaf: "button", optional: true },
            criterion: { contract: "personal-project-criterion-row", repeats: true, restingCount: 4, optional: true },
            implementationTitle: { leaf: "text", props: { weight: "semibold" }, optional: true },
            implementation: { leaf: "article", optional: true },
            hint: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if authored guidance, scored criteria and language implementation notes form one task document.",
    },
    "personal-project-criterion-row": {
        classes: ["flex", "w-full", "min-w-0", "items-start", "justify-between", "gap-4", "border-b", "border-separator", "py-3"],
        children: {
            text: { leaf: "text", props: { size: "sm" } },
            score: { leaf: "badge" },
        },
        why: "if one learner-visible grading criterion needs its authored statement and point value compared in a list.",
    },
    "personal-project-submission-panel": {
        host: "aside",
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-4", "p-4"],
        children: {
            title: { leaf: "text", props: { weight: "semibold" } },
            repository: { composite: "field" },
            status: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            settings: { leaf: "button" },
            facts: { contract: "profile-fact-run" },
            actions: { contract: "stacked-peer-controls" },
            latest: { contract: "personal-project-latest-result", optional: true },
        },
        why: "if repository identity, grading settings, evaluation actions and latest evidence must remain one persistent task-side decision.",
    },
    "personal-project-latest-result": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-2", "border-t", "border-separator", "py-3"],
        children: {
            label: { leaf: "text", props: { size: "xs", tone: "muted" } },
            result: { contract: "profile-fact-run" },
            action: { leaf: "button" },
        },
        why: "if the newest grading verdict belongs beside the next result/history action without becoming a second page.",
    },
    "personal-project-grading-settings-drawer": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-4", "p-4"],
        children: {
            language: { leaf: "select" },
            model: { leaf: "select" },
            branch: { composite: "field" },
            token: { composite: "field" },
            tokenFact: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            status: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            action: { leaf: "button" },
        },
        why: "if language, model, branch and write-only private-repository access are edited inside one progressive-disclosure surface.",
    },
    "course-personal-project-result-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "min-w-0", "flex-col", "gap-6", "px-4", "py-6"],
        children: {
            header: { contract: "personal-project-result-header" },
            summary: { contract: "personal-project-result-summary", optional: true },
            feedback: { contract: "personal-project-feedback-list", optional: true },
            notice: { leaf: "text", optional: true },
            actions: { contract: "stacked-peer-controls" },
        },
        why: "if one grading result orders selected-attempt evidence, structured feedback and next/retry decisions in a dedicated route.",
    },
    "personal-project-result-header": {
        host: "header",
        classes: ["flex", "min-w-0", "flex-col", "gap-3"],
        children: {
            back: { leaf: "button" },
            title: { leaf: "heading" },
            description: { leaf: "text" },
        },
        why: "if a result route needs an explicit return path and stable task identity before evaluation evidence.",
    },
    "personal-project-result-summary": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3", "p-4"],
        children: {
            attempt: { leaf: "text", props: { size: "sm", tone: "muted" } },
            score: { leaf: "heading" },
            verdict: { leaf: "badge" },
            model: { leaf: "text", props: { size: "xs", tone: "muted" } },
            shortFeedback: { leaf: "text", optional: true },
        },
        why: "if the selected attempt needs score, verdict, grader provenance and its short conclusion on one bounded surface.",
    },
    "personal-project-feedback-list": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "overflow-hidden"],
        children: {
            title: { leaf: "text", props: { weight: "semibold" } },
            feedback: { contract: "personal-project-feedback-row", repeats: true, restingCount: 3 },
        },
        why: "if structured grading findings must remain scannable in authored order rather than collapse into one sentence.",
    },
    "personal-project-feedback-row": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-1", "border-t", "border-separator", "p-4"],
        children: {
            message: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            location: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            suggestion: { leaf: "text", props: { size: "sm" }, optional: true },
        },
        why: "if one finding needs its message, exact file location and corrective suggestion kept together.",
    },
    "personal-project-attempt-history-drawer": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-4", "p-4"],
        children: {
            summary: { leaf: "text", props: { size: "sm", tone: "muted" } },
            attempt: { contract: "personal-project-attempt-row", repeats: true, restingCount: 5, optional: true },
            notice: { leaf: "text", optional: true },
            pagination: { contract: "stacked-peer-controls", optional: true },
        },
        why: "if every grading attempt is selectable by verdict, score, model and time without permanently widening the result page.",
    },
    "personal-project-attempt-row": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-1", "border-b", "border-separator", "py-3"],
        children: {
            action: { leaf: "button" },
            meta: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if one attempt must be selected while its grading provenance remains a quiet comparable fact.",
    },
    "course-personal-project-page": {
        host: "main",
        classes: ["flex", "w-full", "min-w-0", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            github: { contract: "course-personal-project-github-status", optional: true },
            next: { contract: "course-personal-project-next-task", optional: true },
            completion: { contract: "course-personal-project-completion-summary" },
            milestone: { contract: "course-personal-project-current-milestone", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need a capstone dashboard ordered from project identity through the next task and whole-project evidence into only the current milestone's tasks.",
    },
    "course-personal-project-github-status": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "flex-wrap", "items-center", "gap-3"],
        children: {
            repository: { leaf: "text", props: { size: "sm", weight: "medium" } },
            branch: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            status: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need repository identity, optional branch and connection state to remain one compact fact attached to project identity.",
    },
    "course-personal-project-next-task": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3", "p-6"],
        children: {
            position: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            title: { leaf: "heading", optional: true },
            action: { leaf: "button", optional: true },
            completed: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if you need the next executable project task and its action to be replaced in place by one all-complete message.",
    },
    "course-personal-project-completion-summary": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "medium" } },
            progress: { leaf: "progress" },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if you need whole-project completion to stay paired with task, submission and score facts rather than being inferred from the current milestone.",
    },
    "course-personal-project-current-milestone": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3"],
        children: {
            title: { leaf: "heading" },
            tasks: { contract: "course-personal-project-current-task-grid" },
        },
        why: "if you need the current milestone identity to introduce its own bounded task destination grid.",
    },
    "course-personal-project-current-task-grid": {
        classes: ["grid", "w-full", "min-w-0", "grid-cols-1", "sm:grid-cols-2", "gap-4"],
        children: {
            task: { contract: "course-personal-project-task-card", repeats: true, restingCount: 4 },
        },
        why: "if you need four project task destinations to keep comparable responsive columns without flattening them into workspace navigation.",
    },
    "course-personal-project-task-card": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3", "p-4"],
        children: {
            title: { leaf: "heading" },
            status: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: "button" },
        },
        why: "if each current-milestone task keeps its title, state and destination as one bounded comparable card.",
    },
    "course-foundations-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            trial: { contract: "foundation-trial-enrollment-nudge", optional: true },
            query: { contract: "catalog-query-with-count" },
            results: { contract: "foundation-category-result-run" },
        },
        why: "if you need a foundation catalog that introduces the prerequisite library before its query and live category results, with empty and failed outcomes replacing only that result run.",
    },
    "foundation-trial-enrollment-nudge": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3", "p-4", "rounded-2xl"],
        children: {
            message: { leaf: "text", props: { size: "sm" } },
            action: { leaf: "button", optional: true },
        },
        why: "if you need a trial learner to keep the free foundation library in view while retaining one route back to full course enrollment.",
    },
    "foundation-category-result-run": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-4"],
        children: {
            list: { contract: "foundation-category-destination-list", optional: true },
            notice: { composite: "empty-notice", optional: true },
            pager: { leaf: "pagination", optional: true },
        },
        why: "if you need one stable foundation result region whose pending, empty, failed and paged outcomes replace only one another.",
    },
    "foundation-category-destination-list": {
        host: "ul",
        classes: ["overflow-hidden", "divide-y", "divide-separator", "border", "border-separator", "rounded-2xl"],
        children: {
            category: { contract: "foundation-category-destination-row", repeats: true, restingCount: 10 },
        },
        why: "if you need the populated foundation destinations held as one ordered visual list inside the stable result region.",
    },
    "foundation-category-destination-row": {
        host: "li",
        classes: ["flex", "min-w-0", "items-center", "gap-4", "p-4", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow", "[&>*:last-child]:shrink-0"],
        children: {
            artwork: { leaf: "cover-image" },
            identity: { contract: "foundation-category-identity" },
            action: { leaf: "button", optional: true },
        },
        why: "if you need one foundation category's artwork and explanatory identity to remain aligned with its only destination control.",
    },
    "foundation-category-identity": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "medium" } },
            description: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if you need a repeated foundation title kept attached to the supporting sentence that distinguishes it from nearby categories.",
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
        why: "if you need one foundation category as a searchable reading list whose title and query precede an ordered backend-resource run or its settled notice.",
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
        why: "if you need a prerequisite resource read from server title through authored body to a related practice action, with back navigation retained across ready and recovery states.",
    },
    "playground-session-frame": {
        classes: ["flex", "min-h-screen", "w-full", "min-w-0", "flex-col"],
        children: {
            surface: { leaf: "page", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need a full-width frame that keeps its pairing/socket owner mounted while a routed session surface swaps beneath it.",
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
        why: "if you need a live-lab catalog explaining server verification once before a peer run of backend playground destinations across pending, empty and failed states.",
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
        why: "if you need playground preparation before session creation, followed by server pairing identity and agent readiness before entry becomes available.",
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
        why: "if you need a persistent playground workspace ordered as connection state, server-owned steps and selected instruction, with one verification action and server-settled completion or failure.",
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
        why: "if you need concept-map search and graph scale ahead of a selectable backend-node field whose open action appears only for a node resolving to a course route.",
    },
    "course-mock-interview-hub-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            navigation: { contract: "mock-interview-setup-tabs-over-panel" },
            panel: { contract: "mock-interview-setup-panel" },
        },
        why: "if you need the interview setup route to keep its orientation and three setup destinations stable while one selected panel changes beneath them.",
    },
    "mock-interview-setup-tabs-over-panel": {
        classes: ["flex", "w-full", "flex-col", "gap-3", "border-b", "border-separator"],
        children: { tabs: { leaf: "choice-tabs" } },
        why: "if you need begin, history and statistics to remain one navigation layer above the setup panel they replace.",
    },
    "mock-interview-setup-panel": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-6"],
        children: {
            resume: { contract: "mock-interview-resume-panel", optional: true },
            readiness: { contract: "mock-interview-readiness-snapshot", optional: true },
            begin: { contract: "mock-interview-begin-panel", optional: true },
            history: { contract: "mock-interview-history-panel", optional: true },
            stats: { contract: "mock-interview-stats-panel", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need one selected mock-interview destination to own its settled, waiting or recovery content without moving the setup navigation.",
    },
    "mock-interview-resume-panel": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4", "p-4", "rounded-2xl"],
        children: {
            identity: { contract: "title-with-baseline-fact" },
            action: { leaf: "button" },
        },
        why: "if you need an unfinished interview's real progress kept beside the one action that returns the learner to it.",
    },
    "mock-interview-readiness-snapshot": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-4"],
        children: { fact: { contract: "title-with-baseline-fact", repeats: true, restingCount: 3 } },
        why: "if you need seniority, interview format and course focus compared as one compact readiness snapshot before entering the room.",
    },
    "mock-interview-begin-panel": {
        classes: ["flex", "w-full", "flex-col", "gap-4", "border", "border-separator", "rounded-2xl", "p-4"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            levelLabel: { leaf: "text", props: { size: "sm", tone: "muted" } },
            level: { leaf: "choice-tabs" },
            modeLabel: { leaf: "text", props: { size: "sm", tone: "muted" } },
            mode: { leaf: "choice-tabs" },
            status: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            action: { leaf: "button", repeats: true, restingCount: 2 },
        },
        why: "if you need the interviewer briefing, compact configuration and start-or-resume actions to stay one readable green-room surface.",
    },
    "mock-interview-history-panel": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-4"],
        children: {
            attempt: { contract: "mock-interview-history-row", repeats: true, restingCount: 3, optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need completed interview attempts to settle inside their own selected setup destination without moving the page orientation or tabs.",
    },
    "mock-interview-history-row": {
        classes: ["flex", "min-w-0", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-3", "border-b", "border-separator", "py-3"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "medium" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need one completed interview's identity and score verdict aligned for repeated history scanning.",
    },
    "mock-interview-stats-panel": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-4"],
        children: {
            evidence: { composite: "labelled-progress-row", repeats: true, restingCount: 3, optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need aggregate interview evidence to settle inside its own selected setup destination without replacing the green-room owner.",
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
        why: "if you need a live interview room ordered from prompt and server clock through conversation and one answer decision to a supporting question workspace.",
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
        why: "if you need a persisted interview debrief ordered from outcome and rubric through strengths, gaps and question evidence to one next action, with grading and recovery retaining the page owner.",
    },
    "course-learn-challenge-page": {
        host: "main",
        classes: [
            "flex", "w-full", "min-w-0", "flex-col", "items-start",
            "md:flex-row", "md:items-start",
            "[&>*:first-child]:hidden",
            "md:[&>*:first-child]:block",
            "md:[&>[data-node=learn-route-context-rail]]:w-80",
            "md:[&>[data-node=learn-route-context-rail]]:shrink-0",
            "md:[&>[data-node=learn-route-context-rail]]:sticky",
            "md:[&>[data-node=learn-route-context-rail]]:top-rail",
            "md:[&>[data-node=learn-route-context-rail]]:self-start",
            "md:[&>[data-node=learn-route-context-rail]]:max-h-rail",
            "md:[&>[data-node=learn-route-context-rail]]:overflow-y-auto",
            "md:[&>*:nth-child(2)]:min-w-0",
            "md:[&>*:nth-child(2)]:grow",
        ],
        children: {
            contents: { contract: "learn-route-context-rail" },
            page: { contract: "challenge-page-document" },
        },
        why: "if you need the complete challenge route with the existing course map beside one flexible challenge document, preserving the accepted full-page composition rather than mounting an isolated form.",
    },
    "challenge-page-document": {
        host: "section",
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "min-w-0", "flex-col", "gap-6", "px-4", "py-6", "pb-6"],
        children: {
            mobileMap: { contract: "challenge-mobile-map-row", optional: true },
            back: { leaf: "button" },
            header: { contract: "challenge-header" },
            body: { contract: "challenge-workspace" },
        },
        why: "if you need the challenge document to own its header, long brief and submission consequence while the viewport remains the only document-height scroll owner.",
    },
    "challenge-mobile-map-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "justify-between", "gap-3", "md:hidden"],
        children: {
            action: { leaf: "button" },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need one compact narrow-screen control that opens the same course map hidden from the persistent desktop rail.",
    },
    "challenge-header": {
        host: "header",
        classes: ["flex", "min-w-0", "flex-col", "gap-3"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text" },
            meta: { contract: "profile-fact-run" },
        },
        why: "if a challenge needs authored identity, summary, difficulty, score and attempt status in one opening cluster.",
    },
    "challenge-workspace": {
        classes: [
            "flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-6",
            "md:flex-row", "md:items-start", "md:gap-8",
            "md:[&>*:first-child]:min-w-0", "md:[&>*:first-child]:grow",
            "md:[&>*:last-child]:w-80", "md:[&>*:last-child]:shrink-0",
            "md:[&>*:last-child]:sticky", "md:[&>*:last-child]:top-rail", "md:[&>*:last-child]:self-start",
        ],
        children: {
            brief: { contract: "challenge-brief" },
            rail: { contract: "challenge-submission-rail" },
        },
        why: "if you need the accepted flexible technical brief beside a bounded sticky submission rail, reflowing in the same order on narrow screens.",
    },
    "challenge-brief": {
        host: "section",
        classes: ["flex", "min-w-0", "flex-col", "gap-3", "p-4"],
        children: {
            overview: { leaf: "text" },
            requirement: { contract: "challenge-requirement-disclosure", repeats: true, restingCount: 2, optional: true },
            hint: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if a learner needs the source-authored challenge overview, scored requirement disclosures and optional hint in one readable brief.",
    },
    "challenge-requirement-disclosure": {
        classes: ["w-full", "min-w-0"],
        children: {
            summary: { contract: "challenge-requirement-summary" },
            body: { contract: "challenge-requirement-body" },
        },
        why: "if one source-authored deliverable must also explain its scored requirement through keyboard-operable disclosure mechanics.",
    },
    "challenge-requirement-summary": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "items-center", "justify-between", "gap-3", "py-3", "text-left"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            score: { leaf: "badge" },
        },
        why: "if a scored challenge requirement needs its name and point value on one disclosure trigger line.",
    },
    "challenge-requirement-body": {
        classes: ["border-t", "border-separator", "py-3"],
        children: {
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if an expanded challenge requirement needs its authored explanation attached directly below the trigger.",
    },
    "challenge-submission-rail": {
        host: "aside",
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-4"],
        children: {
            deliverables: { contract: "challenge-deliverable-list" },
            score: { contract: "challenge-score-card" },
        },
        why: "if the challenge needs one bounded action owner that keeps repository evidence and aggregate grading consequence together.",
    },
    "challenge-deliverable-list": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "divide-y", "divide-separator", "p-0"],
        children: {
            notice: { leaf: "text", optional: true },
            deliverable: { contract: "challenge-deliverable-row", repeats: true, restingCount: 2, optional: true },
            recovery: { leaf: "button", optional: true },
        },
        why: "if a challenge repeats scored deliverables on one joined surface with no trailing rule after the last member.",
    },
    "challenge-deliverable-row": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3", "p-4"],
        children: {
            heading: { contract: "challenge-deliverable-heading" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            field: { composite: "field", optional: true },
            status: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            actions: { contract: "challenge-deliverable-actions" },
        },
        why: "if one authored deliverable needs its score, repository evidence, settled status and exact available action as one list member.",
    },
    "challenge-deliverable-heading": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "items-start", "justify-between", "gap-3"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            score: { leaf: "badge" },
        },
        why: "if a deliverable title needs the authored point value held at the trailing edge without squeezing the name.",
    },
    "challenge-deliverable-actions": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            action: { leaf: "button", repeats: true, restingCount: 1 },
        },
        why: "if a deliverable exposes its one current submit, retry or result action without moving the field around it.",
    },
    "challenge-score-card": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3", "p-4"],
        children: {
            heading: { contract: "challenge-score-heading" },
            progress: { leaf: "progress" },
            caption: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if a challenge needs one aggregate earned score read against an explicit passing threshold.",
    },
    "challenge-score-heading": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "items-end", "justify-between", "gap-3"],
        children: {
            value: { leaf: "heading" },
            threshold: { leaf: "badge" },
        },
        why: "if the earned score and pass threshold need to remain one visible grading sentence.",
    },
    "course-learn-challenge-result-page": {
        host: "main",
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "centred-title-pair" },
            score: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            body: { contract: "stacked-peer-controls" },
        },
        why: "if you need a persisted challenge result joining score, scorer findings and one retry-or-continue decision, with loading and recovery replacing only its evidence body.",
    },
    "flashcard-mode-tabs": {
        host: "nav",
        classes: ["flex", "flex-row", "gap-2", "border-b", "border-separator"],
        children: {
            tab: { leaf: "nav-link", props: { kind: "tab" }, repeats: true, restingCount: 2 },
        },
        why: "if you need the review/quiz mode switch shared across the flashcard routes.",
    },
    "flashcard-view-tabs": {
        host: "nav",
        classes: ["flex", "min-w-0", "flex-row", "gap-2", "border-b", "border-separator", "overflow-auto", "[&>*]:whitespace-nowrap"],
        children: {
            tab: { leaf: "nav-link", props: { kind: "tab" }, repeats: true, restingCount: 3 },
        },
        why: "if you need overview, history and statistics to remain one bounded keyboard-operable view axis without wrapping its labels.",
    },
    "flashcard-dual-tab-toolbar": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3", "sm:flex-row", "sm:items-start", "sm:justify-between"],
        children: {
            mode: { contract: "flashcard-mode-tabs" },
            view: { contract: "flashcard-view-tabs" },
        },
        why: "if you need route mode and local evidence view to keep independent selected keys while sharing one row only when both axes fit.",
    },
    "flashcard-review-due-card": {
        classes: ["flex", "flex-col", "gap-3", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            fact: { leaf: "text", props: { size: "sm", weight: "medium" } },
            action: { leaf: "button", optional: true },
        },
        why: "if you need one resumable due-queue card: name, explanation, count, then a single start-or-resume action.",
    },
    "flashcard-review-deck-card": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-3", "px-4", "py-3"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            facts: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: "button" },
        },
        why: "if you need one comparable deck row: identity and explanation yield before card, due and mastery facts plus one review action.",
    },
    "flashcard-review-deck-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0"],
        children: {
            deck: { contract: "flashcard-review-deck-card", repeats: true, restingCount: 4 },
        },
        why: "if you need comparable flashcard decks to share one bounded list with full-width separators instead of becoming a card grid.",
    },
    "flashcard-review-mode-modal": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            choice: { contract: "flashcard-review-choice-row", repeats: true, restingCount: 2 },
            action: { leaf: "button", repeats: true, restingCount: 2 },
        },
        why: "if you need one review-scope dialog ordering deck identity, all-versus-due choices and cancel/start actions.",
    },
    "flashcard-review-choice-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "justify-between", "gap-3", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need one selectable review scope joining its name with card count and estimated duration.",
    },
    "flashcard-deck-toolbar": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-3", "sm:flex-row", "sm:items-start", "sm:justify-between"],
        children: {
            search: { leaf: "input" },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if you need a deck search field and its settled result count to share a row only while both remain usable.",
    },
    "flashcard-evidence-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0"],
        children: {
            row: { contract: "flashcard-evidence-row", repeats: true, restingCount: 4 },
        },
        why: "if you need comparable history or retention evidence to share one bounded list with edge-to-edge separators.",
    },
    "flashcard-evidence-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-3", "px-4", "py-3"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "medium" } },
            description: { leaf: "text", props: { size: "sm", tone: "muted" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need one historical session or learning signal to keep its identity readable before supporting evidence and one trailing fact.",
    },
    "flashcard-stat-grid": {
        classes: ["grid", "grid-cols-1", "sm:grid-cols-4", "border", "border-separator", "rounded-xl", "overflow-hidden"],
        children: {
            stat: { contract: "flashcard-result-stat", repeats: true, restingCount: 4 },
        },
        why: "if you need four comparable flashcard figures to collapse to one track while retaining one shared boundary.",
    },
    "course-flashcards-review-page": {
        host: "main",
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-6", "p-6"],
        children: {
            header: { contract: "centred-title-pair" },
            toolbar: { contract: "flashcard-dual-tab-toolbar" },
            due: { contract: "flashcard-review-due-card", optional: true },
            stats: { contract: "flashcard-stat-grid", optional: true },
            deckToolbar: { contract: "flashcard-deck-toolbar", optional: true },
            decksTitle: { leaf: "heading", optional: true },
            decks: { contract: "flashcard-review-deck-list", optional: true },
            evidenceTitle: { leaf: "heading", optional: true },
            evidence: { contract: "flashcard-evidence-list", optional: true },
            modal: { contract: "flashcard-review-mode-modal", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need a flashcard review overview with stable identity and mode switch above stateful study evidence ordered as due work, progress and peer decks.",
    },
    "flashcard-quiz-configuration": {
        classes: ["flex", "flex-col", "gap-4", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            title: { leaf: "heading" },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
            resume: { leaf: "button", optional: true },
            nameLabel: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            name: { leaf: "input" },
            scopeLabel: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            scope: { leaf: "button", repeats: true, restingCount: 2 },
            modeLabel: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            mode: { leaf: "button", repeats: true, restingCount: 2 },
            levelLabel: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            level: { leaf: "button", repeats: true, restingCount: 5 },
            start: { leaf: "button" },
        },
        why: "if you need the quiz setup surface, ordered as session facts and resume, then mode choices, then level choices, then one start action.",
    },
    "course-flashcards-quiz-page": {
        host: "main",
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-6", "p-6"],
        children: {
            header: { contract: "centred-title-pair" },
            toolbar: { contract: "flashcard-dual-tab-toolbar" },
            configuration: { contract: "flashcard-quiz-configuration", optional: true },
            evidenceTitle: { leaf: "heading", optional: true },
            evidence: { contract: "flashcard-evidence-list", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need a flashcard quiz route with shared identity and mode switch above one finite setup surface that empty or failed transport can replace in place.",
    },
    "flashcard-session-header": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4", "border-b", "border-separator", "py-3"],
        children: {
            deck: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            title: { leaf: "heading" },
            leave: { leaf: "button" },
        },
        why: "if you need a session header where the deck name qualifies the title and one leave action sits at the far edge.",
    },
    "flashcard-session-card": {
        classes: ["flex", "flex-1", "flex-col", "justify-center", "gap-6", "rounded-2xl", "border", "border-separator", "p-6"],
        children: {
            prompt: { leaf: "text", props: { size: "md", weight: "medium" } },
            instruction: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            cloze: { leaf: "text", props: { size: "md" }, optional: true },
            bankLabel: { leaf: "text", props: { size: "sm", weight: "semibold" }, optional: true },
            term: { leaf: "button", repeats: true, restingCount: 3, optional: true },
            result: { leaf: "text", props: { size: "sm", weight: "medium" }, optional: true },
            answer: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            check: { leaf: "button", optional: true },
            solution: { leaf: "button", optional: true },
        },
        why: "if you need one focused flashcard work surface that either flips a plain answer or runs cloze fill, check, full solution and SM-2 rating in order.",
    },
    "course-flashcard-session-page": {
        host: "main",
        classes: ["flex", "min-h-screen", "w-full", "min-w-0", "flex-col", "gap-6", "p-6"],
        children: {
            header: { contract: "flashcard-session-header" },
            progress: { contract: "label-with-muted-fact-row", optional: true },
            card: { contract: "flashcard-session-card", optional: true },
            status: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            action: { leaf: "button", repeats: true, restingCount: 4, optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need a live flashcard session ordered as orientation, progress, one focused card and only the actions admitted by its reveal and transport state.",
    },
    "flashcard-result-stat": {
        classes: ["flex", "flex-col", "gap-2", "rounded-xl", "border", "border-separator", "p-4"],
        children: {
            label: { leaf: "text", props: { size: "xs", tone: "muted" } },
            value: { leaf: "heading" },
        },
        why: "if you need one labelled numeric result figure — score, cards, XP, duration — repeated as a set of comparable stats.",
    },
    "flashcard-result-fact-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2", "rounded-xl", "p-4"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "medium" } },
            value: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if you need a row comparing a name with one stored value on a shared baseline, for grade or weak-topic breakdowns.",
    },
    "course-flashcard-result-page": {
        host: "main",
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-6", "p-6"],
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
        why: "if you need a persisted flashcard result ordered from mode and outcome through summary figures and optional due or diagnostic evidence to back and repeat actions across loading and failure.",
    },
    "nav-over-body-page": {
        classes: ["flex", "min-h-screen", "w-full", "flex-col"],
        children: {
            navigation: { contract: "double-navbar" },
            body: { contract: "routed-page-main" },
        },
        why: "if you need the app's top-level frame where navigation and the routed page body are siblings so a route change repaints only the body.",
    },
    "routed-page-main": {
        // The document's one main landmark. The key's name has said so all along; now the entry
        // does, instead of a second frame component existing to swap the tag.
        host: "main",
        classes: ["flex", "min-w-0", "grow", "flex-col"],
        children: {
            page: { leaf: "page" },
        },
        why: "if you need the document's one main landmark, sized to the height the navbar leaves rather than a measure of its own.",
    },
    "centred-authentication-page": {
        classes: ["flex", "min-h-screen", "w-full", "items-center", "justify-center", "p-6"],
        children: {
            surface: { contract: "authentication-panel-card" },
        },
        why: "if you need a route whose only task is one centred authentication card, without the dashboard's rail-and-main order.",
    },
    "authentication-panel-card": {
        classes: ["w-full", "max-w-md", "p-4"],
        children: {
            panel: { contract: "centred-page-column" },
        },
        why: "if you need one bounded card holding a centred auth form while the form inside keeps its own typed rhythm.",
    },
    "title-with-end-action": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            title: { leaf: "heading" },
            end: { leaf: ["button", "see-more-link"], optional: true },
        },
        why: "if you need a titled row whose trailing control drops beneath the title instead of squeezing it when space runs out.",
    },
    "title-with-baseline-fact": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "gap-2"],
        children: {
            title: { leaf: "heading" },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if you need a heading with a muted fact reading on the title's own baseline as part of the same sentence.",
    },
    "profile-tabs-over-body": {
        classes: ["flex", "w-full", "flex-col"],
        children: {
            tabs: { contract: "underlined-tab-strip" },
            body: { contract: "profile-page-measure" },
        },
        why: "if you need the persistent public-profile layout's tab strip stacked above its measured route body, owned by the layout rather than by any one profile route.",
    },
    "profile-page-measure": {
        classes: ["@container", "mx-auto", "w-full", "max-w-app-xl"],
        children: { inset: { contract: "profile-page-inset" } },
        why: "if you need a profile route's content held to the legacy eighty-rem measure instead of inheriting the narrower dashboard cap.",
    },
    "profile-page-inset": {
        classes: ["p-6"],
        children: { shell: { contract: "profile-rail-container" } },
        why: "if you need a padded inset that sits inside an already-measured profile container while still exposing its own container-query breakpoint.",
    },
    "profile-rail-container": {
        classes: ["@container", "w-full"],
        children: { split: { contract: "profile-rail-then-main" } },
        why: "if you need the rail/main split to carry its own container-query boundary instead of depending on an ancestor's breakpoint.",
    },
    "profile-rail-then-main": {
        classes: ["flex", "w-full", "flex-col", "gap-6", "@app-md:flex-row", "@app-md:items-start", "@app-md:gap-8"],
        children: {
            rail: { contract: "profile-identity-rail" },
            main: { contract: ["profile-main", "centred-empty-notice"] },
        },
        why: "if you need a fixed-width identity rail placed beside a flexible main region, with the rail moving above main on a narrow screen.",
    },
    "profile-identity-rail": {
        classes: ["flex", "w-full", "shrink-0", "flex-col", "@app-md:w-72"],
        children: {
            hero: { contract: "profile-hero-rail" },
        },
        why: "if you need the profile rail to hold exactly one identity block rather than separate identity, proof and action cards.",
    },
    "profile-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            section: { contract: ["label-row-over-card", "profile-overview-skill-grid"], repeats: true, restingCount: 4 },
        },
        why: "if you need a profile route's evidence body as a repeating list of independently landing labelled sections sharing one seam, reused across the overview and skills routes.",
    },
    "profile-overview-skill-grid": {
        classes: ["grid", "grid-cols-1", "gap-6", "sm:grid-cols-2"],
        children: {
            section: { contract: "label-row-over-card", repeats: true, restingCount: 2 },
        },
        why: "if you need two peer skill-evidence sections that stack on a narrow card and share one row only once both retain useful width.",
    },
    "profile-metric-ribbon": {
        classes: ["grid", "grid-cols-2", "gap-3", "p-4", "sm:grid-cols-4"],
        children: { metric: { composite: "profile-metric", repeats: true, restingCount: 4 } },
        why: "if you need four skill metrics from the shared profile-metric composite shown as a two-then-four column ribbon.",
    },
    "profile-breakdown-stack": {
        classes: ["flex", "flex-col", "gap-4"],
        children: { breakdown: { contract: "profile-breakdown", repeats: true, restingCount: 3 } },
        why: "if you need several independent evidence breakdowns, such as difficulty, topic and language, stacked with one shared vertical rhythm.",
    },
    "profile-breakdown": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            visual: { contract: ["profile-segment-run", "profile-topic-chip-run"] },
            caption: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if you need one labelled breakdown that swaps between a segment run or a topic chip run as its visual, with an optional caption.",
    },
    "profile-segment-run": {
        classes: ["flex", "flex-row", "overflow-hidden", "rounded-xl"],
        children: { segment: { composite: "profile-segment", repeats: true, restingCount: 3 } },
        why: "if you need proportional distribution segments bounded into one rounded run so their relative share reads as a single whole.",
    },
    "profile-segment-piece": {
        classes: ["flex-1", "p-2", "text-center"],
        children: { value: { leaf: "text", props: { size: "xs", tone: "muted" } } },
        why: "if you need one proportional segment inside a shared distribution run to display its own count.",
    },
    "profile-topic-chip-run": {
        classes: ["flex", "flex-row", "flex-wrap", "gap-2"],
        children: { topic: { leaf: "badge", repeats: true, restingCount: 4 } },
        why: "if you need topic counts to wrap as compact peer badges before any label is squeezed or clipped.",
    },
    "profile-achievement-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2", "lg:grid-cols-3"],
        children: { achievement: { composite: "profile-achievement", repeats: true, restingCount: 3 } },
        why: "if you need earned achievements shown as equal proof cards that gain columns only once name and rarity stay readable.",
    },
    "profile-achievement-card": {
        classes: ["flex", "flex-col", "gap-2", "p-4"],
        children: {
            mark: { leaf: "icon-tile" },
            name: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            rarity: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need one achievement's mark, name and rarity to read as a single earned-proof object rather than three detached facts.",
    },
    "profile-toolbar-over-list": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: { toolbar: { contract: "profile-search-filter-row" }, list: { contract: "profile-evidence-list" } },
        why: "if you need a search/filter toolbar attached directly above the one evidence list it controls, rather than to the whole route.",
    },
    "profile-search-filter-row": {
        classes: ["flex", "flex-row", "items-center", "justify-between", "gap-3"],
        children: { search: { leaf: "search-box" }, filter: { leaf: "button" } },
        why: "if you need a search box to take the flexible lane and a short filter action to stay visible at its end on one control row.",
    },
    "profile-cv-page": {
        classes: ["flex", "flex-col", "gap-6"],
        children: { action: { leaf: "button", optional: true }, paper: { contract: "profile-cv-paper" } },
        why: "if you need a CV page keeping its owner-only edit action outside the read-only document surface.",
    },
    "profile-cv-paper": {
        classes: ["mx-auto", "w-full", "max-w-app-lg", "overflow-hidden", "p-4"],
        children: { document: { leaf: "profile-cv-document" } },
        why: "if you need a public CV document held to one bounded paper measure without profile-card chrome.",
    },
    "profile-proof-header": {
        classes: ["flex", "flex-col", "gap-3"],
        children: { back: { leaf: "button" }, title: { leaf: "heading" }, meta: { leaf: "text", props: { size: "sm", tone: "muted" } } },
        why: "if you need a route-local back path, proof title and qualifier to form one orientation block before detailed proof evidence begins.",
    },
    "profile-coding-statement": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: { statement: { leaf: "text" }, tags: { contract: "profile-topic-chip-run", optional: true } },
        why: "if you need a coding proof's problem statement and optional topic tags shown as one honest description, never as source code.",
    },
    "profile-coding-detail-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            header: { contract: "profile-proof-header" },
            section: { contract: "label-row-over-card", repeats: true, restingCount: 2 },
        },
        why: "if you need a coding-proof detail body with one route-local header ahead of independently bounded statement and submission-evidence sections.",
    },
    "profile-proof-metrics": {
        classes: ["grid", "grid-cols-2", "gap-3", "p-4", "sm:grid-cols-4"],
        children: { metric: { contract: "profile-proof-metric", repeats: true, restingCount: 4 } },
        why: "if you need standing challenge-proof metrics, including an error-state placeholder, shown as a two-then-four column ribbon.",
    },
    "profile-proof-metric": {
        classes: ["flex", "flex-col", "gap-1"],
        children: { figure: { leaf: "text" }, label: { leaf: "text", props: { size: "xs", tone: "muted" } } },
        why: "if you need one proof figure and its short qualifier to read as a single metric sentence that never splits across rows.",
    },
    "profile-project-card-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2"],
        children: { card: { contract: "profile-project-card", repeats: true, restingCount: 2 } },
        why: "if you need pinned project proofs to stack when narrow and become equal peer cards only once each keeps a readable title and description width.",
    },
    "profile-project-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            badge: { leaf: "badge" },
            title: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            description: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            tech: { contract: "profile-project-tech-run", optional: true },
        },
        why: "if you need one pinned project's verification badge, title, optional description and technology run to form a single bounded portfolio proof.",
    },
    "profile-project-tech-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: { tech: { leaf: "badge", repeats: true, restingCount: 3 } },
        why: "if you need a project's technology facts to wrap inside its own card instead of widening or truncating the card.",
    },
    "profile-proof-summary": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            back: { leaf: "button" },
            title: { leaf: "heading" },
            meta: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            progress: { leaf: "progress", optional: true },
        },
        why: "if you need a route-local back path, proof identity, optional qualifier and optional completion measure to orient the reader before detail evidence, reused across proof-detail routes.",
    },
    "profile-detail-toolbar": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            search: { leaf: "input" },
            filter: { leaf: "button", optional: true },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if you need a route-local search, optional filter and result-count control row that wraps before any control becomes unreadable.",
    },
    "profile-roadmap-list": {
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "p-0"],
        children: { milestone: { composite: "evidence-row", repeats: true, restingCount: 4 } },
        why: "if you need ordered capstone milestones joined as one separated proof list instead of turning each milestone into its own card.",
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
        why: "if you need the frameless identity rail combining avatar, name, optional bio, facts, public proof, one action and supporting links with no surface boundary invented around them.",
    },
    "profile-name-role-stack": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            name: { leaf: "heading" },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
            role: { leaf: "text", props: { size: "sm" }, optional: true },
        },
        why: "if you need a person's display name, public handle and optional role to read as one tight identity sentence instead of competing headings.",
    },
    "profile-fact-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            fact: { leaf: "badge", repeats: true, restingCount: 2 },
        },
        why: "if you need short peer facts such as location and work mode to wrap together before either forces the identity column wider.",
    },
    "profile-proof-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "gap-2"],
        children: {
            fact: { leaf: "text", props: { size: "sm", weight: "semibold" }, repeats: true, restingCount: 2 },
        },
        why: "if you need follower and standing facts to scan as peer social proof on one baseline without either becoming a second profile heading.",
    },
    "profile-action-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-2", "[&>*:first-child]:grow"],
        children: {
            primary: { leaf: "button" },
            share: { leaf: "icon-button" },
        },
        why: "if you need one primary action taking the available width beside a compact secondary icon action, not two competing primaries.",
    },
    "profile-meta-list": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            item: { leaf: ["link", "text"], repeats: true, restingCount: 3 },
        },
        why: "if you need a vertical list of link-or-text rows that follow a primary action as supporting peers, without becoming another card or heading.",
    },
    "profile-evidence-list": {
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "p-0"],
        children: {
            evidence: { composite: "evidence-row", repeats: true, restingCount: 3 },
        },
        why: "if you need a full-width divided list of evidence rows, each owning its own title, qualifier and trailing fact.",
    },
    "evidence-title-subtitle-fact-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "justify-between", "gap-4", "p-4", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow"],
        children: {
            identity: { contract: "evidence-title-over-subtitle" },
            fact: { leaf: ["badge", "text"], optional: true },
            disclosure: { leaf: "icon", optional: true },
        },
        why: "if you need a title-subtitle identity that keeps the available width while a short trailing fact and disclosure stay scannable.",
    },
    "evidence-title-over-subtitle": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            subtitle: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if you need a proof title with a smaller qualifying line attached directly beneath it.",
    },
    "dashboard-rail-then-main": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "md:gap-8", "px-6", "py-6", "md:flex-row", "md:items-start", "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0", "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow"],
        children: {
            rail: { contract: "dashboard-rail" },
            main: { contract: ["dashboard-main", "dashboard-tab-main", "centred-empty-notice"] },
        },
        why: "if you need the dashboard's fixed-width learner rail placed beside a flexible main column that stacks above it on a narrow screen.",
    },
    "dashboard-rail": {
        classes: ["flex", "w-full", "flex-col", "gap-6"],
        children: {
            section: { contract: ["stacked-stat-rows", "label-row-over-card"], repeats: true, restingCount: 2 },
        },
        why: "if you need a bare fixed-width rail of stacked identity and quick-destination sections without an enclosing surface.",
    },
    "dashboard-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            section: { contract: ["label-row-over-card", "explore-main"], repeats: true, restingCount: 8 },
        },
        why: "if you need the dashboard overview's fixed eight-section reading order rendered as separate labelled surfaces in the main column.",
    },
    "dashboard-tab-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            section: { contract: "label-row-over-card", repeats: true, restingCount: 3 },
        },
        why: "if you need a selected dashboard tab's own labelled sections kept in their reading order without owning a second column shape.",
    },
    "label-row-over-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            label: { contract: ["title-with-end-action", "title-with-baseline-fact"] },
            body: { contract: "$content" },
        },
        why: "if you need a section label held outside the surface it names, so a card-shaped body never nests inside another card.",
    },
    "empty-notice-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            notice: { composite: "empty-notice" },
        },
        why: "if you need an empty-state notice given its own bounded ground beneath a section label.",
    },
    "empty-notice-stack": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "text-center"],
        children: {
            mark: { leaf: "icon-tile", optional: true },
            message: { leaf: "text", props: { size: "sm", tone: "muted" } },
            description: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            action: { leaf: "button", optional: true },
        },
        why: "if you need an empty state's optional mark, message, description and recovery action centred in one reading order.",
    },
    "resume-item-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "medium" } },
            kind: { leaf: "text", props: { size: "sm", tone: "muted" } },
            resume: { leaf: "see-more-link", optional: true },
        },
        why: "if you need one resumable item's kind, title and way back bounded together on shared ground.",
    },
    "weekly-challenge-card": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            title: { composite: "weekly-challenge-title" },
            status: { composite: "weekly-challenge-status" },
            passed: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            finishers: { contract: "weekly-challenge-finishers", optional: true },
        },
        why: "if you need one bounded card telling a weekly challenge's title, countdown/status, pass count and recent finishers together.",
    },
    "weekly-challenge-title": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "w-full"],
        children: {
            glyph: { leaf: "icon", optional: true },
            title: { leaf: "text" },
        },
        why: "if you need a single title line with an optional leading practice glyph.",
    },
    "weekly-challenge-status": {
        classes: ["flex", "flex-row", "items-center", "justify-between", "gap-3", "w-full"],
        children: {
            endsIn: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: ["button", "badge"] },
        },
        why: "if you need a countdown paired with the viewer's one available outcome on a single row.",
    },
    "weekly-challenge-finisher-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full"],
        children: {
            avatar: { leaf: "avatar" },
            name: { leaf: "text" },
            passedAt: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need one row identifying a recent finisher by avatar and name with relative time trailing.",
    },
    "weekly-challenge-finishers": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            finisher: { composite: "weekly-challenge-finisher-row", repeats: true, restingCount: 3 },
        },
        why: "if you need a joined list of recent finisher rows, capped to the resting count the card shows before a reader asks for more.",
    },
    "job-readiness-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            percentile: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            metrics: { contract: "job-readiness-list" },
            action: { leaf: "button", optional: true },
        },
        why: "if you need a card pairing an outlined readiness list with a supporting percentile line and one optional next action beneath it.",
    },
    "job-readiness-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            row: { composite: "labelled-progress-row", repeats: true, restingCount: 3 },
        },
        why: "if you need an outlined joined list of scored readiness pillars sharing one surface with full-width row separators.",
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
        why: "if you need a joined list of rows that each carry a completion mark, separated by full-width rules instead of card spacing.",
    },
    "rank-title-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "w-full", "[&>*:first-child]:w-5", "[&>*:first-child]:shrink-0", "[&>*:first-child]:text-center", "[&>*:first-child]:tabular-nums", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            rank: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            title: { leaf: "text-link", props: { size: "sm" } },
        },
        why: "if you need a compact fixed rank column beside one actionable title, comparable down a joined list of results.",
    },
    "avatar-identity-badge-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "name-over-handle" },
            badge: { leaf: "badge", optional: true },
            action: { leaf: "button" },
        },
        why: "if you need an identity row read as avatar then name then optional qualifier then a single trailing action.",
    },
    "name-over-handle": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            name: { leaf: "text-link", props: { size: "sm" } },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a display name and its handle stacked as one tight identity, the handle qualifying rather than competing.",
    },
    "activity-actor-body-time-row": {
        classes: ["flex", "flex-row", "items-start", "gap-3", "w-full", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            body: { contract: "activity-sentence-over-reaction" },
            time: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need one row showing an actor's avatar, the activity sentence-and-reaction body, and a trailing quiet timestamp.",
    },
    "activity-sentence-over-reaction": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            sentence: { contract: "activity-actor-action-target-sentence" },
            reaction: { leaf: "reaction-picker", optional: true },
        },
        why: "if you need an activity sentence with an optional reaction control stacked directly beneath it.",
    },
    "activity-actor-action-target-sentence": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            actor: { leaf: "text-link", props: { size: "sm" } },
            action: { leaf: "text", props: { size: "sm" } },
            target: { leaf: "text-link", props: { size: "sm" }, optional: true },
        },
        why: "if you need a sentence where the actor and target stay independently pressable links, with the plain-text action verb keeping them apart so a press cannot land on the wrong name.",
    },
    "contribution-calendar-stack": {
        classes: ["flex", "flex-col", "gap-3", "w-full"],
        children: {
            heading: { contract: "contribution-calendar-heading-row" },
            grid: { leaf: "contribution-grid" },
            footer: { contract: "contribution-calendar-footer-row" },
        },
        why: "if you need the contribution calendar's heading, activity grid and footer joined as one fixed visualization.",
    },
    "contribution-calendar-heading-row": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            total: { leaf: "text", props: { size: "xs", tone: "muted" } },
            years: { leaf: "choice-tabs" },
        },
        why: "if you need the calendar's activity total paired with its year choice sitting at the trailing edge.",
    },
    "contribution-calendar-footer-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            streak: { leaf: "text", props: { size: "sm" } },
            intensity: { leaf: "contribution-intensity-legend" },
        },
        why: "if you need the calendar's streak result paired with its intensity legend explaining opposite ends of the same plot.",
    },
    "trending-content-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            item: { composite: "trending-content-row", repeats: true, restingCount: 6 },
        },
        why: "if you need a ranked joined list of content rows separated by full-width rules instead of individual cards.",
    },
    "activity-feed-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            activity: { composite: "activity-row", repeats: true, restingCount: 3 },
        },
        why: "if you need a joined list of activity rows for one day.",
    },
    "suggested-user-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            user: { composite: "suggested-user-row", repeats: true, restingCount: 4 },
        },
        why: "if you need a joined list of comparable suggested identities, each row keeping its profile and follow action together.",
    },
    "explore-main": {
        classes: ["flex", "flex-col", "gap-6", "w-full"],
        children: {
            feed: { contract: "feed-explorer" },
            suggestions: { contract: "suggested-user-list", optional: true },
        },
        why: "if you need a discovery page pairing a feed with optional follow suggestions, each keeping its own request lifetime.",
    },
    "feed-explorer": {
        classes: ["flex", "flex-col", "gap-6", "w-full"],
        children: {
            trending: { contract: "trending-content-list", optional: true },
            stream: { contract: "feed-stream" },
        },
        why: "if you need a discovery region running an optional trending list above a controlled activity stream, each with its own request state.",
    },
    "feed-stream": {
        classes: ["flex", "flex-col", "gap-3", "w-full"],
        children: {
            filters: { contract: "dual-tabs-toolbar" },
            feed: { contract: "activity-feed-result" },
            paginationError: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            pagination: { leaf: "button", optional: true },
        },
        why: "if you need a filter toolbar paired with one governed feed result, plus its own optional pagination or error line below it.",
    },
    "activity-feed-result": {
        classes: ["flex", "flex-col", "gap-2", "w-full"],
        children: {
            day: { contract: "activity-day-group", repeats: true, restingCount: 2, optional: true },
            notice: { contract: "empty-notice-card", optional: true },
        },
        why: "if you need a feed result that settles into day-grouped joined lists or one explicit empty/error state.",
    },
    "activity-day-group": {
        classes: ["flex", "flex-col", "gap-2", "w-full"],
        children: {
            subtitle: { leaf: "text", props: { size: "sm", tone: "muted" } },
            list: { contract: "activity-feed-list" },
        },
        why: "if you need a local-day marker sitting above the joined activity rows it groups.",
    },
    "dual-tabs-toolbar": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            leading: { leaf: "choice-tabs" },
            trailing: { leaf: ["choice-tabs", "select"], optional: true },
        },
        why: "if you need two independent primary-tab axes governing one result set, sharing a toolbar row without invented container chrome.",
    },
    "changelog-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            entry: { composite: "changelog-entry-row", repeats: true, restingCount: 4 },
        },
        why: "if you need a joined list of dated changelog entries separated by full-width rules on one shared surface.",
    },
    "changelog-entry-row": {
        classes: ["flex", "w-full", "flex-col", "gap-3"],
        children: {
            meta: { contract: "date-category-row" },
            title: { leaf: ["text", "text-link"], props: { size: "sm" } },
            body: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if you need one changelog entry read top-down as a date/category line, a title, then an optional muted body explaining it.",
    },
    "date-category-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            date: { leaf: "text", props: { size: "xs", tone: "muted" } },
            category: { leaf: "badge", optional: true },
        },
        why: "if you need a date and an optional category sharing one compact line ahead of a title.",
    },
    "contribution-calendar-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            calendar: { composite: "contribution-calendar" },
        },
        why: "if you need the whole contribution calendar (year choice, grid, legend, streak) bounded inside one card surface.",
    },
    "weekly-goals-card": {
        classes: ["flex", "flex-col", "gap-3", "p-4"],
        children: {
            summary: { leaf: "text", props: { size: "sm", weight: "medium" } },
            goals: { contract: "bordered-goal-grid" },
        },
        why: "if you need a card pairing a week's summary line with a grid of comparable goal measures.",
    },
    "bordered-goal-grid": {
        classes: ["grid", "grid-cols-2", "overflow-hidden", "rounded-3xl", "border", "border-separator", "[&>*]:p-3", "[&>*:nth-child(odd)]:border-r", "[&>*:nth-child(-n+4)]:border-b", "[&>*]:border-separator"],
        children: {
            goal: { composite: "labelled-progress-row", repeats: true, restingCount: 6 },
        },
        why: "if you need a small set of comparable peer measures read across two bordered columns as one grid, not separate cards.",
    },
    "course-progress-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            course: { composite: "course-progress-row", repeats: true, restingCount: 2 },
        },
        why: "if you need a joined list of enrolled-course rows separated by full-width dividers, each row acting as one whole-course press target.",
    },
    "course-progress-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-4", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: "icon-tile" },
            body: { contract: "course-progress-body" },
        },
        why: "if you need one pressable row pairing a course icon mark with its title, progress and legend as a single navigable target.",
    },
    "course-progress-body": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-3"],
        children: {
            heading: { contract: "course-progress-heading" },
            progress: { contract: "segmented-progress-track" },
            legend: { contract: "progress-dimension-legend" },
        },
        why: "if you need a course row heading, progress track and legend stacked together as one compact body.",
    },
    "course-progress-heading": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-2"],
        children: {
            title: { leaf: "text", props: { size: "md", weight: "semibold" } },
            trial: { leaf: "badge", optional: true },
            percent: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a course title leading a line with an optional trial badge and a trailing overall percentage.",
    },
    "segmented-progress-track": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-1"],
        children: {
            segment: { leaf: "progress", repeats: true, restingCount: 3 },
        },
        why: "if you need several distinct completion dimensions shown as adjacent bars under one outcome, without separate cards per dimension.",
    },
    "progress-dimension-legend": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-3"],
        children: {
            dimension: { contract: "status-dot-with-label", repeats: true, restingCount: 3 },
        },
        why: "if you need a wrapping legend of semantic marks and counts explaining the dimensions of a progress track directly above it.",
    },
    "status-dot-with-label": {
        classes: ["flex", "flex-row", "items-center", "gap-2"],
        children: {
            mark: { leaf: "status-dot" },
            label: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a tiny semantic mark attached to a muted label that carries the actual meaning and count.",
    },
    "recommended-course-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: { course: { composite: "recommended-course-row", repeats: true, restingCount: 3 } },
        why: "if you need a joined list of recommended course offers with title, pricing and reason attached to each row.",
    },
    "recommended-course-row": {
        classes: ["flex", "w-full", "flex-row", "items-start", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: { mark: { leaf: "icon-tile" }, body: { contract: "recommended-course-body" } },
        why: "if you need a whole-row course destination led by a mark with its commerce facts in one flexible column.",
    },
    "recommended-course-body": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-1"],
        children: { title: { leaf: "text", props: { size: "md", weight: "semibold" } }, price: { contract: "price-discount-line" }, note: { contract: "price-note-row", optional: true }, reason: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true } },
        why: "if you need a recommended course's title, price, saving and reason stacked in reading order without a description competing for the fold.",
    },
    "price-discount-line": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: { price: { leaf: "text", props: { size: "sm", weight: "semibold" } }, original: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true }, discount: { leaf: "badge", optional: true } },
        why: "if you need one wrapping line where a payable price leads and an optional original price and discount badge qualify it.",
    },
    "upcoming-livestream-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: { session: { composite: "upcoming-livestream-row", repeats: true, restingCount: 3 } },
        why: "if you need a joined, separated list of time-ordered upcoming sessions for a fast scan to the next occurrence.",
    },
    "upcoming-livestream-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: { mark: { leaf: "icon-tile" }, body: { contract: "evidence-title-over-subtitle" }, time: { leaf: "text", props: { size: "xs", tone: "muted" } } },
        why: "if you need one session row with a leading live mark, a flexible title/subtitle middle, and a fixed trailing time.",
    },
    "leaderboard-card": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: { standing: { composite: "leaderboard-standing-row", optional: true }, list: { contract: "ranked-user-list" } },
        why: "if you need one competition surface pairing an optional viewer standing row with the ranked identity list beneath it.",
    },
    "leaderboard-standing-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: { mark: { leaf: "league-tile" }, body: { contract: "evidence-title-over-subtitle" }, fact: { leaf: "badge", optional: true } },
        why: "if you need one row stating a rank mark against its standing sentence, with an optional trailing tier fact.",
    },
    "standing-hero-card": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: { standing: { composite: "leaderboard-standing-row" }, goal: { contract: "standing-goal-meter", optional: true }, action: { leaf: "button" } },
        why: "if you need a standing row paired with an optional goal meter and the single action that closes the gap between them.",
    },
    "standing-goal-meter": {
        classes: ["flex", "flex-col", "gap-2"],
        children: { label: { leaf: "text", props: { size: "xs", tone: "muted" } }, progress: { leaf: "progress" } },
        why: "if you need a labelled progress bar where the distance still to cover is stated in words directly above it.",
    },
    "podium": {
        classes: ["flex", "flex-row", "items-end", "justify-center", "gap-4", "w-full", "[&>*:nth-child(1)]:order-2", "[&>*:nth-child(2)]:order-1", "[&>*:nth-child(3)]:order-3"],
        children: { place: { composite: "podium-place", repeats: true, restingCount: 3 } },
        why: "if you need the top three finishers raised and centred in dais order rather than read as an ordinary ranked list.",
    },
    "podium-place": {
        classes: ["flex", "flex-col", "items-center", "gap-2"],
        children: { mark: { leaf: "rank-mark", props: { placement: "row" } }, avatar: { leaf: "avatar" }, name: { leaf: "text" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, step: { leaf: "podium-step" } },
        why: "if you need one finisher read top-down as medal, face, name, score, then the step height that fixes their place.",
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
        why: "if you need a leaderboard page column reading who/where, which competition scope, then that competition's board.",
    },
    "scope-switch-row": {
        // A row, so the switch takes the width of its two words. In the page column it was a
        // direct child of a `flex-col`, which stretches its children - and a segmented control
        // spanning the whole measure reads as a band the page is divided by rather than as one
        // control the reader can press.
        classes: ["flex", "flex-row"],
        children: { tabs: { leaf: "choice-tabs" } },
        why: "if you need a segmented switch sized to its own choice rather than stretched into a page-dividing band.",
    },
    "page-header-stack": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            trail: { leaf: "breadcrumbs", optional: true },
            title: { leaf: "heading" },
        },
        why: "if you need a page header stacking an optional breadcrumb trail above the title at its own smaller scale.",
    },
    "league-board-stack": {
        classes: ["flex", "flex-col", "gap-6"],
        children: {
            hero: { contract: "standing-hero-card" },
            podium: { contract: "podium", optional: true },
            list: { contract: "ranked-user-followable-list" },
        },
        why: "if you need a league board ordered as the viewer's own standing, the unrankable top three, then the full ranked list.",
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
        why: "if you need a ranked list that reserves the same follow-action column on every row whether or not that row carries a button.",
    },
    "ranked-user-ellipsis-row": {
        classes: ["flex", "flex-row", "items-center", "justify-center", "gap-2", "py-2"],
        children: { label: { leaf: "text", props: { size: "xs", tone: "muted" } } },
        why: "if you need a centred label announcing a skipped gap between two non-adjacent rows in a ranked list.",
    },
    "ranked-user-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4", "[&>*:first-child]:rounded-t-3xl", "[&>*:last-child]:rounded-b-3xl"],
        children: { user: { composite: "ranked-user-row", repeats: true, restingCount: 5 } },
        why: "if you need a ranked list of comparable identities with no reserved per-row action column.",
    },
    "ranked-user-row": {
        classes: ["grid", "w-full", "grid-cols-[auto_auto_1fr_5rem_2.5rem]", "items-center", "gap-3", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(4)]:text-right"],
        children: { rank: { leaf: "rank-mark", props: { placement: "row" } }, avatar: { leaf: "avatar" }, identity: { contract: "ranked-user-name-over-subtitle" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, movement: { leaf: ["rank-delta-caret", "badge", "text"] }, follow: { leaf: "button", optional: true } },
        why: "if you need one grid row showing rank, avatar, identity, points and a movement-or-follow outcome for a leaderboard.",
    },
    "ranked-user-row-success-verdict": {
        classes: ["grid", "w-full", "grid-cols-[auto_auto_1fr_5rem_2.5rem]", "items-center", "gap-3", "pl-4", "inset-shadow-[2px_0_0_0_var(--success)]", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(4)]:text-right"],
        children: { rank: { leaf: "rank-mark", props: { placement: "row" } }, avatar: { leaf: "avatar" }, identity: { contract: "ranked-user-name-over-subtitle" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, movement: { leaf: ["rank-delta-caret", "badge", "text"] }, follow: { leaf: "button", optional: true } },
        why: "if you need the same ranked row with a left-edge success band marking this learner's positive movement.",
    },
    "ranked-user-row-danger-verdict": {
        classes: ["grid", "w-full", "grid-cols-[auto_auto_1fr_5rem_2.5rem]", "items-center", "gap-3", "pl-4", "inset-shadow-[2px_0_0_0_var(--danger)]", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(4)]:text-right"],
        children: { rank: { leaf: "rank-mark", props: { placement: "row" } }, avatar: { leaf: "avatar" }, identity: { contract: "ranked-user-name-over-subtitle" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, movement: { leaf: ["rank-delta-caret", "badge", "text"] }, follow: { leaf: "button", optional: true } },
        why: "if you need the same ranked row with a left-edge danger band marking this learner's negative movement.",
    },
    "ranked-user-name-over-subtitle": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: { name: { leaf: ["text", "text-link"] }, subtitle: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true } },
        why: "if you need a learner name with an optional movement or viewer qualifier stacked directly beneath it.",
    },
    "streak-summary-card": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            summary: { contract: "streak-week-with-outcome" },
            nudge: { contract: "streak-daily-nudge", optional: true },
        },
        why: "if you need the week run paired with its outcome and an optional nudge to act today, bounded as one streak card.",
    },
    "streak-week-with-outcome": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4"],
        children: {
            week: { composite: "streak-week-run" },
            outcome: { contract: ["streak-empty-prompt", "streak-active-summary"] },
        },
        why: "if you need the week's seven day marks paired with the outcome that explains them (an empty prompt or the active streak summary).",
    },
    "streak-week-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            day: { leaf: "day-cell", repeats: true, restingCount: 7 },
        },
        why: "if you need seven day cells rendered as one fixed-count week run instead of each caller rebuilding the row.",
    },
    "streak-empty-prompt": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-center", "gap-4"],
        children: {
            message: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "button", props: { size: "sm", variant: "primary" } },
        },
        why: "if you need a centred message paired with the one action that resolves an inactive-streak state.",
    },
    "streak-active-summary": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            current: { leaf: "text", props: { size: "sm", weight: "medium" } },
            record: { leaf: "badge" },
        },
        why: "if you need a compact current-streak reading paired with its record badge on one line.",
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
        why: "if you need an icon-led row where a name takes the flexible width and a trailing fact stays fixed at the end.",
    },
    "glyph-peer-fact-row": {
        classes: ["flex", "flex-row", "items-center", "justify-between", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            glyph: { leaf: "icon", props: { size: "sm" } },
            title: { leaf: "text", props: { size: "sm", tone: "default" } },
            fact: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if you need an icon-led standing fact and its current value read at the same rank, spaced to opposite ends.",
    },
    "glyph-compact-action-fact-row": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "items-center", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            glyph: { leaf: "icon", props: { size: "sm" } },
            title: { leaf: "text", props: { size: "sm", tone: "default" } },
            fact: { leaf: ["badge", "text"], optional: true },
        },
        why: "if you need a compact icon-label row for an action or selection with an optional trailing fact subordinate to it.",
    },
    "task-mark-title-fact-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: "icon" },
            title: { leaf: "text", props: { size: "sm" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a joined-list row pairing a completion mark and title with a quiet fact fixed at the trailing edge.",
    },
    "label-fact-over-progress": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            line: { contract: "label-with-muted-fact-row" },
            progress: { leaf: "progress" },
        },
        why: "if you need a label-and-fact row placed directly above the progress bar it explains.",
    },
    "label-with-muted-fact-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a semibold label paired with a smaller muted fact sharing one baseline.",
    },
    "resume-card-grid": {
        classes: ["grid", "grid-cols-1", "gap-4", "sm:grid-cols-2", "lg:grid-cols-3"],
        children: {
            card: { contract: "resume-item-card", repeats: true, restingCount: 3 },
        },
        why: "if you need resumable items laid out one, two or three per row across breakpoints without shrinking their copy.",
    },
    "label-field-hint": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            label: { leaf: "label" },
            field: { leaf: ["input", "field"] },
            hint: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if you need a form control's optional hint placed beneath the control it explains rather than beside its label.",
    },
    "double-navbar": {
        classes: ["sticky", "top-0", "z-50", "w-full", "border-b", "border-separator", "bg-background"],
        children: {
            primary: { contract: "brand-links-then-tools-bar" },
            bottom: { contract: "underlined-tab-strip", optional: true },
        },
        why: "if you need a sticky navbar with an optional second tab-strip layer, both moving and bordered as one landmark.",
    },
    "brand-links-then-tools-bar": {
        classes: ["flex", "h-16", "min-h-16", "w-full", "flex-row", "items-center", "justify-between", "gap-3", "px-3"],
        children: {
            navigation: { contract: "inline-nav-links" },
            tools: { contract: "inline-tool-row" },
        },
        why: "if you need a navbar row with navigation reading left and tools reading right, wrapping rather than overflowing on narrow screens.",
    },
    "inline-nav-links": {
        classes: ["flex", "flex-row", "items-center", "gap-6"],
        children: {
            brand: { leaf: "link", props: { emphasis: "brand" } },
            routes: { contract: "inline-route-links" },
        },
        why: "if you need the brand mark paired with its destination route group at the navbar's legacy seam.",
    },
    "inline-route-links": {
        classes: ["hidden", "flex-1", "items-center", "justify-center", "gap-2", "md:flex"],
        children: {
            route: { leaf: "nav-link", props: { kind: "route" }, repeats: true, restingCount: 0 },
        },
        why: "if you need desktop route pills centred at the legacy seam that disappear together below the nav breakpoint.",
    },
    "inline-tool-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2"],
        children: {
            desktop: { contract: "desktop-navbar-tools" },
            tool: { leaf: ["icon-button", "account-menu"], repeats: true, restingCount: 3 },
        },
        why: "if you need desktop field controls and round action buttons sharing one centred row on the navbar's axis.",
    },
    "desktop-navbar-tools": {
        classes: ["hidden", "items-center", "gap-2", "md:flex"],
        children: {
            search: { leaf: "pressable-input-like" },
            locale: { leaf: "language-menu" },
            theme: { leaf: "theme-switch" },
        },
        why: "if you need the desktop-only search, language and theme control subgroup on one centred axis.",
    },
    "underlined-tab-strip": {
        classes: ["w-full"],
        children: {
            tabs: { leaf: "extended-tabs" },
        },
        why: "if you need the typed tab primitive with its own inset and indicator so no caller can redraw one tab differently from its peers.",
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
        why: "if you need a narrow centred column read one control at a time, headed by a title pair with an optional footer prompt.",
    },
    "auth-entry-stack": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            shortcuts: { contract: "auth-shortcuts-over-divider" },
            credentials: { leaf: "form" },
        },
        why: "if you need the two entry blocks of authentication - OAuth shortcuts closed by a divider, then the credential form - in one stack.",
    },
    "centred-title-pair": {
        classes: ["flex", "flex-col", "gap-3", "items-center", "text-center"],
        children: {
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm" } },
        },
        why: "if you need a centred heading paired with a supporting description line directly beneath it.",
    },
    "auth-shortcuts-over-divider": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            shortcut: { leaf: "button", repeats: true, restingCount: 2 },
            divider: { leaf: "divider" },
        },
        why: "if you need a cluster of OAuth shortcut buttons closed by an OR divider before a credential form begins.",
    },
    "stacked-peer-controls": {
        classes: ["flex", "flex-col", "gap-4", "[&>*]:w-full"],
        children: {
            control: {
                contract: "spread-choice-row",
                leaf: ["button", "confirm-button", "quick-actions-list", "text"],
                composite: ["field", "labelled-progress-row", "icon-label-fact-row"],
                repeats: true,
                restingCount: 3,
            },
        },
        why: "if you need a column of independently readable field or action controls sharing one width without stronger row structure.",
    },
    "stacked-stat-rows": {
        classes: ["flex", "flex-col", "p-0", "[&>*]:w-full", "[&>*]:p-2"],
        children: {
            stat: { composite: "icon-label-fact-row", repeats: true, restingCount: 3 },
        },
        why: "if you need a zero-inset column of icon/label/fact rows that scans like peer select rows rather than a bordered list.",
    },
    "profile-over-stat-rows": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            profile: { composite: "profile-row" },
            stats: { contract: "stacked-stat-rows" },
        },
        why: "if you need a person's identity row stacked above their standing figures as two distinct groups, not one continuous list.",
    },
    "profile-avatar-name-handle-disclosure-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "justify-between", "gap-3", "px-2", "py-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "profile-name-over-handle" },
            disclosure: { leaf: "icon", optional: true },
        },
        why: "if you need a pressable profile row with an avatar, a name-over-handle identity stack taking the available width, and an optional trailing disclosure icon.",
    },
    "profile-name-over-handle": {
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            name: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            handle: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "if you need a compact display name stacked directly over its muted handle, without a role line.",
    },
    "spread-choice-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            choice: { leaf: ["checkbox", "text-link"] },
            exit: { leaf: "text-link", props: { size: "sm" }, optional: true },
        },
        why: "if you need a choice and a separate way out of it pushed to opposite ends of one line as peers, not a label and its target.",
    },
    "centred-prompt-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-center", "gap-2"],
        children: {
            prompt: { leaf: "text", props: { size: "sm", tone: "muted" } },
            action: { leaf: "text-link", props: { size: "sm" } },
        },
        why: "if you need a centred question-and-answer pair sharing one line rather than splitting across two.",
    },
    "centred-empty-notice": {
        classes: ["flex", "flex-col", "items-center", "gap-3", "p-4", "text-center"],
        children: {
            notice: { composite: "empty-notice" },
        },
        why: "if you need a centred empty-state notice with its recovery action already attached to it.",
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
        why: "if you need the reading region and its footer stacked flush with no gap between them, as one continuous read.",
    },
    "content-reading-paper": {
        classes: ["mx-auto", "flex", "w-full", "min-w-0", "max-w-app-md", "flex-col", "gap-4", "p-4"],
        children: {
            hint: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            article: { leaf: "article" },
            paywall: { composite: "empty-notice", optional: true },
        },
        why: "if you need the article rendered on its own raised page, with an inline paywall notice replacing the hidden portion rather than the page itself.",
    },
    "content-reader-footer": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-6"],
        children: {
            reactions: { contract: "content-reaction-card", optional: true },
            discussion: { contract: "content-discussion-panel", optional: true },
            next: { contract: "next-action-list", optional: true },
            pager: { leaf: "pagination", optional: true },
        },
        why: "if you need the run of block-level surfaces that follow a reading — reactions, discussion, next steps, pager — each optional and absent together on locked content.",
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
        why: "if you need a discussion section: heading, one composer-and-submit pair, and the settled comment list beneath it, all at reading width.",
    },
    "content-discussion-list": {
        host: "ul",
        classes: ["flex", "w-full", "flex-col", "divide-y", "divide-separator"],
        children: {
            comment: { contract: "content-discussion-comment-row", repeats: true, restingCount: 3 },
        },
        why: "if you need an ordered list of top-level comments separated by a stable divider.",
    },
    "content-discussion-comment-row": {
        host: "li",
        classes: ["flex", "w-full", "min-w-0", "flex-col", "gap-2", "py-3"],
        children: {
            author: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            meta: { leaf: "text", props: { size: "xs", tone: "muted" } },
            body: { leaf: "text", props: { size: "sm" } },
        },
        why: "if you need one comment row read as author, then time/reply meta, then body, in that fixed order.",
    },
    "content-reaction-card": {
        classes: ["mx-auto", "flex", "w-full", "max-w-app-md", "flex-row", "items-center", "gap-3", "p-4", "[&>*:first-child]:grow"],
        children: {
            prompt: { leaf: "text", props: { size: "sm", tone: "muted" } },
            reactions: { leaf: "reaction-picker" },
        },
        why: "if you need the reaction prompt and picker standing on their own surface, separate from the article rather than reading as its last line.",
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
            "flex", "h-app-rail", "w-full", "min-w-0", "flex-col", "items-stretch", "overflow-hidden",
            "md:flex-row",
            "md:[&>[data-node=learn-route-context-rail]]:w-80",
            "md:[&>[data-node=learn-route-context-rail]]:shrink-0",
            "md:[&>[data-node=learn-content-page]]:min-w-0",
            "md:[&>[data-node=learn-content-page]]:grow",
            "md:[&>[data-node=content-outline-rail]]:w-64",
            "md:[&>[data-node=content-outline-rail]]:shrink-0",
        ],
        children: {
            contents: { contract: "learn-route-context-rail" },
            divider: { leaf: "rail-divider" },
            main: { contract: "learn-content-page" },
            outline: { contract: "content-outline-rail", optional: true },
        },
        why: "if you need the course map, reading document and on-page outline aligned to one clipped viewport while their dedicated ScrollViewport branches move independently.",
    },
    "content-map-panel": {
        host: "nav",
        classes: ["flex", "w-full", "min-w-0", "min-h-0", "flex-col", "gap-4", "px-3", "py-6"],
        children: {
            progress: { composite: "labelled-progress-row" },
            search: { leaf: "search-box" },
            modules: { contract: "content-map-module-list" },
        },
        why: "if you need course progress and search pinned above the independently scrolling module tree with the rail's required horizontal and vertical page inset.",
    },
    "content-map-module-list": {
        classes: ["flex", "w-full", "min-w-0", "min-h-0", "flex-1", "flex-col", "divide-y", "divide-separator", "overflow-y-auto", "overscroll-contain", "scroll-shadow", "scroll-shadow--vertical", "scroll-shadow--hide-scrollbar"],
        children: {
            module: { contract: "content-map-module", repeats: true, restingCount: 4 },
        },
        why: "if you need a long module tree to scroll without moving the controls above it while full-width separators keep peer modules visually distinct.",
    },
    "content-map-module-summary": {
        classes: ["flex", "w-full", "min-w-0", "flex-row", "items-center", "gap-3", "px-3", "py-2", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow", "[&>*:last-child]:shrink-0"],
        children: {
            copy: { contract: "content-map-module-summary-copy" },
            caret: { leaf: "disclosure-indicator" },
        },
        why: "if you need one module's title and state summary to yield before its fixed disclosure indicator.",
    },
    "content-map-module-summary-copy": {
        classes: ["flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-2", "text-left"],
        children: {
            title: { leaf: "text", props: { size: "md", weight: "medium" } },
            fact: { leaf: ["text", "badge"], optional: true },
            progress: { leaf: "progress", optional: true },
        },
        why: "if you need an expanded module to replace its compact completion fact with a full-width progress bar under the same title.",
    },
    "content-map-module": {
        classes: ["w-full", "min-w-0"],
        children: {
            summary: { contract: "content-map-module-summary" },
            body: { contract: "content-map-module-body" },
        },
        why: "if you need one module disclosure to keep its typed summary and selectable lesson body under one vendor-owned interaction.",
    },
    "content-map-module-body": {
        classes: ["w-full", "min-w-0"],
        children: {
            list: { leaf: "selection-list", props: { variant: "outline" } },
        },
        why: "if you need one module's lesson destinations exposed as a single HeroUI selection list inside its disclosure panel.",
    },
    "content-outline-rail": {
        host: "nav",
        classes: ["flex", "h-full", "w-full", "min-w-0", "min-h-0", "flex-col", "gap-2", "overflow-y-auto", "overscroll-contain", "scrollbar", "p-4"],
        children: {
            label: { leaf: "text", props: { size: "sm", tone: "muted" } },
            heading: { leaf: "nav-link", props: { kind: "section" }, repeats: true, restingCount: 5 },
        },
        why: "if you need a labelled on-page outline to own its full-height ScrollViewport and move independently from the reading document.",
    },

    "learn-content-page": {
        // The reader IS this screen, so it opens the document's one main landmark itself rather
        // than being posted inside somebody else's - which is what let a review harness draw a
        // second one, and what a rule caught before any of it was seen.
        host: "main",
        classes: ["flex", "h-full", "w-full", "min-w-0", "min-h-0", "flex-col", "overflow-hidden"],
        children: {
            viewport: { contract: "content-reader-main-scroll-viewport" },
        },
        why: "if you need the routed page to retain the document's main landmark while its nested ScrollViewport owns vertical movement.",
    },
    "course-content-identity-stack": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            trail: { leaf: "breadcrumbs", optional: true },
            title: { leaf: "heading" },
            description: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            meta: { contract: "status-metadata-line", optional: true },
        },
        why: "if one course-content identity reads as a compact ordered run from orientation through title and description to optional metadata.",
    },
    "content-reader-main-scroll-viewport": {
        classes: ["h-full", "w-full", "min-w-0", "min-h-0", "overflow-y-auto", "overscroll-contain", "scrollbar"],
        children: {
            inner: { contract: "content-reader-inner" },
        },
        why: "if you need the reading document body to move inside the page-owned main landmark without moving either navigation rail.",
    },
    "content-reader-inner": {
        classes: ["flex", "w-full", "max-w-app-md", "flex-col", "gap-6", "p-6"],
        children: {
            identity: { contract: "course-content-identity-stack" },
            faces: { contract: "dual-tabs-toolbar", optional: true },
            body: { contract: ["content-reading-column", "centred-empty-notice", "source-workspace-root"] },
        },
        why: "if you need one centered learning content measure whose body swaps between reading, source workspace, lock notice or failure notice.",
    },
    /*
    /*
     * `next-action-list` and `next-action-row` began in the content reader and now serve every
     * ranked next-destination surface, including the course dashboard.
     *
     * Legacy draws an up-next card and a related-content list beneath the content. Both answer one
     * question - where does the reader go from here - so they are one joined list of destinations
     * rather than two surfaces. The row carries no completion mark: a tick would promise something
     * to finish, and these are places to open.
     */
    "next-action-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            step: { contract: "next-action-row", repeats: true, restingCount: 3 },
        },
        why: "if you need a joined list of where-to-go-next destinations sharing one surface with a full-width divider between each.",
    },
    "next-action-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-3", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow"],
        children: {
            label: { leaf: "text", props: { size: "md" } },
            kind: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            action: { leaf: "see-more-link", optional: true },
            disclosure: { leaf: "icon", optional: true },
        },
        why: "if you need one prioritized next destination pairing its title and optional kind with one onward action or disclosure.",
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
        why: "if you need one course-catalog toolbar governing both result groups as their peer, with every route region sharing one seam.",
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
        why: "if you need course Q&A ordered as search and an inline question composer before a selected question-or-reply thread or its empty and failed states.",
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
        why: "if you need a course headhunting directory ordered from course identity through one company query into the company and consultant runs it filters, including empty and failed outcomes.",
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
        why: "if you need one headhunting company profile ordered as back and contact actions, description and consultant contacts, with not-found and failed outcomes retaining the route identity.",
    },
    "catalog-search-count-view-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4"],
        children: {
            search: { contract: "catalog-query-with-count" },
            view: { leaf: "choice-tabs" },
        },
        why: "if you need a toolbar row pairing the search-and-count control with a grid/list view toggle at the opposite end.",
    },
    "catalog-query-with-count": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "[&>*:last-child]:shrink-0"],
        children: {
            query: { leaf: "search-box" },
            count: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if you need a non-wrapping search field with its result count parked beside it rather than beneath it.",
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
        why: "if you need one titled group of courses that can render as either a grid or a list without changing what the group is saying.",
    },
    "catalog-card-grid": {
        classes: ["grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "gap-2"],
        children: {
            course: { contract: "catalog-card", repeats: true, restingCount: 3 },
        },
        why: "if you need a responsive grid of purchasable course cards for direct side-by-side comparison.",
    },
    "catalog-card-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            course: { contract: "catalog-card-line", repeats: true, restingCount: 3 },
        },
        why: "if you need a scannable joined list of purchasable courses, one row per course, separated by a full-width divider.",
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
        why: "if you need one catalog course read as a row: cover, name-and-price body, then the buy/open actions.",
    },
    "catalog-card-line-body": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-1"],
        children: {
            heading: { contract: "title-with-baseline-fact" },
            price: { contract: "catalog-price-group" },
        },
        why: "if you need a row's course name and price sitting at the tightest seam with nothing between them.",
    },
    "catalog-card": {
        classes: ["flex", "grow", "flex-col", "gap-4", "p-4"],
        children: {
            cover: { leaf: "cover-image" },
            body: { contract: "catalog-card-body" },
            action: { contract: "catalog-card-action-row" },
        },
        why: "if you need one purchasable course as a self-contained filled card: artwork, pricing facts, and the two ways in, sized to match its row.",
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
        why: "if you need a price argument that reads downward - what it is, its breakdown, why it is lower, what changes if the reader waits - inside a shell that supplies no padding of its own.",
    },
    "price-note-row": {
        classes: ["flex", "flex-row", "flex-nowrap", "items-center", "gap-2", "[&>*]:whitespace-nowrap"],
        children: {
            fact: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            action: { leaf: "text-link", props: { size: "xs" } },
        },
        why: "if you need a caption-scale line pairing a muted savings fact with the link that explains how it was reached.",
    },
    "catalog-card-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "[&>*]:w-full"],
        children: {
            cart: { leaf: "button" },
            open: { leaf: "button" },
        },
        why: "if you need the buy-now and read-more actions on one equal-width line at the foot of a course offer.",
    },
    "catalog-card-body": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-4"],
        children: {
            heading: { contract: "catalog-card-heading-row" },
            price: { contract: "catalog-price-group" },
            promises: { contract: "marked-row-list" },
        },
        why: "if you need a course card's body read top to bottom: what it is, what it costs, what it promises.",
    },
    "catalog-price-group": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            price: { contract: "price-discount-line" },
            note: { contract: "price-note-row", optional: true },
        },
        why: "if you need a course's price paired with its savings note at a closer seam than the surrounding parts.",
    },
    "catalog-card-heading-row": {
        classes: ["flex", "flex-row", "items-baseline", "justify-between", "gap-2", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow",
        ],
        children: {
            title: { leaf: "heading" },
            count: { leaf: "text", props: { size: "xs" } },
        },
        why: "if you need a course name paired with its trailing enrolment count on one line.",
    },
    "course-detail-page": {
        classes: ["flex", "min-w-0", "flex-col", "gap-4"],
        children: {
            navigation: { contract: "course-section-navigation" },
            body: { contract: "main-then-rail" },
            action: { contract: "course-mobile-action-bar", optional: true },
        },
        why: "if you need a course-detail page beginning at the navbar seam with peer section navigation while its body owns the readable measure and its pinned phone action reaches both viewport edges.",
    },
    "course-section-navigation": {
        host: "nav",
        classes: ["sticky", "top-16", "z-50", "-mt-px", "flex", "w-full", "border-b", "border-separator", "bg-background", "px-6"],
        children: { tabs: { leaf: "choice-tabs" } },
        why: "if you need one sticky full-width nav landmark holding the tabs that move within a single course document.",
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
        why: "if you need a flexible narrative column beside a fixed trailing rail that follows the reader down a long page.",
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
        why: "if you need a course's breadcrumb trail, identity heading, proof board and joined content sections combined under one section landmark.",
    },
    "course-hero-heading": {
        classes: ["flex", "min-w-0", "flex-col"],
        children: {
            identity: { contract: "course-hero-title-stack" },
        },
        why: "if you need a wrapper that gives a course's identity stack the full readable measure with no other sibling fact beside it.",
    },
    "course-hero-title-stack": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-2"],
        children: {
            title: { leaf: "heading" },
            tagline: { leaf: "text", props: { size: "sm" } },
        },
        why: "if you need a course name paired with its one-line qualifying tagline, sized to wrap before it squeezes a neighbor.",
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
        why: "if you need a bordered ruled grid holding several comparable course-fact cards inside one shared card surface, with no cell owning its own border or radius.",
    },
    "course-signal-card-neutral": {
        classes: ["flex", "min-w-0", "flex-col", "gap-2"],
        children: { label: { leaf: "text", props: { size: "xs", tone: "muted" } }, value: { leaf: "text", props: { size: "sm", weight: "medium" } } },
        why: "if you need one neutral labelled fact sitting inside a shared signal board, where no single fact outranks its neighbors with color.",
    },
    "course-section": {
        host: "section",
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            title: { leaf: "heading" },
            body: { contract: "course-review-block" },
        },
        why: "if you need a labelled section that wraps the learner-review block specifically, when no SurfaceListCard already owns that label.",
    },
    "course-faq-list": {
        host: "ul",
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0", "[&>*]:px-4", "[&>*]:py-3"],
        children: {
            faq: { contract: "course-faq-row", repeats: true, restingCount: 3 },
        },
        why: "if you need an unordered joined list of a course's question-and-answer rows, dividers only, no repeated card chrome.",
    },
    "course-faq-row": {
        host: "li",
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            question: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            answer: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if you need one question paired with its answer as a single bounded row inside a course FAQ list.",
    },
    "course-prerequisite-list": {
        host: "ol",
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0", "[&>*]:px-4", "[&>*]:py-3"],
        children: {
            prerequisite: { contract: "course-prerequisite-row", repeats: true, restingCount: 3 },
        },
        why: "if you need an ordered list of a course's prerequisites where the reader must satisfy them in sequence.",
    },
    "course-prerequisite-row": {
        host: "li",
        classes: ["flex", "flex-row", "items-start", "gap-3", "[&>*:last-child]:min-w-0", "[&>*:last-child]:grow"],
        children: {
            mark: { leaf: "text", props: { size: "sm", tone: "muted" } },
            requirement: { leaf: "text", props: { size: "sm" } },
        },
        why: "if you need one ordered prerequisite item with a muted (unverified) marker beside its requirement text.",
    },
    "course-review-block": {
        host: "section",
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            summary: { contract: "course-review-summary" },
            list: { contract: "course-review-list" },
        },
        why: "if you need the rating summary and the review list composed as one region, separable so a reader can stop at the summary alone.",
    },
    "course-review-summary": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-3"],
        children: {
            score: { leaf: "heading" },
            scale: { leaf: "rating-stars" },
            count: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if you need the aggregate score, the scale it is measured on, and the review count on one shared baseline.",
    },
    "course-review-list": {
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0"],
        children: {
            review: { contract: "course-review-row", repeats: true, restingCount: 3 },
        },
        why: "if you need a divided joined list of individual course reviews without giving each one its own card elevation.",
    },
    "course-review-row": {
        host: "section",
        classes: ["flex", "min-w-0", "flex-col", "gap-2", "p-4"],
        children: {
            author: { contract: "course-review-author-line" },
            body: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "if you need one bounded review row pairing an author line with an optional written comment.",
    },
    "course-review-author-line": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            name: { leaf: "text", props: { size: "sm", weight: "medium" } },
            score: { leaf: "rating-stars" },
        },
        why: "if you need a reviewer's name paired with the score that specific person gave, as one compact cluster.",
    },
    "course-module-list": {
        host: "ol",
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0", "[&>*]:px-4", "[&>*]:py-3"],
        children: {
            module: { contract: "course-module-row", repeats: true, restingCount: 5 },
        },
        why: "if you need an ordered list of a course's curriculum modules where sequence must be readable without numbering.",
    },
    "course-module-row": {
        host: "li",
        classes: ["flex", "min-w-0", "flex-col"],
        children: {
            module: { composite: "curriculum-module-row" },
        },
        why: "if you need one ordered module item that itself opens into a lesson disclosure without breaking the list's valid ol structure.",
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
            ladder: { composite: "pricing-phase-disclosure", optional: true },
            proof: { leaf: "text", props: { size: "xs" }, optional: true },
        },
        why: "if you need the full course purchase-decision surface: artwork and price stay visible while exactly one purchase-or-exploration choice is offered and phase comparison stays disclosed on request.",
    },
    "pricing-rail-scroll-viewport": {
        classes: ["min-h-0", "overflow-y-auto", "overscroll-contain", "scrollbar"],
        children: {
            body: { contract: "course-pricing-rail" },
        },
        why: "if you need a bounded scrollable body for the pricing rail's decision content when it exceeds the available height, with a themed scrollbar marking the content as the part that moves.",
    },
    "course-pricing-purchase-intent": {
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            copy: { contract: "course-pricing-purchase-copy", optional: true },
            actions: { contract: "course-pricing-purchase-actions" },
        },
        why: "if you need the purchase copy grouped with its ownership actions as one sibling block inside the pricing rail.",
    },
    "course-pricing-purchase-copy": {
        classes: ["flex", "flex-col", "gap-2", "[&>*]:w-full"],
        children: {
            heading: { leaf: "text", props: { size: "sm", weight: "medium" }, optional: true },
            description: { leaf: "text", props: { size: "sm" }, optional: true },
        },
        why: "if you need an optional purchase heading and its explanatory sentence kept as one compact copy block.",
    },
    "course-pricing-purchase-actions": {
        classes: ["flex", "flex-col", "gap-2", "[&>*]:w-full"],
        children: {
            primary: { leaf: "button" },
            cart: { leaf: "button", optional: true },
        },
        why: "if you need the enrol action paired with an optional cart action as one ownership-decision block, primary action leading.",
    },
    "course-pricing-exploration-intent": {
        classes: ["flex", "flex-col", "gap-2", "[&>*]:w-full"],
        children: {
            heading: { leaf: "text", props: { size: "sm", weight: "medium" } },
            description: { leaf: "text", props: { size: "sm" }, optional: true },
            action: { leaf: "button" },
        },
        why: "if you need a trial offer's own heading, explanation and single action kept apart from the purchase decision beside it.",
    },
    "course-price-primary-group": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            line: { contract: "price-discount-line" },
            note: { contract: "price-note-row", optional: true },
        },
        why: "if you need the payable price and the line explaining its saving held as one compact thought before any scarcity signal.",
    },
    "course-price-block": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            primary: { contract: "course-price-primary-group" },
            scarcity: { leaf: "badge", optional: true },
        },
        why: "if you need the price-and-saving group together with an optional scarcity badge set one spacing step apart.",
    },
    "cart-line-list": {
        classes: [
            "overflow-hidden", "divide-y", "divide-separator", "p-0",
            "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4",
        ],
        children: {
            line: { contract: "cart-line-row", repeats: true, restingCount: 3 },
        },
        why: "if you need a joined list of basket lines separated by single rules so one line can still be found and removed.",
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
        why: "if you need a basket line showing a course's cover, identity and price with a single trailing removal control.",
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
        why: "if you need a checkout cost breakdown that resolves into a ruled-off total rather than reading as peer figures.",
    },
    "order-total-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            amount: { leaf: "text", props: { size: "md", weight: "semibold" } },
        },
        why: "if you need the loudest figure in a cost column set apart in rank from the muted subtotal rows above it.",
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
        why: "if you need a single payment step reading top-down through choice, cost, schedule, terms and the press, with its own inset.",
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
        why: "if you need a cart page using the catalog measure and inset, with its lines, total, instalment hint and actions absent together when the basket is empty.",
    },
    "cart-drawer-column": {
        classes: ["flex", "flex-col", "gap-4", "p-4"],
        children: {
            lines: { contract: "cart-line-list", optional: true },
            summary: { contract: "order-summary-stack", optional: true },
            actions: { contract: "stacked-peer-controls", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need the basket's lines, total and actions at drawer width without a title the drawer chrome already shows.",
    },
    "ordered-step-ladder": {
        host: "ol",
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            step: { contract: "ordered-step-row", repeats: true, restingCount: 3 },
        },
        why: "if you need an ordered list of steps where sequence itself is the meaning, such as a price or instalment ladder.",
    },
    "ordered-step-row": {
        host: "li",
        classes: ["flex", "flex-row", "items-center", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: ["status-dot", "text"] },
            name: { leaf: "text", props: { size: "sm" } },
            value: { leaf: "text", props: { size: "xs" } },
        },
        why: "if you need one ladder step stating its name and value on a baseline, with a mark slot that only lights for the current step.",
    },
    "course-mobile-action-bar": {
        classes: ["sticky", "bottom-0", "z-40", "flex", "flex-row", "items-center", "justify-between", "gap-3", "border-t", "border-separator", "bg-background", "px-4", "py-3", "md:hidden"],
        children: {
            price: { contract: "price-discount-line" },
            action: { leaf: "button" },
        },
        why: "if you need a bottom-pinned price and single purchase action for viewports too narrow to hold the pricing rail.",
    },
    "coding-practice-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            resume: { contract: "resume-item-card", optional: true },
            domains: { contract: "domain-mastery-grid" },
            standing: { contract: "leaderboard-card", optional: true },
        },
        why: "if you need a coding-practice page ordered as an optional resumable item, domain choices and a trailing ranking so continuing precedes choosing.",
    },
    "domain-mastery-grid": {
        classes: ["grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "gap-4"],
        children: {
            domain: { contract: "domain-mastery-card", repeats: true, restingCount: 6 },
        },
        why: "if you need a scannable two-axis grid of topic mastery cards rather than a single top-to-bottom column.",
    },
    "domain-mastery-card": {
        classes: ["flex", "grow", "flex-col", "items-start", "gap-2", "p-4"],
        children: {
            name: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            count: { leaf: "text", props: { size: "xs", tone: "muted" } },
            meter: { leaf: "progress" },
        },
        why: "if you need one topic card stating its name, a count, and the same completion fact repeated as a progress bar.",
    },
    "coding-domain-page": {
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6"],
        children: {
            header: { contract: "page-header-stack" },
            standing: { contract: "label-fact-over-progress", optional: true },
            problems: { contract: "marked-row-list", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need one coding topic page opening with its progress before the problem run that advances it.",
    },
    "coding-problem-page": {
        classes: ["flex", "w-full", "min-h-screen", "flex-col", "md:flex-row"],
        children: {
            reading: { contract: "problem-reading-column" },
            work: { contract: "problem-work-column" },
        },
        why: "if you need a coding problem's reading and writing regions side by side on desktop and stacked below the breakpoint.",
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
        why: "if you need a coding problem's statement tabs and body held at a fixed reading width that refuses to shrink.",
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
        why: "if you need a problem statement's difficulty-qualified heading, authored body and scan-time tags stacked in one column.",
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
        why: "if you need a judge verdict pinned above an editor that grows to fill whatever height remains.",
    },
    "judge-status-strip": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "w-full", "border-b", "border-separator", "px-4", "py-3", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(3)]:grow"],
        children: {
            mark: { leaf: "status-dot" },
            verdict: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            detail: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: "button", optional: true },
        },
        why: "if you need one fixed strip above a code editor that shows a judging verdict and detail from before the first run onward.",
    },
    "editor-over-console": {
        classes: ["flex", "min-w-0", "grow", "flex-col"],
        children: {
            toolbar: { contract: "editor-toolbar-row" },
            editor: { leaf: "code-editor" },
            console: { contract: "judge-console", optional: true },
        },
        why: "if you need a growing code editor stacked with its own toolbar above and an optional results tray below.",
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
        why: "if you need a toolbar splitting a language selector from a run/submit action pair across opposite ends of one bar.",
    },
    "judge-console": {
        classes: ["flex", "flex-col", "gap-2", "w-full", "border-t", "border-separator", "px-4", "py-3"],
        children: {
            cases: { contract: "testcase-chip-run" },
            message: { leaf: "code-block", optional: true },
        },
        why: "if you need a results tray under an editor showing per-case marks plus a compiler message only when one exists.",
    },
    "global-ai-layout": {
        classes: ["relative", "w-full"],
        children: {
            surface: { leaf: "page" },
            selection: { contract: "selection-ai-actions", optional: true },
            trigger: { contract: "floating-ai-trigger", optional: true },
            drawer: { contract: "starci-ai-drawer-column", optional: true },
        },
        why: "if you need a routed page surface paired with the one persistent AI trigger/drawer that survives navigation between pages.",
    },
    "floating-ai-trigger": {
        classes: ["flex", "items-center", "gap-2"],
        children: {
            mark: { leaf: "starci-ai-mark" },
            label: { leaf: "text" },
            badge: { leaf: "badge", optional: true },
        },
        why: "if you need a global AI mark, its accessible label and an optional unread fact forming one press target.",
    },
    "curriculum-module-summary-row": {
        classes: ["flex", "w-full", "min-w-0", "items-center", "gap-3", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow", "[&>*:last-child]:shrink-0"],
        children: {
            title: { leaf: "text", props: { size: "sm", weight: "medium" } },
            meta: { contract: "curriculum-module-meta-row", optional: true },
            indicator: { leaf: "disclosure-indicator", optional: true },
        },
        why: "if you need a module title with room to grow, trailed by its optional difficulty and preview facts.",
    },
    "curriculum-module-meta-row": {
        classes: ["flex", "shrink-0", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            level: { leaf: "badge", optional: true },
            preview: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
        },
        why: "if you need a module's difficulty and preview facts wrapped together as one trailing cluster.",
    },
    "curriculum-lesson-list": {
        host: "ol",
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "pl-4"],
        children: {
            lesson: { contract: "curriculum-lesson-row", repeats: true, restingCount: 3 },
        },
        why: "if you need a revealed module's lessons kept in one ordered, separated list.",
    },
    "curriculum-lesson-row": {
        host: "li",
        classes: ["flex", "items-center", "py-2"],
        children: {
            title: { leaf: ["text", "button"] },
        },
        why: "if you need one lesson title in a list row, whether informative or opening that lesson's route.",
    },
    "pricing-phase-disclosure-summary": {
        classes: ["flex", "w-full", "items-center", "justify-between", "gap-2", "p-0"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "medium" } },
            indicator: { leaf: "disclosure-indicator" },
        },
        why: "if you need a compact full-width label and indicator heading a collapsible phase comparison.",
    },
    "pricing-phase-list": {
        host: "ul",
        classes: ["flex", "flex-col", "gap-2", "px-4"],
        children: {
            phase: { contract: "pricing-phase-row", repeats: true, restingCount: 3 },
        },
        why: "if you need a vertical list of comparable pricing phases inset below the selected offer.",
    },
    "pricing-phase-row": {
        host: "li",
        classes: ["flex", "items-center", "justify-between", "gap-2"],
        children: {
            name: { leaf: "text", props: { size: "sm" } },
            value: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "if you need a row pairing a phase name with its value on one comparable baseline.",
    },
    "selection-ai-actions": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            quote: { leaf: "code-block" },
            action: { leaf: "button", repeats: true, restingCount: 2 },
        },
        why: "if you need the exact selected passage kept attached to its mutually exclusive follow-up actions.",
    },
    "starci-ai-drawer-column": {
        classes: ["flex", "w-full", "grow", "flex-col"],
        children: {
            mode: { contract: "starci-ai-mode-row" },
            context: { contract: "starci-ai-context-stack", optional: true },
            chat: { contract: "starci-ai-turn-list" },
        },
        why: "if you need the AI drawer's mode row, optional context stack and turn list held together as one scrolling column.",
    },
    "starci-ai-chat-stack": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-2"],
        children: {
            conversation: { contract: "starci-ai-drawer-column" },
            actions: { contract: "stacked-peer-controls", optional: true },
            composer: { contract: "starci-ai-composer", optional: true },
        },
        why: "if you need the AI drawer's conversation column paired with optional session actions and the active composer as one ordered body.",
    },
    "starci-ai-mode-row": {
        classes: ["flex", "items-center", "gap-1"],
        children: {
            mode: { leaf: "button", repeats: true, restingCount: 3 },
        },
        why: "if you need the AI drawer's mutually exclusive mode buttons rendered as one finite row.",
    },
    "starci-ai-context-stack": {
        classes: ["flex", "min-w-0", "items-center", "gap-1", "overflow-hidden"],
        children: {
            context: { leaf: "text" },
            clear: { leaf: "button", optional: true },
        },
        why: "if you need a compact summary of the AI drawer's active grounding (lesson, file, range) with an explicit clear action.",
    },
    "starci-ai-turn-list": {
        classes: ["flex", "grow", "flex-col", "gap-3", "overflow-hidden"],
        children: {
            turn: { leaf: ["article", "button"], repeats: true, restingCount: 4 },
        },
        why: "if you need the AI conversation's saved history and streaming turns rendered as one selectable ordered transcript.",
    },
    "starci-ai-composer": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            selection: { leaf: "code-block", optional: true },
            input: { leaf: "textarea" },
            sendOrStop: { leaf: "button" },
            quota: { leaf: "text", optional: true },
        },
        why: "if you need the AI drawer's draft input paired with pinned code context, the send/stop control and quota text as one composer.",
    },
    "source-workspace-root": {
        classes: ["flex", "min-w-0", "flex-col", "gap-2"],
        children: {
            toolbar: { contract: "source-workspace-toolbar" },
            workspace: { contract: ["source-workspace-grid", "source-code-reader-grid"], optional: true },
        },
        why: "if you need the outer wrapper that keeps a snapshot toolbar attached to its editor/preview workspace through every loading or failure state.",
    },
    "source-workspace-grid": {
        classes: ["grid", "min-w-0", "grid-cols-1", "lg:grid-cols-3"],
        children: {
            files: { contract: "source-file-navigation" },
            editor: { contract: "source-code-editor-frame" },
            preview: { leaf: "page" },
        },
        why: "if you need a file explorer, editor and live preview laid out as desktop peers that collapse to one column on narrow screens.",
    },
    "source-code-reader-grid": {
        classes: ["grid", "min-w-0", "grid-cols-1", "sm:grid-cols-2"],
        children: {
            files: { contract: "source-file-navigation" },
            editor: { contract: "source-code-editor-frame" },
        },
        why: "if you need a read-only source explorer and code reader to share the available width without fabricating a runnable preview.",
    },
    "source-code-editor-frame": {
        classes: ["min-h-80", "min-w-0", "overflow-auto"],
        children: {
            editor: { leaf: "code-editor" },
        },
        why: "if you need a scrollable minimum-height frame wrapping a single code editor.",
    },
    "source-workspace-toolbar": {
        classes: ["flex", "flex-wrap", "items-center", "justify-between", "gap-2"],
        children: {
            identity: { leaf: "text" },
            action: { leaf: "button", repeats: true, restingCount: 2 },
            status: { leaf: "status-dot", optional: true },
        },
        why: "if you need a toolbar pairing snapshot identity with its reset actions and a local-change status dot.",
    },
    "source-file-navigation": {
        host: "nav",
        classes: ["flex", "min-w-0", "flex-col", "gap-2"],
        children: {
            label: { leaf: "text" },
            files: { contract: "source-file-list" },
        },
        why: "if you need a labelled file explorer nav wrapping an ordered file list.",
    },
    "source-file-list": {
        host: "ul",
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            file: { contract: "source-file-row", repeats: true, restingCount: 5 },
        },
        why: "if you need an ordered list of file rows that keeps a keyboard-readable traversal sequence.",
    },
    "source-file-row": {
        host: "li",
        classes: ["flex", "min-w-0", "items-center", "gap-2"],
        children: {
            disclosure: { leaf: "icon-button" },
            name: { leaf: "text" },
            status: { leaf: "status-dot", optional: true },
        },
        why: "if you need one file-tree row combining folder disclosure, path name and edit status in a single press target.",
    },
    "testcase-chip-run": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            testcase: { leaf: "badge", repeats: true, restingCount: 5 },
        },
        why: "if you need a wrapping run of equal-peer testcase chips read as a set rather than a ranking.",
    },
    "global-search-workspace": {
        classes: ["flex", "min-w-0", "flex-col", "gap-4"],
        children: {
            query: { leaf: "search-command-field" },
            body: { contract: "global-search-body" },
        },
        why: "if you need the search input field paired with the scope/result/context body that answers its query.",
    },
    "global-search-body": {
        classes: ["flex", "min-w-0", "flex-col", "gap-4", "md:flex", "md:flex-row", "md:items-start", "md:gap-8", "md:[&>[data-component=SelectionList][data-variant=scopes]]:w-72", "md:[&>[data-component=SelectionList][data-variant=scopes]]:shrink-0", "md:[&>[data-node=global-search-result-region]]:min-w-0", "md:[&>[data-node=global-search-result-region]]:grow", "md:[&>[data-node=global-search-context-card]]:w-72", "md:[&>[data-node=global-search-context-card]]:shrink-0"],
        children: {
            scopes: { leaf: "selection-list" },
            results: { contract: "global-search-result-region" },
            context: { contract: "global-search-context-card", optional: true },
        },
        why: "if you need scope selection, results and the selected-hit context laid out side by side, collapsing to a stack on narrow screens.",
    },
    "global-search-result-region": {
        classes: ["min-w-0"],
        children: {
            list: { contract: "global-search-surface-list", optional: true },
            notice: { composite: "empty-notice", optional: true },
        },
        why: "if you need the middle search region to swap between a populated result list and a settled-empty notice.",
    },
    "global-search-surface-list": {
        classes: ["min-w-0", "overflow-hidden", "divide-y", "divide-separator", "p-0"],
        children: {
            list: { leaf: "selection-list", repeats: true, restingCount: 1 },
        },
        why: "if you need search results wrapped in one label-less bounded surface list.",
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
        why: "if you need a desktop-only panel showing the selected search hit's identity, evidence and one canonical way out.",
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
