import { cn } from "@heroui/react"

/**
 * Rank, avatar, name cell and trailing facts share one row. Compact defers the last two cells
 * below `sm`.
 *
 * GRAMMAR-GAP: the row used to paint the semantic movement verdict as a two-pixel inline-start
 * band - an arbitrary inset-shadow on the success or danger theme colour, plus a pl-4
 * clearance for it. The class this note refuses is not written out here, because it would then
 * be a class string in this file again, and the sweep reads the file as text. That was an
 * arbitrary value, and `ui/presentation/boundary.md` publishes no border on a semantic tone and no
 * border-width scale at all: its edges are the `--separator` hairline (BOUNDARY-1 to BOUNDARY-4)
 * and the `--border` outline (BOUNDARY-5), and it states that no application edge may be drawn with
 * a raw colour. There is no closed-scale form of this band, so the paint is gone and the verdict
 * survives as `data-verdict` on the row plus the already-coloured `RankDeltaCaret`, which is driven
 * by the same `rankDelta` the verdict is computed from. The capability wanted is a Grammar prop -
 * `verdict?: "success" | "danger"` on the row-owning list object (`SurfaceListCard`, which already
 * squares its collection corners for exactly this band through `isVerdict`) - so Grammar draws the
 * edge and the application passes the meaning.
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
