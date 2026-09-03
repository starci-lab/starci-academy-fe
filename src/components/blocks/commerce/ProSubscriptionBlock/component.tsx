import Image from "next/image"
import { useState } from "react"
import { Badge, IncludedMark, PageContainer, PrimaryRailLayout, SectionHeader, SurfaceAccordionCard, SurfaceCopyGroup, Button } from "@starci/grammar/common"
import { SurfaceCard } from "@starci/grammar/common"
import { CheckoutOverlayBase, type CheckoutOverlayData } from "@/components/overlays/commerce/CheckoutOverlay/component"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import {
    proActionsClassName,
    proBenefitClassName,
    proBenefitCopyClassName,
    proBenefitIntroClassName,
    proBenefitJourneyBandClassName,
    proBenefitJourneyImageClassName,
    proBenefitListClassName,
    proBenefitMarkClassName,
    proDisclosureBodyClassName,
    proDisclosureClassName,
    proDisclosureSummaryClassName,
    proFailedStackClassName,
    proHeroClassName,
    proMainClassName,
    proNoticeClassName,
    proPageClassName,
    proPageStackClassName,
    proPlanClassName,
    proPlanDetailsClassName,
    proPlanHeadingClassName,
    proPriceClassName,
    proPriceValueClassName,
    proRailClassName,
    proRetryActionsClassName,
    proSectionClassName,
    proStatusClassName,
} from "./classNames"

/** Transport state for public offer and authenticated lifecycle reads. */
export type ProSubscriptionBlockState = "pending" | "ready" | "failed"
/** Business-safe states exposed by the purchase decision. */
export type ProPurchaseState = "eligible" | "verification-pending" | "active" | "cancelled"

/** One localized outcome included with Pro. */
export type ProBenefitData = {
    readonly title: string
    readonly description: string
}

/** Every localized string consumed by the pure Pro renderer. */
export type ProSubscriptionBlockLabels = {
    readonly breadcrumbLabel: string
    readonly breadcrumbHome: string
    readonly breadcrumbCurrent: string
    readonly title: string
    readonly description: string
    readonly benefitsTitle: string
    readonly benefitsDescription: string
    readonly journeyAlt: string
    readonly disclosuresTitle: string
    readonly benefits: ReadonlyArray<ProBenefitData>
    readonly aiTitle: string
    readonly aiDescription: string
    readonly activationTitle: string
    readonly activationDescription: string
    readonly planBadge: string
    readonly period: string
    readonly renewalNote: string
    readonly signedOutAction: string
    readonly signedOutHelper: string
    readonly purchaseAction: string
    readonly pendingTitle: string
    readonly pendingDescription: string
    readonly activeTitle: string
    readonly activeDescription: string
    readonly activeUntil?: string
    readonly cancelledMessage: string
    readonly failedTitle: string
    readonly failedDescription: string
    readonly retry: string
}

/** Resolved offer, lifecycle and checkout data. */
export type ProSubscriptionBlockData = {
    readonly labels: ProSubscriptionBlockLabels
    readonly planName?: string
    readonly price?: string
    readonly purchaseState: ProPurchaseState
    readonly isSignedOut: boolean
    readonly payment?: CheckoutOverlayData
}

/** User intents emitted by the pure Pro renderer. */
export type ProSubscriptionBlockActions = {
    readonly goHome?: () => void
    readonly purchase?: () => void
    readonly retry?: () => void
    readonly pay?: () => void
    readonly dismissPayment?: () => void
}

/** Complete input contract for the pure Pro renderer. */
export type ProSubscriptionBlockProps = {
    readonly blockState: ProSubscriptionBlockState
    readonly data: ProSubscriptionBlockData
    readonly on?: ProSubscriptionBlockActions
}

