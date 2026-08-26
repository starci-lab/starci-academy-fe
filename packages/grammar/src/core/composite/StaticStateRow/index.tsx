import { StateMark } from "../../StateMark.js"
import { treatmentFor, type PresentationState } from "../../state.js"

export type StaticStateRowData = {
    readonly id: string
    readonly label: string
    readonly description?: string
    readonly state?: PresentationState
}

export type StaticStateRowProps = {
    readonly item: StaticStateRowData
}

/** One non-interactive, product-neutral row in a Core-owned static collection. */
export const StaticStateRow = ({ item }: StaticStateRowProps) => {
    const state = item.state ?? "neutral"
    const treatment = treatmentFor(state)

    return (
        <li
            className="starci-core-static-row"
            data-grammar-row="true"
            data-grammar-state={state}
            data-grammar-treatment={treatment.tone}
        >
            <StateMark state={state} />
            <span className="starci-core-static-row-copy">
                <span>{item.label}</span>
                {item.description === undefined ? null : <span>{item.description}</span>}
            </span>
        </li>
    )
}

export const meta = { shape: "composite", grammar: "core" } as const
