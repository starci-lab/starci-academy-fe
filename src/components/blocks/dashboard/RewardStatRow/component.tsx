import { IconLabelFactRow } from "@/components/composites/IconLabelFactRow"

/** Props for the pure reward row, discriminated at the connected boundary. */
export type RewardStatRowProps =
    | { readonly state: "empty" }
    | { readonly state: "pending"; readonly props: { readonly label: string } }
    | {
        readonly state: "settled"
        readonly props: { readonly label: string; readonly value: string }
    }

/** Render the reward row without reading request or locale state. */
export const RewardStatRowBase = (props: RewardStatRowProps) => props.state === "empty" ? null : (
    <IconLabelFactRow
        props={{
            icon: "reward",
            label: props.props.label,
            endText: props.state === "settled" ? props.props.value : undefined,
            recipe: "peer",
        }}
        isLoading={props.state === "pending"}
    />
)
