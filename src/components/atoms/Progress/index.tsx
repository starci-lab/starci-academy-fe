import { ProgressBar, skeletonVariants } from "@heroui/react"

/**
 * ATOM - `Progress`: how far through something a reader is.
 *
 * The course list used to draw a bare `<progress>` element, which is the one control browsers
 * still style completely differently from each other - a green plastic bar on one engine, a grey
 * hairline on another - so the same page looked like two different products depending on where
 * it was opened.
 *
 * WHAT IT DRAWS. HeroUI's `ProgressBar`, which is a track and a fill sized from the value, in
 * the accent token, with the value exposed to assistive technology by the underlying ARIA
 * progressbar. The percentage is NOT drawn here: the readout beside the bar is a separate fact
 * that the row above lays out, and a bar that printed its own number would put the figure on
 * screen twice whenever a caller printed it too.
 *
 * WHY `label` IS REQUIRED. A progress bar with no name is a rectangle: a screen reader announces
 * "42 percent" of nothing. The label is the resolved course title, which is also what makes two
 * bars on one screen tell each other apart.
 */

/** Props for {@link Progress}. */
export interface ProgressProps {
    /** How far through, from 0 to 100. A caller clamps before it gets here. */
    value: number
    /**
     * What is progressing, already resolved. It becomes the bar's accessible name, so it is the
     * thing a reader hears the percentage attached to.
     */
    label: string
    /**
     * Renders the resting shape: the same track at the same height, with no fill to read.
     *
     * MEANS "nothing to show YET" - the first load, no data in hand. A bar that rested on every
     * revalidation would empty itself in front of a reader watching their own progress.
     */
    isLoading?: boolean
}

/** The full width of the track. Progress is only readable against the whole of its own row. */
const BASE_CLASSES = "w-full"

/** The resting shape - the track, shimmering, at the height it will keep once the value lands. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "h-2 w-full",
})

/**
 * Draw how far through something a reader is.
 *
 * @param props - {@link ProgressProps}
 */
export const Progress = ({ value, label, isLoading = false }: ProgressProps) => (
    <ProgressBar
        data-tier="atom"
        data-component="Progress"
        data-loading={isLoading ? "true" : "false"}
        aria-label={label}
        value={isLoading ? 0 : value}
        minValue={0}
        maxValue={100}
        color="accent"
        size="sm"
        className={isLoading ? RESTING_CLASSES : BASE_CLASSES}
    >
        {isLoading ? null : (
            <ProgressBar.Track>
                <ProgressBar.Fill />
            </ProgressBar.Track>
        )}
    </ProgressBar>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Progress" } as const
