import { useId } from "react"
import { StateMark } from "../../StateMark.js"
import { assertPresentationState, treatmentFor, type PresentationState } from "../../state.js"

export type SurfaceListItem = {
    readonly id: string
    readonly label: string
    readonly description?: string
    readonly state?: PresentationState
}

type LabelledSurfaceList = {
    readonly label: string
    readonly ariaLabel?: string
}

type SelfNamedSurfaceList = {
    readonly label?: undefined
    readonly ariaLabel: string
}

export type SurfaceListCardProps = (LabelledSurfaceList | SelfNamedSurfaceList) & {
    readonly items: ReadonlyArray<SurfaceListItem>
    readonly fact?: string
    readonly depth?: "top" | "nested"
    readonly emptyLabel?: string
}

export const SurfaceListCard = ({
    label,
    ariaLabel,
    items,
    fact,
    depth = "top",
    emptyLabel = "No items",
}: SurfaceListCardProps) => {
    const headingId = useId()
    for (const item of items) assertPresentationState(item.state ?? "neutral")

    return (
        <section className="starci-core-surface-list" data-grammar-surface-list="true">
            {label === undefined ? null : (
                <div className="starci-core-surface-label" data-grammar-surface-label="true">
                    <h3 id={headingId}>{label}</h3>
                    {fact === undefined ? null : <span>{fact}</span>}
                </div>
            )}
            <div
                aria-label={label === undefined ? ariaLabel : undefined}
                aria-labelledby={label === undefined ? undefined : headingId}
                className="starci-core-surface starci-core-list-shell"
                data-grammar-surface="true"
                data-grammar-surface-depth={depth}
            >
                {items.length === 0 ? (
                    <p className="starci-core-empty-row" data-grammar-state="neutral">{emptyLabel}</p>
                ) : (
                    <ul className="starci-core-static-list" data-grammar-list="true">
                        {items.map((item) => {
                            const state = item.state ?? "neutral"
                            const treatment = treatmentFor(state)
                            return (
                                <li
                                    className="starci-core-static-row"
                                    data-grammar-row="true"
                                    data-grammar-state={state}
                                    data-grammar-treatment={treatment.tone}
                                    key={item.id}
                                >
                                    <StateMark state={state} />
                                    <span className="starci-core-static-row-copy">
                                        <span>{item.label}</span>
                                        {item.description === undefined ? null : <span>{item.description}</span>}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </section>
    )
}

export const meta = { shape: "branch", grammar: "core", contract: "core.branch.surface-list-card" } as const
