import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { ConfirmButton } from "@/components/leaves/ConfirmButton"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Tree } from "@/components/branches/Tree"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
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
export const CartBlockBase = (input: CartBlockProps) => {
    const labels = input.data.labels
    const isLoading = input.blockState === "pending"
    const showsNotice = input.blockState === "empty" || input.blockState === "failed"
    const restingLines: ReadonlyArray<CartLineData> = Array.from(
        { length: RESTING_COUNT },
        (_unused, index) => ({ courseId: `resting-${index + 1}`, removeLabel: labels.summary.total }),
    )
    const lines = isLoading ? restingLines : input.data.lines ?? []
    const header = defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs props={{ label: labels.title, steps: [{ id: "home", label: labels.navHome }, { id: "cart", label: labels.navCart }] }} on={{ home: input.on?.goHome }} />
        )),
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: labels.title, level: 1 }} />),
    })
    const lineList = defineContractComponent("cart-line-list", {
        line: lines.map((line) => defineContractProjection("cart-line-row", () => <CartLine state={isLoading ? "pending" : "ready"} line={line} />)),
    })
    const summary = defineContractProjection("order-summary-stack", () => (
        <OrderSummaryBase
            state={isLoading ? "pending" : input.data.hasPricingFailed === true ? "failed" : "ready"}
            props={{ labels: labels.summary, subtotal: input.data.subtotal, savings: input.data.savings, total: input.data.total }}
        />
    ))
    return (
        <Tree contract="cart-page-column" render={defineContractComponent("cart-page-column", {
            header,
            ...(showsNotice ? {} : { lines: lineList }),
            ...(showsNotice ? {} : { summary }),
            ...(showsNotice || isLoading || input.data.hasPricingFailed === true ? {} : {
                hint: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.installmentHint, size: "sm", tone: "muted" }} />),
            }),
            ...(showsNotice ? {} : {
                actions: defineContractComponent("stacked-peer-controls", {
                    control: [
                        defineLeafComponent("button", {}, () => <Button props={{ label: labels.checkout, variant: "primary", disabled: isLoading }} on={{ press: input.on?.checkout }} />),
                        defineLeafComponent("confirm-button", {}, () => <ConfirmButton props={{ label: labels.clearAll, confirmLabel: labels.confirmClearAll, disabled: isLoading }} on={{ confirm: input.on?.clearAll }} />),
                    ],
                }),
            }),
            ...(showsNotice ? {
                notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ icon: "cart", message: input.blockState === "failed" ? labels.failedMessage : labels.emptyMessage, actionLabel: input.blockState === "failed" ? labels.failedAction : labels.emptyAction }} on={{ act: input.on?.browse }} />),
            } : {}),
        })} />
    )
}

/** Source-level ownership marker for the pure renderer. */
export const meta = { world: "pure", domain: "commerce" } as const
