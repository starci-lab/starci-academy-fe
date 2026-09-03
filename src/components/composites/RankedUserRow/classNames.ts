import { cn } from "@heroui/react"

/**
 * Rank, avatar, name cell and trailing facts share one row. Compact defers the last two cells
 * below `sm`.
 *
 * The row PAINTS no verdict. It reports one, as `data-verdict` on its root, and @starci/grammar
 * 0.4.5 draws the two-pixel inline-start edge from `SurfaceListCard isVerdict` - the slot contract
 * that card publishes for its collection. So the application passes meaning and the package owns
 * the colour, which is the only lawful shape for it: `ui/presentation/boundary.md` publishes no
 * border on a semantic tone and no border-width scale, and no application edge may be drawn with a
 * raw colour.
 */
export const getRankedUserRowClassName = (layout: "full" | "compact") => cn(
    "flex",
    "w-full",
    "min-w-0",
    "items-center",
    "gap-2",
    layout === "compact" && "sm:gap-3",
    layout === "full" && "gap-3",
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
