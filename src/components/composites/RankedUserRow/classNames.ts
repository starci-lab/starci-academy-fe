import { cn } from "@heroui/react"

/** Rank, avatar, name cell and trailing facts share one row, plus the legacy two-pixel
 * semantic verdict band. Compact defers the last two cells below `sm`. */
export const getRankedUserRowClassName = (layout: "full" | "compact", verdict?: "success" | "danger") => cn(
    "flex",
    "w-full",
    "min-w-0",
    "items-center",
    "gap-2",
    layout === "compact" && "sm:gap-3",
    layout === "full" && "gap-3",
    verdict !== undefined && "pl-4",
    verdict === "success" && "inset-shadow-[2px_0_0_0_var(--success)]",
    verdict === "danger" && "inset-shadow-[2px_0_0_0_var(--danger)]",
)

/** Name/subtitle stack owns the row's spare width and truncates before the trailing facts. */
export const rankedUserNameColumnClassName = cn("min-w-0", "flex-1", "overflow-hidden")

/** Points cell never wraps and stays right-aligned against the trailing edge. */
export const rankedUserPointsColumnClassName = cn("min-w-12", "shrink-0", "whitespace-nowrap", "text-right")

/** Compact recipe defers the movement fact below `sm`, where the row has no room for a sixth cell. */
export const getRankedUserMovementColumnClassName = (layout: "full" | "compact") => cn(
    "shrink-0",
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
