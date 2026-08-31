import { cn } from "@heroui/react"
import {
    dashboardAccentBandTopClassName,
    dashboardBandSeparatorClassName,
    dashboardCardFooterClassName,
    dashboardFlushCardClassName,
    dashboardFlushSurfaceClassName,
} from "../classNames"

export const readinessSurfaceClassName = dashboardFlushSurfaceClassName
export const readinessCardClassName = dashboardFlushCardClassName
export const readinessSeparatorClassName = dashboardBandSeparatorClassName
export const readinessFooterClassName = dashboardCardFooterClassName

/** Readiness score and its qualitative band form one responsive accent band. */
export const readinessHeadlineClassName = cn(
    dashboardAccentBandTopClassName,
    "flex",
    "min-w-0",
    "flex-col",
    "gap-1",
    "sm:flex-row",
    "sm:items-center",
    "sm:justify-between",
)

/** Pillars are peer measures in one full-bleed separated stack. */
export const readinessMetricsClassName = cn(
    "grid",
    "min-w-0",
    "grid-cols-1",
    "divide-y",
    "divide-separator",
    "[&>div]:px-4",
    "[&>div]:py-3",
    "[&>div:last-child]:pb-4",
)
