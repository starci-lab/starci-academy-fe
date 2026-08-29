import { cn } from "@heroui/react"

/** Actor avatar, flexible activity body, and trailing time. */
export const activityRowClassName = cn("flex", "w-full", "flex-row", "items-start", "gap-3", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow")
/** Activity sentence with its optional reaction directly beneath it. */
export const activityBodyClassName = cn("flex", "flex-col", "gap-3")
/** Wrapping actor-action-target sentence. */
export const activitySentenceClassName = cn("flex", "flex-row", "flex-wrap", "items-center", "gap-2")
