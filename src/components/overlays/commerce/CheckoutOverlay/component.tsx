import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { StatusDot } from "@/components/leaves/StatusDot"
import { Text } from "@/components/leaves/Text"
import { ModalBranch } from "@/components/branches/ModalBranch"
import { OrderSummaryBase, type OrderSummaryLabels } from "@/components/blocks/commerce/OrderSummary/component"

/**
 * OVERLAY - `CheckoutOverlay`: how to pay, and what that decision costs.
 *
 * Target path: `src/components/overlays/commerce/CheckoutOverlay/component.tsx`.
 *
 * IT OPENS ON PAYING AT ONCE. That is the selected direction and it is the reference's own
 * behaviour: the legacy modal initialises its term to null, comments that as the unchanged
 * default, and resets it on every open. Opening on instalments would collect a surcharge from
 * every buyer who did not notice, and it would silently drop the international gateways, because
 * paying over time is domestic-only.
 *
 * THE SCHEDULE IS `ordered-step-ladder`, NOT A SECOND LADDER OF ITS OWN. That entry already owns
 * "steps whose order is the meaning, one of which is where the reader stands" - the pricing rail
 * reached for it first and the name has been freed of that domain rather than copied for this one.
 * A cycle row and a phase row have the same three slots, the same classes and the same mark
 * mechanic: a dot only where the claim is affirmative, a resting line everywhere else.
 *
 * NOTHING HERE COMPUTES A CYCLE. The amounts arrive from the checkout preview with the markup
 * already applied; the legacy drawer re-declared the bundle tiers on the client and that is the
 * copy nobody edits when the server's changes.
 */

/** How the reader has chosen to pay. */
export type CheckoutPlan = "full" | "instalments"

/** One cycle of the schedule, already resolved. */
export type CheckoutCycle = {
    /** Stable identity and reading order. */
    readonly id: string
    /** The already-resolved name: which cycle, when, and what share. */
    readonly name: string
    /** The already-formatted amount. */
    readonly amount: string
    /** Whether this is the cycle the reader is about to pay. */
    readonly isCurrent?: boolean
}

/** Every already-resolved string the panel renders. */
export type CheckoutOverlayLabels = {
    /** The panel's own name. */
    readonly title: string
    /** Accessible name for the pay-how choice. */
    readonly planLabel: string
    /** The pay-at-once option. */
    readonly payFull: string
    /** The pay-over-time option. */
    readonly payInstalments: string
    /** The summary's own copy. */
    readonly summary: OrderSummaryLabels
    /** What the reader is agreeing to by paying over time. */
    readonly terms: string
    /** Which providers will take the money, already narrowed to the chosen plan. */
    readonly gateways: string
    /** The press, amount already in the words. */
    readonly action: string
}

/** What the panel draws. */
export type CheckoutOverlayData = {
    readonly labels: CheckoutOverlayLabels
    /** Whether the panel is showing. Owned by whatever mounts it. */
    readonly isOpen: boolean
    /** Which plan is selected. */
    readonly plan: CheckoutPlan
    /** The already-formatted sum before any reduction. */
    readonly subtotal?: string
    /** The already-formatted saving. */
    readonly savings?: string
    /** The already-formatted instalment surcharge. Absent while paying at once. */
    readonly surcharge?: string
    /** The already-formatted figure owed under the selected plan. */
    readonly total?: string
    /** The cycles, in order. Empty while paying at once. */
    readonly cycles?: ReadonlyArray<CheckoutCycle>
    /** Whether the press is in flight. */
    readonly isPaying?: boolean
}

/** What the panel reports. */
export type CheckoutOverlayActions = {
    /** Every way out: the close control, Escape, and the backdrop. */
    readonly dismiss?: () => void
    /** Called when the reader switches between paying at once and paying over time. */
    readonly choosePlan?: (plan: string) => void
    /** Called on the press that hands off to the provider. */
    readonly pay?: () => void
}

/** Props for {@link CheckoutOverlayBase}. */
export type CheckoutOverlayProps = {
    readonly props: CheckoutOverlayData
    readonly on?: CheckoutOverlayActions
}

/**
 * Draw the payment step.
 *
 * @param input - {@link CheckoutOverlayProps}
 */
export const CheckoutOverlayBase = (props: CheckoutOverlayProps) => {
    const labels = props.props.labels
    const isInstalments = props.props.plan === "instalments"
    const cycles = props.props.cycles ?? []

    return (
        <ModalBranch
            isOpen={props.props.isOpen}
            size="sm"
            onDismiss={props.on?.dismiss ?? (() => undefined)}
        >
            <>
                {
                    <ChoiceTabs
                        props={{
                            label: labels.planLabel,
                            selectedKey: props.props.plan,
                            variant: "primary",
                            tabs: [
                                { id: "full", label: labels.payFull },
                                { id: "instalments", label: labels.payInstalments },
                            ],
                        }}
                        on={{ select: props.on?.choosePlan }}
                    />
                }
                <OrderSummaryBase
                    state="ready"
                    props={{
                        labels: labels.summary,
                        subtotal: props.props.subtotal,
                        savings: props.props.savings,
                        surcharge: props.props.surcharge,
                        total: props.props.total,
                    }}
                />
                {isInstalments && cycles.length > 0 ? (
                    <ol>
                        {cycles.map((cycle) => (
                            <li key={cycle.id}>
                                {cycle.isCurrent === true ? <StatusDot props={{ tone: "accent", label: cycle.name }} /> : <Text props={{ content: " " }} />}
                                <Text props={{ content: cycle.name, size: "sm" }} />
                                <Text props={{ content: cycle.amount, size: "xs" }} />
                            </li>
                        ))}
                    </ol>
                ) : null}
                {isInstalments ? <Text props={{ content: labels.terms, size: "xs", tone: "muted" }} /> : null}
                <Text props={{ content: labels.gateways, size: "xs", tone: "muted" }} />
                <Button
                    props={{
                        label: labels.action,
                        variant: "primary",
                        isPending: props.props.isPaying === true,
                    }}
                    on={{ press: props.on?.pay }}
                />
            </>
        </ModalBranch>
    )
}
