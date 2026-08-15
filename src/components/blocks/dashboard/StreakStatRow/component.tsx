import { StatRow } from "@/components/composites/StatRow"

/** Props for the pure streak row, discriminated at the connected boundary. */
export type StreakStatRowProps =
    | { readonly state: "empty" }
    | { readonly state: "pending"; readonly props: { readonly label: string } }
    | {
        readonly state: "settled"
        readonly props: { readonly label: string; readonly value: string }
    }

/** Render the streak row without reading request or locale state. */
export const _StreakStatRow = (input: StreakStatRowProps) => input.state === "empty" ? null : (
    <StatRow
        hierarchy="peer"
        props={{
            icon: "streak",
            label: input.props.label,
            value: input.state === "settled" ? input.props.value : undefined,
        }}
        isLoading={input.state === "pending"}
    />
)

/** Source-level tier marker for the presentational block half. */
export const meta = { world: "pure", domain: "identity" } as const
