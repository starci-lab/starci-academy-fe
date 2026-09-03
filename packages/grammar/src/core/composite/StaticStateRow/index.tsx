import { StateMark } from "../../StateMark.js"
import { treatmentFor, type PresentationState } from "../../state.js"
import { staticRowClassName, staticRowCopyClassName } from "../../classNames.js"

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
export const StaticStateRow = (props: StaticStateRowProps) => {
    const item = props.item
    const state = item.state ?? "neutral"
    const treatment = treatmentFor(state)

    return (
        <li
            className={staticRowClassName}
            data-grammar-row="true"
            data-grammar-state={state}
            data-grammar-treatment={treatment.tone}
            data-contract="GAP-3 PADDING-4 BOUNDARY-3"
        >
            <StateMark state={state} />
            <span className={staticRowCopyClassName} data-contract="GAP-1">
                <span>{item.label}</span>
                {item.description === undefined ? null : <span>{item.description}</span>}
            </span>
        </li>
    )
}
