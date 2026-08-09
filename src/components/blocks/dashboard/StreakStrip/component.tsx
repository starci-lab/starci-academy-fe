import { Tree } from "@/components/frames/Tree"
import type { TreeSlotProps } from "@/components/classNames"

/**
 * BLOCK - `StreakStrip`, presentational half.
 *
 * The last seven days as a row of dots, beside the streak readout they add up to.
 *
 * Structure is two registry keys. `section` carries the heading and the strip. `split`
 * carries the two halves, and it is the right key for the reason the key itself states:
 * the readout SUPPORTS the seven days rather than competing with them, so at a narrow
 * width it drops underneath instead of halving the room the dots need.
 *
 * The resting state is the same tree with the same seven columns, never a second one.
 * A hand-kept resting copy is only ever noticed after it has already drifted.
 */

/** How many day columns the strip draws - the last seven days, always seven. */
const DAY_COUNT = 7

/** One day of the strip, already resolved by the connected half. */
export interface StreakStripDay {
    /** ISO date. Used as the column key. */
    date: string
    /** Whether the learner was active that day. */
    active: boolean
    /** Already-localized narrow weekday label under the dot. */
    weekday: string
    /** Already-localized full date, read out by assistive technology. */
    title: string
}

/** Every string this block renders, already resolved by the connected half. */
export interface StreakStripLabels {
    /** Heading over the strip. */
    heading: string
    /** Stands in for the readout while the request is in flight. */
    loading: string
    /** Read when the learner has no streak to show yet. */
    empty: string
    /** Current-streak sentence, already interpolated. */
    current: string
    /** Longest-streak sentence, already interpolated. */
    longest: string
}

/** Props for {@link _StreakStrip} - presentational; no fetch, no store, no i18n. */
export interface StreakStripProps {
    /** First load with nothing in hand - the strip rests as itself. */
    isSkeleton?: boolean
    /** Settled with no activity to show. */
    isEmpty?: boolean
    /** The last seven days, oldest first. */
    days?: readonly StreakStripDay[]
    /** Resolved copy. */
    labels: StreakStripLabels
}

/** Placeholder columns, kept at the real count so the resting shape is the loaded one. */
const RESTING_DAYS: readonly number[] = Array.from({ length: DAY_COUNT }, (_unused, index) => index)

/**
 * Render the strip. See the file header for why these two keys.
 *
 * @param props - {@link StreakStripProps}
 */
export const _StreakStrip = ({
    isSkeleton = false,
    isEmpty = false,
    days = [],
    labels,
}: StreakStripProps) => {
    /** The `heading` role of the `section` key. */
    const Heading = () => <h2>{labels.heading}</h2>

    /** The `body` role of the `split` key: the seven day columns. */
    const DayList = ({ isSkeleton: resting }: TreeSlotProps) => (
        <ul data-part="days" data-state={resting === true ? "skeleton" : "ready"}>
            {resting === true
                ? RESTING_DAYS.map((index) => (
                    <li key={index} data-part="day" data-state="skeleton" aria-hidden="true">
                        <span data-part="dot" />
                    </li>
                ))
                : days.map((day) => (
                    <li key={day.date} data-part="day" data-active={day.active ? "true" : "false"}>
                        <span data-part="dot" aria-hidden="true" />
                        <span data-part="weekday">{day.weekday}</span>
                        <span data-part="date">{day.title}</span>
                    </li>
                ))}
        </ul>
    )

    /** The `aside` role of the `split` key: what the seven days add up to. */
    const Readout = ({ isSkeleton: resting }: TreeSlotProps) => {
        if (resting === true) {
            return <p data-part="readout" data-state="skeleton">{labels.loading}</p>
        }
        if (isEmpty) {
            return <p data-part="readout" data-state="empty">{labels.empty}</p>
        }
        return (
            <p data-part="readout" data-state="ready">
                <span data-part="current">{labels.current}</span>
                <span data-part="longest">{labels.longest}</span>
            </p>
        )
    }

    /** The `body` role of the `section` key. */
    const Body = ({ isSkeleton: resting }: TreeSlotProps) => (
        <Tree name="split" isSkeleton={resting} slots={{ body: DayList, aside: Readout }} />
    )

    return <Tree name="section" isSkeleton={isSkeleton} slots={{ heading: Heading, body: Body }} />
}
