import { Chip, skeletonVariants } from "@heroui/react"

/**
 * ATOM - `DayCell`: one day of an activity run.
 *
 * The seven columns of the streak strip used to be bare `<li>` elements holding an empty
 * `<span>` that nothing styled - a bulleted list of blank lines. This atom is the column
 * itself: the weekday letter in a chip that is filled when the learner was active and quiet
 * when they were not.
 *
 * WHY THE ELEMENT IS AN `<li>`. The run is a LIST - seven items in a fixed order - and the
 * `track` registry key that lays them out renders the `<ul>` around them. A row of `<span>`s
 * would look identical and tell a screen reader nothing about how many days there are or which
 * one it is on.
 *
 * WHY THE DATE IS THERE BUT NOT DRAWN. Seven full dates printed under seven letters is a wall
 * of text that says what the letters already said. It is rendered for assistive technology only,
 * so "Aug 3, 2026" is available to a reader who cannot see which column is which, and invisible
 * to one who can.
 *
 * ACTIVE IS NOT ONLY A COLOUR. The filled chip carries the state, and the date read out beside
 * it carries the same fact in words - colour is never the only channel that says a day counted.
 */

/** Props for {@link DayCell}. */
export interface DayCellProps {
    /** The already-localized narrow weekday letter. */
    weekday: string
    /** The already-localized full date, read out by assistive technology. */
    label: string
    /** Whether the learner was active that day. */
    isActive?: boolean
    /**
     * Renders the resting shape: the same column at the same width, with no letter to read.
     *
     * MEANS "nothing to show YET" - the first load of the week, no data in hand.
     */
    isLoading?: boolean
}

/** The column keeps its own centre; the run above it owns the gap between columns. */
const BASE_CLASSES = "flex flex-col items-center"

/** The resting shape - the same chip footprint, shimmering, with the letter taken out. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/**
 * Draw one day of the run.
 *
 * @param props - {@link DayCellProps}
 */
export const DayCell = ({ weekday, label, isActive = false, isLoading = false }: DayCellProps) => (
    <li
        data-tier="atom"
        data-component="DayCell"
        data-part="day"
        data-active={isActive ? "true" : "false"}
        data-loading={isLoading ? "true" : "false"}
        className={BASE_CLASSES}
    >
        <Chip
            color={isActive ? "accent" : "default"}
            variant={isActive ? "primary" : "secondary"}
            size="sm"
            aria-hidden={isLoading ? true : undefined}
            className={isLoading ? RESTING_CLASSES : undefined}
        >
            {weekday}
        </Chip>
        <span data-part="date" className="sr-only">
            {label}
        </span>
    </li>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "DayCell" } as const
