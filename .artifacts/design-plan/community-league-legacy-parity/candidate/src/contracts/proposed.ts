import { CONTRACTS, type ContractSpec, type LayoutClassName } from "@/components/contracts"

/**
 * The candidate's local widening of the closed layout vocabulary.
 *
 * The target compiler REJECTS "items-end" and "gap-5" today — that rejection is the finding, not a
 * nuisance to route around. It is reproduced here as a typed widening so the delta Apply must make
 * to `LayoutClassName` is a named type rather than a class string somebody notices later.
 */
type ProposedLayoutClassName =
    | LayoutClassName
    | "items-end"
    | "gap-5"
    | "[&>*:nth-child(1)]:order-2"
    | "[&>*:nth-child(2)]:order-1"
    | "[&>*:nth-child(3)]:order-3"

/** A registry entry expressed in the widened vocabulary. */
type ProposedContractSpec = Omit<ContractSpec, "classes"> & {
    readonly classes: ReadonlyArray<ProposedLayoutClassName>
}

/**
 * THE EXACT REGISTRY DELTA this candidate needs, written once, in the shape the target registry
 * already uses. Apply merges these entries into `src/components/contracts/index.ts` verbatim;
 * nothing here is candidate-only styling.
 *
 * Target path: src/components/contracts/index.ts
 *
 * TWO of these need `LayoutClassName` widened first, because that union is closed by design and a
 * class it does not list is unrepresentable rather than merely discouraged:
 *
 *   - "items-end"  (podium — finishers sit on one baseline while the champion is taller)
 *   - "gap-5"      (standing-hero-card — the meter needs more air than gap-4 gives it)
 *
 * Recording that here is the point: the widening is a reviewable one-line change to a closed
 * vocabulary, not something Apply should discover mid-edit and improvise around.
 */
export const PROPOSED_LAYOUT_CLASSES = [
    "items-end",
    "gap-5",
    "[&>*:nth-child(1)]:order-2",
    "[&>*:nth-child(2)]:order-1",
    "[&>*:nth-child(3)]:order-3",
] as const

