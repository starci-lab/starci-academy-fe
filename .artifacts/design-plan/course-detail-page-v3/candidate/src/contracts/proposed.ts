import { CONTRACTS, type ContractSpec } from "@/components/contracts"

/**
 * THE EXACT REGISTRY DELTA this candidate needs, written once, in the shape the target registry
 * already uses. Apply merges these entries into `src/components/contracts/index.ts` verbatim.
 *
 * Target path: src/components/contracts/index.ts
 *
 * No widening of `LayoutClassName` is required. Every class below is already a member, which is
 * itself the finding: direction A adds regions to a page whose vocabulary already covers them, and
 * a candidate that needed new tokens for a parity-posture direction would have been a candidate
 * doing more than the direction asked for.
 *
 * THE PREREQUISITE LIST IS AN `ol`, AND THAT IS NOT A STYLE CHOICE. Two independent facts force it.
 * The backend documents the relation as "Ordered prerequisites required before joining the course",
 * so the sequence is data rather than presentation. And `starci-fe/no-duplicate-entry-shape`
 * compares sorted classes, host and slots: a `ul` here would spell exactly what
 * `course-promise-list` already spells, and the rule would refuse it by name. The `ol` is the
 * honest shape and the legal one at the same time, for the same reason `course-module-list` gives.
 */

/** The one slot extension: `course-section` learns to hold a review block. */
export const PROPOSED_SECTION_BODY_SLOT = [
    "course-promise-list",
    "course-module-list",
    "course-prerequisite-list",
    "course-review-block",
] as const

/** The registry entries this candidate proposes, keyed exactly as Apply will merge them. */
export const PROPOSED_CONTRACTS = {
    "course-prerequisite-list": {
        host: "ol",
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0", "[&>*]:px-4", "[&>*]:py-3"],
        children: {
            prerequisite: { contract: "course-prerequisite-row", repeats: true, restingCount: 3 },
        },
        why: "Prerequisites are ORDERED - the backend stores them in sequence and a learner who lacks the first cannot judge the second - so an ol says that sequence to a reader who cannot see numbering. It is deliberately not course-promise-list: identical mechanics under a ul would be that entry under a second name, which the duplicate-shape rule refuses and which would also drop the ordering the data carries.",
    },
    "course-prerequisite-row": {
        host: "li",
        classes: ["flex", "flex-row", "items-start", "gap-3", "[&>*:last-child]:min-w-0", "[&>*:last-child]:grow"],
        children: {
            mark: { leaf: "text", props: { size: "sm", tone: "muted" } },
            requirement: { leaf: "text", props: { size: "sm" } },
        },
        why: "One requirement is one item of the ordered list. Its mark is muted rather than a tick, because a prerequisite is a condition the reader must satisfy themselves - a green check would claim the platform had verified it.",
    },
    "course-review-block": {
        host: "section",
        classes: ["flex", "flex-col", "gap-4"],
        children: {
            summary: { contract: "course-review-summary" },
            list: { contract: "course-review-list" },
        },
        why: "A rating and the reviews behind it are two composed groups of one region, so the seam between them out-ranks the seams inside each - which is the gap-4 rung. The summary answers 'is this course any good' and the list answers 'why', and a reader who only wants the first must not have to read the second.",
    },
    "course-review-summary": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "gap-3"],
        children: {
            score: { leaf: "heading" },
            stars: { leaf: "text", props: { size: "sm" } },
            count: { leaf: "text", props: { size: "sm", tone: "muted" } },
        },
        why: "The mean, the star run and the count are one statement about the whole population, read left to right and sharing a baseline so the figure does not float against its own qualifier. They are separate semantic groups on one row rather than one compact control, which is the gap-3 rung.",
    },
    "course-review-list": {
        host: "ul",
        classes: ["flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0", "[&>*]:px-4", "[&>*]:py-3"],
        children: {
            review: { contract: "course-review-row", repeats: true, restingCount: 3 },
        },
        why: "Reviews are unordered peers of one joined list - review three is not a consequence of review two - so a ul, and full-width separators keep the scan continuous without giving any single opinion a card of its own.",
    },
    "course-review-row": {
        host: "li",
        classes: ["flex", "min-w-0", "flex-col", "gap-1"],
        children: {
            author: { contract: "course-review-author-line" },
            body: { leaf: "text", props: { size: "sm", tone: "muted" }, optional: true },
        },
        why: "Who said it and what they said are two lines of ONE opinion, so they sit at the identity rung rather than at the unit rung. The body is optional because a score alone is a complete review, and requiring prose is how a list fills with one-word bodies.",
    },
    "course-review-author-line": {
        classes: ["flex", "flex-row", "flex-wrap", "items-baseline", "gap-2"],
        children: {
            name: { leaf: "text", props: { size: "sm", weight: "medium" } },
            stars: { leaf: "text", props: { size: "xs" } },
        },
        why: "A name and the score that person gave are one compact reading on one row - the score is not a fact about the course here, it is a fact about what THIS person thought - so they form one functional cluster at the compact rung.",
    },
} as const satisfies Readonly<Record<string, ContractSpec>>

