import { Button } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { CartLine } from "@/components/blocks/commerce/CartLine"
import { type CartLineData } from "@/components/blocks/commerce/CartLine/component"
import { OrderSummaryBase, type OrderSummaryLabels } from "@/components/blocks/commerce/OrderSummary/component"

/**
 * OVERLAY - `CartDrawer`: the same basket, reached without leaving the page being read.
 *
 * Target path: `src/components/overlays/commerce/CartDrawer/component.tsx`.
 *
 * IT MOUNTS NO SURFACE BRANCH - canon VENDOR-8, and `CoursePriceOverlay` records the same rule
 * beside the same decision. The covering panel is already the bounded object; a `SurfaceCard`
 * inside it would draw a second border and a second inset around a body that is already framed.
 *
 * IT HOLDS NO HEADING. `DrawerBranch` names the panel in the vendor's own header, and a second
 * title inside would name the thing the reader has just opened, by name, twice.
 *
 * IT DRAWS THE SAME TWO BLOCKS THE PAGE DRAWS, not narrower copies of them. `CartLine` and
 * `OrderSummary` are the shared statement; what differs between the two surfaces is the measure
 * and the presence of a way through to the deep review, which is the direction's whole position -
 * the drawer is the quick look and `/cart` is where the basket is read properly.
 *
 * IT DOES NOT OWN WHETHER IT IS OPEN. Twenty cards holding twenty drawers would be twenty focus
 * traps in one document, so the surface that mounts it holds the flag, exactly as the catalogue
 * page holds the price overlay's.
 */

/** The situations the drawer can be in. */
export type CartDrawerState = "pending" | "ready" | "empty" | "failed"

/** Every already-resolved string the drawer renders. */
export type CartDrawerLabels = {
    /** The panel's own name, drawn by the shell. */
    readonly title: string
    /** The summary's own copy. */
    readonly summary: OrderSummaryLabels
    /** The primary action. */
    readonly checkout: string
    /** The way through to the deep review. */
    readonly viewFullCart: string
    /** Shown when the basket holds nothing. */
    readonly emptyMessage: string
    /** Shown when the basket could not be READ at all - refused, or the request failed. */
    readonly failedMessage: string
    /** The way out of a failed read: ask again. */
    readonly failedAction: string
    /** The way out of an empty basket. */
    readonly emptyAction: string
}

/** What the drawer draws. */
export type CartDrawerData = {
    readonly labels: CartDrawerLabels
    /** Whether the panel is showing. Owned by whatever mounts it. */
    readonly isOpen: boolean
    /** The basket lines, oldest first. */
    readonly lines?: ReadonlyArray<CartLineData>
    /** The already-formatted sum before any reduction. */
    readonly subtotal?: string
    /** The already-formatted saving. */
    readonly savings?: string
    /** The already-formatted figure owed. */
    readonly total?: string
    /** Whether the pricing request failed while the lines stand. */
    readonly hasPricingFailed?: boolean
}

/** What the drawer reports. */
export type CartDrawerActions = {
    /** Every way out: the close control, Escape, and the backdrop. */
    readonly dismiss?: () => void
    /** Called when the reader proceeds to the payment step. */
    readonly checkout?: () => void
    /** Called when the reader opens the deep review. */
    readonly viewFullCart?: () => void
    /** Called when an empty basket sends the reader to the catalogue. */
    readonly browse?: () => void
}

/** Props for {@link CartDrawerBase}. */
export type CartDrawerProps = {
    readonly state: CartDrawerState
    readonly props: CartDrawerData
    readonly on?: CartDrawerActions
}

/** How many resting lines the panel shows while the first request is in flight. */
const RESTING_COUNT = 3

/**
 * Draw the basket over the page.
 *
 * @param input - {@link CartDrawerProps}
 */
export const CartDrawerBase = (props: CartDrawerProps) => {
    const labels = props.props.labels
    const isLoading = props.state === "pending"
    const showsNotice = props.state === "empty" || props.state === "failed"

    const restingLines: ReadonlyArray<CartLineData> = Array.from(
        { length: RESTING_COUNT },
        (_unused, index) => ({ courseId: `resting-${index + 1}`, removeLabel: labels.summary.total }),
    )
    const lines = isLoading ? restingLines : props.props.lines ?? []

    return (
        <DrawerBranch
            isOpen={props.props.isOpen}
            title={labels.title}
            onDismiss={props.on?.dismiss ?? (() => undefined)}
        >
            {showsNotice ? (
                <EmptyNotice message={props.state === "failed" ? labels.failedMessage : labels.emptyMessage} actionLabel={props.state === "failed" ? labels.failedAction : labels.emptyAction} iconSource={iconSourceFor("cart", "leading")} onAction={({ act: props.on?.browse })?.act} />
            ) : (
                <>
                    <div>
                        {lines.map((line) => (
                            <CartLine key={line.courseId} state={isLoading ? "pending" : "ready"} line={line} />
                        ))}
                    </div>
                    <OrderSummaryBase
                        state={
                            isLoading
                                ? "pending"
                                : props.props.hasPricingFailed === true ? "failed" : "ready"
                        }
                        props={{
                            labels: labels.summary,
                            subtotal: props.props.subtotal,
                            savings: props.props.savings,
                            total: props.props.total,
                        }}
                    />
                    <div>
                        <Button variant="primary" isDisabled={isLoading} onPress={props.on?.checkout}>{labels.checkout}</Button>
                        <Button variant="secondary" onPress={props.on?.viewFullCart}>{labels.viewFullCart}</Button>
                    </div>
                </>
            )}
        </DrawerBranch>
    )
}
