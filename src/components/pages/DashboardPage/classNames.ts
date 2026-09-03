import { cn } from "@heroui/react"

/** Dashboard body: sticky leading rail with an edge-attached rule beside the main track. */
export const dashboardFrameClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "flex-col",
    "gap-0",
    "pb-0",
    "scroll-pb-6",
    "lg:flex-row",
    "lg:items-start",
    "lg:gap-0",
    "lg:pb-0",
    "lg:scroll-pb-0",
    "lg:pl-0",
)

/**
 * The leading rail's track, and nothing about where it stops.
 *
 * A page owns the rail's width, the separator between it and the main track, and the stretch that
 * gives a sticky child room to travel. Where the rail begins and how tall it may be belong to
 * Grammar `Rail mode="sticky"`, which reads the `--starci-core-band-offset` the sticky band above it
 * publishes (@starci/grammar 0.4.5). The four `calc()` measures that used to restate that band -
 * the subnav offset token and the rail's `top`, `height` and `max-height` - are gone with the gap
 * that forced them, and the compact Subnav toggle keeps its 44px target from the package too.
 *
 * `lg:grid` is the stretch: one grid item takes the region's full height by default, so the rail's
 * own sticky frame has the travel a `self-start` flex item never had.
 */
export const dashboardLeadingRailRegionClassName = cn(
    "w-full",
    "min-w-0",
    "shrink-0",
    "border-separator",
    "lg:z-10",
    "lg:grid",
    "lg:w-64",
    "lg:shrink-0",
    "lg:self-stretch",
    "lg:border-r",
)

/** Selected panel sits in the space remaining after the rail. */
export const dashboardMainTrackClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "max-w-5xl",
    "flex-1",
    "flex-col",
    "gap-6",
    "px-3",
    "py-6",
    "outline-none",
    "mx-auto",
)

/**
 * The rail's own reading order, inside the Grammar `Rail` that owns everything else.
 *
 * `Rail` supplies the landmark, the inset, the bounded height and the single scroll owner at both
 * placements, so nothing here restates a viewport measure or a second overflow rule; this is the
 * vertical run between who the reader is and where they might go.
 */
export const dashboardRailContentClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "flex-col",
    "gap-6",
)

/** Drawer body owns no inset of its own; let the rail fill the panel it is placed in. */
export const dashboardRailDrawerViewportClassName = cn("h-full", "min-h-0", "w-full", "min-w-0")

/** Bound the shortcut list as a flush rail band instead of a nested card. */
export const dashboardRailActionsClassName = cn("min-w-0")

/** Let the selected dashboard panel consume the remaining width inside the main track. */
export const dashboardPanelClassName = cn("flex", "w-full", "min-w-0", "flex-1", "flex-col", "gap-6")

/** Compose Overview as one command-center stack: a lead decision, then supporting evidence. */
export const dashboardOverviewClassName = cn("flex", "min-w-0", "flex-col", "gap-6")

/** Give the current learning task the strongest span while keeping the quest visibly compact. */
export const dashboardOverviewLeadClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-6",
)

/** Let the primary resume surface own two thirds of the lead row at wide widths. */
export const dashboardOverviewPrimaryClassName = cn("min-w-0")

/** Keep the daily quest as a compact companion rather than a competing slab. */
export const dashboardOverviewQuestClassName = cn(
    "min-w-0",
)

/** Give the weekly streak its own full-width row in the main overview column. */
export const dashboardOverviewStreakClassName = cn(
    "flex",
    "min-w-0",
    "w-full",
    "flex-col",
    "self-start",
)

/** Recompose the three progress facts into a varied-density metric band. */
export const dashboardOverviewMetricsClassName = cn(
    "grid",
    "min-w-0",
    "items-stretch",
    "gap-3",
    "lg:grid-cols-2",
)

/** Stack the weekly challenge and learning-activity cards as one vertical evidence column. */
export const dashboardOverviewSupportClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-6",
)

/** Preserve a quiet, deliberate terminal update rhythm beneath the primary task. */
export const dashboardOverviewUpdatesClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
)
