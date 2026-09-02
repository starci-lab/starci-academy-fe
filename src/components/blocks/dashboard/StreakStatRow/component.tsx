import { IconLabelFactRow } from "@/components/composites/IconLabelFactRow"
import { streakStatRowClassName } from "./classNames"

/** Props for the pure streak row, discriminated at the connected boundary. */
export type StreakStatRowProps =
    | { readonly state: "empty" }
    | { readonly state: "pending"; readonly props: { readonly label: string } }
    | {
        readonly state: "settled"
        readonly props: { readonly label: string; readonly value: string }
    }

/** Render the streak row without reading request or locale state. */
export const StreakStatRowBase = (props: StreakStatRowProps) => props.state === "empty" ? null : (
    <div className={streakStatRowClassName} data-part="identity-rail-stat-row">
        <IconLabelFactRow
            props={{
                icon: "streak",
                label: props.props.label,
                endText: props.state === "settled" ? props.props.value : undefined,
                recipe: "peer",
            }}
            isLoading={props.state === "pending"}
        />
    </div>
)
