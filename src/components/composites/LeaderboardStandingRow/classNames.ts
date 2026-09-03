import { cn } from "@heroui/react"

/** Rank medal, title/subtitle column and an optional trailing fact share one row seam. */
export const leaderboardStandingRowClassName = cn(
    "grid",
    "min-w-0",
    "items-center",
    "gap-3",
    "grid-cols-[auto_1fr_auto]",
)

/** Title and subtitle stack owns the flexible middle column. */
export const leaderboardStandingBodyClassName = cn("min-w-0")
