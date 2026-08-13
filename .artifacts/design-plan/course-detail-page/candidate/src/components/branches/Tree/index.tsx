import { Fragment, type ReactNode } from "react"
import { contractNodeProps, contractSpec, type ContractKey } from "~candidate/components/contracts"

/**
 * BRANCH - `Tree`: the smallest branch there is. It draws ONE registry node.
 *
 * Target path: none. This file is not ported. It is the locked `Tree` bound to the candidate's own
 * registry, which is the only reason it exists: `ContractKey` is closed over the table on disk, so
 * the real branch cannot be handed a key that has not been merged yet.
 *
 * IT IS DELIBERATELY THE SAME SHAPE, not a convenience. An earlier attempt drew proposed nodes
 * through a branch that took `children`, which reads as a small scaffolding liberty and is not one:
 * `children` is an untyped hole belonging only to the shells whose purpose is to ignore their
 * interior. Once the proposed entries are merged, every call site here becomes a call to the real
 * `Tree` with no other edit, because the props are the props.
 *
 * IT OWNS NO CLASS OF ITS OWN. Every class on the rendered node comes from the registry entry.
 */

/** One bound contract node: an identity plus the ordered content that satisfies it. */
export interface ContractSlots {
    /** Distinguishes a bound node from a branch-owned projection. */
    readonly kind: "slots"
    /** The registry key this content satisfies. */
    readonly contract: ContractKey
    /** The content, in the order the entry declares its children. */
    readonly slots: ReadonlyArray<ReactNode>
}

/**
 * Bind ordered content to an exact contract identity.
 *
 * @param contract - The registry key.
 * @param slots - The content, in the order the entry declares its children.
 */
export const defineContract = (contract: ContractKey, slots: ReadonlyArray<ReactNode>): ContractSlots => ({
    kind: "slots",
    contract,
    slots,
})

/** Props for {@link Tree}. */
export interface TreeProps {
    /**
     * The registry key. This is the ONLY layout decision an author makes: it fixes the node's
     * classes and, through the key's own name, what belongs inside it.
     */
    readonly contract: ContractKey
    /** Content whose identity satisfies this exact contract. */
    readonly render: ContractSlots
}

/**
 * Draw one registry node.
 *
 * @param input - {@link TreeProps}
 */
export const Tree = (input: TreeProps) => {
    // A key drawn with content bound to a different key is the one mistake this branch can still
    // make, and it is silent: the node wears one entry's classes while holding another's children.
    if (input.render.contract !== input.contract) {
        throw new Error(`Tree drew "${input.contract}" with content bound to "${input.render.contract}"`)
    }
    const spec = contractSpec(input.contract)
    const declared = Object.keys(spec.children).length
    return (
        <div data-component="Tree" data-slots={declared} {...contractNodeProps(input.contract)}>
            {input.render.slots.map((slot, index) => (
                <Fragment key={`${input.contract}-${index}`}>{slot}</Fragment>
            ))}
        </div>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", world: "pure" } as const
