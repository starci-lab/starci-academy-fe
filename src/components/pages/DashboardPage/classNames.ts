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

/** Pin compact rail controls immediately below the two-layer application navigation. */
export const dashboardCompactSubnavClassName = cn(
    "!top-[calc(6rem+1px)]",
    "[--starci-core-subnav-offset:calc(6rem+1px)]",
    "transform-gpu",
    "will-change-transform",
    "[backface-visibility:hidden]",
    "[&_[data-grammar-subnav-toggle=true]]:!size-11",
    "[&_[data-grammar-subnav-toggle=true]]:!rounded-full",
    "[&_[data-grammar-subnav-toggle=true]]:!bg-default",
    "[&_[data-grammar-subnav-toggle=true]]:hover:!bg-default",
)

/** Identity and shortcuts stay pinned flush left with an independent scroll lane. */
export const dashboardLeadingRailRegionClassName = cn(
    "w-full",
    "min-w-0",
    "shrink-0",
    "px-3",
    "py-6",
    "border-separator",
    "lg:sticky",
    "lg:top-[calc(4rem+2rem+1px)]",
    "lg:z-10",
    "lg:flex",
    "lg:h-[calc(100dvh-4rem-2rem-1px)]",
    "lg:max-h-[calc(100dvh-4rem-2rem-1px)]",
    "lg:w-64",
    "lg:max-w-64",
    "lg:shrink-0",
    "lg:flex-col",
    "lg:self-start",
    "lg:overflow-hidden",
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

/** Keep standing fixed while the destination stack owns the remaining rail height. */
export const dashboardRailClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "flex-col",
    "gap-6",
    "lg:h-full",
    "lg:min-h-0",
    "lg:overflow-hidden",
)

/** Give the compact drawer the same one-scroll-owner rail anatomy at every viewport width. */
export const dashboardRailDrawerClassName = cn("h-full", "min-h-0", "overflow-hidden")

/** Drawer body owns no inset; keep the dashboard rail comfortably clear of its edges. */
export const dashboardRailDrawerViewportClassName = cn("h-full", "min-h-0", "w-full", "min-w-0", "px-3", "py-6")

/** Select the one rail presentation without rebuilding its anatomy at the call site. */
export const getDashboardRailClassName = (presentation: "inline" | "drawer") => cn(
    dashboardRailClassName,
    presentation === "drawer" && dashboardRailDrawerClassName,
)

/** Grammar-owned bounded viewport for quick access and panel-specific rail context. */
export const dashboardRailScrollRegionClassName = cn(
    "w-full",
    "min-w-0",
    "lg:h-0",
    "lg:min-h-0",
    "lg:max-h-full",
    "lg:flex-1",
    "lg:overflow-y-auto",
    "lg:overscroll-contain",
    "lg:touch-pan-y",
)

/** Compact rail destinations scroll inside the drawer while identity remains visible. */
export const dashboardRailDrawerScrollRegionClassName = cn(
    "h-0",
    "min-h-0",
    "max-h-full",
    "flex-1",
    "overflow-y-auto",
    "overscroll-contain",
    "touch-pan-y",
)

/** Select the bounded scroll contract that belongs to the active rail presentation. */
export const getDashboardRailScrollRegionClassName = (presentation: "inline" | "drawer") => cn(
    dashboardRailScrollRegionClassName,
    presentation === "drawer" && dashboardRailDrawerScrollRegionClassName,
)

/** Keep every scroll-owned rail section in one readable vertical run. */
export const dashboardRailScrollContentClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "flex-col",
    "gap-6",
    "pb-1",
)

/** Bound the shortcut list as a flush rail band instead of a nested card. */
export const dashboardRailActionsClassName = cn("min-w-0")

/** Let the selected dashboard panel consume the remaining width inside the main track. */
export const dashboardPanelClassName = cn("flex", "w-full", "max-w-none", "min-w-0", "flex-1", "flex-col", "gap-6")

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
    "[&>.starci-core-surface-card]:h-full",
    "[&>.starci-core-surface-card_.starci-core-surface]:h-full",
    "[&>.starci-core-surface-card_.starci-core-surface-content]:h-full",
    "[&>.starci-core-surface-card_.starci-core-surface-content>div]:h-full",
)

/** Stack the weekly challenge and learning-activity cards as one vertical evidence column. */
export const dashboardOverviewSupportClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-6",
    "max-lg:[&_[data-part=calendar-viewport]]:!overflow-x-auto",
    "max-lg:[&_[data-part=calendar-viewport]]:pb-2",
    "max-lg:[&_[data-part=calendar-grid]>span:first-child]:hidden",
)

/** Preserve a quiet, deliberate terminal update rhythm beneath the primary task. */
export const dashboardOverviewUpdatesClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
)
