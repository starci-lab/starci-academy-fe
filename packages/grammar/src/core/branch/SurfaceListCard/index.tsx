import { useId, type ReactNode } from "react"
import { StaticStateRow, type StaticStateRowData } from "../../composite/StaticStateRow/index.js"
import { assertPresentationState } from "../../state.js"

export type SurfaceListItem = StaticStateRowData

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
}

type StaticSurfaceListProps = {
    readonly items: ReadonlyArray<SurfaceListItem>
    readonly emptyLabel?: string
    readonly children?: never
    readonly rowMode?: "static"
}

type ContentOwnedSurfaceListProps = {
    readonly children: ReactNode
    readonly rowMode: "interactive"
    readonly items?: never
    readonly emptyLabel?: never
}

export type SurfaceListCardProps = SurfaceListFrameProps & (StaticSurfaceListProps | ContentOwnedSurfaceListProps)

export const SurfaceListCard = ({
    label,
    ariaLabel,
    items,
    children,
    fact,
    labelEnd,
    labelHidden = false,
    footer,
    depth = "top",
    emptyLabel = "No items",
    rowMode = "static",
}: SurfaceListCardProps) => {
    const headingId = useId()
    for (const item of items ?? []) assertPresentationState(item.state ?? "neutral")
    const accessibleName = ariaLabel ?? label
    const collection = rowMode === "interactive" ? (
        <div className="starci-core-owned-collection" data-grammar-list="true" data-grammar-list-mode="interactive">
            {children}
        </div>
    ) : items?.length === 0 ? (
        <p className="starci-core-empty-row" data-grammar-state="neutral">{emptyLabel}</p>
    ) : (
        <ul className="starci-core-static-list" data-grammar-list="true" data-grammar-list-mode="static">
            {(items ?? []).map((item) => <StaticStateRow key={item.id} item={item} />)}
        </ul>
    )

    return (
        <section
            className="starci-core-surface-list"
            data-grammar-contract="core.surface-list-card"
            data-grammar-label-visibility={labelHidden ? "hidden" : "visible"}
            data-grammar-list-mode={rowMode}
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
                data-grammar-surface="true"
                data-grammar-surface-depth={depth}
            >
                {collection}
            </div>
            {footer === undefined ? null : (
                <div className="starci-core-surface-footer" data-grammar-surface-footer="true">{footer}</div>
            )}
        </section>
    )
}

export const meta = { shape: "branch", grammar: "core", contract: "core.branch.surface-list-card" } as const