/** Pure one-offer renderer; it never infers payment success from navigation. */
export const ProSubscriptionBlockBase = (props: ProSubscriptionBlockProps) => {
    const { blockState, data, on } = props
    const labels = data.labels
    const [expandedDisclosureIds, setExpandedDisclosureIds] = useState<ReadonlySet<string>>(new Set())
    const isLoading = blockState === "pending"
    const breadcrumb = (
        <Breadcrumbs
            props={{
                label: labels.breadcrumbLabel,
                steps: [
                    { id: "home", label: labels.breadcrumbHome },
                    { id: "subscriptions", label: labels.breadcrumbCurrent },
                ],
            }}
            on={{ home: on?.goHome }}
        />
    )
    if (blockState === "failed") {
        return (
            <main className={proPageClassName}>
                <PageContainer measure="reading">
                    <div className={proFailedStackClassName}>
                        {breadcrumb}
                        <SurfaceCard composition="joined">
                            <div className={proNoticeClassName} role="alert">
                                <Heading level={1}>{labels.failedTitle}</Heading>
                                <Text tone={"muted"}>{labels.failedDescription}</Text>
                                <div className={proRetryActionsClassName}>
                                    <Button variant="primary" onPress={on?.retry}>{labels.retry}</Button>
                                </div>
                            </div>
                        </SurfaceCard>
                    </div>
                </PageContainer>
            </main>
        )
    }

    const status = data.purchaseState === "verification-pending"
        ? { title: labels.pendingTitle, description: labels.pendingDescription }
        : data.purchaseState === "active"
            ? { title: labels.activeTitle, description: labels.activeUntil ?? labels.activeDescription }
            : data.purchaseState === "cancelled"
                ? { title: labels.cancelledMessage, description: labels.renewalNote }
                : undefined
    const actionLabel = data.isSignedOut ? labels.signedOutAction : labels.purchaseAction
    const hasPurchaseAction = data.purchaseState !== "active" && data.purchaseState !== "verification-pending"
    const plan = (
        <aside className={proRailClassName} aria-label={data.planName ?? labels.planBadge}>
            <SurfaceCard isHighlight={true} composition="joined" state={isLoading ? "pending" : "neutral"}>
                <div className={proPlanClassName}>
                    <div className={proPlanDetailsClassName} data-has-actions={hasPurchaseAction ? "true" : "false"}>
                        <div className={proPlanHeadingClassName}>
                            <Heading level={2} isSkeleton={isLoading}>{data.planName}</Heading>
                            <Badge tone="accent">{labels.planBadge}</Badge>
                        </div>
                        <div className={proPriceClassName} aria-label={isLoading ? undefined : `${data.price ?? ""} ${labels.period}`}>
                            <span className={proPriceValueClassName}>{isLoading ? "—" : data.price}</span>
                            <Text size={"sm"} tone={"muted"}>{labels.period}</Text>
                        </div>
                        {status === undefined ? null : (
                            <div className={proStatusClassName} role="status" aria-live="polite">
                                <SurfaceCopyGroup>
                                    <Text weight={"semibold"}>{status.title}</Text>
                                    <Text size={"sm"} tone={"muted"}>{status.description}</Text>
                                </SurfaceCopyGroup>
                            </div>
                        )}
                        <Text size={"sm"} tone={"muted"}>{labels.renewalNote}</Text>
                    </div>
                    {hasPurchaseAction ? (
                        <div className={proActionsClassName}>
                            <Button variant="primary" width="fill" isDisabled={isLoading} onPress={on?.purchase}>{actionLabel}</Button>
                            {data.isSignedOut ? <Text size={"xs"} tone={"muted"}>{labels.signedOutHelper}</Text> : null}
                        </div>
                    ) : null}
                </div>
            </SurfaceCard>
        </aside>
    )
    return (
        <>
            <main className={proPageClassName}>
                <PageContainer>
                    <div className={proPageStackClassName}>
                        <div className={proHeroClassName}>
                            {breadcrumb}
                            <SectionHeader
                                composition="context-intro"
                                title={labels.title}
                                description={labels.description}
                                level={1}
                            />
                        </div>
                        <PrimaryRailLayout
                            railWidth="wide"
                            // One decision owns this route, so the collapsed flow leads with the price and its action.
                            collapsedOrder="rail-first"
                            primary={(
                                <div className={proMainClassName}>
                                    <section aria-label={labels.benefitsTitle} className={proSectionClassName}>
                                        {/*
                                          * The section anchor is a Heading, not the surface `label`:
                                          * a labelled surface is fixed at h3, which would make the
                                          * page outline jump H1 -> H3. Level 2 is the rank this
                                          * region actually holds (HIERARCHY-1 Case 1).
                                          */}
                                        <Heading level={2}>{labels.benefitsTitle}</Heading>
                                        {/*
                                          * GRAMMAR-GAP: this surface and the SurfaceAccordionCard in
                                          * the peer section below sit in the same column and are 16px
                                          * out of alignment, and no prop closes it. `SurfaceCard`
                                          * renders a HeroUI `Card.Root`, whose `.card` rule sets
                                          * `padding: calc(var(--spacing) * 4)`. Grammar re-states
                                          * `padding: 0 !important` for `.starci-core-surface-label`
                                          * and `.starci-core-surface` but not for
                                          * `.starci-core-surface-card`, so the vendor inset survives
                                          * on the root; `.starci-core-surface-accordion-card` is a
                                          * plain section and has none. The fix is that missing reset
                                          * in `packages/grammar/src/common/styles.css`. Nothing is
                                          * padded here to hide it: an app-owned inset on either card
                                          * would be APP_OVERRIDE.
                                          */}
                                        <SurfaceCard composition={"joined"}>
                                            <div className={proBenefitIntroClassName}>
                                                <Text size={"sm"} tone={"muted"}>{labels.benefitsDescription}</Text>
                                            </div>
                                            <div className={proBenefitJourneyBandClassName}>
                                                <Image
                                                    alt={labels.journeyAlt}
                                                    className={proBenefitJourneyImageClassName}
                                                    height={941}
                                                    priority
                                                    sizes="(max-width: 895px) calc(100vw - 2rem), 58vw"
                                                    src="/images/pro-subscription/pro-learning-journey-v1.png"
                                                    width={1672}
                                                />
                                            </div>
                                            <ul className={proBenefitListClassName}>
                                                {labels.benefits.map((benefit) => (
                                                    <li className={proBenefitClassName} key={benefit.title}>
                                                        <span className={proBenefitMarkClassName}><IncludedMark /></span>
                                                        <div className={proBenefitCopyClassName}>
                                                            <Text size={"sm"} weight={"semibold"}>{benefit.title}</Text>
                                                            <Text size={"xs"} tone={"muted"}>{benefit.description}</Text>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </SurfaceCard>
                                    </section>
                                    <section aria-label={labels.disclosuresTitle} className={proSectionClassName}>
                                        {/* Same reason as the benefits region: the disclosures are a peer section, not an h3. */}
                                        <Heading level={2}>{labels.disclosuresTitle}</Heading>
                                        <div className={proDisclosureClassName}>
                                            <SurfaceAccordionCard
                                                depth="top"
                                                items={[
                                                    { id: "ai-usage", isOpen: expandedDisclosureIds.has("ai-usage"), summaryRender: { id: "ai-usage", title: labels.aiTitle }, bodyRender: labels.aiDescription },
                                                    { id: "payment-activation", isOpen: expandedDisclosureIds.has("payment-activation"), summaryRender: { id: "payment-activation", title: labels.activationTitle }, bodyRender: labels.activationDescription },
                                                ]}
                                                renderSummary={(summary) => (
                                                    <div className={proDisclosureSummaryClassName}>
                                                        <Text size={"sm"} weight={"semibold"}>{summary.title}</Text>
                                                        <DisclosureIndicator props={{ isOpen: expandedDisclosureIds.has(summary.id) }} />
                                                    </div>
                                                )}
                                                renderBody={(body) => <div className={proDisclosureBodyClassName}><Text size={"sm"}>{body}</Text></div>}
                                                onItemOpenChange={(id, isOpen) => setExpandedDisclosureIds((current) => {
                                                    const next = new Set(current)
                                                    if (isOpen) next.add(id)
                                                    else next.delete(id)
                                                    return next
                                                })}
                                            />
                                        </div>
                                    </section>
                                </div>
                            )}
                            rail={plan}
                        />
                    </div>
                </PageContainer>
            </main>
            {data.payment === undefined ? null : (
                <CheckoutOverlayBase props={data.payment} on={{ pay: on?.pay, dismiss: on?.dismissPayment }} />
            )}
        </>
    )
}
