import { cn } from "@heroui/react"

/** Actor avatar, flexible activity body, and trailing time. */
export const activityRowClassName = (isBottomEdge = false) => `${cn(
    "grid",
    "w-full",
    "min-w-0",
    "items-start",
    "gap-3",
    "border-t",
    "border-separator",
    "px-4",
    isBottomEdge ? "pt-3" : "py-3",
    isBottomEdge && "pb-4",
    "first:border-t-0",
    "[&>*:nth-child(2)]:min-w-0",
)} grid-cols-[auto_minmax(0,1fr)]`
/** Activity sentence with its optional reaction directly beneath it. */
export const activityBodyClassName = cn("flex", "flex-col", "gap-3")
/** Sentence and timestamp stack while compact and share one scan line when space permits. */
export const activityContentClassName = `${cn("grid", "min-w-0", "grid-cols-1", "gap-2", "items-start")} sm:grid-cols-[minmax(0,1fr)_auto]`
/** Wrapping actor-action-target sentence. */
export const activitySentenceClassName = cn("flex", "min-w-0", "flex-row", "flex-wrap", "items-center", "gap-x-2", "gap-y-1")
/** Time never fragments into separate clock and meridiem lines. */
export const activityTimeClassName = cn("min-w-max", "whitespace-nowrap", "justify-self-start", "sm:justify-self-end")
