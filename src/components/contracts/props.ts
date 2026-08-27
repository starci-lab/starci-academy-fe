import {
    defineCompositeComponent,
    defineContractComponent as defineGrammarContractComponent,
    defineContractProjection as defineGrammarContractProjection,
    defineLeafComponent,
    type BlockProps,
    type ComponentActions,
    type ComponentData,
    type CompositeComponent,
    type CompositeComponentMeta,
    type CompositeProps,
    type ContractComponentMeta as GrammarContractComponentMeta,
    type ContractProjection as GrammarContractProjection,
    type ContractRenderComponent as GrammarContractRenderComponent,
    type ContractSlots as GrammarContractSlots,
    type DataValue,
    type LeafComponent,
    type LeafComponentMeta,
    type LeafProps,
} from "@starci/grammar/core"
import type { ComponentType } from "react"
import type { ChildrenOf, ContractKey } from "@/components/contracts"

/**
 * StarCi Academy compatibility binding.
 *
 * Grammar owns the business-neutral data lanes, component builders and runtime branding. This file
 * only narrows contract builders to the application's own `ContractKey -> ChildrenOf<K>` registry
 * while existing consumers migrate to direct Grammar imports.
 */

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
 * NOTE FOR AUTHORS: a leaf's or composite's data must be declared with `type`, not `interface`. TypeScript gives
 * an implicit index signature to a type alias and not to an interface, so an interface silently
 * fails this constraint. That is not a quirk to work around - it is the constraint doing its job.
 */
export type { BlockProps, ComponentActions, ComponentData, CompositeProps, DataValue, LeafProps }

/**
 * A LEAF's props. Three slots, no fourth.
 *
 * `props` - what it draws. `on` - what it does. `isLoading` - handed down, never decided here.
 * No `children`: only a branch assembles. No `className`: a caller who can restyle a node has
 * become its second owner.
 */
/** Source identity carried by a leaf implementation, separate from its runtime data. */
export type { LeafComponent, LeafComponentMeta }

/** A closed leaf render whose identity and contract-relevant literals survive import boundaries. */
/** Close runtime data over one leaf while exposing only the literals the contract constrains. */
export { defineLeafComponent }

/**
 * A COMPOSITE's props. The runtime lanes match a leaf, but the type is intentionally distinct:
 * a composite fixes an arrangement of independently meaningful leaves rather than one intrinsic
 * value or control. Closed does not mean freehand: its arrangement is still rendered through a
 * typed Tree contract, never through raw structural markup. If a caller may supply the content,
 * the component is a branch rather than a composite.
 */
/** Source identity carried by a reusable fixed composition. */
export type { CompositeComponent, CompositeComponentMeta }

/** A closed composite render whose identity survives import boundaries. */
/** Close runtime data over one composite while exposing contract-relevant literals. */
export { defineCompositeComponent }

/** Source identity carried by every contract value admitted by a contract branch. */
export type ContractComponentMeta<K extends ContractKey> = GrammarContractComponentMeta<K>

/** A checked slot record. It carries content; it is deliberately not callable. */
export type ContractSlots<K extends ContractKey> = GrammarContractSlots<K, ChildrenOf<K>>

/** A branch-owned projection that has already drawn the host a contract cannot express. */
export type ContractProjection<K extends ContractKey> = GrammarContractProjection<K>

/** A real component type whose runtime input remains separate from its contract identity. */
export type ContractRenderComponent<K extends ContractKey, P> = GrammarContractRenderComponent<K, P>

/** Checked bound content used by Tree and aggregate contract projections. */
export type BoundContractComponent<K extends ContractKey> = ContractSlots<K> | ContractProjection<K>

/**
 * One contract identity with either bound slots or a real component input.
 *
 * Omitting `P` selects the bound lane used by Tree. Supplying `P` selects the component-type lane
 * used by a host that passes runtime `props` without closing them into slot callbacks.
 */
export type ContractComponent<
    K extends ContractKey,
    P = undefined,
> = [P] extends [undefined]
    ? BoundContractComponent<K>
    : ContractRenderComponent<K, P>

/** The two supported builder calls: checked bound slots, or a real component type. */
type DefineContractComponent = {
    <const K extends ContractKey>(contract: K, slots: ChildrenOf<K>): ContractSlots<K>
    <
        const K extends ContractKey,
        P,
    >(
        contract: K,
        render: ComponentType<P>,
    ): ContractRenderComponent<K, P>
}

/**
 * Bind either checked named slots or one real component type to an exact contract identity.
 *
 * The component overload keeps runtime `props` outside the contract metadata. A host can therefore
 * pass changing data into a stable component type without rebuilding a forest of closed callbacks.
 */
export const defineContractComponent = defineGrammarContractComponent as DefineContractComponent

/** Brand the complete node produced by a branch that owns wrappers a contract cannot express. */
export const defineContractProjection = defineGrammarContractProjection as <const K extends ContractKey>(
    contract: K,
    render: () => ReturnType<GrammarContractProjection<K>["project"]>,
) => ContractProjection<K>

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
