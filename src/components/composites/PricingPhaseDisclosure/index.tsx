"use client"

import { useState } from "react"
import { SurfaceAccordionCard } from "@starci/grammar/core"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Text } from "@/components/leaves/Text"

/** One resolved pricing phase. */
export type PricingPhaseDisclosurePhase = { readonly id: string; readonly name: string; readonly value: string; readonly isActive?: boolean }
/** Pricing disclosure content and initial state. */
export type PricingPhaseDisclosureData = { readonly label: string; readonly phases: ReadonlyArray<PricingPhaseDisclosurePhase>; readonly isOpen?: boolean }
/** Public inputs for the pricing disclosure. */
export type PricingPhaseDisclosureProps = { readonly props: PricingPhaseDisclosureData; readonly isLoading?: boolean }

/** Reveal pricing phases with native disclosure semantics supplied by Grammar. */
export const PricingPhaseDisclosure = (props: PricingPhaseDisclosureProps) => {
    const [isOpen, setIsOpen] = useState(props.props.isOpen === true)
    return <SurfaceAccordionCard
        isOpen={isOpen}
        renderSummary={(summary) => <>{summary}</>}
        summaryRender={<><Text props={{ content: props.props.label, size: "sm", weight: "medium" }} isLoading={props.isLoading} /><DisclosureIndicator props={{ isOpen }} /></>}
        renderBody={(body) => <>{body}</>}
        bodyRender={<ul>{props.props.phases.map((phase) => <li key={phase.id}><Text props={{ content: phase.name, size: "sm", tone: phase.isActive === true ? "accent" : "default" }} /><Text props={{ content: phase.value, size: "sm", tone: "muted" }} /></li>)}</ul>}
        onOpenChange={setIsOpen}
    />
}
