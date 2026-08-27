import { useId, type ReactNode } from "react"
import type { ContractRenderComponent } from "../../component-contracts.js"

type LabelledSurfaceList = {
    readonly label: string
    readonly ariaLabel?: string
}

type SelfNamedSurfaceList = {
    readonly label?: undefined
    readonly ariaLabel: string
}

type SurfaceListFrameProps = (LabelledSurfaceList | SelfNamedSurfaceList) & {
    readonly fact?: string
    readonly labelEnd?: ReactNode
    readonly labelHidden?: boolean
    readonly footer?: ReactNode
    readonly depth?: "top" | "nested"
    readonly isLoading?: boolean
    readonly isVerdict?: boolean
}

type ContractOwnedSurfaceListProps<K extends string, P extends object> = {
    /** The existing contract component is the sole authority for row and cell structure. */
    readonly render: ContractRenderComponent<K, P>
    /** Structured runtime input for that component; never caller-authored row markup. */
    readonly props: P
}

export type SurfaceListCardProps<K extends string, P extends object> = SurfaceListFrameProps & ContractOwnedSurfaceListProps<K, P>

export const SurfaceListCard = <const K extends string, P extends object>({
    label,
    ariaLabel,
    render: Content,
    props,
    fact,
    labelEnd,
    labelHidden = false,
    footer,
    depth = "top",
    isLoading = false,
    isVerdict = false,
}: SurfaceListCardProps<K, P>) => {
    const headingId = useId()
    const accessibleName = ariaLabel ?? label

    return (
        <section
            className="starci-core-surface-list"
            data-component="SurfaceListCard"
            data-grammar-contract="core.surface-list-card"
            data-grammar-label-visibility={labelHidden ? "hidden" : "visible"}
            data-grammar-list-mode="contract"
            data-grammar-surface-list="true"
        >
            {label === undefined || labelHidden ? null : (
                <div className="starci-core-surface-label" data-grammar-surface-label="true">
                    <h3 id={headingId}>{label}</h3>
                    {labelEnd ?? (fact === undefined ? null : <span>{fact}</span>)}
                </div>
            )}
            <div
                aria-label={labelHidden || label === undefined ? accessibleName : undefined}
                aria-labelledby={!labelHidden && label !== undefined ? headingId : undefined}
                className="starci-core-surface starci-core-list-shell"
                data-component="SurfaceListCardSurface"
                data-grammar-surface="true"
                data-grammar-surface-depth={depth}
                data-surface-context={depth === "nested" ? "nested" : "page"}
                data-verdict={String(isVerdict)}
            >
                <div
                    className={isVerdict ? "starci-core-owned-collection rounded-none" : "starci-core-owned-collection"}
                    data-component="SurfaceListCardBody"
                    data-grammar-list="true"
                    data-grammar-list-contract={Content.meta.contract}
                    data-grammar-list-mode="contract"
                    data-loading={String(isLoading)}
                >
                    <Content {...props} />
                </div>
            </div>
            {footer === undefined ? null : (
                <div className="starci-core-surface-footer" data-grammar-surface-footer="true">{footer}</div>
            )}
        </section>
    )
}

export const meta = { shape: "branch", grammar: "core", contract: "core.branch.surface-list-card" } as const
