"use client"

import { useState } from "react"
import { SurfaceAccordionCard } from "@/components/branches/SurfaceAccordionCard"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Text } from "@/components/leaves/Text"
import {
    defineContractComponent,
    defineLeafComponent,
    type CompositeProps,
} from "@/components/contracts/props"

/** One already-resolved phase shown by the disclosure. */
export type PricingPhaseDisclosurePhase = {
    readonly id: string
    readonly name: string
    readonly value: string
    readonly isActive?: boolean
}

/** Data owned by the intrinsic phase disclosure. */
export type PricingPhaseDisclosureData = {
    readonly label: string
    readonly phases: ReadonlyArray<PricingPhaseDisclosurePhase>
    readonly isOpen?: boolean
}

/** Props for {@link PricingPhaseDisclosure}. */
export type PricingPhaseDisclosureProps = CompositeProps<PricingPhaseDisclosureData>

/**
 * Reveal phase comparison only when requested.
 *
 * Native details/summary own keyboard and focus semantics while contracts own every arranged node.
 * The rows intentionally have no nested card, border or radius: they are supporting facts inside
 * the rail's sole SurfaceCard.
 */
export const PricingPhaseDisclosure = (input: PricingPhaseDisclosureProps) => {
    const [isOpen, setIsOpen] = useState(input.props.isOpen === true)
    return (
        <SurfaceAccordionCard
            isOpen={isOpen}
            summaryContract="pricing-phase-disclosure-summary"
            summaryRender={defineContractComponent("pricing-phase-disclosure-summary", {
                label: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                    <Text
                        props={{ content: input.props.label, size: "sm", weight: "medium" }}
                        isLoading={input.isLoading}
                    />
                )),
                indicator: defineLeafComponent("disclosure-indicator", {}, () => (
                    <DisclosureIndicator props={{ isOpen }} />
                )),
            })}
            bodyContract="pricing-phase-list"
            bodyRender={defineContractComponent("pricing-phase-list", {
                phase: input.props.phases.map((phase) => defineContractComponent("pricing-phase-row", {
                    name: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text
                            props={{
                                content: phase.name,
                                size: "sm",
                                tone: phase.isActive === true ? "accent" : "default",
                            }}
                        />
                    )),
                    value: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: phase.value, size: "sm", tone: "muted" }} />
                    )),
                })),
            })}
            onOpenChange={setIsOpen}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
