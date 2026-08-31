import { cn } from "@heroui/react"
import {
    dashboardAccentBandTopClassName,
    dashboardBandSeparatorClassName,
    dashboardCardFooterClassName,
    dashboardFlushCardClassName,
    dashboardFlushSurfaceClassName,
} from "../classNames"

export const weeklyGoalsSurfaceClassName = dashboardFlushSurfaceClassName
export const weeklyGoalsCardClassName = dashboardFlushCardClassName
export const weeklyGoalsSeparatorClassName = dashboardBandSeparatorClassName
export const weeklyGoalsSummaryBandClassName = dashboardAccentBandTopClassName
export const weeklyGoalsFooterClassName = dashboardCardFooterClassName

/** Present the six fixed weekly targets as one full-bleed two-column evidence board. */
export const weeklyGoalsGridClassName = cn(
    "grid",
    "min-w-0",
    "grid-cols-1",
    "p-0",
    "sm:grid-cols-2",
)

/** px-4 always; pb-4 only on the bottom edge; p-3 on separator sides vertically. */
export const weeklyGoalsCellClassName = cn(
    "min-w-0",
    "px-4",
    "pt-3",
    "pb-3",
    "border-t",
    "border-separator",
    "first:border-t-0",
    "sm:[&:nth-child(2)]:border-t-0",
    "sm:[&:nth-child(odd)]:border-r",
    "sm:[&:nth-child(odd)]:border-separator",
    "last:pb-4",
    "sm:[&:nth-child(5)]:pb-4",
    "sm:[&:nth-child(6)]:pb-4",
)
