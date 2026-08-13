/**
 * THE CANDIDATE'S REGISTRY.
 *
 * Target path: the entries below marked PROPOSED are destined for
 * `src/components/contracts/index.ts` verbatim. This file is not ported; it exists so the candidate
 * can render them before they are merged.
 *
 * WHY A REGISTRY AND NOT A HELPER BRANCH. The first attempt drew proposed nodes through a small
 * branch that took `children`. It rendered correctly and was refused outright: `children` is an
 * untyped hole that belongs only to the shells whose whole purpose is to ignore their interior, and
 * a branch that accepts one has stopped constraining anything. The rule was right and the shortcut
 * was wrong, so the candidate mirrors the production shape instead - a registry of keys, and a
 * `Tree` that draws one of them.
 *
 * WHY THE LOCKED KEYS ARE RESTATED HERE RATHER THAN SPREAD IN. The registry reader parses this file
 * as TEXT, looking for `buildContracts({` and four-space-indented key lines, because an ESLint rule
 * runs under one parser on one file and cannot import a TypeScript module. A spread of the locked
 * table would produce no such lines, so every locked key the candidate uses would read as invented.
 * Only the keys this candidate actually renders are restated - it is a short list, and each one is
 * copied byte-for-byte from the locked entry so a drift is a visible diff rather than a surprise.
 */

/** The closed set of classes a node may lay its children out with. Mirrors the locked union. */
export type LayoutClassName = string

/** Literal values a contract may require from a child component's data props. */
export type ContractPropValue = string | number | boolean | null

/** One named child slot. */
export interface ContractChildSpec {
    readonly leaf?: string | ReadonlyArray<string>
    readonly composite?: string | ReadonlyArray<string>
    readonly contract?: string | ReadonlyArray<string>
    readonly props?: Readonly<Record<string, ContractPropValue>>
    readonly optional?: boolean
    readonly repeats?: boolean
    readonly restingCount?: number
}

/** One registry entry: a node's own classes, and why what it holds sits that way. */
export interface ContractSpec {
    readonly classes: ReadonlyArray<LayoutClassName>
    readonly children: Readonly<Record<string, ContractChildSpec>>
    readonly why: string
}

/** Identity builder, mirroring the locked one so the parsed shape is the same. */
const buildContracts = <const T extends { readonly [K in keyof T]: ContractSpec }>(contracts: T): T => contracts

/**
 * The candidate's entry table: the locked keys it renders, restated, plus the keys it proposes.
 *
 * Read the file header for why the locked ones are restated rather than spread in - the registry
 * reader parses this file as text, so a spread would make every locked key read as invented.
 */
