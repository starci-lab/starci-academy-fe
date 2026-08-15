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
export const _CreditStatRow = (input: CreditStatRowProps) => input.state === "empty" ? null : (
    <IconLabelFactRow
        props={{
            icon: "credit",
            label: input.props.label,
            endText: input.state === "settled" ? input.props.value : undefined,
            recipe: "peer",
        }}
        isLoading={input.state === "pending"}
    />
)

/** Source-level tier marker for the presentational block half. */
export const meta = { world: "pure", domain: "identity" } as const
