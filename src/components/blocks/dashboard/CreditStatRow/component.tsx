import { StatRow } from "@/components/leaves/StatRow"

/** Props for the pure credit row, discriminated at the connected boundary. */
export type CreditStatRowProps =
    | { readonly state: "pending"; readonly props: { readonly label: string } }
    | {
        readonly state: "settled"
        readonly props: { readonly label: string; readonly value: string }
    }

/** Render the credit row without reading request or locale state. */
export const _CreditStatRow = (input: CreditStatRowProps) => (
    <StatRow
        props={{
            icon: "credit",
            label: input.props.label,
            value: input.state === "settled" ? input.props.value : undefined,
        }}
        isLoading={input.state === "pending"}
    />
)

/** Source-level tier marker for the presentational block half. */
export const meta = { world: "pure", domain: "identity" } as const