export const CONTRACTS = buildContracts({
    "price-discount-line": {
        classes: ["flex", "flex-row", "flex-wrap", "items-center", "gap-2"],
        children: {
            price: { leaf: "text", props: { size: "sm", weight: "semibold" } },
            original: { leaf: "text", props: { size: "xs", tone: "muted" }, optional: true },
            discount: { leaf: "badge", optional: true },
        },
        why: "The payable price leads while original price and discount qualify that same commerce fact on one wrapping line.",
    },
    "course-detail-page": {
        classes: ["flex", "flex-col", "gap-6"],
        children: {
            breadcrumb: { contract: "course-breadcrumb-row" },
            body: { contract: "main-then-rail" },
            action: { contract: "course-mobile-action-bar", optional: true },
        },
        why: "The page is one vertical argument - where you are, what the course is, and how to buy it - so its regions stack at one rhythm rather than each choosing its own spacing.",
    },
    "course-breadcrumb-row": {
        classes: ["flex", "flex-row", "items-center", "gap-2"],
        children: {
            crumb: { leaf: ["text", "icon"], repeats: true, restingCount: 3 },
        },
        why: "The trail back is one sentence read left to right, so its crumbs and separators share a baseline instead of stacking.",
    },
    "main-then-rail": {
        classes: [
            "flex", "flex-col", "gap-6", "md:flex-row", "md:items-start",
            "md:[&>*:first-child]:min-w-0", "md:[&>*:first-child]:grow",
            "md:[&>*:last-child]:w-72", "md:[&>*:last-child]:shrink-0",
            "md:[&>*:last-child]:sticky", "md:[&>*:last-child]:top-6",
            "md:[&>*:last-child]:self-start", "md:[&>*:last-child]:max-h-rail",
            "md:[&>*:last-child]:overflow-y-auto",
        ],
        children: {
            main: { contract: "course-narrative-column" },
            rail: { contract: "course-pricing-rail" },
        },
        why: "The narrative owns the flexible measure while the purchase decision keeps a fixed column at the trailing edge and follows the reader down a long curriculum. It mirrors the locked rail-then-main rather than replacing it, because a left rail and a right rail are the same mechanics on opposite children and neither should be expressed by reordering content.",
    },
    "course-narrative-column": {
        classes: ["flex", "min-w-0", "flex-col", "gap-6"],
        children: {
            heading: { contract: "course-hero-heading" },
            evidence: { contract: "course-stat-chip-run" },
            section: { contract: "course-section", repeats: true, restingCount: 2 },
        },
        why: "What the course is, what it promises and what it contains are one continuous argument, so they stack at one block rhythm rather than competing for a reader's attention side by side.",
    },
    "course-hero-heading": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            title: { leaf: "heading" },
            tagline: { leaf: "text", props: { size: "sm" } },
        },
        why: "The course name and the one sentence that qualifies it are read as a unit before any evidence or price, which is the whole reason the hero carries no commerce.",
    },
    "course-stat-chip-run": {
        classes: ["flex", "flex-row", "flex-wrap", "gap-2"],
        children: {
            stat: { leaf: "badge", repeats: true, restingCount: 5 },
        },
        why: "A course's trust counts are compact peer facts that wrap together before any label is squeezed or clipped. Mechanically identical to profile-topic-chip-run, and deliberately a separate key: a course's evidence is not a profile's topics, and one owner serving both domains is how a key stops constraining anything.",
    },
    "course-section": {
        classes: ["flex", "flex-col", "gap-3"],
        children: {
            title: { leaf: "heading" },
            body: { contract: ["course-promise-list", "course-module-list"] },
        },
        why: "A narrative section is its name and the body that name introduces, held closer to each other than to the next section.",
    },
    "course-promise-list": {
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "rounded-2xl", "bg-surface", "p-0", "[&>*]:px-4", "[&>*]:py-3"],
        children: {
            promise: { contract: "course-promise-row", repeats: true, restingCount: 4 },
        },
        why: "A course's promises are peers of one joined list, so full-width separators keep the scan continuous and no promise acquires a card of its own. Deliberately not profile-evidence-list, whose identical mechanics are named for a different domain - one key serving both is how a name stops constraining what may sit inside it.",
    },
    "course-promise-row": {
        classes: ["flex", "flex-row", "items-start", "gap-3", "[&>*:last-child]:min-w-0", "[&>*:last-child]:grow"],
        children: {
            mark: { leaf: "text", props: { size: "sm" } },
            promise: { leaf: "text", props: { size: "sm" } },
        },
        why: "The affirmative mark leads the sentence it affirms, and the sentence owns the remaining width so a long promise wraps under itself rather than under the mark.",
    },
    "course-module-list": {
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "rounded-2xl", "bg-surface", "p-0", "[&>*]:px-4", "[&>*]:py-3"],
        children: {
            module: { leaf: "curriculum-module-row", repeats: true, restingCount: 5 },
        },
        why: "Modules are ordered peers of one joined list whose separators preserve sequence; each row owns whether it discloses its lessons, so the list never has to know.",
    },
    "course-pricing-rail": {
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            cover: { leaf: "cover-image" },
            price: { contract: "course-price-block" },
            ladder: { contract: "pricing-phase-ladder", optional: true },
            action: { leaf: "button" },
            proof: { leaf: "text", props: { size: "xs" }, optional: true },
        },
        why: "Artwork, price, ladder, action and proof are one decision read top to bottom, so they stack at one rhythm inside the only buy box on the page.",
    },
    "course-price-block": {
        classes: ["flex", "flex-col", "gap-1"],
        children: {
            line: { contract: "price-discount-line" },
            savings: { leaf: "text", props: { size: "xs" }, optional: true },
            scarcity: { leaf: "text", props: { size: "xs" }, optional: true },
        },
        why: "The payable price, what it saves and what is running out are one claim about cost, so they sit tighter to each other than to the ladder below them.",
    },
    "pricing-phase-ladder": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            phase: { contract: "pricing-phase-row", repeats: true, restingCount: 3 },
        },
        why: "The phases are one mutually exclusive ladder in which the open phase is the price and the others are the cost of waiting, so they read as a single control rather than as separate facts a reader must compare.",
    },
    "pricing-phase-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: ["status-dot", "text"] },
            name: { leaf: "text", props: { size: "sm" } },
            value: { leaf: "text", props: { size: "xs" } },
        },
        why: "One phase states its own availability and its own price on a single baseline, so the ladder can be scanned down its trailing edge. The mark keeps a fixed slot whether or not this phase is the open one, which is what keeps the names aligned down the ladder.",
    },
    "course-mobile-action-bar": {
        classes: ["sticky", "bottom-0", "z-40", "flex", "flex-row", "items-center", "justify-between", "gap-3", "border-t", "border-separator", "bg-background", "px-4", "py-3", "md:hidden"],
        children: {
            price: { contract: "price-discount-line" },
            action: { leaf: "button" },
        },
        why: "Below the rail's breakpoint the purchase decision would scroll away entirely, so the price and its one action pin to the bottom edge and step aside as soon as the rail can hold them again.",
    },
})

/** Every key in this candidate's registry. */
export type ContractKey = keyof typeof CONTRACTS

/**
 * Read one entry, widened to the shared shape.
 *
 * @param name - The registry key to read.
 */
export const contractSpec = (name: ContractKey): ContractSpec => CONTRACTS[name]

/**
 * Resolve one contract into the props its branch places on the real layout node.
 *
 * @param name - The registry key to draw.
 */
export const contractNodeProps = (name: ContractKey) => {
    const spec = contractSpec(name)
    return {
        "data-tier": "branch",
        "data-node": name,
        "data-why": spec.why,
        className: spec.classes.join(" "),
    }
}
