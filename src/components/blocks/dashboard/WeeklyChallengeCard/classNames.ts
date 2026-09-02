import { cn } from "@heroui/react"
import {
    dashboardBandSeparatorClassName,
    dashboardCardFooterClassName,
    dashboardFlushCardClassName,
    dashboardFlushListEntryClassName,
    dashboardNeutralBandTopClassName,
} from "../classNames"

/** Stack challenge bands without inserting space around their dividers. */
export const challengeCardClassName = cn(dashboardFlushCardClassName)
/** Separate adjacent challenge bands with the shared dashboard rule. */
export const challengeSeparatorClassName = cn(dashboardBandSeparatorClassName)
/** Close the challenge action against the card's outer bottom edge. */
export const challengeFooterClassName = cn(dashboardCardFooterClassName)

/** A countdown is supporting timing metadata until business rules prove urgency. */
export const challengeCountdownClassName = cn(dashboardNeutralBandTopClassName)

/** Challenge identity: icon beside a title and muted description stack. */
export const challengeHeadingClassName = cn(
    "px-4",
    "py-3",
    "flex",
    "min-w-0",
    "items-start",
    "gap-3",
)

/** Bind the title to its quiet participation fact. */
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
export const challengeFinisherClassName = `${dashboardFlushListEntryClassName} grid min-w-0 items-center gap-3 grid-cols-[auto_minmax(0,1fr)_auto]`
