import { skeletonVariants } from "@heroui/react"
import type { LeafProps } from "@/components/contracts/props"

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

/** Props for {@link PodiumStep}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type PodiumStepProps = LeafProps<PodiumStepData>

/** Shared block shape: one width, a flat top edge and the number centred on it. */
const BASE_CLASSES = "flex w-20 items-center justify-center rounded-t-2xl bg-default text-base font-bold"

/**
 * One complete class string per place, written out rather than assembled.
 *
 * A shared base plus an interpolated height reads shorter and is exactly what the contract rules
 * refuse: the string a place actually renders would then exist only while this component runs, so
 * nothing that reads this file as text could tell how tall first place is.
 */
const PLACE_CLASSES = {
    1: `${BASE_CLASSES} h-16 ring-2 ring-accent`,
    2: `${BASE_CLASSES} h-11`,
    3: `${BASE_CLASSES} h-8`,
} as const

/** The resting shape - the block at its real height, no number. */
const RESTING_CLASSES = {
    1: skeletonVariants({ animationType: "shimmer" }).base({ className: "flex h-16 w-20 rounded-t-2xl" }),
    2: skeletonVariants({ animationType: "shimmer" }).base({ className: "flex h-11 w-20 rounded-t-2xl" }),
    3: skeletonVariants({ animationType: "shimmer" }).base({ className: "flex h-8 w-20 rounded-t-2xl" }),
} as const

/**
 * Draw one block of the dais.
 *
 * @param input - {@link PodiumStepProps}
 */
export const PodiumStep = ({ props, isLoading = false }: PodiumStepProps) => {
    const place = props.place
    if (isLoading) {
        return (
            <span
                data-tier="leaf"
                data-component="PodiumStep"
                data-place={place}
                data-loading="true"
                aria-hidden="true"
                className={RESTING_CLASSES[place]}
            />
        )
    }
    return (
        <span
            data-tier="leaf"
            data-component="PodiumStep"
            data-place={place}
            data-loading="false"
            className={PLACE_CLASSES[place]}
        >
            {place}
        </span>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
