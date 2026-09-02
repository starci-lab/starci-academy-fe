import { cn } from "@heroui/react"
import {
    dashboardBandSeparatorClassName,
    dashboardCardFooterClassName,
    dashboardFlushCardClassName,
    dashboardMetricCellPaddingClassName,
} from "../classNames"

/** Stack streak bands without inserting space around their divider. */
export const streakCardClassName = cn(dashboardFlushCardClassName)
/** Separate the streak summary from its daily action. */
export const streakSeparatorClassName = cn(dashboardBandSeparatorClassName)

/** The week run and streak facts share one summary band. */
export const streakSummaryClassName = cn(
    dashboardMetricCellPaddingClassName,
    "flex",
    "min-w-0",
    "flex-col",
    "gap-3",
    "sm:flex-row",
    "sm:items-center",
    "sm:justify-between",
    "sm:gap-4",
)

/** Current streak and record are peer facts beside the week run. */
export const streakFactClassName = cn("flex", "min-w-0", "shrink-0", "items-center", "gap-3")

/** Empty guidance or daily nudge sits below the separator. */
export const streakActionClassName = cn(
    dashboardCardFooterClassName,
    "flex",
    "min-w-0",
    "flex-col",
    "gap-3",
    "sm:flex-row",
    "sm:items-center",
    "sm:justify-between",
    "sm:gap-4",
)
