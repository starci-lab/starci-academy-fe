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
    | "flex" | "grid" | "flex-col" | "flex-row" | "flex-wrap" | "overflow-hidden"
    | "items-center" | "items-baseline" | "items-start" | "items-end"
    | "justify-between" | "justify-center" | "[&>*]:w-full"
    | "gap-0" | "gap-1" | "gap-2" | "gap-3" | "gap-4" | "gap-5" | "gap-6" | "gap-8"
    | "grid-cols-1" | "grid-cols-2" | "sm:grid-cols-2" | "sm:grid-cols-4" | "lg:grid-cols-3"
    | "md:flex" | "md:flex-row" | "md:items-start"
    | "@app-md:flex-row" | "@app-md:items-start" | "@app-md:gap-8" | "@app-md:w-72"
    | "mx-auto" | "min-h-screen" | "w-full" | "min-w-0" | "grow" | "flex-1" | "shrink-0" | "hidden" | "max-w-app-lg" | "max-w-app-xl" | "max-w-6xl" | "max-w-sm" | "@container"
    | "h-16" | "min-h-16" | "sticky" | "top-0" | "top-16" | "z-40" | "z-50"
    | "border" | "border-b" | "border-separator" | "divide-y" | "divide-separator" | "bg-background"
    | "px-3" | "px-4" | "px-6" | "py-2" | "py-3" | "py-6" | "p-0" | "p-2" | "p-4" | "p-6"
    | "px-2" | "cursor-pointer" | "text-left" | "text-foreground" | "hover:opacity-80"
    | "rounded-xl" | "rounded-2xl" | "rounded-3xl"
    | "bg-surface" | "shadow-surface" | "text-center"
    | "inset-shadow-[2px_0_0_0_var(--success)]" | "inset-shadow-[2px_0_0_0_var(--danger)]"
    | "[&>*:nth-child(2)]:min-w-0" | "[&>*:nth-child(2)]:grow"
    | "[&>*:nth-child(3)]:min-w-0" | "[&>*:nth-child(3)]:grow"
    | "md:[&>*:first-child]:min-w-0" | "md:[&>*:first-child]:grow"
    | "[&>*:first-child]:min-w-0" | "[&>*:first-child]:grow"
    | "md:[&>*:last-child]:w-72" | "md:[&>*:last-child]:shrink-0"
    | "md:[&>*:first-child]:w-72" | "md:[&>*:first-child]:shrink-0"
    | "md:[&>*:last-child]:min-w-0" | "md:[&>*:last-child]:grow"
    | "md:[&>*:first-child]:sticky" | "md:[&>*:first-child]:top-6"
    | "md:[&>*:first-child]:self-start" | "md:[&>*:first-child]:max-h-rail"
    | "md:[&>*:first-child]:overflow-y-auto"
    | "[&>*]:px-4" | "[&>*]:py-3" | "[&>*]:p-2" | "[&>*]:p-3" | "[&>*]:border-separator"
    | "[&>*:nth-child(odd)]:border-r" | "[&>*:nth-child(-n+4)]:border-b"
    | "[&>*:first-child]:w-5" | "[&>*:first-child]:shrink-0"
    | "[&>*:first-child]:text-center" | "[&>*:first-child]:tabular-nums"
    | "[&>*:first-child]:pt-4" | "[&>*:last-child]:pb-4"
    // The dais arranges its own places. Emitting them out of rank order would put the
    // champion in the middle of the DOM too, so anyone reading in sequence hears second
    // place first; the node re-orders what it draws and leaves the reading order alone.
    | "[&>*:nth-child(1)]:order-2" | "[&>*:nth-child(2)]:order-1" | "[&>*:nth-child(3)]:order-3"

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

type ContractChild<S> = S extends { readonly contract: infer K }
    ? (K extends ReadonlyArray<infer A> ? A : K) extends infer C extends ContractKey
        ? import("~candidate/components/contracts/props").ContractComponent<C>
        : never
    : never

type LeafChild<S> = S extends { readonly leaf: infer N }
    ? (N extends ReadonlyArray<infer A> ? A : N) extends infer L extends string
        ? import("~candidate/components/contracts/props").LeafComponent<L, ChildProps<S>>
        : never
    : never

