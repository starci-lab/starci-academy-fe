import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { ModalBranch } from "@/components/branches/ModalBranch"
import { OrderSummaryBase, type OrderSummaryLabels } from "@/components/blocks/commerce/OrderSummary/component"
import {
    checkoutActionsClassName,
    checkoutBodyClassName,
    checkoutDecisionClassName,
    checkoutHeaderClassName,
    checkoutMethodClassName,
    checkoutMethodCopyClassName,
    checkoutOverlayClassName,
    checkoutProcessClassName,
    checkoutProcessListClassName,
    checkoutSummaryClassName,
    checkoutTrustClassName,
} from "./classNames"

/** Every already-resolved string rendered by the payment hand-off. */
export type CheckoutOverlayLabels = {
    readonly title: string
    readonly subtitle: string
    readonly methodTitle: string
    readonly provider: string
    readonly providerDescription: string
    readonly summary: OrderSummaryLabels
    readonly processTitle: string
    readonly handoffStep: string
    readonly verificationStep: string
    readonly accessStep: string
    readonly trustNote: string
    readonly action: string
    readonly cancel: string
    readonly failedMessage: string
}

/** Resolved order figures and request state for the existing payment surface. */
export type CheckoutOverlayData = {
    readonly labels: CheckoutOverlayLabels
    readonly isOpen: boolean
    readonly subtotal?: string
    readonly savings?: string
    readonly total?: string
    readonly isPaying?: boolean
    readonly hasFailed?: boolean
}

/** Actions owned by the connected checkout flow. */
export type CheckoutOverlayActions = {
    readonly dismiss?: () => void
    readonly pay?: () => void
}

/** Props for {@link CheckoutOverlayBase}. */
export type CheckoutOverlayProps = {
    readonly props: CheckoutOverlayData
    readonly on?: CheckoutOverlayActions
}

/**
 * Draw the provider hand-off without claiming that a browser redirect confirms payment.
 *
 * Completion remains webhook-owned: this surface can open PayOS, report a hand-off failure, or
 * let the buyer return to the basket. It never draws a client-side success state.
 */
export const CheckoutOverlayBase = (props: CheckoutOverlayProps) => {
    const data = props.props
    const labels = data.labels
    return (
        <ModalBranch
            isOpen={data.isOpen}
            size="lg"
            onDismiss={props.on?.dismiss ?? (() => undefined)}
        >
            <section className={checkoutOverlayClassName} aria-labelledby="checkout-overlay-title">
                <header className={checkoutHeaderClassName}>
                    <span id="checkout-overlay-title">
                        <Heading props={{ content: labels.title, level: 2 }} />
                    </span>
                    <Text props={{ content: labels.subtitle, size: "sm", tone: "muted" }} />
                </header>

                <div className={checkoutBodyClassName}>
                    <div className={checkoutDecisionClassName}>
                        <section className={checkoutSummaryClassName} aria-label={labels.summary.total}>
                            <OrderSummaryBase
                                state="ready"
                                props={{
                                    labels: labels.summary,
                                    subtotal: data.subtotal,
                                    savings: data.savings,
                                    total: data.total,
                                }}
                            />
                        </section>

                        <section className={checkoutMethodClassName} aria-label={labels.methodTitle}>
                            <div className={checkoutMethodCopyClassName}>
                                <Text props={{ content: labels.methodTitle, size: "sm", weight: "semibold" }} />
                                <Text props={{ content: labels.provider, weight: "semibold" }} />
                                <Text props={{ content: labels.providerDescription, size: "xs", tone: "muted" }} />
                            </div>
                        </section>
                    </div>

                    <section className={checkoutProcessClassName} aria-labelledby="checkout-process-title">
                        <span id="checkout-process-title">
                            <Heading props={{ content: labels.processTitle, level: 3 }} />
                        </span>
                        <ol className={checkoutProcessListClassName}>
                            <li><Text props={{ content: labels.handoffStep, size: "sm" }} /></li>
                            <li><Text props={{ content: labels.verificationStep, size: "sm" }} /></li>
                            <li><Text props={{ content: labels.accessStep, size: "sm" }} /></li>
                        </ol>
                    </section>

                    <div className={checkoutTrustClassName}>
                        <Text props={{ content: labels.trustNote, size: "xs", tone: "muted", icon: "password" }} />
                    </div>

                    {data.hasFailed === true ? (
                        <Text props={{ content: labels.failedMessage, size: "sm", tone: "accent", live: "assertive" }} />
                    ) : null}

                    <div className={checkoutActionsClassName}>
                        <Button
                            props={{
                                label: labels.action,
                                variant: "primary",
                                icon: "next",
                                iconPlacement: "trailing",
                                isPending: data.isPaying === true,
                            }}
                            on={{ press: props.on?.pay }}
                        />
                        <Button
                            props={{ label: labels.cancel, variant: "ghost", disabled: data.isPaying === true }}
                            on={{ press: props.on?.dismiss }}
                        />
                    </div>
                </div>
            </section>
        </ModalBranch>
    )
}
