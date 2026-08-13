import { skeletonVariants } from "@heroui/react"
import { RankMark } from "@/components/leaves/RankMark"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `LeagueTile`: the viewer's own place, on a plate of its own.
 *
 * WHY IT IS NOT `IconTile` WITH A BIGGER SIZE. `IconTile` draws a MEANING from the closed icon
 * vocabulary on a soft tinted fill - a feature mark leading a row. This draws an AWARD: the rank
 * artwork the learner earned, framed so the one place that belongs to them reads differently from
 * the places listed beneath it. Same shape, different question, so the two do not share a size prop
 * that would let a feature mark borrow the award frame or the other way round.
 *
 * WHY IT WRAPS `RankMark` RATHER THAN NAMING THE ARTWORK. The place-to-artwork map has one owner,
 * and it is `RankMark` - that is what `rank-artwork-is-a-closed-set` holds. This leaf owns the
 * plate: the step, the radius and the frame. It never learns which medal belongs to which rank.
 *
 * THE PLATE IS A FILL, NOT AN OUTLINE. `bg-default` is the same ground `IconTile` rests a neutral
 * mark on, so the standing sits on the surface the product already uses for a plate rather than
 * introducing a second convention. What separates this tile from a row mark is its SIZE, and only
 * its size - a border would have added a second signal saying the same thing twice.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type LeagueTileData = {
    /** One-based leaderboard rank; the artwork is resolved by {@link RankMark}. */
    readonly rank?: number
    /** Resolved accessible label retaining the numeric rank. */
    readonly accessibleLabel?: string
}

/** Props for {@link LeagueTile}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type LeagueTileProps = LeafProps<LeagueTileData>

/** The plate: one step above `IconTile`'s largest, with the radius kept concentric. */
const PLATE_CLASSES = "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-default"

/** The resting shape - the plate at its real size, no artwork. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" })
    .base({ className: "inline-flex size-12 shrink-0 rounded-2xl" })

/**
 * Draw the viewer's rank artwork on its own framed plate.
 *
 * @param input - {@link LeagueTileProps}
 */
export const LeagueTile = ({ props, isLoading = false }: LeagueTileProps) => {
    if (isLoading) {
        return (
            <span
                data-tier="leaf"
                data-component="LeagueTile"
                data-loading="true"
                aria-hidden="true"
                className={RESTING_CLASSES}
            />
        )
    }
    return (
        <span
            data-tier="leaf"
            data-component="LeagueTile"
            data-loading="false"
            className={PLATE_CLASSES}
        >
            <RankMark props={{ rank: props.rank, placement: "standing", accessibleLabel: props.accessibleLabel }} />
        </span>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
