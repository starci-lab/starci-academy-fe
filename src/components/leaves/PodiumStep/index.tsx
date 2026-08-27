import { podiumLoadingClassNames, podiumPlaceClassNames } from "./classNames"

/**
 * LEAF - `PodiumStep`: the block a finisher stands on, and how tall it is.
 *
 * WHY THE HEIGHT IS A CLOSED SET RATHER THAN A NUMBER. Three heights that must stay in proportion
 * to each other are one decision, not three: a caller free to pass `h-14` can make second place
 * taller than first, and nothing would report it. The place chooses the block, the same way a rank
 * chooses its artwork in `RankMark`.
 *
 * THE CHAMPION'S RING IS THE ONLY DIFFERENCE THAT IS NOT HEIGHT. On a narrow screen the three
 * blocks compress toward each other and the height stops carrying the ranking on its own, so first
 * place also states itself in a way that does not depend on the space beside it.
 */

/** The three places a dais has, and no fourth. */
export type PodiumPlace = 1 | 2 | 3

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type PodiumStepData = {
    /** Which block this is; it decides the height. */
    readonly place: PodiumPlace
}

/** Props for {@link PodiumStep}. Three fixed slots, no fourth. */
export type PodiumStepProps = { readonly props: PodiumStepData; readonly isLoading?: boolean }

/** Shared block shape: one width, a flat top edge and the number centred on it. */

/**
 * One complete class string per place, written out rather than assembled.
 *
 * A shared base plus an interpolated height reads shorter and is exactly what the layout rules
 * refuse: the string a place actually renders would then exist only while this component runs, so
 * nothing that reads this file as text could tell how tall first place is.
 */

/** The resting shape - the block at its real height, no number. */

/**
 * Draw one block of the dais.
 *
 * @param input - {@link PodiumStepProps}
 */
export const PodiumStep = (props: PodiumStepProps) => {
    const place = props.props.place
    const isLoading = props.isLoading === true
    if (isLoading) {
        return (
            <span
                data-place={place}
                data-loading="true"
                aria-hidden="true"
                className={podiumLoadingClassNames[place]}
            />
        )
    }
    return (
        <span
            data-place={place}
            data-loading="false"
            className={podiumPlaceClassNames[place]}
        >
            {place}
        </span>
    )
}
