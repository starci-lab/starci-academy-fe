import { cn } from "@heroui/react"

/** Rank, avatar, name column and trailing facts share one row grid, plus the legacy two-pixel
 * semantic verdict band. Compact defers the last two columns below `sm`. */
export const getRankedUserRowClassName = (layout: "full" | "compact", verdict?: "success" | "danger") => cn(
    "grid",
    "w-full",
    "min-w-0",
    "items-center",
    "gap-2",
    layout === "compact" && "sm:gap-3",
    layout === "full" && "gap-3",
    layout === "compact" ? "grid-cols-[auto_auto_1fr_auto]" : "grid-cols-[auto_auto_1fr_auto_auto_auto]",
    layout === "compact" && "sm:grid-cols-[auto_auto_1fr_auto_auto_auto]",
    verdict !== undefined && "pl-4",
    verdict === "success" && "inset-shadow-[2px_0_0_0_var(--success)]",
    verdict === "danger" && "inset-shadow-[2px_0_0_0_var(--danger)]",
)

/** Name/subtitle stack truncates before the trailing fact columns. */
export const rankedUserNameColumnClassName = cn("min-w-0", "overflow-hidden")

/** Points column never wraps and stays right-aligned against the trailing edge. */
export const rankedUserPointsColumnClassName = cn("min-w-12", "whitespace-nowrap", "text-right")

/** Compact recipe defers the movement fact below `sm`, where the row has no room for a sixth column. */
export const getRankedUserMovementColumnClassName = (layout: "full" | "compact") => cn(
    layout === "compact" && "hidden",
    layout === "compact" && "sm:block",
)

/** Compact recipe defers the follow action below `sm`, matching the movement column. */
export const getRankedUserFollowColumnClassName = (layout: "full" | "compact") => cn(
    "min-w-max",
    "shrink-0",
    layout === "compact" && "hidden",
    layout === "compact" && "sm:block",
)
