import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { ConfirmButton } from "@/components/leaves/ConfirmButton"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Tree } from "@/components/branches/Tree"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"
import { CartLine } from "@/components/blocks/commerce/CartLine"
import { type CartLineData } from "@/components/blocks/commerce/CartLine/component"
import { OrderSummaryBase, type OrderSummaryLabels } from "@/components/blocks/commerce/OrderSummary/component"

/**
 * PAGE - `CartPage`: the basket, with room to read it.
 *
 * Target path: `src/components/pages/CartPage/component.tsx`.
 *
 * THE SELECTED DIRECTION, `direction-legacy-full-default`. The page states the pay-in-full price
 * and nothing else about how to pay: instalments are a choice the reader makes deliberately at the
 * payment step, which is where the legacy reference puts it and where its own default sits. The
 * page carries a hint that instalments exist, and the hint states the FIRST payment rather than a
 * per-month figure - under a front-loaded schedule the opening cycle is the most expensive one, so
 * a from-price would be a false floor.
 *
 * THE REGIONS BELOW THE HEADER ARE OPTIONAL TOGETHER. An empty basket has no lines, no total, no
 * hint and nothing to press; the entry marks each optional so the empty state is an ABSENT slot
 * rather than a slot holding an emptied thing, and the notice takes their place.
 *
 * THE PRICING AND THE LINES ARE TWO INDEPENDENT REQUESTS, so the summary carries its own situation.
 * A basket whose rows have arrived and whose totals have not is a real state - the legacy cart
 * handles exactly it - and folding both into one page flag would blank rows that are already true.
 */

/** The situations the page can be in. */
export type CartPageState = "pending" | "ready" | "empty" | "failed"

/** Every already-resolved string the page renders. */
export type CartPageLabels = {
    /** Breadcrumb root crumb. */
    readonly navHome: string
    /** Breadcrumb current crumb. */
    readonly navCart: string
    /** Page title. */
    readonly title: string
    /** The summary's own copy. */
    readonly summary: OrderSummaryLabels
    /** Says instalments exist and what the first payment is. */
    readonly installmentHint: string
    /** The primary action, count already in the words. */
    readonly checkout: string
    /** Empties the whole basket. */
    readonly clearAll: string
    /** What a second press will do, shown while the control is armed. */
    readonly confirmClearAll: string
    /** Shown when the basket holds nothing. */
    readonly emptyMessage: string
    /** Shown when the basket could not be READ at all - refused, or the request failed. */
    readonly failedMessage: string
    /** The way out of a failed read: ask again. */
    readonly failedAction: string
    /** The way out of an empty basket. */
    readonly emptyAction: string
}

/** What the page draws. */
export type CartPageData = {
    readonly labels: CartPageLabels
    /** The basket lines, oldest first, as the server returns them. */
    readonly lines?: ReadonlyArray<CartLineData>
    /** The already-formatted sum before any reduction. */
    readonly subtotal?: string
    /** The already-formatted saving. */
    readonly savings?: string
    /** The already-formatted figure owed. */
    readonly total?: string
    /** Whether the pricing request itself failed while the lines stand. */
    readonly hasPricingFailed?: boolean
}

/** What the page reports. */
export type CartPageActions = {
    /** Called when the reader proceeds to the payment step. */
    readonly checkout?: () => void
    /** Called when the reader empties the basket. */
    readonly clearAll?: () => void
    /** Called when the reader follows the breadcrumb home. */
    readonly goHome?: () => void
    /** Called when an empty basket sends the reader to the catalogue. */
    readonly browse?: () => void
}

/** Props for {@link CartPageBase}. */
export type CartPageProps = {
    readonly state: CartPageState
    readonly props: CartPageData
    readonly on?: CartPageActions
}

/** How many resting lines the list shows while the first request is in flight. */
const RESTING_COUNT = 3

/**
 * Draw the basket.
 *
 * @param input - {@link CartPageProps}
 */
export const CartPageBase = (input: CartPageProps) => {
    const labels = input.props.labels
    const isLoading = input.state === "pending"
    const showsNotice = input.state === "empty" || input.state === "failed"

    const restingLines: ReadonlyArray<CartLineData> = Array.from(
        { length: RESTING_COUNT },
        (_unused, index) => ({ courseId: `resting-${index + 1}`, removeLabel: labels.summary.total }),
    )
    const lines = isLoading ? restingLines : input.props.lines ?? []

    const header = defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs
                props={{
                    label: labels.title,
                    steps: [
                        { id: "home", label: labels.navHome },
                        { id: "cart", label: labels.navCart },
                    ],
                }}
                on={{ home: input.on?.goHome }}
            />
        )),
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: labels.title, level: 1 }} />
        )),
    })

    const lineList = defineContractComponent("cart-line-list", {
        line: lines.map((line) => defineContractProjection("cart-line-row", () => (
            <CartLine state={isLoading ? "pending" : "ready"} line={line} />
        ))),
    })

    const summary = defineContractProjection("order-summary-stack", () => (
        <OrderSummaryBase
            state={isLoading ? "pending" : input.props.hasPricingFailed === true ? "failed" : "ready"}
            props={{
                labels: labels.summary,
                subtotal: input.props.subtotal,
                savings: input.props.savings,
                total: input.props.total,
            }}
        />
    ))

    return (
        <Tree
            contract="cart-page-column"
            render={defineContractComponent("cart-page-column", {
                header,
                ...(showsNotice ? {} : { lines: lineList }),
                ...(showsNotice ? {} : { summary }),
                // THE HINT IS OMITTED WHILE THE PRICE IS UNKNOWN. It quotes the first instalment,
                // which is derived from a total that has not arrived or has failed - and a hint
                // naming a figure the summary beside it cannot show is the page disagreeing with
                // itself.
                ...(showsNotice || isLoading || input.props.hasPricingFailed === true ? {} : {
                    hint: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: labels.installmentHint, size: "sm", tone: "muted" }} />
                    )),
                }),
                ...(showsNotice ? {} : {
                    actions: defineContractComponent("stacked-peer-controls", {
                        control: [
                            defineLeafComponent("button", {}, () => (
                                <Button
                                    props={{ label: labels.checkout, variant: "primary", disabled: isLoading }}
                                    on={{ press: input.on?.checkout }}
                                />
                            )),
                            // EMPTYING THE BASKET ASKS FIRST, and the reference decided that
                            // rather than this candidate: the legacy cart arms an inline confirm
                            // for a few seconds instead of opening a modal, citing the rule that a
                            // destructive action needs confirmation. Undoing this one means
                            // re-adding every course by hand, and it sits directly beneath the
                            // press the reader actually came for.
                            defineLeafComponent("confirm-button", {}, () => (
                                <ConfirmButton
                                    props={{
                                        label: labels.clearAll,
                                        confirmLabel: labels.confirmClearAll,
                                        disabled: isLoading,
                                    }}
                                    on={{ confirm: input.on?.clearAll }}
                                />
                            )),
                        ],
                    }),
                }),
                ...(showsNotice ? {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                icon: "cart",
                                // EMPTY AND REFUSED ARE NOT THE SAME SENTENCE, and the real page is what proved it: a

                                // signed-out reader was told their basket was empty when nobody had asked them to sign

                                // in. Both states hide the same regions, so only the copy can tell them apart.

                                message: input.state === "failed" ? labels.failedMessage : labels.emptyMessage,
                                actionLabel: input.state === "failed" ? labels.failedAction : labels.emptyAction,
                            }}
                            on={{ act: input.on?.browse }}
                        />
                    )),
                } : {}),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "commerce" } as const
