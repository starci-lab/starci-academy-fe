import { cn } from "@heroui/react"

/** `course-progress-row` from the contract registry. */
export const courseProgressRowClassName = cn("flex", "w-full", "flex-row", "items-center", "gap-4", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow")
/** `course-progress-body` from the contract registry. */
export const courseProgressBodyClassName = cn("flex", "min-w-0", "grow", "flex-col", "gap-3")
/** `course-progress-heading` from the contract registry. */
export const courseProgressHeadingClassName = cn("flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-2")
/** `segmented-progress-track` from the contract registry. */
export const courseProgressTrackClassName = cn("flex", "w-full", "flex-row", "items-center", "gap-1")
/** `progress-dimension-legend` from the contract registry. */
export const courseProgressLegendClassName = cn("flex", "flex-row", "flex-wrap", "items-center", "gap-3")
/** `status-dot-with-label` from the contract registry. */
export const courseProgressLegendItemClassName = cn("flex", "flex-row", "items-center", "gap-2")
