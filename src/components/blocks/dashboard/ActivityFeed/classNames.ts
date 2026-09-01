import { cn } from "@heroui/react"

/** Keep every day in one continuous activity collection. */
export const activityFeedClassName = cn("flex", "min-w-0", "flex-col")

/** Bind one calendar label to its activity rows. */
export const activityDayClassName = cn("flex", "min-w-0", "flex-col", "border-t", "border-separator", "first:border-t-0")

/** Use the date as a quiet in-list divider instead of introducing another card. */
export const activityDayLabelClassName = cn("bg-surface-secondary", "px-3", "py-2")

/** Rows remain joined beneath their owning date. */
export const activityDayRowsClassName = cn("min-w-0")
