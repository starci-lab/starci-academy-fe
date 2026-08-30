"use client"
import { useState } from "react"
import { ScrollViewport } from "@/components/branches/ScrollViewport"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { CoverImage } from "@/components/leaves/CoverImage"
import { PricingPhaseComparisonCard } from "@/components/composites/PricingPhaseComparisonCard"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import { CoursePriceOverlay } from "@/components/overlays/courses/CoursePriceOverlay"
import { CourseMobileEnrollBarBase } from "../CourseMobileEnrollBar/component"
import { pricingRailActionsClassName, pricingRailClassName, pricingRailIntentClassName, pricingRailIntentCopyClassName, pricingRailPriceClassName, pricingRailPriceEvidenceClassName, pricingRailPriceNoteClassName, pricingRailSurfaceStackClassName } from "./classNames"

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
                {phases.find((phase) => phase.isActive) && <Badge props={{ content: phases.find((phase) => phase.isActive)?.name, tone: "accent" }} />}
                <div className={pricingRailPriceEvidenceClassName}>
                    <div className={pricingRailPriceClassName}><Text props={{ content: data.price, size: "sm", weight: "semibold" }} isLoading={pending} />{data.originalPrice === undefined || pending ? null : <Text props={{ content: data.originalPrice, size: "xs", tone: "muted", isSuperseded: true }} />}{data.discountLabel === undefined || pending ? null : <Badge props={{ content: data.discountLabel, tone: "success" }} />}</div>
                    {data.priceDetailLabel === undefined || pending ? null : <div className={pricingRailPriceNoteClassName}>{data.savingsLabel && <Text props={{ content: data.savingsLabel, size: "xs", tone: "muted" }} />}<TextLink props={{ label: data.priceDetailLabel, size: "xs" }} on={{ press: props.on?.openPriceDetail }} /></div>}
                </div>
                {canTrial && <ChoiceTabs props={{ label: data.intent.intentTabsLabel, selectedKey: visible, variant: "primary", tabs: [{ id: "purchase", label: data.intent.purchaseModeLabel }, { id: "trial", label: data.intent.trialModeLabel }] }} on={{ select: (key) => { if (key === "purchase" || key === "trial") setIntent(key) } }} />}
                {visible === "purchase" ? <div className={pricingRailIntentClassName}>{data.intent && <div className={pricingRailIntentCopyClassName}><Text props={{ content: data.intent.purchaseTitle, size: "sm", weight: "medium" }} /><Text props={{ content: data.intent.purchaseDescription, size: "sm" }} /></div>}<div className={pricingRailActionsClassName}><Button props={{ label: data.ctaLabel, variant: "primary", size: "md", icon: "next", iconPlacement: "trailing", isPending: props.state === "checking-out" }} on={{ press: props.on?.act }} />{data.cartLabel && <Button props={{ label: data.cartLabel, variant: "secondary", size: "md", isPending: props.state === "adding", disabled: data.isInCart }} on={{ press: props.on?.addToCart }} />}</div></div> : <div className={pricingRailIntentClassName}><div className={pricingRailIntentCopyClassName}><Text props={{ content: data.intent?.trialTitle ?? data.trialLabel, size: "sm", weight: "medium" }} />{data.intent && <Text props={{ content: data.intent.trialDescription, size: "sm" }} />}</div><Button props={{ label: data.trialLabel!, variant: "tertiary", size: "md", isPending: props.state === "trialing" }} on={{ press: props.on?.trial }} /></div>}
                {data.scarcityLabel && <Badge props={{ content: data.scarcityLabel, tone: "warning" }} />}
                {data.enrolmentLabel && <Text props={{ content: data.enrolmentLabel, size: "xs" }} />}
            </div></ScrollViewport>
            {phases.length > 0 && <PricingPhaseComparisonCard props={{ label: data.intent?.phaseDisclosureLabel ?? data.title, phases }} />}
        </div>
        {props.priceOverlay && <CoursePriceOverlay {...props.priceOverlay} />}
    </>
}

/** Public pricing rail component. */
export const CoursePricingRail = (props: CoursePricingRailProps) => <CoursePricingRailBase {...props} />
