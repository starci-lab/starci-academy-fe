import { Button } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Icon } from "@starci/grammar/common"

import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
    readonly close?: string
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
            ariaLabelledBy="checkout-overlay-title"
            closeLabel={labels.close}
            onDismiss={props.on?.dismiss ?? (() => undefined)}
        >
            <section className={checkoutOverlayClassName} aria-labelledby="checkout-overlay-title">
                <header className={checkoutHeaderClassName}>
                    <span id="checkout-overlay-title">
                        <Heading level={2}>{labels.title}</Heading>
                    </span>
                    <Text size={"sm"} tone={"muted"}>{labels.subtitle}</Text>
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
                                <Text size={"sm"} weight={"semibold"}>{labels.methodTitle}</Text>
                                <Text weight={"semibold"}>{labels.provider}</Text>
                                <Text size={"xs"} tone={"muted"}>{labels.providerDescription}</Text>
                            </div>
                        </section>
                    </div>

                    <section className={checkoutProcessClassName} aria-labelledby="checkout-process-title">
                        <span id="checkout-process-title">
                            <Heading level={3}>{labels.processTitle}</Heading>
                        </span>
                        <ol className={checkoutProcessListClassName}>
                            <li><Text size={"sm"}>{labels.handoffStep}</Text></li>
                            <li><Text size={"sm"}>{labels.verificationStep}</Text></li>
                            <li><Text size={"sm"}>{labels.accessStep}</Text></li>
                        </ol>
                    </section>

                    <div className={checkoutTrustClassName}>
                        <Text size={"xs"} tone={"muted"} startContent={<Icon source={iconSourceFor("password", "chip")} usage="chip" />}>{labels.trustNote}</Text>
                    </div>

                    {data.hasFailed === true ? (
                        <Text size={"sm"} tone={"accent"} live={"assertive"}>{labels.failedMessage}</Text>
                    ) : null}

                    <div className={checkoutActionsClassName}>
                        <Button variant={"primary"} isPending={data.isPaying === true} onPress={({ press: props.on?.pay })?.press} endContent={<Icon source={iconSourceFor("next", "chip")} usage="chip" />}>{labels.action}</Button>
                        <Button variant="ghost" isDisabled={data.isPaying === true} onPress={props.on?.dismiss}>{labels.cancel}</Button>
                    </div>
                </div>
            </section>
        </ModalBranch>
    )
}
