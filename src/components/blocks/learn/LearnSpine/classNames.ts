import { cn } from "@heroui/react"

/** Resolve expanded, collapsed, or drawer navigation framing. */
export const getLearnSpineNavigationClassName = (isCollapsed: boolean, isDrawer: boolean) => cn("flex", "h-full", "w-full", "min-w-0", "flex-col", "gap-4", "overflow-hidden", "px-3", "py-6", !isDrawer && "hidden", !isDrawer && "md:flex", isCollapsed && "items-center")
/** Resolve the collapse control alignment. */
export const getLearnSpineToggleClassName = (isCollapsed: boolean) => cn("flex", "w-full", isCollapsed ? "justify-center" : "justify-end")
/** Full-width home row. */
export const learnSpineHomeClassName = cn("flex", "w-full", "min-w-0", "items-center", "[&>*]:w-full")
/** Resume card content. */
export const learnSpineResumeClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-1", "p-4")
/** Home and every destination share one ScrollViewport beneath the fixed rail chrome. */
export const learnSpineScrollableContentClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-4")
/** Group stack; scrolling belongs to the surrounding ScrollViewport branch. */
export const learnSpineGroupsClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-4")
/** One labelled or compact destination group. */
export const learnSpineGroupClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-1")