type CompositeChild<S> = S extends { readonly composite: infer N }
    ? (N extends ReadonlyArray<infer A> ? A : N) extends infer C extends string
        ? import("~candidate/components/contracts/props").CompositeComponent<C, ChildProps<S>>
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
        classes: ["w-full", "max-w-sm"],
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
    "heading-over-body": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            heading: { contract: ["underlined-tab-strip", "title-with-end-action"] },
            body: { contract: ["title-with-end-action", "rail-then-main"] },
            continuation: { contract: "rail-then-main", optional: true },
        },
        why: "The seam here is the only thing telling a reader that the content below belongs to this heading and not to the one above it.",
    },
    "stacked-sections": {
        classes: ["flex", "flex-col", "gap-6"],
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
        classes: ["grid", "grid-cols-2", "gap-3", "sm:grid-cols-4"],
        children: { metric: { composite: "profile-metric", repeats: true, restingCount: 4 } },
        why: "Four proof metrics scan as equal peers, using two readable columns when narrow and one complete ribbon once all four retain useful width.",
    },
    "profile-breakdown-stack": {
        classes: ["flex", "flex-col", "gap-6"],
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
        classes: ["flex", "flex-col", "gap-2", "rounded-3xl", "bg-surface", "p-4", "shadow-surface"],
        children: {
            mark: { leaf: "icon-tile" },
            name: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            rarity: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "One achievement mark, name and rarity form a single earned-proof object rather than three detached facts.",
    },
    "profile-toolbar-over-list": {
        classes: ["flex", "flex-col", "gap-3"],
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
        classes: ["mx-auto", "w-full", "max-w-app-lg", "overflow-hidden", "rounded-3xl", "bg-surface", "shadow-surface"],
        children: { document: { leaf: "profile-cv-document" } },
        why: "The public CV has one bounded paper measure whose document remains readable without acquiring unrelated profile-card chrome.",
    },
    "profile-proof-header": {
        classes: ["flex", "flex-col", "gap-3"],
        children: { back: { leaf: "button" }, title: { leaf: "heading" }, meta: { leaf: "text", props: { size: "sm", tone: "muted" } } },
        why: "The back path, proof title and qualifier form one route-local orientation block before detailed evidence begins.",
    },
    "profile-coding-statement": {
        classes: ["flex", "flex-col", "gap-3"],
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
        classes: ["grid", "grid-cols-2", "gap-3", "sm:grid-cols-4"],
        children: { metric: { contract: "profile-proof-metric", repeats: true, restingCount: 4 } },
        why: "Four standing metrics remain equal peers, using two readable columns when narrow and one complete proof ribbon once space permits.",
    },
    "profile-proof-metric": {
        classes: ["flex", "flex-col", "gap-1"],
        children: { figure: { leaf: "text" }, label: { leaf: "text", props: { size: "xs", tone: "muted" } } },
        why: "A proof figure and its short qualifier are one metric sentence and must not drift into separate rows.",
    },
    "profile-project-card-grid": {
        classes: ["grid", "grid-cols-1", "gap-3", "sm:grid-cols-2"],
        children: { card: { contract: "profile-project-card", repeats: true, restingCount: 2 } },
        why: "Pinned project proofs stack when narrow and become equal peer cards only when each retains readable title and description width.",
    },
    "profile-project-card": {
        classes: ["flex", "flex-col", "gap-3", "rounded-2xl", "border", "border-separator", "bg-surface", "p-4"],
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
        classes: ["mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6", "md:flex-row", "md:items-start", "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0", "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow"],
        children: {
            rail: { contract: "dashboard-rail" },
            main: { contract: ["dashboard-main", "dashboard-courses-main", "dashboard-community-main", "centred-empty-notice"] },
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
    "dashboard-courses-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            section: { contract: "label-row-over-card", repeats: true, restingCount: 3 },
        },
        why: "The three learning blocks keep their legacy reading order while settling independently, so the page orchestrates one course journey without owning any child request.",
    },
    "dashboard-community-main": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-6"],
        children: {
            section: { contract: "label-row-over-card", repeats: true, restingCount: 2 },
        },
        why: "Weekly league and global standing are separate competition stories with independent request lifetimes, kept in one legacy-ordered community column.",
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
        classes: ["flex", "flex-col", "gap-3"],
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
        classes: ["flex", "flex-col", "gap-3", "rounded-3xl", "bg-surface", "p-4", "shadow-surface"],
        children: {
            title: { leaf: "text", props: { size: "md", weight: "medium" } },
            kind: { leaf: "text", props: { size: "sm", tone: "muted" } },
            resume: { leaf: "see-more-link", optional: true },
        },
        why: "The kind, title and way back into one content item share a bounded ground because none identifies the resumable item without the other two.",
    },
    "daily-quest-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            tasks: { contract: "stacked-peer-controls" },
            outcome: { leaf: ["text", "button"] },
        },
        why: "The day's task run and its reward outcome share a bounded ground because the outcome only has meaning as the result of that run.",
    },
    "weekly-challenge-card": {
        classes: ["flex", "flex-col", "gap-3"],
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
        classes: ["flex", "flex-col", "gap-3"],
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
    "daily-quest-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            task: { composite: "task-progress-row", repeats: true, restingCount: 5 },
        },
        why: "Today's tasks are peer rows of one joined list, so the surface is shared and a full-width rule - rather than card spacing - separates one target from the next.",
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
        classes: ["flex", "flex-col", "gap-0"],
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
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            total: { leaf: "text", props: { size: "xs", tone: "muted" } },
            years: { leaf: "choice-tabs" },
        },
        why: "The activity total identifies the plot while the peer year choices change its time window, so they share one header row without either becoming part of the grid mechanics.",
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
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            calendar: { composite: "contribution-calendar" },
        },
        why: "The year choice, activity grid, intensity key and streak caption explain one another, so they stay in one bounded calendar surface rather than becoming four dashboard sections.",
    },
    "weekly-goals-card": {
        classes: ["flex", "flex-col", "gap-3"],
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
    "course-progress-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            rows: { contract: "progress-row-stack" },
        },
        why: "The course progress rows share one bounded ground because they are peer measures of the same enrolled set rather than separate cards.",
    },
    "course-progress-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: {
            course: { composite: "course-progress-row", repeats: true, restingCount: 2 },
        },
        why: "Enrolled courses are peers of one joined list; full-width separators preserve the legacy scan while each row keeps one whole-course destination.",
    },
    "course-progress-row": {
        classes: ["flex", "w-full", "cursor-pointer", "flex-row", "items-center", "gap-4", "text-left", "text-foreground", "hover:opacity-80", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: "icon-tile" },
            body: { contract: "course-progress-body" },
        },
        why: "The course mark identifies the destination while title, status, segmented progress and legend stay one readable body inside the same press target.",
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
            title: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            trial: { leaf: "badge", optional: true },
            percent: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "The title owns the first reading position while optional trial truth and the overall percentage remain short trailing qualifiers on the same line.",
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
        classes: ["flex", "w-full", "cursor-pointer", "flex-row", "items-start", "gap-3", "text-left", "text-foreground", "hover:opacity-80", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: { mark: { leaf: "icon-tile" }, body: { contract: "recommended-course-body" } },
        why: "The course mark leads one whole-row destination while its commerce facts stay in one flexible reading column.",
    },
    "recommended-course-body": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-1"],
        children: { title: { leaf: "text", props: { size: "sm", weight: "semibold" } }, description: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true }, price: { contract: "price-discount-line" }, reason: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true } },
        why: "Title, optional description, price and reason are one offer sentence ordered from identity to decision evidence.",
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
        classes: ["flex", "w-full", "cursor-pointer", "flex-row", "items-center", "gap-3", "text-left", "text-foreground", "hover:opacity-80", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: { mark: { leaf: "icon-tile" }, body: { contract: "evidence-title-over-subtitle" }, time: { leaf: "text", props: { size: "xs", tone: "muted" } } },
        why: "The live mark identifies the event, title owns the flexible middle and concrete timing stays visible at the trailing edge of the same destination row.",
    },
    "leaderboard-card": {
        classes: ["flex", "flex-col", "gap-3"],
        children: { standing: { composite: "leaderboard-standing-row", optional: true }, list: { contract: "ranked-user-list" } },
        why: "Viewer standing explains the ranked identities beneath it, so both share one competition surface while the joined list keeps its own separators.",
    },
    "leaderboard-standing-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: { mark: { leaf: "league-tile" }, body: { contract: "evidence-title-over-subtitle" }, fact: { leaf: "badge", optional: true } },
        why: "The rank artwork fixes the viewer's current place and the standing sentence sits directly against it, because the two are one statement; the body owns the spare width so an optional tier fact still settles at the far edge without the sentence drifting there when no fact exists.",
    },
    "standing-hero-card": {
        classes: ["flex", "flex-col", "gap-5", "rounded-3xl", "bg-surface", "p-4"],
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
        children: { avatar: { leaf: "avatar" }, name: { leaf: "text" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, step: { leaf: "text" } },
        why: "One finisher reads top-down as face, name, score, then the step that fixes their place, so the height difference carries the ranking rather than a number the reader has to compare.",
    },
    "ranked-user-ellipsis-row": {
        classes: ["flex", "flex-row", "items-center", "justify-center", "gap-2", "py-2"],
        children: { label: { leaf: "text", props: { size: "xs", tone: "muted" } } },
        why: "A pinned self row far below the fetched slice must announce the gap, because placing it directly under the last row asserts an adjacency that is false.",
    },
    "ranked-user-list": {
        classes: ["overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4"],
        children: { user: { composite: "ranked-user-row", repeats: true, restingCount: 5 } },
        why: "Ranked identities are comparable peers in one joined list, so rank, identity, points and row action align across the board.",
    },
    "ranked-user-row": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "gap-3", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(3)]:grow"],
        children: { rank: { leaf: "rank-mark", props: { placement: "row" } }, avatar: { leaf: "avatar" }, identity: { contract: "ranked-user-name-over-subtitle" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, action: { leaf: ["badge", "button", "rank-delta-caret"], optional: true } },
        why: "Rank artwork and avatar identify the learner, identity owns spare width, points stay comparable and one movement or follow outcome remains subordinate at the row end.",
    },
    "ranked-user-row-success-verdict": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "gap-3", "inset-shadow-[2px_0_0_0_var(--success)]", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(3)]:grow"],
        children: { rank: { leaf: "rank-mark", props: { placement: "row" } }, avatar: { leaf: "avatar" }, identity: { contract: "ranked-user-name-over-subtitle" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, action: { leaf: ["badge", "button", "rank-delta-caret"], optional: true } },
        why: "The same comparable row keeps a two-pixel success band inset on its left edge because positive movement belongs to this learner's data — and the band stays square, because the one border in this picture is the list's.",
    },
    "ranked-user-row-danger-verdict": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "gap-3", "inset-shadow-[2px_0_0_0_var(--danger)]", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(3)]:grow"],
        children: { rank: { leaf: "rank-mark", props: { placement: "row" } }, avatar: { leaf: "avatar" }, identity: { contract: "ranked-user-name-over-subtitle" }, points: { leaf: "text", props: { size: "xs", tone: "muted" } }, action: { leaf: ["badge", "button", "rank-delta-caret"], optional: true } },
        why: "The same comparable row keeps a two-pixel danger band inset on its left edge because negative movement belongs to this learner's data — and the band stays square, because the one border in this picture is the list's.",
    },
    "ranked-user-name-over-subtitle": {
        classes: ["flex", "min-w-0", "flex-col", "gap-0"],
        children: { name: { leaf: ["text", "text-link"] }, subtitle: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true } },
        why: "The optional movement or viewer qualifier stays directly beneath the learner name so both read as one identity while the row keeps its trailing comparison column.",
    },
    "streak-summary-card": {
        classes: ["flex", "flex-col", "gap-4"],
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
    "progress-row-stack": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            row: { composite: "labelled-progress-row", repeats: true, restingCount: 3 },
        },
        why: "Progress rows repeat down one column so their labels and figures can be compared without each row pretending to be a separate section.",
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
    "task-mark-title-fact-row": {
        classes: ["flex", "w-full", "flex-row", "items-center", "gap-2", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: "icon" },
            title: { leaf: "text" },
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
    "glyph-body-action-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2", "rounded-xl", "px-4", "py-3"],
        children: {
            glyph: { leaf: "icon", props: { size: "sm" } },
            body: { leaf: "text" },
            action: { leaf: ["button", "see-more-link"] },
        },
        why: "A row a reader can act on needs its own inset so the press target is the row and not the words inside it.",
    },
    "label-value-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm" } },
            value: { leaf: "text", props: { size: "sm" } },
        },
        why: "The label and its figure sit at opposite ends of one line so a column of them reads as a table without being one, and they share a baseline so the figure does not float against its own name.",
    },
    "label-with-muted-fact-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            fact: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "A joined list may qualify its own rows with a semibold label and a smaller muted fact on one baseline; without peer identities outside the list there is no reason to add a leading glyph.",
    },
    "label-over-figure-tile": {
        classes: ["flex", "flex-col", "gap-3", "rounded-2xl", "bg-surface", "p-4", "shadow-surface"],
        children: {
            label: { leaf: "text", props: { size: "sm", tone: "muted" } },
            figure: { leaf: "text" },
        },
        why: "The label reads first and small, the figure second and large, because a reader scanning a row of these is comparing figures and needs the names only to know which is which.",
    },
    "resume-card-grid": {
        classes: ["grid", "grid-cols-1", "gap-3", "sm:grid-cols-2", "lg:grid-cols-3"],
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
    "form-column": {
        classes: ["flex", "w-full", "max-w-sm", "flex-col", "gap-3"],
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
            tool: { leaf: ["icon-button", "account-menu"], repeats: true, restingCount: 3 },
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
        classes: ["flex", "flex-col", "gap-6", "md:flex-row", "md:items-start", "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0", "md:[&>*:first-child]:sticky", "md:[&>*:first-child]:top-6", "md:[&>*:first-child]:self-start", "md:[&>*:first-child]:max-h-rail", "md:[&>*:first-child]:overflow-y-auto", "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow"],
        children: {
            rail: { contract: "stacked-sections" },
            main: { contract: ["stacked-sections", "centred-empty-notice"] },
        },
        why: "The rail is pinned in width and STAYS while the column beside it scrolls, because it holds who the reader is and where they can go - facts that do not stop being true a screenful down - and a rail that shrank with the window would clip its own labels before the content beside it became hard to read. Below the breakpoint it moves above rather than halving the column, where sticking it would cost a phone most of its screen.",
    },
    "centred-page-column": {
        classes: ["mx-auto", "flex", "w-full", "max-w-sm", "flex-col", "gap-6"],
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
        why: "Authentication has exactly two entry blocks: OAuth closed by the OR divider above, and the credential form below. This node alone owns their gap-3 seam so the outer page rhythm cannot add a second gap.",
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
        classes: ["flex", "flex-col", "gap-3", "[&>*]:w-full"],
        children: {
            control: {
                contract: "spread-choice-row",
                leaf: ["button", "quick-action-row", "quick-actions-list", "text"],
                composite: ["field", "labelled-progress-row", "stat-row"],
                repeats: true,
                restingCount: 3,
            },
        },
        why: "Controls repeat down one column as independently readable field or action units, so the ordinary gap-3 keeps each decision legible while their shared width still makes the run read as one form.",
    },
    "stacked-stat-rows": {
        classes: ["flex", "flex-col", "gap-0", "p-0", "[&>*]:w-full", "[&>*]:p-2"],
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
        classes: ["flex", "w-full", "cursor-pointer", "flex-row", "items-center", "justify-between", "gap-3", "px-2", "py-2", "text-left", "text-foreground", "hover:opacity-80", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            avatar: { leaf: "avatar" },
            identity: { contract: "profile-name-over-handle" },
            disclosure: { leaf: "icon" },
        },
        why: "The avatar identifies the profile, the name stack owns the available width, and the trailing disclosure makes the whole row's destination explicit.",
    },
    "profile-name-over-handle": {
        classes: ["flex", "min-w-0", "flex-col", "gap-0"],
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
        classes: ["flex", "flex-col", "items-center", "gap-3", "rounded-2xl", "bg-surface", "p-4", "text-center", "shadow-surface"],
        children: {
            notice: { composite: "empty-notice" },
        },
        why: "An empty region still has to offer a way out, so the recovery action is part of this node rather than something a caller remembers to add beside it.",
    },
    "courses-catalog-page": {
        classes: ["flex", "flex-col", "gap-6"],
        children: {
            heading: { contract: "catalog-trail-over-title" },
            toolbar: { contract: "catalog-search-count-view-row" },
            owned: { contract: "catalog-section-group", optional: true },
            discover: { contract: "catalog-section-group", optional: true },
            notice: { composite: "empty-notice", optional: true },
            pager: { leaf: "pagination", optional: true },
        },
        why: "One toolbar narrows both groups at once, so it is a peer of them rather than something either group owns, and every region on the route keeps the same seam instead of choosing its own spacing.",
    },
    "catalog-trail-over-title": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            trail: { leaf: "text", props: { size: "xs" } },
            title: { leaf: "heading" },
        },
        why: "Where the reader is and what this route is called answer the same question, so they sit closer to each other than to the controls that narrow the list below them.",
    },
    "catalog-search-count-view-row": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-3"],
        children: {
            query: { leaf: "search-box" },
            count: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
            view: { leaf: "choice-tabs" },
        },
        why: "Query, result count and layout choice all narrow the same list, so they stay on one control row above it, wrapping rather than pushing the page wider than its viewport when the row runs out of room.",
    },
    "catalog-section-group": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            title: { leaf: "heading" },
            grid: { contract: "catalog-card-grid" },
        },
        why: "Owned and purchasable courses answer different questions, so each keeps its own titled group and one action meaning instead of forcing the reader to tell them apart card by card.",
    },
    "catalog-card-grid": {
        classes: ["grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "gap-4"],
        children: {
            course: { contract: ["enrolled-course-card", "catalog-card"], repeats: true, restingCount: 3 },
        },
        why: "Catalog courses are interchangeable peers compared side by side, so they share one responsive measure rather than a single reading column. The slot names the two card kinds it accepts rather than opening to any content, because the grid holds owned cards in one group and purchasable cards in the other and nothing else belongs in either.",
    },
    "enrolled-course-card": {
        classes: ["flex", "flex-col", "gap-3", "rounded-3xl", "bg-surface", "p-4", "shadow-surface"],
        children: {
            row: { contract: "enrolled-course-row" },
            action: { leaf: "button" },
        },
        why: "An owned course stands on the same ground as a purchasable one so the two groups read as one catalog, while its interior answers where the learner stopped instead of what it costs.",
    },
    "enrolled-course-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3"],
        children: {
            cover: { leaf: "cover-image" },
            body: { contract: "enrolled-course-body" },
        },
        why: "The artwork identifies the course at a glance while its title and progress take the remaining width on the same baseline.",
    },
    "enrolled-course-body": {
        classes: ["flex", "min-w-0", "grow", "flex-col", "gap-2"],
        children: {
            title: { leaf: "heading" },
            progress: { leaf: "progress" },
            caption: { leaf: "text", props: { size: "xs" } },
        },
        why: "An owned course answers where the learner stopped, so its title and progress stay in one flexible column beside the artwork.",
    },
    "catalog-card": {
        classes: ["flex", "flex-col", "gap-3", "rounded-3xl", "bg-surface", "p-4", "shadow-surface"],
        children: {
            cover: { leaf: "cover-image" },
            body: { contract: "catalog-card-body" },
            action: { leaf: "button" },
        },
        why: "A purchasable course is one whole offer standing on its own ground, so the artwork that identifies it, the facts that price it and the one way in share a single raised surface rather than floating on the grid.",
    },
    "catalog-card-body": {
        classes: ["flex", "min-w-0", "flex-col", "gap-2"],
        children: {
            heading: { contract: "catalog-card-heading-row" },
            price: { contract: "price-discount-line" },
            savings: { leaf: "text", props: { size: "xs" }, optional: true },
            promises: { leaf: "value-proposition-disclosure" },
        },
        why: "A purchasable course reads top to bottom as one decision - what it is, what it costs, what it promises, what to do - so its parts stack in that order at one rhythm.",
    },
    "catalog-card-heading-row": {
        classes: [
            "flex", "flex-row", "items-baseline", "justify-between", "gap-2",
            "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow",
        ],
        children: {
            title: { leaf: "heading" },
            count: { leaf: "text", props: { size: "xs" } },
        },
        why: "The course name leads while its enrolment count qualifies it from the end of the same line, because the count is evidence about the name rather than a fact of its own. The name owns the spare width and yields it back as the card narrows, so the count stays whole instead of being clipped by the card's own rounded overflow.",
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
