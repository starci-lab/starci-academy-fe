import { DayCell, type DayCellData } from "@/components/leaves/DayCell"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `StreakWeekRun`: the last seven days, as one run of columns.
 *
 * A CLUSTER LEAF. Its interior is fixed - seven `DayCell`s and nothing else, at every screen and
 * forever - so it owns that interior, including the seam between the columns and the `<ul>` around
 * them. The registry describes layout that VARIES or is SHARED, and this is neither.
 *
 * SEVEN IS THIS FILE'S FACT. A week has seven days whatever the payload returns, so the count is
 * stated once here and the resting run is the loaded one rather than a second shape kept in step.
 *
 * IT RENDERS THE `<ul>` that `DayCell`'s `<li>` needs. The two files hold the pair between them.
 */

/** How many columns a week is. Not a setting. */
const DAY_COUNT = 7

/** Placeholder columns, kept at the real count so the resting run is the loaded one. */
const RESTING_WEEK: ReadonlyArray<DayCellData> = Array.from(
    { length: DAY_COUNT },
    (_unused, index) => ({ id: `resting-${index}` }),
)

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type StreakWeekRunData = {
    /** The last seven days, oldest first. Absent while loading. */
    readonly days?: ReadonlyArray<DayCellData>
}

/** Props for {@link StreakWeekRun}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type StreakWeekRunProps = LeafProps<StreakWeekRunData>

/**
 * A run of equal columns only reads as one span of time while the columns stay on one line, so it
 * wraps as a whole rather than letting a single day drop away from the six beside it.
 */
const RUN_CLASSES = "flex flex-row flex-wrap items-center gap-2"

/**
 * Draw the week.
 *
 * @param input - {@link StreakWeekRunProps}
 */
export const StreakWeekRun = ({ props, isLoading = false }: StreakWeekRunProps) => (
    <ul data-tier="leaf" data-component="StreakWeekRun" className={RUN_CLASSES}>
        {(isLoading ? RESTING_WEEK : (props.days ?? RESTING_WEEK)).map((day) => (
            <DayCell key={day.id} props={day} isLoading={isLoading} />
        ))}
    </ul>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
