import type { ReactNode } from "react"
import type { ChildrenOf, ContractKey, ContractPropValue } from "@/components/contracts"

/**
 * THE SLOT SHAPES, as types rather than as a convention.
 *
 * Every component below a block takes a FIXED set of named slots and no others. Written as a type
 * alias per tier, a fourth slot is not discouraged - it does not compile, because the alias is the
 * whole shape and there is nowhere to put one.
 *
 * This is the difference between a rule and a fence. `interface XProps { props: XData; isLoading?: boolean }`
 * is a rule: correct today, and one `extends` away from carrying a `className` next month.
 * `type XProps = LeafProps<XData>` is a fence.
 */

/**
 * What DATA is: anything a JSON document could hold.
 *
 * A function does not satisfy it, and that is the only thing stopping a component being smuggled
 * through `props` - which is why handlers travel in their own slot rather than beside the data.
 *
 * NOTE FOR AUTHORS: a leaf's data must be declared with `type`, not `interface`. TypeScript gives
 * an implicit index signature to a type alias and not to an interface, so an interface silently
 * fails this constraint. That is not a quirk to work around - it is the constraint doing its job.
 */
export type DataValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | ReadonlyArray<DataValue>
    | { readonly [key: string]: DataValue }

/** The shape any leaf's or branch's data must have: data all the way down. */
export type ComponentData = { readonly [key: string]: DataValue }

/** The shape any component's handlers must have: functions, kept apart from the data. */
export type ComponentActions = { readonly [key: string]: ((...args: Array<never>) => void) | undefined }

/**
 * A LEAF's props. Three slots, no fourth.
 *
 * `props` - what it draws. `on` - what it does. `isLoading` - handed down, never decided here.
 * No `children`: only a branch assembles. No `className`: a caller who can restyle a node has
 * become its second owner.
 */
export type LeafProps<D extends ComponentData, A extends ComponentActions = ComponentActions> = {
    readonly props: D
    readonly on?: A
    readonly isLoading?: boolean
}

/** Source identity carried by a leaf implementation, separate from its runtime data. */
export type LeafComponentMeta<N extends string, P extends Readonly<Record<string, ContractPropValue>>> = {
    readonly shape: "leaf"
    readonly name: N
    readonly props: P
}

/** A closed leaf render whose identity and contract-relevant literals survive import boundaries. */
export type LeafComponent<N extends string, P extends Readonly<Record<string, ContractPropValue>>> = {
    (): ReactNode
    readonly meta: LeafComponentMeta<N, P>
}

/** Close runtime data over one leaf while exposing only the literals the contract constrains. */
export const defineLeafComponent = <
    const N extends string,
    const P extends Readonly<Record<string, ContractPropValue>>,
>(
        name: N,
        props: P,
        render: () => ReactNode,
    ): LeafComponent<N, P> => Object.assign(render, {
        meta: { shape: "leaf", name, props } as const,
    })

/** Source identity carried by every contract value admitted by a contract branch. */
export type ContractComponentMeta<K extends ContractKey> = {
    readonly shape: "contract"
    readonly contract: K
}

/** A checked slot record. It carries content; it is deliberately not callable. */
export type ContractSlots<K extends ContractKey> = {
    readonly kind: "slots"
    readonly meta: ContractComponentMeta<K>
    readonly slots: ChildrenOf<K>
}

/** A branch-owned projection that has already drawn the host a contract cannot express. */
export type ContractProjection<K extends ContractKey> = {
    readonly kind: "projection"
    readonly meta: ContractComponentMeta<K>
    readonly project: () => ReactNode
}

/** Checked contract content, either as named slots or as one branch-owned projection. */
export type ContractComponent<K extends ContractKey> = ContractSlots<K> | ContractProjection<K>

/**
 * Bind one exact named slot record to the contract whose child grammar it implements.
 *
 * `ChildrenOf<K>` makes missing, extra, repeated, wrong-identity and wrong-literal slots fail at
 * the builder call; the returned content preserves the key and record across branch boundaries.
 */
export const defineContractComponent = <const K extends ContractKey>(
    contract: K,
    slots: ChildrenOf<K>,
): ContractSlots<K> => ({
        kind: "slots",
        meta: { shape: "contract", contract } as const,
        slots,
    })

/** Brand the complete node produced by a branch that owns wrappers a contract cannot express. */
export const defineContractProjection = <const K extends ContractKey>(
    contract: K,
    render: () => ReactNode,
): ContractProjection<K> => ({
        kind: "projection",
        meta: { shape: "contract", contract } as const,
        project: render,
    })

/** A branch that projects one typed contract component into its own wrapper mechanics. */
export type ContractBranchProps<K extends ContractKey> = {
    readonly contract: K
    readonly render: ContractComponent<NoInfer<K>>
    readonly isLoading?: boolean
}

/**
 * A BLOCK's presentational half. Two slots.
 *
 * `state` is the business situation and it picks a tree; `props` is what that tree says. There is
 * no `isLoading` here - a block writes the flag when it hands a tree down, and never receives one.
 * The type is a union per state at the call site, so the data of a situation a surface is NOT in
 * cannot be passed and the data of the one it IS in cannot be omitted.
 */
export type BlockProps<S extends string, D extends ComponentData> = {
    readonly state: S
    readonly props: D
}
