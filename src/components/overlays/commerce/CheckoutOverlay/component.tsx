import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { StatusDot } from "@/components/leaves/StatusDot"
import { Text } from "@/components/leaves/Text"
import { ModalShell } from "@/components/shells/ModalShell"
import { Tree } from "@/components/branches/Tree"
import {
    defineContractComponent,
    defineLeafComponent,
    defineContractProjection,
} from "@/components/contracts/props"
import { _OrderSummary, type OrderSummaryLabels } from "@/components/blocks/commerce/OrderSummary/component"

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

/** Props for {@link _CheckoutOverlay}. */
export type CheckoutOverlayProps = {
    readonly props: CheckoutOverlayData
    readonly on?: CheckoutOverlayActions
}

/**
 * Draw the payment step.
 *
 * @param input - {@link CheckoutOverlayProps}
 */
export const _CheckoutOverlay = (input: CheckoutOverlayProps) => {
    const labels = input.props.labels
    const isInstalments = input.props.plan === "instalments"
    const cycles = input.props.cycles ?? []

    return (
        <ModalShell
            isOpen={input.props.isOpen}
            size="sm"
            onDismiss={input.on?.dismiss ?? (() => undefined)}
        >
            <Tree
                contract="checkout-panel-column"
                render={defineContractComponent("checkout-panel-column", {
                    choice: defineLeafComponent("choice-tabs", {}, () => (
                        <ChoiceTabs
                            props={{
                                label: labels.planLabel,
                                selectedKey: input.props.plan,
                                variant: "primary",
                                tabs: [
                                    { id: "full", label: labels.payFull },
                                    { id: "instalments", label: labels.payInstalments },
                                ],
                            }}
                            on={{ select: input.on?.choosePlan }}
                        />
                    )),
                    summary: defineContractProjection("order-summary-stack", () => (
                        <_OrderSummary
                            state="ready"
                            props={{
                                labels: labels.summary,
                                subtotal: input.props.subtotal,
                                savings: input.props.savings,
                                surcharge: input.props.surcharge,
                                total: input.props.total,
                            }}
                        />
                    )),
                    ...(isInstalments && cycles.length > 0 ? {
                        schedule: defineContractComponent("ordered-step-ladder", {
                            step: cycles.map((cycle) => defineContractComponent("ordered-step-row", {
                                // THE MARK IS ONLY DRAWN WHERE IT IS TRUE. `StatusDot`'s tones are
                                // all affirmative and it requires an accessible name, so there is
                                // no honest dot for a cycle that is not the one due. The slot
                                // stays occupied by a resting line, which is what keeps the names
                                // aligned down the ladder.
                                mark: cycle.isCurrent === true
                                    ? defineLeafComponent("status-dot", {}, () => (
                                        <StatusDot props={{ tone: "accent", label: cycle.name }} />
                                    ))
                                    : defineLeafComponent("text", {}, () => (
                                        <Text props={{ content: " " }} />
                                    )),
                                name: defineLeafComponent("text", { size: "sm" }, () => (
                                    <Text props={{ content: cycle.name, size: "sm" }} />
                                )),
                                value: defineLeafComponent("text", { size: "xs" }, () => (
                                    <Text props={{ content: cycle.amount, size: "xs" }} />
                                )),
                            })),
                        }),
                    } : {}),
                    // THE WARNING BELONGS TO THE CHOICE, not to the product. Nothing is charged
                    // automatically and one missed cycle locks every course in the order, so the
                    // reader is told both where the decision is made rather than after it.
                    ...(isInstalments ? {
                        terms: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text props={{ content: labels.terms, size: "xs", tone: "muted" }} />
                        )),
                    } : {}),
                    gateways: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: labels.gateways, size: "xs", tone: "muted" }} />
                    )),
                    action: defineLeafComponent("button", {}, () => (
                        <Button
                            props={{
                                label: labels.action,
                                variant: "primary",
                                isPending: input.props.isPaying === true,
                            }}
                            on={{ press: input.on?.pay }}
                        />
                    )),
                })}
            />
        </ModalShell>
    )
}

/** Source-level ownership marker. */
export const meta = { shape: "branch", world: "pure", domain: "commerce" } as const
