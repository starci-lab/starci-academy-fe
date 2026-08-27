import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { ConfirmButton } from "@/components/leaves/ConfirmButton"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { CartLine } from "@/components/blocks/commerce/CartLine"
import { type CartLineData } from "@/components/blocks/commerce/CartLine/component"
import { OrderSummaryBase, type OrderSummaryLabels } from "@/components/blocks/commerce/OrderSummary/component"

/** Aggregate transport state for the cart block. */
export type CartBlockState = "pending" | "ready" | "empty" | "failed"

/** Localized copy consumed by the cart block renderer. */
export type CartBlockLabels = {
    readonly navHome: string
    readonly navCart: string
    readonly title: string
    readonly summary: OrderSummaryLabels
    readonly installmentHint: string
    readonly checkout: string
    readonly clearAll: string
    readonly confirmClearAll: string
    readonly emptyMessage: string
    readonly failedMessage: string
    readonly failedAction: string
    readonly emptyAction: string
}

/** Resolved cart rows and independently resolved pricing summary. */
export type CartBlockData = {
    readonly labels: CartBlockLabels
    readonly lines?: ReadonlyArray<CartLineData>
    readonly subtotal?: string
    readonly savings?: string
    readonly total?: string
    readonly hasPricingFailed?: boolean
}

/** User actions emitted by the cart block. */
export type CartBlockActions = {
    readonly checkout?: () => void
    readonly clearAll?: () => void
    readonly goHome?: () => void
    readonly browse?: () => void
}

/** Complete pure-renderer input for the cart block. */
export type CartBlockProps = {
    readonly blockState: CartBlockState
    readonly data: CartBlockData
    readonly on?: CartBlockActions
}

const RESTING_COUNT = 3

/** Pure cart renderer; all request and mutation ownership remains in the connected block. */
export const CartBlockBase = (props: CartBlockProps) => {
    const labels = props.data.labels
    const isLoading = props.blockState === "pending"
    const showsNotice = props.blockState === "empty" || props.blockState === "failed"
    const restingLines: ReadonlyArray<CartLineData> = Array.from(
        { length: RESTING_COUNT },
        (_unused, index) => ({ courseId: `resting-${index + 1}`, removeLabel: labels.summary.total }),
    )
    const lines = isLoading ? restingLines : props.data.lines ?? []
    return (
        <div>
            <Breadcrumbs props={{ label: labels.title, steps: [{ id: "home", label: labels.navHome }, { id: "cart", label: labels.navCart }] }} on={{ home: props.on?.goHome }} />
            <Heading props={{ content: labels.title, level: 1 }} />
            {showsNotice ? <EmptyNotice props={{ icon: "cart", message: props.blockState === "failed" ? labels.failedMessage : labels.emptyMessage, actionLabel: props.blockState === "failed" ? labels.failedAction : labels.emptyAction }} on={{ act: props.on?.browse }} /> : (
                <>
                    <div>{lines.map((line) => <CartLine key={line.courseId} state={isLoading ? "pending" : "ready"} line={line} />)}</div>
                    <OrderSummaryBase
                        state={isLoading ? "pending" : props.data.hasPricingFailed === true ? "failed" : "ready"}
                        props={{ labels: labels.summary, subtotal: props.data.subtotal, savings: props.data.savings, total: props.data.total }}
                    />
                    {showsNotice || isLoading || props.data.hasPricingFailed === true ? null : <Text props={{ content: labels.installmentHint, size: "sm", tone: "muted" }} />}
                    <div><Button props={{ label: labels.checkout, variant: "primary", disabled: isLoading }} on={{ press: props.on?.checkout }} /><ConfirmButton props={{ label: labels.clearAll, confirmLabel: labels.confirmClearAll, disabled: isLoading }} on={{ confirm: props.on?.clearAll }} /></div>
                </>
            )}
        </div>
    )
}
