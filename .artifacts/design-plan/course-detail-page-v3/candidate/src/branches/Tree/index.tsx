import { Fragment, createElement, type ReactNode } from "react"
import { CANDIDATE_CONTRACTS } from "../../contracts/proposed"

/**
 * ARTIFACT-ONLY SHIM. It has no target path and Apply deletes it.
 *
 * The real `Tree` reads `CONTRACTS` directly, so a contract that is only PROPOSED cannot be drawn
 * by it yet. This draws a node from the merged registry using the same rule the real branch uses:
 * classes, host and `data-why` come from the registry entry, never from the caller, so the
 * candidate proves the proposed anatomy without the shim contributing any styling of its own.
 *
 * IT HONOURS `host`, unlike an earlier candidate's shim which always emitted a `div`. That was
 * harmless there and would be fatal here: the whole reason `course-prerequisite-list` is a separate
 * entry from `course-promise-list` is that it is an `ol`, and a shim that flattened both to `div`
 * would render the two indistinguishably and let the review approve a semantic that the candidate
 * never actually produced.
 *
 * WHY IT IS NOT SIMPLY CALLED `Tree`. Named `Tree`, `no-unregistered-tree-key` starts checking
 * every key against the registry it finds by walking up - and this candidate keeps its entries in
 * `contracts/proposed.ts`, so the walk sails past to the LOCKED table, where a proposed key is
 * correctly reported as invented. The name is what tells the rule which promise is being made.
 *
 * Once `PROPOSED_CONTRACTS` lands in `src/components/contracts/index.ts`, every call site here
 * becomes a plain `Tree` with the same two props and no other change.
 */

/**
 * A key in the candidate's merged registry.
 *
 * Not a closed union, unlike the target's `ContractKey`: the merged record is typed by `string`, so
 * the compiler cannot reject an unknown key here. The runtime guard in {@link candidateNodeProps}
 * stands in for that check until the entries are merged.
 */
export type CandidateContractKey = string

/** One bound contract node: an identity plus the ordered content that satisfies it. */
export interface ContractSlots {
    /** Distinguishes a bound node from a branch-owned projection. */
    readonly kind: "slots"
    /** The registry key this content satisfies. */
    readonly contract: CandidateContractKey
    /** The content, in the order the entry declares its children. */
    readonly slots: ReadonlyArray<ReactNode>
}

/**
 * Bind ordered content to an exact contract identity.
 *
 * @param contract - The registry key.
 * @param slots - The content, in the order the entry declares its children.
 * @returns The bound node, ready to hand to {@link TreeCandidate}.
 */
export const defineContract = (
    contract: CandidateContractKey,
    slots: ReadonlyArray<ReactNode>,
): ContractSlots => ({
    kind: "slots",
    contract,
    slots,
})

/**
 * Resolve one entry into the props the rendered node carries.
 *
 * Mirrors the target's `contractNodeProps`: the markers and the class list are READ OUT of the
 * entry, never written next to it, which is the difference between a node the registry owns and a
 * node that merely claims to be owned.
 *
 * @param contract - The registry key to draw.
 * @returns The DOM props for that node.
 */
const candidateNodeProps = (contract: CandidateContractKey) => {
    const spec = CANDIDATE_CONTRACTS[contract]
    if (spec === undefined) throw new Error(`Unknown contract: ${contract}`)
    return {
        "data-component": "Tree",
        "data-tier": "branch",
        "data-node": contract,
        "data-why": spec.why,
        className: spec.classes.join(" "),
    }
}

/**
 * The element an entry asks to be drawn as.
 *
 * @param contract - The registry key to draw.
 * @returns The host tag, defaulting to `div` exactly as the real frame does.
 */
const candidateHost = (contract: CandidateContractKey): string => {
    const spec = CANDIDATE_CONTRACTS[contract]
    return typeof spec?.host === "string" ? spec.host : "div"
}

/** Props for {@link TreeCandidate}. */
export interface CandidateTreeProps {
    /**
     * The registry key. This is the ONLY layout decision an author makes: it fixes the node's
     * classes, its host and, through the key's own name, what belongs inside it.
     */
    readonly contract: CandidateContractKey
    /** Content whose identity satisfies this exact contract. */
    readonly render: ContractSlots
}

/**
 * Draw one node of the candidate's merged registry.
 *
 * @param input - {@link CandidateTreeProps}
 * @returns The rendered node.
 */
export const TreeCandidate = (input: CandidateTreeProps) => {
    // A key drawn with content bound to a different key is the one mistake this branch can still
    // make, and it is silent: the node wears one entry's classes while holding another's children.
    if (input.render.contract !== input.contract) {
        throw new Error(`Tree drew "${input.contract}" with content bound to "${input.render.contract}"`)
    }
    return createElement(
        candidateHost(input.contract),
        candidateNodeProps(input.contract),
        input.render.slots.map((slot, index) => (
            <Fragment key={`${input.contract}-${index}`}>{slot}</Fragment>
        )),
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure" } as const