/** Registry entries that do not exist in the locked target yet. */
export const PROPOSED_CONTRACTS = {
    "podium": {
        classes: [
            "flex", "flex-row", "items-end", "justify-center", "gap-4", "w-full",
            "[&>*:nth-child(1)]:order-2", "[&>*:nth-child(2)]:order-1", "[&>*:nth-child(3)]:order-3",
        ],
        children: {
            place: { composite: "podium-place", repeats: true, restingCount: 3 },
        },
        why: "The top three are not comparable peers in a list — the champion is raised and centred because finishing first is the one fact this arrangement exists to state, and the dais order is the NODE's business so the places themselves stay in rank order for anyone reading them in sequence.",
    },
    "podium-place": {
        classes: ["flex", "flex-col", "items-center", "gap-2"],
        children: {
            avatar: { leaf: "avatar" },
            name: { leaf: "text" },
            points: { leaf: "text", props: { size: "xs", tone: "muted" } },
            step: { leaf: "text" },
        },
        why: "One finisher reads top-down as face, name, score, then the step that fixes their place, so the height difference carries the ranking rather than a number the reader has to compare.",
    },
    "standing-hero-card": {
        classes: ["flex", "flex-col", "gap-5", "rounded-3xl", "bg-surface", "p-4"],
        children: {
            standing: { composite: "leaderboard-standing-row" },
            goal: { contract: "standing-goal-meter", optional: true },
            action: { leaf: "button" },
        },
        why: "A standing that comes with a way to change it is one story: where the learner is, how far the next place is, and the single action that closes the gap.",
    },
    "standing-goal-meter": {
        classes: ["flex", "flex-col", "gap-2"],
        children: {
            label: { leaf: "text", props: { size: "xs", tone: "muted" } },
            progress: { leaf: "progress" },
        },
        why: "The distance still to cover is stated in words directly above the bar that measures it, because a bar on its own tells a learner how full something is and never what it would take to fill it.",
    },
    /*
     * REVISION 1.1 — the verdict is a BAND, and a band does not have corners.
     *
     * The locked entries carry `rounded-2xl`, so the 2px inset follows a 16px radius and reads as a
     * ring around that one row. Two rings then sit inside the list card's own 24px border and the
     * card stops looking like one bordered list — which is exactly what the legacy render is:
     * `<SurfaceListCard bordered>` owns ONE border for the whole list, and a row states its verdict
     * with a straight left band inside it (`SurfaceListCardItem withVerdict`).
     *
     * Only the radius is dropped. Colour, width, inset placement and the rule that zero or missing
     * movement gets no signal at all are unchanged.
     *
     * TARGET: CONTRACTS["ranked-user-row-success-verdict"].classes
     *         CONTRACTS["ranked-user-row-danger-verdict"].classes
     *   remove: "rounded-2xl"
     */
    "ranked-user-row-success-verdict": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "gap-3", "inset-shadow-[2px_0_0_0_var(--success)]", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(3)]:grow"],
        children: {
            rank: { leaf: "rank-mark", props: { placement: "row" } },
            avatar: { leaf: "avatar" },
            identity: { contract: "ranked-user-name-over-subtitle" },
            points: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: ["badge", "button", "rank-delta-caret"], optional: true },
        },
        why: "The same comparable row keeps a two-pixel success band inset on its left edge because positive movement belongs to this learner's data — and the band stays square, because the one border in this picture is the list's.",
    },
    "ranked-user-row-danger-verdict": {
        classes: ["flex", "w-full", "flex-row", "flex-wrap", "items-center", "gap-3", "inset-shadow-[2px_0_0_0_var(--danger)]", "[&>*:nth-child(3)]:min-w-0", "[&>*:nth-child(3)]:grow"],
        children: {
            rank: { leaf: "rank-mark", props: { placement: "row" } },
            avatar: { leaf: "avatar" },
            identity: { contract: "ranked-user-name-over-subtitle" },
            points: { leaf: "text", props: { size: "xs", tone: "muted" } },
            action: { leaf: ["badge", "button", "rank-delta-caret"], optional: true },
        },
        why: "The same comparable row keeps a two-pixel danger band inset on its left edge because negative movement belongs to this learner's data — and the band stays square, because the one border in this picture is the list's.",
    },
    /*
     * REVISION 1.4 — the standing sentence belongs BESIDE its medal, not at the far edge.
     *
     * The locked entry is `justify-between` across three slots (mark · body · fact). That reads
     * correctly only while a fact is present to hold the far edge. Revision 1.0 removed the invented
     * countdown badge — correctly, the legacy render has no such badge — and the two survivors then
     * sprang apart, leaving the rank medal on the left margin and the standing sentence — the
     * viewer's own rank and percentile — stranded against the right.
     * The parity screenshot is what caught it.
     *
     * The repair is to stop distributing and let the body own the spare width: the mark leads, the
     * sentence sits against it, and an optional fact still lands at the trailing edge because a
     * growing body pushes it there. That also means the row no longer changes its own reading order
     * depending on whether an optional slot happens to be filled.
     *
     * TARGET: CONTRACTS["leaderboard-standing-row"].classes
     *   remove: "justify-between"
     *      add: "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"
     */
    "leaderboard-standing-row": {
        classes: ["flex", "flex-row", "items-center", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow"],
        children: {
            mark: { leaf: "rank-mark", props: { placement: "standing" } },
            body: { contract: "evidence-title-over-subtitle" },
            fact: { leaf: "badge", optional: true },
        },
        why: "The rank artwork fixes the viewer's current place and the standing sentence sits directly against it, because the two are one statement; the body owns the spare width so an optional tier fact still settles at the far edge without the sentence drifting there when no fact exists.",
    },
    "ranked-user-ellipsis-row": {
        classes: ["flex", "flex-row", "items-center", "justify-center", "gap-2", "py-2"],
        children: {
            label: { leaf: "text", props: { size: "xs", tone: "muted" } },
        },
        why: "A pinned self row far below the fetched slice must announce the gap, because placing it directly under the last row asserts an adjacency that is false.",
    },
} as const satisfies Readonly<Record<string, ProposedContractSpec>>

/**
 * The `action` slot of every ranked row must additionally admit the movement caret.
 *
 * Target paths (three sibling entries, identical delta):
 *   CONTRACTS["ranked-user-row"].children.action.leaf
 *   CONTRACTS["ranked-user-row-success-verdict"].children.action.leaf
 *   CONTRACTS["ranked-user-row-danger-verdict"].children.action.leaf
 *
 * from: ["badge", "button"]
 *   to: ["badge", "button", "rank-delta-caret"]
 */
export const RANKED_ROW_ACTION_LEAVES = ["badge", "button", "rank-delta-caret"] as const

/**
 * Locked target registry merged with the proposal, for the candidate shim only.
 *
 * No cast is involved and none is needed: `ProposedLayoutClassName` is a WIDENING of
 * `LayoutClassName`, so a locked entry already satisfies `ProposedContractSpec` and the annotation
 * below keeps checking every merged entry — including anything the target registry changes later.
 */
export const CANDIDATE_CONTRACTS: Readonly<Record<string, ProposedContractSpec>> = {
    ...CONTRACTS,
    ...PROPOSED_CONTRACTS,
}
