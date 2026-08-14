import { Button } from "@/components/leaves/Button"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Tree } from "@/components/branches/Tree"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"
import { DrawerShell } from "@/components/shells/DrawerShell"
import { _CartLine, type CartLineData } from "@/components/blocks/commerce/CartLine/component"
import { _OrderSummary, type OrderSummaryLabels } from "@/components/blocks/commerce/OrderSummary/component"

/**
 * OVERLAY - `CartDrawer`: the same basket, reached without leaving the page being read.
 *
 * Target path: `src/components/overlays/commerce/CartDrawer/component.tsx`.
 *
 * IT MOUNTS NO SURFACE BRANCH - canon VENDOR-8, and `CoursePriceOverlay` records the same rule
 * beside the same decision. The covering panel is already the bounded object; a `SurfaceCard`
 * inside it would draw a second border and a second inset around a body that is already framed.
 *
 * IT HOLDS NO HEADING. `DrawerShell` names the panel in the vendor's own header, and a second
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
    /** The course whose removal is in flight, if any. */
    readonly removingCourseId?: string
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
    /** Per-line removal, keyed `remove:{courseId}`. */
    readonly [key: string]: ((...args: Array<never>) => void) | undefined
}

/** Props for {@link _CartDrawer}. */
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
export const _CartDrawer = (input: CartDrawerProps) => {
    const labels = input.props.labels
    const isLoading = input.state === "pending"
    const showsNotice = input.state === "empty" || input.state === "failed"

    const restingLines: ReadonlyArray<CartLineData> = Array.from(
        { length: RESTING_COUNT },
        (_unused, index) => ({ courseId: `resting-${index + 1}`, removeLabel: labels.summary.total }),
    )
    const lines = isLoading ? restingLines : input.props.lines ?? []

    return (
        <DrawerShell
            isOpen={input.props.isOpen}
            title={labels.title}
            onDismiss={input.on?.dismiss ?? (() => undefined)}
        >
            <Tree
                contract="cart-drawer-column"
                render={defineContractComponent("cart-drawer-column", {
                    ...(showsNotice ? {} : {
                        lines: defineContractComponent("cart-line-list", {
                            line: lines.map((line) => defineContractProjection("cart-line-row", () => (
                                <_CartLine
                                    state={
                                        isLoading
                                            ? "pending"
                                            : input.props.removingCourseId === line.courseId
                                                ? "removing"
                                                : "ready"
                                    }
                                    props={line}
                                    on={{ remove: input.on?.[`remove:${line.courseId}`] }}
                                />
                            ))),
                        }),
                    }),
                    ...(showsNotice ? {} : {
                        summary: defineContractProjection("order-summary-stack", () => (
                            <_OrderSummary
                                state={
                                    isLoading
                                        ? "pending"
                                        : input.props.hasPricingFailed === true ? "failed" : "ready"
                                }
                                props={{
                                    labels: labels.summary,
                                    subtotal: input.props.subtotal,
                                    savings: input.props.savings,
                                    total: input.props.total,
                                }}
                            />
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
                                defineLeafComponent("button", {}, () => (
                                    <Button
                                        props={{ label: labels.viewFullCart, variant: "secondary" }}
                                        on={{ press: input.on?.viewFullCart }}
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
                                    message: labels.emptyMessage,
                                    actionLabel: labels.emptyAction,
                                }}
                                on={{ act: input.on?.browse }}
                            />
                        )),
                    } : {}),
                })}
            />
        </DrawerShell>
    )
}

/** Source-level ownership marker. */
export const meta = { shape: "branch", world: "pure", domain: "commerce" } as const
