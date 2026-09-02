import { cn } from "@heroui/react"
import {
    dashboardBandSeparatorClassName,
    dashboardCardFooterClassName,
    dashboardFlushCardClassName,
    dashboardMetricCellPaddingClassName,
} from "@/components/blocks/dashboard/classNames"

/** Calendar heading, plot, and footer stack. */
export const contributionCalendarClassName = cn("flex", "w-full", "flex-col", "gap-3")

/** Wrapping calendar summary/legend row. */
export const contributionCalendarRowClassName = cn(
    "flex",
    "w-full",
    "flex-row",
    "flex-wrap",
    "items-center",
    "justify-between",
    "gap-3",
)

/** Full-bleed dashboard calendar body. */
export const contributionCalendarFlushClassName = cn(dashboardFlushCardClassName)

/** Divide each full-bleed calendar band without adding another inset. */
export const contributionCalendarSeparatorClassName = cn(dashboardBandSeparatorClassName)

/** Year summary and selector share one top band. */
export const contributionCalendarHeaderBandClassName = cn(
    contributionCalendarRowClassName,
    dashboardMetricCellPaddingClassName,
)

/** Heatmap owns the middle evidence band. */
export const contributionCalendarGridBandClassName = cn(
    dashboardMetricCellPaddingClassName,
    "min-w-0",
)

/** Streak and intensity key share the bottom footer band. */
export const contributionCalendarFooterBandClassName = cn(
    contributionCalendarRowClassName,
    dashboardCardFooterClassName,
)
