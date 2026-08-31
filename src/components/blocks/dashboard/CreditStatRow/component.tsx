import { dashboardRailRowItemClassName } from "@/components/blocks/dashboard/classNames"
import { IconLabelFactRow } from "@/components/composites/IconLabelFactRow"

/** Props for the pure credit row, discriminated at the connected boundary. */
export type CreditStatRowProps =
    | { readonly state: "empty" }
    | { readonly state: "pending"; readonly props: { readonly label: string } }
    | {
        readonly state: "settled"
        readonly props: { readonly label: string; readonly value: string }
    }

/** Render the credit row without reading request or locale state. */
export const CreditStatRowBase = (props: CreditStatRowProps) => props.state === "empty" ? null : (
    <div className={dashboardRailRowItemClassName} data-part="identity-rail-stat-row">
        <IconLabelFactRow
            props={{
                icon: "credit",
                label: props.props.label,
                endText: props.state === "settled" ? props.props.value : undefined,
                recipe: "peer",
            }}
            isLoading={props.state === "pending"}
        />
    </div>
)
