"use client"

import { useState } from "react"
import { ScrollViewport } from "@/components/branches/ScrollViewport"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { CoverImage } from "@/components/leaves/CoverImage"
import { PricingPhaseDisclosure } from "@/components/composites/PricingPhaseDisclosure"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"

/**
 * BLOCK - `CoursePricingRail`: the one place this page asks for money.
 *
 * Target path: `src/components/blocks/courses/CoursePricingRail/component.tsx`.
 *
 * THE HERO CARRIES NO PRICE, and that is the selected direction's whole shape rather than an
 * oversight. The named render puts every commerce fact here - artwork, the payable price, one
 * discount, one scarcity line, the phase ladder, one action, and the enrolment proof - so a reader
 * never has to decide which of two buy boxes is authoritative.
 *
 * IT IS AN `aside`, WHICH IS THIS REVISION'S POINT. The entry says so, not this file. Complementary
 * to the narrative and announced as such, so a reader navigating by region can reach the price
 * without reading the curriculum and can skip it without losing their place in it.
 *
 * THE LADDER IS ONE CONTROL, NOT THREE FACTS. The open phase is the price; the phases below it are
 * what waiting costs. The entry makes it an `ol` for the same reason.
 *
 * THE PRICE RESTS ALONE WHILE IT IS PENDING. The legacy rail skeletons its headline rather than
 * showing the phase price and swapping it for the viewer's loyalty price a moment later, because
 * that swap is a number changing under a reader who was already deciding.
 *
 * WHY THE PRICE IS `sm` AND THE DISCOUNT IS A BADGE. `price-discount-line` is LOCKED, and it
 * declares exactly that: `price` at `size: "sm"` with `weight: "semibold"`, `original` at `xs` with
 * `tone: "muted"`, and `discount` as a **badge**. Revision 1.3 drew the price at `md` and the
 * discount as accent-toned text, which the candidate's own shim allowed because it never checked a
 * slot's declared props. Reusing a locked key means accepting what it already says - the alternative
 * is a new key, and a course page that quietly redefines the shared price line is how two pages stop
 * showing prices the same way.
 */

/** One phase in the ladder. */
export type PricingPhase = {
    /** Stable identity. */
    readonly id: string
    /** The already-resolved phase name. */
    readonly name: string
    /** The already-resolved trailing value - a price, or the word for an open phase. */
    readonly value: string
    /** Whether this is the phase currently on sale. */
    readonly isActive?: boolean
}

/** Localized framing that separates buying from exploring. */
export type CoursePricingRailIntentCopy = {
    readonly intentTabsLabel: string
    readonly purchaseModeLabel: string
    readonly trialModeLabel: string
    readonly purchaseTitle: string
    readonly purchaseDescription: string
    readonly trialTitle: string
    readonly trialDescription: string
    readonly phaseDisclosureLabel: string
}

/** What the rail draws. */
export type CoursePricingRailData = {
    /** Resolved copy for the two decision intents and phase disclosure. */
    readonly intent?: CoursePricingRailIntentCopy
    /** Artwork source; `null` draws the leaf's token fallback. */
    readonly coverUrl?: string | null
    /** The course title, used as the artwork's alternative text. */
    readonly title: string
    /** The already-formatted payable price. Absent while the viewer's price is still pending. */
    readonly price?: string
    /** The already-formatted list price. */
    readonly originalPrice?: string
    /** The already-formatted discount. */
    readonly discountLabel?: string
    /** The already-formatted savings sentence. */
    readonly savingsLabel?: string
    /** Opens the server-owned price breakdown. */
    readonly priceDetailLabel?: string
    /** One scarcity line, e.g. remaining slots in the open phase. */
    readonly scarcityLabel?: string
    /** The ladder. An empty run renders no ladder at all. */
    readonly phases?: ReadonlyArray<PricingPhase>
    /** The already-resolved action label. */
    readonly ctaLabel: string
    /** The already-resolved trial action label. Absent hides the trial action. */
    readonly trialLabel?: string
    /** The already-resolved cart action label. Absent hides the cart action. */
    readonly cartLabel?: string
    /** Whether this course is already in the viewer's cart. */
    readonly isInCart?: boolean
    /** The already-formatted enrolment proof sentence. */
    readonly enrolmentLabel?: string
}

