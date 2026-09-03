import { cn } from "@heroui/react"

/** Vertical stack spacing shared by flush rail row groups (stats, quick actions). */
export const dashboardRailRowStackClassName = cn("flex", "min-w-0", "flex-col", "gap-1", "p-0")

/** Inset and rhythm for one flush rail row without list semantics. */
export const dashboardRailRowItemClassName = cn(
    "flex",
    "min-w-0",
    "w-full",
    "items-center",
    "gap-2",
    "rounded-lg",
    "px-2",
    "py-2",
    "[&>[data-part=icon-label-fact-row]]:min-w-0",
    "[&>[data-part=icon-label-fact-row]]:flex-1",
)

/** Stack full-bleed bands inside one bounded dashboard surface. */
export const dashboardFlushCardClassName = cn("flex", "min-w-0", "flex-col")

/** Separate stacked dashboard bands without inventing extra vertical space. */
export const dashboardBandSeparatorClassName = cn("border-t", "border-separator")

/** Shared accent-soft surface treatment for dashboard summary bands. */
export const dashboardAccentBandClassName = cn(
    "bg-accent-soft",
    "text-accent-soft-foreground",
)

/** Neutral summary treatment; copy inside keeps its own foreground or muted semantic tone. */
export const dashboardNeutralBandClassName = cn("bg-surface-secondary", "text-foreground")

/** First neutral band in a flush card: outer top edge 16px, separator edge 12px. */
export const dashboardNeutralBandTopClassName = cn(
    dashboardNeutralBandClassName,
    "px-4",
    "pt-4",
    "pb-3",
)

/** Neutral band between separators: px-4 always; p-3 on both separator sides vertically. */
export const dashboardNeutralBandMiddleClassName = cn(
    dashboardNeutralBandClassName,
    "px-4",
    "py-3",
)

/** First accent band in a flush card: outer top edge 16px, separator edge 12px. */
export const dashboardAccentBandTopClassName = cn(
    dashboardAccentBandClassName,
    "px-4",
    "pt-4",
    "pb-3",
)

/** Accent band between separators: px-4 always; p-3 on both separator sides vertically. */
export const dashboardAccentBandMiddleClassName = cn(
    dashboardAccentBandClassName,
    "px-4",
    "py-3",
)

/** Keep a card's lone action separated at the bottom edge. */
export const dashboardCardFooterClassName = cn("border-t", "border-separator", "px-4", "pb-4", "pt-3")

/** Base cell inset: p-4 with pb-3 on separator-adjacent bands. */
export const dashboardMetricCellPaddingClassName = cn("p-4", "pb-3")

/** Close a metric band against the card's bottom outer edge only. */
export const dashboardMetricCellBottomEdgeClassName = cn("pb-4")

/** One divided row inside a flush dashboard list: px-4 always; pb-4 only on the bottom edge. */
export const dashboardFlushListEntryClassName = cn(
    "px-4",
    "pt-3",
    "pb-3",
    "last:pb-4",
)
