import { Text } from "@/components/leaves/Text"
import { Tree } from "@/components/branches/Tree"
import {
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "@/components/contracts/props"

/**
 * BLOCK - `OrderSummary`: what this order costs, and what it is made of.
 *
 * Target path: `src/components/blocks/commerce/OrderSummary/component.tsx`.
 *
 * EVERY FIGURE ARRIVES ALREADY FORMATTED AND ALREADY SUMMED. Nothing here adds, subtracts or
 * applies a percentage. `coursesCheckoutPreview` returns the totals and the saving, and the
 * instalment option returns its own total with the markup already in it - the legacy drawer
 * re-declared the bundle tiers as client constants and that is the copy nobody edits when the
 * server's changes.
 *
 * THE SAVING AND THE SURCHARGE ARE OMITTED, NOT ZEROED. An order at list price has saved nothing
 * and an order paid at once carries no surcharge; a line reporting zero of either is a fact nobody
 * asked for, and on the surcharge it would be worse than noise - it would announce a fee on an
 * order that has none.
 *
 * THE TWO TOTALS ARE ONE SLOT, not two. Paying at once and paying over three cycles produce one
 * number the reader owes; which one it is belongs to the caller's choice, not to a second row that
 * would put both on screen and leave the reader to work out which applies to them.
 */

/** The situations the summary can be in. */
export type OrderSummaryState = "pending" | "ready" | "failed"

/** What the summary draws once resolved. */
export type OrderSummaryData = {
    /** Every already-resolved label this block prints. */
    readonly labels: OrderSummaryLabels
    /** The already-formatted sum before any reduction. */
    readonly subtotal?: string
    /** The already-formatted saving. Absent when the order is at list price. */
    readonly savings?: string
    /** The already-formatted instalment surcharge. Absent when paying at once. */
    readonly surcharge?: string
    /** The already-formatted figure the reader owes. */
    readonly total?: string
}

/** The already-resolved copy. */
export type OrderSummaryLabels = {
    /** Names the pre-reduction sum. */
    readonly subtotal: string
    /** Names the saving. */
    readonly savings: string
    /** Names the instalment surcharge, percentage already in the words. */
    readonly surcharge: string
    /** Names the figure owed. */
    readonly total: string
    /** Replaces every figure when the pricing request failed. */
    readonly unavailable: string
}

/** Props for {@link _OrderSummary}. */
export type OrderSummaryProps = BlockProps<OrderSummaryState, OrderSummaryData>

/**
 * Draw the reckoning.
 *
 * @param input - {@link OrderSummaryProps}
 */
export const _OrderSummary = (input: OrderSummaryProps) => {
    const isLoading = input.state === "pending"
    const labels = input.props.labels

    /*
     * A FAILED PRICING REQUEST DOES NOT BLANK THE ROWS, it replaces the figures.
     *
     * The cart list and the checkout preview are two independent requests, so the rows can be real
     * while the totals are unknown - which is exactly the state the plan record names as the one
     * the legacy cart already handles. Resting the figures instead would claim they are still
     * arriving, and they are not.
     */
    const figure = (value?: string): string | undefined =>
        input.state === "failed" ? labels.unavailable : value

    /** One muted component of the total: what it is called, and how much of it there is. */
    const componentRow = (label: string, value?: string) =>
        defineContractComponent("label-with-muted-fact-row", {
            label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                <Text props={{ content: label, size: "sm", weight: "semibold" }} />
            )),
            fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: figure(value), size: "xs", tone: "muted" }} isLoading={isLoading} />
            )),
        })

    return (
        <Tree
            contract="order-summary-stack"
            render={defineContractComponent("order-summary-stack", {
                subtotal: componentRow(labels.subtotal, input.props.subtotal),
                ...(input.props.savings === undefined ? {} : {
                    savings: componentRow(labels.savings, input.props.savings),
                }),
                ...(input.props.surcharge === undefined ? {} : {
                    surcharge: componentRow(labels.surcharge, input.props.surcharge),
                }),
                total: defineContractComponent("order-total-row", {
                    label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                        <Text props={{ content: labels.total, size: "sm", weight: "semibold" }} />
                    )),
                    amount: defineLeafComponent("text", { size: "md", weight: "semibold" }, () => (
                        <Text
                            props={{ content: figure(input.props.total), size: "md", weight: "semibold" }}
                            isLoading={isLoading}
                        />
                    )),
                }),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "commerce" } as const
