"use client"

import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Text } from "@/components/leaves/Text"
import { getPricingPhaseMarkerClassName, pricingPhaseListClassName, pricingPhaseRowClassName } from "./classNames"

/** One resolved pricing phase. */
export type PricingPhaseComparison = { readonly id: string; readonly name: string; readonly value: string; readonly isActive?: boolean }
/** Pricing comparison content. */
export type PricingPhaseComparisonCardData = { readonly label: string; readonly phases: ReadonlyArray<PricingPhaseComparison> }
/** Public inputs for the pricing comparison card. */
export type PricingPhaseComparisonCardProps = { readonly props: PricingPhaseComparisonCardData; readonly isLoading?: boolean }

/** Present a short phase comparison as a visible peer surface, without disclosure state. */
export const PricingPhaseComparisonCard = (props: PricingPhaseComparisonCardProps) => <SurfaceCard props={{ label: props.props.label, inset: "compact" }} isLoading={props.isLoading}>
    <ol aria-label={props.props.label} className={pricingPhaseListClassName}>{props.props.phases.map((phase) => <li className={pricingPhaseRowClassName} data-current-phase={phase.isActive === true ? "true" : undefined} key={phase.id}><span aria-hidden="true" className={getPricingPhaseMarkerClassName(phase.isActive === true)} /><Text props={{ content: phase.name, size: "sm" }} /><Text props={{ content: phase.value, size: "sm", tone: phase.isActive === true ? "accent" : "muted" }} /></li>)}</ol>
</SurfaceCard>
