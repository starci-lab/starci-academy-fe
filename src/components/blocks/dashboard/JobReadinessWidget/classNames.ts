import { cn } from "@heroui/react"
import {
    dashboardBandSeparatorClassName,
    dashboardCardFooterClassName,
    dashboardFlushCardClassName,
    dashboardFlushListEntryClassName,
    dashboardNeutralBandTopClassName,
} from "../classNames"

export { dashboardFlushListEntryClassName as readinessMetricRowClassName }

/** Stack readiness bands without inserting space around their dividers. */
export const readinessCardClassName = cn(dashboardFlushCardClassName)
/** Separate adjacent readiness bands with the shared dashboard rule. */
export const readinessSeparatorClassName = cn(dashboardBandSeparatorClassName)
/** Close the auxiliary readiness action against the card's bottom edge. */
export const readinessFooterClassName = cn(dashboardCardFooterClassName)

/** Readiness score and its qualitative label form one responsive neutral summary band. */
export const readinessHeadlineClassName = cn(
    dashboardNeutralBandTopClassName,
    "flex",
    "min-w-0",
    "flex-col",
    "gap-1",
    "sm:flex-row",
    "sm:items-center",
    "sm:justify-between",
)

/** Pillars are peer measures in one full-bleed separated stack; each row wraps in readinessMetricRowClassName. */
export const readinessMetricsClassName = cn(
    "grid",
    "min-w-0",
    "grid-cols-1",
    "divide-y",
    "divide-separator",
)
