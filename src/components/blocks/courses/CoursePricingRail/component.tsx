"use client"
import { useState } from "react"
import { ScrollViewport } from "@/components/branches/ScrollViewport"
import { Badge } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"

import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { CoverImage } from "@/components/leaves/CoverImage"
import { PricingPhaseComparisonCard } from "@/components/composites/PricingPhaseComparisonCard"
import { Text } from "@starci/grammar/common"
import { CoursePriceOverlay } from "@/components/overlays/courses/CoursePriceOverlay"
import { CourseMobileEnrollBarBase } from "../CourseMobileEnrollBar/component"
import { pricingRailActionsClassName, pricingRailClassName, pricingRailIntentClassName, pricingRailIntentCopyClassName, pricingRailPriceClassName, pricingRailPriceEvidenceClassName, pricingRailPriceNoteClassName, pricingRailSurfaceStackClassName } from "./classNames"
import { TextAction } from "@starci/grammar/common"


/** One phase in the pricing ladder. */
export type PricingPhase = { readonly id: string; readonly name: string; readonly value: string; readonly isActive?: boolean }
/** Copy for switching between purchase and trial. */
export type CoursePricingRailIntentCopy = { readonly intentTabsLabel: string; readonly purchaseModeLabel: string; readonly trialModeLabel: string; readonly purchaseTitle: string; readonly purchaseDescription: string; readonly trialTitle: string; readonly trialDescription: string; readonly phaseDisclosureLabel: string }
/** Resolved pricing rail content. */
export type CoursePricingRailData = { readonly intent?: CoursePricingRailIntentCopy; readonly coverUrl?: string | null; readonly title: string; readonly price?: string; readonly originalPrice?: string; readonly discountLabel?: string; readonly savingsLabel?: string; readonly priceDetailLabel?: string; readonly scarcityLabel?: string; readonly phases?: ReadonlyArray<PricingPhase>; readonly ctaLabel: string; readonly trialLabel?: string; readonly cartLabel?: string; readonly isInCart?: boolean; readonly enrolmentLabel?: string }
/** Actions emitted by the pricing rail. */
export type CoursePricingRailActions = { readonly act?: () => void; readonly trial?: () => void; readonly addToCart?: () => void; readonly openPriceDetail?: () => void }
/** Traditional props for the pricing rail. */
export type CoursePricingRailProps = { readonly state: "ready" | "price-pending" | "adding" | "trialing" | "checking-out"; readonly props: CoursePricingRailData; readonly on?: CoursePricingRailActions; readonly priceOverlay?: { readonly courseId: string; readonly title: string; readonly isOpen: boolean; readonly onDismiss: () => void }; readonly surface?: "rail" | "mobile" }
/** State values used by the connected pricing rail. */
export type CoursePricingRailState = CoursePricingRailProps["state"]

/** Draw the responsive pricing and enrolment controls. */
export const CoursePricingRailBase = (props: CoursePricingRailProps) => {
    const [intent, setIntent] = useState<"purchase" | "trial">("purchase")
    const pending = props.state === "price-pending"
    const data = props.props
    if (props.surface === "mobile") return <CourseMobileEnrollBarBase state={pending ? "price-pending" : "ready"} props={{ price: data.price, originalPrice: data.originalPrice, ctaLabel: data.ctaLabel }} on={{ act: props.on?.act }} />
    const phases = data.phases ?? []
    const canTrial = data.intent !== undefined && data.trialLabel !== undefined
    const visible = canTrial ? intent : "purchase"
    return <>
        <div className={pricingRailSurfaceStackClassName}>
            <ScrollViewport boundary="pricing-rail"><div className={pricingRailClassName}>
                <CoverImage props={{ src: data.coverUrl ?? null, alt: data.title, ratio: "wide" }} />
                {phases.find((phase) => phase.isActive) && <Badge tone={"accent"}>{phases.find((phase) => phase.isActive)?.name}</Badge>}
                <div className={pricingRailPriceEvidenceClassName}>
                    <div className={pricingRailPriceClassName}><Text size={"sm"} weight={"semibold"} isSkeleton={pending}>{data.price}</Text>{data.originalPrice === undefined || pending ? null : <Text size={"xs"} tone={"muted"} isSuperseded={true}>{data.originalPrice}</Text>}{data.discountLabel === undefined || pending ? null : <Badge tone={"success"}>{data.discountLabel}</Badge>}</div>
                    {data.priceDetailLabel === undefined || pending ? null : <div className={pricingRailPriceNoteClassName}>{data.savingsLabel && <Text size={"xs"} tone={"muted"}>{data.savingsLabel}</Text>}<TextAction size={"xs"} appearance="inline" onPress={props.on?.openPriceDetail}>{data.priceDetailLabel}</TextAction></div>}
                </div>
                {canTrial && <ChoiceTabs props={{ label: data.intent.intentTabsLabel, selectedKey: visible, variant: "primary", tabs: [{ id: "purchase", label: data.intent.purchaseModeLabel }, { id: "trial", label: data.intent.trialModeLabel }] }} on={{ select: (key) => { if (key === "purchase" || key === "trial") setIntent(key) } }} />}
                {visible === "purchase" ? <div className={pricingRailIntentClassName}>{data.intent && <div className={pricingRailIntentCopyClassName}><Text size={"sm"} weight={"medium"}>{data.intent.purchaseTitle}</Text><Text size={"sm"}>{data.intent.purchaseDescription}</Text></div>}<div className={pricingRailActionsClassName}><Button variant={"primary"} size={"md"} isPending={props.state === "checking-out"} onPress={({ press: props.on?.act })?.press} endContent={<Icon source={iconSourceFor("next", "chip")} usage="chip" />}>{data.ctaLabel}</Button>{data.cartLabel && <Button variant="secondary" size="md" isDisabled={data.isInCart} isPending={props.state === "adding"} onPress={props.on?.addToCart}>{data.cartLabel}</Button>}</div></div> : <div className={pricingRailIntentClassName}><div className={pricingRailIntentCopyClassName}><Text size={"sm"} weight={"medium"}>{data.intent?.trialTitle ?? data.trialLabel}</Text>{data.intent && <Text size={"sm"}>{data.intent.trialDescription}</Text>}</div><Button variant="tertiary" size="md" isPending={props.state === "trialing"} onPress={props.on?.trial}>{data.trialLabel!}</Button></div>}
                {data.scarcityLabel && <Badge tone={"warning"}>{data.scarcityLabel}</Badge>}
                {data.enrolmentLabel && <Text size={"xs"}>{data.enrolmentLabel}</Text>}
            </div></ScrollViewport>
            {phases.length > 0 && <PricingPhaseComparisonCard props={{ label: data.intent?.phaseDisclosureLabel ?? data.title, phases }} />}
        </div>
        {props.priceOverlay && <CoursePriceOverlay {...props.priceOverlay} />}
    </>
}

/** Public pricing rail component. */
export const CoursePricingRail = (props: CoursePricingRailProps) => <CoursePricingRailBase {...props} />
