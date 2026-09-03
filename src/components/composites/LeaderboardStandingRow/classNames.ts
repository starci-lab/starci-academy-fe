import { cn } from "@heroui/react"

/** Rank medal, title/subtitle column and an optional trailing fact share one row seam. */
export const leaderboardStandingRowClassName = cn(
    "flex",
    "min-w-0",
    "items-center",
    "gap-3",
)

/** Title and subtitle stack owns the flexible middle cell and the row's spare width. */
export const leaderboardStandingBodyClassName = cn("min-w-0", "flex-1")
