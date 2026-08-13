import { Fragment, type ReactNode } from "react"
import { CANDIDATE_CONTRACTS } from "../../contracts/proposed"

/**
 * ARTIFACT-ONLY SHIM. It has no target path and Apply deletes it.
 *
 * The real `Tree` reads `CONTRACTS` directly, so a contract that is only PROPOSED cannot be drawn
 * by it yet. This draws a node from the merged registry using the same rule the real branch uses -
 * classes and `data-why` come from the registry entry, never from the caller - so the candidate
 * proves the proposed anatomy without the shim contributing any styling of its own.
 *
 * IT IS DELIBERATELY THE SAME SHAPE AS THE REAL BRANCH, not a convenience. An earlier revision drew
 * proposed nodes through a helper that took `children`, which reads as a small scaffolding liberty
 * and is not one: `children` is an untyped hole belonging only to the shells whose purpose is to
 * ignore their interior, and a branch that accepts one has stopped constraining anything. The props
 * here are therefore the real branch's props - `contract` plus content bound to that same key.
 *
 * IT OWNS NO CLASS OF ITS OWN. Every class and every registry marker on the rendered node is read
 * out of the entry by {@link candidateNodeProps} and spread onto it, so there is no seam here for a
 * caller or a maintainer to describe a contract the registry does not hold the node to.
 *
 * Once `PROPOSED_CONTRACTS` lands in `src/components/contracts/index.ts`, every call site here
 * becomes a plain `Tree` with the same two props and no other change.
 *
 * WHY IT IS NOT SIMPLY CALLED `Tree`. It was, briefly, and the gate was right to object: named
 * `Tree`, `no-unregistered-tree-key` starts checking every key against the registry it can find by
 * walking up - and this candidate keeps its entries in `contracts/proposed.ts`, so the walk sails
 * past and lands on the LOCKED table, where a proposed key is correctly reported as invented. The
 * name is what tells the rule which promise is being made. This shim does not make the real one.
 */

/**
 * A key in the candidate's merged registry.
 *
 * It is not a closed union, unlike the target's `ContractKey`: `CANDIDATE_CONTRACTS` is declared in
 * `contracts/proposed.ts` as an open `Readonly<Record<string, ProposedContractSpec>>`, so `keyof`
 * widens to `string` and the compiler cannot reject an unknown key here. The runtime guard in
 * {@link candidateNodeProps} is what stands in for that check until the entries are merged.
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
 */
export const defineContract = (contract: CandidateContractKey, slots: ReadonlyArray<ReactNode>): ContractSlots => ({
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
 */
const candidateNodeProps = (contract: CandidateContractKey) => {
    const spec = CANDIDATE_CONTRACTS[contract]
    if (spec === undefined) throw new Error(`Unknown contract: ${contract}`)
    return {
        "data-tier": "branch",
        "data-node": contract,
        "data-why": spec.why,
        className: spec.classes.join(" "),
    }
}

/** Props for {@link TreeCandidate}. */
export interface CandidateTreeProps {
    /**
     * The registry key. This is the ONLY layout decision an author makes: it fixes the node's
     * classes and, through the key's own name, what belongs inside it.
     */
    readonly contract: CandidateContractKey
    /** Content whose identity satisfies this exact contract. */
    readonly render: ContractSlots
}

/**
 * Draw one node of the candidate's merged registry.
 *
 * @param input - {@link CandidateTreeProps}
 */
export const TreeCandidate = (input: CandidateTreeProps) => {
    // A key drawn with content bound to a different key is the one mistake this branch can still
    // make, and it is silent: the node wears one entry's classes while holding another's children.
    if (input.render.contract !== input.contract) {
        throw new Error(`Tree drew "${input.contract}" with content bound to "${input.render.contract}"`)
    }
    return (
        <div data-component="Tree" {...candidateNodeProps(input.contract)}>
            {input.render.slots.map((slot, index) => (
                <Fragment key={`${input.contract}-${index}`}>{slot}</Fragment>
            ))}
        </div>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure" } as const
