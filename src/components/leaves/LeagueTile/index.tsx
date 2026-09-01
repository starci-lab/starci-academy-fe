import { RankMark, type RankMarkArtwork } from "@/components/leaves/RankMark"
import { leagueTileClassName, leagueTileLoadingClassName } from "./classNames"

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
 * THE PLATE IS A FILL, NOT AN OUTLINE. The standing is an accent-owned summary, so its soft accent
 * fill and matching foreground travel together just as they do in `IconTile`. Size establishes the
 * standing hierarchy; a border would add a second frame without adding meaning.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type LeagueTileData = {
    /** One-based leaderboard rank; the artwork is resolved by {@link RankMark}. */
    readonly rank?: number
    /** The platform standing can explicitly use its cup instead of a place medal. */
    readonly artwork?: RankMarkArtwork
    /** Resolved accessible label retaining the numeric rank. */
    readonly accessibleLabel?: string
}

/** Props for {@link LeagueTile}. Three fixed slots, no fourth. */
export type LeagueTileProps = { readonly props: LeagueTileData; readonly isLoading?: boolean }

/** The plate: one step above `IconTile`'s largest, with the radius kept concentric. */

/** The resting shape - the plate at its real size, no artwork. */

/**
 * Draw the viewer's rank artwork on its own framed plate.
 *
 * @param input - {@link LeagueTileProps}
 */
export const LeagueTile = (props: LeagueTileProps) => {
    const isLoading = props.isLoading === true
    if (isLoading) {
        return (
            <span
                data-loading="true"
                aria-hidden="true"
                className={leagueTileLoadingClassName}
            />
        )
    }
    return (
        <span
            data-loading="false"
            className={leagueTileClassName}
        >
            <RankMark props={{ rank: props.props.rank, placement: "standing", artwork: props.props.artwork, accessibleLabel: props.props.accessibleLabel }} />
        </span>
    )
}