/** What the rail reports. */
export type CoursePricingRailActions = {
    /** Continue learning or enter checkout. */
    readonly act?: () => void
    /** Open the course's previewable learning path. */
    readonly trial?: () => void
    /** Add this course to, or remove it from, the cart. */
    readonly addToCart?: () => void
    /** Explain list, phase, loyalty and payable price in a modal. */
    readonly openPriceDetail?: () => void
}

/** The situations the rail can be in. */
export type CoursePricingRailState = "ready" | "price-pending" | "adding" | "trialing" | "checking-out"

/** Props for {@link _CoursePricingRail}. */
export type CoursePricingRailProps = {
    /** The business situation, which picks the tree. */
    readonly state: CoursePricingRailState
    /** What that tree says. */
    readonly props: CoursePricingRailData
    /** What the rail reports. */
    readonly on?: CoursePricingRailActions
}

/**
 * Draw the buy box.
 *
 * @param input - {@link CoursePricingRailProps}
 */
export const _CoursePricingRail = (input: CoursePricingRailProps) => {
    const [selectedIntent, setSelectedIntent] = useState<"purchase" | "trial">("purchase")
    const cartLabel = input.props.cartLabel
    const trialLabel = input.props.trialLabel
    const isPricePending = input.state === "price-pending"
    const isAdding = input.state === "adding"
    const isTrialing = input.state === "trialing"
    const isCheckingOut = input.state === "checking-out"
    const phases = input.props.phases ?? []
    const activePhase = phases.find((phase) => phase.isActive === true)
    const hasIntentSwitch = trialLabel !== undefined && input.props.intent !== undefined
    const visibleIntent = hasIntentSwitch ? selectedIntent : "purchase"

    const priceLine = defineContractComponent("price-discount-line", {
        price: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
            <Text props={{ content: input.props.price, size: "sm", weight: "semibold" }} isLoading={isPricePending} />
        )),
        original: input.props.originalPrice === undefined || isPricePending
            ? undefined
            : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: input.props.originalPrice, size: "xs", tone: "muted", isSuperseded: true }} />
            )),
        discount: input.props.discountLabel === undefined || isPricePending
            ? undefined
            : defineLeafComponent("badge", {}, () => (
                <Badge props={{ content: input.props.discountLabel, tone: "success" }} />
            )),
    })

    const pricePrimary = defineContractComponent("course-price-primary-group", {
        line: priceLine,
        note: input.props.priceDetailLabel === undefined || isPricePending
            ? undefined
            : defineContractComponent("price-note-row", {
                fact: input.props.savingsLabel === undefined
                    ? undefined
                    : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: input.props.savingsLabel, size: "xs", tone: "muted" }} />
                    )),
                action: defineLeafComponent("text-link", { size: "xs" }, () => (
                    <TextLink
                        props={{ label: input.props.priceDetailLabel ?? "", size: "xs" }}
                        on={{ press: input.on?.openPriceDetail }}
                    />
                )),
            }),
    })

    const priceBlock = defineContractComponent("course-price-block", {
        primary: pricePrimary,
        scarcity: input.props.scarcityLabel === undefined
            ? undefined
            : defineLeafComponent("badge", {}, () => (
                <Badge props={{ content: input.props.scarcityLabel, tone: "warning" }} />
            )),
    })

    return (
        <ScrollViewport
            boundary="pricing-rail"
            render={defineContractComponent("course-pricing-rail", {
                cover: defineLeafComponent("cover-image", {}, () => (
                    <CoverImage props={{ src: input.props.coverUrl ?? null, alt: input.props.title, ratio: "wide" }} />
                )),
                phase: activePhase === undefined
                    ? undefined
                    : defineLeafComponent("badge", {}, () => (
                        <Badge props={{ content: activePhase.name, tone: "accent" }} />
                    )),
                price: priceBlock,
                selector: hasIntentSwitch
                    ? defineLeafComponent("choice-tabs", {}, () => (
                        <ChoiceTabs
                            props={{
                                label: input.props.intent?.intentTabsLabel ?? input.props.title,
                                selectedKey: visibleIntent,
                                variant: "primary",
                                tabs: [
                                    { id: "purchase", label: input.props.intent?.purchaseModeLabel ?? input.props.ctaLabel },
                                    { id: "trial", label: input.props.intent?.trialModeLabel ?? trialLabel },
                                ],
                            }}
                            on={{
                                select: (key) => {
                                    if (key === "purchase" || key === "trial") setSelectedIntent(key)
                                },
                            }}
                        />
                    ))
                    : undefined,
                purchase: visibleIntent === "purchase"
                    ? defineContractComponent("course-pricing-purchase-intent", {
                        copy: input.props.intent === undefined
                            ? undefined
                            : defineContractComponent("course-pricing-purchase-copy", {
                                heading: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                                    <Text props={{ content: input.props.intent?.purchaseTitle, size: "sm", weight: "medium" }} />
                                )),
                                description: defineLeafComponent("text", { size: "sm" }, () => (
                                    <Text props={{ content: input.props.intent?.purchaseDescription, size: "sm" }} />
                                )),
                            }),
                        actions: defineContractComponent("course-pricing-purchase-actions", {
                            primary: defineLeafComponent("button", {}, () => (
                                <Button
                                    props={{
                                        label: input.props.ctaLabel,
                                        variant: "primary",
                                        size: "md",
                                        icon: "next",
                                        iconPlacement: "trailing",
                                        isPending: isCheckingOut,
                                    }}
                                    on={{ press: input.on?.act }}
                                />
                            )),
                            cart: cartLabel === undefined
                                ? undefined
                                : defineLeafComponent("button", {}, () => (
                                    <Button
                                        props={{
                                            label: cartLabel,
                                            variant: "secondary",
                                            size: "md",
                                            isPending: isAdding,
                                        }}
                                        on={{ press: input.on?.addToCart }}
                                    />
                                )),
                        }),
                    })
                    : undefined,
                exploration: visibleIntent !== "trial" || trialLabel === undefined
                    ? undefined
                    : defineContractComponent("course-pricing-exploration-intent", {
                        heading: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                            <Text
                                props={{
                                    content: input.props.intent?.trialTitle ?? trialLabel,
                                    size: "sm",
                                    weight: "medium",
                                }}
                            />
                        )),
                        description: input.props.intent === undefined
                            ? undefined
                            : defineLeafComponent("text", { size: "sm" }, () => (
                                <Text props={{ content: input.props.intent?.trialDescription, size: "sm" }} />
                            )),
                        action: defineLeafComponent("button", {}, () => (
                            <Button
                                props={{ label: trialLabel, variant: "tertiary", size: "md", isPending: isTrialing }}
                                on={{ press: input.on?.trial }}
                            />
                        )),
                    }),
                ladder: phases.length === 0
                    ? undefined
                    : defineCompositeComponent("pricing-phase-disclosure", {}, () => (
                        <PricingPhaseDisclosure
                            props={{
                                label: input.props.intent?.phaseDisclosureLabel ?? input.props.title,
                                phases,
                            }}
                        />
                    )),
                proof: input.props.enrolmentLabel === undefined
                    ? undefined
                    : defineLeafComponent("text", { size: "xs" }, () => (
                        <Text props={{ content: input.props.enrolmentLabel, size: "xs" }} />
                    )),
            })}
        />
    )
}

/**
 * The rail, branded for the slot that holds it.
 *
 * A projection rather than bound slots: `SurfaceCard` has already drawn the contract's `Tree`, and
 * `ContractContent` renders a projection without opening a second node around it. Binding slots
 * here instead would inset the rail twice.
 */
export const CoursePricingRail = (input: CoursePricingRailProps) =>
    defineContractProjection("course-pricing-rail", () => <_CoursePricingRail {...input} />)

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
