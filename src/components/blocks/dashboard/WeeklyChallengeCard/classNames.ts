import { cn } from "@heroui/react"
import {
    dashboardAccentBandTopClassName,
    dashboardBandSeparatorClassName,
    dashboardCardFooterClassName,
    dashboardFlushCardClassName,
    dashboardFlushListEntryClassName,
    dashboardFlushSurfaceClassName,
    dashboardMetricCellPaddingClassName,
} from "../classNames"

export const challengeSurfaceClassName = dashboardFlushSurfaceClassName
export const challengeCardClassName = dashboardFlushCardClassName
export const challengeSeparatorClassName = dashboardBandSeparatorClassName
export const challengeFooterClassName = dashboardCardFooterClassName

/** Countdown urgency sits on the first accent band at the card top. */
export const challengeCountdownClassName = dashboardAccentBandTopClassName

/** Challenge identity: icon beside a title and muted description stack. */
export const challengeHeadingClassName = cn(
    dashboardMetricCellPaddingClassName,
    "flex",
    "min-w-0",
    "items-start",
    "gap-3",
)

export const challengeIdentityClassName = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-0.5")

/** Full-bleed joined finisher rows inside the flush card body. */
export const challengeFinisherListClassName = cn(
    "m-0",
    "list-none",
    "p-0",
    "divide-y",
    "divide-separator",
)

/** One compact finisher row: avatar, flexible identity, trailing time. */
export const challengeFinisherClassName = cn(
    dashboardFlushListEntryClassName,
    "grid",
    "min-w-0",
    "items-center",
    "gap-3",
    "grid-cols-[auto_minmax(0,1fr)_auto]",
)