/**
 * Every locked key this candidate reuses unchanged, listed so the reuse is reviewable rather than
 * implied by absence. Reading this beside PROPOSED_CONTRACTS is how a reviewer sees that direction
 * A adds four regions and rewrites none.
 */
export const REUSED_CONTRACTS = [
    "course-detail-page",
    "course-breadcrumb-row",
    "main-then-rail",
    "course-hero",
    "course-hero-heading",
    "course-stat-chip-run",
    "course-section",
    "course-promise-list",
    "course-module-list",
    "course-pricing-rail",
    "course-price-block",
    // The plan recorded "pricing-phase-ladder" as a REUSE. That key no longer exists: the target
    // moved to main and the discount breakdown is now course-price-detail-stack holding
    // stacked-stat-rows. Read from source rather than assumed, and corrected here rather than left
    // to fail at Apply.
    "course-price-detail-stack",
    "stacked-stat-rows",
    "course-mobile-action-bar",
] as const satisfies ReadonlyArray<keyof typeof CONTRACTS>

/** The arrangement the star run needs, so no component writes `inline-flex` at a call site. */
export const PROPOSED_STAR_RUN_CONTRACT = {
    "rating-star-run": {
        classes: ["flex", "flex-row", "items-center", "gap-1"],
        children: {
            star: { leaf: "icon", repeats: true, restingCount: 5 },
        },
        why: "Five marks stand for the scale a score is read against, so they are one compact functional cluster rather than five facts - the tightest horizontal rung. The run says how far the scale goes and the number beside it says where this course sits; drawing a filled mark instead would need a glyph family StarCi does not have.",
    },
} as const

/**
 * The merged registry the candidate draws from: everything the target locks, plus what this
 * candidate proposes. Apply deletes this merge; the proposed half becomes locked and every call
 * site collapses onto the real `Tree`.
 */
export const CANDIDATE_CONTRACTS: Readonly<Record<string, ContractSpec>> = {
    ...CONTRACTS,
    ...PROPOSED_CONTRACTS,
    ...PROPOSED_STAR_RUN_CONTRACT,
}

/**
 * THE ICON DELTA - one meaning, not two.
 *
 * Target path: src/components/leaves/Icon/index.tsx - one member on `IconName`, one entry in
 * `GLYPHS`.
 *
 * A FILLED star is not available and this candidate does not pretend otherwise. StarCi has exactly
 * two glyph families, `24/outline` and `16/solid`, so a filled mark and an empty one cannot share
 * a size; and ICON-5 makes every glyph inherit `currentColor`, so they cannot be told apart by
 * colour either. Three independent rules refuse the conventional filled/empty run, and the lint
 * caught all three before a line of it was drawn.
 *
 * So the run is five OUTLINE stars standing for the scale, and the number beside them carries the
 * value. That is one addition to a closed name set - which ICON-9 already sanctions, since the
 * feature map is where meaning-to-glyph selection lives - rather than a third glyph family, which
 * would have been a canon change at the lowest tier in the system.
 */
export const PROPOSED_ICON_NAMES = [
    { name: "star", glyph: "@heroicons/react/24/outline StarIcon", means: "one position on the rating scale" },
] as const

