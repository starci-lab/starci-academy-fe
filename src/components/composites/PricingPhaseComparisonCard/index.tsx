"use client"

import { SurfaceCard } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { getPricingPhaseMarkerClassName, pricingPhaseListClassName, pricingPhaseRowClassName } from "./classNames"

/** One resolved pricing phase. */
export type PricingPhaseComparison = { readonly id: string; readonly name: string; readonly value: string; readonly isActive?: boolean }
/** Pricing comparison content. */
export type PricingPhaseComparisonCardData = { readonly label: string; readonly phases: ReadonlyArray<PricingPhaseComparison> }
/** Public inputs for the pricing comparison card. */
export type PricingPhaseComparisonCardProps = { readonly props: PricingPhaseComparisonCardData; readonly isLoading?: boolean }

/** Present a short phase comparison as a visible peer surface, without disclosure state. */
export const PricingPhaseComparisonCard = (props: PricingPhaseComparisonCardProps) => <SurfaceCard label={props.props.label} composition="single" state={props.isLoading ? "pending" : "neutral"}>
    <ol aria-label={props.props.label} className={pricingPhaseListClassName}>{props.props.phases.map((phase) => <li className={pricingPhaseRowClassName} data-current-phase={phase.isActive === true ? "true" : undefined} key={phase.id}><span aria-hidden="true" className={getPricingPhaseMarkerClassName(phase.isActive === true)} /><Text size={"sm"}>{phase.name}</Text><Text size={"sm"} tone={phase.isActive === true ? "accent" : "muted"}>{phase.value}</Text></li>)}</ol>
</SurfaceCard>
