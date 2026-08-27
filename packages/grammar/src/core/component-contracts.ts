import type { ComponentType, ReactNode } from "react"

/** JSON-compatible component data. Functions travel through the separate actions lane. */
export type DataValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | ReadonlyArray<DataValue>
    | { readonly [key: string]: DataValue }

export type ComponentData = { readonly [key: string]: DataValue }
export type ComponentActions = { readonly [key: string]: ((...args: Array<never>) => void) | undefined }
export type ContractPropValue = string | number | boolean | null

/** Closed component props: data, actions and loading state; never caller-owned markup or classes. */
export type LeafProps<D extends ComponentData, A extends ComponentActions = ComponentActions> = {
    readonly props: D
    readonly on?: A
    readonly isLoading?: boolean
}

export type CompositeProps<D extends ComponentData, A extends ComponentActions = ComponentActions> = {
    readonly props: D
    readonly on?: A
    readonly isLoading?: boolean
}

export type BlockProps<S extends string, D extends ComponentData> = {
    readonly state: S
    readonly props: D
}

export type LeafComponentMeta<N extends string, P extends Readonly<Record<string, ContractPropValue>>> = {
    readonly shape: "leaf"
    readonly name: N
    readonly props: P
}

export type LeafComponent<N extends string, P extends Readonly<Record<string, ContractPropValue>>> = {
    (): ReactNode
    readonly meta: LeafComponentMeta<N, P>
}

export const defineLeafComponent = <
    const N extends string,
    const P extends Readonly<Record<string, ContractPropValue>>,
>(name: N, props: P, render: () => ReactNode): LeafComponent<N, P> => Object.assign(render, {
        meta: { shape: "leaf", name, props } as const,
    })

export type CompositeComponentMeta<N extends string, P extends Readonly<Record<string, ContractPropValue>>> = {
    readonly shape: "composite"
    readonly name: N
    readonly props: P
}

export type CompositeComponent<N extends string, P extends Readonly<Record<string, ContractPropValue>>> = {
    (): ReactNode
    readonly meta: CompositeComponentMeta<N, P>
}

export const defineCompositeComponent = <
    const N extends string,
    const P extends Readonly<Record<string, ContractPropValue>>,
>(name: N, props: P, render: () => ReactNode): CompositeComponent<N, P> => Object.assign(render, {
        meta: { shape: "composite", name, props } as const,
    })

export type ContractComponentMeta<K extends string> = {
    readonly shape: "contract"
    readonly contract: K
}

export type ContractSlots<K extends string, S> = {
    readonly kind: "slots"
    readonly meta: ContractComponentMeta<K>
    readonly slots: S
}

export type ContractProjection<K extends string> = {
    readonly kind: "projection"
    readonly meta: ContractComponentMeta<K>
    readonly project: () => ReactNode
}

export type ContractRenderComponent<K extends string, P> = ComponentType<P> & {
    readonly kind: "component"
    readonly meta: ContractComponentMeta<K>
}

export type DefinedContractComponent<K extends string, I> =
    I extends ComponentType<infer P> ? ContractRenderComponent<K, P> : ContractSlots<K, I>

export type DefineContractComponent = <const K extends string, const I>(
    contract: K,
    input: I,
) => DefinedContractComponent<K, I>

/** Bind product-defined contract data without making Grammar own the product's key vocabulary. */
export const defineContractComponent = ((contract: string, input: unknown) => {
    if (typeof input === "function") {
        return Object.assign(input, {
            kind: "component" as const,
            meta: { shape: "contract", contract } as const,
        })
    }
    return {
        kind: "slots" as const,
        meta: { shape: "contract", contract } as const,
        slots: input,
    }
}) as DefineContractComponent

export const defineContractProjection = <const K extends string>(
    contract: K,
    render: () => ReactNode,
): ContractProjection<K> => ({
        kind: "projection",
        meta: { shape: "contract", contract } as const,
        project: render,
    })
